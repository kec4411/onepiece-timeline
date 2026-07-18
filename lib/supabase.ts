import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 環境変数が未設定でも開発を止めないよう、未設定時は null を返す。
// （app/page.tsx は client === null のときローカルのシードデータにフォールバックする）
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
