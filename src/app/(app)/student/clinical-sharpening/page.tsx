import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { StudentPlaceholderPage } from "@/components/StudentPlaceholderPage";
import { StudentGate } from "@/components/student/StudentGate";
import { AlertCircleIcon, NetworkIcon, ListIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Clinical Sharpening",
};

const SUBTITLE = "Three daily games for clinical reasoning, anatomy recall, and treatment sequencing — a few minutes a day.";

// Same shape as the Atrium's own PATHS array (see app/(app)/student/page.tsx) — these three
// already live at /games/* as fully standalone, freely accessible daily games (see PRs
// #201-#203); this page is just a Student-area shortcut into them, not a separate gate or
// a duplicate implementation.
const GAMES = [
  {
    title: "Differential",
    description: "Five clues, one condition. Guess it in as few clues as possible.",
    href: "/games/differential",
    icon: AlertCircleIcon,
    accent: "blue",
  },
  {
    title: "Anatomy Connect",
    description: "Match each muscle to its nerve, primary action, and region.",
    href: "/games/anatomy-connect",
    icon: NetworkIcon,
    accent: "green",
  },
  {
    title: "Rehab Sequence",
    description: "Arrange eight interventions into the correct clinical order.",
    href: "/games/rehab-sequence",
    icon: ListIcon,
    accent: "purple",
  },
] as const;

export default async function ClinicalSharpeningPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <StudentPlaceholderPage title="Clinical Sharpening" subtitle={SUBTITLE}>
        <StudentGate toolName="Clinical Sharpening" />
      </StudentPlaceholderPage>
    );
  }

  return (
    <StudentPlaceholderPage title="Clinical Sharpening" subtitle={SUBTITLE}>
      <div className="atrium-paths-grid" style={{ marginTop: 20 }}>
        {GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <Link key={game.href} href={game.href} className={`atrium-path-card atrium-path-card--${game.accent}`}>
              <span className="atrium-path-icon">
                <Icon size={20} />
              </span>
              <span className="atrium-path-body">
                <span className="atrium-path-title" style={{ display: "block" }}>
                  {game.title}
                </span>
                <span className="atrium-path-desc">{game.description}</span>
              </span>
              <ChevronRightIcon size={18} className="atrium-path-arrow" />
            </Link>
          );
        })}
      </div>
    </StudentPlaceholderPage>
  );
}
