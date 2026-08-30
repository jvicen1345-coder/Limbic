"use client";

import { useSyncExternalStore, useTransition } from "react";
import { MoonIcon, SunIcon, MonitorIcon } from "@/components/icons";
import { applyThemePreferenceLocally, readStoredThemePreference, type ThemePreference } from "@/lib/theme-client";
import { setThemePreferenceAction } from "@/app/actions/profile";

const CYCLE: ThemePreference[] = ["light", "dark", "system"];
const LABEL: Record<ThemePreference, string> = { light: "Light mode", dark: "Dark mode", system: "System" };
const ICON: Record<ThemePreference, React.ReactNode> = {
  light: <SunIcon size={15} />,
  dark: <MoonIcon size={15} />,
  system: <MonitorIcon size={15} />,
};

const listeners = new Set<() => void>();

/** No actual external event source ever mutates the stored preference except setPreference
 *  below (called from this component's own click handler, or from Profile's ThemeSection
 *  Save button) — this subscription just lets useSyncExternalStore know to re-render when
 *  that happens, via listeners.forEach in setPreference. */
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Reads localStorage rather than html[data-theme] — that attribute only ever holds the
 *  *resolved* light/dark value (see app/layout.tsx's init script), so it can't tell "system
 *  resolving to dark" apart from "explicitly set to dark" the way this toggle needs to, to
 *  know what to cycle to next and which label to show. */
function getSnapshot(): ThemePreference {
  return readStoredThemePreference();
}

/** Always "system" for the server-rendered markup, matching the database default for any
 *  account that hasn't chosen otherwise — see getServerSnapshot's contract, same reasoning
 *  as the old light-only version of this component before "system" existed. */
function getServerSnapshot(): ThemePreference {
  return "system";
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

/** Sidebar/drawer footer button (see components/AppShell.tsx) that cycles light → dark →
 *  system → light, persisting to both localStorage (this device, for the next reload's
 *  flash-free paint — see lib/theme-client.ts) and the database (every other device) on
 *  each click. `className` lets a caller opt into its own button styling (see the
 *  redesigned desktop sidebar footer in AppShell.tsx) instead of the default
 *  btn/btn-secondary/btn-block treatment every other caller still gets unchanged — the
 *  8px/4px margin below is specifically that default treatment's own spacing, so it's
 *  skipped whenever a caller supplies its own class instead. */
export function ThemeToggle({ className }: { className?: string } = {}) {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [, startTransition] = useTransition();

  const setPreference = (next: ThemePreference) => {
    applyThemePreferenceLocally(next);
    notifyListeners();
    startTransition(() => {
      setThemePreferenceAction(next);
    });
  };

  const next = CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length];

  return (
    <button
      type="button"
      className={className ?? "btn btn-secondary btn-block"}
      onClick={() => setPreference(next)}
      aria-label={`Switch to ${LABEL[next]}`}
      style={className == null ? { marginTop: 8, marginBottom: 4 } : undefined}
    >
      {ICON[preference]}
      {LABEL[preference]}
    </button>
  );
}
