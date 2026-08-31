"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { parseSyllabusText, type ParsedAssignment } from "@/lib/syllabus-parser";
import { getThisWeekDateRange } from "@/lib/atrium-recommendations";
import { MEETING_DAY_CODES } from "@/lib/calendar-events";
import { parseMeetingTimesColumn } from "@/lib/syllabus-meeting-times";
import type { Syllabus, Assignment } from "@/generated/prisma/client";

// Explicit discriminated-union return types for every mutation the client actually branches
// on (see components/student/SyllabiManager.tsx) — without these, TypeScript's inference
// across this file's early-return/await shape widens each `error` property to
// `string | undefined` instead of keeping the two branches properly disjoint, and every
// `"error" in result` check downstream loses its narrowing.
type ActionError = { error: string };

/** Every mutation below derives the account from the session cookie, never from a
 *  client-passed id (same reasoning as every other server action in this app — a userId
 *  argument would just be something a client could spoof). Gated on hasStudentAccess, not
 *  just "signed in", since syllabus tracking is a Limbic Student feature (see
 *  app/(app)/student/assignments/page.tsx's own gate). */
async function requireStudentUser() {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) return null;
  return user;
}

async function requireOwnedSyllabus(userId: string, syllabusId: string) {
  const syllabus = await prisma.syllabus.findUnique({ where: { id: syllabusId } });
  if (!syllabus || syllabus.userId !== userId) return null;
  return syllabus;
}

async function requireOwnedAssignment(userId: string, assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.userId !== userId) return null;
  return assignment;
}

export interface SyllabusWithCount {
  id: string;
  courseCode: string;
  courseName: string;
  trimester: number;
  year: number;
  uploadedAt: Date;
  parsedAt: Date | null;
  assignmentCount: number;
  meetingDays: string[] | null;
  /** Maps a meetingDays entry to its own time — see Syllabus.meetingTimes in
   *  prisma/schema.prisma for why this isn't a single shared string. */
  meetingTimes: Record<string, string> | null;
}

/** All syllabi for the signed-in student, most recently uploaded first — powers both the
 *  syllabus management page's list and the "add manually" tab's course-code dropdown. */
export async function getSyllabi(): Promise<SyllabusWithCount[]> {
  const user = await requireStudentUser();
  if (!user) return [];

  const syllabi = await prisma.syllabus.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
    include: { _count: { select: { assignments: true } } },
  });

  return syllabi.map((s) => ({
    id: s.id,
    courseCode: s.courseCode,
    courseName: s.courseName,
    trimester: s.trimester,
    year: s.year,
    uploadedAt: s.uploadedAt,
    parsedAt: s.parsedAt,
    assignmentCount: s._count.assignments,
    meetingDays: s.meetingDays ? s.meetingDays.split(",") : null,
    meetingTimes: parseMeetingTimesColumn(s.meetingTimes),
  }));
}

/** All assignments for one syllabus, chronological — used by the syllabus card's expand
 *  view on the management page. Ownership-checked so a stray/guessed id from another
 *  account's syllabus never leaks assignment titles. */
export async function getSyllabusAssignments(syllabusId: string) {
  const user = await requireStudentUser();
  if (!user) return [];

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return [];

  return prisma.assignment.findMany({
    where: { syllabusId },
    orderBy: { dueDate: "asc" },
  });
}

export async function createSyllabus(
  courseCode: string,
  courseName: string,
  trimester: number,
  year: number
): Promise<ActionError | { success: true; syllabus: Syllabus }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!courseCode.trim() || !courseName.trim()) return { error: "Course code and name are required." };

  const syllabus = await prisma.syllabus.create({
    data: { userId: user.id, courseCode: courseCode.trim(), courseName: courseName.trim(), trimester, year },
  });

  revalidatePath("/student/assignments");
  return { success: true, syllabus };
}

export async function deleteSyllabus(syllabusId: string) {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  // Assignment.syllabus has onDelete: Cascade — deleting the syllabus deletes every
  // assignment it owns in the same statement.
  await prisma.syllabus.delete({ where: { id: syllabusId } });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true };
}

/** Runs the raw syllabus text through Limbic AI (see lib/syllabus-parser.ts), saves the raw
 *  text + parsedAt + meeting pattern (if one was found) on the syllabus, and creates one
 *  Assignment (source: "syllabus") per extracted item. A syllabus with no assignments but a
 *  real meeting pattern still saves successfully — the Class Schedule strip only needs the
 *  pattern, not any assignments.
 *  Returns the created rows so the review panel (see components/student/SyllabiManager.tsx)
 *  can show exactly what got saved — this app's UI never re-parses to display something
 *  it's already about to persist. */
export async function parseSyllabusFromText(
  syllabusId: string,
  rawText: string
): Promise<
  ActionError | { success: true; assignments: Assignment[]; meetingDays: string[] | null; meetingTimes: Record<string, string> | null }
> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!rawText.trim()) return { error: "Paste your syllabus text first." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  const parsed = await parseSyllabusText(rawText, syllabus.courseCode, syllabus.courseName);
  if (parsed === null) return { error: "Could not read that syllabus. Please try again or add assignments manually." };
  if (parsed.assignments.length === 0 && parsed.meetingDays === null) {
    return { error: "No assignments or a clear class meeting time were found in that text." };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.syllabus.update({
      where: { id: syllabusId },
      data: {
        rawText,
        parsedAt: now,
        meetingDays: parsed.meetingDays?.join(",") ?? null,
        meetingTimes: parsed.meetingTimes ? JSON.stringify(parsed.meetingTimes) : null,
      },
    }),
    ...parsed.assignments.map((a: ParsedAssignment) =>
      prisma.assignment.create({
        data: {
          syllabusId,
          userId: user.id,
          title: a.title,
          dueDate: a.dueDate,
          category: a.category,
          courseCode: a.courseCode || syllabus.courseCode,
          courseName: a.courseName || syllabus.courseName,
        },
      })
    ),
  ]);

  const assignments = await prisma.assignment.findMany({ where: { syllabusId }, orderBy: { dueDate: "asc" } });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true, assignments, meetingDays: parsed.meetingDays, meetingTimes: parsed.meetingTimes };
}

/** Sets or corrects a syllabus's recurring meeting pattern by hand — the fallback for when
 *  parseSyllabusFromText didn't find one (many syllabi don't state it in a clean parseable
 *  line) or a manually-added course (see createSyllabus) that never ran the AI parse at all.
 *  Same whitelist enforcement as every other free-text field in this schema — days is checked
 *  against MEETING_DAY_CODES before being joined into the stored comma-separated string, and
 *  timesByDay is trimmed down to just the selected days before being JSON-encoded (a leftover
 *  time for a day the reader just unchecked shouldn't survive the save). A day in `days` with
 *  no entry (or a blank one) in timesByDay just has no time — the same class can meet without
 *  a stated time on one day and a stated one on another. Passing an empty days array clears
 *  the pattern entirely (both fields become null), the same way a reader would use this to
 *  remove a wrong AI-extracted schedule. */
export async function updateSyllabusMeetingPattern(
  syllabusId: string,
  days: string[],
  timesByDay: Record<string, string>
): Promise<ActionError | { success: true }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  const validDays = days.filter((d) => (MEETING_DAY_CODES as readonly string[]).includes(d));
  if (validDays.length !== days.length) return { error: "Invalid meeting day." };

  const trimmedTimes = Object.fromEntries(
    validDays.filter((d) => timesByDay[d]?.trim()).map((d) => [d, timesByDay[d].trim()])
  );

  await prisma.syllabus.update({
    where: { id: syllabusId },
    data: {
      meetingDays: validDays.length > 0 ? validDays.join(",") : null,
      meetingTimes: validDays.length > 0 && Object.keys(trimmedTimes).length > 0 ? JSON.stringify(trimmedTimes) : null,
    },
  });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true };
}

export async function addManualAssignment(
  syllabusId: string,
  title: string,
  dueDate: string,
  category: string
): Promise<ActionError | { success: true; assignment: Assignment }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!title.trim() || !dueDate.trim()) return { error: "Title and due date are required." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  const assignment = await prisma.assignment.create({
    data: {
      syllabusId,
      userId: user.id,
      title: title.trim(),
      dueDate,
      category,
      courseCode: syllabus.courseCode,
      courseName: syllabus.courseName,
    },
  });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true, assignment };
}

/** Every assignment (complete or not) due within this calendar week — see
 *  getThisWeekDateRange, the same Monday-Sunday window the Atrium's This Week card header
 *  shows. dueDate is a plain YYYY-MM-DD string (see schema.prisma), so a lexical range
 *  comparison is exact, same reasoning as DailyCompletion.dateKey elsewhere in this app. */
export async function getThisWeekAssignments() {
  const user = await requireStudentUser();
  if (!user) return [];

  const { start, end } = getThisWeekDateRange();

  return prisma.assignment.findMany({
    where: { userId: user.id, dueDate: { gte: start, lte: end } },
    orderBy: { dueDate: "asc" },
  });
}

/** Every assignment (complete or not) due within one calendar month, for the Atrium's
 *  monthly calendar (see components/AtriumCalendar.tsx and app/api/assignments/route.ts,
 *  which both call this — the route wraps it with a userId/session match check since it's
 *  reached from a client-side fetch). userId is accepted to match the calendar's own
 *  signature, but — same reasoning as requireStudentUser everywhere else in this file — it
 *  is never trusted on its own; a mismatch against the session account returns nothing
 *  rather than another account's assignments. dueDate is a plain YYYY-MM-DD string (see
 *  schema.prisma), so a lexical range comparison against the month's first/last day is
 *  exact, same as getThisWeekAssignments above. */
export async function getMonthAssignments(userId: string, year: number, month: number) {
  const user = await requireStudentUser();
  if (!user || user.id !== userId) return [];

  const monthStr = String(month).padStart(2, "0");
  const start = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

  return prisma.assignment.findMany({
    where: { userId: user.id, dueDate: { gte: start, lte: end } },
    orderBy: { dueDate: "asc" },
  });
}

export async function toggleAssignmentComplete(assignmentId: string): Promise<ActionError | { success: true; completed: boolean }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const assignment = await requireOwnedAssignment(user.id, assignmentId);
  if (!assignment) return { error: "Assignment not found." };

  const completed = !assignment.completed;
  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { completed, completedAt: completed ? new Date() : null },
  });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true, completed };
}

/** Not part of the original mutation list — added because the parse review panel (see
 *  components/student/SyllabiManager.tsx) lets a reader correct an AI-extracted row (title,
 *  due date, category) before or after it lands in the database, and "server actions for
 *  all mutations" rules out doing that edit any other way. Same ownership-check shape as
 *  every other mutation here. */
export async function updateAssignment(assignmentId: string, title: string, dueDate: string, category: string) {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!title.trim() || !dueDate.trim()) return { error: "Title and due date are required." };

  const assignment = await requireOwnedAssignment(user.id, assignmentId);
  if (!assignment) return { error: "Assignment not found." };

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { title: title.trim(), dueDate, category },
  });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const assignment = await requireOwnedAssignment(user.id, assignmentId);
  if (!assignment) return { error: "Assignment not found." };

  await prisma.assignment.delete({ where: { id: assignmentId } });

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true };
}
