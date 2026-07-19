"use client";

import { useMemo, useState } from "react";
import GanttChart from "@/components/GanttChart";
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

  // 出来事カテゴリ（データから抽出）。未選択セットで「除外」を管理し、初期は全表示。
  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category).filter((c): c is string => !!c))).sort(),
    [events],
  );
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (c: string) =>
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  // フィルタ適用
  const filteredCharacters = showCharacters ? characters : [];
  const filteredEvents = showEvents
    ? events.filter((e) => !e.category || !hiddenCategories.has(e.category))
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
              <Chip key={c} active={!hiddenCategories.has(c)} onClick={() => toggleCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <GanttChart
        calendars={calendars}
        characters={filteredCharacters}
        events={filteredEvents}
        calendarId={selected?.id}
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
