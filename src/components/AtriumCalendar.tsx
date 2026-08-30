"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { toggleAssignmentComplete } from "@/app/actions/syllabus";

export interface CalendarAssignment {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  courseCode: string;
  completed: boolean;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORY_COLORS: Record<string, string> = {
  Exam: "#dc2626",
  Quiz: "#c9853a",
  Assignment: "var(--color-accent)",
  "Lab Practical": "#7c3aed",
  Paper: "#16a34a",
  Presentation: "#0891b2",
  Clinical: "#c9853a",
};
const OTHER_CATEGORY_COLOR = "var(--color-neutral-700)";

const LEGEND_CATEGORIES = ["Exam", "Quiz", "Assignment", "Lab Practical", "Paper"];

// Local Y/M/D components, not toISOString — same reasoning as every other local-midnight fix
// in this app (see AtriumThisWeekCard's formatDueDate comment): a calendar cell's Date is
// built from local getFullYear/getMonth/getDate, so its key must be read back the same way
// to line up with dueDate strings without shifting a day in timezones west of UTC.
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function urgencyForDueDate(
  dueDate: string,
  todayKey: string,
  tomorrowKey: string
): { text: string; color: string; italic?: boolean } | null {
  if (dueDate < todayKey) return { text: "Overdue", color: "#dc2626", italic: true };
  if (dueDate === todayKey) return { text: "Due today", color: "#dc2626" };
  if (dueDate === tomorrowKey) return { text: "Due tomorrow", color: "#c9853a" };
  return null;
}

/** The Atrium's monthly calendar (see app/(app)/student/page.tsx, positioned between the
 *  This Week card and the resource card grid) — a from-scratch CSS-grid month view synced to
 *  SyllabusAssignment, distinct from AtriumThisWeekCard's own Monday-Sunday list. Month
 *  navigation is a plain client fetch against app/api/assignments/route.ts rather than
 *  calling getMonthAssignments directly, since a Server Action re-render would also have to
 *  re-run the whole Atrium page's data-fetching; the completion checkbox stays a direct
 *  Server Action call, same optimistic-then-revert shape as AtriumThisWeekCard's own. */
export function AtriumCalendar({
  initialAssignments,
  userId,
}: {
  initialAssignments: CalendarAssignment[];
  userId: string;
}) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [assignments, setAssignments] = useState<CalendarAssignment[]>(initialAssignments);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const todayKey = toDateKey(today);
    return initialAssignments.some((a) => a.dueDate === todayKey)
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
      : null;
  });
  const [, startTransition] = useTransition();
  const detailRef = useRef<HTMLDivElement>(null);

  const todayKey = toDateKey(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toDateKey(tomorrow);

  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarAssignment[]>();
    for (const a of assignments) {
      const list = map.get(a.dueDate) ?? [];
      list.push(a);
      map.set(a.dueDate, list);
    }
    return map;
  }, [assignments]);

  async function loadMonth(month: Date) {
    try {
      const result = await fetch(`/api/assignments?userId=${userId}&year=${month.getFullYear()}&month=${month.getMonth() + 1}`);
      if (!result.ok) return;
      const data = await result.json();
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
    } catch {
      // Network hiccup — the grid just keeps showing the previous month's data.
    }
  }

  function navigateMonth(direction: "prev" | "next") {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    void loadMonth(newMonth);
  }

  function goToToday() {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const changingMonth = monthStart.getFullYear() !== currentMonth.getFullYear() || monthStart.getMonth() !== currentMonth.getMonth();
    setCurrentMonth(monthStart);
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    if (changingMonth) void loadMonth(monthStart);
  }

  function selectDay(date: Date) {
    setSelectedDate(date);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleToggle(id: string) {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)));
    startTransition(async () => {
      const result = await toggleAssignmentComplete(id);
      if ("error" in result) {
        setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)));
      }
    });
  }

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingEmpty = (firstOfMonth.getDay() + 6) % 7;
  const trailingEmpty = (7 - ((leadingEmpty + daysInMonth) % 7)) % 7;

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const cells: Array<{ day: number; date: Date; key: string } | null> = [];
  for (let i = 0; i < leadingEmpty; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthIndex, d);
    cells.push({ day: d, date, key: toDateKey(date) });
  }
  for (let i = 0; i < trailingEmpty; i++) cells.push(null);

  const totalThisMonth = assignments.length;
  const completedThisMonth = assignments.filter((a) => a.completed).length;
  const remainingThisMonth = totalThisMonth - completedThisMonth;

  const dayList = selectedDate ? (assignmentsByDate.get(toDateKey(selectedDate)) ?? []) : [];
  const dayCompletedCount = dayList.filter((a) => a.completed).length;
  const dayAllComplete = dayList.length > 0 && dayCompletedCount === dayList.length;

  return (
    <div>
      <div className="atrium-calendar">
        <div className="atrium-calendar-left">
          <div className="atrium-calendar-header">
            <button type="button" className="atrium-calendar-nav-btn" onClick={() => navigateMonth("prev")} aria-label="Previous month">
              ←
            </button>
            <span className="atrium-calendar-month-label">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button type="button" className="atrium-calendar-nav-btn" onClick={() => navigateMonth("next")} aria-label="Next month">
              →
            </button>
            <button type="button" className="atrium-calendar-today-btn" onClick={goToToday}>
              Today
            </button>
          </div>

          <div className="atrium-calendar-weekdays">
            {WEEKDAY_LABELS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`empty-${i}`} className="calendar-cell calendar-cell--empty" aria-hidden="true" />;

              const dayAssignments = assignmentsByDate.get(cell.key) ?? [];
              const hasAssignments = dayAssignments.length > 0;
              const isToday = cell.key === todayKey;
              const isSelected = cell.key === selectedKey;
              const allComplete = hasAssignments && dayAssignments.every((a) => a.completed);
              const visibleDots = dayAssignments.slice(0, 3);
              const extra = dayAssignments.length - visibleDots.length;

              const classNames = ["calendar-cell"];
              if (hasAssignments) classNames.push("has-assignments");
              if (isToday) classNames.push("today");
              if (isSelected) classNames.push("selected");
              if (allComplete) classNames.push("all-complete");

              return (
                <button
                  key={cell.key}
                  type="button"
                  className={classNames.join(" ")}
                  onClick={() => selectDay(cell.date)}
                  aria-pressed={isSelected}
                >
                  <span className="calendar-cell-number">{cell.day}</span>
                  {hasAssignments && (
                    <span className="category-dots">
                      {visibleDots.map((a) => (
                        <span
                          key={a.id}
                          className="category-dot"
                          style={{ background: CATEGORY_COLORS[a.category] ?? OTHER_CATEGORY_COLOR }}
                          aria-hidden="true"
                        />
                      ))}
                      {extra > 0 && <span className="calendar-cell-more">+{extra}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="atrium-calendar-legend">
            {LEGEND_CATEGORIES.map((category) => (
              <span key={category} className="atrium-calendar-legend-item">
                <span className="category-dot" style={{ background: CATEGORY_COLORS[category] }} aria-hidden="true" />
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="atrium-calendar-right" ref={detailRef}>
          {!selectedDate ? (
            <div className="atrium-calendar-detail-empty">
              <p>Select a date to see assignments</p>
              <p className="atrium-calendar-month-mini-summary">
                {totalThisMonth} assignment{totalThisMonth === 1 ? "" : "s"} due this month · {completedThisMonth} completed
              </p>
            </div>
          ) : (
            <>
              <div className="atrium-calendar-detail-header">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>

              {dayList.length === 0 ? (
                <div className="atrium-calendar-detail-nothing">
                  <p>Nothing due</p>
                  <Link href="/student/syllabi" className="atrium-calendar-add-link">
                    Add assignment →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="atrium-calendar-assignment-list">
                    {dayList.map((a) => {
                      const urgency = !a.completed ? urgencyForDueDate(a.dueDate, todayKey, tomorrowKey) : null;
                      return (
                        <label
                          key={a.id}
                          className={
                            a.completed
                              ? "atrium-calendar-assignment-row atrium-calendar-assignment-row--done"
                              : "atrium-calendar-assignment-row"
                          }
                        >
                          <input type="checkbox" checked={a.completed} onChange={() => handleToggle(a.id)} />
                          <span
                            className="category-dot atrium-calendar-assignment-dot"
                            style={{ background: CATEGORY_COLORS[a.category] ?? OTHER_CATEGORY_COLOR }}
                            aria-hidden="true"
                          />
                          <span className="atrium-calendar-assignment-title">{a.title}</span>
                          <span className="atrium-calendar-assignment-course">{a.courseCode}</span>
                          <span className="atrium-calendar-assignment-category">{a.category}</span>
                          {urgency && (
                            <span
                              className="atrium-calendar-assignment-urgency"
                              style={{ color: urgency.color, fontStyle: urgency.italic ? "italic" : undefined }}
                            >
                              {urgency.text}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  <p className="atrium-calendar-complete-count">
                    {dayCompletedCount} of {dayList.length} complete
                  </p>

                  {dayAllComplete && <div className="atrium-calendar-complete-banner">All done for this day</div>}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="atrium-calendar-month-summary">
        <div className="atrium-calendar-month-summary-stat">
          <span className="atrium-calendar-month-summary-value">{totalThisMonth}</span>
          <span className="atrium-calendar-month-summary-label">Total this month</span>
        </div>
        <div className="atrium-calendar-month-summary-stat">
          <span className="atrium-calendar-month-summary-value" style={{ color: "#16a34a" }}>
            {completedThisMonth}
          </span>
          <span className="atrium-calendar-month-summary-label">Completed</span>
        </div>
        <div className="atrium-calendar-month-summary-stat">
          <span
            className="atrium-calendar-month-summary-value"
            style={{ color: remainingThisMonth > 0 ? "#c9853a" : "var(--color-neutral-700)" }}
          >
            {remainingThisMonth}
          </span>
          <span className="atrium-calendar-month-summary-label">Remaining</span>
        </div>
      </div>
    </div>
  );
}
