import { serveExamPrep } from "@/lib/exam-prep-serve";

/** One Exam Prep guide, served whole. See lib/exam-prep-serve.ts. */
export async function GET(_request: Request, { params }: { params: Promise<{ guide: string }> }) {
  const { guide } = await params;
  return serveExamPrep(guide);
}
