import TimelineView from "@/components/TimelineView";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { seedCalendars, seedCharacters, seedEvents } from "@/lib/seed";
import type { Calendar, Character, EventRow } from "@/types/db";

// 常に最新を読む（キャッシュしない）。MVP では十分。
export const dynamic = "force-dynamic";

async function loadData(): Promise<{
  calendars: Calendar[];
  characters: Character[];
  events: EventRow[];
  source: "supabase" | "seed";
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { calendars: seedCalendars, characters: seedCharacters, events: seedEvents, source: "seed" };
  }

  const [cal, chars, evs] = await Promise.all([
    supabase.from("calendars").select("*").order("id"),
    supabase.from("characters").select("*").order("birth_year"),
    supabase.from("events").select("*").order("start_year"),
  ]);

  // 取得に失敗（テーブル未作成など）した場合もシードにフォールバックして画面を保つ
  if (cal.error || chars.error || evs.error) {
    return { calendars: seedCalendars, characters: seedCharacters, events: seedEvents, source: "seed" };
  }

  return {
    calendars: cal.data as Calendar[],
    characters: chars.data as Character[],
    events: evs.data as EventRow[],
    source: "supabase",
  };
}

export default async function Home() {
  const { calendars, characters, events, source } = await loadData();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">ONE PIECE 年表</h1>
        <p className="mt-1 text-sm text-gray-500">
          作中暦の絶対年で、キャラの生涯と出来事を Gantt 表示（MVP）
        </p>
      </header>

      {source === "seed" && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {isSupabaseConfigured
            ? "Supabase からの取得に失敗したため、サンプルデータを表示しています（テーブル未作成の可能性）。"
            : "Supabase 未接続のため、サンプルデータを表示しています。.env.local を設定すると DB のデータに切り替わります。"}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <TimelineView calendars={calendars} characters={characters} events={events} />
      </section>

      <footer className="mt-6 text-xs text-gray-400">
        データソース: {source === "supabase" ? "Supabase" : "ローカルサンプル"}
      </footer>
    </main>
  );
}
