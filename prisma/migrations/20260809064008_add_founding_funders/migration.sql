-- CreateTable
CREATE TABLE "FoundingFunder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "credential" TEXT,
    "round" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL DEFAULT 40,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FoundingFunder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoundingFunderWaitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "FoundingFunder_userId_key" ON "FoundingFunder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FoundingFunderWaitlist_email_key" ON "FoundingFunderWaitlist"("email");
