import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase 呼び出しはサーバー側（Server Component）のみ。
// サーバー実行時に読むランタイム環境変数を優先し、後方互換で NEXT_PUBLIC_ も読む。
//   - SUPABASE_URL / SUPABASE_ANON_KEY   … 実行時に読む（推奨。再ビルド不要で反映）
//   - NEXT_PUBLIC_*                       … ビルド時に焼き込まれる（互換のため許容）
// 環境変数が未設定でも開発を止めないよう、未設定時は null を返す。
// （app/page.tsx は client === null のときローカルのシードデータにフォールバックする）
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
