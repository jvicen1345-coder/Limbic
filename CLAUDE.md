@AGENTS.md

# Styling

There is no Tailwind in this project. All styling is hand-written CSS in
`src/app/globals.css`, which is large (~10k lines) and has its media queries
interleaved through the file rather than grouped at the bottom — a mobile rule and a
desktop rule can sit ten lines apart. `sm:` / `md:` / `lg:` utility classes do nothing
here; don't write them.

When adding styles for a new feature, append new scoped classes (`.boards-*`,
`.atrium-*`, …) at the end of the file rather than modifying or reordering existing
rules, and never bulk-reformat or re-sort it.
