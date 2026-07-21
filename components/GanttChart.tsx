"use client";

import { useEffect, useRef, useState } from "react";
import type { Calendar, Character, CharacterOrg, EventRow } from "@/types/db";
import { formatYear, makeYearScale, yearTicks } from "@/lib/time";
import { CATEGORY_ICONS, CategoryIcon } from "@/lib/icons";

type Props = {
  calendars: Calendar[];
  characters: Character[];
  events: EventRow[];
  /** 表示に使う暦の id（未指定なら先頭 = 通常は海円暦） */
  calendarId?: number;
  /** キャラ行を主所属の組織でグループ化する */
  groupByOrg?: boolean;
  /** キャラ名ドラッグで並び替え（draggedId を targetId の位置へ移動） */
  onReorderChar?: (draggedId: number, targetId: number) => void;
  /** ピン留め状態と切替 */
  pinnedChars?: Set<number>;
  pinnedOrgs?: Set<string>;
  onTogglePinChar?: (id: number) => void;
  onTogglePinOrg?: (name: string) => void;
  /** キャラ行の×で表示から隠す（クライアント側の非表示） */
  onHideChar?: (id: number) => void;
};

// キャラ領域の視覚的な行（グループ見出し or キャラのレーン）
type VisualRow = { kind: "header"; name: string; color: string | null } | { kind: "lane"; lane: Lane };

type Lane = {
  key: string;
  /** キャラ行の場合の characters.id（並び替え用） */
  charId?: number;
  label: string;
  start: number;
  end: number;
  open: boolean; // 終端未確定（存命 / 進行中）
  layer: "character" | "event";
  importance: number;
  approximate: boolean;
  category: string | null;
  /** カテゴリのアイコンキー（点イベントの描画に使用。CATEGORY_ICONS 参照） */
  icon?: string | null;
  /** カテゴリ色（イベントの着色に使用） */
  color?: string | null;
  description: string | null;
  orgs?: CharacterOrg[];
  /** キャラの生涯バー上に置く節目イベント */
  milestones?: { id: number; name: string; year: number; description: string | null }[];
  /** ツールチップ用: 節目イベント時に「誰の」を示す */
  subtitle?: string | null;
  /** この Lane が節目イベント（キャラ個別イベント）を表すか */
  isMilestone?: boolean;
  /** キャラの本名・隠れた本名・宿る名（ツールチップ表示用） */
  fullName?: string | null;
  hiddenName?: string | null;
  persona?: string | null;
};

type View = { start: number; end: number };

const HEADER_H = 44;
const ROW_H = 30;
const BAR_H = 16;
const MIN_SPAN = 2;
const INITIAL_START_YEAR = 1400; // 初期表示の左端（canonical年 = 海円暦1400年。現在まで表示）
const TAP_SLOP = 8; // これ未満の指の移動はタップ扱い(px)
const HIT_PX = 16; // 出来事バンドで最寄りイベントを拾う距離(px)
const MILE_HIT_PX = 10; // キャラ行で節目マーカーを拾う距離(px)
const MILESTONE_COLOR = "#1f2937"; // 節目マーカー（gray-800）
const PIN_W = 22; // ガター左のピン留めアイコン領域(px)
const DEL_W = 22; // ガター右端の非表示(×)領域(px)
const PIN_COLOR = "#2563eb";

// ピン留めアイコン（ガター左）。中心 (cx,cy) に 14x16 のロケーションピンを描く。
function PinIcon({ cx, cy, pinned }: { cx: number; cy: number; pinned: boolean }) {
  return (
    <g transform={`translate(${cx - 7}, ${cy - 8})`} style={{ pointerEvents: "none" }}>
      <path
        d="M7 1 C4.2 1 2 3.2 2 6 C2 9.5 7 15 7 15 C7 15 12 9.5 12 6 C12 3.2 9.8 1 7 1 Z"
        fill={pinned ? PIN_COLOR : "none"}
        stroke={pinned ? PIN_COLOR : "#cbd5e1"}
        strokeWidth={1.3}
      />
      <circle cx={7} cy={6} r={1.8} fill={pinned ? "#ffffff" : "none"} stroke={pinned ? "none" : "#cbd5e1"} strokeWidth={1.1} />
    </g>
  );
}

const LAYER_COLOR = { character: "#2563eb", event: "#d97706" } as const;
const LAYER_LABEL = { character: "キャラ", event: "出来事" } as const;

const EMPTY_NUM_SET: Set<number> = new Set();
const EMPTY_STR_SET: Set<string> = new Set();

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const dist = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

export default function GanttChart({
  calendars, characters, events, calendarId, groupByOrg = false, onReorderChar,
  pinnedChars, pinnedOrgs, onTogglePinChar, onTogglePinOrg, onHideChar,
}: Props) {
  const pinnedC = pinnedChars ?? EMPTY_NUM_SET;
  const pinnedO = pinnedOrgs ?? EMPTY_STR_SET;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [cw, setCw] = useState(0);
  const [view, setView] = useState<View | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<{ lane: Lane; x: number; y: number } | null>(null);
  const [reorderId, setReorderId] = useState<number | null>(null); // 並び替え中のキャラid
  const reorderGroupRef = useRef<string | null>(null);
  // Mac 判定（拡大縮小の修飾キー表記を ⌘ / Ctrl で出し分け）。
  // ハイドレーション不整合を避けるため、初期は false（Ctrl）でマウント後に判定。
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac/i.test(navigator.platform || navigator.userAgent || ""));
  }, []);

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

  // ── データ → レーン（キャラは1人1行、出来事は最上段の1バンドにまとめる）──
  const charLanes: Lane[] = [];
  for (const ch of characters) {
    if (ch.birth_year == null) continue;
    charLanes.push({
      key: `c-${ch.id}`, charId: ch.id, label: ch.name,
      start: ch.birth_year, end: ch.death_year ?? ch.birth_year, open: ch.death_year == null,
      layer: "character", importance: 3, approximate: ch.is_approximate, category: ch.epithet, description: ch.notes, orgs: ch.orgs,
      fullName: ch.full_name, hiddenName: ch.hidden_name, persona: ch.persona,
      milestones: (ch.events ?? []).map((e) => ({ id: e.id, name: e.name, year: e.year, description: e.description })),
    });
  }
  // 並び順は受け取った characters の順（TimelineView が制御。既定は生年順）。

  const evLanes: Lane[] = events.map((ev) => ({
    key: `e-${ev.id}`, label: ev.name, start: ev.start_year, end: ev.end_year ?? ev.start_year, open: false,
    layer: "event", importance: ev.importance, approximate: ev.is_approximate,
    category: ev.category?.name ?? null, icon: ev.category?.icon ?? null, color: ev.category?.color ?? null, description: ev.description,
  }));

  // キャラ領域の視覚行を構築（グループ化時は主所属ごとに見出し行を挿入）
  const charRows: VisualRow[] = [];
  if (groupByOrg) {
    const groups = new Map<string, { color: string | null; lanes: Lane[]; minStart: number }>();
    for (const lane of charLanes) {
      const p = lane.orgs?.[0];
      const key = p?.name ?? "所属なし";
      let g = groups.get(key);
      if (!g) { g = { color: p?.color ?? null, lanes: [], minStart: Infinity }; groups.set(key, g); }
      g.lanes.push(lane);
      g.minStart = Math.min(g.minStart, lane.start);
    }
    for (const [name, g] of [...groups.entries()].sort((a, b) => a[1].minStart - b[1].minStart)) {
      charRows.push({ kind: "header", name, color: g.color });
      for (const lane of g.lanes) charRows.push({ kind: "lane", lane });
    }
  } else {
    for (const lane of charLanes) charRows.push({ kind: "lane", lane });
  }

  const hasEventsRow = evLanes.length > 0;
  const rowOffset = hasEventsRow ? 1 : 0; // 出来事バンドの分だけキャラ行を下げる
  const rowCount = rowOffset + charRows.length;
  const hasData = rowOffset + charLanes.length > 0;

  // ── 年ドメイン（全アイテムから）とレスポンシブ寸法 ─────
  const allYears = [...charLanes, ...evLanes].flatMap((l) => [l.start, l.end]);
  const rawMin = hasData ? Math.min(...allYears) : 0;
  const rawMax = hasData ? Math.max(...allYears) : 1;
  const pad = Math.max(5, Math.round((rawMax - rawMin) * 0.04));
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;
  const fullSpan = domainMax - domainMin;
  const presentYear = rawMax; // 存命キャラの棒はここ（＝データ上の最新年＝現在）まで伸ばす

  const W = Math.max(300, cw || 900);
  const isMobile = W < 480;
  const GUTTER = isMobile ? 108 : 200;
  const RIGHT_PAD = isMobile ? 30 : 46;
  const CHART_W = Math.max(140, W - GUTTER - RIGHT_PAD);
  const totalW = GUTTER + CHART_W + RIGHT_PAD;
  const labelChars = isMobile ? 7 : 15;
  const totalH = HEADER_H + rowCount * ROW_H + 8;

  const viewRef = useRef<View | null>(view);
  viewRef.current = view;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setCw(entries[0].contentRect.width));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // 初期表示（およびフィルタ等で domain 変化時）は [1400, 現在] を既定に。
  // 「全体」ボタンで全期間（空白の100年〜）に戻せる。
  useEffect(() => {
    const start = Math.min(Math.max(INITIAL_START_YEAR, domainMin), domainMax - MIN_SPAN);
    setView({ start, end: domainMax });
  }, [domainMin, domainMax]);

  // 並び替え対象の所属グループ（グループ化時=主所属名 / 非グループ時=全体）
  const laneGroup = (lane: Lane): string => (groupByOrg ? lane.orgs?.[0]?.name ?? "所属なし" : "all");

  // キャラ名ドラッグ中: ポインタが重なった同グループの行と入れ替える（ライブ並び替え）
  useEffect(() => {
    if (reorderId == null) return;
    const onMove = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const idx = Math.floor((e.clientY - rect.top - HEADER_H) / ROW_H) - rowOffset;
      const r = charRows[idx];
      if (r && r.kind === "lane" && r.lane.charId != null && r.lane.charId !== reorderId && laneGroup(r.lane) === reorderGroupRef.current) {
        onReorderChar?.(reorderId, r.lane.charId);
      }
    };
    const onUp = () => setReorderId(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reorderId, charRows, rowOffset, groupByOrg, onReorderChar]);

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

  // 行(y) と x近接(出来事バンド) を統合したヒット判定
  const hitTest = (clientX: number, clientY: number): Lane | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const row = Math.floor((clientY - rect.top - HEADER_H) / ROW_H);
    if (row < 0) return null;
    if (hasEventsRow && row === 0) {
      const px = clientX - rect.left;
      let best: Lane | null = null;
      let bd = Infinity;
      for (const ev of evLanes) {
        const a = x(ev.start);
        const b = x(ev.end);
        const d = px < a ? a - px : px > b ? px - b : 0;
        if (d < bd) { bd = d; best = ev; }
      }
      return bd <= HIT_PX ? best : null;
    }
    const idx = row - rowOffset;
    const r = charRows[idx];
    if (!r || r.kind !== "lane") return null;
    const lane = r.lane;
    // 生涯バー上の節目マーカーに近ければ、そのイベントを返す
    if (lane.milestones && lane.milestones.length) {
      const px = clientX - rect.left;
      let best: (typeof lane.milestones)[number] | null = null;
      let bd = Infinity;
      for (const m of lane.milestones) {
        const d = Math.abs(px - x(m.year));
        if (d < bd) { bd = d; best = m; }
      }
      if (best && bd <= MILE_HIT_PX) {
        return {
          key: `m-${best.id}`, label: best.name, start: best.year, end: best.year, open: false,
          layer: "event", importance: 0, approximate: false, category: null, description: best.description,
          color: MILESTONE_COLOR, subtitle: lane.label, isMilestone: true,
        };
      }
    }
    return lane;
  };
  const showTipAt = (lane: Lane, clientX: number, clientY: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ lane, x: clientX - rect.left, y: clientY - rect.top });
  };
  // clientY の視覚行（見出し or キャラレーン）。ピン留めのタップ判定に使う。
  const rowAt = (clientY: number): VisualRow | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const idx = Math.floor((clientY - rect.top - HEADER_H) / ROW_H) - rowOffset;
    return charRows[idx] ?? null;
  };
  // ガター左のピン領域をタップ/クリックしたら該当のピンを切り替える。
  const togglePinAt = (clientX: number, clientY: number): boolean => {
    if (clientX - svgLeft() >= PIN_W) return false;
    const r = rowAt(clientY);
    if (!r) return false;
    if (r.kind === "lane" && r.lane.charId != null) { onTogglePinChar?.(r.lane.charId); return true; }
    if (r.kind === "header") { onTogglePinOrg?.(r.name); return true; }
    return false;
  };
  // ガター右端の×領域をタップ/クリックしたら該当キャラを非表示にする。
  const hideAt = (clientX: number, clientY: number): boolean => {
    if (!onHideChar) return false;
    const relX = clientX - svgLeft();
    if (relX < GUTTER - DEL_W || relX >= GUTTER) return false;
    const r = rowAt(clientY);
    if (r?.kind === "lane" && r.lane.charId != null) { onHideChar(r.lane.charId); return true; }
    return false;
  };

  actionsRef.current = {
    onWheel: (e) => {
      // Ctrl（トラックパッドのピンチも ctrlKey）押下時のみ拡大縮小。
      // 通常のスクロールはページスクロールに委ねる（preventDefault しない）。
      if (!e.ctrlKey && !e.metaKey) return;
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
        g.moved = false; g.lane = hitTest(t.clientX, t.clientY);
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
        e.preventDefault();
        if (togglePinAt(g.startX, g.startY)) {
          setHover(null);
        } else if (hideAt(g.startX, g.startY)) {
          setHover(null);
        } else if (g.lane && hover?.lane.key !== g.lane.key) {
          showTipAt(g.lane, g.startX, g.startY);
        } else {
          setHover(null);
        }
      }
      if (e.touches.length === 0) g.mode = "none";
    },
  };

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
  const bandActive = hover?.lane.layer === "event";

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
    if (reorderId != null) return; // 並び替え中はツールチップを出さない
    if (dragging) { panBy(e.clientX - gestureRef.current.startX, gestureRef.current.startView); return; }
    if (isSyntheticMouse()) return;
    const t = hitTest(e.clientX, e.clientY);
    if (t) showTipAt(t, e.clientX, e.clientY);
    else setHover(null);
  };
  const endMouse = () => { if (dragging) { gestureRef.current.mode = "none"; setDragging(false); } };

  // キャラ名（ガター）ドラッグで並び替え開始
  const startReorder = (lane: Lane, e: React.MouseEvent) => {
    if (!onReorderChar || lane.charId == null) return;
    e.stopPropagation();
    e.preventDefault();
    reorderGroupRef.current = laneGroup(lane);
    setReorderId(lane.charId);
    setHover(null);
  };

  const wrapperW = wrapperRef.current?.clientWidth ?? totalW;
  const wrapperH = wrapperRef.current?.clientHeight ?? totalH;
  const tipW = Math.min(240, wrapperW - 16);
  const tipLeft = hover ? clamp(hover.x + 12, 8, Math.max(8, wrapperW - tipW - 8)) : 0;
  // 下方に余白が無い（下段の行）ときはカーソルの上側に開いて見切れを防ぐ
  const tipAbove = hover ? hover.y > wrapperH * 0.55 : false;

  // 出来事バンドの中心 y（最上段）
  const bandY = HEADER_H + ROW_H / 2;

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
          {isMobile ? "スワイプで移動 / ピンチで拡大" : `ドラッグで移動 / ${isMac ? "⌘" : "Ctrl"}＋スクロールで拡大縮小 / 名前をドラッグで並び替え`}{zoomed ? "（拡大中）" : ""}
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

        {/* 行の背景 / ラベル（clipなし） */}
        {hasEventsRow && (
          <g>
            <rect x={0} y={HEADER_H} width={totalW} height={ROW_H} fill={bandActive ? "#fff7ed" : "#fafafa"} />
            <line x1={0} y1={HEADER_H + ROW_H} x2={totalW} y2={HEADER_H + ROW_H} stroke="#e5e7eb" strokeWidth={1} />
            <text x={10} y={HEADER_H + ROW_H / 2 + 4} fontSize={isMobile ? 11 : 12} fill="#111827" fontWeight={600}>
              出来事
            </text>
          </g>
        )}
        {charRows.map((r, i) => {
          const y = HEADER_H + (rowOffset + i) * ROW_H;
          const cy = y + ROW_H / 2;
          if (r.kind === "header") {
            const orgPinned = pinnedO.has(r.name);
            return (
              <g key={`h-${i}`}>
                <rect x={0} y={y} width={totalW} height={ROW_H} fill="#f3f4f6" />
                <rect x={0} y={y} width={3} height={ROW_H} fill={r.color ?? "#9ca3af"} />
                {onTogglePinOrg && <PinIcon cx={13} cy={cy} pinned={orgPinned} />}
                <text x={onTogglePinOrg ? PIN_W + 4 : 12} y={cy + 4} fontSize={isMobile ? 11 : 12} fontWeight={700} fill="#374151">{truncate(r.name, labelChars + 2)}</text>
                {onTogglePinOrg && (
                  <rect x={0} y={y} width={PIN_W} height={ROW_H} fill="transparent"
                    onMouseDown={(e) => { e.stopPropagation(); if (!isSyntheticMouse()) onTogglePinOrg(r.name); }} style={{ cursor: "pointer" }} />
                )}
              </g>
            );
          }
          const lane = r.lane;
          const active = hover?.lane.key === lane.key;
          const isDragged = reorderId != null && lane.charId === reorderId;
          const canReorder = Boolean(onReorderChar) && lane.charId != null && !isMobile;
          const canPin = Boolean(onTogglePinChar) && lane.charId != null;
          const canHide = Boolean(onHideChar) && lane.charId != null;
          const charPinned = lane.charId != null && pinnedC.has(lane.charId);
          const labelX = (canPin ? PIN_W + 2 : 8) + (groupByOrg ? 10 : 0);
          const labelMax = (groupByOrg ? labelChars - 3 : labelChars - 1) - (canHide ? 2 : 0);
          return (
            <g key={`bg-${lane.key}`}>
              <rect x={0} y={y} width={totalW} height={ROW_H} fill={isDragged ? "#e0e7ff" : active ? "#eff6ff" : i % 2 === 1 ? "#f9fafb" : "transparent"} />
              {canPin && <PinIcon cx={11} cy={cy} pinned={charPinned} />}
              <text x={labelX} y={cy + 4} fontSize={isMobile ? 11 : 12} fill="#111827">{truncate(lane.label, labelMax)}</text>
              {canReorder && (
                <rect x={PIN_W} y={y} width={GUTTER - PIN_W} height={ROW_H} fill="transparent"
                  onMouseDown={(e) => startReorder(lane, e)} style={{ cursor: reorderId != null ? "grabbing" : "grab" }} />
              )}
              {canPin && (
                <rect x={0} y={y} width={PIN_W} height={ROW_H} fill="transparent"
                  onMouseDown={(e) => { e.stopPropagation(); if (!isSyntheticMouse()) onTogglePinChar!(lane.charId!); }} style={{ cursor: "pointer" }} />
              )}
              {canHide && (
                <g>
                  <text x={GUTTER - DEL_W / 2} y={cy + 4} textAnchor="middle" fontSize={13} fill={active ? "#dc2626" : "#9ca3af"} style={{ pointerEvents: "none" }}>×</text>
                  <rect x={GUTTER - DEL_W} y={y} width={DEL_W} height={ROW_H} fill="transparent"
                    onMouseDown={(e) => { e.stopPropagation(); if (!isSyntheticMouse()) onHideChar!(lane.charId!); }} style={{ cursor: "pointer" }}>
                    <title>この行を非表示</title>
                  </rect>
                </g>
              )}
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

          {/* ホバー中イベント（世界の出来事 or 節目）の位置を縦に貫くガイド線（色はグリッド線と同じ） */}
          {hover && hover.lane.layer === "event" && (
            <line x1={x(hover.lane.start)} y1={HEADER_H - 8} x2={x(hover.lane.start)} y2={totalH} stroke="#e5e7eb" strokeWidth={2} />
          )}

          {/* 出来事バンド: 全イベントを1行に配置（点=ダイヤ/範囲=バー、重要度でサイズ・濃さ） */}
          {hasEventsRow && evLanes.map((ev) => {
            const isPoint = ev.start === ev.end;
            const x1 = x(ev.start);
            const x2 = x(ev.end);
            const active = hover?.lane.key === ev.key;
            const op = active ? 1 : 0.4 + ev.importance * 0.11;
            const evColor = ev.color ?? LAYER_COLOR.event;
            if (isPoint) {
              // 点イベント（end_year=null）はカテゴリの SVG アイコンで表示（無ければダイヤ）
              const iconFn = ev.icon ? CATEGORY_ICONS[ev.icon] : undefined;
              if (iconFn) {
                const s = (16 + ev.importance * 2) * (active ? 1.15 : 1); // 重要度でサイズ
                return (
                  <g key={`ev-${ev.key}`} transform={`translate(${x1 - s / 2}, ${bandY - s / 2}) scale(${s / 24})`}
                    opacity={active ? 1 : 0.6 + ev.importance * 0.08} style={{ pointerEvents: "none" }}>
                    {iconFn(evColor)}
                  </g>
                );
              }
              const s = 10 + ev.importance * 2;
              return (
                <g key={`ev-${ev.key}`} transform={`translate(${x1}, ${bandY})`} style={{ pointerEvents: "none" }}>
                  <rect x={-s / 2} y={-s / 2} width={s} height={s} transform="rotate(45)" fill={evColor} opacity={op}
                    stroke={active ? "#7c2d12" : "none"} strokeWidth={active ? 1.5 : 0} />
                </g>
              );
            }
            return (
              <rect key={`ev-${ev.key}`} x={x1} y={bandY - BAR_H / 2} width={Math.max(2, x2 - x1)} height={BAR_H} rx={4}
                fill={evColor} opacity={op} stroke={active ? "#7c2d12" : "none"} strokeWidth={active ? 1.5 : 0}
                style={{ pointerEvents: "none" }} />
            );
          })}

          {/* キャラの生涯 */}
          {charRows.map((r, i) => {
            if (r.kind !== "lane") return null;
            const lane = r.lane;
            const y = HEADER_H + (rowOffset + i) * ROW_H;
            const barY = y + (ROW_H - BAR_H) / 2;
            // 存命(open)は誕生〜現在まで棒を伸ばす（死亡キャラの誕生〜死亡と同じ棒表示）
            const barEnd = lane.open ? presentYear : lane.end;
            const isPoint = lane.start === barEnd;
            const x1 = x(lane.start);
            const x2 = x(barEnd);
            const active = hover?.lane.key === lane.key;
            const barColor = lane.orgs?.[0]?.color ?? LAYER_COLOR.character; // 主所属の組織カラー
            const rangeLabel = isPoint
              ? formatYear(lane.start, calendar, lane.approximate)
              : `${formatYear(lane.start, calendar, lane.approximate)}–${lane.open ? "現在" : formatYear(lane.end, calendar)}`;
            return (
              <g key={`bar-${lane.key}`} style={{ pointerEvents: "none" }}>
                {isPoint ? (
                  <g transform={`translate(${x1}, ${barY + BAR_H / 2})`}>
                    <rect x={-BAR_H / 2} y={-BAR_H / 2} width={BAR_H} height={BAR_H} transform="rotate(45)" fill={barColor} opacity={active ? 1 : 0.85} />
                  </g>
                ) : (
                  <rect x={x1} y={barY} width={Math.max(2, x2 - x1)} height={BAR_H} rx={4} fill={barColor}
                    opacity={active ? 1 : 0.85} stroke={active ? "#111827" : "none"} strokeWidth={active ? 1.5 : 0} />
                )}
                <text x={(isPoint ? x1 + BAR_H : x2) + 6} y={barY + BAR_H - 3} fontSize={10} fill="#6b7280">{rangeLabel}</text>
              </g>
            );
          })}

          {/* キャラ生涯バー上の節目マーカー（キャラ個別イベント） */}
          {charRows.map((r, i) => {
            if (r.kind !== "lane" || !r.lane.milestones?.length) return null;
            const cy = HEADER_H + (rowOffset + i) * ROW_H + ROW_H / 2;
            return r.lane.milestones.map((m) => {
              const active = hover?.lane.key === `m-${m.id}`;
              return (
                <circle key={`m-${m.id}`} cx={x(m.year)} cy={cy} r={active ? 5.5 : 4}
                  fill="#ffffff" stroke={MILESTONE_COLOR} strokeWidth={active ? 2 : 1.5} style={{ pointerEvents: "none" }} />
              );
            });
          })}
        </g>

        <line x1={GUTTER} y1={HEADER_H - 8} x2={GUTTER} y2={totalH} stroke="#d1d5db" strokeWidth={1} />
        <text x={GUTTER} y={16} fontSize={11} fill="#9ca3af">{calendar.name}（年）→</text>
      </svg>

      {/* ツールチップ（ホバー or タップ） */}
      {hover && !dragging && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white p-3 text-xs shadow-lg"
          style={{
            left: tipLeft,
            top: tipAbove ? hover.y - 12 : hover.y + 12,
            transform: tipAbove ? "translateY(-100%)" : "none",
            width: tipW,
          }}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: hover.lane.isMilestone ? MILESTONE_COLOR : hover.lane.layer === "character" ? (hover.lane.orgs?.[0]?.color ?? LAYER_COLOR.character) : LAYER_COLOR.event }} />
            <span className="font-semibold text-gray-900">{hover.lane.label}</span>
          </div>
          <div className="mb-1 flex flex-wrap gap-x-3 gap-y-0.5 text-gray-500">
            {hover.lane.isMilestone ? (
              <span>キャライベント・{hover.lane.subtitle}</span>
            ) : hover.lane.layer === "character" ? (
              <>
                {hover.lane.fullName && hover.lane.fullName !== hover.lane.label && <span>{hover.lane.fullName}</span>}
                {hover.lane.category ? <span>「{hover.lane.category}」</span> : (!hover.lane.fullName || hover.lane.fullName === hover.lane.label) && <span>キャラ</span>}
              </>
            ) : (
              <>
                <span>{LAYER_LABEL.event}</span>
                {hover.lane.category && (
                  <span className="inline-flex items-center gap-1">
                    <CategoryIcon iconKey={hover.lane.icon} color={hover.lane.color ?? LAYER_COLOR.event} size={13} />
                    {hover.lane.category}
                  </span>
                )}
                <span title={`重要度 ${hover.lane.importance}/5`}>
                  {"★".repeat(hover.lane.importance)}
                  <span className="text-gray-300">{"★".repeat(5 - hover.lane.importance)}</span>
                </span>
              </>
            )}
          </div>
          <div className="mb-1 font-medium text-gray-700">
            {hover.lane.open
              ? `${formatYear(hover.lane.start, calendar, hover.lane.approximate)} – 現在`
              : hover.lane.start === hover.lane.end
                ? formatYear(hover.lane.start, calendar, hover.lane.approximate)
                : `${formatYear(hover.lane.start, calendar, hover.lane.approximate)} – ${formatYear(hover.lane.end, calendar)}`}
            <span className="ml-1 text-gray-400">（{calendar.name}）</span>
          </div>
          {(hover.lane.hiddenName || hover.lane.persona) && (
            <div className="mb-1 space-y-0.5">
              {hover.lane.hiddenName && <div className="text-gray-500">隠し名: <span className="font-medium text-gray-700">{hover.lane.hiddenName}</span></div>}
              {hover.lane.persona && <div className="text-gray-500">別名: <span className="font-medium text-gray-700">{hover.lane.persona}</span></div>}
            </div>
          )}
          {hover.lane.orgs && hover.lane.orgs.length > 0 && (
            <div className="mb-1 flex flex-wrap gap-1">
              {hover.lane.orgs.map((o, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: o.color ?? "#9ca3af" }} />
                  {o.name}{o.role ? `・${o.role}` : ""}
                </span>
              ))}
            </div>
          )}
          {hover.lane.description && <p className="text-gray-600">{hover.lane.description}</p>}
        </div>
      )}

      {/* 凡例 */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-gradient-to-r from-blue-600 via-amber-500 to-purple-600" />
          キャラの生涯（バー色 = 所属組織）
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: LAYER_COLOR.event }} />
          出来事（最上段。点=カテゴリのアイコン / 範囲=バー）
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: MILESTONE_COLOR }} />
          節目（キャラ個別イベント）
        </span>
      </div>
    </div>
  );
}
