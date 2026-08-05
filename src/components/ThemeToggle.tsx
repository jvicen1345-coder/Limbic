"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

/** No actual external event source ever mutates html[data-theme] except setTheme below
 *  (called from this component's own click handler) — this subscription just lets
 *  useSyncExternalStore know to re-render when that happens, via listeners.forEach in
 *  setTheme. */
function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Reads the attribute app/layout.tsx's blocking init script already set on <html> before
 *  paint — never guesses independently, so this always agrees with whatever's actually
 *  rendered. */
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Always "light" for the server-rendered markup, since the server has no way to know a
 *  visitor's stored preference (see the init script comment in app/layout.tsx) — matching
 *  useSyncExternalStore's getServerSnapshot contract lets React swap in the real
 *  getSnapshot() value right after hydration without a mismatch warning, no manual
 *  effect-based setState required. */
function getServerSnapshot(): Theme {
  return "light";
}

function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Private browsing / storage disabled — the toggle still works for the rest of this
    // session via the attribute above, it just won't persist across a reload.
  }
  listeners.forEach((l) => l());
}

/** Sidebar/drawer footer button (see components/AppShell.tsx) that flips between light and
 *  dark, persisting the explicit choice to localStorage under the same "theme" key the
 *  init script reads — once a reader picks one, it overrides system preference on every
 *  future visit until they pick the other. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      className="btn btn-secondary btn-block"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{ marginTop: 8, marginBottom: 4 }}
    >
      {theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
