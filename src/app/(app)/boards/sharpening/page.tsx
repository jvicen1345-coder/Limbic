import { redirect } from "next/navigation";

/** Daily Sharpening was merged into the Limbic Boards hub at /boards — this old URL
 *  redirects rather than 404ing, in case anything still links here. */
export default function SharpeningRedirectPage() {
  redirect("/boards");
}
