import { redirect } from "next/navigation";

/** Medications was merged into the Clinical Reference hub at /pro/lab-values — this old
 *  URL redirects rather than 404ing, in case anything still links here. */
export default function MedicationsRedirectPage() {
  redirect("/pro/lab-values");
}
