export type ArticleType = "research" | "guideline" | "industry" | "ce" | "product";
export type Specialty = "ortho" | "neuro" | "sports" | "pediatric" | "geriatric";

export interface Article {
  id: string;
  type: ArticleType;
  specialty: Specialty;
  title: string;
  source: string;
  /** External link to the original story. Present on live-sourced articles; absent on
   *  hand-authored seed articles, which render their own body paragraphs instead. */
  sourceUrl?: string;
  date: string; // ISO yyyy-mm-dd
  readMins: number;
  summary: string;
  tags: string[];
  /** Authored body paragraphs — only seed articles have these (see lib/articles-static.ts). */
  body?: string[];
  /** The real image the article itself uses (its `og:image`), fetched on-demand for a
   *  small number of candidates (see lib/og-image.ts) — never a fabricated stand-in. */
  image?: string;
  /** Short "why this is flagged" note shown on the Under Review card. */
  underReview?: string;
  /** Human label for the flag's status — e.g. "Retraction", "Correction", "Expression
   *  of concern" — for Retraction-Watch-sourced items. Falls back to a generic "Under
   *  review" pill when absent. */
  reviewStatus?: string;
  stateSpecific?: string[];
  /** True when this article was pulled from a live feed at request time rather than the
   *  bundled seed set. */
  live?: boolean;
}

export interface WellnessArticle {
  id: string;
  source: string;
  sourceUrl?: string;
  date: string;
  readMins: number;
  title: string;
  summary: string;
  tags: string[];
  /** Authored body paragraphs — only seed wellness articles have these, same pattern as
   *  Article.body (see lib/articles-static.ts). Live-sourced wellness articles rely on
   *  sourceUrl instead, since they link out to a real story. */
  body?: string[];
}

export interface WellnessVideo {
  id: string;
  title: string;
  source: string;
  /** Real runtime, only when the creator states it themselves (e.g. in the video's own
   *  title) — never invented. Omitted rather than guessed when unconfirmed. */
  duration?: string;
  url: string;
}

export interface CeCategory {
  name: string;
  required: number;
  completed: number;
}

export interface HepExerciseDraft {
  id: string;
  name: string;
  sets: string;
  reps: string;
  notes: string;
}
