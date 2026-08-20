import "server-only";
import { Resend } from "resend";

/** Whether real email delivery is configured — gates password-reset emails the same
 *  graceful-degradation way stripeEnabled()/YOUTUBE_API_KEY/PEXELS_API_KEY do elsewhere in
 *  this app. Unset in dev/preview by default: requestPasswordResetAction (see
 *  app/actions/auth.ts) falls back to logging the reset link to the server console instead
 *  of emailing it, so the flow is still fully testable without a real Resend account. */
export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

let _resend: Resend | null = null;
function client(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// A verified sending domain in Resend is required for real delivery — an unverified "from"
// address will fail (or get spam-folder'd) at send time regardless of RESEND_API_KEY being
// set. That verification step is entirely on the Resend dashboard (DNS records), not
// anything this code can do — see the setup note this returns alongside emailEnabled()'s
// false case wherever it's surfaced to an admin.
const FROM = process.env.EMAIL_FROM ?? "Limbic <noreply@limbic.center>";

/** Sends the password-reset link a reader gets from either "Forgot password?" or a legacy
 *  (pre-password) account's first sign-in attempt (see requestPasswordResetAction in
 *  app/actions/auth.ts, which is the only caller and already treats "email not configured"
 *  as expected-and-logged rather than a hard failure). */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await client().emails.send({
    from: FROM,
    to,
    subject: "Reset your Limbic password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #12203a;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 14px; line-height: 1.6;">
          Someone requested a password reset for this Limbic account. Click below to choose a
          new password — this link works once and expires in an hour.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #092744; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Set a new password
          </a>
        </p>
        <p style="font-size: 12.5px; color: #62707c; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email — your password won't
          change unless you click the link above and set a new one.
        </p>
      </div>
    `,
  });
}

/** Sends the "your credentials have been verified" confirmation once an admin approves a
 *  pending submission (see verifyLicenseAction in app/actions/license.ts, the only caller,
 *  which already treats "email not configured" as expected-and-logged the same way
 *  requestPasswordResetAction does above). maskedLicenseNumber should already be run through
 *  maskLicenseNumber (see lib/license-verification.ts) before being passed in here — this
 *  function doesn't mask it itself, so a caller that forgets would leak the full number. */
export async function sendLicenseVerifiedEmail(to: string, name: string, licenseState: string, maskedLicenseNumber: string): Promise<void> {
  await client().emails.send({
    from: FROM,
    to,
    subject: "Your Limbic credentials have been verified",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #12203a;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Your credentials have been verified</h1>
        <p style="font-size: 14px; line-height: 1.6;">
          Hi ${name}, your ${licenseState} physical therapy license (${maskedLicenseNumber}) has
          been reviewed and verified.
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          Clinician-only features are now available on your account, including the HEP
          Builder, Retracted Articles, and the rest of the Clinician tools section in your
          sidebar.
        </p>
        <p style="font-size: 12.5px; color: #62707c; line-height: 1.6;">
          If you weren't expecting this, or believe your license was verified in error, reply
          to this email and let us know.
        </p>
      </div>
    `,
  });
}
