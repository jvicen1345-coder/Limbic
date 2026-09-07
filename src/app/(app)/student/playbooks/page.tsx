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
        <div className="playbook-hub-grid">
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
      )}
    </div>
  );
}
