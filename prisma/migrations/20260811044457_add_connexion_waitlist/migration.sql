-- CreateTable
CREATE TABLE "ConnexionWaitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnexionWaitlist_email_key" ON "ConnexionWaitlist"("email");
