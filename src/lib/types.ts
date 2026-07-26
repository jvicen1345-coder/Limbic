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
  breaking?: boolean;
  underReview?: string;
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
