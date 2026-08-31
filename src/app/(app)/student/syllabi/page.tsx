import { redirect } from "next/navigation";

/** My Syllabi moved to /student/assignments once Canvas sync joined it as a second way to
 *  track assignments (see that route's page.tsx) — this route now only exists so any old
 *  bookmark or link still lands somewhere real. */
export default function SyllabiRedirectPage() {
  redirect("/student/assignments");
}
