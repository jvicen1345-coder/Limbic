import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { PLAYBOOKS, playbookChecklist } from "@/lib/playbook-content";
import { ChevronRightIcon } from "@/components/icons";
import { StudentGate } from "@/components/student/StudentGate";
import { LimbicStudentGate } from "@/components/student/LimbicStudentGate";

export const metadata: Metadata = {
  title: "Playbooks",
};

const SUBTITLE =
  "Whole regional examinations in the order you'd perform them — the sequence, the numbers each finding is measured against, and the treatment it points to.";

/** Index of the Limbic Playbooks (see lib/playbook-content.ts). Same shape as the
 *  Specialty Tracks hub next door — one card per playbook.
 *
 *  Gated on the paid LimbicStudent tier, not just a .edu sign-in: the playbooks are the
 *  study guide Limbic Boards is sold on (see app/(app)/boards/page.tsx, which lists them in
 *  its own Study Guide tab), so they sit behind the same line every other Boards prep tool
 *  does. Two gates rather than one, same branching as that page: a reader with no student
 *  access at all is told what Limbic Student is, and one who has it but hasn't subscribed
 *  gets the upgrade button, since for them there is something to buy. */
export default async function PlaybooksHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Playbooks</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>{SUBTITLE}</p>

      {!hasStudentAccess(user) ? (
        <StudentGate toolName="Playbooks" />
      ) : user.studentTier !== "limbicStudent" ? (
        <LimbicStudentGate toolName="Playbooks" />
      ) : (
        <>
        {/* Said out loud rather than quietly shipping a shorter list: four regions were here
            last week and a student who used them deserves to know where they went. */}
        <p className="playbook-hub-note">
          <b>Four regional playbooks are withdrawn while they are checked.</b> Hip, knee, ankle and joint mobilization
          were written without a source behind each value. They come back one region at a time, once every number in
          them is traced to a paper you can read.
        </p>
        <div className="playbook-hub-grid">
          {/* The shoulder guide is a fixed HTML asset served whole rather than a playbook
              built from lib/playbooks — see the route handler for why. It navigates in place
              like every other card; the document carries its own link back to this hub. */}
          <div className="playbook-hub-card playbook-hub-card-guide">
            <h2 className="playbook-hub-card-name">Shoulder Examination</h2>
            <p className="playbook-hub-card-desc">
              A full shoulder screen in the order you&rsquo;d perform it. Every value says where it came from — what the
              literature measured, what is only convention, and what the studies still argue about — with 82 sources
              linked, a taught lane for what your own program says, and a practice plan built from what you miss.
            </p>
            <span className="playbook-hub-card-meta">12 sections · 32 exam items · 82 references</span>
            <Link href="/student/guides/shoulder-examination" className="specialty-explore-btn">
              Open
              <ChevronRightIcon size={14} />
            </Link>
          </div>
          {PLAYBOOKS.map((playbook) => (
            <div className="playbook-hub-card" key={playbook.slug}>
              <h2 className="playbook-hub-card-name">{playbook.name}</h2>
              <p className="playbook-hub-card-desc">{playbook.summary}</p>
              <span className="playbook-hub-card-meta">
                {playbook.sections.length} sections · {playbookChecklist(playbook).length} exam items
              </span>
              <Link href={`/student/playbooks/${playbook.slug}`} className="specialty-explore-btn">
                Open
                <ChevronRightIcon size={14} />
              </Link>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
