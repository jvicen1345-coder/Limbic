import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

export interface ContinueReadingData {
  articleId: string;
  title: string;
  /** 0-1 fraction scrolled, from ReadArticle.scrollProgress. */
  progress: number;
  /** Precomputed on the server — e.g. "62% read" — so this component stays purely
   *  presentational. This used to be a "4 min left" estimate derived from the article's
   *  readMins, but that number is effectively the constant 2 for every Article (see the
   *  note in ArticleReadingPane.tsx), which made the countdown a function of the progress
   *  bar directly above it and nothing else. The percentage says the same thing honestly. */
  progressLabel: string;
}

/** Sits above every other Home sidebar card (see components/HomeFeed.tsx) — the one thing
 *  in that column meant to pull a reader back to something specific, rather than surface
 *  new things to look at. Renders nothing when there's no reading history yet (see
 *  app/(app)/page.tsx, which passes null in that case). */
export function ContinueReadingCard({ data }: { data: ContinueReadingData | null }) {
  if (!data) return null;

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div className="card-kicker">Continue reading</div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, lineHeight: 1.3 }}>{data.title}</div>
      <div className="progress-bar progress-bar-fade-in">
        <div className="progress-bar-fill" style={{ width: `${Math.round(data.progress * 100)}%` }} />
      </div>
      <div style={{ fontSize: "var(--fs-11)", color: "var(--color-neutral-700)" }}>{data.progressLabel}</div>
      <Link href={`/article/${data.articleId}`} className="btn btn-secondary" style={{ alignSelf: "flex-start", fontSize: 12.5 }}>
        Continue Reading
        <ChevronRightIcon size={14} />
      </Link>
    </div>
  );
}
