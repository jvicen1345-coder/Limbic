# Building the hip guide

Follows `docs/joint-playbook-template.md`, which puts verification third for a reason: the
shoulder guide's first draft carried 37 errors across 545 claims — about one in fourteen —
including a fabricated citation and two references to studies that do not exist, none of which
re-reading found.

| Step | File | State |
|---|---|---|
| 1 · Scope | `scope.md` | done — 35 competencies, twelve sections matching the shoulder |
| 2 · Source bank | `sources.md` | 13 papers read; 4 values recorded untraceable; 5 minor items open |
| 3 · Draft | `draft.md` | done — 12 sections, 63 citations, 11 references |
| 4 · Adversarial verification | `verification.md` | done — 5 defects, all fixed (pass 1 transcription, pass 2 selective quotation) |
| 5 · Build the page | — | not started |

`lookup.py` queries Europe PMC and prints title, authors, journal, ids, whether the full text
is free, and the abstract verbatim:

```
python3 docs/hip-guide-build/lookup.py 'AUTH:"Sutlive" AND hip AND osteoarthritis' 1
```

Europe PMC's REST API is used rather than PubMed or a publisher page because those return a
cookie wall or a JavaScript shell to a fetcher, and a source you cannot read is a source you
cannot cite.

## The rule this build follows

A value goes in **unmarked** only if the freely readable text of a named paper carries that
exact value. If only the abstract is free, only the abstract may be quoted. Anything else is
`Convention` if nobody measured it, `Contested` if the studies disagree, or it does not go in.

`sources.md` therefore records what each paper **does not** support alongside what it does.
That column is where fabrication would otherwise happen: a real paper, a real author, a real
year, and a number that is not in it.
