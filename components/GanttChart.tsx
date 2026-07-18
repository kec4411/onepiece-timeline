import type { Calendar, Character, EventRow } from "@/types/db";
import { formatYear, makeYearScale, yearTicks } from "@/lib/time";

type Props = {
  calendars: Calendar[];
  characters: Character[];
  events: EventRow[];
  /** 表示に使う暦の id（未指定なら先頭 = 通常は海円暦） */
  calendarId?: number;
};

// 統一レーン（行）表現。キャラ生涯・出来事の両レイヤーをここに正規化する。
type Lane = {
  key: string;
  label: string;
  start: number;
  end: number;
  /** 終端が未確定（存命 / 進行中）= 現在方向へ開いている */
  open: boolean;
  layer: "character" | "event";
  importance: number;
  approximate: boolean;
};

const GUTTER = 208; // 左のラベル列
const CHART_W = 920; // 年軸の描画幅
const RIGHT_PAD = 24;
const HEADER_H = 44;
const ROW_H = 30;
const BAR_H = 16;

const LAYER_COLOR = {
  character: "#2563eb", // blue-600
  event: "#d97706", // amber-600
} as const;

function truncate(s: string, n = 15): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function GanttChart({ calendars, characters, events, calendarId }: Props) {
  const calendar =
    calendars.find((c) => c.id === calendarId) ??
    calendars[0] ?? { id: 0, name: "海円暦", description: null, offset_from_canonical: 0 };

  // ── データ → レーンへ正規化 ───────────────────────────
  const lanes: Lane[] = [];

  for (const ch of characters) {
    if (ch.birth_year == null) continue;
    lanes.push({
      key: `c-${ch.id}`,
      label: ch.epithet ? `${ch.name}（${ch.epithet}）` : ch.name,
      start: ch.birth_year,
      end: ch.death_year ?? ch.birth_year,
      open: ch.death_year == null,
      layer: "character",
      importance: 3,
      approximate: ch.is_approximate,
    });
  }
  for (const ev of events) {
    lanes.push({
      key: `e-${ev.id}`,
      label: ev.name,
      start: ev.start_year,
      end: ev.end_year ?? ev.start_year,
      open: false,
      layer: "event",
      importance: ev.importance,
      approximate: ev.is_approximate,
    });
  }

  if (lanes.length === 0) {
    return <p className="text-sm text-gray-500">表示できるデータがありません。</p>;
  }

  // ── ドメイン（年範囲）とスケール ──────────────────────
  const years = lanes.flatMap((l) => [l.start, l.end]);
  const rawMin = Math.min(...years);
  const rawMax = Math.max(...years);
  const pad = Math.max(5, Math.round((rawMax - rawMin) * 0.04));
  const minYear = rawMin - pad;
  const maxYear = rawMax + pad;

  const xScale = makeYearScale(minYear, maxYear, CHART_W);
  const x = (year: number) => GUTTER + xScale(year);

  // キャラ層 → 出来事層の順に、レイヤー内では開始年で並べる
  const ordered = [...lanes].sort((a, b) => {
    if (a.layer !== b.layer) return a.layer === "character" ? -1 : 1;
    return a.start - b.start;
  });

  const totalW = GUTTER + CHART_W + RIGHT_PAD;
  const totalH = HEADER_H + ordered.length * ROW_H + 8;
  const ticks = yearTicks(minYear, maxYear);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        role="img"
        aria-label="ワンピース年表 Gantt チャート"
        className="min-w-full font-sans"
      >
        {/* 年目盛りの縦グリッド */}
        {ticks.map((t) => (
          <g key={`tick-${t}`}>
            <line x1={x(t)} y1={HEADER_H - 8} x2={x(t)} y2={totalH} stroke="#e5e7eb" strokeWidth={1} />
            <text x={x(t)} y={HEADER_H - 14} textAnchor="middle" fontSize={11} fill="#6b7280">
              {formatYear(t, calendar)}
            </text>
          </g>
        ))}

        {/* 暦名の見出し */}
        <text x={GUTTER} y={16} fontSize={11} fill="#9ca3af">
          {calendar.name}（年）→
        </text>

        {/* 行 */}
        {ordered.map((lane, i) => {
          const y = HEADER_H + i * ROW_H;
          const barY = y + (ROW_H - BAR_H) / 2;
          const isPoint = lane.start === lane.end;
          const x1 = x(lane.start);
          const x2 = x(lane.open ? maxYear : lane.end);
          const color = LAYER_COLOR[lane.layer];
          const rangeLabel = isPoint
            ? formatYear(lane.start, calendar, lane.approximate)
            : `${formatYear(lane.start, calendar, lane.approximate)}–${lane.open ? "現在" : formatYear(lane.end, calendar)}`;

          return (
            <g key={lane.key}>
              {i % 2 === 1 && (
                <rect x={0} y={y} width={totalW} height={ROW_H} fill="#f9fafb" />
              )}
              {/* 左ラベル */}
              <text x={12} y={y + ROW_H / 2 + 4} fontSize={12} fill="#111827">
                {truncate(lane.label)}
              </text>

              {isPoint ? (
                // 点イベント: ダイヤ型マーカー
                <g transform={`translate(${x1}, ${barY + BAR_H / 2})`}>
                  <rect
                    x={-BAR_H / 2}
                    y={-BAR_H / 2}
                    width={BAR_H}
                    height={BAR_H}
                    transform="rotate(45)"
                    fill={color}
                    opacity={0.85}
                  />
                </g>
              ) : (
                // 範囲バー
                <rect
                  x={x1}
                  y={barY}
                  width={Math.max(2, x2 - x1)}
                  height={BAR_H}
                  rx={4}
                  fill={color}
                  opacity={lane.layer === "event" ? 0.35 + lane.importance * 0.12 : 0.85}
                />
              )}
              {/* 存命/進行中の「→現在」矢印 */}
              {lane.open && (
                <text x={x2 + 6} y={barY + BAR_H - 3} fontSize={10} fill={color}>
                  →現在
                </text>
              )}
              {/* 年ラベル（点はマーカー右、範囲はバー右） */}
              <text
                x={(isPoint ? x1 + BAR_H : x2) + (lane.open ? 44 : 6)}
                y={barY + BAR_H - 3}
                fontSize={10}
                fill="#6b7280"
              >
                {lane.open ? "" : rangeLabel}
              </text>
            </g>
          );
        })}

        {/* ガター境界線 */}
        <line x1={GUTTER} y1={HEADER_H - 8} x2={GUTTER} y2={totalH} stroke="#d1d5db" strokeWidth={1} />
      </svg>

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
