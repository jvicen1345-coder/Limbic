import { redirect } from "next/navigation";

/** Membership management moved to Profile — see app/(app)/profile/membership/page.tsx —
 *  so it lives alongside Profile's other account-settings sections instead of under the
 *  LimbicPro feature-comparison section. This route stays only so an old link or
 *  bookmark still lands somewhere real. */
export default function ProMembershipRedirectPage() {
  redirect("/profile/membership");
}
