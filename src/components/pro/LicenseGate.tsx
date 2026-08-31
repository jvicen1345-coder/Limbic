import Link from "next/link";
import { LockIcon, CheckIcon } from "@/components/icons";

const LICENSE_INCLUDES = [
  "Build home exercise programs from a template library or from scratch",
  "Assign a program to a patient record and reuse it across visits",
  "Include the program in a downloadable, patient-friendly brief",
];

/**
 * Shared locked state for the tools gated on a verified license rather than on a purchase
 * or a school email — the same shell as components/pro/ProGate.tsx and student/StudentGate
 * .tsx, so a reader hitting any locked tool in the app gets the same shape of explanation
 * instead of one tool answering with a bare sentence on an empty page.
 *
 * Unlike ProGate this links to Profile → Credentials rather than to checkout: the thing
 * standing between the reader and the tool is a license on file, and that page is where it
 * gets added. Naming the action without linking to it (which is what /hep used to do) left
 * the only route forward as guesswork.
 */
export function LicenseGate({ toolName }: { toolName: string }) {
  return (
    <div className="pro-locked">
      <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>License Required</div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 4px", maxWidth: 380 }}>
        {toolName} is available to clinicians with a license on file. Add yours to unlock:
      </p>
      <ul className="pro-locked-list">
        {LICENSE_INCLUDES.map((item) => (
          <li key={item}>
            <CheckIcon size={14} />
            {item}
          </li>
        ))}
      </ul>
      <Link href="/profile/credentials" className="btn btn-primary">
        Add your license
      </Link>
    </div>
  );
}
