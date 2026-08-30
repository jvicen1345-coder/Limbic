import { redirect } from "next/navigation";
import { isSiteAdmin } from "@/lib/admin";
import { getBoardsQuestionsForTagging } from "@/app/actions/boards-tagging";
import { BoardsTaggingAdminList } from "@/components/BoardsTaggingAdminList";

/** Admin-only — tags each Limbic Boards question (lib/board-content.ts's static
 *  BOARD_QUESTIONS) with the Atlas body region(s) it belongs to, so Atlas's "Board
 *  Questions" section (components/atlas/AtlasClient.tsx) can surface relevant practice
 *  questions per region. See BoardsQuestionTag in schema.prisma and
 *  app/actions/boards-tagging.ts for why this is a separate tag table rather than columns
 *  on a BoardsQuestion model (Boards questions are a static array, not a DB table). */
export default async function AdminBoardsTaggingPage() {
  if (!(await isSiteAdmin())) redirect("/home");

  const questions = await getBoardsQuestionsForTagging();
  const taggedCount = questions.filter((q) => q.bodyRegions.length > 0).length;

  return (
    <div className="screen-pad" style={{ maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Boards Question Tagging</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 20px" }}>
        Tag each Limbic Boards question with the Atlas body region(s) it&rsquo;s relevant to. {taggedCount} of{" "}
        {questions.length} tagged.
      </p>

      <BoardsTaggingAdminList questions={questions} />
    </div>
  );
}
