import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getStudyGuideCourse } from "@/app/actions/study-guide";
import { StudyGuideFlashcards } from "@/components/student/StudyGuideFlashcards";

export async function generateMetadata({ params }: { params: Promise<{ syllabusId: string }> }): Promise<Metadata> {
  const { syllabusId } = await params;
  const course = await getStudyGuideCourse(syllabusId);
  return { title: course ? `Flashcards — ${course.courseCode}` : "Flashcards" };
}

/** One of a course's three Study Guide content pages (see
 *  app/(app)/student/study-guide/page.tsx, the index this links from, for why these are
 *  separate pages rather than tabs on one). */
export default async function StudyGuideFlashcardsPage({ params }: { params: Promise<{ syllabusId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) notFound();

  const { syllabusId } = await params;
  const course = await getStudyGuideCourse(syllabusId);
  if (!course) notFound();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 720 }}>
      <Link href="/student/study-guide" className="atrium-back-link">
        ← Back to Study Guide
      </Link>
      <h1 style={{ fontSize: 24, margin: "16px 0 2px" }}>
        {course.courseCode} — {course.courseName}
      </h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>Flashcards</p>

      <StudyGuideFlashcards syllabusId={course.id} courseCode={course.courseCode} initialCards={course.cards} />
    </div>
  );
}
