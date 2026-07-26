-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isGuest" BOOLEAN NOT NULL DEFAULT false,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "licenseEmail" TEXT,
    "licenseExpiration" DATETIME,
    "name" TEXT NOT NULL DEFAULT 'Dr. Amara Chen, PT',
    "specialty" TEXT NOT NULL DEFAULT 'ortho',
    "practiceState" TEXT NOT NULL DEFAULT 'California',
    "followedTopics" JSONB NOT NULL DEFAULT [],
    "ceCategories" JSONB NOT NULL DEFAULT []
);

-- CreateTable
CREATE TABLE "SavedArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedArticle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HepProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HepProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HepExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" TEXT NOT NULL,
    "reps" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HepExercise_programId_fkey" FOREIGN KEY ("programId") REFERENCES "HepProgram" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_licenseNumber_key" ON "User"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SavedArticle_userId_articleId_key" ON "SavedArticle"("userId", "articleId");
