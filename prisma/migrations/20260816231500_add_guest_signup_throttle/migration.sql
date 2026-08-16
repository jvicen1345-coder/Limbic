-- CreateTable
CREATE TABLE "GuestSignupThrottle" (
    "ip" TEXT NOT NULL PRIMARY KEY,
    "windowStart" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1
);
