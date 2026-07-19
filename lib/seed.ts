import type { Calendar, Character, CharacterOrganization, EventRow, Organization } from "@/types/db";

// ローカル・フォールバック用データ（Supabase 未接続時に表示）。
// supabase/seed.sql と同じ内容。ONE PIECE 作中年代（最新章まで／ネタバレ含む）。
//
// 【年代の考え方】ONE PIECE に公式な絶対年は無いため、相対年（原作準拠・正確）を
// 「物語現在(タイムスキップ後)＝海円暦1524年」に固定して canonical = 1524 − 現在からの年数 で格納。
// ★相対的な間隔は正確／絶対数値は便宜設定★。出典: One Piece Wiki 他。

export const seedCalendars: Calendar[] = [
  { id: 1, name: "海円暦", description: "本アプリの基準暦。現在を便宜上1524年に設定（相対年は原作準拠）。", offset_from_canonical: 0 },
  { id: 2, name: "天暦", description: "サンプルの別暦（非公式）。表示切替の例。", offset_from_canonical: -1000 },
];

export const seedOrganizations: Organization[] = [
  { id: 1, name: "ロジャー海賊団", kind: "海賊団", description: "ひとつなぎの大秘宝に到達した海賊王ロジャーの一味。", color: "#b91c1c" },
  { id: 2, name: "白ひげ海賊団", kind: "海賊団", description: "世界最強の男・白ひげ率いる大所帯の海賊団。", color: "#f59e0b" },
  { id: 3, name: "赤髪海賊団", kind: "海賊団", description: "四皇シャンクス率いる海賊団。", color: "#dc2626" },
  { id: 4, name: "麦わらの一味", kind: "海賊団", description: "ルフィを船長とする物語の主役海賊団。", color: "#eab308" },
  { id: 5, name: "海軍", kind: "海軍", description: "世界政府直轄の軍事組織。", color: "#1d4ed8" },
  { id: 6, name: "光月家", kind: "勢力", description: "ワノ国の将軍家。ポーネグリフを刻む石工の一族。", color: "#7c3aed" },
  { id: 7, name: "オハラ", kind: "機関", description: "歴史の本文を研究した考古学の島（学者機関）。", color: "#059669" },
];

export const seedCharacterOrganizations: CharacterOrganization[] = [
  { character_id: 1, organization_id: 1, role: "船長", sort_order: 0 },
  { character_id: 2, organization_id: 1, role: "副船長", sort_order: 0 },
  { character_id: 3, organization_id: 5, role: "中将", sort_order: 0 },
  { character_id: 4, organization_id: 2, role: "船長", sort_order: 0 },
  { character_id: 5, organization_id: 6, role: "大名", sort_order: 0 },
  { character_id: 5, organization_id: 2, role: "隊長", sort_order: 1 },
  { character_id: 5, organization_id: 1, role: "見習い", sort_order: 2 },
  { character_id: 6, organization_id: 1, role: "見習い", sort_order: 0 },
  { character_id: 6, organization_id: 3, role: "船長", sort_order: 1 },
  { character_id: 7, organization_id: 7, role: "学者", sort_order: 0 },
  { character_id: 7, organization_id: 4, role: "考古学者", sort_order: 1 },
  { character_id: 8, organization_id: 2, role: "二番隊隊長", sort_order: 0 },
  { character_id: 9, organization_id: 4, role: "戦闘員", sort_order: 0 },
  { character_id: 10, organization_id: 4, role: "船長", sort_order: 0 },
];

export const seedCharacters: Character[] = [
  { id: 1, name: "ゴール・D・ロジャー", epithet: "海賊王", birth_year: 1447, death_year: 1500, is_approximate: true, image_url: null, notes: "唯一ひとつなぎの大秘宝に到達した海賊王。享年53。" },
  { id: 2, name: "シルバーズ・レイリー", epithet: "冥王", birth_year: 1446, death_year: null, is_approximate: false, image_url: null, notes: "ロジャー海賊団副船長。ルフィに覇気を指南。" },
  { id: 3, name: "モンキー・D・ガープ", epithet: "海軍の英雄", birth_year: 1446, death_year: null, is_approximate: true, image_url: null, notes: "ロジャーを幾度も追い詰めた英雄。ルフィの祖父。" },
  { id: 4, name: "エドワード・ニューゲート", epithet: "白ひげ", birth_year: 1450, death_year: 1522, is_approximate: true, image_url: null, notes: "世界最強の男と称された四皇。享年72。" },
  { id: 5, name: "光月おでん", epithet: null, birth_year: 1465, death_year: 1504, is_approximate: true, image_url: null, notes: "ワノ国の大名。ロジャー・白ひげ両船に乗った豪傑。享年39。" },
  { id: 6, name: "シャンクス", epithet: "赤髪のシャンクス", birth_year: 1485, death_year: null, is_approximate: false, image_url: null, notes: "ルフィに麦わら帽子を託した四皇。" },
  { id: 7, name: "ニコ・ロビン", epithet: "悪魔の子", birth_year: 1494, death_year: null, is_approximate: false, image_url: null, notes: "オハラ唯一の生き残りの考古学者。麦わらの一味。" },
  { id: 8, name: "ポートガス・D・エース", epithet: "火拳のエース", birth_year: 1502, death_year: 1522, is_approximate: false, image_url: null, notes: "ロジャーの息子。白ひげ海賊団二番隊隊長。享年20。" },
  { id: 9, name: "ロロノア・ゾロ", epithet: "海賊狩り", birth_year: 1503, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味剣士。世界一の大剣豪を目指す。" },
  { id: 10, name: "モンキー・D・ルフィ", epithet: "麦わらのルフィ", birth_year: 1505, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味船長。物語の主人公。" },
];

export const seedEvents: EventRow[] = [
  { id: 1, name: "空白の100年", description: "世界政府に歴史から抹消された謎の100年間。", start_year: 624, end_year: 724, is_approximate: false, category: "時代", importance: 5 },
  { id: 2, name: "巨大な王国の滅亡", description: "20の王国連合に敗れ滅ぼされた古代の超文明国家。", start_year: 724, end_year: null, is_approximate: true, category: "戦争", importance: 5 },
  { id: 3, name: "世界政府の成立", description: "連合の勝利後、20の王国が結束して創設。", start_year: 724, end_year: null, is_approximate: false, category: "政治", importance: 5 },
  { id: 4, name: "ジョイボーイの敗北", description: "最初の海賊ジョイボーイが敗れ、後世への約束を残した。", start_year: 724, end_year: null, is_approximate: true, category: "事件", importance: 4 },
  { id: 5, name: "ワノ国の鎖国", description: "光月家がポーネグリフを守るため国境を閉ざした。", start_year: 724, end_year: null, is_approximate: true, category: "政治", importance: 3 },
  { id: 6, name: "ゴッドバレー事件", description: "ロックス海賊団が壊滅し、ロジャーとガープが共闘。", start_year: 1486, end_year: null, is_approximate: false, category: "事件", importance: 5 },
  { id: 7, name: "ロジャー、ラフテル到達・海賊王に", description: "偉大なる航路を制覇し最後の島ラフテルへ到達。", start_year: 1498, end_year: null, is_approximate: true, category: "冒険", importance: 5 },
  { id: 8, name: "ロジャー処刑・大海賊時代の幕開け", description: "最期の言葉が世界を大海賊時代へと導いた。", start_year: 1500, end_year: null, is_approximate: false, category: "事件", importance: 5 },
  { id: 9, name: "オハラ事件（バスターコール）", description: "オハラの学者が虐殺され、ニコ・ロビンが逃亡者に。", start_year: 1502, end_year: null, is_approximate: false, category: "事件", importance: 5 },
  { id: 10, name: "おでん処刑・ワノ国掌握", description: "光月おでんが処刑され、カイドウとオロチが支配。", start_year: 1504, end_year: null, is_approximate: false, category: "事件", importance: 4 },
  { id: 11, name: "シャンクス、麦わら帽子を託す", description: "フーシャ村を発つ際、幼いルフィに帽子を預けた。", start_year: 1512, end_year: null, is_approximate: true, category: "冒険", importance: 3 },
  { id: 12, name: "ルフィ、海へ出る（物語の始まり）", description: "海賊王を目指してルフィが航海へ。物語の起点。", start_year: 1522, end_year: null, is_approximate: true, category: "冒険", importance: 4 },
  { id: 13, name: "頂上戦争（マリンフォード）", description: "エースと白ひげが死亡した海軍と白ひげの全面戦争。", start_year: 1522, end_year: null, is_approximate: false, category: "戦争", importance: 5 },
  { id: 14, name: "2年間の修行（時間跳躍）", description: "麦わらの一味が各地で2年間の修行を行った空白期間。", start_year: 1522, end_year: 1524, is_approximate: false, category: "時代", importance: 3 },
  { id: 15, name: "世界会議（レヴェリー）", description: "加盟国の王が集う会議。水面下で政治が動いた。", start_year: 1523, end_year: null, is_approximate: true, category: "政治", importance: 3 },
  { id: 16, name: "ワノ国編・カイドウ&オロチ打倒", description: "光月家と同盟がカイドウらを倒しワノ国を解放。", start_year: 1524, end_year: null, is_approximate: true, category: "戦争", importance: 4 },
  { id: 17, name: "エッグヘッド事件・最終章の始まり", description: "ベガパンクを巡り五老星が動き、最終章が本格化。", start_year: 1524, end_year: null, is_approximate: true, category: "事件", importance: 4 },
];
