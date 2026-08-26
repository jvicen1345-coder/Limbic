import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { LockIcon } from "@/components/icons";
import { ClinicSetupForm } from "@/components/pro/dashboard/ClinicSetupForm";

export const metadata: Metadata = {
  title: "Set Up Your Clinic",
};

/** Clinic PRO's one-time setup flow — authenticated, Clinic PRO subscription required (see
 *  User.isClinicPro, the same billing flag /profile/membership's tier comparison already
 *  gates the "Clinic PRO" purchase button on). Lives in the (app) route group for the
 *  AppShell sidebar — see .clindash-standalone-page in globals.css, still used for this
 *  page's own centered-card content shell inside that layout. */
export default async function ClinicSetupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (!user.isClinicPro) {
    return (
      <div className="clindash-standalone-page">
        <div className="pro-locked">
          <LockIcon size={22} style={{ color: "var(--color-migration-gold)" }} />
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, marginTop: 10 }}>Clinic PRO Required</div>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "8px 0 4px", maxWidth: 380 }}>
            Setting up a clinic team is available to Clinic PRO members — invite clinicians, share reporting, and
            manage seats from one team dashboard.
          </p>
          <Link href="/profile/membership" className="btn btn-primary">
            Upgrade to Clinic PRO
          </Link>
        </div>
      </div>
    );
  }

  const existingClinic = await prisma.clinic.findUnique({ where: { adminUserId: user.id } });
  if (existingClinic) redirect("/pro/dashboard");

  return (
    <div className="clindash-standalone-page">
      <h1 className="clindash-standalone-title">Set Up Your Clinic PRO Account</h1>
      <p className="clindash-standalone-subtitle">Create your clinic to start managing your team.</p>
      <ClinicSetupForm />
    </div>
  );
}
