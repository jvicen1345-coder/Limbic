import { redirect } from "next/navigation";

/** Limbic Vitals was renamed to Limbic Metrics and moved to /wellness/metrics — this old
 *  URL redirects rather than 404ing, in case anything still links here. */
export default function VitalsRedirectPage() {
  redirect("/wellness/metrics");
}
