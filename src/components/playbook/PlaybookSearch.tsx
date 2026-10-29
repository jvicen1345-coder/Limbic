"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchPlaybooksAction, type PlaybookSearchResponse } from "@/app/actions/playbook-search";
import { SearchIcon, LockIcon } from "@/components/icons";

/**
 * Search across every served playbook at once, from the hub (see
 * app/(app)/student/playbooks/page.tsx).
 *
 * Each playbook already ships its own in-page "Filter" box, which searches that one document
 * and only the table rows, numcells, references, drill cases and callouts in it. This searches
 * all seven, and the prose and statnotes the filter cannot see. The two are complementary:
 * this one finds the section, the filter narrows it once you are inside.
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
  case: "Drill case",
};

export function PlaybookSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PlaybookSearchResponse | null>(null);
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
      searchPlaybooksAction(trimmed).then(
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
    searchPlaybooksAction(trimmed, { expand: true }).then(
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

  return (
    <div className="pbsearch">
      <form
        className="pbsearch-bar"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          runExpanded();
        }}
      >
        <SearchIcon size={15} className="pbsearch-icon" />
        <input
          type="search"
          className="pbsearch-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search every playbook — a test, a number, or what you'd say to a patient"
          aria-label="Search every playbook"
          aria-controls={listId}
          autoComplete="off"
          spellCheck={false}
        />
        {(busy || expanding) && <span className="pbsearch-spinner" aria-hidden="true" />}
      </form>

      {show && (
        <div className="pbsearch-results" id={listId} role="region" aria-live="polite">
          {failed && <p className="pbsearch-note">Search is unavailable right now. Try again in a moment.</p>}

          {!failed && current?.gated && (
            <p className="pbsearch-note">Searching the playbooks needs a Limbic Student sign-in.</p>
          )}

          {!failed && current && !current.gated && (
            <>
              {current.expandedWith.length > 0 && (
                <p className="pbsearch-note">
                  Also searched for {current.expandedWith.join(", ")}.
                </p>
              )}

              {hits.length === 0 && !expanding && (
                <p className="pbsearch-note">
                  Nothing in the playbooks matches that.
                  {current.canExpand && " Press Enter to also search the terms these guides use for it."}
                </p>
              )}

              {hits.length > 0 && current.canExpand && (
                <p className="pbsearch-note">
                  No passage uses all of those words. Press Enter to also search the terms these
                  guides use for it.
                </p>
              )}

              <ul className="pbsearch-list">
                {hits.map((hit, position) => (
                  <li className="pbsearch-hit" key={`${hit.href}-${position}`}>
                    <a className="pbsearch-hit-link" href={hit.href}>
                      <span className="pbsearch-hit-where">
                        <span className="pbsearch-hit-guide">{hit.guideName}</span>
                        {hit.heading && <span className="pbsearch-hit-section">{hit.heading}</span>}
                        <span className="pbsearch-hit-kind">{KIND_LABEL[hit.kind] ?? hit.kind}</span>
                      </span>
                      {/* Segments are rendered as elements rather than set as markup — these
                          are a playbook's own words, and they are never trusted as HTML. */}
                      <span className="pbsearch-hit-text">
                        {hit.segments.map((segment, at) =>
                          segment.hit ? (
                            <mark className="pbsearch-mark" key={at}>
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
                <p className="pbsearch-locked">
                  <LockIcon size={12} />
                  {current.locked.map((entry) => `${entry.name} (${entry.matches})`).join(", ")} also
                  match — part of the Limbic Student plan.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
