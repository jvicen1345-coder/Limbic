"use client";

import { useSyncExternalStore } from "react";
import {
  readStoredThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "@/lib/theme-client";
import { themePreferenceLabel } from "@/lib/subscription-status";

function openThemeSection() {
  const el = document.getElementById("profile-theme");
  if (el instanceof HTMLDetailsElement) el.open = true;
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
      onClick={openThemeSection}
    >
      <div className="card-kicker">Theme</div>
      <div className="profile-status-value">{themePreferenceLabel(theme)}</div>
      <div className="profile-status-action">Change</div>
    </a>
  );
}
