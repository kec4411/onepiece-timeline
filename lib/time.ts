import type { Calendar } from "@/types/db";

// 年（canonical整数）↔ 表示暦の変換、および Gantt 用のスケール補助。

/** canonical年 → 指定した暦での表示年 */
export function toCalendarYear(canonicalYear: number, calendar: Calendar): number {
  return canonicalYear + calendar.offset_from_canonical;
}

/** 表示暦の年 → canonical年（フィルタ入力などで使用） */
export function fromCalendarYear(displayYear: number, calendar: Calendar): number {
  return displayYear - calendar.offset_from_canonical;
}

/** 「約」プレフィックスつきの年ラベル */
export function formatYear(
  canonicalYear: number,
  calendar: Calendar,
  isApproximate = false,
): string {
  const y = toCalendarYear(canonicalYear, calendar);
  return `${isApproximate ? "約" : ""}${y}`;
}

/**
 * 年 → X座標を返す線形スケール（d3-scale の scaleLinear と同等の最小実装）。
 * 依存を増やさないためここで自前定義。domain: [minYear, maxYear] → range: [0, width]
 */
export function makeYearScale(minYear: number, maxYear: number, width: number) {
  const span = maxYear - minYear || 1;
  const scale = (year: number) => ((year - minYear) / span) * width;
  scale.invert = (x: number) => (x / width) * span + minYear;
  return scale;
}

/** 目盛り（tick）の年配列を、きりの良い間隔で生成する */
export function yearTicks(minYear: number, maxYear: number, target = 8): number[] {
  const span = maxYear - minYear;
  if (span <= 0) return [minYear];
  const rawStep = span / target;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const candidates = [1, 2, 5, 10].map((m) => m * pow);
  const step = candidates.find((s) => span / s <= target * 1.5) ?? candidates[candidates.length - 1];
  const start = Math.ceil(minYear / step) * step;
  const ticks: number[] = [];
  for (let y = start; y <= maxYear; y += step) ticks.push(Math.round(y));
  return ticks;
}
