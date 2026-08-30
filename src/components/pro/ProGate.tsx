import Link from "next/link";
import { LockIcon, CheckIcon } from "@/components/icons";

const PRO_INCLUDES = [
  "Limbic Agent — AI-powered clinical decision support at the point of care",
  "Force Lab — import and analyze handheld dynamometer data",
  "Your Clinician Dashboard — caseload, outcome tracking, and pre-visit briefs",
  "The HEP Builder — build and assign home exercise programs",
  "CE Tracker — continuing education hours toward license renewal",
];

/** Shared locked state for the five tools that still require LimbicPRO (HEP Builder, CE
 *  Tracker, the Clinician Dashboard, Force Lab, Limbic Agent — see each page's own gate).
 *  Same shell as .wellness-agent-paywall (Limbic Agent's own paywall). The clinical
 *  reference toolbox (calculators, decision rules, special tests, lab values, medications,
 *  documentation, guidelines) no longer renders this — it's free to any signed-in user now
 *  (see FreeToolBanner.tsx) — so PRO_INCLUDES above only lists what's actually still
 *  paywalled, not the old five-bullet list that used to describe those free tools too. */
export function ProGate({ toolName }: { toolName: string }) {
  return (
    <div className="pro-locked">
      <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>LimbicPRO Required</div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 4px", maxWidth: 380 }}>
        {toolName} is one of five tools included with LimbicPRO:
      </p>
      <ul className="pro-locked-list">
        {PRO_INCLUDES.map((item) => (
          <li key={item}>
            <CheckIcon size={14} />
            {item}
          </li>
        ))}
      </ul>
      <Link href="/profile/membership" className="btn btn-primary">
        Upgrade to LimbicPRO
      </Link>
    </div>
  );
}
