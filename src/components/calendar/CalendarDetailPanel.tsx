"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { updateProfessionalDates } from "@/app/actions/profile";
import { deleteUserCalendarEventAction, saveArticleToCalendarAction } from "@/app/actions/calendar";
import { daysRemainingOrPastDue, type ProfessionalDateField } from "@/lib/limbic-calendar";
import type {
  CalendarEvent,
  CommunityCalendarEvent,
  PersonalCalendarEvent,
  PlatformCalendarEvent,
  UserCreatedCalendarEvent,
} from "@/lib/calendar-events";
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from "@/components/icons";

/** Slides in from the right (up from the bottom on mobile — see the max-width:640px
 *  override on .cal-panel in globals.css). `date`/`events` are the *last* selected date's
 *  data even after `open` goes false — see CalendarPageClient's lastSelectedDate tracking
 *  — so the slide-out animation has real content to show while it plays instead of going
 *  blank the instant a reader closes it. */
export function CalendarDetailPanel({
  open,
  date,
  events,
  onClose,
  onEditUserEvent,
  onChanged,
}: {
  open: boolean;
  date: string | null;
  events: CalendarEvent[];
  onClose: () => void;
  onEditUserEvent: (event: UserCreatedCalendarEvent) => void;
  onChanged: () => void;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 250);
  const [, startTransition] = useTransition();
  const [editingField, setEditingField] = useState<ProfessionalDateField | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [savedArticleIds, setSavedArticleIds] = useState<Set<string>>(new Set());

  if (!shouldRender || !date) return null;

  // "Personal first" per spec — and user-created events share that same group (and pill
  // color) rather than getting a 4th group, since there's no separate filter button for
  // them either (see filterBucketForKind in lib/calendar-events.ts).
  const personalGroup = events.filter(
    (e): e is PersonalCalendarEvent | UserCreatedCalendarEvent => e.kind === "personal" || e.kind === "user"
  );
  const platformGroup = events.filter((e): e is PlatformCalendarEvent => e.kind === "platform");
  const communityGroup = events.filter((e): e is CommunityCalendarEvent => e.kind === "community");

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const savePersonalEdit = (field: ProfessionalDateField) => {
    startTransition(async () => {
      await updateProfessionalDates(field, editingValue);
      setEditingField(null);
      onChanged();
    });
  };

  return (
    <>
      <div className="cal-panel-backdrop" onClick={onClose} />
      <div className={`cal-panel${closing ? " cal-panel-closing" : ""}`}>
        <div className="cal-panel-header">
          <div className="cal-panel-title">{dateLabel}</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>
        <div className="cal-panel-body">
          {events.length === 0 && <div className="cal-panel-empty">Nothing on this date.</div>}

          {personalGroup.length > 0 && (
            <div>
              <div className="cal-panel-group-label">Personal</div>
              {personalGroup.map((ev) =>
                ev.kind === "personal" ? (
                  <div key={ev.id} className="cal-panel-event">
                    <div className="cal-panel-event-title">{ev.title}</div>
                    {editingField === ev.field ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                        <input
                          type="date"
                          className="input"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          style={{ fontSize: 12, padding: "5px 10px" }}
                        />
                        <button type="button" className="btn btn-primary" style={{ fontSize: "var(--fs-11)", padding: "5px 10px" }} onClick={() => savePersonalEdit(ev.field)}>
                          Save
                        </button>
                        <button type="button" className="btn btn-ghost" style={{ fontSize: "var(--fs-11)", padding: "5px 8px" }} onClick={() => setEditingField(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="cal-panel-event-meta">{daysRemainingOrPastDue(ev.date)}</div>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize: "var(--fs-11)", padding: "4px 8px", marginTop: 6 }}
                          onClick={() => {
                            setEditingField(ev.field);
                            setEditingValue(ev.date);
                          }}
                        >
                          <PencilIcon size={11} /> Edit
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div key={ev.id} className="cal-panel-event">
                    <div className="cal-panel-event-title">{ev.title}</div>
                    <div className="cal-panel-event-meta">
                      {ev.type} · {daysRemainingOrPastDue(ev.date)}
                    </div>
                    {ev.notes && <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "6px 0" }}>{ev.notes}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button type="button" className="btn btn-ghost" style={{ fontSize: "var(--fs-11)", padding: "4px 8px" }} onClick={() => onEditUserEvent(ev)}>
                        <PencilIcon size={11} /> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize: "var(--fs-11)", padding: "4px 8px", color: "var(--color-danger)" }}
                        onClick={() =>
                          startTransition(async () => {
                            await deleteUserCalendarEventAction(ev.rawId);
                            onChanged();
                          })
                        }
                      >
                        <TrashIcon size={11} /> Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {platformGroup.length > 0 && (
            <div>
              <div className="cal-panel-group-label">PT Events</div>
              {platformGroup.map((ev) => (
                <div key={ev.id} className="cal-panel-event">
                  <div className="cal-panel-event-title">{ev.title}</div>
                  <div className="cal-panel-event-meta">{ev.source}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <Link href={`/article/${ev.articleId}`} className="btn btn-secondary" style={{ fontSize: "var(--fs-11)", padding: "5px 10px" }}>
                      Read article
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ fontSize: "var(--fs-11)", padding: "5px 10px" }}
                      disabled={savedArticleIds.has(ev.articleId)}
                      onClick={() =>
                        startTransition(async () => {
                          await saveArticleToCalendarAction({ title: ev.title, date: ev.date, source: ev.source });
                          setSavedArticleIds((s) => new Set(s).add(ev.articleId));
                          onChanged();
                        })
                      }
                    >
                      {savedArticleIds.has(ev.articleId) ? (
                        <>
                          <CheckIcon size={11} /> Saved
                        </>
                      ) : (
                        "Save to my calendar"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {communityGroup.length > 0 && (
            <div>
              <div className="cal-panel-group-label">Limbic Events</div>
              {communityGroup.map((ev) => (
                <div key={ev.id} className="cal-panel-event">
                  <div className="cal-panel-event-title">{ev.title}</div>
                  <div className="cal-panel-event-meta">{ev.authorName}</div>
                  <p style={{ fontSize: 12, color: "var(--color-neutral-700)", margin: "6px 0" }}>{ev.bodyPreview}…</p>
                  <Link href={ev.postHref} className="btn btn-secondary" style={{ fontSize: "var(--fs-11)", padding: "5px 10px" }}>
                    View post
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
