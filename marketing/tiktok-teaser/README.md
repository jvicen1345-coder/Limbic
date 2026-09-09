# TikTok teaser

A 22-second, 1080×1920 teaser for limbic.center, rendered from real screenshots of this
app — no mockups, no invented UI. Everything here is reproducible: the screens are
captured from a local dev server, the motion is a deterministic HTML page, and the frames
are piped straight into ffmpeg.

Output: `limbic-teaser.mp4` (H.264 High, 30 fps, silent AAC track).
Caption/hashtag copy and posting notes: [`captions.md`](captions.md).

## Re-rendering it

Needs a working local app (`.env` + `npx prisma migrate deploy`), `playwright-core`
(already a devDependency), and an `ffmpeg` with libx264 on `PATH`.

```bash
npm run dev                                        # in another shell, on :3000

node marketing/tiktok-teaser/capture.mjs           # signs in, screenshots each route
node marketing/tiktok-teaser/capture-agent.mjs     # re-shoots /agent with a question typed
node marketing/tiktok-teaser/render.mjs            # 660 frames -> limbic-teaser.mp4
```

`capture.mjs` signs in as `demo@limbic.center` (creating the account on first run) and
walks the role picker and welcome tour, so the screens come out clean. To get the
paid-tier and student-gated screens to render fully, put that address in
`FOUNDING_FUNDERS_ADMIN_EMAILS` in your `.env` before starting the dev server.

Env knobs: `FFMPEG` (path to ffmpeg), `CHROME_PATH` (a specific Chromium),
`FPS` (default 30), `OUT` (output path), and `PREVIEW="3.2,7.5"` — render just those
timestamps as PNGs instead of encoding, which is how you iterate on the design without
waiting on a full render.

## How the motion works

`teaser.html` is a 1080×1920 page that exposes one function, `window.__render(t)`, which
sets every animated property from the timestamp alone. There are no CSS animations or
transitions anywhere — that's deliberate: `render.mjs` steps `t` frame by frame and
screenshots, so a deterministic `t → pixels` mapping is what makes the output stable and
the frame rate exact. If you add motion, drive it from `t`, never from a keyframe.

Type is the app's own Plus Jakarta Sans, read out of `.next/**/static/media/*.woff2`
(where next/font already put it) and injected as a data: URL at render time — so the
teaser tracks the app's real type, and no font binary lives in this repo. Colors are the
dark-theme tokens from `src/styles/tokens.css` (`--color-bg`, `--color-accent`, …), so
the teaser stays on-brand automatically if those change.

Timeline, if you want to recut it (`FEATURES` and the `T` array in `teaser.html`):

| Time | Beat |
|---|---|
| 0.0–2.4s | Hook — "PubMed. APTA. NPTE decks. Clinic PDFs." → "Every one of them somewhere else." |
| 2.4–4.0s | Logo + "The research, the profession, and the public. In one place." |
| 4.0–14.2s | Six product beats, 1.7s each: Agent, AI PubMed search, LimbicPRO, Atlas, Boards, Nexus |
| 14.2–15.9s | Games / Clips / HEP builder, three-up |
| 15.9–18.1s | "Students. Clinicians. Patients." → "One platform." |
| 18.1–22.0s | limbic.center · Free to start |

`shots/` (the captured screenshots) is gitignored — regenerate it with the capture
scripts rather than committing it.

## Keeping it honest

The Agent beat shows a clinical question typed into the composer, not a generated answer.
Rendering a real answer needs `ANTHROPIC_API_KEY`, and staging a fake one would put a
claim about the product on screen that the product didn't make. Same reasoning applies to
anything else you add: shoot the real screen, or don't show it. See the claims table at
the bottom of `captions.md` for what each beat asserts and where that wording comes from.
