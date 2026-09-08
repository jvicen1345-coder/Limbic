<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guidance

This repository is Limbic, a Next.js 16 App Router application written in TypeScript.
Prefer Server Components and Server Actions for application behavior; do not add hand-rolled
API routes unless the existing architecture clearly requires one. Persistence uses Prisma 7
with SQLite/libSQL, so schema changes require an appropriate Prisma migration and must work
with both local SQLite and hosted Turso databases.

There is no Tailwind. Styling is hand-written in `src/app/globals.css`; utility prefixes such
as `sm:`, `md:`, and `lg:` do nothing. That file has interleaved media queries and is a shared
chokepoint. For a new feature, append narrowly scoped classes at the end rather than
reordering or bulk-formatting existing rules. Keep mobile and desktop edits in the appropriate
media-query/base sections, close every block, and verify the final brace depth is zero.

`src/components/AppShell.tsx` is another shared chokepoint: its navigation content is used by
both the desktop sidebar and mobile drawer. Treat it as owned/shared work, and verify both
surfaces after any change.

## Agent workflows

- Follow [`docs/agent-issue-workflow.md`](docs/agent-issue-workflow.md) for issue intake,
  investigation, implementation planning, and website-impact reporting.
- Follow [`COORDINATION.md`](COORDINATION.md) for parallel-session ownership, branch
  synchronization, CI, and shared-file safety.

Keep this file limited to durable project rules. Do not add temporary branch reservations,
stale PR history, or date-bound status notes.
