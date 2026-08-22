-- CreateTable
CREATE TABLE "SignInThrottle" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "windowStart" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "PasswordResetThrottle" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "windowStart" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1
);
