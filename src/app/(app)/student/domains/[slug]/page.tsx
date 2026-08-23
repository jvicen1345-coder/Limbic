import { notFound } from "next/navigation";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { domainFromSlug, questionsForDomain } from "@/lib/board-content";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { DomainBoardConnections } from "@/components/student/DomainBoardConnections";

export default async function DomainPracticePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = domainFromSlug(slug);
  if (!domain) notFound();

  const user = await getCurrentUser();
  if (!user) return null;

  const subtitle = `Practice questions tagged ${domain} — pulled from the same bank Daily Sharpening draws from.`;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title={domain} subtitle={subtitle}>
        <StudentGate toolName={`${domain} Practice`} />
      </StudentPlaceholderPage>
    );
  }

  const questions = questionsForDomain(domain);

  return (
    <StudentPlaceholderPage title={domain} subtitle={subtitle}>
      <div className="card elev-sm" style={{ marginTop: 20 }}>
        <DomainBoardConnections domain={domain} questions={questions} />
      </div>
    </StudentPlaceholderPage>
  );
}
