import "server-only";
import { getCurrentUser } from "@/lib/session";

/** Comma-separated sign-in emails allowed into any admin-only surface in this app — right
 *  now the Founding Funders manual claim panel (app/actions/founding-funders.ts) and the
 *  "wipe all users" tool (app/actions/admin.ts). Matched against both the General sign-in
 *  email and a PT license sign-in's email, case-insensitively, since either can be how an
 *  admin's own account signed in. Leave unset (see .env.example) to disable every admin
 *  surface — none of them render or execute without at least one email configured here. */
function adminEmails(): string[] {
  return (process.env.FOUNDING_FUNDERS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isSiteAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const allowed = adminEmails();
  if (allowed.length === 0) return false;
  const candidates = [user.email, user.licenseEmail].filter((e): e is string => !!e).map((e) => e.toLowerCase());
  return candidates.some((e) => allowed.includes(e));
}
