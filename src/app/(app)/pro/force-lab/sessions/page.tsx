import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getForceLabSessions, getUserForceUnit } from "@/app/actions/force-lab";
import { ProGate } from "@/components/pro/ProGate";
import { AllSessionsTable } from "@/components/pro/force-lab/AllSessionsTable";

export const metadata: Metadata = {
  title: "Force Lab — All Sessions",
};

/** Full Force Lab session list, reached from the main tool's compact Recent Sessions card
 *  ("View All Sessions" — see ForceLabWorkspace.tsx, which only shows the single most recent
 *  session inline now that the always-expanded list has moved here). Same (app) route group
 *  placement as /pro/force-lab itself, for the sidebar. */
export default async function ForceLabSessionsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!user.isPro) {
    return (
      <div className="screen-pad">
        <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Force Lab</h1>
        <ProGate toolName="Force Lab" />
      </div>
    );
  }

  const [sessions, forceUnit] = await Promise.all([getForceLabSessions(), getUserForceUnit()]);

  return (
    <div className="screen-pad forcelab-page page-enter">
      <div className="forcelab-header-row">
        <div>
          <Link href="/pro/force-lab" className="clindash-seats-add-link" style={{ display: "inline-block", marginBottom: 6 }}>
            ← Back to Force Lab
          </Link>
          <h1 className="forcelab-title">All Sessions</h1>
        </div>
      </div>

      <div className="card elev-sm">
        <AllSessionsTable sessions={sessions} forceUnit={forceUnit} />
      </div>
    </div>
  );
}
