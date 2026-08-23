"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { createOrRotateHealthSyncToken, revokeHealthSyncToken } from "@/lib/health-sync";

/** Generate/Regenerate button on the Apple Health card (see
 *  components/vitals/AppleHealthSyncCard.tsx) — the raw key is only ever returned here,
 *  straight to the client component that shows it once; nothing else in the app can read
 *  it back afterward. */
export async function regenerateHealthSyncKeyAction(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const rawToken = await createOrRotateHealthSyncToken(user.id);
  revalidatePath("/wellness/activity");
  return rawToken;
}

export async function disconnectHealthSyncAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await revokeHealthSyncToken(user.id);
  revalidatePath("/wellness/activity");
}
