import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { PLAYBOOKS, getPlaybook } from "@/lib/playbook-content";
import { PlaybookPage } from "@/components/playbook/PlaybookPage";
import { LimbicStudentGate } from "@/components/student/LimbicStudentGate";

export function generateStaticParams() {
  return PLAYBOOKS.map((playbook) => ({ slug: playbook.slug }));
}

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
