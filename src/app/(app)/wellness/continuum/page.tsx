import { redirect } from "next/navigation";

/** Rep Continuum was merged into the Exercise Library hub at /wellness/exercises — this
 *  old URL redirects rather than 404ing, in case anything still links here. */
export default function ContinuumRedirectPage() {
  redirect("/wellness/exercises");
}
