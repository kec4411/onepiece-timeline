"use client";

import { useEffect, useRef, useState } from "react";
import type { Calendar, Character, EventRow } from "@/types/db";
import { formatYear, makeYearScale, yearTicks } from "@/lib/time";

type Props = {
  calendars: Calendar[];
  characters: Character[];
  events: EventRow[];
  /** 表示に使う暦の id（未指定なら先頭 = 通常は海円暦） */
  calendarId?: number;
};

type Lane = {
  key: string;
  label: string;
  start: number;
  end: number;
  open: boolean;
  layer: "character" | "event";
  importance: number;
  approximate: boolean;
  category: string | null;
  description: string | null;
};

type View = { start: number; end: number };

const HEADER_H = 44;
const ROW_H = 30;
const BAR_H = 16;
const MIN_SPAN = 2;
const TAP_SLOP = 8; // これ未満の指の移動はタップ扱い(px)

const LAYER_COLOR = { character: "#2563eb", event: "#d97706" } as const;
const LAYER_LABEL = { character: "キャラ", event: "出来事" } as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

export default function GanttChart({ calendars, characters, events, calendarId }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [cw, setCw] = useState(0); // 計測したコンテナ幅
  const [view, setView] = useState<View | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<{ lane: Lane; x: number; y: number } | null>(null);

  // マウス/タッチのジェスチャ状態（絶対起点方式で描画タイミングに依存させない）
  const gestureRef = useRef<{
    mode: "none" | "pan" | "pinch";
    startX: number;
    startY: number;
    startView: View;
    startDist: number;
    centerYear: number;
    moved: boolean;
    lane: Lane | null;
    lastTouch: number;
  }>({ mode: "none", startX: 0, startY: 0, startView: { start: 0, end: 1 }, startDist: 0, centerYear: 0, moved: false, lane: null, lastTouch: 0 });
  const actionsRef = useRef<{
    onWheel: (e: WheelEvent) => void;
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
  } | null>(null);

  const calendar =
    calendars.find((c) => c.id === calendarId) ??
    calendars[0] ?? { id: 0, name: "海円暦", description: null, offset_from_canonical: 0 };

  // ── データ → レーン ─────────────────────────────────
  const lanes: Lane[] = [];
  for (const ch of characters) {
    if (ch.birth_year == null) continue;
    lanes.push({
      key: `c-${ch.id}`, label: ch.epithet ? `${ch.name}（${ch.epithet}）` : ch.name,
      start: ch.birth_year, end: ch.death_year ?? ch.birth_year, open: ch.death_year == null,
      layer: "character", importance: 3, approximate: ch.is_approximate, category: ch.epithet, description: ch.notes,
    });
  }
  for (const ev of events) {
    lanes.push({
      key: `e-${ev.id}`, label: ev.name, start: ev.start_year, end: ev.end_year ?? ev.start_year, open: false,
      layer: "event", importance: ev.importance, approximate: ev.is_approximate, category: ev.category, description: ev.description,
    });
  }

  const hasData = lanes.length > 0;
  const years = hasData ? lanes.flatMap((l) => [l.start, l.end]) : [0, 1];
  const rawMin = Math.min(...years);
  const rawMax = Math.max(...years);
  const pad = Math.max(5, Math.round((rawMax - rawMin) * 0.04));
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;
  const fullSpan = domainMax - domainMin;

  // ── レスポンシブな寸法（コンテナ幅から算出） ──────────
  const W = Math.max(300, cw || 900);
  const isMobile = W < 480;
  const GUTTER = isMobile ? 108 : 200;
  const RIGHT_PAD = isMobile ? 30 : 46; // 存命の「→現在」ラベル分の余白を確保
  const CHART_W = Math.max(140, W - GUTTER - RIGHT_PAD);
  const totalW = GUTTER + CHART_W + RIGHT_PAD;
  const labelChars = isMobile ? 7 : 15;

  const ordered = [...lanes].sort((a, b) => {
    if (a.layer !== b.layer) return a.layer === "character" ? -1 : 1;
    return a.start - b.start;
  });
  const totalH = HEADER_H + ordered.length * ROW_H + 8;

  // コンテナ幅を計測
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setCw(entries[0].contentRect.width));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // domain（データ/フィルタ）変化時は表示範囲を全体にリセット
  useEffect(() => {
    setView({ start: domainMin, end: domainMax });
  }, [domainMin, domainMax]);

  const eff: View = view ?? { start: domainMin, end: domainMax };
  const xScale = makeYearScale(eff.start, eff.end, CHART_W);
  const x = (year: number) => GUTTER + xScale(year);
  const zoomed = eff.end - eff.start < fullSpan - 0.5;

  const clampView = (start: number, end: number): View => {
    const span = clamp(end - start, MIN_SPAN, fullSpan);
    let s = start;
    let e = start + span;
    if (s < domainMin) { s = domainMin; e = s + span; }
    if (e > domainMax) { e = domainMax; s = e - span; }
    if (s < domainMin) s = domainMin;
    return { start: s, end: e };
  };
  const zoomAround = (focusYear: number, factor: number, base: View = eff) => {
    const curSpan = base.end - base.start;
    const newSpan = clamp(curSpan * factor, MIN_SPAN, fullSpan);
    const frac = curSpan === 0 ? 0.5 : (focusYear - base.start) / curSpan;
    const s = focusYear - frac * newSpan;
    setView(clampView(s, s + newSpan));
  };
  const panBy = (totalDxPx: number, base: View) => {
    const dy = -totalDxPx * ((base.end - base.start) / CHART_W);
    setView(clampView(base.start + dy, base.end + dy));
  };
  const svgLeft = () => svgRef.current?.getBoundingClientRect().left ?? 0;
  const yearAtPx = (px: number, base: View) =>
    makeYearScale(base.start, base.end, CHART_W).invert(clamp(px, 0, CHART_W));
  const laneAt = (clientX: number, clientY: number): Lane | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const idx = Math.floor((clientY - rect.top - HEADER_H) / ROW_H);
    return idx >= 0 && idx < ordered.length ? ordered[idx] : null;
  };
  const showTipAt = (lane: Lane, clientX: number, clientY: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ lane, x: clientX - rect.left, y: clientY - rect.top });
  };

  // 最新クロージャをネイティブ listener から呼ぶ
  actionsRef.current = {
    onWheel: (e) => {
      e.preventDefault();
      const px = clamp(e.clientX - svgLeft() - GUTTER, 0, CHART_W);
      zoomAround(yearAtPx(px, eff), e.deltaY > 0 ? 1.15 : 0.87, eff);
    },
    onTouchStart: (e) => {
      const g = gestureRef.current;
      g.lastTouch = Date.now();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        g.mode = "pan"; g.startX = t.clientX; g.startY = t.clientY; g.startView = eff;
        g.moved = false; g.lane = laneAt(t.clientX, t.clientY);
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = [e.touches[0], e.touches[1]];
        const midPx = clamp((a.clientX + b.clientX) / 2 - svgLeft() - GUTTER, 0, CHART_W);
        g.mode = "pinch"; g.startDist = dist(a, b); g.startView = eff; g.centerYear = yearAtPx(midPx, eff); g.moved = true;
      }
    },
    onTouchMove: (e) => {
      const g = gestureRef.current;
      if (g.mode === "pinch" && e.touches.length >= 2) {
        e.preventDefault();
        const d = dist(e.touches[0], e.touches[1]);
        if (d > 0) zoomAround(g.centerYear, g.startDist / d, g.startView);
      } else if (g.mode === "pan" && e.touches.length === 1) {
        const t = e.touches[0];
        if (Math.abs(t.clientX - g.startX) > TAP_SLOP || Math.abs(t.clientY - g.startY) > TAP_SLOP) g.moved = true;
        if (g.moved) { e.preventDefault(); panBy(t.clientX - g.startX, g.startView); }
      }
    },
    onTouchEnd: (e) => {
      const g = gestureRef.current;
      g.lastTouch = Date.now();
      if (g.mode === "pan" && !g.moved) {
        e.preventDefault(); // タップ後の互換マウスイベント抑止
        // タップ = 詳細表示（同じ行を再タップ or 空所で閉じる）
        if (g.lane && hover?.lane.key !== g.lane.key) showTipAt(g.lane, g.startX, g.startY);
        else setHover(null);
      }
      if (e.touches.length === 0) g.mode = "none";
    },
  };

  // ネイティブ listener（passive:false）。svg の生成/破棄に合わせて付け替え
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !hasData) return;
    const w = (e: WheelEvent) => actionsRef.current?.onWheel(e);
    const ts = (e: TouchEvent) => actionsRef.current?.onTouchStart(e);
    const tm = (e: TouchEvent) => actionsRef.current?.onTouchMove(e);
    const te = (e: TouchEvent) => actionsRef.current?.onTouchEnd(e);
    svg.addEventListener("wheel", w, { passive: false });
    svg.addEventListener("touchstart", ts, { passive: false });
    svg.addEventListener("touchmove", tm, { passive: false });
    svg.addEventListener("touchend", te, { passive: false });
    svg.addEventListener("touchcancel", te, { passive: false });
    return () => {
      svg.removeEventListener("wheel", w);
      svg.removeEventListener("touchstart", ts);
      svg.removeEventListener("touchmove", tm);
      svg.removeEventListener("touchend", te);
      svg.removeEventListener("touchcancel", te);
    };
  }, [hasData]);

  if (!hasData) {
    return <p className="text-sm text-gray-500">表示できるデータがありません（フィルタ条件をご確認ください）。</p>;
  }

  const ticks = yearTicks(eff.start, eff.end);
  const clipId = "gantt-chart-clip";

  // マウス・パン（デスクトップ）。タッチ直後の合成マウスイベントは無視。
  const isSyntheticMouse = () => Date.now() - gestureRef.current.lastTouch < 700;
  const onMouseDown = (e: React.MouseEvent) => {
    if (isSyntheticMouse()) return;
    if (e.clientX - svgLeft() < GUTTER) return;
    gestureRef.current.startX = e.clientX;
    gestureRef.current.startView = eff;
    gestureRef.current.mode = "pan";
    setDragging(true);
    setHover(null);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    panBy(e.clientX - gestureRef.current.startX, gestureRef.current.startView);
  };
  const endMouse = () => { if (dragging) { gestureRef.current.mode = "none"; setDragging(false); } };
  const onRowMove = (lane: Lane, e: React.MouseEvent) => {
    if (dragging || isSyntheticMouse()) return;
    showTipAt(lane, e.clientX, e.clientY);
  };

  const wrapperW = wrapperRef.current?.clientWidth ?? totalW;
  const tipW = Math.min(240, wrapperW - 16);
  const tipLeft = hover ? clamp(hover.x + 12, 8, Math.max(8, wrapperW - tipW - 8)) : 0;

  return (
    <div ref={wrapperRef} className="relative">
      {/* ツールバー */}
      <div className="mb-2 flex items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-md border border-gray-200">
          <button type="button" onClick={() => zoomAround((eff.start + eff.end) / 2, 1.4)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50" aria-label="縮小">−</button>
          <button type="button" onClick={() => setView({ start: domainMin, end: domainMax })} className="border-x border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">全体</button>
          <button type="button" onClick={() => zoomAround((eff.start + eff.end) / 2, 0.7)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50" aria-label="拡大">＋</button>
        </div>
        <span className="text-xs text-gray-400">
          {isMobile ? "スワイプで移動 / ピンチで拡大" : "ドラッグで移動 / ホイールで拡大縮小"}{zoomed ? "（拡大中）" : ""}
        </span>
      </div>

      <svg
        ref={svgRef}
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
        aria-label="ワンピース年表 Gantt チャート"
        className="font-sans select-none"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none", maxWidth: "100%" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endMouse}
        onMouseLeave={() => { endMouse(); setHover(null); }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={GUTTER} y={0} width={CHART_W + RIGHT_PAD} height={totalH} />
          </clipPath>
        </defs>

        {/* 行の背景 / 当たり判定（ラベル列含む・clipなし） */}
        {ordered.map((lane, i) => {
          const y = HEADER_H + i * ROW_H;
          const active = hover?.lane.key === lane.key;
          return (
            <g key={`bg-${lane.key}`} onMouseMove={(e) => onRowMove(lane, e)} style={{ cursor: dragging ? "grabbing" : "pointer" }}>
              <rect x={0} y={y} width={totalW} height={ROW_H} fill={active ? "#eff6ff" : i % 2 === 1 ? "#f9fafb" : "transparent"} />
              <text x={10} y={y + ROW_H / 2 + 4} fontSize={isMobile ? 11 : 12} fill="#111827">{truncate(lane.label, labelChars)}</text>
            </g>
          );
        })}

        {/* 目盛り + バー（clip） */}
        <g clipPath={`url(#${clipId})`}>
          {ticks.map((t) => (
            <g key={`tick-${t}`}>
              <line x1={x(t)} y1={HEADER_H - 8} x2={x(t)} y2={totalH} stroke="#e5e7eb" strokeWidth={1} />
              <text x={x(t)} y={HEADER_H - 14} textAnchor="middle" fontSize={11} fill="#6b7280">{formatYear(t, calendar)}</text>
            </g>
          ))}
          {ordered.map((lane, i) => {
            const y = HEADER_H + i * ROW_H;
            const barY = y + (ROW_H - BAR_H) / 2;
            const isPoint = lane.start === lane.end;
            const x1 = x(lane.start);
            const x2 = x(lane.open ? eff.end : lane.end);
            const color = LAYER_COLOR[lane.layer];
            const active = hover?.lane.key === lane.key;
            const rangeLabel = isPoint
              ? formatYear(lane.start, calendar, lane.approximate)
              : `${formatYear(lane.start, calendar, lane.approximate)}–${lane.open ? "現在" : formatYear(lane.end, calendar)}`;
            return (
              <g key={`bar-${lane.key}`} style={{ pointerEvents: "none" }}>
                {isPoint ? (
                  <g transform={`translate(${x1}, ${barY + BAR_H / 2})`}>
                    <rect x={-BAR_H / 2} y={-BAR_H / 2} width={BAR_H} height={BAR_H} transform="rotate(45)" fill={color} opacity={active ? 1 : 0.85} />
                  </g>
                ) : (
                  <rect x={x1} y={barY} width={Math.max(2, x2 - x1)} height={BAR_H} rx={4} fill={color}
                    opacity={lane.layer === "event" ? 0.35 + lane.importance * 0.12 : 0.85}
                    stroke={active ? "#1e3a8a" : "none"} strokeWidth={active ? 1.5 : 0} />
                )}
                {lane.open && <text x={x2 + 6} y={barY + BAR_H - 3} fontSize={10} fill={color}>→現在</text>}
                {!lane.open && <text x={(isPoint ? x1 + BAR_H : x2) + 6} y={barY + BAR_H - 3} fontSize={10} fill="#6b7280">{rangeLabel}</text>}
              </g>
            );
          })}
        </g>

        <line x1={GUTTER} y1={HEADER_H - 8} x2={GUTTER} y2={totalH} stroke="#d1d5db" strokeWidth={1} />
        <text x={GUTTER} y={16} fontSize={11} fill="#9ca3af">{calendar.name}（年）→</text>
      </svg>

      {/* ツールチップ（ホバー or タップ） */}
      {hover && !dragging && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white p-3 text-xs shadow-lg"
          style={{ left: tipLeft, top: hover.y + 12, width: tipW }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: LAYER_COLOR[hover.lane.layer] }} />
            <span className="font-semibold text-gray-900">{hover.lane.label}</span>
          </div>
          <div className="mb-1 flex flex-wrap gap-x-3 gap-y-0.5 text-gray-500">
            <span>{LAYER_LABEL[hover.lane.layer]}</span>
            {hover.lane.layer === "event" && hover.lane.category && <span>{hover.lane.category}</span>}
            {hover.lane.layer === "event" && (
              <span title={`重要度 ${hover.lane.importance}/5`}>
                {"★".repeat(hover.lane.importance)}
                <span className="text-gray-300">{"★".repeat(5 - hover.lane.importance)}</span>
              </span>
            )}
          </div>
          <div className="mb-1 font-medium text-gray-700">
            {hover.lane.start === hover.lane.end
              ? formatYear(hover.lane.start, calendar, hover.lane.approximate)
              : `${formatYear(hover.lane.start, calendar, hover.lane.approximate)} – ${hover.lane.open ? "現在" : formatYear(hover.lane.end, calendar)}`}
            <span className="ml-1 text-gray-400">（{calendar.name}）</span>
          </div>
          {hover.lane.description && <p className="text-gray-600">{hover.lane.description}</p>}
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-3 flex gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: LAYER_COLOR.character }} />
          キャラの生涯
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: LAYER_COLOR.event }} />
          出来事（濃さ = 重要度）
        </span>
      </div>
    </div>
  );
}
