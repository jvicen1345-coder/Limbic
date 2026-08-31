import type { Metadata } from "next";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSyllabi } from "@/app/actions/syllabus";
import { getCanvasConnection } from "@/app/actions/canvas";
import { getCurrentProgramPhase } from "@/lib/dpt-program";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { SyllabiManager } from "@/components/student/SyllabiManager";
import { CanvasConnectPanel } from "@/components/student/CanvasConnectPanel";

export const metadata: Metadata = {
  title: "Assignments",
};

const SUBTITLE = "Connect Canvas or upload your syllabi, and Limbic tracks every assignment in one place.";

/** Limbic Student's assignment tracker — the destination the Atrium's This Week card and
 *  monthly calendar both deep-link to (see components/AtriumThisWeekCard.tsx,
 *  components/AtriumCalendar.tsx). Two ways in: connect a Canvas account (see
 *  components/student/CanvasConnectPanel.tsx, app/actions/canvas.ts) for assignments synced
 *  automatically, or upload/paste a syllabus for Limbic AI to extract from (see
 *  components/student/SyllabiManager.tsx, app/actions/syllabus.ts) — both write into the same
 *  Assignment table, distinguished only by `source`, so every downstream reader (this page,
 *  the Atrium widgets) shows both without knowing which one a given row came from. Previously
 *  lived at /student/syllabi (see that route's now-redirecting page.tsx) — renamed once it
 *  stopped being only syllabus-sourced. */
export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Assignments" subtitle={SUBTITLE}>
        <StudentGate toolName="Assignments" />
      </StudentPlaceholderPage>
    );
  }

  const [syllabi, canvasConnection] = await Promise.all([getSyllabi(), getCanvasConnection()]);
  const phase = getCurrentProgramPhase(new Date());
  const defaultTrimester = phase.trimesterNumber >= 1 && phase.trimesterNumber <= 9 ? phase.trimesterNumber : 1;
  const defaultYear = new Date().getFullYear();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Assignments</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: "0 0 20px" }}>
        {SUBTITLE}
      </p>

      <CanvasConnectPanel initialConnection={canvasConnection} />

      <div className="atrium-section-label" style={{ marginTop: 28, marginBottom: 12 }}>
        Syllabus Tracker
      </div>
      <SyllabiManager initialSyllabi={syllabi} defaultTrimester={defaultTrimester} defaultYear={defaultYear} />
    </div>
  );
}
