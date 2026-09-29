import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { examPrepFile, isKnownExamPrep, type ExamPrepPart } from "@/lib/exam-prep";
import { getCurrentUser, hasStudentAccess, hasPlaybookAccess } from "@/lib/session";

/**
 * Serves an Exam Prep guide, or one of its companion pages, exactly as authored — the same
 * approach as the served playbooks (app/(app)/student/guides/[guide]/route.ts): the file is a
 * complete document with its own styles and scripts, so nothing here parses or rewrites it.
 *
 * Files live in content/ rather than public/ so the entitlement check below runs before any
 * byte is sent; next.config.ts lists them in outputFileTracingIncludes because nothing
 * imports them and the tracer would otherwise leave them out of the serverless bundle.
 */

const DIR = path.join(process.cwd(), "content", "exam-prep");

const cache = new Map<string, string>();

async function read(file: string): Promise<string> {
  const hit = cache.get(file);
  if (hit !== undefined) return hit;
  // Safe against traversal: the slug was checked against the registry and the part against
  // a fixed list before this is reached, so `file` is always one of a known set of basenames.
  const html = await readFile(path.join(DIR, file), "utf8");
  cache.set(file, html);
  return html;
}

export async function serveExamPrep(slug: string, part?: ExamPrepPart): Promise<NextResponse> {
  const user = await getCurrentUser();
  // Unknown slug and unentitled reader get the same 404, as for the playbooks: the hub is
  // where the upsell lives, and a 403 would confirm which slugs exist.
  if (!isKnownExamPrep(slug) || !user || !hasStudentAccess(user) || !hasPlaybookAccess(user, slug)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(await read(examPrepFile(slug, part)), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Entitlement is checked on every request, so no shared cache may keep a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
