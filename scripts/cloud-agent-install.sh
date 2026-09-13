#!/usr/bin/env bash
# Cloud Agent install phase for Limbic (PT News).
#
# Idempotent repository bootstrap: refresh dependencies, ensure a local .env exists,
# and apply Prisma migrations to the local SQLite database. Safe to run repeatedly —
# it never rotates the session secret or clobbers an existing .env, and already-applied
# migrations are skipped.
set -euo pipefail

cd "$(dirname "$0")/.."

# Dependencies. `postinstall` runs `prisma generate`, which writes src/generated/prisma
# (needed by tsc, eslint, and the app itself).
npm ci

# Local environment file. .env.example already points DATABASE_URL at the local SQLite
# file (file:./dev.db) and leaves every third-party API key blank — the app degrades
# gracefully without them. The one value that must not stay a placeholder is the
# session-cookie signing key, so generate a real one on first setup only.
if [ ! -f .env ]; then
  cp .env.example .env
  secret="$(openssl rand -base64 32)"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=\"${secret}\"|" .env
fi

# Schema. apply-migrations.mjs delegates to `prisma migrate deploy` for the local
# file: URL and tracks applied migrations, so re-running is a no-op once up to date.
node scripts/apply-migrations.mjs
