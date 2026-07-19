"use client";

import { useState } from "react";
import GanttChart from "@/components/GanttChart";
import type { Calendar, Character, EventRow } from "@/types/db";

type Props = {
  calendars: Calendar[];
  characters: Character[];
  events: EventRow[];
};

// 暦の切り替え UI ＋ Gantt。暦を変えても canonical年のバー位置は不変で、
// 軸ラベルだけがオフセット分ずれる（＝「暦の違い」の正しい表現）。
export default function TimelineView({ calendars, characters, events }: Props) {
  const [selectedId, setSelectedId] = useState<number | undefined>(calendars[0]?.id);
  const selected = calendars.find((c) => c.id === selectedId) ?? calendars[0];

  return (
    <div>
      {calendars.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">暦:</span>
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
                    (active
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800")
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

      <GanttChart
        calendars={calendars}
        characters={characters}
        events={events}
        calendarId={selected?.id}
      />
    </div>
  );
}
