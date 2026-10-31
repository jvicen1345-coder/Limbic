"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";
import {
  CALENDAR_FILTERS,
  CALENDAR_FILTER_LABEL,
  CALENDAR_VIEWS,
  filterBucketForKind,
  type CalendarEvent,
  type CalendarFilter,
  type CalendarView,
  type UserCreatedCalendarEvent,
} from "@/lib/calendar-events";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarWeekView } from "./CalendarWeekView";
import { CalendarListView } from "./CalendarListView";
import { CalendarDetailPanel } from "./CalendarDetailPanel";
import { AddEventModal } from "./AddEventModal";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function CalendarPageClient({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [view, setView] = useState<CalendarView>("month");
  const [filter, setFilter] = useState<CalendarFilter>("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Kept in sync with selectedDate whenever it's non-null, so the detail panel still has
  // real content to slide out with after selectedDate itself goes back to null on close —
  // see CalendarDetailPanel's own doc comment, and lib/use-exit-animation.ts.
  const [lastSelectedDate, setLastSelectedDate] = useState<string | null>(null);
  if (selectedDate !== null && selectedDate !== lastSelectedDate) setLastSelectedDate(selectedDate);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditingEvent, setModalEditingEvent] = useState<UserCreatedCalendarEvent | null>(null);

  const filteredEvents = useMemo(
    () => (filter === "all" ? events : events.filter((e) => filterBucketForKind(e.kind) === filter)),
    [events, filter]
  );

  const refresh = () => startTransition(() => router.refresh());

  const openDate = (iso: string) => setSelectedDate(iso);
  const openEvent = (event: CalendarEvent) => setSelectedDate(event.date);

  const now = new Date();
  const monthLabel = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekStart = startOfWeek(now);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="screen-pad">
      <div className="cal-page-header">
        <div className="cal-page-title-row">
          <h1 className="cal-page-title">Limbic Calendar</h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setModalEditingEvent(null);
              setModalOpen(true);
            }}
          >
            <PlusIcon size={14} /> Add Event
          </button>
        </div>

        <div className="cal-controls-row">
          {view !== "list" ? (
            <div className="cal-month-nav">
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label={view === "month" ? "Previous month" : "Previous week"}
                onClick={() => (view === "month" ? setMonthOffset((v) => v - 1) : setWeekOffset((v) => v - 1))}
              >
                <ChevronLeftIcon size={14} />
              </button>
              <div className="cal-month-label">{view === "month" ? monthLabel : weekLabel}</div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label={view === "month" ? "Next month" : "Next week"}
                onClick={() => (view === "month" ? setMonthOffset((v) => v + 1) : setWeekOffset((v) => v + 1))}
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="pill-tabs cal-view-toggle">
            {CALENDAR_VIEWS.map((v) => (
              <button key={v.id} type="button" className={`pill-tab${view === v.id ? " active" : ""}`} onClick={() => setView(v.id)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cal-filter-row">
          {CALENDAR_FILTERS.map((f) => (
            <button key={f} type="button" className={`cal-filter-chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {CALENDAR_FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <CalendarMonthView key={monthOffset} events={filteredEvents} monthOffset={monthOffset} onSelectDate={openDate} onSelectEvent={openEvent} />
      )}
      {view === "week" && <CalendarWeekView key={weekOffset} events={filteredEvents} weekOffset={weekOffset} onSelectEvent={openEvent} />}
      {view === "list" && <CalendarListView events={filteredEvents} onSelectEvent={openEvent} />}

      <CalendarDetailPanel
        open={selectedDate !== null}
        date={lastSelectedDate}
        events={lastSelectedDate ? events.filter((e) => e.date === lastSelectedDate) : []}
        onClose={() => setSelectedDate(null)}
        onEditUserEvent={(event) => {
          setModalEditingEvent(event);
          setModalOpen(true);
        }}
        onChanged={refresh}
      />

      <AddEventModal
        key={modalEditingEvent?.id ?? "new"}
        open={modalOpen}
        defaultDate={selectedDate ?? undefined}
        editingEvent={modalEditingEvent}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          refresh();
        }}
      />
    </div>
  );
}
