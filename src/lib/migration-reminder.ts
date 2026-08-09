import "server-only";
import { prisma } from "@/lib/db";

const INACTIVITY_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

/** How long "Maybe later" snoozes the graduation-transition card on Home before it shows
 *  again (see app/(app)/page.tsx, components/GraduationTransitionCard.tsx). */
export const GRADUATION_TRANSITION_SNOOZE_DAYS = 7;

/**
 * Finds student-tier accounts that are due their one-time migration reminder — no backup
 * email on file, never sent one before, and inactive for 30+ days — and marks
 * migrationEmailSentAt on each. That flag is what app/(app)/page.tsx reads to show the
 * in-app amber banner (components/MigrationReminderBanner.tsx); there's no real email
 * transport wired up yet, so "sending the email" here just means flipping the flag that
 * unlocks the in-app notification. Invoked automatically by
 * app/api/cron/migration-reminders/route.ts.
 */
export async function checkMigrationReminders() {
  const studentsNeedingReminder = await prisma.user.findMany({
    where: {
      studentTier: { not: "none" },
      backupEmail: null,
      migrationEmailSentAt: null,
      lastVisitedAt: {
        lt: new Date(Date.now() - INACTIVITY_THRESHOLD_MS),
      },
    },
  });

  for (const student of studentsNeedingReminder) {
    await prisma.user.update({
      where: { id: student.id },
      data: { migrationEmailSentAt: new Date() },
    });
  }

  return studentsNeedingReminder.length;
}
