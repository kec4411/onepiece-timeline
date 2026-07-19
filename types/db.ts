// DB の行に対応する型（MVP 手書き。将来 `supabase gen types` で自動生成に置換可）。
//
// 時間の考え方:
//   - すべての年は「canonical（唯一の真実）な整数の年」で保持する。
//   - 表示用の暦（海円暦 / 天暦 …）は Calendar.offset_from_canonical で加算変換する。
//   - 範囲は start/end（点イベントは start === end もしくは end = null）。
//   - 原作の「約◯年前」などの曖昧さは is_approximate で表現する。

export type Calendar = {
  id: number;
  name: string;
  description: string | null;
  /** 表示年 = canonical年 + offset_from_canonical */
  offset_from_canonical: number;
};

export type Character = {
  id: number;
  name: string;
  /** 異名（例: 海賊王） */
  epithet: string | null;
  birth_year: number | null;
  death_year: number | null;
  is_approximate: boolean;
  image_url: string | null;
  notes: string | null;
  /** 取得時に junction を結合して付与する所属組織（DB列ではない派生データ） */
  orgs?: CharacterOrg[];
  /** 取得時に付与するキャラ個別イベント（人生の節目。events + character_events から導出） */
  events?: CharacterMilestone[];
};

/** キャラ ↔ 出来事(events) の中間テーブル行。character_id = 0 は世界の出来事。 */
export type CharacterEventLink = {
  character_id: number;
  event_id: number;
  sort_order: number;
};

/** キャラに紐づく出来事を表示用に整形した派生データ（events から導出） */
export type CharacterMilestone = {
  id: number;
  name: string;
  /** canonical年（events.start_year） */
  year: number;
  description: string | null;
};

export type Organization = {
  id: number;
  name: string;
  /** 例: 海賊団 / 海軍 / 勢力 / 機関 */
  kind: string | null;
  description: string | null;
  color: string | null;
};

export type CharacterOrganization = {
  character_id: number;
  organization_id: number;
  role: string | null;
  sort_order: number;
};

/** キャラに紐づけて表示する所属（organizations と junction を結合した派生型） */
export type CharacterOrg = {
  name: string;
  kind: string | null;
  role: string | null;
  color: string | null;
};

export type EventCategory = {
  id: number;
  name: string;
  /** 絵文字アイコン（例: ⚔️ / ⚡ / ⛵） */
  icon: string | null;
  color: string | null;
  sort_order: number;
};

export type EventRow = {
  id: number;
  name: string;
  description: string | null;
  start_year: number;
  /** null の場合は点イベント（start_year のみ）→ カテゴリのアイコンで表示 */
  end_year: number | null;
  is_approximate: boolean;
  category_id: number | null;
  /** 1（低）〜5（高）。並び順や強調に利用 */
  importance: number;
  /** 取得時に event_categories を結合して付与（DB列ではない派生データ） */
  category?: EventCategory | null;
};
