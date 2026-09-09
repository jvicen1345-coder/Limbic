import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isServableGuide } from "@/lib/guides";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";

/**
 * The examination guides, served exactly as authored.
 *
 * Each is a complete HTML document with its own stylesheet, scripts and dark-mode palette,
 * which is why this is a route handler rather than a page — there is no Limbic shell to
 * render one inside without altering it. Nothing here parses, rewrites or re-renders the
 * file; the bytes are the deliverable. See lib/guides.ts for why.
 *
 * The shoulder keeps its own route next door. It is the fixed asset the others were built
 * against and its handler documents the specific divergences it carries from the artifact it
 * came from, so it stays where a reader looking for that history will find it. A static
 * segment wins over this dynamic one, so /student/guides/shoulder-examination never reaches
 * here even though the registry lists it.
 *
 * Gated on the paid LimbicStudent tier, like every other playbook (see
 * app/(app)/student/playbooks/page.tsx), which is also why the files live in content/ rather
 * than public/: anything under public/ is served by the CDN before any of this runs.
 */

const DIR = path.join(process.cwd(), "content", "playbooks");

// Read once per server instance rather than per request — they are a few hundred kilobytes
// each and they never change between deploys.
const cache = new Map<string, string>();

async function guide(slug: string): Promise<string> {
  const hit = cache.get(slug);
  if (hit !== undefined) return hit;
  // Safe against traversal because slug has already been checked against the registry, and
  // every registry slug is a plain basename.
  const html = await readFile(path.join(DIR, `${slug}.html`), "utf8");
  cache.set(slug, html);
  return html;
}

export async function GET(_request: Request, { params }: { params: Promise<{ guide: string }> }) {
  const { guide: slug } = await params;

  const user = await getCurrentUser();
  // An unknown slug, a slug still marked coming soon, and an unentitled reader all get the
  // same 404: there is nothing here to upsell, the hub does that, and a 403 would confirm
  // which guides exist and which are merely unfinished.
  if (!isServableGuide(slug) || !user || !hasStudentAccess(user) || user.studentTier !== "limbicStudent") {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(await guide(slug), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Entitlement is checked on every request, so no shared cache may keep a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
