-- AlterTable
ALTER TABLE "User" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
