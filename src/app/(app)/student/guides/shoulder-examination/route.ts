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
 * are the deliverable: the file is committed verbatim and returned unmodified. Do not
 * reformat, minify, or "tidy" content/playbooks/shoulder-examination.html.
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
