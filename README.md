# ONE PIECE 年表（Gantt タイムライン）

作中暦の絶対年を横軸に、キャラの生涯と出来事を Gantt 風に表示する Web アプリ。
Next.js (App Router) + Supabase + Vercel。

現在は **MVP（縦スライス最小構成）**: `Supabase(DB) → 取得 → Gantt 描画` を一気通貫で動かす段階。
Supabase 未接続でも `lib/seed.ts` のサンプルデータで表示されます。

## セットアップ

```bash
npm install
npm run dev      # http://localhost:3000
```

Supabase 未設定のうちはサンプルデータが表示されます（画面上部に案内バナー）。

## Supabase に接続する

1. [supabase.com](https://supabase.com) でプロジェクトを作成。
2. **SQL Editor** で [`supabase/schema.sql`](supabase/schema.sql) を実行（テーブル作成・RLS 公開 read ポリシー）、
   続けて [`supabase/seed.sql`](supabase/seed.sql) を実行（実データ投入。既存データがある場合は入れ替わります）。
3. **Project Settings → API** の URL と anon key を `.env.local` に設定:

   ```bash
   cp .env.local.example .env.local
   # SUPABASE_URL, SUPABASE_ANON_KEY を記入
   ```

4. `npm run dev` を再起動 → データソースが Supabase に切り替わります
   （フッターの「データソース」表示で確認できます）。

## デプロイ（Vercel）

1. GitHub にリポジトリを push。
2. Vercel で Import し、Environment Variables に
   `SUPABASE_URL` / `SUPABASE_ANON_KEY` を設定。
3. Deploy。

## 構成

| パス | 役割 |
| --- | --- |
| `app/page.tsx` | データ取得（Supabase or サンプル）＋ Gantt 表示（Server Component） |
| `components/GanttChart.tsx` | Gantt 本体。年→X の自前スケールで SVG 描画（静的） |
| `lib/supabase.ts` | Supabase クライアント（未設定時は null → サンプルへフォールバック） |
| `lib/time.ts` | 年↔暦の変換・線形スケール・目盛り生成 |
| `lib/seed.ts` | ローカル・フォールバック用サンプルデータ |
| `types/db.ts` | DB 行の型（将来 `supabase gen types` に置換可） |
| `supabase/schema.sql` | テーブル定義 + RLS + シード |

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
