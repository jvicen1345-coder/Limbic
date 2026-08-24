import { redirect } from "next/navigation";

/** Red Flag Screening was merged into the Screening & Decision Support hub at
 *  /pro/decision-rules — this old URL redirects rather than 404ing, in case anything still
 *  links here. */
export default function RedFlagsRedirectPage() {
  redirect("/pro/decision-rules");
}
