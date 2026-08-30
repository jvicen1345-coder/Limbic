"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { parseSyllabusText, type ParsedAssignment } from "@/lib/syllabus-parser";
import { getThisWeekDateRange } from "@/lib/atrium-recommendations";
import type { Syllabus, SyllabusAssignment } from "@/generated/prisma/client";

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
 *  app/(app)/student/syllabi/page.tsx's own gate). */
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
  const assignment = await prisma.syllabusAssignment.findUnique({ where: { id: assignmentId } });
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

  return prisma.syllabusAssignment.findMany({
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

  revalidatePath("/student/syllabi");
  return { success: true, syllabus };
}

export async function deleteSyllabus(syllabusId: string) {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  // SyllabusAssignment.syllabus has onDelete: Cascade — deleting the syllabus deletes every
  // assignment it owns in the same statement.
  await prisma.syllabus.delete({ where: { id: syllabusId } });

  revalidatePath("/student/syllabi");
  revalidatePath("/student");
  return { success: true };
}

/** Runs the raw syllabus text through Limbic AI (see lib/syllabus-parser.ts), saves the raw
 *  text + parsedAt on the syllabus, and creates one SyllabusAssignment per extracted item.
 *  Returns the created rows so the review panel (see components/student/SyllabiManager.tsx)
 *  can show exactly what got saved — this app's UI never re-parses to display something
 *  it's already about to persist. */
export async function parseSyllabusFromText(
  syllabusId: string,
  rawText: string
): Promise<ActionError | { success: true; assignments: SyllabusAssignment[] }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!rawText.trim()) return { error: "Paste your syllabus text first." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  const parsed = await parseSyllabusText(rawText, syllabus.courseCode, syllabus.courseName);
  if (parsed === null) return { error: "Could not read that syllabus. Please try again or add assignments manually." };
  if (parsed.length === 0) return { error: "No assignments with a clear due date were found in that text." };

  const now = new Date();
  await prisma.$transaction([
    prisma.syllabus.update({ where: { id: syllabusId }, data: { rawText, parsedAt: now } }),
    ...parsed.map((a: ParsedAssignment) =>
      prisma.syllabusAssignment.create({
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

  const assignments = await prisma.syllabusAssignment.findMany({ where: { syllabusId }, orderBy: { dueDate: "asc" } });

  revalidatePath("/student/syllabi");
  revalidatePath("/student");
  return { success: true, assignments };
}

export async function addManualAssignment(
  syllabusId: string,
  title: string,
  dueDate: string,
  category: string
): Promise<ActionError | { success: true; assignment: SyllabusAssignment }> {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };
  if (!title.trim() || !dueDate.trim()) return { error: "Title and due date are required." };

  const syllabus = await requireOwnedSyllabus(user.id, syllabusId);
  if (!syllabus) return { error: "Syllabus not found." };

  const assignment = await prisma.syllabusAssignment.create({
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

  revalidatePath("/student/syllabi");
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

  return prisma.syllabusAssignment.findMany({
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

  return prisma.syllabusAssignment.findMany({
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
  await prisma.syllabusAssignment.update({
    where: { id: assignmentId },
    data: { completed, completedAt: completed ? new Date() : null },
  });

  revalidatePath("/student/syllabi");
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

  await prisma.syllabusAssignment.update({
    where: { id: assignmentId },
    data: { title: title.trim(), dueDate, category },
  });

  revalidatePath("/student/syllabi");
  revalidatePath("/student");
  return { success: true };
}

export async function deleteAssignment(assignmentId: string) {
  const user = await requireStudentUser();
  if (!user) return { error: "Unauthorized" };

  const assignment = await requireOwnedAssignment(user.id, assignmentId);
  if (!assignment) return { error: "Assignment not found." };

  await prisma.syllabusAssignment.delete({ where: { id: assignmentId } });

  revalidatePath("/student/syllabi");
  revalidatePath("/student");
  return { success: true };
}
