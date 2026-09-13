"use client";

import { useSyncExternalStore } from "react";
import {
  readStoredThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "@/lib/theme-client";
import { themePreferenceLabel } from "@/lib/subscription-status";

function openThemeSection(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const el = document.getElementById("profile-theme");
  if (!(el instanceof HTMLDetailsElement)) return;
  el.open = true;
  el.scrollIntoView({ block: "start" });
  const moveFocus = () => {
    const firstCard = el.querySelector<HTMLElement>(".theme-card");
    const summary = el.querySelector<HTMLElement>("summary");
    (firstCard ?? summary)?.focus();
  };
  moveFocus();
  requestAnimationFrame(moveFocus);
}

/** Profile header Theme shortcut — follows the same local preference store as ThemeToggle
 *  so picking Light/Dark/System in ThemeSection (or the sidebar toggle) updates this card
 *  immediately, without waiting for Save or a reload. */
export function ProfileThemeCard({ initialTheme }: { initialTheme: ThemePreference }) {
  const theme = useSyncExternalStore(
    subscribeThemePreference,
    () => readStoredThemePreference(initialTheme),
    () => initialTheme,
  );

  return (
    <a
      href="#profile-theme"
      className="card elev-sm profile-status-card"
      aria-label={`Change theme: ${themePreferenceLabel(theme)}`}
      onClick={openThemeSection}
    >
      <div className="card-kicker">Theme</div>
      <div className="profile-status-value">{themePreferenceLabel(theme)}</div>
      <div className="profile-status-action">Change</div>
    </a>
  );
}
