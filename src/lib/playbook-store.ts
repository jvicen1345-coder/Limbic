/**
 * The little browser-local store a playbook's interactive parts share.
 *
 * Recall's choices and the taught lane's lines are both scratch pads for working through a
 * page, not records worth a round trip to the database, so they live in localStorage keyed by
 * playbook slug. Both are read through useSyncExternalStore, which compares snapshots by
 * identity — so a key is parsed once and the parsed value cached, since a fresh object on
 * every read would re-render forever. Writes update the cache before they notify, so a reader
 * that re-renders immediately sees what was just written.
 *
 * Every access is wrapped: in a private window, or with storage switched off, reading and
 * writing both throw, and a playbook that forgets is much better than one that fails to
 * render.
 */

const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

export function readStored(key: string): unknown {
  if (cache.has(key)) return cache.get(key);
  let parsed: unknown = null;
  try {
    const raw = window.localStorage.getItem(key);
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }
  cache.set(key, parsed);
  return parsed;
}

export function writeStored(key: string, value: unknown) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // As above — a failed write shouldn't break the interaction.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeToStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
