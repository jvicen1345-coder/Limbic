-- License numbers are issued independently by each state board, so the same string can be
-- two different practitioners' licenses in two different states. Replaces the global unique
-- index on License.licenseNumber with a composite one on (state, licenseNumber), and drops
-- the equivalent global index on the legacy User.licenseNumber mirror field.
DROP INDEX IF EXISTS "License_licenseNumber_key";
CREATE UNIQUE INDEX "License_state_licenseNumber_key" ON "License"("state", "licenseNumber");
DROP INDEX IF EXISTS "User_licenseNumber_key";
