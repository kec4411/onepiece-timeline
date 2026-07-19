# ONE PIECE 年表（Gantt タイムライン）

作中暦の絶対年を横軸に、キャラの生涯と出来事を Gantt 風に表示する Web アプリ。
Next.js (App Router) + PostgreSQL/Supabase + Vercel。

**データ取得の優先順位**: `DATABASE_URL`(ローカル Postgres) → Supabase → `lib/seed.ts`(サンプル)。
ローカル開発は Docker の PostgreSQL、本番(Vercel)は Supabase を使います。

## セットアップ（ローカル / Docker）

**前提**: Docker Desktop（または Docker Engine）が起動していること。

```bash
npm install
cp .env.local.example .env.local   # DATABASE_URL がローカル Postgres を指す
npm run dev                        # PostgreSQL コンテナ起動 → http://localhost:3000
```

`npm run dev` は Docker の PostgreSQL を起動してから Next.js を立ち上げます。
コンテナ**初回起動時のみ** [`supabase/schema.sql`](supabase/schema.sql) → [`supabase/seed.sql`](supabase/seed.sql)
が自動投入されます。フッターの「データソース」が **ローカルDB (PostgreSQL)** になれば成功です。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Postgres 起動 ＋ Next.js dev |
| `npm run dev:app` | Next.js dev のみ（DB を起動しない） |
| `npm run db:up` / `db:down` | Postgres の起動 / 停止 |
| `npm run db:reset` | **データを初期化**して再投入（seed.sql を変更したら実行） |

> `schema.sql`/`seed.sql` を編集した内容を反映するには `npm run db:reset`（ボリュームを作り直して再投入）。

## Supabase に接続する（本番 or クラウドで開発）

1. [supabase.com](https://supabase.com) でプロジェクトを作成。
2. **SQL Editor** で [`supabase/schema.sql`](supabase/schema.sql)（テーブル作成・RLS 公開 read ポリシー）、
   続けて [`supabase/seed.sql`](supabase/seed.sql)（実データ投入。既存データは入れ替わります）を実行。
3. **Project Settings → API** の URL と anon key を環境変数に設定:
   - ローカルでクラウドを使う場合は `.env.local` の `DATABASE_URL` をコメントアウトし、
     `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定。
   - 本番は Vercel の環境変数に設定。

## デプロイ（Vercel）

1. GitHub にリポジトリを push。
2. Vercel で Import し、Environment Variables に
   `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定。
3. Deploy。

## 構成

| パス | 役割 |
| --- | --- |
| `docker-compose.yml` | ローカル開発用 PostgreSQL（初回に schema→seed 自動投入） |
| `app/page.tsx` | データ取得（Postgres→Supabase→サンプル）＋ Gantt 表示（Server Component） |
| `components/GanttChart.tsx` | Gantt 本体。ズーム/パン・ホバー/タップ詳細・レスポンシブ（client） |
| `components/TimelineView.tsx` | 暦切替・レイヤー/カテゴリのフィルタ UI（client） |
| `lib/db.ts` | ローカル Postgres への接続（`pg` Pool、`DATABASE_URL` 使用） |
| `lib/supabase.ts` | Supabase クライアント（本番。未設定時は null） |
| `lib/time.ts` | 年↔暦の変換・線形スケール・目盛り生成 |
| `lib/seed.ts` | DB 未接続時のフォールバック用データ |
| `types/db.ts` | DB 行の型 |
| `supabase/schema.sql` | テーブル定義 + RLS（organizations・character_organizations 含む） |
| `supabase/seed.sql` | 実データ（TRUNCATE→INSERT） |

**データモデル**: `characters`（生涯）/ `events`（出来事）/ `calendars`（暦）に加え、
`organizations`（海賊団・海軍など）と中間テーブル `character_organizations`（キャラ↔組織の多対多。
例: おでん＝ロジャー海賊団＋白ひげ海賊団＋光月家）。所属はツールチップに表示し、
**キャラのバーは主所属の組織カラーで着色**、**組織でのグループ化/フィルタ**にも対応。
出来事は `event_categories`（カテゴリ＋アイコン絵文字）を `category_id` で参照し、
**点イベント（`end_year` が null）はカテゴリのアイコンで表示**。

## 時間の考え方

- すべての年は **canonical な整数の年**で保持（空白世紀など古代も同一軸）。
- 表示用の暦（海円暦 / 天暦 …）は `calendars.offset_from_canonical` で加算変換。
- 曖昧な年（「約◯年前」）は `is_approximate` で表現。

> **ONE PIECE に公式な絶対年は存在しません。** 原作で確かなのは相対年（「空白の100年＝900〜800年前」
> 「ロジャー処刑＝現在の24年前」など）です。本データは「物語現在(タイムスキップ後)＝海円暦1524年」に
> 固定し `canonical = 1524 − 現在からの年数` で格納しています。**相対的な間隔は原作準拠で正確／
> 絶対数値は便宜設定**です（出典: One Piece Wiki 他）。

## 次の拡張（MVP 後）

暦切替 UI / ズーム・パン / フィルタ（category・importance）/
`sagas`・`arcs`・`event_participants` 追加 / データ入力 UI / 型の自動生成。
