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
}

export interface WellnessVideo {
  id: string;
  title: string;
  source: string;
  duration: string;
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
