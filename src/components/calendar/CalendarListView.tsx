"use client";

import { useMemo, useState } from "react";
import { filterBucketForKind, type CalendarEvent } from "@/lib/calendar-events";
import { CAL_DOT_KIND_LABEL, daysRemainingOrPastDue } from "@/lib/limbic-calendar";
import { todayLocalDateStr } from "@/lib/today";

function eventTypeLabel(event: CalendarEvent): string {
  return event.kind === "user" ? event.type : CAL_DOT_KIND_LABEL[event.kind];
}

function eventDescription(event: CalendarEvent): string | null {
  switch (event.kind) {
    case "personal":
      return `${event.countdownVerb} ${daysRemainingOrPastDue(event.date)}`;
    case "platform":
      return `${event.source} · ${event.readMins} min read`;
    case "community":
      return event.bodyPreview;
    case "user":
      return event.notes;
  }
}

export function CalendarListView({
  events,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const [showPast, setShowPast] = useState(false);
  const today = todayLocalDateStr();

  const sections = useMemo(() => {
    const visible = events.filter((e) => showPast || e.date >= today);
    const byDate = new Map<string, CalendarEvent[]>();
    visible.forEach((e) => {
      const list = byDate.get(e.date) ?? [];
      list.push(e);
      byDate.set(e.date, list);
    });
    return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [events, showPast, today]);

  if (sections.length === 0) {
    return (
      <div className="cal-list-empty">
        No upcoming events.
        {!showPast && (
          <div style={{ marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowPast(true)}>
              Show past events
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cal-month-fade">
      {sections.map(([date, dayEvents]) => (
        <div key={date} className="cal-list-section">
          <div className="cal-list-date-header">
            {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
          {dayEvents.map((ev) => {
            const description = eventDescription(ev);
            return (
              <button key={ev.id} type="button" className="cal-list-event" onClick={() => onSelectEvent(ev)}>
                <span className={`cal-list-event-dot limbic-cal-dot-${filterBucketForKind(ev.kind)}`} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="cal-list-event-title">{ev.title}</span>
                  <div className="cal-list-event-meta">
                    {eventTypeLabel(ev)} · {daysRemainingOrPastDue(ev.date)}
                  </div>
                  {description && <div className="cal-list-event-desc">{description}</div>}
                </span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="cal-list-toggle-row">
        <button type="button" className="btn btn-ghost" onClick={() => setShowPast((v) => !v)}>
          {showPast ? "Hide past events" : "Show past events"}
        </button>
      </div>
    </div>
  );
}
