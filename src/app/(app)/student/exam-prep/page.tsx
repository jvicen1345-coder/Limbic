import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess, hasPlaybookAccess } from "@/lib/session";
import { EXAM_PREP_GUIDES, examPrepHref } from "@/lib/exam-prep";
import { GUIDES, guideHref } from "@/lib/guides";
import { isSiteAdmin } from "@/lib/admin";
import { ChevronRightIcon, LockIcon } from "@/components/icons";
import { StudentGate } from "@/components/student/StudentGate";
import { ChooseFreePlaybookButton } from "@/components/playbook/ChooseFreePlaybookButton";

export const metadata: Metadata = {
  title: "Exam Prep",
};

const SUBTITLE =
  "Study guides built for exams and practicals — key points with spaced review, quizzes, flashcards, cases, a timed mock quiz, games and a diagram atlas. For working through a real evaluation, use the Playbooks.";

/** Index of the Exam Prep guides (lib/exam-prep.ts). Same access split as the Playbooks hub
 *  (app/(app)/student/playbooks/page.tsx): the paid LimbicStudent tier opens every guide, and
 *  a student without it can spend their one free pick here instead. */
export default async function ExamPrepHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Exam Prep</h1>
        <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>{SUBTITLE}</p>
        <StudentGate toolName="Exam Prep" />
      </div>
    );
  }

  const admin = await isSiteAdmin();
  const paid = user.studentTier === "limbicStudent";
  const freeSlug = user.freePlaybookSlug;

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Exam Prep</h1>
      <p style={{ fontSize: 14, color: "var(--color-neutral-700)", maxWidth: 640, lineHeight: 1.5, margin: 0 }}>{SUBTITLE}</p>

      {!paid && !admin && (
        <p className="playbook-hub-tier-note">
          {freeSlug
            ? "You've already used your one free pick — every guide below is part of the $3/mo Limbic Student plan."
            : "Pick one guide or playbook to read for free. Everything else is part of the $3/mo Limbic Student plan."}{" "}
          <Link href="/profile/membership">Upgrade to Limbic Student →</Link>
        </p>
      )}

      <div className="playbook-hub-grid">
        {EXAM_PREP_GUIDES.map((guide) => {
          const unlocked = admin || hasPlaybookAccess(user, guide.slug);
          const playbook = guide.playbook ? GUIDES.find((g) => g.slug === guide.playbook) : undefined;
          return (
            <div className="playbook-hub-card" key={guide.slug}>
              <h2 className="playbook-hub-card-name">{guide.name}</h2>
              <p className="playbook-hub-card-desc">{guide.description}</p>
              <span className="playbook-hub-card-meta">
                {guide.topics} topics · {guide.keyPoints} key points · {guide.questions} practice questions
              </span>
              {playbook && (
                <span className="playbook-hub-card-meta">
                  Pairs with the <Link href={guideHref(playbook)}>{playbook.name}</Link> playbook
                </span>
              )}
              {unlocked ? (
                <Link href={examPrepHref(guide)} className="specialty-explore-btn">
                  Open
                  <ChevronRightIcon size={14} />
                </Link>
              ) : freeSlug == null ? (
                <ChooseFreePlaybookButton slug={guide.slug} name={guide.name} className="playbook-hub-pick-btn" />
              ) : (
                <Link href="/profile/membership" className="playbook-hub-locked">
                  <LockIcon size={12} />
                  Limbic Student
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
