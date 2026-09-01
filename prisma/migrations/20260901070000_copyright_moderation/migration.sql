-- DMCA moderation and repeat-infringer tooling (17 U.S.C. §512(c)(1)(C) and §512(i)(1)(A)).

-- Account suspension. A suspension is not a deletion: the account and its content survive
-- so the record of enforcement survives with them.
ALTER TABLE "User" ADD COLUMN "suspendedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "suspendedReason" TEXT;

-- Soft removal of individual content, so a takedown disables access without destroying the
-- material a valid counter-notice may require restoring.
ALTER TABLE "NexusPost" ADD COLUMN "removedAt" DATETIME;
ALTER TABLE "NexusPost" ADD COLUMN "removedReason" TEXT;
ALTER TABLE "NexusPostComment" ADD COLUMN "removedAt" DATETIME;
ALTER TABLE "NexusPostComment" ADD COLUMN "removedReason" TEXT;

-- The notice log — the evidence that the published repeat-infringer policy is actually run.
CREATE TABLE "CopyrightNotice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "complainantName" TEXT NOT NULL,
    "complainantEmail" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetAuthorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "actionedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "CopyrightNotice_targetAuthorId_fkey" FOREIGN KEY ("targetAuthorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CopyrightNotice_targetAuthorId_idx" ON "CopyrightNotice"("targetAuthorId");
CREATE INDEX "CopyrightNotice_status_idx" ON "CopyrightNotice"("status");
