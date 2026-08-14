import Link from "next/link";
import { LockIcon, CheckIcon } from "@/components/icons";

const PRO_INCLUDES = [
  "Clinical calculators and outcome measures, scored in real time",
  "Evidence-based clinical decision rules and red flag screening",
  "A special tests library and lab values and medication reference",
  "Documentation templates and a CE hours tracker",
  "APTA and evidence-based clinical practice guidelines",
];

/** Shared locked state for every /pro/* tool page (see app/(app)/pro/calculators,
 *  /decision-rules, /red-flags, etc.) — same shell as .wellness-agent-paywall (Limbic
 *  Agent's own paywall), extended with the 5-bullet "what PRO includes" list this task's
 *  spec calls for. Every page under /pro/ except the overview itself renders this in place
 *  of its real content when `!user.isPro`. */
export function ProGate({ toolName }: { toolName: string }) {
  return (
    <div className="pro-locked">
      <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>LimbicPRO Required</div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 4px", maxWidth: 380 }}>
        {toolName} is available to LimbicPRO members. Upgrade to access clinical calculators, decision rules, lab
        values, and the full clinical toolbox.
      </p>
      <ul className="pro-locked-list">
        {PRO_INCLUDES.map((item) => (
          <li key={item}>
            <CheckIcon size={14} />
            {item}
          </li>
        ))}
      </ul>
      <Link href="/pro/membership" className="btn btn-primary">
        Upgrade to LimbicPRO
      </Link>
    </div>
  );
}
