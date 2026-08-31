import type { Metadata } from "next";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSyllabi } from "@/app/actions/syllabus";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { SlideBreakdownManager } from "@/components/student/SlideBreakdownManager";

export const metadata: Metadata = {
  title: "Study Guide Creator",
};

const SUBTITLE = "Upload your lecture slides as a PDF and Limbic AI turns them into flashcards and Visual Aids notes in your Study Guide.";

/** "So if I add my slides from class will these populate [the Study Guide]?" -> "no, not yet"
 *  -> real (but paste-text-only) Slide Breakdown -> "The input for slide breakdown needs to
 *  be pdf" -> a real PDF upload (see lib/pdf-text.ts, generateSlideBreakdownFromPdf in
 *  app/actions/slide-breakdown.ts), same FormData/File shape as the Apple Health export
 *  upload (components/vitals/AppleHealthUploadCard.tsx) -> "Rename the slide breakdown page
 *  have it say Study guide creator" -> this: the route (/student/slides) and the underlying
 *  action/component file names are unchanged, only the display title — every place a reader
 *  sees this feature named should say "Study Guide Creator" now (this page, its
 *  StudentGate, and the Atrium resource card that links here — see app/(app)/student/page.tsx
 *  PATHS). Pasting text is still available as a fallback behind a toggle in
 *  components/student/SlideBreakdownManager.tsx, for a scanned/image-only PDF this app can't
 *  OCR. */
export default async function SlidesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Study Guide Creator" subtitle={SUBTITLE}>
        <StudentGate toolName="Study Guide Creator" />
      </StudentPlaceholderPage>
    );
  }

  const syllabi = await getSyllabi();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Study Guide Creator</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 560, lineHeight: 1.5, margin: "0 0 20px" }}>{SUBTITLE}</p>

      <SlideBreakdownManager courses={syllabi.map((s) => ({ id: s.id, courseCode: s.courseCode, courseName: s.courseName }))} />
    </div>
  );
}
