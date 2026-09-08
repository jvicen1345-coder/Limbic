import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getClinicMembershipInfo } from "@/app/actions/clinic-pro";
import { toolboxFor } from "@/lib/clinician-toolbox";
import { ToolboxBrowser } from "@/components/pro/ToolboxBrowser";

export const metadata: Metadata = {
  title: "Clinical Toolbox",
};

/** One page answering "what is in LimbicPRO, and when would I use it".
 *
 *  The sidebar used to list the same tools, as a dozen rows of equal weight in the order they
 *  were added — a caseload dashboard beside a lab-value lookup beside a CE log. Nothing there
 *  said which of those you'd want mid-session versus at the end of the week, and a reader who
 *  hadn't clicked every row didn't know what half of them were. It is now four rows, and this
 *  page is the only route to the other eleven — which makes the descriptions below the
 *  product rather than decoration.
 *
 *  Grouped by when you'd reach for a tool rather than by what it costs. A locked card still
 *  shows what the tool does — a reader deciding whether LimbicPRO is worth it is exactly the
 *  reader who needs the description, and hiding it is how /pro/guidelines and
 *  /pro/documentation ended up unreachable in the first place.
 *
 *  Deliberately still a server component. Access is decided here — toolboxFor drops what this
 *  reader cannot reach at all, and isPro decides which cards show a lock — and only the
 *  filtering is handed to the client (see components/pro/ToolboxBrowser.tsx), so no gate is
 *  enforced in a place a reader could reach around. */
export default async function ClinicianToolboxPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const membership = await getClinicMembershipInfo();
  const groups = toolboxFor({ isClinicAdmin: Boolean(membership?.isAdmin) });

  return (
    <div className="screen-pad pro-wide-page">
      <h1 className="toolbox-title">Clinical Toolbox</h1>
      <p className="toolbox-subtitle">
        Everything in LimbicPRO, grouped by when you&rsquo;d reach for it.
        {!user.isPro && " Tools marked PRO need a subscription; the rest are yours already."}
      </p>

      <ToolboxBrowser groups={groups} isPro={user.isPro} />
    </div>
  );
}
