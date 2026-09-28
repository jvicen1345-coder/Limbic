/**
 * Per-browser Focus timer preferences (see components/student/FocusTimer.tsx). These are
 * conveniences for whoever is at this keyboard, so they live in localStorage rather than in
 * the database: block lengths, the daily goal, sounds, and display options. What the student
 * studied lives on the server (see app/actions/focus.ts).
 *
 * Exposed as a tiny external store for useSyncExternalStore, the same approach
 * AnatomyConnectGame.tsx takes, so the component never has to copy localStorage into state
 * from an effect.
 */

export interface FocusSettings {
  focus: number;
  short: number;
  long: number;
  goal: number;
  chime: boolean;
  recall: boolean;
  evening: boolean;
  notify: boolean;
  volume: number;
  /** The course picked last time (a Syllabus id), or null for General. */
  subjectId: string | null;
  task: string;
  minimal: boolean;
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  focus: 25,
  short: 5,
  long: 15,
  goal: 8,
  chime: true,
  recall: true,
  evening: true,
  notify: false,
  volume: 60,
  subjectId: null,
  task: "",
  minimal: false,
};

const KEY = "limbic-focus-settings";
const listeners = new Set<() => void>();
let cache: FocusSettings | null = null;

function read(): FocusSettings {
  if (cache) return cache;
  let stored: Partial<FocusSettings> = {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) stored = JSON.parse(raw) as Partial<FocusSettings>;
  } catch {
    // Private mode or blocked storage: fall back to defaults for this page load.
  }
  cache = { ...DEFAULT_FOCUS_SETTINGS, ...stored };
  return cache;
}

export function subscribeFocusSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFocusSettings(): FocusSettings {
  return read();
}

export function getServerFocusSettings(): FocusSettings {
  return DEFAULT_FOCUS_SETTINGS;
}

export function updateFocusSettings(patch: Partial<FocusSettings>): void {
  cache = { ...read(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Keep the in-memory value; it just won't outlive this page load.
  }
  listeners.forEach((l) => l());
}

/** Whether the warm red evening palette applies at this hour (7 pm to 6 am). */
export function isEveningHour(hour: number): boolean {
  return hour >= 19 || hour < 6;
}

/** The browser's local calendar date as YYYY-MM-DD, matching FocusSession.dateKey. */
export function localDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** mm:ss for the dial readout. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** "45m", "1h 30m" for totals. */
export function formatMinutes(total: number): string {
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
