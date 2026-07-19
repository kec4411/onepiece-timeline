import TimelineView from "@/components/TimelineView";
import { getSupabase } from "@/lib/supabase";
import { getPool } from "@/lib/db";
import { seedCalendars, seedCharacters, seedEvents } from "@/lib/seed";
import type { Calendar, Character, EventRow } from "@/types/db";

// 常に最新を読む（キャッシュしない）。MVP では十分。
export const dynamic = "force-dynamic";

type Source = "postgres" | "supabase" | "seed";
type Loaded = { calendars: Calendar[]; characters: Character[]; events: EventRow[]; source: Source };

const seed: Loaded = {
  calendars: seedCalendars,
  characters: seedCharacters,
  events: seedEvents,
  source: "seed",
};

// データ取得の優先順位: ローカル Postgres(DATABASE_URL) → Supabase → seed。
async function loadData(): Promise<Loaded> {
  // 1) ローカル Docker の PostgreSQL（pg で直接接続）
  const pool = getPool();
  if (pool) {
    try {
      const [cal, chars, evs] = await Promise.all([
        pool.query("select * from calendars order by id"),
        pool.query("select * from characters order by birth_year"),
        pool.query("select * from events order by start_year"),
      ]);
      return {
        calendars: cal.rows as Calendar[],
        characters: chars.rows as Character[],
        events: evs.rows as EventRow[],
        source: "postgres",
      };
    } catch (e) {
      console.error("[loadData] Postgres 取得に失敗、次のソースへフォールバック:", e);
    }
  }

  // 2) Supabase（本番）
  const supabase = getSupabase();
  if (supabase) {
    const [cal, chars, evs] = await Promise.all([
      supabase.from("calendars").select("*").order("id"),
      supabase.from("characters").select("*").order("birth_year"),
      supabase.from("events").select("*").order("start_year"),
    ]);
    if (!cal.error && !chars.error && !evs.error) {
      return {
        calendars: cal.data as Calendar[],
        characters: chars.data as Character[],
        events: evs.data as EventRow[],
        source: "supabase",
      };
    }
  }

  // 3) ローカルサンプル
  return seed;
}

export default async function Home() {
  const { calendars, characters, events, source } = await loadData();

  return (
    <main className="w-full px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">ONE PIECE 年表</h1>
        <p className="mt-1 text-sm text-gray-500">
          作中暦の絶対年で、キャラの生涯と出来事を Gantt 表示（MVP）
        </p>
      </header>

      {source === "seed" && (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          DB 未接続のため、サンプルデータを表示しています。ローカルは <code>npm run dev</code>（Docker/PostgreSQL 自動起動）、
          本番は Supabase の環境変数を設定すると DB のデータに切り替わります。
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <TimelineView calendars={calendars} characters={characters} events={events} />
      </section>

      <footer className="mt-6 text-xs text-gray-400">
        データソース: {source === "postgres" ? "ローカルDB (PostgreSQL)" : source === "supabase" ? "Supabase" : "ローカルサンプル"}
      </footer>
    </main>
  );
}
