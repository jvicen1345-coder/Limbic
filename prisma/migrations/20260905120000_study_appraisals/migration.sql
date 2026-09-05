-- Limbic Appraisals: structured-entry research appraisals written by an admin.
--
-- `input` holds the entry form as typed (see AppraisalInput in lib/appraisal.ts) — sample
-- sizes, an effect estimate and its interval, an MCID and its citation, the appraiser's own
-- notes. No column here ever holds a publisher's text: the form has no field that accepts
-- any. `sourceAccess` and `doi` are denormalised out of that JSON so provenance is
-- queryable without scanning every row.
CREATE TABLE "StudyAppraisal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "input" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "specialty" TEXT NOT NULL DEFAULT 'ortho',
    "tags" JSONB NOT NULL,
    "sourceAccess" TEXT NOT NULL DEFAULT 'abstract_only',
    "doi" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "StudyAppraisal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "StudyAppraisal_authorId_idx" ON "StudyAppraisal"("authorId");
CREATE INDEX "StudyAppraisal_status_publishedAt_idx" ON "StudyAppraisal"("status", "publishedAt");
