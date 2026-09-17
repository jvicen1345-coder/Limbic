import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTINUE_READING_FINISHED_THRESHOLD,
  pickContinueReading,
  reportedScrollProgress,
} from "./reading-progress";

const articles = [
  { id: "cpg-neck-pain-2017", title: "Neck Pain: Revision 2017" },
  { id: "cpg-low-back-pain-2021", title: "Low Back Pain: Revision 2021" },
  { id: "cpg-hip-oa-2025", title: "Hip Osteoarthritis: Revision 2025" },
];

describe("pickContinueReading", () => {
  it("returns null when there is no reading history", () => {
    assert.equal(pickContinueReading([], articles), null);
  });

  it("hides a 100% read — and anything at or above the finished threshold", () => {
    assert.equal(
      pickContinueReading([{ articleId: "cpg-neck-pain-2017", scrollProgress: 1 }], articles),
      null
    );
    assert.equal(
      pickContinueReading(
        [{ articleId: "cpg-neck-pain-2017", scrollProgress: CONTINUE_READING_FINISHED_THRESHOLD }],
        articles
      ),
      null
    );
  });

  it("surfaces a partway read with the matching percentage and bar fraction", () => {
    const pick = pickContinueReading(
      [{ articleId: "cpg-neck-pain-2017", scrollProgress: 0.4 }],
      articles
    );
    assert.deepEqual(pick, {
      articleId: "cpg-neck-pain-2017",
      title: "Neck Pain: Revision 2017",
      progress: 0.4,
      progressLabel: "40% read",
    });
  });

  it("labels progress under 1% as Just started", () => {
    const pick = pickContinueReading(
      [{ articleId: "cpg-neck-pain-2017", scrollProgress: 0 }],
      articles
    );
    assert.equal(pick?.progressLabel, "Just started");
  });

  it("picks the most recently touched unfinished row, skipping finished ones", () => {
    const pick = pickContinueReading(
      [
        { articleId: "cpg-neck-pain-2017", scrollProgress: 1 },
        { articleId: "cpg-low-back-pain-2021", scrollProgress: 0.4 },
        { articleId: "cpg-hip-oa-2025", scrollProgress: 0.2 },
      ],
      articles
    );
    assert.equal(pick?.articleId, "cpg-low-back-pain-2021");
    assert.equal(pick?.progressLabel, "40% read");
  });

  it("returns null when every read is finished", () => {
    assert.equal(
      pickContinueReading(
        [
          { articleId: "cpg-neck-pain-2017", scrollProgress: 1 },
          { articleId: "cpg-low-back-pain-2021", scrollProgress: 0.97 },
        ],
        articles
      ),
      null
    );
  });

  it("returns null when the chosen unfinished article has churned out of the pool", () => {
    assert.equal(
      pickContinueReading([{ articleId: "live-gone", scrollProgress: 0.4 }], articles),
      null
    );
  });
});

describe("reportedScrollProgress", () => {
  it("does not record 100% for a no-scroll-room article without engagement", () => {
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 800,
        clientHeight: 800,
        scrollTop: 0,
        engaged: false,
      }),
      0
    );
  });

  it("records 100% for a no-scroll-room article the reader sat with or scrolled", () => {
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 800,
        clientHeight: 900,
        scrollTop: 0,
        engaged: true,
      }),
      1
    );
  });

  it("reports the scroll fraction for a long article regardless of engagement", () => {
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 2000,
        clientHeight: 1000,
        scrollTop: 400,
        engaged: false,
      }),
      0.4
    );
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 2000,
        clientHeight: 1000,
        scrollTop: 400,
        engaged: true,
      }),
      0.4
    );
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 2000,
        clientHeight: 1000,
        scrollTop: 0,
        engaged: true,
      }),
      0
    );
  });

  it("clamps a long-article position to 0–1", () => {
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 2000,
        clientHeight: 1000,
        scrollTop: -10,
        engaged: true,
      }),
      0
    );
    assert.equal(
      reportedScrollProgress({
        scrollHeight: 2000,
        clientHeight: 1000,
        scrollTop: 2000,
        engaged: true,
      }),
      1
    );
  });
});
