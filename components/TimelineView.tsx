"use client";

import { useMemo, useState } from "react";
import GanttChart from "@/components/GanttChart";
import { CategoryIcon } from "@/lib/icons";
import type { Calendar, Character, EventRow } from "@/types/db";

type Props = {
  calendars: Calendar[];
  characters: Character[];
  events: EventRow[];
};

// 暦の切り替え ＋ 表示フィルタ（レイヤー / 出来事カテゴリ）＋ Gantt。
export default function TimelineView({ calendars, characters, events }: Props) {
  const [selectedId, setSelectedId] = useState<number | undefined>(calendars[0]?.id);
  const selected = calendars.find((c) => c.id === selectedId) ?? calendars[0];

  // レイヤー表示切替
  const [showCharacters, setShowCharacters] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  // 出来事カテゴリ（結合済み category から抽出。名前＋アイコン）。未選択セットで「除外」を管理。
  const categories = useMemo(() => {
    const seen = new Map<string, { icon: string | null; color: string | null }>();
    for (const e of events) {
      if (e.category && !seen.has(e.category.name)) seen.set(e.category.name, { icon: e.category.icon, color: e.category.color });
    }
    return [...seen.entries()].map(([name, v]) => ({ name, icon: v.icon, color: v.color }));
  }, [events]);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (c: string) =>
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  // 組織（各キャラの主所属 orgs[0] から抽出）。グループ化/フィルタの基準。
  const orgOptions = useMemo(() => {
    const seen = new Map<string, string | null>();
    for (const c of characters) {
      const p = c.orgs?.[0];
      if (p && !seen.has(p.name)) seen.set(p.name, p.color);
    }
    return [...seen.entries()].map(([name, color]) => ({ name, color }));
  }, [characters]);
  const [hiddenOrgs, setHiddenOrgs] = useState<Set<string>>(new Set());
  const [groupByOrg, setGroupByOrg] = useState(false);

  const toggleOrg = (name: string) =>
    setHiddenOrgs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // フィルタ適用（キャラは主所属で絞り込み。主所属が無いキャラは常に表示）
  const filteredCharacters = showCharacters
    ? characters.filter((c) => {
        const p = c.orgs?.[0];
        return !p || !hiddenOrgs.has(p.name);
      })
    : [];
  const filteredEvents = showEvents
    ? events.filter((e) => !e.category || !hiddenCategories.has(e.category.name))
    : [];

  return (
    <div>
      {/* コントロールバー */}
      <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4">
        {/* 暦切替 */}
        {calendars.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-sm text-gray-500">暦</span>
            <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
              {calendars.map((cal) => {
                const active = cal.id === selected?.id;
                return (
                  <button
                    key={cal.id}
                    type="button"
                    onClick={() => setSelectedId(cal.id)}
                    aria-pressed={active}
                    className={
                      "rounded px-3 py-1 text-sm font-medium transition-colors " +
                      (active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800")
                    }
                  >
                    {cal.name}
                  </button>
                );
              })}
            </div>
            {selected?.description && (
              <span className="text-xs text-gray-400">{selected.description}</span>
            )}
          </div>
        )}

        {/* レイヤー切替 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm text-gray-500">レイヤー</span>
          <Chip active={showCharacters} color="#2563eb" onClick={() => setShowCharacters((v) => !v)}>
            キャラの生涯
          </Chip>
          <Chip active={showEvents} color="#d97706" onClick={() => setShowEvents((v) => !v)}>
            出来事
          </Chip>
        </div>

        {/* カテゴリ絞り込み（出来事表示時のみ） */}
        {showEvents && categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-sm text-gray-500">カテゴリ</span>
            {categories.map((c) => (
              <Chip key={c.name} active={!hiddenCategories.has(c.name)} onClick={() => toggleCategory(c.name)}>
                <CategoryIcon iconKey={c.icon} color={c.color ?? "#6b7280"} size={13} />
                {c.name}
              </Chip>
            ))}
          </div>
        )}

        {/* 組織フィルタ ＋ グループ化トグル（キャラ表示時のみ） */}
        {showCharacters && orgOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-sm text-gray-500">組織</span>
            {orgOptions.map((o) => (
              <Chip key={o.name} active={!hiddenOrgs.has(o.name)} color={o.color ?? undefined} onClick={() => toggleOrg(o.name)}>
                {o.name}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => setGroupByOrg((v) => !v)}
              aria-pressed={groupByOrg}
              className={
                "ml-auto rounded-md border px-3 py-1 text-sm transition-colors " +
                (groupByOrg ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:text-gray-800")
              }
            >
              {groupByOrg ? "✓ " : ""}組織でグループ化
            </button>
          </div>
        )}
      </div>

      <GanttChart
        calendars={calendars}
        characters={filteredCharacters}
        events={filteredEvents}
        calendarId={selected?.id}
        groupByOrg={groupByOrg}
      />
    </div>
  );
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors " +
        (active
          ? "border-gray-300 bg-white text-gray-800"
          : "border-gray-200 bg-gray-50 text-gray-400 line-through")
      }
    >
      {color && (
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ background: active ? color : "#d1d5db" }}
        />
      )}
      {children}
    </button>
  );
}
