const DAYS = 365;

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface ReadingCalendarDay {
  key: string;
  read: boolean;
  isToday: boolean;
}

/** A rolling 365-day grid (most recent day last), grouped into 7-day columns for a
 *  GitHub-contributions-style heatmap — which days in `readDates` count as "read" is
 *  reduced to a same-calendar-day comparison, matching lib/streak.ts's day boundaries. */
export function buildReadingCalendarWeeks(readDates: Date[]): ReadingCalendarDay[][] {
  const readKeys = new Set(readDates.map(dateKey));
  const today = new Date();
  const todayKey = dateKey(today);

  const start = new Date(today);
  start.setDate(start.getDate() - (DAYS - 1));

  const days: ReadingCalendarDay[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKey(d);
    days.push({ key, read: readKeys.has(key), isToday: key === todayKey });
  }

  const weeks: ReadingCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}
