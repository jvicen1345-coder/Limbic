import type { Article, ArticleType, Specialty } from "@/lib/types";
import type { SavedArticle } from "@/generated/prisma/client";
import { defaultEvidenceLevelForType } from "@/lib/evidence";

/** Rebuilds an Article from a SavedArticle row's snapshot fields (see
 *  app/actions/saved.ts toggleSaveAction) — null if the row predates the snapshot or
 *  isn't an article save (wellness, clips) in the first place. */
export function snapshotToArticle(row: SavedArticle): Article | null {
  if (
    !row.type ||
    !row.specialty ||
    row.title == null ||
    row.source == null ||
    row.summary == null ||
    row.date == null ||
    row.readMins == null
  ) {
    return null;
  }
  return {
    id: row.articleId,
    type: row.type as ArticleType,
    specialty: row.specialty as Specialty,
    title: row.title,
    source: row.source,
    sourceUrl: row.sourceUrl ?? undefined,
    date: row.date,
    readMins: row.readMins,
    summary: row.summary,
    tags: (row.tags as unknown as string[]) ?? [],
    live: true,
    // No evidenceLevel column on SavedArticle — derived fresh from the stored type at
    // read time instead of migrating the DB. A saved PubMed article's specific
    // RCT/SR/MA/Review distinction degrades to generic "Research" once round-tripped
    // through Save, since only `type` (not the original evidenceLevel) is persisted.
    evidenceLevel: defaultEvidenceLevelForType(row.type as ArticleType),
  };
}
