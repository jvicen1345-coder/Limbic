-- CreateTable
CREATE TABLE "SessionExerciseLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "visitNumber" INTEGER NOT NULL,
    "exercises" JSONB NOT NULL,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionExerciseLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionExerciseLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicalPatient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
