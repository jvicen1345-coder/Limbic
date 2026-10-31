import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, hasStudentAccess } from "@/lib/session";
import { isSiteAdmin } from "@/lib/admin";
import { libraryScope } from "@/lib/library-sources";
import { LibrarySearch } from "@/components/library/LibrarySearch";
import { StudentGate } from "@/components/student/StudentGate";

export const metadata: Metadata = {
  title: "Search playbooks & study guides",
};

/**
 * One search across both long-form libraries: the served playbooks (lib/guides.ts), which
 * walk an evaluation in the order it is performed, and the Exam Prep study guides
 * (lib/exam-prep.ts), which are built for revising before a practical.
 *
 * It exists as its own page, titled with what it covers, because the two pools live on
 * separate hubs and a reader searching for a fact has no reason to know which hub holds it.
 * The scope is stated in the heading and again under the field, and every result is tagged
 * with the pool it came from — the reader should never have to infer what was searched from
 * what happened to come back.
 *
 * The gate here is the ordinary student one. Per-document entitlement is applied inside
 * searchLibraryAction, which is the real boundary: rendering this page behind a check is not
 * one, since the action is a POST endpoint anyone can reach.
 */
export default async function LibrarySearchPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (!hasStudentAccess(user)) {
    return (
      <div className="screen-pad atrium-page" style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Search playbooks &amp; study guides</h1>
        <StudentGate toolName="Library search" />
      </div>
    );
  }

  const admin = await isSiteAdmin();
  const scope = libraryScope({ admin });

  return (
    <div className="screen-pad atrium-page" style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>Search playbooks &amp; study guides</h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--color-neutral-700)",
          maxWidth: 640,
          lineHeight: 1.5,
          margin: "0 0 4px",
        }}
      >
        Every examination playbook and every Exam Prep study guide, searched together — the
        tables and numbers, and the discussion, stat notes and key points inside them.
      </p>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 2px" }}>
        Browse them instead: <Link href="/student/playbooks">Playbooks</Link> ·{" "}
        <Link href="/student/exam-prep">Exam Prep</Link>
      </p>

      <LibrarySearch scope={scope} variant="page" />
    </div>
  );
}
