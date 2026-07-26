#!/usr/bin/env node
// Applies prisma/migrations/*/migration.sql to whatever DATABASE_URL points at.
//
// Prisma's `migrate deploy` (the schema engine, a separate native binary from the JS
// driver adapter our app uses at runtime) only understands standard connection string
// schemes — it doesn't recognize "libsql://". So for a local file: URL, this just
// delegates to the real `prisma migrate deploy`. For a remote libsql: URL (Turso), it
// applies the same migration.sql files directly over the libSQL client instead, tracking
// which ones have already run in a small "_app_migrations" table so re-running this on
// every deploy is a no-op once everything's applied.
import { createClient } from "@libsql/client";
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

if (databaseUrl.startsWith("file:")) {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  process.exit(0);
}

const client = createClient({ url: databaseUrl, authToken: process.env.TURSO_AUTH_TOKEN });

await client.execute(`
  CREATE TABLE IF NOT EXISTS "_app_migrations" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "applied_at" TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const appliedRows = await client.execute('SELECT "name" FROM "_app_migrations"');
const applied = new Set(appliedRows.rows.map((row) => row.name));

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
const folders = readdirSync(migrationsDir)
  .filter((name) => statSync(path.join(migrationsDir, name)).isDirectory())
  .sort();

for (const folder of folders) {
  if (applied.has(folder)) {
    console.log(`[migrate] ${folder} — already applied`);
    continue;
  }

  const sql = readFileSync(path.join(migrationsDir, folder, "migration.sql"), "utf8");
  const statements = sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`[migrate] ${folder} — applying ${statements.length} statement(s)`);
  for (const statement of statements) {
    await client.execute(statement);
  }
  await client.execute({ sql: 'INSERT INTO "_app_migrations" ("name") VALUES (?)', args: [folder] });
  console.log(`[migrate] ${folder} — applied`);
}

console.log("[migrate] database is up to date");
