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
  name           text not null,   -- 呼び名（一般的な名。例: ルフィ / ゴールド・ロジャー）
  full_name      text,            -- 本名（フルネーム。例: モンキー・D・ルフィ）
  hidden_name    text,            -- 作中で判明した隠れた本名（例: ゴール・D・エース）。多くは null
  persona        text,            -- 宿る別人格と思われる名（例: 解放の戦士ニカ）。多くは null
  epithet        text,            -- 異名（例: 海賊王）
  birth_year     integer,
  death_year     integer,
  is_approximate boolean not null default false,
  image_url      text,
  notes          text,
  is_featured    boolean not null default false  -- 初期表示（検索前）に出す主要キャラ
);
-- 既存DBへの移行（列を後から追加）
alter table characters add column if not exists full_name   text;
alter table characters add column if not exists hidden_name text;
alter table characters add column if not exists persona     text;
alter table characters add column if not exists is_featured boolean not null default false;

-- 出来事のカテゴリ（アイコン=絵文字 / 色）
create table if not exists event_categories (
  id         bigint generated always as identity primary key,
  name       text not null,
  icon       text,        -- アイコンキー（hourglass/bank/bolt/swords/ship 等。フロントの CATEGORY_ICONS に対応）
  color      text,
  sort_order integer not null default 0
);

-- 出来事（範囲は start/end、点イベントは end_year を null に）
create table if not exists events (
  id             bigint generated always as identity primary key,
  name           text not null,
  description    text,
  start_year     integer not null,
  end_year       integer,
  is_approximate boolean not null default false,
  category_id    bigint references event_categories(id),
  importance     smallint not null default 3 check (importance between 1 and 5)
);

-- 既存DB（category text 時代）からの移行: category_id を追加し、旧 category 列を削除
alter table events add column if not exists category_id bigint references event_categories(id);
alter table events drop column if exists category;

-- 組織（海賊団・海軍・勢力など）
create table if not exists organizations (
  id          bigint generated always as identity primary key,
  name        text not null,
  kind        text,        -- 例: 海賊団 / 海軍 / 勢力 / 機関
  description text,
  color       text         -- 将来の色分け用（任意）
);

-- キャラ ↔ 組織（多対多。1人が複数所属：例 おでん＝ロジャー/白ひげ/光月家）
create table if not exists character_organizations (
  character_id    bigint not null references characters(id)    on delete cascade,
  organization_id bigint not null references organizations(id) on delete cascade,
  role            text,        -- 例: 船長 / 副船長 / 隊長 / 剣士
  sort_order      integer not null default 0,
  primary key (character_id, organization_id)
);

-- キャラ ↔ 出来事(events) の中間テーブル。イベントの実態は events が持つ。
-- character_id = 0 は「ワンピース世界の出来事」（特定キャラに紐づかない）を表す。
-- （旧: name/year 等を持つ実体テーブル → 中間テーブルへ構造変更のため作り直す）
drop table if exists character_events;
create table character_events (
  character_id bigint not null,                                   -- 0 = 世界の出来事 / それ以外は characters.id
  event_id     bigint not null references events(id) on delete cascade,
  sort_order   integer not null default 0,
  primary key (character_id, event_id)
);

-- ── RLS: 公開read（書き込みは当面なし） ──────────────────
alter table calendars               enable row level security;
alter table characters              enable row level security;
alter table events                  enable row level security;
alter table event_categories        enable row level security;
alter table organizations           enable row level security;
alter table character_organizations enable row level security;
alter table character_events        enable row level security;

drop policy if exists "public read calendars"               on calendars;
drop policy if exists "public read characters"              on characters;
drop policy if exists "public read events"                  on events;
drop policy if exists "public read event_categories"        on event_categories;
drop policy if exists "public read organizations"           on organizations;
drop policy if exists "public read character_organizations" on character_organizations;
drop policy if exists "public read character_events"        on character_events;

create policy "public read calendars"               on calendars               for select using (true);
create policy "public read characters"              on characters              for select using (true);
create policy "public read events"                  on events                  for select using (true);
create policy "public read event_categories"        on event_categories        for select using (true);
create policy "public read organizations"           on organizations           for select using (true);
create policy "public read character_organizations" on character_organizations for select using (true);
create policy "public read character_events"        on character_events        for select using (true);

-- ── データ投入 ──────────────────────────────────────────
-- データは supabase/seed.sql を実行してください（実データ。TRUNCATE→INSERT）。
