"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLAIN_TERM_LOOKUP, type PlainTerm } from "@/lib/plain-language";

/** Renders a string of clinical prose with its jargon made tappable — see
 *  lib/plain-language.ts for the glossary and why it exists.
 *
 *  Tap, not hover. A tooltip on hover is invisible to every phone reader, and the readers
 *  this is for are the most likely to be on one. It is a real <button> for the same reason:
 *  keyboard and screen-reader users get the explanation too, which a `title` attribute or a
 *  CSS-only popover would not give them.
 *
 *  Only the **first** occurrence of a term in a given string is marked. Underlining all 85
 *  instances of "flexion" would turn the Atlas into a field of dotted lines and teach the
 *  reader to ignore them, which is the opposite of the point. */
export function PlainText({ children }: { children: string }) {
  const parts = useMemo(() => annotate(children), [children]);
  if (parts.length === 1 && typeof parts[0] === "string") return <>{parts[0]}</>;
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <PlainTermMark key={i} entry={p.entry} label={p.label} />
        )
      )}
    </>
  );
}

type Piece = string | { entry: PlainTerm; label: string };

/** Longest first, so "plantarflexion" is matched whole rather than as the "flexion" inside
 *  it. Word boundaries alone nearly handle that — the `i` before "flexion" in "dorsiflexion"
 *  is a word character, so \b fails there — but alternation is leftmost-first, and ordering
 *  makes the intent explicit instead of relying on that. */
const MATCH_PATTERN = new RegExp(
  `\\b(${[...PLAIN_TERM_LOOKUP.keys()]
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`,
  "gi"
);

function annotate(text: string): Piece[] {
  if (!text) return [text];
  const pieces: Piece[] = [];
  const seen = new Set<PlainTerm>();
  let last = 0;
  // A fresh regex per call: the shared one is /g and carries lastIndex between uses, which
  // would make the result depend on whatever string was annotated before this one.
  const re = new RegExp(MATCH_PATTERN.source, "gi");
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    const entry = PLAIN_TERM_LOOKUP.get(m[0].toLowerCase());
    if (!entry || seen.has(entry)) continue;
    seen.add(entry);
    if (m.index > last) pieces.push(text.slice(last, m.index));
    pieces.push({ entry, label: m[0] });
    last = m.index + m[0].length;
  }
  if (pieces.length === 0) return [text];
  if (last < text.length) pieces.push(text.slice(last));
  return pieces;
}

function PlainTermMark({ entry, label }: { entry: PlainTerm; label: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLSpanElement | null>(null);
  const popId = useId();

  /* Positioned in viewport coordinates and rendered through a portal to <body>, not as an
     absolutely-positioned child of the word. The Atlas panel is `overflow-y: auto` (see
     .atlas-content-panel), and an absolutely-positioned popover inside a scroll container is
     clipped by it — measured at 25 of 36 terms cut off on desktop before this. A portal is
     the only fix that doesn't require the container to stop scrolling. */
  const place = useCallback(() => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn) return;
    const b = btn.getBoundingClientRect();
    const w = pop?.offsetWidth ?? 300;
    const h = pop?.offsetHeight ?? 120;
    const margin = 8;
    let left = b.left;
    if (left + w > window.innerWidth - margin) left = window.innerWidth - w - margin;
    if (left < margin) left = margin;
    // Above the word when there isn't room below it — near the foot of a long panel there
    // usually isn't.
    const below = b.bottom + 7;
    const top = below + h > window.innerHeight - margin && b.top - h - 7 > margin ? b.top - h - 7 : below;
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Capture phase, so a scroll inside the Atlas panel repositions this too — a scroll on a
    // nested element doesn't bubble to window.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, place]);

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className="plain-term"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <span className="plain-term-sr"> — what this means</span>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            className="plain-term-pop"
            id={popId}
            ref={popRef}
            role="note"
            style={pos ? { top: pos.top, left: pos.left } : { opacity: 0 }}
          >
            <span className="plain-term-pop-word">{entry.term}</span>
            <span className="plain-term-pop-what">{entry.what}</span>
            <span className="plain-term-pop-eg">{entry.example}</span>
          </span>,
          document.body
        )}
    </>
  );
}
