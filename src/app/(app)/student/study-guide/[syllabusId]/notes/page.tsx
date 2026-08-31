import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getStudyGuideCourse } from "@/app/actions/study-guide";
import { StudyGuideNotes } from "@/components/student/StudyGuideNotes";

export async function generateMetadata({ params }: { params: Promise<{ syllabusId: string }> }): Promise<Metadata> {
  const { syllabusId } = await params;
  const course = await getStudyGuideCourse(syllabusId);
  return { title: course ? `Visual Aids — ${course.courseCode}` : "Visual Aids" };
}

/** One of a course's three Study Guide content pages (see
 *  app/(app)/student/study-guide/page.tsx, the index this links from). No fresh-note editor
 *  when a course has no notes yet — see components/student/StudyGuideNotes.tsx's own doc
 *  comment. */
export default async function StudyGuideNotesPage({ params }: { params: Promise<{ syllabusId: string }> }) {
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
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>Visual Aids</p>

      <StudyGuideNotes courseId={course.id} courseCode={course.courseCode} initialNotes={course.studyNotes} />
    </div>
  );
}
