import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ADMIN_AREA_LABELS } from "./admin-areas";

/**
 * Grant-chip labels must read as the Admin nav reads (see admin-areas.ts).
 * #499 was the boardsTagging chip saying "Boards Tagging" while NavContent
 * hardcoded "Boards Question Tagging". The nav now reads the shared label.
 */
describe("boardsTagging grant chip and Admin nav", () => {
  it("NavContent uses ADMIN_AREA_LABELS.boardsTagging", () => {
    const nav = readFileSync(
      path.join(process.cwd(), "src/components/shell/NavContent.tsx"),
      "utf8",
    );
    assert.match(nav, /label=\{ADMIN_AREA_LABELS\.boardsTagging\}/);
    assert.doesNotMatch(nav, /label="Boards Tagging"/);
  });

  it("the shared wording matches the boards-tagging page heading", () => {
    const page = readFileSync(
      path.join(process.cwd(), "src/app/(app)/admin/boards-tagging/page.tsx"),
      "utf8",
    );
    assert.equal(ADMIN_AREA_LABELS.boardsTagging, "Boards Question Tagging");
    assert.match(page, new RegExp(`>${ADMIN_AREA_LABELS.boardsTagging}<`));
  });
});
