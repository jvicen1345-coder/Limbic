import type { Metadata } from "next";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getSyllabi } from "@/app/actions/syllabus";
import { getCurrentProgramPhase } from "@/lib/dpt-program";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { SyllabiManager } from "@/components/student/SyllabiManager";

export const metadata: Metadata = {
  title: "My Syllabi",
};

const SUBTITLE = "Upload your course syllabi and Limbic will track your assignments automatically.";

/** Limbic Student's syllabus tracker — see app/actions/syllabus.ts for the mutations and
 *  lib/syllabus-parser.ts for the AI extraction step. Feeds the Atrium's This Week card
 *  (app/(app)/student/page.tsx), which reads the same SyllabusAssignment rows this page
 *  creates. */
export default async function SyllabiPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="My Syllabi" subtitle={SUBTITLE}>
        <StudentGate toolName="My Syllabi" />
      </StudentPlaceholderPage>
    );
  }

  const syllabi = await getSyllabi();
  const phase = getCurrentProgramPhase(new Date());
  const defaultTrimester = phase.trimesterNumber >= 1 && phase.trimesterNumber <= 9 ? phase.trimesterNumber : 1;
  const defaultYear = new Date().getFullYear();

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>My Syllabi</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: "0 0 20px" }}>
        {SUBTITLE}
      </p>

      <SyllabiManager initialSyllabi={syllabi} defaultTrimester={defaultTrimester} defaultYear={defaultYear} />
    </div>
  );
}
