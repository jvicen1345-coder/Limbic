import { NextResponse } from "next/server";
import { isExamPrepPart } from "@/lib/exam-prep";
import { serveExamPrep } from "@/lib/exam-prep-serve";

/** A guide's companion page (games or atlas), served whole under the same gate as the guide.
 *  Anything other than a known part is a 404 before the filesystem is touched. */
export async function GET(_request: Request, { params }: { params: Promise<{ guide: string; part: string }> }) {
  const { guide, part } = await params;
  if (!isExamPrepPart(part)) return new NextResponse("Not found", { status: 404 });
  return serveExamPrep(guide, part);
}
