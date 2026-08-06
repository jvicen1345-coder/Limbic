"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { CAL_DOT_KIND_LABEL, daysUntil, WARNING_WINDOW_DAYS, type CalDot, type CalDotKind } from "@/lib/limbic-calendar";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DOT_ORDER: CalDotKind[] = ["personal", "platform", "community"];

function Legend() {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {DOT_ORDER.map((kind) => (
        <div key={kind} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className={`limbic-cal-dot limbic-cal-dot-${kind}`} />
          <span style={{ fontSize: 9.5, color: "var(--color-neutral-700)" }}>
            {kind === "personal" ? "Personal" : kind === "platform" ? "Platform" : "Community"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LimbicCalendarWidgetClient({
  dots,
  hasPersonalDates,
}: {
  dots: CalDot[];
  hasPersonalDates: boolean;
}) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dotsByDate = useMemo(() => {
    const map: Record<string, CalDot[]> = {};
    dots.forEach((d) => {
      (map[d.date] = map[d.date] || []).push(d);
    });
    return map;
  }, [dots]);

  const cells: { key: string; label: string; iso: string | null; dayDots: CalDot[] }[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ key: `pad-${i}`, label: "", iso: null, dayDots: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key: iso, label: String(d), iso, dayDots: dotsByDate[iso] || [] });
  }

  const selectedDots = selectedDate ? dotsByDate[selectedDate] || [] : [];
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
          const hasDots = cell.dayDots.length > 0;
          const kindsPresent = DOT_ORDER.filter((k) => cell.dayDots.some((d) => d.kind === k));
          const personalSoon =
            cell.iso != null &&
            cell.dayDots.some((d) => d.kind === "personal") &&
            daysUntil(cell.iso) >= 0 &&
            daysUntil(cell.iso) <= WARNING_WINDOW_DAYS;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={!hasDots}
              onClick={() => cell.iso && setSelectedDate(selectedDate === cell.iso ? null : cell.iso)}
              style={{
                position: "relative",
                border: "none",
                borderRadius: 999,
                width: "100%",
                aspectRatio: "1",
                fontSize: 10,
                cursor: hasDots ? "pointer" : "default",
                background: isSelected ? "var(--color-accent)" : hasDots ? "var(--color-neutral-100)" : "none",
                color: isSelected ? "var(--color-bg)" : "var(--color-text)",
                fontWeight: hasDots ? 700 : 400,
              }}
            >
              {cell.label}
              {kindsPresent.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 3,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 2,
                  }}
                >
                  {kindsPresent.map((k) => (
                    <span
                      key={k}
                      className={`limbic-cal-dot limbic-cal-dot-${k}${k === "personal" && personalSoon ? " limbic-cal-dot-glow" : ""}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        <Legend />
      </div>

      {!hasPersonalDates && (
        <div style={{ fontSize: 10, color: "var(--color-neutral-700)", marginTop: 8 }}>
          <Link href="/profile" style={{ color: "var(--color-accent-700)" }}>
            Add your professional dates in Profile Settings
          </Link>
        </div>
      )}

      {selectedDots.length > 0 && (
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
            {selectedDots.map((d) => (
              <div key={d.id} style={{ padding: "8px 10px", borderRadius: "var(--radius-lg)", background: "var(--color-neutral-100)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <span className={`limbic-cal-dot limbic-cal-dot-${d.kind}`} />
                  <span style={{ fontSize: 9.5, color: "var(--color-neutral-700)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {CAL_DOT_KIND_LABEL[d.kind]}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 12.5, lineHeight: 1.3, marginBottom: 4 }}>
                  {d.title}
                </div>
                {d.description && (
                  <div style={{ fontSize: 10.5, color: "var(--color-neutral-700)", marginBottom: d.href ? 6 : 0 }}>{d.description}</div>
                )}
                {d.href && (
                  <Link href={d.href} className="btn btn-primary" style={{ fontSize: 10.5, padding: "5px 10px", display: "inline-block" }}>
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--color-neutral-200)", marginTop: 10, paddingTop: 8, textAlign: "right" }}>
        <Link href="/calendar" style={{ fontSize: 10.5, color: "var(--color-accent-700)" }}>
          → View full calendar
        </Link>
      </div>
    </div>
  );
}
