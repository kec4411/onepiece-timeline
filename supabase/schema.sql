-- ワンピース年表: スキーマ + RLS(公開read) + サンプルシード
-- Supabase の SQL Editor に貼り付けて実行してください。
-- （MVP は calendars / characters / events のみ。sagas / arcs / event_participants は将来拡張）

-- ── テーブル ─────────────────────────────────────────────
-- 暦。表示年 = canonical年 + offset_from_canonical
create table if not exists calendars (
  id                    bigint generated always as identity primary key,
  name                  text not null,
  description           text,
  offset_from_canonical integer not null default 0
);

-- キャラクターの生涯（birth/death は canonical整数年、null 可）
create table if not exists characters (
  id             bigint generated always as identity primary key,
  name           text not null,
  epithet        text,
  birth_year     integer,
  death_year     integer,
  is_approximate boolean not null default false,
  image_url      text,
  notes          text
);

-- 出来事（範囲は start/end、点イベントは end_year を null に）
create table if not exists events (
  id             bigint generated always as identity primary key,
  name           text not null,
  description    text,
  start_year     integer not null,
  end_year       integer,
  is_approximate boolean not null default false,
  category       text,
  importance     smallint not null default 3 check (importance between 1 and 5)
);

-- ── RLS: 公開read（書き込みは当面なし） ──────────────────
alter table calendars  enable row level security;
alter table characters enable row level security;
alter table events     enable row level security;

drop policy if exists "public read calendars"  on calendars;
drop policy if exists "public read characters" on characters;
drop policy if exists "public read events"     on events;

create policy "public read calendars"  on calendars  for select using (true);
create policy "public read characters" on characters for select using (true);
create policy "public read events"     on events     for select using (true);

-- ── サンプルシード（プレースホルダ。正確値ではありません） ──
insert into calendars (name, description, offset_from_canonical) values
  ('海円暦', '作中の標準暦（基準）', 0),
  ('天暦',   'サンプル。実オフセットは要検証', -1120);

insert into characters (name, epithet, birth_year, death_year, is_approximate, notes) values
  ('ゴール・D・ロジャー', '海賊王',   1447, 1500, true, 'ひとつなぎの大秘宝に到達'),
  ('ニコ・ロビン',       '悪魔の子', 1494, null, true, 'オハラ出身の考古学者'),
  ('モンキー・D・ルフィ', '麦わら',   1505, null, true, '麦わらの一味 船長');

insert into events (name, description, start_year, end_year, is_approximate, category, importance) values
  ('空白の100年',               '歴史から消された100年間',        700,  800,  true,  '時代', 5),
  ('ロジャー処刑',              '海賊王の死と大海賊時代の幕開け',  1500, 1500, false, '事件', 5),
  ('オハラ壊滅（バスターコール）', '歴史の本文を研究したオハラへの掃討', 1502, 1502, true,  '事件', 4),
  ('ルフィ 東の海を出航',        '冒険の始まり',                    1522, 1522, true,  '冒険', 3),
  ('頂上戦争（マリンフォード）',   '白ひげ海賊団 vs 海軍',            1523, 1523, false, '戦争', 5);
