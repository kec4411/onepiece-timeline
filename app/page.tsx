import TimelineView from "@/components/TimelineView";
import { getSupabase } from "@/lib/supabase";
import { getPool } from "@/lib/db";
import { seedCalendars, seedCharacterEventLinks, seedCharacterOrganizations, seedCharacters, seedEventCategories, seedEvents, seedOrganizations } from "@/lib/seed";
import type { Calendar, Character, CharacterEventLink, CharacterMilestone, CharacterOrganization, EventCategory, EventRow, Organization } from "@/types/db";

// 常に最新を読む（キャッシュしない）。MVP では十分。
export const dynamic = "force-dynamic";

type Source = "postgres" | "supabase" | "seed";
type Loaded = { calendars: Calendar[]; characters: Character[]; events: EventRow[]; source: Source };

// organizations + junction をキャラに結合して orgs を付与する。
function attachOrgs(characters: Character[], orgs: Organization[], links: CharacterOrganization[]): Character[] {
  const orgById = new Map(orgs.map((o) => [o.id, o]));
  const byChar = new Map<number, CharacterOrganization[]>();
  for (const l of links) {
    if (!byChar.has(l.character_id)) byChar.set(l.character_id, []);
    byChar.get(l.character_id)!.push(l);
  }
  return characters.map((c) => ({
    ...c,
    orgs: (byChar.get(c.id) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => {
        const o = orgById.get(l.organization_id);
        return { name: o?.name ?? "", kind: o?.kind ?? null, role: l.role, color: o?.color ?? null };
      })
      .filter((o) => o.name),
  }));
}

// event_categories を events に結合して category を付与する。
function attachCategories(events: EventRow[], categories: EventCategory[]): EventRow[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return events.map((e) => ({ ...e, category: e.category_id != null ? byId.get(e.category_id) ?? null : null }));
}

// events + character_events(中間) から「世界の出来事(character_id=0)」と
// 各キャラの節目(character_id=N)を分離・整形する。
function buildFromLinks(characters: Character[], events: EventRow[], links: CharacterEventLink[]) {
  const eventById = new Map(events.map((e) => [e.id, e]));
  const worldIds = new Set<number>();
  const byChar = new Map<number, CharacterEventLink[]>();
  for (const l of links) {
    if (l.character_id === 0) worldIds.add(l.event_id);
    else (byChar.get(l.character_id) ?? byChar.set(l.character_id, []).get(l.character_id)!).push(l);
  }
  const worldEvents = events.filter((e) => worldIds.has(e.id));
  const withMilestones = characters.map((c) => ({
    ...c,
    events: (byChar.get(c.id) ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l): CharacterMilestone | null => {
        const e = eventById.get(l.event_id);
        return e ? { id: e.id, name: e.name, year: e.start_year, description: e.description } : null;
      })
      .filter((m): m is CharacterMilestone => m != null),
  }));
  return { worldEvents, withMilestones };
}

const seed: Loaded = (() => {
  const allEvents = attachCategories(seedEvents, seedEventCategories);
  const chars = attachOrgs(seedCharacters, seedOrganizations, seedCharacterOrganizations);
  const { worldEvents, withMilestones } = buildFromLinks(chars, allEvents, seedCharacterEventLinks);
  return { calendars: seedCalendars, characters: withMilestones, events: worldEvents, source: "seed" };
})();

// データ取得の優先順位: ローカル Postgres(DATABASE_URL) → Supabase → seed。
async function loadData(): Promise<Loaded> {
  // 1) ローカル Docker の PostgreSQL（pg で直接接続）
  const pool = getPool();
  if (pool) {
    try {
      const [cal, chars, evs, cats, orgs, links, cevs] = await Promise.all([
        pool.query("select * from calendars order by id"),
        pool.query("select * from characters order by birth_year"),
        pool.query("select * from events order by start_year"),
        pool.query("select * from event_categories order by sort_order"),
        pool.query("select * from organizations order by id"),
        pool.query("select * from character_organizations"),
        pool.query("select * from character_events"),
      ]);
      {
        const allEvents = attachCategories(evs.rows as EventRow[], cats.rows as EventCategory[]);
        const withOrgs = attachOrgs(chars.rows as Character[], orgs.rows as Organization[], links.rows as CharacterOrganization[]);
        const built = buildFromLinks(withOrgs, allEvents, cevs.rows as CharacterEventLink[]);
        return { calendars: cal.rows as Calendar[], characters: built.withMilestones, events: built.worldEvents, source: "postgres" };
      }
    } catch (e) {
      console.error("[loadData] Postgres 取得に失敗、次のソースへフォールバック:", e);
    }
  }

  // 2) Supabase（本番）
  const supabase = getSupabase();
  if (supabase) {
    const [cal, chars, evs, cats, orgs, links, cevs] = await Promise.all([
      supabase.from("calendars").select("*").order("id"),
      supabase.from("characters").select("*").order("birth_year"),
      supabase.from("events").select("*").order("start_year"),
      supabase.from("event_categories").select("*").order("sort_order"),
      supabase.from("organizations").select("*").order("id"),
      supabase.from("character_organizations").select("*"),
      supabase.from("character_events").select("*"),
    ]);
    if (!cal.error && !chars.error && !evs.error && !cats.error && !orgs.error && !links.error && !cevs.error) {
      const allEvents = attachCategories(evs.data as EventRow[], cats.data as EventCategory[]);
      const withOrgs = attachOrgs(chars.data as Character[], orgs.data as Organization[], links.data as CharacterOrganization[]);
      const built = buildFromLinks(withOrgs, allEvents, cevs.data as CharacterEventLink[]);
      return { calendars: cal.data as Calendar[], characters: built.withMilestones, events: built.worldEvents, source: "supabase" };
    }
  }

  // 3) ローカルサンプル
  return seed;
}

export default async function Home() {
  const { calendars, characters, events, source } = await loadData();
  // データソース表示は本番(Vercel production)のみ非表示。ローカル/プレビューでは表示。
  const showDataSource = process.env.VERCEL_ENV !== "production";

  return (
    <>
      {/* 全幅ヘッダーバー（半透明白＋ぼかし＋下線/影で背景から分離） */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 shadow-sm backdrop-blur-sm">
        <div className="px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">ONE PIECE 年表</h1>
        </div>
      </header>

      <main className="w-full px-4 py-8 sm:px-6 sm:py-10">
        {source === "seed" && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            DB 未接続のため、サンプルデータを表示しています。ローカルは <code>npm run dev</code>（Docker/PostgreSQL 自動起動）、
            本番は Supabase の環境変数を設定すると DB のデータに切り替わります。
          </div>
        )}

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <TimelineView calendars={calendars} characters={characters} events={events} />
        </section>

        {showDataSource && (
          <footer className="mt-6 text-xs text-gray-400">
            データソース: {source === "postgres" ? "ローカルDB (PostgreSQL)" : source === "supabase" ? "Supabase" : "ローカルサンプル"}
          </footer>
        )}
      </main>
    </>
  );
}
