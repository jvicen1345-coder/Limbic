/** Reads at or above this fraction are finished for the Home Continue Reading card
 *  (footers / related blocks mean a finished reader often never hits 1.0). */
export const CONTINUE_READING_FINISHED_THRESHOLD = 0.95;

/** Debounce between in-session progress reports while the reader is scrolling. */
export const SEND_DEBOUNCE_MS = 600;

/** Minimum extra progress before a debounced scroll report is sent. Unmount flush
 *  does not use this gate, so a small final move is not dropped. */
export const MIN_PROGRESS_DELTA = 0.02;

/** How long a reader must stay on a no-scroll-room article before it counts as fully
 *  read. Open-and-leave must not write 1.0; sitting with a short article still can. */
export const SHORT_ARTICLE_DWELL_MS = 2_000;

type ContinueReadingRow = {
  articleId: string;
  scrollProgress: number;
};

type ContinueReadingArticle = {
  id: string;
  title: string;
};

/** Most recently touched unfinished read that is still in the current article pool.
 *  `readRows` must already be ordered most-recently-touched first (Home's findMany).
 *  If the chosen row's article has churned out, returns null — same as the previous
 *  `articles.find(...)` miss on `readRows[0]`. */
export function pickContinueReading(
  readRows: ContinueReadingRow[],
  articles: ContinueReadingArticle[]
): {
  articleId: string;
  title: string;
  progress: number;
  progressLabel: string;
} | null {
  const row = readRows.find((r) => r.scrollProgress < CONTINUE_READING_FINISHED_THRESHOLD);
  if (!row) return null;
  const article = articles.find((a) => a.id === row.articleId);
  if (!article) return null;
  const pct = Math.round(row.scrollProgress * 100);
  return {
    articleId: article.id,
    title: article.title,
    progress: row.scrollProgress,
    progressLabel: pct < 1 ? "Just started" : `${pct}% read`,
  };
}

/** 0–1 fraction the tracker should persist for the current scroll position.
 *
 *  A viewport that has no scroll room reports 1 only after engagement (a scroll event
 *  or a dwell past `SHORT_ARTICLE_DWELL_MS`). Without that, an open-and-leave would
 *  otherwise record a completed read. */
export function reportedScrollProgress(input: {
  scrollHeight: number;
  clientHeight: number;
  scrollTop: number;
  engaged: boolean;
}): number {
  const scrollable = input.scrollHeight - input.clientHeight;
  if (scrollable <= 0) return input.engaged ? 1 : 0;
  return Math.max(0, Math.min(1, input.scrollTop / scrollable));
}
