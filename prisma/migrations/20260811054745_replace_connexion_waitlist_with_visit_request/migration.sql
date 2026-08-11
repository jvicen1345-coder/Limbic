-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ConnexionWaitlist";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ConnexionVisitRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredDate" DATETIME,
    "preferredTime" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

