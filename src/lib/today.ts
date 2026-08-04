/** Local-clock "today" as YYYY-MM-DD — the definition of "new today" the Home dashboard's
 *  Studies/Guidelines tile counts use (see app/(app)/page.tsx) and that the /search?new=1
 *  filter those tiles link to (see components/SearchScreen.tsx) matches against, so the
 *  filtered result count always agrees with what the tile showed. Deliberately local time,
 *  not UTC — same server-local-clock convention as every other "today" concept in this app
 *  except lib/wordle-words.ts / lib/board-content.ts's todayDateKey, which rotates daily
 *  content on a UTC day boundary instead since it doesn't need to match wall-clock date. */
export function todayLocalDateStr(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
