import type { Article, Specialty } from "@/lib/types";
import { TYPE_META, SPECIALTY_META, formatDate } from "@/lib/meta";

export interface DecoratedArticle extends Article {
  typeLabel: string;
  typeTagClass: string;
  specialtyLabel: string;
  dateLabel: string;
  saved: boolean;
}

export function decorateArticle(a: Article, savedIds: string[]): DecoratedArticle {
  const tm = TYPE_META[a.type];
  return {
    ...a,
    typeLabel: tm.label,
    typeTagClass: "tag " + tm.tag,
    specialtyLabel: SPECIALTY_META[a.specialty],
    dateLabel: formatDate(a.date),
    saved: savedIds.includes(a.id),
  };
}

/** Personalized ranking: articles matching the reader's specialty or a followed topic
 *  float to the top, ties broken by recency — same scoring the prototype used. */
export function rankFeed(articles: Article[], specialty: Specialty, followedTopics: string[]): Article[] {
  const score = (a: Article) =>
    (a.specialty === specialty ? 2 : 0) + (a.tags.some((t) => followedTopics.includes(t)) ? 1 : 0);
  return [...articles].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
