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

-- ── データ投入 ──────────────────────────────────────────
-- データは supabase/seed.sql を実行してください（実データ。TRUNCATE→INSERT）。
