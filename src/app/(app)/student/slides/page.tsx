import type { Metadata } from "next";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSyllabi } from "@/app/actions/syllabus";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { SlideBreakdownManager } from "@/components/student/SlideBreakdownManager";

export const metadata: Metadata = {
  title: "Slides",
};

const SUBTITLE = "Paste your lecture slide text and Limbic AI turns it into flashcards and Visual Aids notes in your Study Guide.";

/** "So if I add my slides from class will these populate [the Study Guide]?" -> "no, not yet"
 *  -> this: no longer the "Coming soon" placeholder. Same "paste text, not a real file
 *  upload" shape as Assignments' own "Upload Syllabus Text" tab (see
 *  components/student/SyllabiManager.tsx) — this app has no PDF/PPTX parsing, and a student
 *  can already copy slide text out of whatever they're viewing it in. See
 *  app/actions/slide-breakdown.ts for the AI extraction + Study Guide write, and
 *  components/student/SlideBreakdownManager.tsx for the form. */
export default async function SlidesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Slide Breakdown" subtitle={SUBTITLE}>
        <StudentGate toolName="Slide Breakdown" />
      </StudentPlaceholderPage>
    );
  }

  const syllabi = await getSyllabi();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Slide Breakdown</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 560, lineHeight: 1.5, margin: "0 0 20px" }}>{SUBTITLE}</p>

      <SlideBreakdownManager courses={syllabi.map((s) => ({ id: s.id, courseCode: s.courseCode, courseName: s.courseName }))} />
    </div>
  );
}
