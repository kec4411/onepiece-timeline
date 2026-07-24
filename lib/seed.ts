import type { Calendar, Character, CharacterEventLink, CharacterOrganization, EventCategory, EventRow, Organization } from "@/types/db";

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
  { id: 8, name: "革命軍", kind: "勢力", description: "ドラゴン率いる、世界政府に反旗を翻す組織。", color: "#16a34a" },
  { id: 9, name: "ロックス海賊団", kind: "海賊団", description: "ジーベック率いた、かつて最凶と恐れられた海賊団。", color: "#374151" },
  { id: 10, name: "ビッグマム海賊団", kind: "海賊団", description: "四皇ビッグ・マム率いる海賊団。", color: "#db2777" },
  { id: 11, name: "百獣海賊団", kind: "海賊団", description: "四皇カイドウ率いる海賊団。", color: "#4338ca" },
  { id: 12, name: "神の騎士団", kind: "勢力", description: "世界政府直属、天竜人で構成される謎の武力組織。ガーリング／シャムロックが率いる。", color: "#ca8a04" },
  { id: 13, name: "クロスギルド", kind: "海賊団", description: "バギー・ミホーク・クロコダイルが率いる海賊/賞金稼ぎ組織。バギーは四皇の一人。", color: "#7f1d1d" },
  { id: 14, name: "黒ひげ海賊団", kind: "海賊団", description: "四皇・黒ひげティーチ率いる海賊団。", color: "#111827" },
  { id: 15, name: "ドンキホーテファミリー", kind: "海賊団", description: "ドフラミンゴ率いる元王下七武海の海賊。ドレスローザを支配した。", color: "#a21caf" },
  { id: 16, name: "九蛇海賊団", kind: "海賊団", description: "ハンコック率いるアマゾン・リリーの女海賊団。", color: "#ec4899" },
  { id: 17, name: "アラバスタ王国", kind: "勢力", description: "ネフェルタリ家が治める砂の王国。", color: "#92400e" },
  { id: 18, name: "アーロン一味", kind: "海賊団", description: "アーロン率いる魚人海賊団。東の海を荒らした。", color: "#0e7490" },
  { id: 19, name: "スリラーバーク海賊団", kind: "海賊団", description: "ゲッコー・モリア率いる海賊団。", color: "#5b21b6" },
  { id: 20, name: "シャンディア", kind: "勢力", description: "ジャヤ／空島の黄金郷を守る戦士の一族。", color: "#4d7c0f" },
  { id: 21, name: "ルブニール王国", kind: "勢力", description: "ノーランドが仕えた北の海の王国。", color: "#0369a1" },
  { id: 22, name: "王下七武海", kind: "勢力", description: "世界政府公認の海賊。海の均衡を担わせた制度（現在は撤廃）。歴代の実力者が名を連ねた。", color: "#334155" },
  { id: 23, name: "タイヨウの海賊団", kind: "海賊団", description: "フィッシャー・タイガーが創設した魚人海賊団。奴隷の証を太陽の紋章で覆い隠した。", color: "#ea580c" },
];

export const seedCharacterOrganizations: CharacterOrganization[] = [
  { character_id: 1, organization_id: 1, role: "船長", sort_order: 0 },
  { character_id: 2, organization_id: 1, role: "副船長", sort_order: 0 },
  { character_id: 3, organization_id: 5, role: "中将", sort_order: 0 },
  { character_id: 4, organization_id: 2, role: "船長", sort_order: 0 },
  { character_id: 5, organization_id: 6, role: "大名", sort_order: 0 },
  { character_id: 5, organization_id: 2, role: "隊長", sort_order: 1 },
  { character_id: 5, organization_id: 1, role: "見習い", sort_order: 2 },
  { character_id: 6, organization_id: 3, role: "船長", sort_order: 0 },
  { character_id: 6, organization_id: 1, role: "見習い", sort_order: 1 },
  { character_id: 6, organization_id: 12, role: "一員", sort_order: 2 },
  { character_id: 7, organization_id: 4, role: "考古学者", sort_order: 0 },
  { character_id: 7, organization_id: 7, role: "学者", sort_order: 1 },
  { character_id: 8, organization_id: 2, role: "二番隊隊長", sort_order: 0 },
  { character_id: 9, organization_id: 4, role: "戦闘員", sort_order: 0 },
  { character_id: 10, organization_id: 4, role: "船長", sort_order: 0 },
  { character_id: 11, organization_id: 4, role: "航海士", sort_order: 0 },
  { character_id: 12, organization_id: 4, role: "狙撃手", sort_order: 0 },
  { character_id: 13, organization_id: 4, role: "コック", sort_order: 0 },
  { character_id: 14, organization_id: 4, role: "船医", sort_order: 0 },
  { character_id: 15, organization_id: 4, role: "船大工", sort_order: 0 },
  { character_id: 16, organization_id: 4, role: "音楽家", sort_order: 0 },
  { character_id: 17, organization_id: 4, role: "操舵手", sort_order: 0 },
  // 革命軍(8)
  { character_id: 18, organization_id: 8, role: "総司令官", sort_order: 0 },
  { character_id: 19, organization_id: 8, role: "幹部", sort_order: 0 },
  { character_id: 20, organization_id: 8, role: "幹部", sort_order: 0 },
  { character_id: 21, organization_id: 8, role: "参謀総長", sort_order: 0 },
  // 海軍(5)
  { character_id: 22, organization_id: 5, role: "元帥", sort_order: 0 },
  { character_id: 23, organization_id: 5, role: "中将", sort_order: 0 },
  // ロックス海賊団(9) と 自派
  { character_id: 24, organization_id: 9, role: "船長", sort_order: 0 },
  { character_id: 25, organization_id: 10, role: "船長", sort_order: 0 },
  { character_id: 25, organization_id: 9, role: "大幹部", sort_order: 1 },
  { character_id: 26, organization_id: 11, role: "船長", sort_order: 0 },
  { character_id: 26, organization_id: 9, role: "見習い", sort_order: 1 },
  { character_id: 27, organization_id: 9, role: "幹部", sort_order: 0 },
  { character_id: 28, organization_id: 9, role: "幹部", sort_order: 0 },
  { character_id: 29, organization_id: 9, role: "幹部", sort_order: 0 },
  { character_id: 30, organization_id: 9, role: "幹部", sort_order: 0 },
  { character_id: 31, organization_id: 9, role: "幹部", sort_order: 0 },
  { character_id: 32, organization_id: 9, role: "船員", sort_order: 0 },
  { character_id: 33, organization_id: 9, role: "船員", sort_order: 0 },
  { character_id: 33, organization_id: 10, role: "コック", sort_order: 1 },
  { character_id: 34, organization_id: 9, role: "船員", sort_order: 0 },
  { character_id: 35, organization_id: 9, role: "船員", sort_order: 0 },
  { character_id: 36, organization_id: 9, role: "船員", sort_order: 0 },
  { character_id: 4, organization_id: 9, role: "見習い", sort_order: 1 },
  // 追加キャラの所属（character_id 37..47 / organization_id 13..21）
  { character_id: 37, organization_id: 13, role: "代表", sort_order: 0 },
  { character_id: 37, organization_id: 1, role: "見習い", sort_order: 1 },
  { character_id: 38, organization_id: 13, role: "幹部", sort_order: 0 },
  { character_id: 39, organization_id: 18, role: "船長", sort_order: 0 },
  { character_id: 40, organization_id: 17, role: "王女", sort_order: 0 },
  { character_id: 41, organization_id: 13, role: "幹部", sort_order: 0 },
  { character_id: 42, organization_id: 15, role: "会長", sort_order: 0 },
  { character_id: 43, organization_id: 19, role: "船長", sort_order: 0 },
  { character_id: 44, organization_id: 16, role: "船長", sort_order: 0 },
  { character_id: 45, organization_id: 14, role: "提督", sort_order: 0 },
  { character_id: 45, organization_id: 2, role: "傘下", sort_order: 1 },
  { character_id: 46, organization_id: 21, role: "探検家", sort_order: 0 },
  { character_id: 47, organization_id: 20, role: "大戦士", sort_order: 0 },
  // 王下七武海（org 22）: 歴代メンバーを副所属として付与
  { character_id: 38, organization_id: 22, role: "七武海", sort_order: 1 },
  { character_id: 41, organization_id: 22, role: "七武海", sort_order: 1 },
  { character_id: 42, organization_id: 22, role: "七武海", sort_order: 1 },
  { character_id: 43, organization_id: 22, role: "七武海", sort_order: 1 },
  { character_id: 44, organization_id: 22, role: "七武海", sort_order: 1 },
  { character_id: 45, organization_id: 22, role: "七武海", sort_order: 2 },
  { character_id: 20, organization_id: 22, role: "七武海", sort_order: 1 },
  { character_id: 17, organization_id: 22, role: "七武海", sort_order: 1 },
  // タイヨウの海賊団（org 23）
  { character_id: 48, organization_id: 23, role: "船長", sort_order: 0 },
  { character_id: 17, organization_id: 23, role: "元隊員", sort_order: 2 }, // ジンベエ
  { character_id: 39, organization_id: 23, role: "元隊員", sort_order: 1 }, // アーロン
];

// キャラ ↔ 出来事(events) の中間テーブル。character_id = 0 は世界の出来事（events 1..17）。
export const seedCharacterEventLinks: CharacterEventLink[] = [
  ...Array.from({ length: 17 }, (_, i) => ({ character_id: 0, event_id: i + 1, sort_order: 0 })),
  { character_id: 1, event_id: 56, sort_order: 0 }, // ゴッドバレーでロックス撃破
  { character_id: 1, event_id: 18, sort_order: 1 },
  { character_id: 1, event_id: 19, sort_order: 2 },
  { character_id: 1, event_id: 20, sort_order: 3 },
  // シャンクス（6）: 既存(21,22,23) ＋ 追加(45..53) を年代順に。52=生誕(1485)先頭、53=神の騎士団(1509)
  { character_id: 6, event_id: 52, sort_order: 0 },
  { character_id: 6, event_id: 45, sort_order: 1 },
  { character_id: 6, event_id: 46, sort_order: 2 },
  { character_id: 6, event_id: 21, sort_order: 3 },
  { character_id: 6, event_id: 47, sort_order: 4 },
  { character_id: 6, event_id: 53, sort_order: 5 },
  { character_id: 6, event_id: 48, sort_order: 6 },
  { character_id: 6, event_id: 49, sort_order: 7 },
  { character_id: 6, event_id: 22, sort_order: 8 },
  { character_id: 6, event_id: 50, sort_order: 9 },
  { character_id: 6, event_id: 51, sort_order: 10 },
  { character_id: 6, event_id: 23, sort_order: 11 },
  { character_id: 10, event_id: 24, sort_order: 0 },
  { character_id: 10, event_id: 25, sort_order: 1 },
  { character_id: 10, event_id: 26, sort_order: 2 },
  { character_id: 10, event_id: 27, sort_order: 3 },
  // 麦わらの一味 各メンバー（events 28..44）。ロビンは既存のオハラ事件(9)も再利用
  { character_id: 9, event_id: 29, sort_order: 0 },
  { character_id: 9, event_id: 28, sort_order: 1 },
  { character_id: 11, event_id: 31, sort_order: 0 },
  { character_id: 11, event_id: 30, sort_order: 1 },
  { character_id: 12, event_id: 32, sort_order: 0 },
  { character_id: 12, event_id: 33, sort_order: 1 },
  { character_id: 13, event_id: 35, sort_order: 0 },
  { character_id: 13, event_id: 34, sort_order: 1 },
  { character_id: 14, event_id: 37, sort_order: 0 },
  { character_id: 14, event_id: 36, sort_order: 1 },
  { character_id: 7, event_id: 9, sort_order: 0 },
  { character_id: 7, event_id: 38, sort_order: 1 },
  { character_id: 15, event_id: 40, sort_order: 0 },
  { character_id: 15, event_id: 39, sort_order: 1 },
  { character_id: 16, event_id: 42, sort_order: 0 },
  { character_id: 16, event_id: 41, sort_order: 1 },
  { character_id: 17, event_id: 44, sort_order: 0 },
  { character_id: 17, event_id: 43, sort_order: 1 },
  // ゴッドバレー事件（1486）。54=ロックス壊滅 / 55=討たれる / 56=ロジャー撃破 / 57=ガープ英雄 / 58=センゴク参戦
  { character_id: 2, event_id: 56, sort_order: 0 },  // レイリー
  { character_id: 3, event_id: 57, sort_order: 0 },  // ガープ
  { character_id: 22, event_id: 58, sort_order: 0 }, // センゴク
  { character_id: 24, event_id: 55, sort_order: 0 }, // ロックス（ジーベック）
  { character_id: 4, event_id: 54, sort_order: 0 },  // 白ひげ
  { character_id: 25, event_id: 54, sort_order: 0 }, // ビッグマム
  { character_id: 26, event_id: 54, sort_order: 0 }, // カイドウ
  { character_id: 27, event_id: 54, sort_order: 0 }, // シキ
  { character_id: 28, event_id: 54, sort_order: 0 }, // ミス・バッキン
  { character_id: 29, event_id: 54, sort_order: 0 }, // マーロン
  { character_id: 30, event_id: 54, sort_order: 0 }, // 王直
  { character_id: 31, event_id: 54, sort_order: 0 }, // ガンズイ
  { character_id: 32, event_id: 54, sort_order: 0 }, // キャプテン・ジョン
  { character_id: 33, event_id: 54, sort_order: 0 }, // シュトロイゼン
  { character_id: 34, event_id: 54, sort_order: 0 }, // バーベル
  { character_id: 35, event_id: 54, sort_order: 0 }, // 銀斧
  // ゴッドバレー事件の追加詳細（59=ドラゴン / 60=イワンコフ / 61=くま / 62=カイドウ）
  { character_id: 18, event_id: 59, sort_order: 0 }, // ドラゴン
  { character_id: 19, event_id: 60, sort_order: 0 }, // イワンコフ
  { character_id: 20, event_id: 61, sort_order: 0 }, // くま
  { character_id: 26, event_id: 62, sort_order: 1 }, // カイドウ（54=壊滅 に続く2件目）
  // フィッシャー・タイガー（48）と ハンコック（44）のマリージョア関連
  { character_id: 48, event_id: 63, sort_order: 0 }, // 結成
  { character_id: 48, event_id: 64, sort_order: 1 }, // マリージョア襲撃
  { character_id: 48, event_id: 65, sort_order: 2 }, // 死
  { character_id: 44, event_id: 66, sort_order: 0 }, // ハンコック: 解放される
];

// 初期表示（検索前）に出す主要キャラの id: 麦わらの一味10 ＋ ロジャー(1)/シャンクス(6)/ガープ(3)/ドラゴン(18)/ロックス(24)
const FEATURED_IDS = new Set([1, 3, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 24]);

export const seedCharacters: Character[] = ([
  { id: 1, name: "ゴールド・ロジャー", full_name: "ゴール・D・ロジャー", hidden_name: null, persona: null, epithet: "海賊王", birth_year: 1447, death_year: 1500, is_approximate: true, image_url: null, notes: "唯一ひとつなぎの大秘宝に到達した海賊王。享年53。" },
  { id: 2, name: "レイリー", full_name: "シルバーズ・レイリー", hidden_name: null, persona: null, epithet: "冥王", birth_year: 1446, death_year: null, is_approximate: false, image_url: null, notes: "ロジャー海賊団副船長。ルフィに覇気を指南。" },
  { id: 3, name: "ガープ", full_name: "モンキー・D・ガープ", hidden_name: null, persona: null, epithet: "海軍の英雄", birth_year: 1446, death_year: null, is_approximate: true, image_url: null, notes: "ロジャーを幾度も追い詰めた英雄。ルフィの祖父。" },
  { id: 4, name: "白ひげ", full_name: "エドワード・ニューゲート", hidden_name: null, persona: null, epithet: "白ひげ", birth_year: 1450, death_year: 1522, is_approximate: true, image_url: null, notes: "世界最強の男と称された四皇。享年72。" },
  { id: 5, name: "おでん", full_name: "光月おでん", hidden_name: null, persona: null, epithet: null, birth_year: 1465, death_year: 1504, is_approximate: true, image_url: null, notes: "ワノ国の大名。ロジャー・白ひげ両船に乗った豪傑。享年39。" },
  { id: 6, name: "シャンクス", full_name: "シャンクス", hidden_name: null, persona: null, epithet: "赤髪のシャンクス", birth_year: 1485, death_year: null, is_approximate: false, image_url: null, notes: "ルフィに麦わら帽子を託した四皇。" },
  { id: 7, name: "ロビン", full_name: "ニコ・ロビン", hidden_name: null, persona: null, epithet: "悪魔の子", birth_year: 1494, death_year: null, is_approximate: false, image_url: null, notes: "オハラ唯一の生き残りの考古学者。麦わらの一味。" },
  { id: 8, name: "エース", full_name: "ポートガス・D・エース", hidden_name: "ゴール・D・エース", persona: null, epithet: "火拳のエース", birth_year: 1502, death_year: 1522, is_approximate: false, image_url: null, notes: "ロジャーの息子。白ひげ海賊団二番隊隊長。享年20。" },
  { id: 9, name: "ゾロ", full_name: "ロロノア・ゾロ", hidden_name: null, persona: null, epithet: "海賊狩り", birth_year: 1503, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味剣士。世界一の大剣豪を目指す。" },
  { id: 10, name: "ルフィ", full_name: "モンキー・D・ルフィ", hidden_name: null, persona: "ニカ/ジョイボーイ", epithet: "麦わらのルフィ", birth_year: 1505, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味船長。物語の主人公。" },
  { id: 11, name: "ナミ", full_name: "ナミ", hidden_name: null, persona: null, epithet: "泥棒猫", birth_year: 1504, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味航海士。天候を操る。" },
  { id: 12, name: "ウソップ", full_name: "ウソップ", hidden_name: null, persona: null, epithet: "そげキング", birth_year: 1505, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味狙撃手。臆病だが頼れる男。" },
  { id: 13, name: "サンジ", full_name: "サンジ", hidden_name: "ヴィンスモーク・サンジ", persona: null, epithet: "黒足", birth_year: 1503, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味コック。全ての海の食材を求める。" },
  { id: 14, name: "チョッパー", full_name: "トニートニー・チョッパー", hidden_name: null, persona: null, epithet: "わたあめ大好き", birth_year: 1507, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味船医。人の心を持つトナカイ。" },
  { id: 15, name: "フランキー", full_name: "フランキー", hidden_name: "カティ・フラム", persona: null, epithet: "鉄人", birth_year: 1488, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味船大工。サニー号を造ったサイボーグ。" },
  { id: 16, name: "ブルック", full_name: "ブルック", hidden_name: null, persona: null, epithet: "ソウルキング", birth_year: 1434, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味音楽家。ヨミヨミの実で蘇った骸骨剣士。" },
  { id: 17, name: "ジンベエ", full_name: "ジンベエ", hidden_name: null, persona: null, epithet: "海侠", birth_year: 1478, death_year: null, is_approximate: false, image_url: null, notes: "麦わらの一味操舵手。元王下七武海の魚人。" },
  { id: 18, name: "ドラゴン", full_name: "モンキー・D・ドラゴン", hidden_name: null, persona: null, epithet: "世界最悪の犯罪者", birth_year: 1469, death_year: null, is_approximate: true, image_url: null, notes: "革命軍総司令官。世界政府最大の脅威で、ルフィの実父。" },
  { id: 19, name: "イワンコフ", full_name: "エンポリオ・イワンコフ", hidden_name: null, persona: null, epithet: "女王イワ様", birth_year: 1471, death_year: null, is_approximate: false, image_url: null, notes: "革命軍幹部。ホルホルの実でカマバッカ王国の女王。" },
  { id: 20, name: "くま", full_name: "バーソロミュー・くま", hidden_name: null, persona: null, epithet: "暴君", birth_year: 1477, death_year: null, is_approximate: false, image_url: null, notes: "革命軍幹部・元王下七武海。改造されパシフィスタ化。" },
  { id: 21, name: "サボ", full_name: "サボ", hidden_name: null, persona: null, epithet: "炎帝", birth_year: 1502, death_year: null, is_approximate: false, image_url: null, notes: "革命軍No.2参謀総長。エースの意志を継ぐルフィの義兄。" },
  { id: 22, name: "センゴク", full_name: "センゴク", hidden_name: null, persona: null, epithet: "仏のセンゴク", birth_year: 1445, death_year: null, is_approximate: false, image_url: null, notes: "元海軍元帥。ヒトヒトの実 幻獣種 大仏の能力者。" },
  { id: 23, name: "スモーカー", full_name: "スモーカー", hidden_name: null, persona: null, epithet: "白猟のスモーカー", birth_year: 1488, death_year: null, is_approximate: false, image_url: null, notes: "海軍中将。モクモクの実の能力者。" },
  { id: 24, name: "ロックス", full_name: "ロックス・D・ジーベック", hidden_name: "デービー・D・ジーベック", persona: null, epithet: null, birth_year: 1443, death_year: 1486, is_approximate: true, image_url: null, notes: "ロックス海賊団船長。ゴッドバレー事件で敗れ死亡した最凶海賊。" },
  { id: 25, name: "ビッグマム", full_name: "シャーロット・リンリン", hidden_name: null, persona: null, epithet: null, birth_year: 1456, death_year: 1524, is_approximate: false, image_url: null, notes: "四皇の一人。元ロックスの大幹部。ワノ国で敗北。" },
  { id: 26, name: "カイドウ", full_name: "カイドウ", hidden_name: null, persona: null, epithet: "百獣のカイドウ", birth_year: 1465, death_year: 1524, is_approximate: false, image_url: null, notes: "四皇の一人。ロックス時代は見習い。ワノ国で敗北。" },
  { id: 27, name: "シキ", full_name: "シキ", hidden_name: null, persona: null, epithet: "金獅子のシキ", birth_year: 1456, death_year: null, is_approximate: true, image_url: null, notes: "ロジャーと並ぶ大海賊。インペルダウンを初脱獄した男。" },
  { id: 28, name: "ミス・バッキン", full_name: "バッキンガム・ステューシー", hidden_name: null, persona: null, epithet: null, birth_year: 1454, death_year: null, is_approximate: true, image_url: null, notes: "ロックスの女海賊。CP0のステューシーは彼女のクローン。" },
  { id: 29, name: "マーロン", full_name: "ドン・マーロン", hidden_name: null, persona: null, epithet: null, birth_year: 1450, death_year: null, is_approximate: true, image_url: null, notes: "ロックス創設メンバー。西の海の顔役。" },
  { id: 30, name: "王直", full_name: null, hidden_name: null, persona: null, epithet: null, birth_year: 1450, death_year: null, is_approximate: true, image_url: null, notes: "元ハチノスの支配者。ロックス創設メンバー。" },
  { id: 31, name: "ガンズイ", full_name: "ガンズイ", hidden_name: null, persona: null, epithet: null, birth_year: 1450, death_year: null, is_approximate: true, image_url: null, notes: "ロックス創設メンバーの一員。" },
  { id: 32, name: "キャプテン・ジョン", full_name: "キャプテン・ジョン", hidden_name: null, persona: null, epithet: null, birth_year: 1456, death_year: null, is_approximate: true, image_url: null, notes: "財宝を隠した伝説の海賊。スリラーバークで死体が登場。" },
  { id: 33, name: "シュトロイゼン", full_name: "シュトロイゼン", hidden_name: null, persona: null, epithet: null, birth_year: 1454, death_year: null, is_approximate: true, image_url: null, notes: "ココココの実の能力者。後にビッグマム海賊団総料理長。" },
  { id: 34, name: "バーベル", full_name: "バーベル", hidden_name: null, persona: null, epithet: null, birth_year: 1460, death_year: null, is_approximate: true, image_url: null, notes: "ロックス創設メンバーのナマズの魚人。" },
  { id: 35, name: "銀斧", full_name: "凶", hidden_name: null, persona: null, epithet: "銀斧", birth_year: 1450, death_year: null, is_approximate: true, image_url: null, notes: "ハチノス制圧後にロックスへ加入した元殺し屋。" },
  { id: 36, name: "グロリオーサ", full_name: "グロリオーサ", hidden_name: null, persona: null, epithet: "ニョン婆", birth_year: 1440, death_year: null, is_approximate: true, image_url: null, notes: "元アマゾン・リリー皇帝。現在は同島の長老。" },
  // 追加キャラ（id 37..47）
  { id: 37, name: "バギー", full_name: "バギー", hidden_name: null, persona: null, epithet: "道化のバギー", birth_year: 1485, death_year: null, is_approximate: false, image_url: null, notes: "四皇の一人（クロスギルド）。元ロジャー海賊団の見習いで、シャンクスとは同期。" },
  { id: 38, name: "ミホーク", full_name: "ジュラキュール・ミホーク", hidden_name: null, persona: null, epithet: "鷹の目", birth_year: 1481, death_year: null, is_approximate: false, image_url: null, notes: "世界最強の剣士。元王下七武海。現在はクロスギルドの一員。" },
  { id: 39, name: "アーロン", full_name: "アーロン", hidden_name: null, persona: null, epithet: "ノコギリのアーロン", birth_year: 1483, death_year: null, is_approximate: false, image_url: null, notes: "東の海を荒らした魚人海賊。元タイヨウの海賊団。" },
  { id: 40, name: "ビビ", full_name: "ネフェルタリ・ビビ", hidden_name: null, persona: null, epithet: null, birth_year: 1506, death_year: null, is_approximate: false, image_url: null, notes: "アラバスタ王国の王女。かつて麦わらの一味と旅した盟友。" },
  { id: 41, name: "クロコダイル", full_name: "サー・クロコダイル", hidden_name: null, persona: null, epithet: "砂漠の王", birth_year: 1478, death_year: null, is_approximate: false, image_url: null, notes: "元王下七武海。バロックワークスを率いた。現クロスギルド共同経営者。" },
  { id: 42, name: "ドフラミンゴ", full_name: "ドンキホーテ・ドフラミンゴ", hidden_name: null, persona: null, epithet: "天夜叉", birth_year: 1483, death_year: null, is_approximate: false, image_url: null, notes: "元王下七武海。元天竜人でドレスローザを支配。裏社会の仲介人「ジョーカー」。" },
  { id: 43, name: "モリア", full_name: "ゲッコー・モリア", hidden_name: null, persona: null, epithet: null, birth_year: 1474, death_year: null, is_approximate: false, image_url: null, notes: "元王下七武海。カゲカゲの実の能力者。かつてカイドウに敗れ仲間を失った。" },
  { id: 44, name: "ハンコック", full_name: "ボア・ハンコック", hidden_name: null, persona: null, epithet: "海賊女帝", birth_year: 1493, death_year: null, is_approximate: false, image_url: null, notes: "元王下七武海。九蛇海賊団船長でアマゾン・リリーの皇帝。" },
  { id: 45, name: "ティーチ", full_name: "マーシャル・D・ティーチ", hidden_name: null, persona: null, epithet: "黒ひげ", birth_year: 1484, death_year: null, is_approximate: false, image_url: null, notes: "四皇の一人。ヤミヤミ＆グラグラの二つの実の力を持つ。元白ひげ海賊団。" },
  { id: 46, name: "ノーランド", full_name: "モンブラン・ノーランド", hidden_name: null, persona: null, epithet: "嘘つきノーランド", birth_year: 1082, death_year: 1124, is_approximate: true, image_url: null, notes: "約400年前の北の海の探検家。ジャヤ島でカルガラと友情を結んだ。" },
  { id: 47, name: "カルガラ", full_name: "カルガラ", hidden_name: null, persona: null, epithet: null, birth_year: 1090, death_year: 1130, is_approximate: true, image_url: null, notes: "約400年前のシャンドラの大戦士。ノーランドと友情を結び、黄金郷を守った。" },
  { id: 48, name: "フィッシャー・タイガー", full_name: null, hidden_name: null, persona: null, epithet: null, birth_year: 1470, death_year: 1507, is_approximate: true, image_url: null, notes: "タイヨウの海賊団の創設者。マリージョアを襲撃し奴隷を解放した魚人の英雄。人間の輸血を拒み死亡。" },
] as Omit<Character, "is_featured">[]).map((c) => ({ ...c, is_featured: FEATURED_IDS.has(c.id) }));

export const seedEventCategories: EventCategory[] = [
  { id: 1, name: "時代", icon: "hourglass", color: "#6b7280", sort_order: 1 },
  { id: 2, name: "政治", icon: "bank", color: "#0ea5e9", sort_order: 2 },
  { id: 3, name: "事件", icon: "bolt", color: "#ef4444", sort_order: 3 },
  { id: 4, name: "戦争", icon: "swords", color: "#b45309", sort_order: 4 },
  { id: 5, name: "冒険", icon: "ship", color: "#10b981", sort_order: 5 },
];

export const seedEvents: EventRow[] = [
  { id: 1, name: "空白の100年", description: "世界政府に歴史から抹消された謎の100年間。", start_year: 624, end_year: 724, is_approximate: false, category_id: 1, importance: 5 },
  { id: 2, name: "巨大な王国の滅亡", description: "20の王国連合に敗れ滅ぼされた古代の超文明国家。", start_year: 724, end_year: null, is_approximate: true, category_id: 4, importance: 5 },
  { id: 3, name: "世界政府の成立", description: "連合の勝利後、20の王国が結束して創設。", start_year: 724, end_year: null, is_approximate: false, category_id: 2, importance: 5 },
  { id: 4, name: "ジョイボーイの敗北", description: "最初の海賊ジョイボーイが敗れ、後世への約束を残した。", start_year: 724, end_year: null, is_approximate: true, category_id: 3, importance: 4 },
  { id: 5, name: "ワノ国の鎖国", description: "光月家がポーネグリフを守るため国境を閉ざした。", start_year: 724, end_year: null, is_approximate: true, category_id: 2, importance: 3 },
  { id: 6, name: "ゴッドバレー事件", description: "ロックス海賊団が壊滅し、ロジャーとガープが共闘。", start_year: 1486, end_year: null, is_approximate: false, category_id: 3, importance: 5 },
  { id: 7, name: "ロジャー、ラフテル到達・海賊王に", description: "偉大なる航路を制覇し最後の島ラフテルへ到達。", start_year: 1498, end_year: null, is_approximate: true, category_id: 5, importance: 5 },
  { id: 8, name: "ロジャー処刑・大海賊時代の幕開け", description: "最期の言葉が世界を大海賊時代へと導いた。", start_year: 1500, end_year: null, is_approximate: false, category_id: 3, importance: 5 },
  { id: 9, name: "オハラ事件（バスターコール）", description: "オハラの学者が虐殺され、ニコ・ロビンが逃亡者に。", start_year: 1502, end_year: null, is_approximate: false, category_id: 3, importance: 5 },
  { id: 10, name: "おでん処刑・ワノ国掌握", description: "光月おでんが処刑され、カイドウとオロチが支配。", start_year: 1504, end_year: null, is_approximate: false, category_id: 3, importance: 4 },
  { id: 11, name: "シャンクス、麦わら帽子を託す", description: "フーシャ村を発つ際、幼いルフィに帽子を預けた。", start_year: 1512, end_year: null, is_approximate: true, category_id: 5, importance: 3 },
  { id: 12, name: "ルフィ、海へ出る（物語の始まり）", description: "海賊王を目指してルフィが航海へ。物語の起点。", start_year: 1522, end_year: null, is_approximate: true, category_id: 5, importance: 4 },
  { id: 13, name: "頂上戦争（マリンフォード）", description: "エースと白ひげが死亡した海軍と白ひげの全面戦争。", start_year: 1522, end_year: null, is_approximate: false, category_id: 4, importance: 5 },
  { id: 14, name: "2年間の修行（時間跳躍）", description: "麦わらの一味が各地で2年間の修行を行った空白期間。", start_year: 1522, end_year: 1524, is_approximate: false, category_id: 1, importance: 3 },
  { id: 15, name: "世界会議（レヴェリー）", description: "加盟国の王が集う会議。水面下で政治が動いた。", start_year: 1523, end_year: null, is_approximate: true, category_id: 2, importance: 3 },
  { id: 16, name: "ワノ国編・カイドウ&オロチ打倒", description: "光月家と同盟がカイドウらを倒しワノ国を解放。", start_year: 1524, end_year: null, is_approximate: true, category_id: 4, importance: 4 },
  { id: 17, name: "エッグヘッド事件・最終章の始まり", description: "ベガパンクを巡り五老星が動き、最終章が本格化。", start_year: 1524, end_year: null, is_approximate: true, category_id: 3, importance: 4 },
  // ↓ キャラ個別イベント（id 18..27）。category_id は null。character_events で各キャラに紐づく
  { id: 18, name: "光月おでんが一味に加わる", description: "ワノ国の大名おでんがロジャー海賊団に同行。", start_year: 1490, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 19, name: "ラフテルへ到達し海賊王に", description: "偉大なる航路を制覇し、最後の島ラフテルへ到達。", start_year: 1498, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 20, name: "ローグタウンで処刑される", description: "自首し処刑。最期の言葉が大海賊時代を招いた。", start_year: 1500, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 21, name: "ロジャーの処刑を見届ける", description: "見習いとしてロジャーの最期を見届ける。", start_year: 1500, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 22, name: "ルフィに麦わら帽子を託す", description: "フーシャ村を発つ際、幼いルフィに帽子を預ける。", start_year: 1512, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 23, name: "頂上戦争を終結させる", description: "マリンフォードに現れ、戦争に終止符を打つ。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 24, name: "ゴムゴムの実を食べる", description: "シャンクスの一味の宝を食べ、ゴム人間に。", start_year: 1512, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 25, name: "東の海を出航（冒険の始まり）", description: "17歳、海賊王を目指して航海へ。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 26, name: "頂上戦争でエースを失う", description: "マリンフォードで兄エースを失う。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 27, name: "2年の修行を経て新世界へ", description: "再集結し、後半の海へ乗り出す。", start_year: 1524, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  // 麦わらの一味 各メンバーのイベント（id 28..44）
  { id: 28, name: "ゾロ、一味に加わる", description: "ルフィに勧誘され海賊狩りが仲間に。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 29, name: "くいなとの約束", description: "世界一の大剣豪になる誓いを立てる。", start_year: 1512, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 30, name: "ナミ、一味に加わる", description: "アーロンの支配から解放され航海士に。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 31, name: "ベルメールの死", description: "義母ベルメールを失い、村を守る道を選ぶ。", start_year: 1513, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 32, name: "ウソップ、一味に加わる", description: "カヤと村を守り、海へ出て狙撃手に。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 33, name: "そげキングを名乗る", description: "仲間を救うため覆面のヒーローに変身。", start_year: 1522, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 34, name: "サンジ、一味に加わる", description: "バラティエを離れ、オールブルーを求め航海へ。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 35, name: "ゼフとの日々", description: "海上レストランでゼフに料理と生き方を学ぶ。", start_year: 1513, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 36, name: "チョッパー、一味に加わる", description: "ドラム島を発ち、船医として仲間に。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 37, name: "Dr.ヒルルクの死", description: "恩人ヒルルクを失い、医者を志す。", start_year: 1520, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 38, name: "ロビン、一味に加わる", description: "「生きたい」と願い、仲間に迎えられる。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 39, name: "フランキー、一味に加わる", description: "サニー号を託し、船大工として乗船。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 40, name: "恩人トムの意志を継ぐ", description: "師トムの犠牲を胸に、船造りに生きる。", start_year: 1510, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 41, name: "ブルック、一味に加わる", description: "スリラーバークで影を取り戻し、音楽家に。", start_year: 1522, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 42, name: "仲間との再会の約束", description: "かつての海賊団を失い、ラブーンとの約束を胸に。", start_year: 1474, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 43, name: "ジンベエ、一味に加わる", description: "ワノ国で正式に操舵手として加入。", start_year: 1524, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 44, name: "王下七武海となる", description: "魚人島を守るため世界政府と手を結ぶ。", start_year: 1500, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  // シャンクスのイベント（id 45..52）
  { id: 45, name: "ゴッドバレーで拾われる", description: "母マグノリアを失い、双子の兄シャムロックはマリージョアへ。見落とされた赤子シャンクスは宝箱の中でロジャー海賊団に拾われた。", start_year: 1486, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 46, name: "ロジャー海賊団の見習いに", description: "バギーと共にロジャー海賊団の見習い船員として育つ。", start_year: 1494, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 47, name: "ロジャーから麦わら帽子を継ぐ", description: "海賊王ロジャーの形見となる麦わら帽子を受け継ぐ。", start_year: 1500, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 48, name: "黒ひげに左目の傷を負わされる", description: "マーシャル・D・ティーチとの戦いで左目に三本の傷を負う。", start_year: 1510, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 49, name: "ルフィを救い左腕を失う", description: "フーシャ村で幼いルフィを海王類から守り、左腕を失う。", start_year: 1512, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 50, name: "四皇に上り詰める", description: "赤髪海賊団を率い、世界最強の海賊「四皇」の一角となる。", start_year: 1515, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 51, name: "白ひげと会談する", description: "白ひげを訪ね、ティーチとエースを巡り忠告する。", start_year: 1521, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 52, name: "天竜人フィガーランド家に生まれる", description: "五老星フィガーランド・ガーリングを父に持つ天竜人の血筋に、双子の兄シャムロックと共に生まれる。", start_year: 1485, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 53, name: "神の騎士団として活動する", description: "神の騎士団として活動。浅海契約を結ぶ。", start_year: 1509, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  // ゴッドバレー事件（1486）の関係者イベント（id 54..58）
  { id: 54, name: "ゴッドバレー事件でロックス海賊団が壊滅", description: "ゴッドバレー事件でロジャーとガープの共闘に敗れ、船団が離散した。", start_year: 1486, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 55, name: "ゴッドバレー事件で討たれる", description: "ゴッドバレーでロジャー・ガープ連合に敗れ、命を落とす。", start_year: 1486, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 56, name: "ゴッドバレーでロックス海賊団を撃破", description: "ガープと手を組み、最凶のロックス海賊団を壊滅させた。", start_year: 1486, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 57, name: "ゴッドバレー事件で海軍の英雄となる", description: "ロジャーと共闘しロックスを討ち、「海軍の英雄」と讃えられる。", start_year: 1486, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  { id: 58, name: "ゴッドバレー事件に参戦する", description: "海軍としてゴッドバレー事件に参戦し、ロックス討伐に加わる。", start_year: 1486, end_year: null, is_approximate: false, category_id: null, importance: 3 },
  // ゴッドバレー事件の追加詳細（id 59..62）
  { id: 59, name: "ゴッドバレーでシャンクスを救おうと奔走", description: "海兵として、母マグノリアから託された双子を救うため奔走。赤子シャンクスを逃がそうとした。", start_year: 1486, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 60, name: "ゴッドバレーで奴隷たちを鼓舞し脱出", description: "囚われた奴隷たちを鼓舞し、島からの脱出を導いた。", start_year: 1486, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 61, name: "ニキュニキュの実を食べ奴隷を逃がす", description: "ニキュニキュの実の力に目覚め、幼い黒ひげや奴隷たちを島から逃がした。", start_year: 1486, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 62, name: "ビッグマムからウオウオの実を奪い食べる", description: "ビッグマムが運んでいたウオウオの実 幻獣種（青龍）を奪い、自らの力とした。", start_year: 1486, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  // フィッシャー・タイガー関連（id 63..66）
  { id: 63, name: "タイヨウの海賊団を結成", description: "魚人・人魚を率いる海賊団を旗揚げした。", start_year: 1504, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 64, name: "マリージョアを襲撃し奴隷を解放", description: "単身聖地マリージョアに攻め入り、囚われた奴隷たちを解放した。", start_year: 1506, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 65, name: "人間の血の輸血を拒み死す", description: "負傷後、人間の血の輸血を拒否して命を落とした。", start_year: 1507, end_year: null, is_approximate: true, category_id: null, importance: 3 },
  { id: 66, name: "マリージョアで奴隷から解放される", description: "フィッシャー・タイガーのマリージョア襲撃により、姉妹と共に奴隷の身から解放された。", start_year: 1506, end_year: null, is_approximate: true, category_id: null, importance: 3 },
];
