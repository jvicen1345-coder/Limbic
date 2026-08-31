import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getStudyGuideCourses } from "@/app/actions/study-guide";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { timeAgo } from "@/lib/nexus-utils";

export const metadata: Metadata = {
  title: "Study Guide",
};

const SUBTITLE = "Flashcards, self-quizzes, and visual notes — organized by class.";

/** "As a student I like to study w/ charts tables, visuals, notecards, and self quizzes" ->
 *  "a page called study guide where we have sections w/ different classes and inside we have
 *  ... flashcards[,] self-quiz[,] visual aids" -> "I want to get rid of the ability to create
 *  in the study guide page for now, have it open a page to each created content" — this is
 *  now a plain index: one card per course (see Syllabus in prisma/schema.prisma), each
 *  linking straight to its own Flashcards, Self-Quiz, and Visual Aids page (see the
 *  [syllabusId]/flashcards|quiz|notes routes below this one) rather than an inline accordion
 *  with add/edit forms on this page itself. New content only comes from Study Guide Creator
 *  now (/student/slides, app/actions/slide-breakdown.ts) — see getStudyGuideCourses in
 *  app/actions/study-guide.ts for what this page reads. */
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

  const courses = await getStudyGuideCourses();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Study Guide</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: "0 0 20px" }}>{SUBTITLE}</p>

      {courses.length === 0 ? (
        <p className="atrium-dashboard-empty">
          Add a course in <Link href="/student/assignments">Assignments</Link>, then generate flashcards and notes for it in{" "}
          <Link href="/student/slides">Study Guide Creator</Link>.
        </p>
      ) : (
        <div className="study-guide-index-list">
          {courses.map((c) => (
            <div key={c.id} className="study-guide-index-card">
              <div className="study-guide-index-title">
                {c.courseCode} — {c.courseName}
              </div>
              <div className="study-guide-index-meta">
                {c.cardCount} card{c.cardCount === 1 ? "" : "s"}
                {c.cardCount > 0 ? ` · ${c.knownCount}/${c.cardCount} known` : ""}
                {c.hasNotes ? " · notes saved" : ""}
              </div>
              {c.lastUpdated && <div className="study-guide-index-updated">Updated {timeAgo(c.lastUpdated)}</div>}
              <div className="study-guide-index-links">
                <Link href={`/student/study-guide/${c.id}/flashcards`} className="study-guide-index-link">
                  Flashcards
                </Link>
                <Link href={`/student/study-guide/${c.id}/quiz`} className="study-guide-index-link">
                  Self-Quiz
                </Link>
                <Link href={`/student/study-guide/${c.id}/notes`} className="study-guide-index-link">
                  Visual Aids
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="study-guide-index-creator-hint">
        Need more content? Upload a lecture&rsquo;s slides in <Link href="/student/slides">Study Guide Creator</Link>.
      </p>
    </div>
  );
}
