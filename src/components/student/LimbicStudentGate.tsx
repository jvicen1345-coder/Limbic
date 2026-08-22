import Link from "next/link";
import { LockIcon } from "@/components/icons";

/** Locked state for a Limbic Student feature that's actually gated on the paid $5/mo
 *  subscription (studentTier === "limbicStudent" — see lib/session.ts), not just a .edu
 *  sign-in email. Distinct from StudentGate.tsx, which explains the free .edu requirement
 *  and has no upgrade button since there's nothing to purchase there — this one does, same
 *  "unlocks the moment someone pays" shape as components/pro/ProGate.tsx. */
export function LimbicStudentGate({ toolName }: { toolName: string }) {
  return (
    <div className="pro-locked">
      <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>LimbicStudent Required</div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 16px", maxWidth: 380 }}>
        {toolName} is included with the $5/month LimbicStudent plan.
      </p>
      <Link href="/profile/membership" className="btn btn-primary">
        Upgrade to LimbicStudent
      </Link>
    </div>
  );
}
