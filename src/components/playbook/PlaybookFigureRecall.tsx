"use client";

/**
 * A figure that can have its labels blanked (see PlaybookRecall.tsx).
 *
 * A diagram whose labels are hidden is a different question from a table with a hidden column:
 * you are naming the anatomy rather than recalling a row, and the caption underneath gives the
 * answer away, so it is blurred with them. Clicking one label lifts it — and lifts the lines
 * that belong with it, because a legend entry is several <text> elements stacked a few pixels
 * apart and revealing only the line you happened to click reads as a bug.
 *
 * Which lines belong together is measured from the rendered geometry rather than declared in
 * the drawing: the figures are hand-authored SVG (PlaybookFigures.tsx) and threading a grouping
 * convention through every one of them would be a rule every future figure has to remember.
 * Text within a few pixels vertically and overlapping horizontally is one block; a clear line
 * apart is a new one. Measured once per figure, on first click, since getBBox forces layout.
 */

import { useEffect, useRef } from "react";
import { PlaybookFigure } from "@/components/playbook/PlaybookFigures";
import { PlaybookInline } from "@/components/playbook/PlaybookInline";
import { PlaybookGroupBar, useRecall } from "@/components/playbook/PlaybookRecall";
import { recallCellId } from "@/lib/playbook-recall";

/** Vertical gap, in user units, under which two lines of text read as one entry. */
const SAME_BLOCK_GAP = 9;

function blocksOf(svg: SVGSVGElement): SVGTextElement[][] {
  const items = Array.from(svg.querySelectorAll("text")).map((el) => {
    let box = { x: 0, y: 0, width: 0, height: 0 };
    try {
      box = el.getBBox();
    } catch {
      // Firefox throws on a node that isn't rendered yet; a zero box just means it lands in
      // its own block, which is the safe answer.
    }
    return { el, x1: box.x, x2: box.x + box.width, y1: box.y, y2: box.y + box.height };
  });
  items.sort((a, b) => a.y1 - b.y1);

  const clusters: (typeof items)[] = [];
  for (const item of items) {
    const found = clusters.find((cluster) => {
      const last = cluster[cluster.length - 1];
      const sameColumn = item.x1 < last.x2 + 6 && last.x1 < item.x2 + 6;
      const gap = item.y1 - last.y2;
      return sameColumn && gap < SAME_BLOCK_GAP && gap > -30;
    });
    if (found) found.push(item);
    else clusters.push([item]);
  }
  return clusters.map((cluster) => cluster.map((item) => item.el));
}

export function PlaybookFigureBlock({
  groupId,
  figureId,
  title,
  caption,
}: {
  groupId: string;
  figureId: string;
  title: string;
  caption: string;
}) {
  const { isCellMasked, isRevealed } = useRecall();
  const ref = useRef<HTMLElement | null>(null);
  const blocks = useRef<SVGTextElement[][] | null>(null);

  const masked = isCellMasked(groupId, 0, 0);
  const shown = isRevealed(recallCellId(groupId, 0, 0));
  const hidden = masked && !shown;

  // Individual labels are lifted by class rather than by state: the reader may open a dozen of
  // them one at a time, and re-rendering the whole drawing for each would drop the browser's
  // text layout and flicker.
  useEffect(() => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    if (!hidden) svg.querySelectorAll("text.playbook-label-shown").forEach((el) => el.classList.remove("playbook-label-shown"));
  }, [hidden]);

  function onClick(event: React.MouseEvent) {
    if (!hidden) return;
    const svg = ref.current?.querySelector("svg");
    const target = (event.target as Element).closest("text");
    if (!svg || !target) return;
    event.stopPropagation();
    if (!blocks.current) blocks.current = blocksOf(svg as SVGSVGElement);
    const block = blocks.current.find((group) => group.includes(target as SVGTextElement)) ?? [target as SVGTextElement];
    const on = !target.classList.contains("playbook-label-shown");
    block.forEach((el) => el.classList.toggle("playbook-label-shown", on));
  }

  return (
    <>
      <PlaybookGroupBar groupId={groupId} labels={["Labels"]} />
      <figure
        ref={ref}
        className={hidden ? "playbook-figure playbook-labels-hidden" : "playbook-figure"}
        onClick={onClick}
      >
        <p className="playbook-figtitle">{title}</p>
        <PlaybookFigure figureId={figureId} />
        <figcaption>
          <PlaybookInline text={caption} />
        </figcaption>
      </figure>
    </>
  );
}
