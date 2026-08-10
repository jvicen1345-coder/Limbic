import { redirect } from "next/navigation";

/** Body Connections was retired from the Limbic Games lineup (see lib/games.ts's GAMES
 *  array, which no longer lists it, and the hub grid at app/(app)/games/page.tsx) — this
 *  route stays only so an old bookmark or shared link lands somewhere real instead of
 *  404ing. Past DailyCompletion/GameActivity rows for it are untouched, so a reader's
 *  historical stats/streak still count days they played it. */
export default function BodyConnectionsRemovedPage() {
  redirect("/games");
}
