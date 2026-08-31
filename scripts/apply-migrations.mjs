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
  // Retry on a locked database. `migrate deploy` is a separate native binary with its own
  // SQLite connection and no busy timeout, so it gives up the instant the file is locked
  // rather than waiting — and a local dev server holding a write is enough to do that. Since
  // this runs as the first half of `npm run build`, that surfaced as the whole build failing
  // with "SQLite database error / database is locked" for anyone who happened to have
  // `npm run dev` open. Same shape of fix as the retry around grantLicense in
  // e2e/movement-lab.spec.ts: wait a moment and try again rather than treating a transient
  // lock as fatal. Only the local file path needs this; Turso has real concurrency.
  for (let attempt = 0; ; attempt++) {
    try {
      // Output is captured rather than inherited so the "is this a lock?" check below has
      // something to read; both streams are echoed either way, so this still prints exactly
      // what `migrate deploy` printed.
      const result = execSync("npx prisma migrate deploy 2>&1", { encoding: "utf8" });
      process.stdout.write(result);
      process.exit(0);
    } catch (error) {
      const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
      process.stdout.write(output);
      // Only a lock is worth retrying. A bad migration fails the same way every time, and
      // retrying it would just delay the real error by a few seconds and bury it in noise.
      if (!/database is locked/i.test(output) || attempt >= 3) throw error;
      const wait = 500 * 2 ** attempt;
      console.log(`[migrate] database is locked, retrying in ${wait}ms`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
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
