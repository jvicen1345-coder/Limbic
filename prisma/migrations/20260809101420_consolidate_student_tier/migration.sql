-- Data migration, not a schema change: the "studentProBoards" tier was retired in favor
-- of a single "limbicStudent" plan (see schema.prisma's studentTier comment) — any
-- existing account on either old paid tier moves to the one that replaced them both.
UPDATE "User" SET "studentTier" = 'limbicStudent' WHERE "studentTier" IN ('studentPro', 'studentProBoards');
