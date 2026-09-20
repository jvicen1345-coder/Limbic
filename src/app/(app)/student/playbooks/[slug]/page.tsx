import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, hasStudentAccess, hasPlaybookAccess } from "@/lib/session";
import { getPlaybook } from "@/lib/playbook-content";
import { PlaybookPage } from "@/components/playbook/PlaybookPage";
import { LimbicStudentGate } from "@/components/student/LimbicStudentGate";
import { ChooseFreePlaybookButton } from "@/components/playbook/ChooseFreePlaybookButton";

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

/** One playbook, rendered from its content file (see lib/playbook-content.ts). Free to
 *  browse for any student (see hasStudentAccess), but reading the whole thing still needs
 *  either the paid LimbicStudent tier or this slug being the reader's one free pick (see
 *  hasPlaybookAccess in lib/session.ts) — same split as the hub and the rest of Limbic
 *  Boards' prep tools.
 *
 *  A reader with no student access at all gets the same 404 the rest of the student
 *  reference gives them. One who has student access but no access to this specific slug
 *  gets an offer instead — they arrived on a link to a named playbook, so telling them what
 *  it is and how to open it (their free pick, if unspent, or a subscription) beats a dead
 *  end. */
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

  if (!hasPlaybookAccess(user, slug)) {
    return (
      <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>{playbook.name}</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>
          {playbook.summary}
        </p>
        {user.freePlaybookSlug == null ? (
          <div className="pro-locked">
            <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px", maxWidth: 380 }}>
              You haven&rsquo;t spent your one free playbook yet — make it this one, or{" "}
              <Link href="/profile/membership">subscribe to Limbic Student</Link> for every playbook.
            </p>
            <ChooseFreePlaybookButton slug={slug} name={playbook.name} className="btn btn-primary" />
          </div>
        ) : (
          <LimbicStudentGate toolName="Playbooks" />
        )}
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
