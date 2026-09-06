# Authoring a Limbic Playbook

Every playbook in `src/lib/playbooks/` is written against the same brief. It is
reproduced verbatim below, followed by how each part of it lands in the block model in
`src/lib/playbook-content.ts` — the brief describes a standalone HTML page, the repo
renders that same page from data, so a few instructions ("sticky nav", "numbered
sections", "checkbox that remembers its state") are already answered by
`src/components/playbook/PlaybookPage.tsx` and must not be re-implemented per playbook.

The content rules are the part that matters. The structure is a template; the finding
column, the named mechanism and the "what fakes a result" column are what make a
playbook worth coming back to.

## The brief

```
Build me a single-page HTML reference guide on [TOPIC], using [ATTACHED FILES /
your own knowledge]. Publish it as an artifact. It should be something I come
back to and work from, not something I read once.

STRUCTURE
- Masthead: small uppercase eyebrow, two-line title, one sentence on what the
  page is for, and a right-aligned block of 3-4 counts describing the scope.
- Sticky nav bar with jump links to every section.
- Numbered sections (01, 02...) with a rule under each heading.
- Section 01 is the operative checklist: every item I have to perform or know,
  in the order I'd do them, each with a checkbox that remembers its state in
  this browser, plus a progress counter.
- A "key numbers" grid: one cell per figure worth memorizing, big value on top,
  plain-language label under it. Use a fixed column count that divides the
  number of cells evenly so the last row is never ragged.
- Reference tables as the body of the page, with sticky headers and full-width
  group rows as sub-headings.
- Decision tables wherever something is diagnostic: "if this finding AND this
  qualifier, then this cause, do this."
- A few callouts for the things that are easy to get wrong.
- A drill at the end: 8-12 collapsible questions, answer hidden until clicked.
- Footer stating what it's compiled from, and specifically which parts are
  quoted from my sources versus supplied from your own knowledge.

CONTENT RULES - these matter more than the styling
- The last column of every table is the FINDING: the number, threshold, or
  observation that turns the step into information. Never a restatement of
  the step itself.
- Every claim carries a number, a landmark, or a named structure. Anything I'd
  have to describe as "feels wrong" isn't a finding yet.
- Name the mechanism, not just the label - what's actually happening.
- Add a "what fakes a result" column wherever something is commonly done wrong.
- If two of my sources conflict, or a number is contested, say so in one line
  instead of silently picking one.

DIAGRAMS
Draw original inline SVG anywhere a picture beats prose - a mechanism, a spatial
relationship, a comparison between two states, an arithmetic breakdown. Do not
reproduce figures or photos from my source files; tell me you're drawing instead.
One claim per figure, with a caption stating that claim.

VISUAL SYSTEM
Three fonts: a display face for headings, a body face for prose, a monospace face
for numbers and labels. One accent color plus a neutral tinted slightly toward
it; use semantic colors only for a real severity or level dimension in the
content. Works in light and dark. Tabular figures wherever numbers align.

TECHNICAL
No horizontal scrolling at any width - tables fit the container, and on narrow
screens each row becomes a card with the column name printed above each value.
Don't let words break mid-word. Everything readable at rest, nothing hidden
behind scroll animations.
```

## How the brief maps onto the block model

| Brief | Where it lives | Notes |
| --- | --- | --- |
| Eyebrow, two-line title, one-sentence purpose | `Playbook.eyebrow`, `.title`, `.summary` | `title` may hold a line break the index-card `name` shouldn't. |
| Right-aligned block of 3–4 counts | `Playbook.stamp` | Shoulder uses four: exam items, movement syndromes, irritability levels, equipment. |
| Sticky nav with jump links | Already rendered | From each section's `id` + `navLabel`. Write a nav label short enough for one row. |
| Numbered sections with a rule | Already rendered | `PlaybookPage` numbers by array order (`01`, `02`, …); never hand-number a heading. |
| Section 01 is the checklist, with saved state and a progress counter | `{ kind: "checklist" }` | Must be the first section. State is `localStorage` under `limbic-playbook-<slug>-v1`, keyed by `PlaybookChecklistItem.id` — ids are stable identifiers, not positions, so renumbering the list must not renumber them or readers lose their ticks. The progress counter is automatic. |
| Key-numbers grid, fixed column count, no ragged last row | `{ kind: "numbers" }` | The in-app grid is responsive (`auto-fill, minmax(215px, 1fr)`), so the column count changes with the viewport and the last row's cells stretch to fill it — the brief's "pick a count that divides evenly" is answered by the CSS here, and any number of cells is fine. |
| Reference tables, sticky headers, full-width group rows | `{ kind: "table" }` | A row is either a cell array or `{ group: "…" }` for the full-width sub-heading. Every cell array must be exactly `columns.length` long — a short row renders short rather than throwing (the e2e content check catches it). Use the `num` cell variant for measurements so they align, `name` for the row subject, `tissue` for the wide "what this actually tests" column. |
| Decision tables | `{ kind: "table" }` | Same block; the shape is the discipline — finding, qualifier, cause, action. |
| Callouts for the easy-to-get-wrong | `{ kind: "callout", tone: "note" \| "warn" }` | `warn` is for things that change a decision, not for emphasis. |
| Drill of 8–12 collapsible questions | `{ kind: "drill" }` | Native `<details>`; both `question` and `answer` must be filled (checked in e2e). |
| Footer: compiled from what, quoted vs. supplied | `Playbook.footer` | Say plainly which numbers are reproduced from source material and which are assembled — see the shoulder footer for the form. |
| Original inline SVG, one claim per figure, caption states the claim | `{ kind: "figure", figureId, title, caption }` + `src/components/playbook/PlaybookFigures.tsx` | Diagrams are the one thing that can't be data. Add the component and register it in the `FIGURES` map; an unregistered id silently drops the drawing. Draw originals — never trace a figure or photo out of a source. |
| Three fonts, one accent, semantic colour only for a real level dimension | `src/app/globals.css` | Already set by the app's type and colour system. The only semantic dimension in the content is irritability: pills `[[pill:h\|…]]`, `m`, `l` and the `PlaybookCard.tone` of the same letters. Don't invent a second colour axis. |
| Tabular figures, no horizontal scroll, row-becomes-card on narrow screens | Partly — see note | Tabular figures and the no-page-scroll rule hold: `.playbook-numcell-value` uses `font-variant-numeric: tabular-nums`, and horizontal scroll lives on `.playbook-tablewrap`, never on the page. The row-becomes-card treatment is the one part of the brief the app does **not** implement — a playbook table is `min-width: 640px` and scrolls inside its wrapper on a phone, because several of these tables are five columns of prose. Nothing per playbook to do either way; just don't assume a narrow reader sees every column at once, and put the finding in the last column regardless. |
| "Publish it as an artifact" | Not applicable in-repo | A playbook here is a page in the app: a new file under `src/lib/playbooks/` added to `PLAYBOOKS`. |

Prose fields take the inline markup in `src/lib/playbook-inline.ts` (`**bold**`,
`*emphasis*`, `[[pill:h|label]]`, `\n` for a line break inside a cell) — not HTML, and
not full Markdown.

## Adding a playbook

1. Write `src/lib/playbooks/<region>.ts` exporting a `Playbook`, with a module docblock
   saying what order the examination is in and where its numbers come from.
2. Add it to `PLAYBOOKS` in `src/lib/playbook-content.ts`. The index page and routes
   pick it up from there; no new components and no new route file.
3. Add any new figures to `PlaybookFigures.tsx` and register them in `FIGURES`.
4. Run `npx playwright test e2e/playbooks.spec.ts`. Those checks exist because the
   failure modes of a few hundred hand-authored rows are all silent: duplicate checklist
   ids tie two items to one saved tick, a short row renders short, an unmatched `*`
   prints as literal text, an unregistered `figureId` drops the drawing.

## The rules that are easy to let slip

- **The last column is the finding, always.** "Assess scapular position" is a step;
  "inferior angle >3 cm from midline" is a finding. If the last column restates the
  step, the row isn't finished.
- **Every claim carries a number, a landmark, or a named structure.** Anything a reader
  would have to describe as "feels wrong" isn't a finding yet.
- **Name the mechanism, not the label.** What is actually happening to which tissue.
- **Add a "what fakes a result" column wherever the test is commonly done wrong** —
  substitution, compensation, a positioning error that produces the same reading.
- **Contested numbers get one line saying so**, in the row or a `footnote` block, rather
  than a silent pick between two sources.
