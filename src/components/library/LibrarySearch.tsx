"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchLibraryAction, type LibrarySearchResponse } from "@/app/actions/library-search";
import { POOL_LABEL } from "@/lib/library-sources";
import { SearchIcon, LockIcon } from "@/components/icons";

/**
 * Search across every served playbook and Exam Prep study guide at once.
 *
 * Rendered as the whole of app/(app)/student/search, and inline on the Playbooks hub. Both
 * surfaces say what is being searched — the point is that a reader never has to guess whether
 * a result came from a playbook or a study guide, or whether the thing they did not find was
 * even looked at. Every result carries its pool, and the scope line states the counts.
 *
 * Each playbook also ships its own in-page "Filter" box, which searches that one document and
 * only the table rows, numcells, references, drill cases and callouts in it. This searches all
 * ten documents, and the prose, statnotes and key points that filter cannot see. The two are
 * complementary: this one finds the section, the filter narrows it once you are inside.
 *
 * Two tiers of searching, which the box makes visible rather than guessing between. Typing
 * ranks lexically on every keystroke — instant, and the right answer for the exact tokens
 * this library is full of (a test name, "1.06", "ATFL"). Submitting also asks for the
 * vocabulary the documents use for what you wrote, which is what finds "instability" when
 * you typed "gives way". Only the submit path costs a model call, so the common case is free.
 */

/** Long enough that a word is mostly typed, short enough to feel live. */
const DEBOUNCE_MS = 220;

/** The query exactly as the action will record it, so a response can be matched back to the
 *  text in the box. The action trims and caps at 200 characters and echoes that in
 *  `response.query`; normalizing the same way here is what lets the render decide whether a
 *  result is current instead of an effect clearing stale state. */
function asked(raw: string): string {
  return raw.trim().slice(0, 200);
}

const KIND_LABEL: Record<string, string> = {
  heading: "Section",
  prose: "Discussion",
  statnote: "Stat note",
  callout: "Callout",
  row: "Table",
  number: "Number",
  reference: "Reference",
  case: "Breakdown",
  keypoint: "Key point",
};

export interface LibrarySearchProps {
  /** Counts for the scope line, resolved on the server so the surface can state what it
   *  searches before anyone types. Falls back to whatever a response reports. */
  scope?: { playbooks: number; studyGuides: number };
  /** The page uses a larger field and autofocuses; the hub's inline box does neither. */
  variant?: "page" | "inline";
}

function scopeLine(scope: { playbooks: number; studyGuides: number }): string {
  const parts: string[] = [];
  if (scope.playbooks > 0) parts.push(`${scope.playbooks} playbook${scope.playbooks === 1 ? "" : "s"}`);
  if (scope.studyGuides > 0) {
    parts.push(`${scope.studyGuides} study guide${scope.studyGuides === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}

export function LibrarySearch({ scope, variant = "inline" }: LibrarySearchProps = {}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LibrarySearchResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [failed, setFailed] = useState(false);
  const listId = useId();

  // Identifies the most recent request so a slow earlier one cannot overwrite a newer
  // result. Server Actions are dispatched one at a time per client, so they cannot race
  // each other, but they can still resolve after the query has moved on.
  const latest = useRef(0);

  useEffect(() => {
    const trimmed = asked(query);
    // Nothing to clear here: which result is current is derived below from the query it was
    // asked for, so a query that is too short to search simply has no current result.
    if (trimmed.length < 2) return;
    const ticket = ++latest.current;
    const handle = window.setTimeout(() => {
      setBusy(true);
      setFailed(false);
      searchLibraryAction(trimmed).then(
        (next) => {
          if (ticket !== latest.current) return;
          setResult(next);
          setFailed(false);
          setBusy(false);
        },
        () => {
          if (ticket !== latest.current) return;
          setFailed(true);
          setBusy(false);
        }
      );
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  function runExpanded() {
    const trimmed = asked(query);
    if (trimmed.length < 2 || expanding) return;
    const ticket = ++latest.current;
    setExpanding(true);
    searchLibraryAction(trimmed, { expand: true }).then(
      (next) => {
        if (ticket !== latest.current) return;
        setResult(next);
        setFailed(false);
        setExpanding(false);
      },
      () => {
        if (ticket !== latest.current) return;
        setFailed(true);
        setExpanding(false);
      }
    );
  }

  const trimmed = asked(query);
  const show = trimmed.length >= 2;
  // A result belongs to the query it was asked for. Holding the last response in state and
  // deciding here whether it is current means an in-flight query never briefly renders the
  // previous query's hits.
  const current = result && result.query === trimmed ? result : null;
  const hits = current?.hits ?? [];
  // Prefer the server-rendered scope so the line is right before anyone types; fall back to
  // whatever the last response reported.
  const shownScope = scope ?? current?.scope;

  return (
    <div className={`libsearch${variant === "page" ? " libsearch--page" : ""}`}>
      <form
        className="libsearch-bar"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          runExpanded();
        }}
      >
        <SearchIcon size={variant === "page" ? 17 : 15} className="libsearch-icon" />
        <input
          type="search"
          className="libsearch-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="A test, a number, or what you'd say to a patient"
          aria-label="Search playbooks and study guides"
          aria-controls={listId}
          autoComplete="off"
          spellCheck={false}
        />
        {(busy || expanding) && <span className="libsearch-spinner" aria-hidden="true" />}
      </form>

      {/* Said before anything is typed, and kept visible while results are on screen: a
          reader should never have to infer what was searched from what came back. */}
      {shownScope && (shownScope.playbooks > 0 || shownScope.studyGuides > 0) && (
        <p className="libsearch-scope">Searching {scopeLine(shownScope)}</p>
      )}

      {show && (
        <div className="libsearch-results" id={listId} role="region" aria-live="polite">
          {failed && <p className="libsearch-note">Search is unavailable right now. Try again in a moment.</p>}

          {!failed && current?.gated && (
            <p className="libsearch-note">Searching playbooks and study guides needs a Limbic Student sign-in.</p>
          )}

          {!failed && current && !current.gated && (
            <>
              {current.expandedWith.length > 0 && (
                <p className="libsearch-note">
                  Also searched for {current.expandedWith.join(", ")}.
                </p>
              )}

              {hits.length === 0 && !expanding && (
                <p className="libsearch-note">
                  Nothing in the playbooks or study guides matches that.
                  {current.canExpand && " Press Enter to also search the terms these documents use for it."}
                </p>
              )}

              {hits.length > 0 && current.canExpand && (
                <p className="libsearch-note">
                  No passage uses all of those words. Press Enter to also search the terms these
                  documents use for it.
                </p>
              )}

              <ul className="libsearch-list">
                {hits.map((hit, position) => (
                  <li className="libsearch-hit" key={`${hit.href}-${position}`}>
                    <a className="libsearch-hit-link" href={hit.href}>
                      <span className="libsearch-hit-where">
                        <span className={`libsearch-pool libsearch-pool--${hit.pool}`}>
                          {POOL_LABEL[hit.pool]}
                        </span>
                        <span className="libsearch-hit-guide">{hit.guideName}</span>
                        {hit.heading && <span className="libsearch-hit-section">{hit.heading}</span>}
                        <span className="libsearch-hit-kind">{KIND_LABEL[hit.kind] ?? hit.kind}</span>
                      </span>
                      {/* Segments are rendered as elements rather than set as markup — these
                          are a document's own words, and they are never trusted as HTML. */}
                      <span className="libsearch-hit-text">
                        {hit.segments.map((segment, at) =>
                          segment.hit ? (
                            <mark className="libsearch-mark" key={at}>
                              {segment.text}
                            </mark>
                          ) : (
                            <span key={at}>{segment.text}</span>
                          )
                        )}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              {current.locked.length > 0 && (
                <p className="libsearch-locked">
                  <LockIcon size={12} />
                  {current.locked
                    .map((entry) => `${entry.name} (${entry.matches})`)
                    .join(", ")}{" "}
                  also match — part of the Limbic Student plan.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
