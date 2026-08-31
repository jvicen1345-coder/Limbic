"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { USER_EVENT_TYPES, type UserEventType } from "@/lib/calendar-events";
import { dateToLocalIso } from "@/lib/limbic-calendar";

function isUserEventType(value: string): value is UserEventType {
  return (USER_EVENT_TYPES as readonly string[]).includes(value);
}

/** Add Event modal's Save button (see components/calendar/AddEventModal.tsx). `date` is
 *  an `<input type="date">` value ("YYYY-MM-DD"); `type` is checked against the same
 *  whitelist the modal's own select offers, for the same reason every other free-text
 *  field in this app is whitelisted server-side (see app/actions/profile.ts). */
export async function createUserCalendarEventAction(input: {
  title: string;
  date: string;
  type: string;
  notes: string;
  reminder: boolean;
}) {
  const user = await getCurrentUser();
  const title = input.title.trim();
  if (!user || !title || !input.date || !isUserEventType(input.type)) return;

  await prisma.userCalendarEvent.create({
    data: {
      userId: user.id,
      title,
      date: new Date(`${input.date}T00:00:00`),
      type: input.type,
      notes: input.notes.trim() || null,
      reminder: input.reminder,
    },
  });
  revalidatePath("/calendar");
}

/** Detail panel's Delete button on a user-created event. */
export async function deleteUserCalendarEventAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.userCalendarEvent.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/calendar");
}

/** Detail panel's Edit button on a user-created event — same whitelist/parsing as create
 *  above, applied to an existing row instead of a new one. */
export async function updateUserCalendarEventAction(
  id: string,
  input: { title: string; date: string; type: string; notes: string; reminder: boolean }
) {
  const user = await getCurrentUser();
  const title = input.title.trim();
  if (!user || !title || !input.date || !isUserEventType(input.type)) return;

  await prisma.userCalendarEvent.updateMany({
    where: { id, userId: user.id },
    data: {
      title,
      date: new Date(`${input.date}T00:00:00`),
      type: input.type,
      notes: input.notes.trim() || null,
      reminder: input.reminder,
    },
  });
  revalidatePath("/calendar");
}

/** PT platform event's "Save to my calendar" button — copies a live-feed CE article into
 *  the reader's own UserCalendarEvent list. Deduped on (userId, title, date) so clicking
 *  it more than once (e.g. after a revalidate) doesn't pile up duplicate rows — there's no
 *  @@unique for this in the schema since a plain user-created event legitimately can share
 *  a title/date with another (this dedupe only needs to apply to the "save a copy of an
 *  external event" path, not to Add Event submissions in general). */
export async function saveArticleToCalendarAction(input: { title: string; date: string; source: string }) {
  const user = await getCurrentUser();
  const title = input.title.trim();
  if (!user || !title || !input.date) return;

  const date = new Date(`${input.date}T00:00:00`);
  const existing = await prisma.userCalendarEvent.findFirst({
    where: { userId: user.id, title, date },
    select: { id: true },
  });
  if (existing) return;

  await prisma.userCalendarEvent.create({
    data: {
      userId: user.id,
      title,
      date,
      type: "CE Event",
      notes: `Source: ${input.source}`,
      reminder: false,
    },
  });
  revalidatePath("/calendar");
}

/** Every "Important Date"-type calendar event (see USER_EVENT_TYPES in lib/calendar-events.ts
 *  — first day of trimester, finals week, add/drop deadline, breaks) within one calendar
 *  month, for the Atrium's monthly calendar (see components/AtriumCalendar.tsx, which reads
 *  this alongside getMonthAssignments in app/actions/syllabus.ts — same "additive, separate
 *  source" shape as the Class Schedule strip's own syllabus + UserCalendarEvent split). userId
 *  is accepted to match getMonthAssignments's own signature but, same as that function, is
 *  never trusted on its own — a mismatch against the session account returns nothing. Gated on
 *  hasStudentAccess, not just "signed in", since the Atrium is a Limbic Student surface. */
export async function getMonthImportantDates(userId: string, year: number, month: number) {
  const user = await getCurrentUser();
  if (!user || user.id !== userId || !hasStudentAccess(user)) return [];

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const events = await prisma.userCalendarEvent.findMany({
    where: { userId: user.id, type: "Important Date", date: { gte: monthStart, lte: monthEnd } },
    orderBy: { date: "asc" },
  });

  return events.map((e) => ({ id: e.id, title: e.title, date: dateToLocalIso(e.date) }));
}
