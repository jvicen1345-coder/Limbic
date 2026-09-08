import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Same libSQL adapter works against a local file (development — DATABASE_URL like
// "file:./dev.db") and against a hosted Turso database (production — a "libsql://..."
// URL plus TURSO_AUTH_TOKEN). No code branching needed between the two.
/** How long a blocked writer waits for the lock before giving up, in milliseconds.
 *
 *  @libsql/client forwards `timeout` to the native database as its busy timeout, and the
 *  default is 0 — meaning a writer that finds the database locked fails *immediately*
 *  rather than waiting. SQLite serialises writers even in WAL mode, so any two concurrent
 *  requests that both write could hit it. What surfaced was a DriverAdapterError
 *  ("SocketTimeout") wrapped as Prisma P1008 "Operation has timed out" on user.create and
 *  user.update — sign-up and the onboarding writes — which threw out of the Server Action,
 *  left the browser on the sign-up page, and read downstream as a navigation timeout with
 *  nothing in it naming the database.
 *
 *  Reproduced by running the e2e suite at eight workers: 5 failed, 15 adapter timeouts.
 *  With this set, the same run passes — a blocked writer waits a few milliseconds for its
 *  turn instead of failing, so contention costs latency rather than requests.
 *
 *  Five seconds is far longer than any write here takes (they are milliseconds), so it
 *  absorbs a queue without hiding a genuinely stuck lock. It applies to the local SQLite
 *  file only: a hosted Turso URL goes through the HTTP/WebSocket client, which has no local
 *  lock to wait on and ignores this. */
const LOCAL_BUSY_TIMEOUT_MS = 5_000;

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
  timeout: LOCAL_BUSY_TIMEOUT_MS,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
