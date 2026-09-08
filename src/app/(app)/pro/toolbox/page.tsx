import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getClinicMembershipInfo } from "@/app/actions/clinic-pro";
import { toolboxFor } from "@/lib/clinician-toolbox";
import { ChevronRightIcon, LockIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Clinical Toolbox",
};

/** One page answering "what is in LimbicPRO, and when would I use it".
 *
 *  The sidebar used to list the same tools, as a dozen rows of equal weight in the order they
 *  were added — a caseload dashboard beside a lab-value lookup beside a CE log. Nothing there
 *  said which of those you'd want mid-session versus at the end of the week, and a reader who
 *  hadn't clicked every row didn't know what half of them were. It now carries only the tools
 *  you open and keep working in, and this page is where the rest of them live.
 *
 *  Grouped by when you'd reach for a tool rather than by what it costs. A locked card still
 *  shows what the tool does — a reader deciding whether LimbicPRO is worth it is exactly the
 *  reader who needs the description, and hiding it is how /pro/guidelines and
 *  /pro/documentation ended up unreachable in the first place. */
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

      {/* Anchors for the LimbicPRO tour (see lib/tours.ts). Keyed off each group's own
          title rather than its position, so reordering or adding a group cannot silently
          point a tour step at the wrong one. */}
      <div data-tour="toolbox-groups">
      {groups.map((group) => (
        <section
          className="toolbox-group"
          key={group.title}
          data-tour={`toolbox-group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        >
          <div className="toolbox-group-head">
            <h2 className="toolbox-group-title">{group.title}</h2>
            <p className="toolbox-group-blurb">{group.blurb}</p>
          </div>
          <div className="pro-tools-grid">
            {group.tools.map((tool) => {
              const locked = Boolean(tool.pro) && !user.isPro;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`pro-tool-card${locked ? " pro-tool-card--locked" : ""}`}
                >
                  <div className="toolbox-card-head">
                    <span className="pro-tool-card-title">{tool.name}</span>
                    {locked && (
                      <span className="toolbox-lock">
                        <LockIcon size={11} />
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="pro-tool-card-desc">{tool.description}</p>
                  <div className="pro-tool-card-footer">
                    <span className="pro-tool-card-arrow">
                      {locked ? "See what it does" : "Open"}
                      <ChevronRightIcon size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}
