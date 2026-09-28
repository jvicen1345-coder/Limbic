import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getFocusData } from "@/app/actions/focus";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { FocusTimer } from "@/components/student/FocusTimer";

export const metadata: Metadata = {
  title: "Focus",
};

// The Focus timer keeps its own calm look ("Slow Tide") inside the app frame, so it loads
// its own two faces here rather than using the app's Plus Jakarta Sans. Both are exposed as
// CSS variables that src/styles/focus.css reads, scoped to this page only.
const display = Fraunces({ subsets: ["latin"], weight: ["300", "400"], variable: "--ft-font-display", display: "swap" });
const body = Figtree({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--ft-font-body", display: "swap" });

const SUBTITLE = "A calm study timer that checks what you remember after each block and brings topics back for review.";

/** Focus timer (see components/student/FocusTimer.tsx for the timer and
 *  app/actions/focus.ts for what gets saved). Gated the same way as the rest of the
 *  Student Atrium, and free for everyone who reaches it. */
export default async function FocusPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Focus" subtitle={SUBTITLE}>
        <StudentGate toolName="Focus" />
      </StudentPlaceholderPage>
    );
  }

  const data = await getFocusData();
  if (!data) return null;

  return <FocusTimer initial={data} fontClassName={`${display.variable} ${body.variable}`} />;
}
