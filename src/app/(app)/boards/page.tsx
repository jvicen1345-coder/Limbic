import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { prisma } from "@/lib/db";
import { GraduationCapIcon, ChevronRightIcon, ZapIcon } from "@/components/icons";
import { BoardsStreakCard } from "@/components/BoardsStreakCard";
import { buildReadingCalendarWeeks } from "@/lib/reading-calendar";

const CALENDAR_WINDOW_DAYS = 365;

/** The Limbic Boards hub — a light landing page above the actual daily practice (see
 *  app/(app)/boards/sharpening/page.tsx, which used to live at this URL before Limbic
 *  Student split "Boards" and "Daily Sharpening" into two distinct nav items). A licensed
 *  PT/clinician account only ever gets the one daily question, which lives entirely on the
 *  Sharpening page — there's nothing hub-worthy to show them here, so they skip straight
 *  through instead of landing on a page with nothing for them. */
export default async function BoardsHubPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isStudent = hasStudentAccess(user);
  const isClinician = user.licenseNumber != null;
  if (!isStudent && !isClinician) redirect("/pro");
  if (!isStudent) redirect("/boards/sharpening");

  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - (CALENDAR_WINDOW_DAYS - 1));
  const activityRows = await prisma.boardActivity.findMany({
    where: { userId: user.id, createdAt: { gte: windowStart } },
    select: { createdAt: true },
  });
  const weeks = buildReadingCalendarWeeks(activityRows.map((r) => r.createdAt));

  return (
    <div className="screen-pad" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <GraduationCapIcon size={22} style={{ color: "var(--color-accent)" }} />
        <h1 style={{ fontSize: 24, margin: 0 }}>Limbic Boards</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>
        Your NPTE prep hub — a board-style question and a term to lock in every day, building toward exam day.
      </p>

      <Link
        href="/boards/sharpening"
        className="card elev-sm card-hoverable"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, textDecoration: "none", color: "inherit", marginBottom: 14 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ZapIcon size={20} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <div>
            <div className="card-title">Daily Sharpening</div>
            <p className="card-body" style={{ marginTop: 4 }}>Today&rsquo;s question and term — two minutes a day.</p>
          </div>
        </div>
        <ChevronRightIcon size={18} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
      </Link>

      <BoardsStreakCard streakDays={user.boardsStreakDays} weeks={weeks} />
    </div>
  );
}
