import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { PLAYBOOKS, getPlaybook } from "@/lib/playbook-content";
import { PlaybookPage } from "@/components/playbook/PlaybookPage";

export function generateStaticParams() {
  return PLAYBOOKS.map((playbook) => ({ slug: playbook.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  return playbook ? { title: playbook.name, description: playbook.summary } : { title: "Playbook" };
}

/** One playbook, rendered from its content file (see lib/playbook-content.ts). Gated on
 *  Limbic Student like the rest of the student clinical reference. */
export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) notFound();

  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

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
