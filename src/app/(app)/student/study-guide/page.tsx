import type { Metadata } from "next";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getStudyGuideData } from "@/app/actions/study-guide";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { StudyGuideManager } from "@/components/student/StudyGuideManager";

export const metadata: Metadata = {
  title: "Study Guide",
};

const SUBTITLE = "Flashcards, self-quizzes, and visual notes — organized by class.";

/** "As a student I like to study w/ charts tables, visuals, notecards, and self quizzes" ->
 *  "a page called study guide where we have sections w/ different classes and inside we have
 *  ... flashcards[,] self-quiz[,] visual aids" — this is that. One section per course (see
 *  Syllabus in prisma/schema.prisma, the same course list Assignments/the Atrium's Class
 *  Schedule already read from), each with its own StudyCard deck shared between the
 *  Flashcards and Self-Quiz tabs, plus a free-text Visual Aids note (see
 *  lib/study-notes-markdown.ts for its one bit of table syntax). See
 *  app/actions/study-guide.ts for every mutation and components/student/StudyGuideManager.tsx
 *  for the client UI. */
export default async function StudyGuidePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Study Guide" subtitle={SUBTITLE}>
        <StudentGate toolName="Study Guide" />
      </StudentPlaceholderPage>
    );
  }

  const courses = await getStudyGuideData();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Study Guide</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: "0 0 20px" }}>{SUBTITLE}</p>

      <StudyGuideManager initialCourses={courses} />
    </div>
  );
}
