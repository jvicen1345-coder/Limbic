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
| `PEXELS_API_KEY` | a free API key from [pexels.com/api](https://www.pexels.com/api/) — powers topic-matched stock-photo fallback images on Home feed cards that don't have their own real `og:image`; without it, those cards just render without an image |
| `GOOGLE_CLIENT_ID` | an OAuth 2.0 Client ID (Web application) from [console.cloud.google.com](https://console.cloud.google.com) — powers "Continue with Google" on the sign-in screen; see below |
| `GOOGLE_CLIENT_SECRET` | the matching client secret from the same OAuth client |

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

## Sign in with Google

The sign-in screen's "Continue with Google" button (`src/components/SignInForm.tsx`) is a
standard OAuth 2.0 authorization-code flow, hand-rolled against Google's endpoints rather
than a library — `src/app/auth/google/route.ts` redirects to Google's consent screen with a
random `state` value in a short-lived cookie; `src/app/auth/google/callback/route.ts`
checks that `state` on the way back, exchanges the authorization code for an ID token, and
verifies that token's signature against Google's own published keys (`jose`'s
`createRemoteJWKSet`, already a dependency for this app's own session cookies — no new
package needed) before trusting any of its claims. The verified email is upserted into the
same `User.email` column the General (email) sign-in flow uses (`signInWithGoogle` in
`src/lib/session.ts`), so a reader who's used both ends up on one account either way. The
button itself only renders when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

The redirect URI is hardcoded to `https://limbic.center/auth/google/callback` (must exactly
match an Authorized redirect URI on the OAuth client in Google Cloud Console) rather than
derived from the incoming request, so the same registered round trip completes regardless
of which host actually served the initial request. That also means the full consent flow
can only be completed on the real deployed domain — I could verify the redirect to Google's
consent screen is correctly formed, but completing an actual sign-in requires a real
browser and a real Google account, which isn't something this sandbox could exercise
end-to-end either.

## Password auth & reset emails

Sign-in used to accept any typed email with no password at all — the sign-in screen's own
copy said so outright ("Demo sign-in, any email works"). It's real password auth now:
`signUpWithPassword`/`signInWithPassword` in `src/lib/session.ts` hash with Node's built-in
`scrypt` (`src/lib/password.ts` — deliberately slow/memory-hard, unlike a fast general-
purpose hash, which is the whole point for password storage; no new dependency needed for
this half). Nothing ever stores or logs a plaintext password.

Every account created before this shipped has `User.passwordHash = null`. There's no
separate bulk migration — a legacy account's first sign-in attempt is met with "This
account hasn't set a password yet," pointing at the same "Forgot password?" flow an
ordinary reset uses. That flow is Resend-backed (`src/lib/email.ts`,
`requestPasswordResetAction`/`resetPasswordAction` in `src/app/actions/auth.ts`): a
single-use, SHA-256-hashed token (`PasswordResetToken`, `src/lib/password-reset.ts`)
expiring after an hour. Get a free key at resend.com, verify a sending domain there (Domains
→ Add Domain, then add the DNS records at your registrar — an unverified domain can only
send to your own Resend account email), and set `RESEND_API_KEY`/`EMAIL_FROM`. Without
`RESEND_API_KEY`, nothing fails — the reset link is logged to the server console instead of
emailed, which is also how this flow gets tested end-to-end in a sandbox with no real Resend
account.

The sign-in/forgot-password/reset-password flows are deliberately vague on failure
("Incorrect email or password" covers both a wrong password and no account at all; "forgot
password" always redirects to the same "check your email" state) so a failed attempt can't
be used to test which emails have accounts — the one exception is sign*up*, which does say
"an account with that email already exists," the ~universal convention for that specific
screen. There's no rate limiting on sign-in attempts or reset requests (no Redis/Upstash or
similar in this stack yet) beyond "don't send a second reset email while an unexpired one is
still live" — a real production hardening pass would want actual throttling here.

## Stripe subscriptions

LimbicPro ($25/mo) and LimbicStudent ($5/mo — see
`src/app/(app)/pro/membership/page.tsx`) are real, recurring Stripe subscriptions, not the
instant demo flip they used to be. LimbicStudent is a single plan (an earlier, separate
higher "Student PRO+ Boards" tier was retired in favor of one plan covering everything,
including Limbic Agent eligibility — see `src/app/(app)/student/page.tsx`). The flow:

- **Checkout** (`app/actions/pro.ts` `subscribeToProAction`/`subscribeToStudentTierAction`):
  looks up or creates a Stripe Customer for the reader (`User.stripeCustomerId`, reused on
  every later checkout/portal visit instead of minting a new one each time), then redirects
  to a Stripe-hosted Checkout Session. `isPro`/`studentTier` are **not** set here — only the
  webhook below sets them, once Stripe actually confirms payment.
- **Cancellation** (`cancelProAction`/`cancelStudentTierAction`) redirects to the
  Stripe-hosted Customer Portal, where the reader manages their payment method or cancels
  — Stripe's default portal cancellation is "at period end," matching the wording in
  `/terms`.
- **The webhook** (`src/app/api/stripe/webhook/route.ts`) is the single source of truth:
  verifies the raw request body against `STRIPE_WEBHOOK_SECRET` before trusting anything in
  it, then sets `isPro`/`studentTier` off `customer.subscription.created`/`.updated`
  (active/trialing → on) and `.deleted` (→ off) events. Which internal plan a subscription
  maps to travels as `metadata.plan` on the Subscription object itself (stamped at
  checkout), not just the Checkout Session, since subscription-lifecycle events reference
  the Subscription, not the session that created it.

**Setup, in the Stripe Dashboard:**

1. Create two Products, each with one recurring monthly Price: LimbicPro ($25) and
   LimbicStudent ($5). Copy each Price's id (starts `price_...`, **not** the Product id)
   into `STRIPE_PRICE_PRO`/`STRIPE_PRICE_LIMBIC_STUDENT`.
2. Settings → Billing → Customer portal: click "Activate test link" (test mode) or
   otherwise save a portal configuration at least once — `stripe.billingPortal.sessions
   .create` fails until a configuration exists, even a default one.
3. Developers → Webhooks → add an endpoint at `https://<your-domain>/api/stripe/webhook`,
   subscribed to at least `customer.subscription.created`, `customer.subscription.updated`,
   and `customer.subscription.deleted`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
4. Copy your secret key (`sk_test_...` while testing, `sk_live_...` once you flip live)
   into `STRIPE_SECRET_KEY`.

Without `STRIPE_SECRET_KEY` set, every Upgrade/Manage-membership button on
`/pro/membership` stays disabled with a "Payments aren't set up yet" notice —
`stripeEnabled()` (`src/lib/stripe.ts`) gates all of it, same graceful-degradation pattern
as `YOUTUBE_API_KEY`/`GOOGLE_CLIENT_ID` elsewhere in this app, except there's no silent
demo fallback anymore: showing a fake "purchase" as if it charged a real card would be
actively misleading now that this is meant to be real billing.

**Same sandbox caveat as the other live integrations above:** this sandbox's network
policy blocks outbound requests to `api.stripe.com`, so none of this could be exercised
against a real Stripe account while building it — no `.env` value was set here, `tsc`/
`eslint`/`next build` all pass, and the webhook route's signature verification and event
handling were reasoned through against Stripe's documented behavior rather than observed
live. Worth a real end-to-end test (a real test-mode checkout, confirming `isPro` flips,
canceling via the portal, confirming it un-flips at period end) the first time this runs
somewhere with real egress.

## Founding Funders payments

The one-time $40 "Claim a Spot" purchase on `/founding-funders` (see
`src/lib/founding-funders-config.ts`'s `FOUNDING_FUNDERS_OPEN` flag,
`components/founding-funders/ClaimSpotButton.tsx`) is a real, single-charge Stripe
Checkout Session — `mode: "payment"`, not a subscription — kept separate from the
recurring-billing flow above because it's a different Checkout mode with its own Price id
and its own webhook event.

- **Checkout** (`app/actions/founding-funders.ts` `createFoundingFunderCheckout`): creates
  a `FoundingFunder` row with `paymentStatus: "pending"` first (so the spot counts against
  the 25-spot cap immediately, before payment even starts), then a Checkout Session with
  `metadata.foundingFunderId` pointing back at that row. Unlike `subscribeToProAction`
  above, this doesn't `redirect()` itself — it returns the Session URL so
  `ClaimSpotButton.tsx` (a Client Component) can show its own "Processing..." state before
  navigating there.
- **The webhook** now also handles `checkout.session.completed` (fired by every completed
  Checkout Session, subscription or one-time alike) — purely additive: a subscription
  checkout's Session has no `metadata.foundingFunderId`, so it's a no-op for
  LimbicPro/Student/Wellness+ and only ever flips a Founding Funder row to
  `paymentStatus: "confirmed"`.
- **Backup confirmation**: since webhook delivery can lag behind the browser's own redirect
  back from Stripe, the success page (`?success=true&session_id=...`) re-checks the session
  directly and confirms right away if the webhook hasn't landed yet
  (`confirmFoundingFunderPaymentIfNeeded`). The cancel page
  (`?canceled=true&session_id=...`) deletes the pending row for an abandoned checkout
  (`cleanupCanceledFoundingFunderCheckout`), so it doesn't sit around counting against the
  cap forever.
- **Admin override**: `components/founding-funders/FoundingFundersRoster.tsx` (visible to
  `FOUNDING_FUNDERS_ADMIN_EMAILS` accounts at the bottom of the page) lists every pending/
  confirmed claim with a manual "Confirm Payment" button for when a webhook never fires, and
  "Remove" to delete a stale claim and reopen the spot.

**Setup, in the Stripe Dashboard, before flipping `FOUNDING_FUNDERS_OPEN` to `true`:**

1. Create one Product — name it **Limbic Founding Funder** — with a single **one-time**
   Price of **$40** (not recurring). Copy that Price's id (starts `price_...`, **not** the
   Product id) into `STRIPE_FOUNDING_FUNDER_PRICE_ID`.
2. Developers → Webhooks → the same endpoint from the subscriptions section above
   (`https://<your-domain>/api/stripe/webhook`) — just add `checkout.session.completed` to
   its subscribed events (alongside the three `customer.subscription.*` ones). One endpoint
   handles both flows; no second webhook needed.
3. `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are shared with the subscriptions flow above
   — nothing extra to set there.

Without `STRIPE_FOUNDING_FUNDER_PRICE_ID` set (even with `STRIPE_SECRET_KEY` configured),
`createFoundingFunderCheckout` returns "Payments aren't set up yet" rather than starting a
checkout with no real price behind it.

Founding Funders (`/founding-funders`) is deliberately **not** part of this — that's a
one-time $40 payment handled manually via Zelle plus an admin claim panel, by original
design (see the page itself), not a subscription.

## Home page news ticker

The "Latest news" card in the Home sidebar (`src/components/RevolvingNews.tsx`) rotates
through the most recent Guidelines/Industry & Policy/Equipment articles — general news
from news outlets, deliberately excluding Research (PubMed is an academic-literature
database, not a news outlet) and CE & Events (a curated calendar, not news). See
`NEWS_TICKER_TYPES` in `src/app/(app)/page.tsx`.

Each card shows the real image the article itself uses — its `og:image`, fetched
server-side (`src/lib/og-image.ts`) from the article's own page, the same image the
publisher uses for its own social-media previews. If no image can be found (or an article
has no `sourceUrl` at all, true of seed/fallback content), a topic-matched stock photo
fills the gap instead — see "Topic-image fallback" below. This runs for the ~6 articles
shown in the ticker plus the top-ranked ~16 articles on the main Home feed (see
`FEED_IMAGE_LIMIT` in `src/app/(app)/page.tsx`), not the entire pool, and fails silently
per-article so one slow or blocked page doesn't take down the rest.

## Topic-image fallback

Most seed and AOPT clinical-practice-guideline content has no `og:image` to find at all —
seed articles have no `sourceUrl`, and a guideline PDF has no `<meta>` tags of any kind. For
those, `src/lib/topic-image.ts` searches a real, freely-licensed stock photo via the Pexels
API (`src/lib/pexels.ts`), matched to a specific anatomical/topical term recognized in the
article's title (e.g. "knee", "rotator cuff") when there is one, falling back to the
article's specialty (e.g. "Orthopedic physical therapy rehabilitation") otherwise — so every
article that reaches this fallback still resolves to something relevant, not a generic
placeholder. Same graceful-degradation pattern as `YOUTUBE_API_KEY`: without
`PEXELS_API_KEY` set, those cards just render without an image.

Same sandbox caveat as Clips above — `api.pexels.com` is outside this sandbox's allowlist,
so this could only be verified by inspecting the built query strings and the graceful
no-key/no-result fallback paths, not by confirming a real photo actually comes back. Worth
spot-checking after deploy that a few seed/guideline cards on Home are picking up sensible,
on-topic photos rather than silently sitting on "no image" because of a quota or key issue.

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
