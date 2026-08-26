import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { previewClinicInvite } from "@/app/actions/clinic-pro";
import { AcceptInviteButton } from "@/components/pro/dashboard/AcceptInviteButton";

export const metadata: Metadata = {
  title: "Accept Clinic Invitation",
};

/** Public page — no auth required to view, sign-in required to accept (see
 *  AcceptInviteButton, which calls acceptClinicInvite and re-checks the session itself).
 *  Outside the (app) route group like its sibling Clinic PRO pages, so an invited reader
 *  with no Limbic account yet doesn't hit the app shell's onboarding gate before even
 *  seeing what they were invited to. */
export default async function AcceptInvitePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const user = await getCurrentUser();
  const invite = token ? await previewClinicInvite(token) : null;

  return (
    <div className="clindash-standalone-page">
      {!invite ? (
        <div className="card elev-sm">
          <h1 className="clindash-standalone-title" style={{ fontSize: 18 }}>
            This invitation link is no longer valid
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>
            It may have expired, already been used, or the link may be incomplete. Ask your clinic admin to send a
            new invitation.
          </p>
        </div>
      ) : (
        <div className="card elev-sm">
          <h1 className="clindash-standalone-title" style={{ fontSize: 20 }}>
            Join {invite.clinicName} on Limbic Center
          </h1>
          <p className="clindash-standalone-subtitle" style={{ margin: "0 0 18px" }}>
            {invite.adminName} has invited you to join their team.
          </p>
          {!user ? (
            <>
              <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
                Sign in to accept your invitation to {invite.clinicName}. Once you&rsquo;re signed in, return to this
                link to finish joining.
              </p>
              <Link href="/sign-in" className="btn btn-primary btn-block">
                Sign In
              </Link>
            </>
          ) : (
            <AcceptInviteButton token={token!} />
          )}
        </div>
      )}
    </div>
  );
}
