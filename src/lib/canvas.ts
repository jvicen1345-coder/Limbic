import "server-only";

/** Thin client for the Canvas LMS REST API (see lib/canvas-sync.ts for the sync logic that
 *  calls these, and prisma/schema.prisma's CanvasConnection model comment for why this is a
 *  Personal Access Token integration rather than OAuth2). Every call here is unauthenticated
 *  with respect to Limbic's own session — callers pass the domain/token from the student's
 *  own CanvasConnection row. */

export class CanvasApiError extends Error {}

/** Strips a scheme and trailing path/slash off whatever the student pasted in — Canvas's own
 *  "New Access Token" screen and setup docs show the domain as a bare host
 *  ("myschool.instructure.com"), but a pasted full URL should still work. */
export function normalizeCanvasDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\/+$/, "");
}

async function canvasFetch(domain: string, token: string, path: string): Promise<Response> {
  return fetch(`https://${domain}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface CanvasIdentity {
  id: number;
  name: string;
}

/** Confirms a domain/token pair actually works before Limbic stores it — GET /users/self is
 *  the standard lightweight way to validate a Canvas token, same as any other integration. */
export async function verifyCanvasToken(domain: string, token: string): Promise<CanvasIdentity> {
  let res: Response;
  try {
    res = await canvasFetch(domain, token, "/users/self");
  } catch {
    throw new CanvasApiError(`Could not reach ${domain}. Check the domain and try again.`);
  }
  if (res.status === 401) throw new CanvasApiError("That access token was rejected. Generate a new one and try again.");
  if (!res.ok) throw new CanvasApiError(`Canvas returned an error (${res.status}). Check the domain and try again.`);

  const data = (await res.json().catch(() => null)) as { id?: number; name?: string } | null;
  if (!data || typeof data.id !== "number" || typeof data.name !== "string") {
    throw new CanvasApiError("Canvas returned an unexpected response. Please try again.");
  }
  return { id: data.id, name: data.name };
}

interface CanvasCourse {
  id: number;
  name: string | null;
  course_code: string | null;
}

interface CanvasAssignment {
  id: number;
  name: string;
  due_at: string | null; // ISO 8601, null if the assignment has no due date
  html_url: string;
  submission?: { workflow_state?: string };
}

export interface FetchedCanvasAssignment {
  canvasAssignmentId: string;
  canvasCourseId: string;
  title: string;
  dueDate: string; // YYYY-MM-DD, in the same "no timezone" shape as Assignment.dueDate
  courseCode: string;
  courseName: string;
  htmlUrl: string;
  submitted: boolean;
}

/** Every active-enrollment course's assignments that have a due date — Canvas assignments
 *  with no due_at (draft/ungraded/manually-posted items) are excluded, same as this app never
 *  showing a syllabus-parsed assignment without one. `include[]=submission` is what surfaces
 *  submission.workflow_state, which syncCanvasForUser uses to auto-check off anything the
 *  student has already turned in on Canvas itself. Paginates at 100/page — small enough that a
 *  single page covers a normal course load or assignment list in virtually every real case,
 *  and simple pagination isn't worth the complexity for a sync that already re-runs on demand. */
export async function fetchCanvasAssignments(domain: string, token: string): Promise<FetchedCanvasAssignment[]> {
  const coursesRes = await canvasFetch(domain, token, "/courses?enrollment_state=active&per_page=100");
  if (!coursesRes.ok) throw new CanvasApiError(`Could not load Canvas courses (${coursesRes.status}).`);
  const courses = ((await coursesRes.json().catch(() => [])) as CanvasCourse[]) ?? [];

  const results: FetchedCanvasAssignment[] = [];
  for (const course of courses) {
    const courseName = course.name?.trim() || course.course_code?.trim() || `Course ${course.id}`;
    const courseCode = course.course_code?.trim() || courseName;

    const res = await canvasFetch(
      domain,
      token,
      `/courses/${course.id}/assignments?per_page=100&order_by=due_at&include[]=submission`
    );
    if (!res.ok) continue; // one course failing (e.g. concluded/restricted) shouldn't sink the whole sync
    const assignments = ((await res.json().catch(() => [])) as CanvasAssignment[]) ?? [];

    for (const a of assignments) {
      if (!a.due_at) continue;
      results.push({
        canvasAssignmentId: String(a.id),
        canvasCourseId: String(course.id),
        title: a.name,
        dueDate: a.due_at.slice(0, 10),
        courseCode,
        courseName,
        htmlUrl: a.html_url,
        submitted: a.submission?.workflow_state != null && a.submission.workflow_state !== "unsubmitted",
      });
    }
  }
  return results;
}
