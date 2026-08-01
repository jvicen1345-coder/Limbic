import "server-only";
import { prisma } from "@/lib/db";

export type ConnectionState =
  | { status: "none" }
  | { status: "pending-outgoing"; connectionId: string }
  | { status: "pending-incoming"; connectionId: string }
  | { status: "accepted"; connectionId: string }
  | { status: "declined"; connectionId: string };

/** Every Connection row touching `userId`, keyed by the *other* user's id — one query
 *  instead of N, for directory/feed lists that need connection state per row. */
export async function getConnectionStates(userId: string): Promise<Map<string, ConnectionState>> {
  const rows = await prisma.connection.findMany({
    where: { OR: [{ requesterId: userId }, { recipientId: userId }] },
  });

  const map = new Map<string, ConnectionState>();
  for (const row of rows) {
    const otherId = row.requesterId === userId ? row.recipientId : row.requesterId;
    if (row.status === "accepted") {
      map.set(otherId, { status: "accepted", connectionId: row.id });
    } else if (row.status === "declined") {
      map.set(otherId, { status: "declined", connectionId: row.id });
    } else if (row.requesterId === userId) {
      map.set(otherId, { status: "pending-outgoing", connectionId: row.id });
    } else {
      map.set(otherId, { status: "pending-incoming", connectionId: row.id });
    }
  }
  return map;
}

/** Ids of users with an accepted connection to `userId` — messaging is restricted to this
 *  set. */
export async function getAcceptedConnectionIds(userId: string): Promise<string[]> {
  const states = await getConnectionStates(userId);
  return [...states.entries()].filter(([, s]) => s.status === "accepted").map(([id]) => id);
}

