"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export interface CeEvent {
  id: string;
  date: string;
  title: string;
  source: string;
  readMins: number;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarCard({ events }: { events: CeEvent[] }) {
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map: Record<string, CeEvent[]> = {};
    events.forEach((e) => {
      (map[e.date] = map[e.date] || []).push(e);
    });
    return map;
  }, [events]);

  const cells: { key: string; label: string; iso: string | null; hasEvent: boolean }[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ key: `pad-${i}`, label: "", iso: null, hasEvent: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key: iso, label: String(d), iso, hasEvent: !!eventsByDate[iso] });
  }

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const selectedLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-label="Previous month"
          style={{ width: 22, height: 22 }}
          onClick={() => {
            setMonthOffset((v) => v - 1);
            setSelectedDate(null);
          }}
        >
          <ChevronLeftIcon size={12} />
        </button>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 12.5 }}>{monthLabel}</div>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-label="Next month"
          style={{ width: 22, height: 22 }}
          onClick={() => {
            setMonthOffset((v) => v + 1);
            setSelectedDate(null);
          }}
        >
          <ChevronRightIcon size={12} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 2 }}>
        {WEEKDAY_LABELS.map((wd, i) => (
          <div key={i} style={{ fontSize: 8.5, textAlign: "center", color: "var(--color-neutral-700)" }}>
            {wd}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {cells.map((cell) => {
          const isSelected = cell.iso != null && cell.iso === selectedDate;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!cell.hasEvent}
              onClick={() => cell.iso && setSelectedDate(selectedDate === cell.iso ? null : cell.iso)}
              style={{
                border: "none",
                borderRadius: 999,
                width: "100%",
                aspectRatio: "1",
                fontSize: 10,
                cursor: cell.hasEvent ? "pointer" : "default",
                background: isSelected
                  ? "var(--color-accent)"
                  : cell.hasEvent
                  ? "var(--color-accent-100)"
                  : "none",
                color: isSelected
                  ? "var(--color-bg)"
                  : cell.hasEvent
                  ? "var(--color-accent-700)"
                  : "var(--color-text)",
                fontWeight: cell.hasEvent ? 700 : 400,
                opacity: 1,
              }}
            >
              {cell.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--color-accent)" }} />
        <span style={{ fontSize: 9.5, color: "var(--color-neutral-700)" }}>CE & event dates</span>
      </div>

      {selectedEvents.length > 0 && (
        <div style={{ borderTop: "1px solid var(--color-neutral-200)", marginTop: 10, paddingTop: 10 }}>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-neutral-700)",
              marginBottom: 6,
            }}
          >
            {selectedLabel}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {selectedEvents.map((ev) => (
              <div key={ev.id} style={{ padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "var(--color-neutral-100)" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 12.5, lineHeight: 1.3, marginBottom: 4 }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: 9.5, color: "var(--color-neutral-700)", marginBottom: 6 }}>
                  {ev.source} · {ev.readMins} min
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: 10.5, padding: "5px 10px" }}
                  onClick={() => router.push(`/article/${ev.id}`)}
                >
                  View & sign up
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
