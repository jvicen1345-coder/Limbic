import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";

/**
 * The Shoulder Examination Playbook, served exactly as authored.
 *
 * This one is a fixed asset, not content in lib/playbooks/. Every clinical value in it is
 * individually sourced and verified against the paper it came from, and the page carries the
 * provenance machinery that says which values are measured, which are convention and which
 * the studies still argue about. Re-expressing that in another content model would mean
 * re-typing several hundred sourced figures, and a paraphrase that drifts by one decimal is
 * indistinguishable from the real thing until a student quotes it in an exam. So the bytes
 * are the deliverable: nothing here parses, rewrites or re-renders the file, and no clinical
 * value in it has been touched. Do not reformat, minify, or "tidy"
 * content/playbooks/shoulder-examination.html.
 *
 * It carries two deliberate changes from the artifact it came from, both made with the
 * author's say-so and neither touching a clinical value:
 *
 *   - the practice planner's click listener moved to the capture phase, because the
 *     mark-missed handler calls stopPropagation() and the planner therefore never saw the
 *     click that should have rebuilt it;
 *   - a "← Limbic" link at the head of its sticky nav, since the page is reached by ordinary
 *     navigation and otherwise offers no way back into the app;
 *   - its palette and type, which are now Limbic's rather than the teal-and-IBM-Plex the
 *     artifact shipped with. Only the token block at the top of its stylesheet changed, plus
 *     one inline font-family on a heading — the diff touches nothing outside <style> but that
 *     one attribute, and no clinical value, no markup and no script. The three status colours
 *     are the one place the mapping is not literal: Limbic's --color-warn and --color-success
 *     sit near 3:1 on white, which is fine for the badges the app uses them on and not fine
 *     for the 9.5px uppercase type this guide sets in them, so those two are darkened members
 *     of the same hues. The reasoning is written into the stylesheet beside the values;
 *   - `color-scheme: light dark` in place of the `color-scheme: light` the artifact wrapper
 *     baked in. The document has carried a full dark palette all along, so declaring itself
 *     light was already wrong, and the palette change above made it visible: the browser
 *     rendered UA widgets — the nav's own <select> most obviously — light on a dark page,
 *     and anything applying automatic dark mode (Chrome's flag, Dark Reader and friends)
 *     read the page as light and darkened it a second time, washing plain text out while
 *     leaving anything with a background alone.
 *
 * Anything else that diverges is a mistake.
 *
 * It is a complete HTML document with its own stylesheet, scripts and dark-mode palette,
 * which is why it is a route handler rather than a page — there is no Limbic shell to render
 * it inside without altering it.
 *
 * Gated on the paid LimbicStudent tier, like every other playbook (see
 * app/(app)/student/playbooks/page.tsx), which is also why the file lives in content/ rather
 * than public/: anything under public/ is served by the CDN before any of this runs.
 */

const FILE = path.join(process.cwd(), "content", "playbooks", "shoulder-examination.html");

// Read once per server instance rather than per request — it is a third of a megabyte and it
// never changes between deploys.
let cached: string | null = null;

async function guide(): Promise<string> {
  if (cached === null) cached = await readFile(FILE, "utf8");
  return cached;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user) || user.studentTier !== "limbicStudent") {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(await guide(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Entitlement is checked on every request, so no shared cache may keep a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
