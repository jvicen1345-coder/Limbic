"use client";

import { useMemo } from "react";
import { filterBucketForKind, type CalendarEvent } from "@/lib/calendar-events";
import { dateToLocalIso, daysRemainingOrPastDue } from "@/lib/limbic-calendar";
import { todayLocalDateStr } from "@/lib/today";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function eventMeta(event: CalendarEvent): string {
  switch (event.kind) {
    case "personal":
      return `${event.countdownVerb} ${daysRemainingOrPastDue(event.date)}`;
    case "platform":
      return `${event.source} · ${event.readMins} min`;
    case "community":
      return event.authorName;
    case "user":
      return event.type;
  }
}

export function CalendarWeekView({
  events,
  weekOffset,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  weekOffset: number;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const today = todayLocalDateStr();

  const days = useMemo(() => {
    const base = startOfWeek(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      (map[e.date] = map[e.date] || []).push(e);
    });
    return map;
  }, [events]);

  return (
    <div className="cal-month-fade cal-week-scroll">
      <div className="cal-week-grid">
        {days.map((d) => {
          const iso = dateToLocalIso(d);
          const dayEvents = eventsByDate[iso] || [];
          const isToday = iso === today;
          return (
            <div key={iso} className="cal-week-col">
              <div className={`cal-week-col-header${isToday ? " cal-cell-today" : ""}`}>
                <div className="cal-week-weekday">{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className="cal-week-daynum">{d.getDate()}</div>
              </div>
              {dayEvents.length === 0 ? (
                <div className="cal-week-empty">No events</div>
              ) : (
                dayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={`cal-week-event-card cal-pill-${filterBucketForKind(ev.kind)}`}
                    onClick={() => onSelectEvent(ev)}
                  >
                    <div className="cal-week-event-title">{ev.title}</div>
                    <div className="cal-week-event-meta">{eventMeta(ev)}</div>
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
