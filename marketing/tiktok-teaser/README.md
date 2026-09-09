# TikTok teaser

A 55-second, 1080×1920 teaser for limbic.center, rendered from real screenshots of this
app — no mockups, no invented UI. Everything here is reproducible: the screens are
captured from a local dev server, the motion is a deterministic HTML page, and the frames
are piped straight into ffmpeg.

It's structured as three tiers with a section card in front of each — Limbic Student,
LimbicPRO, Health & Wellness — bracketed by a research opening and a CTA.

Output: `limbic-teaser.mp4` — 1080x1920, 30 fps, H.264 High at crf 22 (~16MB), with a
silent AAC track so a trending sound can be laid over it in the TikTok editor.
Caption/hashtag copy and posting notes: [`captions.md`](captions.md).

**The landing page serves this too.** `/` embeds a 720x1280 cut of the same master (see
the `landing-demo` section of `src/components/LandingPage.tsx`), so after any re-render
run [`derive-web-assets.sh`](derive-web-assets.sh) or the site keeps showing the old
version while the social file moves on.

## Re-rendering it

Needs a working local app (`.env` + `npx prisma migrate deploy`), `playwright-core`
(already a devDependency), and an `ffmpeg` with libx264 on `PATH`.

```bash
npm run dev                                        # in another shell, on :3000

node marketing/tiktok-teaser/capture.mjs           # signs in, screenshots each route
node marketing/tiktok-teaser/capture-agent.mjs     # re-shoots /agent with a question typed
node marketing/tiktok-teaser/capture-extra.mjs     # feed / playbook / movement lab / metrics
node marketing/tiktok-teaser/render.mjs            # 1644 frames -> limbic-teaser.mp4
./marketing/tiktok-teaser/derive-web-assets.sh    # -> the three files public/ serves
```

`capture.mjs` signs in as `demo@limbic.center` (creating the account on first run) and
walks the role picker and welcome tour, so the screens come out clean. To get the
paid-tier and student-gated screens to render fully, put that address in
`FOUNDING_FUNDERS_ADMIN_EMAILS` in your `.env` before starting the dev server.

Some screens only look right at a particular scroll offset, and the scroller is
`main.app-main`, not the window — `capture-extra.mjs` scrolls that element directly (or
sends real wheel events) rather than calling `window.scrollTo`, which silently does
nothing here.

Env knobs: `FFMPEG` (path to ffmpeg), `CHROME_PATH` (a specific Chromium — needed
whenever the installed browser revision doesn't match what `playwright-core` expects),
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

Scenes cross-dissolve rather than cut: `XF` (0.52s) is the dissolve length, and each
scene's visible life is its own duration plus `XF`, so the outgoing scene's fade-out runs
exactly over the incoming scene's fade-in. Outgoing scenes drift very slightly forward
while incoming ones settle back, which keeps two overlapping full-frame scenes from
reading as mud. To retime the whole thing, edit the `d:` values in the `PLAN` array —
start times are accumulated, never hand-written, so nothing downstream needs adjusting.

| Beat | Length |
|---|---|
| Intro — "The profession, the research, and the public." | 3.0s |
| Logo — "One platform. Every PT professional. Their entire career." | 2.8s |
| Your home feed → Search | 3.4s each |
| **Limbic Student** card → Atrium, Playbooks, Boards, Atlas | 1.9s + 3.1–3.4s each |
| **LimbicPRO** card → Clinical Toolbox, Agent, Movement Lab | 1.9s + 3.2–3.4s each |
| **Health & Wellness** card → Wellness+, Games, Clips | 1.9s + 2.8–3.2s each |
| CTA — limbic.center · Free to start | 4.8s |

The opening frame is deliberately not empty. The intro lines fade in, but the first one
starts its fade *before* t=0 (the `+0.34` in `introScene`) so frame 0 already reads:
TikTok takes the opening frame as the default cover, and the landing page shows it the
moment playback starts.

One constraint to respect when adding a beat: a 700px-wide phone screenshot is 1522px
tall inside a 1400px window, so a beat's `pan` can only travel about 122px before it runs
off the bottom of the image. If you want a longer scroll than that, capture the screen at
a different scroll offset instead of panning further.

`shots/` (the captured screenshots) is gitignored — regenerate it with the capture
scripts rather than committing it.

## Keeping it honest

The Agent beat shows a clinical question typed into the composer, not a generated answer.
Rendering a real answer needs `ANTHROPIC_API_KEY`, and staging a fake one would put a
claim about the product on screen that the product didn't make. Same reasoning applies to
anything else you add: shoot the real screen, or don't show it. See the claims table at
the bottom of `captions.md` for what each beat asserts and where that wording comes from.
