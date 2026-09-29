# Exam Prep guides: source and build

The pages in `content/exam-prep/` are **generated**. Edit the source here and rebuild;
never hand-edit the HTML (the next build overwrites it).

There are two kinds of guide source:

- **Data guides** (`neuro/`): content in `topics.py` / `rest.py`, built into the shared engine
  by `build.py`.
- **HTML guides** (`cervical/`, `motor-control/`): the three finished pages (`index.html`,
  `arcade.html`, `atlas.html`) kept as standalone study pages with relative links, plus a
  `guide.py`. `build_html.py` adds the Limbic parts (noindex, the back link, the disclaimer,
  absolute links between the three pages) and refuses to build while the text still has
  wording that points at a class (see `BANNED` in the script).

```
scripts/exam-prep/
  build.py            builds data guides
  build_html.py       builds HTML guides
  engine/             shared page shell: styles, study engine (quiz, flashcards, spaced
                      review, mock quiz, weak spots, sheets, backup), games and atlas templates
  <guide>/            one folder per guide
    guide.py          slug, titles, masthead text, disclaimer, storage prefixes
    topics.py         key points, topic by topic (HTML strings, {{key}} citation chips)
    rest.py           side-by-side tables, confused pairs, connections, numbers, cases,
                      quiz (Q), flashcards (F), short answer (SA), mock quiz pools, open questions
    refs.py           reference text for each chip key
    refverified.json  published references checked against Crossref/PubMed (wins over refs.py)
    arcade_data.js    game content (MATCH, SORT, TF, SEQ, BL)
    atlas_figs.js     atlas diagrams (original SVG drawn in code)
```

## Rebuild

```sh
python3 scripts/exam-prep/build.py neuro
```

Writes `content/exam-prep/neuro-exam-prep.html`, `-arcade.html` and `-atlas.html`, with
Limbic paths, `noindex` and the disclaimer. Python 3 standard library only.

```sh
python3 scripts/exam-prep/build_html.py cervical
python3 scripts/exam-prep/build_html.py motor-control
```

Each writes `content/exam-prep/<slug>.html`, `-arcade.html` and `-atlas.html`.

A standalone copy (relative links, no Limbic chrome), for sharing outside the app:

```sh
python3 scripts/exam-prep/build.py neuro --personal /some/dir
```

## Updating a guide

1. Edit `topics.py` / `rest.py` (and `arcade_data.js`, `atlas_figs.js` if needed).
2. New published source: add it to `refs.py`, verify it, and add the checked entry to
   `refverified.json`.
3. Rebuild, then check `e2e/exam-prep.spec.ts` still matches (key point and question counts
   live in `src/lib/exam-prep.ts`: update them when they change).
4. Open a pull request with the source and the rebuilt HTML together.

Saved progress survives rebuilds as long as `pfx_limbic` in `guide.py` doesn't change.
Answer history is keyed by question text, so rewording a question resets that one item.

### Updating an HTML guide

1. Replace `index.html`, `arcade.html` and/or `atlas.html` in the guide folder with the new
   version of the page.
2. Keep the storage prefixes listed in its `guide.py` (`pfx`): a new version made elsewhere
   may use its own prefix, so search and replace it back, or readers lose saved progress.
3. Rebuild. If the build lists banned wording, rewrite those spots (cite the source, or
   drop the reference to the class) and build again. The script cannot know names: read
   for instructor, classmate and school names yourself.
4. Update the key point and question counts in `src/lib/exam-prep.ts` if they changed.

## Content rules (legal)

The repository is public and the guides are sold, so the source must be the author's own
synthesis:

- Cite published sources by their `{{key}}`. Anything only traceable to unpublished material
  uses a `u_*` key; the build cites every `u_*` key (except `u_egress`, a published poster)
  as the author's own study notes. Never add instructor names, course numbers, or school
  names to any file here.
- No verbatim slide text, class case vignettes, or quotes. Write original cases and examples,
  and mark worked examples and inferences with `<span class="mine">example</span>` /
  `<span class="mine">inference</span>`.
- Do not commit source materials (slides, handouts, extracted text or OCR) to this repository.

## Adding a new guide

Copy `neuro/` to a new folder, replace its content, set a new `slug` and new storage
prefixes in `guide.py`, register it in `src/lib/exam-prep.ts`, then build. The slug must not
collide with a playbook slug (they share the free-pick column; the e2e suite checks this).
