import { NextResponse } from "next/server";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { getMonthAssignments } from "@/app/actions/syllabus";
import { getMonthImportantDates } from "@/app/actions/calendar";

/** Backs the Atrium calendar's month navigation (see components/AtriumCalendar.tsx) — a
 *  plain client-side fetch rather than calling the getMonthAssignments/getMonthImportantDates
 *  server actions directly, since that's what the calendar's navigateMonth was built around.
 *  Authenticated by the normal session cookie; the userId query param must match the signed-in
 *  account — both actions re-check this too, but rejecting the mismatch here means a spoofed
 *  userId never even reaches them. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !hasStudentAccess(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year or month" }, { status: 400 });
  }

  const [assignments, importantDates] = await Promise.all([
    getMonthAssignments(userId, year, month),
    getMonthImportantDates(userId, year, month),
  ]);
  return NextResponse.json({ assignments, importantDates });
}
