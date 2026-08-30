"use client";

import { useMemo } from "react";
import { EventPill } from "./EventPill";
import type { CalendarEvent } from "@/lib/calendar-events";
import { todayLocalDateStr } from "@/lib/today";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PILLS_PER_CELL = 3;

/** The day cell is a div (not a button) specifically so EventPill's real <button>s can
 *  nest inside it without producing invalid button-in-button HTML — role="button" +
 *  onKeyDown stand in for the semantics a real button would give for free. */
export function CalendarMonthView({
  events,
  monthOffset,
  onSelectDate,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  monthOffset: number;
  onSelectDate: (iso: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayLocalDateStr();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      (map[e.date] = map[e.date] || []).push(e);
    });
    return map;
  }, [events]);

  const cells: { key: string; iso: string | null; label: string }[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ key: `pad-lead-${i}`, iso: null, label: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key: iso, iso, label: String(d) });
  }
  // Pad the final week out to seven. Only the leading blanks used to be rendered, so the
  // trailing slots had no .cal-cell-empty in them at all and .cal-month-grid's own
  // background (--color-divider, which is what shows through its 1px gaps) painted straight
  // across them — a solid grey block against the leading blanks' page-coloured cells, i.e.
  // the same "not a day this month" state drawn two different ways in one grid. Real cells
  // also give the last row .cal-cell's min-height, instead of it collapsing to a stub about
  // half the height of every row above it.
  while (cells.length % 7 !== 0) cells.push({ key: `pad-trail-${cells.length}`, iso: null, label: "" });

  return (
    <div className="cal-month-fade" key={`${year}-${month}`}>
      <div className="cal-month-scroll">
        <div className="cal-month-weekdays">
          {WEEKDAY_LABELS.map((wd) => (
            <div key={wd} className="cal-month-weekday">
              {wd}
            </div>
          ))}
        </div>
        <div className="cal-month-grid">
          {cells.map((cell) => {
            if (!cell.iso) return <div key={cell.key} className="cal-cell cal-cell-empty" />;
            const iso = cell.iso;
            const dayEvents = eventsByDate[iso] || [];
            const visible = dayEvents.slice(0, MAX_PILLS_PER_CELL);
            const extra = dayEvents.length - visible.length;
            const isToday = iso === today;
            const isPast = iso < today;
            return (
              <div
                key={cell.key}
                role="button"
                tabIndex={0}
                className={`cal-cell${isToday ? " cal-cell-today" : ""}${isPast ? " cal-cell-past" : ""}`}
                onClick={() => onSelectDate(iso)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectDate(iso);
                }}
              >
                <span className="cal-cell-daynum">{cell.label}</span>
                {visible.map((ev) => (
                  <EventPill key={ev.id} event={ev} onClick={() => onSelectEvent(ev)} />
                ))}
                {extra > 0 && <span className="cal-more-indicator">+{extra} more</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
