import { redirect } from "next/navigation";

/** The Daily Term game moved off /wordle. WORDLE is a registered trademark of The New York
 *  Times, which has pursued clones, and while nothing user-facing ever said "Wordle" — the
 *  game has always been titled "Daily Term" (see lib/games.ts) — the route path was the one
 *  place the name was exposed to a reader or a crawler. The component, word list and CSS
 *  keep their internal names; only the URL changed.
 *
 *  This redirect stays rather than the old path 404ing, for the same reason
 *  /pro/medications redirects to /pro/lab-values: readers bookmark daily games, and a
 *  streak is a bad thing to interrupt over a rename. */
export default function WordleRedirectPage() {
  redirect("/daily-term");
}
