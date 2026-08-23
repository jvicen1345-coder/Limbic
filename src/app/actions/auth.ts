"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { signInWithPassword, signUpWithPassword, signInAsUserId, signInAsGuest, signOutSession, getCurrentUser } from "@/lib/session";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { createPasswordResetToken, consumePasswordResetToken } from "@/lib/password-reset";
import { emailEnabled, sendPasswordResetEmail } from "@/lib/email";
import { appOrigin } from "@/lib/url";
import { clientIp } from "@/lib/request-ip";
import { consumeGuestSignupAllowance } from "@/lib/guest-rate-limit";
import { isSignInRateLimited, recordFailedSignIn, clearSignInAttempts } from "@/lib/sign-in-rate-limit";
import { isPasswordResetRateLimited, recordPasswordResetRequest } from "@/lib/password-reset-rate-limit";

// Backs the Email tab's sign-in form (see components/SignInForm.tsx). Rate-limited per
// email (see lib/sign-in-rate-limit.ts) — checked before signInWithPassword runs at all, so
// a maxed-out email doesn't even reach the password comparison. Every failure (wrong
// password or no account) counts the same way and shows the same generic message, so the
// rate limit itself can't be used to tell the two apart either.
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (await isSignInRateLimited(email)) {
    redirect(`/sign-in?error=rate_limited&email=${encodeURIComponent(email)}`);
  }

  const result = await signInWithPassword({ email, password });
  if (!result.ok) {
    await recordFailedSignIn(email);
    const code = result.reason === "needsPassword" ? "needs_password" : "invalid_credentials";
    redirect(`/sign-in?error=${code}&email=${encodeURIComponent(email)}`);
  }
  await clearSignInAttempts(email);
  revalidatePath("/", "layout");
  redirect("/home");
}

/** The "Create account" toggle on either sign-in tab (see components/SignInForm.tsx). */
export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    redirect(`/sign-in?error=password_mismatch&mode=signup&email=${encodeURIComponent(email)}`);
  }

  const result = await signUpWithPassword({ email, password });
  if (!result.ok) {
    const code = result.reason === "exists" ? "signup_exists" : "weak_password";
    redirect(`/sign-in?error=${code}&mode=signup&email=${encodeURIComponent(email)}`);
  }
  revalidatePath("/", "layout");
  redirect("/home");
}

/** "Forgot password?" (and the same link a legacy pre-password account's failed sign-in
 *  attempt routes to — see needs_password in components/SignInForm.tsx). Always redirects
 *  to the same "check your email" state regardless of whether the address is registered,
 *  so a failed attempt here can't be used to test which emails have accounts. Silently
 *  skips sending if a still-unexpired, unused token already exists for the account (see
 *  lib/password-reset.ts) rather than minting another — repeatedly clicking "resend" or
 *  fat-fingering a legacy sign-in a few times in a row shouldn't flood an inbox. */
export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email) {
    // Rate-limited before anything else below (see lib/password-reset-rate-limit.ts) — this
    // counts every request for an email, whether or not it turns out to belong to a real
    // account, since an attacker probing for valid addresses shouldn't get a different
    // limiting behavior than one who already knows a real one.
    if (await isPasswordResetRateLimited(email)) {
      redirect("/forgot-password?rate_limited=1");
    }
    await recordPasswordResetRequest(email);

    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { backupEmail: email }, { licenseEmail: email }] },
    });
    if (user) {
      const hasLiveToken = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!hasLiveToken) {
        const rawToken = await createPasswordResetToken(user.id);
        const origin = await appOrigin();
        const resetUrl = `${origin}/reset-password?token=${rawToken}`;
        const sendTo = user.email ?? user.backupEmail ?? user.licenseEmail;
        if (emailEnabled() && sendTo) {
          await sendPasswordResetEmail(sendTo, resetUrl);
        } else {
          // No RESEND_API_KEY configured (or somehow no email on file) — logged instead of
          // silently dropped, same graceful-degradation pattern as every other optional
          // integration in this app (stripeEnabled(), YOUTUBE_API_KEY, PEXELS_API_KEY). This
          // is the only way to test the reset flow end-to-end without a real Resend account.
          console.error(`[auth] Email not sent (RESEND_API_KEY unset?) — reset link for ${email}: ${resetUrl}`);
        }
      }
    }
  }

  redirect("/forgot-password?sent=1");
}

/** The link from a password-reset email — sets a new password and signs the reader
 *  straight in, since possessing a valid, unexpired, single-use token already proves
 *  ownership of the account (see lib/password-reset.ts consumePasswordResetToken). Covers
 *  both an ordinary reset and a legacy (pre-passwordHash) account's first-ever password. */
export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH || password !== confirmPassword) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=1`);
  }

  const userId = await consumePasswordResetToken(token);
  if (!userId) {
    redirect("/reset-password?invalid=1");
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await signInAsUserId(userId);
  revalidatePath("/", "layout");
  redirect("/home");
}

/** "Continue as guest" on the sign-in screen — mints a fresh isGuest account with no
 *  verification step at all, so it's IP-rate-limited (see lib/guest-rate-limit.ts) to keep
 *  it from being scripted into unlimited account creation. A no-op redirect straight to
 *  /home if the caller already has a live session — clicking it twice (or hitting back into
 *  a still-signed-in tab) shouldn't mint a second throwaway account. */
export async function guestSignInAction(formData: FormData) {
  const existing = await getCurrentUser();
  if (existing) {
    redirect("/home");
  }

  const ip = await clientIp();
  const allowed = await consumeGuestSignupAllowance(ip);
  if (!allowed) {
    redirect("/sign-in?error=guest_rate_limited");
  }

  await signInAsGuest(String(formData.get("name") ?? ""));
  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signOutAction() {
  await signOutSession();
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
