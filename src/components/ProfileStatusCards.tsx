import Link from "next/link";
import type { UserRole } from "@/lib/user-role";
import type { SubscriptionCardModel } from "@/lib/subscription-status";
import { ProfileRoleCard } from "@/components/ProfileRoleCard";
import { ProfileThemeCard } from "@/components/ProfileThemeCard";
import type { ThemePreference } from "@/lib/theme-client";

function ProfileSubscriptionCard({ model }: { model: SubscriptionCardModel }) {
  const free = model.planKey === "free";
  const action = free ? "View plans" : "Manage";
  return (
    <Link
      href="/profile/membership"
      className="card elev-sm profile-status-card"
      aria-label={free ? `View plans: ${model.planName}` : `Manage subscription: ${model.planName}`}
    >
      <div className="card-kicker">Subscription</div>
      <div className="profile-status-value">{model.planName}</div>
      {model.statusParts.length > 0 ? (
        <p className="profile-status-meta">
          {model.statusParts.map((part) => (
            <span key={part} className="profile-status-meta-part">
              {part}
            </span>
          ))}
        </p>
      ) : null}
      <div className="profile-status-action">{action}</div>
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
