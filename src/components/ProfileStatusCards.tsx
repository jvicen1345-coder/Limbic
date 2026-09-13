import Link from "next/link";
import { USER_ROLES, type UserRole } from "@/lib/user-role";
import type { SubscriptionCardModel } from "@/lib/subscription-status";
import { ProfileThemeCard } from "@/components/ProfileThemeCard";
import type { ThemePreference } from "@/lib/theme-client";

function ProfileRoleCard({ role }: { role: UserRole | null }) {
  const label = USER_ROLES.find((r) => r.value === role)?.label ?? "Not set";
  return (
    <a href="#profile-role" className="card elev-sm profile-status-card">
      <div className="card-kicker">Role</div>
      <div className="profile-status-value">{label}</div>
      <div className="profile-status-action">Edit</div>
    </a>
  );
}

function ProfileSubscriptionCard({ model }: { model: SubscriptionCardModel }) {
  return (
    <Link href="/profile/membership" className="card elev-sm profile-status-card">
      <div className="card-kicker">Subscription</div>
      <div className="profile-status-value">{model.planName}</div>
      <p className="profile-status-meta">{model.status}</p>
      <div className="profile-status-action">Manage</div>
    </Link>
  );
}

export function ProfileStatusCards({
  role,
  themePreference,
  subscription,
}: {
  role: UserRole | null;
  themePreference: ThemePreference;
  subscription: SubscriptionCardModel;
}) {
  return (
    <div className="profile-header-grid">
      <ProfileRoleCard role={role} />
      <ProfileThemeCard initialTheme={themePreference} />
      <ProfileSubscriptionCard model={subscription} />
    </div>
  );
}
