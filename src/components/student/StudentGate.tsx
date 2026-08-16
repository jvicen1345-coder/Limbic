import { LockIcon, CheckIcon } from "@/components/icons";

const STUDENT_INCLUDES = [
  "Daily Boards sharpening — one question, one term, one case a day",
  "Break down lecture slides into plain-language summaries and practice questions",
  "Find a study buddy from your cohort",
  "Practice SOAP notes with structured templates and feedback",
  "A private space for PT-school mental wellness support",
];

/**
 * Shared locked state for the Limbic Student Atrium and its five sub-pages (see
 * app/(app)/student/page.tsx and student/slides|study|soap|wellness/page.tsx) — same shell
 * as components/pro/ProGate.tsx, reused rather than duplicated since it's the same "here's
 * what you're not seeing yet" shape. No upgrade button, unlike ProGate: LimbicPRO unlocks
 * the moment someone pays, but Limbic Student is gated on a .edu sign-in email (see
 * lib/session.ts hasStudentAccess), not a purchase — there's no checkout that would make
 * this true, so this only explains the requirement rather than offering an action that
 * wouldn't actually do anything for most readers.
 */
export function StudentGate({ toolName }: { toolName: string }) {
  return (
    <div className="pro-locked">
      <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>Limbic Student Required</div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 4px", maxWidth: 380 }}>
        {`${toolName} is available to accounts signed in with a .edu email. Here’s what’s in Limbic Student once you’re signed in with your school email:`}
      </p>
      <ul className="pro-locked-list">
        {STUDENT_INCLUDES.map((item) => (
          <li key={item}>
            <CheckIcon size={14} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
