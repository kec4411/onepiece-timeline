import type { ReactNode } from "react";

// カテゴリの icon キー → 24x24 の SVG 描画（color で着色）。
// 絵文字は環境依存で見た目が変わるため、自前のシンプルな SVG モチーフで統一する。
// event_categories.icon にはこのキー（hourglass / bank / bolt / swords / ship）を格納する。
export const CATEGORY_ICONS: Record<string, (color: string) => ReactNode> = {
  // 時代: 砂時計
  hourglass: (c) => (
    <>
      <path d="M5 3 H19 L13 12 L19 21 H5 L11 12 Z" fill={c} />
      <path d="M4 2 H20 V4 H4 Z M4 20 H20 V22 H4 Z" fill={c} />
    </>
  ),
  // 政治: 議事堂（屋根＋柱＋土台）
  bank: (c) => (
    <>
      <path d="M12 3 L22 8 V10 H2 V8 Z" fill={c} />
      <path d="M4 11 H6 V18 H4 Z M11 11 H13 V18 H11 Z M18 11 H20 V18 H18 Z" fill={c} />
      <path d="M3 19 H21 V22 H3 Z" fill={c} />
    </>
  ),
  // 事件: 稲妻
  bolt: (c) => <path d="M13 2 L4 13 H10 L9 22 L20 10 H13 Z" fill={c} />,
  // 戦争: 交差した剣
  swords: (c) => (
    <g fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="19" x2="17" y2="7" />
      <line x1="19" y1="19" x2="7" y2="7" />
      <path d="M15 5 L19 9" />
      <path d="M9 5 L5 9" />
    </g>
  ),
  // 冒険: 帆船
  ship: (c) => (
    <>
      <path d="M3 15 H21 L19 20 H5 Z" fill={c} />
      <path d="M11 3 H12 V15 H11 Z" fill={c} />
      <path d="M13 5 L19 14 H13 Z" fill={c} />
    </>
  ),
};

/** HTML 文脈用（chip / tooltip）に <svg> でラップして返す */
export function CategoryIcon({
  iconKey,
  color,
  size = 14,
}: {
  iconKey: string | null | undefined;
  color: string;
  size?: number;
}) {
  const fn = iconKey ? CATEGORY_ICONS[iconKey] : undefined;
  if (!fn) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="inline-block shrink-0">
      {fn(color)}
    </svg>
  );
}
