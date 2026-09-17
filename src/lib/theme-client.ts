export type ThemePreference = "light" | "dark" | "system";

const listeners = new Set<() => void>();

/** Lets ThemeToggle and Profile's Theme status card re-render when any caller writes the
 *  preference through applyThemePreferenceLocally — including ThemeSection, which applies
 *  on card click rather than waiting for Save. */
export function subscribeThemePreference(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyThemePreferenceListeners() {
  listeners.forEach((listener) => listener());
}

/** Resolves "system" against the OS/browser's prefers-color-scheme; "light"/"dark" pass
 *  through unchanged. Only ever call this client-side (window.matchMedia). */
export function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

/**
 * Applies `pref` to the current page immediately (sets html[data-theme] to the resolved
 * light/dark value) and persists the raw preference to localStorage under the same "theme"
 * key the blocking init script in app/layout.tsx reads — call this from any control that
 * changes the preference (components/ThemeToggle.tsx, components/ThemeSection.tsx) so this
 * tab updates instantly and the next full reload on this device picks it up before paint,
 * without a flash. Database persistence (multi-device sync) is the caller's own
 * responsibility via setThemePreferenceAction — this never touches anything but the
 * current browser.
 */
export function applyThemePreferenceLocally(pref: ThemePreference) {
  document.documentElement.setAttribute("data-theme", resolveTheme(pref));
  try {
    localStorage.setItem("theme", pref);
  } catch {
    // Private browsing / storage disabled — the attribute above still applies for this
    // session, it just won't persist across a reload.
  }
  notifyThemePreferenceListeners();
}

/** Reads back whatever applyThemePreferenceLocally last wrote — "system" (the default) if
 *  nothing's been stored yet on this device. Used by ThemeToggle to know which preference
 *  (not just which resolved light/dark) is currently active, since "system" always
 *  resolves into one of the other two on the html[data-theme] attribute itself. */
export function readStoredThemePreference(fallback: ThemePreference = "system"): ThemePreference {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // Private browsing / storage disabled.
  }
  return fallback;
}
