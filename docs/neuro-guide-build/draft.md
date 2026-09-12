# Step 3 — the draft

The hip and knee builds keep their draft in this file. This one keeps it in **`content.py`**, and
the reason is worth a paragraph because it is a departure from the template's process.

## Why the draft is executable here

The template's step 5 is "build the page", and in the earlier builds that meant transcribing a
Markdown draft into HTML by hand. That transcription is a second place for a number to change,
and this guide's whole claim is that its numbers did not change. Nothing in the process catches
a decimal that moved during the copy — `verification.md` records that all three defects found in
this build were in *prose around correct numbers*, which is exactly the class of error a manual
transcription step adds more of.

So `content.py` holds the rows, `build.py` renders them into
`docs/joint-playbook-template.html`, and the draft and the page cannot drift because one is
generated from the other. Re-running `build.py` after any edit is the whole of step 5.

## Reading the draft

`content.py` is plain data. Four helpers mark provenance and are the only things to know:

| In the draft | On the page | Means |
|---|---|---|
| `S("Rupp 2021")` | a linked citation | traced to that paper's freely readable text |
| `C()` | `Convention` | taught everywhere, tested by nobody |
| `X()` | `Contested` | measured, and the studies disagree |
| `NOSRC` | a flag, not a citation | searched for, not found — see `sources.md` |

The structures, in the order they are rendered:

- `CHECK` — the checklist. A row of `("PHASE", "heading")` prints a full-width phase heading and
  carries no tick box, so the phase groupings can be re-cut without renumbering anyone's saved
  check-off state.
- `NUMBERS` — the key-numbers grid. Every cell carries its citation; a cell that could not be
  sourced does not go in the grid at all.
- `SECTIONS` — the eleven content sections, each a list of `table`, `callout`, `callout-warn` or
  `figure` blocks.
- `DRILL` — the 26 recall questions.
- `REFS` — the reference list, grouped. `au` and `jo` are what the page's citation linker parses,
  so the surname in every `S(...)` must match the first author of an entry whose journal line
  carries that year. `checkcites.py` proves it does.
- `PATHWAY_FIGURE` — the guide's single diagram, inserted into the sensory section.

The additions block at the foot of the file is deliberate rather than untidy: those rows were
written **after** the first citation count came back at 96, below the 100 the e2e suite requires.
They were added by finding more content in sources already read — the ISNCSCI codes for missing
data, the sacral sparing rule, the FGA's reliability and protocol requirement, the Ashworth
against Tardieu correlation — rather than by citing the same claims twice. That distinction is
the point of leaving them visible in the file.

## One thing that is not in the draft

There is no intervention section, and `scope.md` argues why: the neurologic evidence for
intervention is a separate literature, and attaching a thin version of it to an examination guide
would be worse than omitting it.
