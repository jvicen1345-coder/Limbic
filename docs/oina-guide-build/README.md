# Building the muscle OINA guide

Origin, insertion, innervation and action (OINA) for every muscle an entry-level curriculum
covers, head to foot, each with its manual muscle test and what fakes the test; then the same
muscles as they are discussed together — named groups and force couples, every joint movement
with its prime movers and antagonists, and every motor nerve with the picture its loss produces.

Served at `/student/guides/muscle-oina` from `content/playbooks/muscle-oina.html`, registered
in `src/lib/guides.ts`. **Marked `comingSoon`** until step 4 below is done: an admin can read
it on the site, a student sees the card without a way in.

## Steps

Follows `docs/joint-playbook-template.md`.

| Step | Where | State |
|---|---|---|
| 1 · Scope | the section list below | done — 177 rows in 13 regional tables, plus grading, groups, movements and nerves |
| 2 · Source bank | `refs.py`, `refs.json` | 99 StatPearls chapters plus the ISNCSCI standard; each chapter's title, authors, year, PMID and NBK accession confirmed in PubMed by `resolve.py` |
| 3 · Draft | `ul.py`, `ll.py`, `axial.py`, `head.py`, `relations.py`, `content.py` | done |
| 4 · Adversarial verification | — | **not done** — see below |
| 5 · Build the page | `build.py` → `content/playbooks/muscle-oina.html` | done |

```
python3 docs/oina-guide-build/resolve.py   # network: PubMed; only looks up chapters not yet in refs.json
python3 docs/oina-guide-build/build.py     # no network
```

## What is and is not verified

- **The references exist and are free.** Every chapter was found in PubMed by exact title, and
  links to its NCBI Bookshelf page.
- **The rows have not been checked against the chapter text.** Bookshelf and Europe PMC both
  serve a bot wall to a fetcher, so the chapters could not be read from the build environment.
  The OINA values are standard descriptive anatomy, but "standard" is exactly the claim step 4
  exists to test: go through each section's rows against the chapter cited in each name cell,
  looking for errors rather than confirmation, and record what is found here before removing
  `comingSoon`.
- **The manual muscle test positions are marked Convention everywhere.** They follow the widely
  taught positions of the standard muscle-testing texts, none of which is free to read, so none
  is cited.
- **Where standard texts disagree, the row says so** and carries a Contested marker: supinator
  roots, flexor digitorum and hallucis longus roots, plantar intrinsic roots, the nerve to
  pectineus, flexor pollicis brevis's split supply, and a few test norms.
- **The only quoted values** are the 0–5 motor grades and the ten ISNCSCI key muscles, from
  Rupp 2021, the same source the neurologic guide traced (`docs/neuro-guide-build/sources.md`).

## Citations and the template's linker

The template links `Surname Year` to the **first** reference entry carrying that name and year
in any author position. StatPearls chapters share authors heavily, so `build.py`:

- orders the anatomy chapters so each one is reachable by a name no earlier entry carries
  (`order_and_name`), and cites it by that name — usually the first author, sometimes a
  co-author;
- dropped nine chapters whose author list and year repeat another's, citing a broader chapter
  for those rows instead (listed in `refs.py`);
- gives every entry an `id="ref-<key>"` and every citation a `data-ref="<key>"`, so a browser
  check can confirm each link lands on the entry it was written for;
- fails if any reference is never cited.

## Sections

Checklist · Numbers · Grading · Scapula · Shoulder · Elbow · Wrist & fingers · Hand · Hip ·
Thigh · Leg & ankle · Foot · Trunk · Breathing & pelvic floor · Neck · Head · Together ·
Movements · Nerves · Drill · Refs.

Each muscle table has seven columns — Muscle, Origin, Insertion, Nerve (roots), Action, Manual
muscle test, What fakes it — and the template's recall chips work per column, so a reader can
blank just the nerves, or everything but the name.
