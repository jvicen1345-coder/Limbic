import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getPlaybook } from "@/lib/playbook-content";
import { PlaybookPage } from "@/components/playbook/PlaybookPage";
import { LimbicStudentGate } from "@/components/student/LimbicStudentGate";

/** Retired: every value in the served guide is traced to a source, and the ported
 *  playbook that carried this slug was built from an older draft that was not. */
const RETIRED_SHOULDER_SLUG = "shoulder";

/* No generateStaticParams. This page reads the session cookie to gate on the paid tier, so it
   can never be prerendered — and once PLAYBOOKS was emptied for verification it returned an
   empty list, at which point Next treated the whole route as static and every slug answered
   500 DYNAMIC_SERVER_USAGE instead of 404. There is nothing here worth prerendering even when
   the playbooks come back, because the answer differs per reader. */

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  return playbook ? { title: playbook.name, description: playbook.summary } : { title: "Playbook" };
}

/** One playbook, rendered from its content file (see lib/playbook-content.ts). Gated on the
 *  paid LimbicStudent tier, like the hub and the rest of Limbic Boards' prep tools.
 *
 *  A reader with no student access at all gets the same 404 the rest of the student
 *  reference gives them. One who has student access but hasn't subscribed gets the upgrade
 *  instead — they arrived on a link to a named playbook, so telling them what it is and what
 *  it costs beats a dead end. */
export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) notFound();

  const { slug } = await params;

  // The shoulder playbook was retired in favour of the sourced guide served whole from
  // content/playbooks (see student/guides/shoulder-examination/route.ts). Anyone holding a
  // link to the old one gets the real thing rather than a 404.
  if (slug === RETIRED_SHOULDER_SLUG) redirect("/student/guides/shoulder-examination");

  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

  if (user.studentTier !== "limbicStudent") {
    return (
      <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>{playbook.name}</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
          {playbook.summary}
        </p>
        <LimbicStudentGate toolName="Playbooks" />
      </div>
    );
  }

  return (
    <PlaybookPage
      playbook={playbook}
      breadcrumb={[
        { label: "Student", href: "/student" },
        { label: "Playbooks", href: "/student/playbooks" },
        { label: playbook.name },
      ]}
    />
  );
}
