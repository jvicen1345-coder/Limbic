# Limbic — PT News

A real implementation of the "PT News" design (`project/PT News.dc.html` in the repo root),
built as a Next.js 16 (App Router) app with a SQLite-backed persistence layer and live
data sourcing, in place of the design prototype's in-memory-only state and static seed
content.

## Stack

- **Next.js 16** (App Router, TypeScript), Server Components + Server Actions for
  mutations (no hand-rolled `/api` routes — sign-in, save/unsave, profile edits, topic
  follows, and HEP CRUD are all Server Actions).
- **Prisma 7 + SQLite** (via the `@prisma/adapter-libsql` driver adapter) for
  persistence: user profiles, license/CE info, saved articles, and clinician-authored
  home exercise programs survive restarts and are keyed by license number, so signing
  back in with the same license number returns to the same account. The libSQL adapter
  works identically against a local file in development and a hosted
  [Turso](https://turso.tech) database in production — same schema, same queries, no
  branching — because a plain local SQLite file (what the app defaults to) doesn't
  survive on most serverless hosts, whose filesystems reset between requests.
- Plain CSS (`src/app/globals.css`), not Tailwind — the design system's tokens and
  component classes (`.card`, `.btn`, `.tag`, …) were ported directly from the exported
  `styles.css` with the blue/white palette override baked into `:root`, to stay
  pixel-faithful to the source design rather than re-deriving it in a utility framework.

## Getting started

```bash
npm install
npx prisma migrate deploy   # or `npx prisma migrate dev` in development
npm run dev
```

Visit `http://localhost:3000`. Sign-in is a demo flow — any license number works — or
continue as a guest. Guests can read/search/save articles and personalize their profile,
but Home Exercise Programs, APTA News, and Under Review are gated behind having a
license on file (matching the source design).

## Deploying (Vercel + Turso)

None of this can be done from a coding assistant — each step needs your own account —
but here's the exact path, start to finish.

**1. Create a Turso database** (free tier is plenty for this app):

```bash
curl -sSfL https://get.tur.so/install.sh | bash   # installs the turso CLI
turso auth signup                                  # or `turso auth login` if you have one
turso db create pt-news
turso db show pt-news --url          # → libsql://pt-news-<your-org>.turso.io
turso db tokens create pt-news       # → a long auth token
```

**2. Put this project on GitHub** (skip if it's already there):

```bash
gh repo create pt-news --private --source=. --push
# or, without gh: create an empty repo on github.com, then
#   git remote add origin <your-repo-url> && git push -u origin main
```

**3. Import it into Vercel:** [vercel.com/new](https://vercel.com/new) → pick the GitHub
repo → it auto-detects Next.js, no build settings to change.

**4. Before the first deploy finishes, add these Environment Variables** in the Vercel
project's Settings → Environment Variables (Production, and Preview if you want preview
deploys to work too):

| Name | Value |
|---|---|
| `DATABASE_URL` | the `libsql://...` URL from step 1 |
| `TURSO_AUTH_TOKEN` | the token from step 1 |
| `SESSION_SECRET` | output of `openssl rand -base64 32` |
| `ANTHROPIC_API_KEY` | an API key from [console.anthropic.com](https://console.anthropic.com) — powers the "Ask AI to search PubMed" feature (see below); the rest of the app works without it |
| `YOUTUBE_API_KEY` | a free API key from [console.cloud.google.com](https://console.cloud.google.com) (enable the "YouTube Data API v3" on the project) — powers live-sourced Clips; without it, Clips falls back to only the curated static set |

**5. Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the build picks up the new env
vars. The build command (`node scripts/apply-migrations.mjs && next build`) applies the
database schema to your Turso database automatically on every deploy — you don't need to
run migrations by hand.

That's it — you'll get a `*.vercel.app` URL. Every push to the connected branch redeploys
automatically after that.

## Live data — and a sandbox caveat

The design's chat history shows the author explicitly asking for real sourcing ("pull
information from credible sources... use yahoo finance to get the true price of USPH")
instead of the prototype's static seed data. This build wires that up for real:

- **Research** (`src/lib/pubmed.ts`): sourced live from PubMed (NCBI E-utilities) — the
  actual authoritative medical-literature database, not a news search — since research
  cards on the home feed should be real published studies. No API key required.
- **Guidelines / Industry & Policy / Equipment** (`src/lib/news-live.ts`): fetched live via
  Google News RSS (no API key required), one query per category, then keyword-classified
  into a specialty. A result only survives if it actually matches professional/medical-
  sector language for its category — the home feed should only ever surface PubMed
  research or confidently-classified medical-sector news, not general health/lifestyle
  journalism, so anything that merely came back from a loosely-matching search is dropped
  rather than kept under its query's category by default. General wellness content lives
  only on the Health & Wellness page, sourced separately (`fetchLiveWellness`).
- **APTA News** (`src/lib/apta-news.ts`): scraped live from
  [apta.org/news](https://www.apta.org/news) for the dedicated APTA News section — see the
  callout below, this one's riskier than the other sources.
- **Stock** (`src/lib/stock.ts`): USPH's price/sparkline is fetched live from Stooq's CSV
  export, falling back to Yahoo Finance's chart endpoint, in that order.
- **Clips** (`src/lib/clips-live.ts`): real PT/rehab YouTube Shorts fetched live via the
  YouTube Data API v3 (requires `YOUTUBE_API_KEY`), merged with the hand-curated set in
  `src/lib/clips-static.ts`. Same relevance-gating principle as the Google News sources — a
  result has to actually mention PT/rehab language to survive, not just come back from a
  topically-scoped search. Without an API key, Clips is just the curated static set.
- **Fallback**: if a live source is unreachable, each of the above falls back to bundled
  seed content (`src/lib/articles-static.ts`) — the same hand-authored articles and CE
  events from the original prototype for news, and a **real** USPH daily-close series
  (captured via a live market-data connector while building this, 2026-06-24 through
  2026-07-24, last close $74.58) for the stock card, not an invented one.

### APTA News is a real risk, not just a sandbox limitation

Every other live source above is a public API/RSS feed built for programmatic access. APTA
News is different: it's an HTML scrape of apta.org's website, which isn't designed to be
scraped. Two things point to this possibly not working even in production, not just in this
sandbox:

- The sandbox's own network policy blocks the domain outright (a 403 with
  `x-deny-reason: host_not_allowed`) — expected, and true of most hosts here.
- A WebFetch attempt at the same URL got a *different* 403, straight from apta.org's own
  server. That one usually means bot/WAF protection on their end, which a Vercel serverless
  function's request would likely trip too.

Because of that, `src/lib/apta-news.ts`'s selectors are deliberately URL-pattern-based
(matching `/news/YYYY/MM/DD/...`-shaped links) rather than tied to CSS classes I've never
actually seen — I couldn't inspect the real markup while building this. It falls back to
`APTA_NEWS_SEED` (`src/lib/apta-news-static.ts`, fictional but written in APTA's real news
categories — advocacy wins, CSM, workforce reports) whenever the live scrape returns fewer
than 3 results, so the section still looks populated either way. Worth checking after your
first deploy whether the live scrape is actually getting through.

## AI-assisted PubMed search

The Search screen has an "Ask AI to search PubMed" card: describe what you're looking for
in plain language (e.g. "blood-flow restriction training after ACL repair") and Claude
(`src/lib/ai-pubmed-query.ts`, model `claude-opus-5`) turns it into a proper PubMed query
using field tags and boolean operators, scoped to PT/rehab literature. The generated query
is shown above the results for transparency, and the search runs directly against PubMed
(`searchPubmed` in `src/lib/pubmed.ts`) — nothing is fabricated by the model. If the
Anthropic API call fails or `ANTHROPIC_API_KEY` isn't set, it falls back to using the raw
description as a literal PubMed search rather than breaking the page.

**I could not verify the live-fetch path succeeds end-to-end** in the sandbox this was
built in — its network policy blocks outbound HTTP to arbitrary hosts (confirmed via
`curl` and the fetch tool: even a plain request to Wikipedia returned 403), so every
request in that environment exercises the fallback path instead. The code is written
against the standard `fetch()` API with no sandbox-specific workarounds, so it should
work as soon as it runs somewhere with normal outbound internet access — but that claim
is based on reading the code, not a live observation, and is worth a quick check the
first time you deploy this somewhere with real egress.

## Live-sourced Clips

The Clips feed's live-fetch path (`src/lib/clips-live.ts`) has the exact same "couldn't
verify against the real API" caveat as the section above — `googleapis.com` is also
outside this sandbox's allowlist, so the fallback (the curated static set alone) is all
that was ever actually exercised while building it. Once `YOUTUBE_API_KEY` is set,
worth confirming after deploy that the Clips feed is actually pulling in live results
(new clip titles beyond the original 9) rather than silently sitting on the static
fallback because of, say, a quota or key-restriction issue on the Google Cloud project.

## Home page news ticker

The "Latest news" card in the Home sidebar (`src/components/RevolvingNews.tsx`) rotates
through the most recent Guidelines/Industry & Policy/Equipment articles — general news
from news outlets, deliberately excluding Research (PubMed is an academic-literature
database, not a news outlet) and CE & Events (a curated calendar, not news). See
`NEWS_TICKER_TYPES` in `src/app/(app)/page.tsx`.

Each card shows the real image the article itself uses — its `og:image`, fetched
server-side (`src/lib/og-image.ts`) from the article's own page, the same image the
publisher uses for its own social-media previews. Nothing is fabricated or substituted: if
no image can be found (or an article has no `sourceUrl` at all, true of seed/fallback
content), the card just renders without one. This only runs for the ~6 articles shown in
the ticker, not the whole feed, and fails silently per-article so one slow or blocked page
doesn't take down the rest.

## Under Review — real retraction data

The Under Review section (`src/lib/retraction-watch-data.ts`) is a snapshot of real
retractions, corrections, and expressions of concern from PT/rehab journals, pulled from
the [Crossref/Retraction Watch database](https://gitlab.com/crossref/retraction-watch-data)
— the authoritative public list of retracted papers across all of science. Each entry
links out to the actual retraction notice (or the original paper, when no notice URL is
recorded) so clinicians can read the primary source rather than a summary of it.

It's a snapshot, not a live fetch: the source CSV is the *entire* Retraction Watch
database (~65MB, every field, every discipline), which is too large to download inside a
single serverless request, and Crossref only updates it daily anyway. Instead,
`scripts/fetch-retraction-watch.mjs` downloads it, filters to journals PTs actually read
(by journal name — the dataset's own "Rehabilitation/Therapy" subject tag turned out to
mean general medical therapy, not the physical therapy profession, so it's not a
reliable filter here), and writes the result straight into
`src/lib/retraction-watch-data.ts`. Re-run it (`npm run fetch:retraction-watch`) whenever
you want a fresher snapshot — the current one is pinned to a specific GitLab commit
(recorded in the generated file's header) rather than "latest," so re-runs are
reproducible.

Unlike the news/stock sources above, gitlab.com's raw-file endpoint *was* reachable
directly from the sandbox this was built in — this doesn't imply the other live sources
(Google News, PubMed, Yahoo/Stooq, the Anthropic API) are reachable too, since sandbox
network policy is host-specific; it's just how this one snapshot could actually be
verified against real data rather than reasoned about from code alone.

### Scope boundaries on "live everything"

A couple of pieces intentionally stayed static, because "live" doesn't cleanly apply to
them:

- **CE & Events** (and the home-feed calendar, which reads its dates from this same
  category): a generic news search returns when an article about an event was
  *published*, not when the event itself happens, so it can't populate a calendar of
  upcoming dates. This category stays on the curated seed list.
- **Under Review**: real data (see below), but a baked snapshot rather than a live
  fetch — the source file is ~65MB, too large to download inside a single serverless
  request.
- **Wellness videos**: the original prototype's video thumbnails were filled by Claude
  Design's own image-picker tool, which has no equivalent at runtime here. They render as
  styled placeholder tiles with real title/source/duration metadata instead of a fake
  video player.
- **Article body copy**: seed articles keep their hand-authored body paragraphs. Live
  articles don't fabricate a body — the detail page shows the live summary plus a "Read
  the full story at {source}" link out to the original, so nothing is attributed to a
  real outlet that they didn't actually publish.

## Design decisions carried over from the prototype

The exported `.dc.html` had three "tweak" props for the design tool's own preview
(`feedLayout`, `heroStory`, `density`) — these were author-facing design-iteration knobs,
not a settings screen the end user was ever meant to see, so this build fixes them at
their last-configured defaults (`cards` layout, hero story on, `compact` density) instead
of exposing a UI nobody asked for.

Responsive layout (sidebar+desktop vs. bottom-nav+mobile) is done with CSS media queries
at the same 800px breakpoint the prototype used in JS, rather than a `window.innerWidth`
check — avoids any server/client hydration mismatch.
