-- Affirmative consent captured on the Connexion visit request form. Stores the exact
-- wording shown alongside the timestamp, so a later reader can see what was agreed to.
ALTER TABLE "ConnexionVisitRequest" ADD COLUMN "consentAt" DATETIME;
ALTER TABLE "ConnexionVisitRequest" ADD COLUMN "consentText" TEXT;
