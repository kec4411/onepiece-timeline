import type { Calendar, Character, EventRow } from "@/types/db";

// ローカル・フォールバック用のサンプルデータ。
// Supabase 未接続でも Gantt を確認できるようにするための「仮データ」です。
// ここの年号は考証済みの正確値ではなくプレースホルダ。実データは Supabase 側で整備してください。
// （supabase/schema.sql の seed と内容を対応させています）

export const seedCalendars: Calendar[] = [
  { id: 1, name: "海円暦", description: "作中の標準暦（基準）", offset_from_canonical: 0 },
  { id: 2, name: "天暦", description: "サンプル。実オフセットは要検証", offset_from_canonical: -1120 },
];

export const seedCharacters: Character[] = [
  { id: 1, name: "ゴール・D・ロジャー", epithet: "海賊王", birth_year: 1447, death_year: 1500, is_approximate: true, image_url: null, notes: "ひとつなぎの大秘宝に到達" },
  { id: 2, name: "ニコ・ロビン", epithet: "悪魔の子", birth_year: 1494, death_year: null, is_approximate: true, image_url: null, notes: "オハラ出身の考古学者" },
  { id: 3, name: "モンキー・D・ルフィ", epithet: "麦わら", birth_year: 1505, death_year: null, is_approximate: true, image_url: null, notes: "麦わらの一味 船長" },
];

export const seedEvents: EventRow[] = [
  { id: 1, name: "空白の100年", description: "歴史から消された100年間", start_year: 700, end_year: 800, is_approximate: true, category: "時代", importance: 5 },
  { id: 2, name: "ロジャー処刑", description: "海賊王の死と大海賊時代の幕開け", start_year: 1500, end_year: 1500, is_approximate: false, category: "事件", importance: 5 },
  { id: 3, name: "オハラ壊滅（バスターコール）", description: "歴史の本文を研究したオハラへの掃討", start_year: 1502, end_year: 1502, is_approximate: true, category: "事件", importance: 4 },
  { id: 4, name: "ルフィ 東の海を出航", description: "冒険の始まり", start_year: 1522, end_year: 1522, is_approximate: true, category: "冒険", importance: 3 },
  { id: 5, name: "頂上戦争（マリンフォード）", description: "白ひげ海賊団 vs 海軍", start_year: 1523, end_year: 1523, is_approximate: false, category: "戦争", importance: 5 },
];
