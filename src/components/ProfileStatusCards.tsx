import Link from "next/link";
import type { UserRole } from "@/lib/user-role";
import type { SubscriptionCardModel } from "@/lib/subscription-status";
import { ProfileRoleCard } from "@/components/ProfileRoleCard";
import { ProfileThemeCard } from "@/components/ProfileThemeCard";
import type { ThemePreference } from "@/lib/theme-client";

function ProfileSubscriptionCard({ model }: { model: SubscriptionCardModel }) {
  return (
    <Link href="/profile/membership" className="card elev-sm profile-status-card">
      <div className="card-kicker">Subscription</div>
      <div className="profile-status-value">{model.planName}</div>
      <p className="profile-status-meta">
        {model.statusParts.map((part) => (
          <span key={part} className="profile-status-meta-part">
            {part}
          </span>
        ))}
      </p>
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
