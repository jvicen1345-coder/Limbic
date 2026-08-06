"use client";

import { useState, useTransition } from "react";
import { createUserCalendarEventAction, updateUserCalendarEventAction } from "@/app/actions/calendar";
import { USER_EVENT_TYPES, type UserCreatedCalendarEvent } from "@/lib/calendar-events";
import { useExitAnimation } from "@/lib/use-exit-animation";
import { todayLocalDateStr } from "@/lib/today";
import { XIcon } from "@/components/icons";

/** Doubles as both "Add Event" and "Edit Event" (see the detail panel's Edit button on a
 *  user-created event) — pass `editingEvent` for the edit case. Mount this with a `key`
 *  that changes whenever the target changes (a fresh "Add", or a different event to edit)
 *  so the form's local state resets; see components/calendar/CalendarPageClient.tsx. */
export function AddEventModal({
  open,
  defaultDate,
  editingEvent,
  onClose,
  onSaved,
}: {
  open: boolean;
  defaultDate?: string;
  editingEvent?: UserCreatedCalendarEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { shouldRender, closing } = useExitAnimation(open, 200);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(editingEvent?.title ?? "");
  const [date, setDate] = useState(editingEvent?.date ?? defaultDate ?? todayLocalDateStr());
  const [type, setType] = useState<string>(editingEvent?.type ?? "Personal");
  const [notes, setNotes] = useState(editingEvent?.notes ?? "");
  const [reminder, setReminder] = useState(editingEvent?.reminder ?? false);

  if (!shouldRender) return null;

  const canSave = title.trim().length > 0 && date.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    startTransition(async () => {
      if (editingEvent) {
        await updateUserCalendarEventAction(editingEvent.rawId, { title, date, type, notes, reminder });
      } else {
        await createUserCalendarEventAction({ title, date, type, notes, reminder });
      }
      onSaved();
    });
  };

  return (
    <div className={`cal-modal-backdrop${closing ? " cal-modal-closing" : ""}`} onClick={onClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <div className="cal-modal-title">{editingEvent ? "Edit Event" : "Add Event"}</div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}>
            <XIcon size={16} />
          </button>
        </div>

        <div className="field">
          <label htmlFor="cal-ev-title">Event name</label>
          <input className="input" id="cal-ev-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="cal-ev-date">Event date</label>
          <input className="input" id="cal-ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="cal-ev-type">Event type</label>
          <select className="input" id="cal-ev-type" value={type} onChange={(e) => setType(e.target.value)}>
            {USER_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label htmlFor="cal-ev-notes">Notes</label>
          <textarea
            className="input"
            id="cal-ev-notes"
            rows={3}
            placeholder="Optional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <label className="cal-modal-reminder-row" style={{ marginTop: 14 }}>
          <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} />
          Remind me 7 days before (in-app notification)
        </label>

        <div className="cal-modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!canSave || pending} onClick={handleSave}>
            {pending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
