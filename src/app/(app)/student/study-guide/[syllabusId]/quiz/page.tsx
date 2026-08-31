import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getStudyGuideCourse } from "@/app/actions/study-guide";
import { StudyGuideQuiz } from "@/components/student/StudyGuideQuiz";

export async function generateMetadata({ params }: { params: Promise<{ syllabusId: string }> }): Promise<Metadata> {
  const { syllabusId } = await params;
  const course = await getStudyGuideCourse(syllabusId);
  return { title: course ? `Self-Quiz — ${course.courseCode}` : "Self-Quiz" };
}

/** One of a course's three Study Guide content pages (see
 *  app/(app)/student/study-guide/page.tsx, the index this links from). */
export default async function StudyGuideQuizPage({ params }: { params: Promise<{ syllabusId: string }> }) {
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
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>Self-Quiz</p>

      <StudyGuideQuiz courseCode={course.courseCode} cards={course.cards} />
    </div>
  );
}
