# TikTok teaser — caption pack

The video is **silent by design** so you can drop any trending sound over it in the
TikTok editor. Pick a sound with a beat drop around 0:02 (the logo hit) if you can —
the cut points are at 2.4s, 4.0s, then every 1.7s through 14.2s.

## Caption (primary)

> Every PT resource lives somewhere else. PubMed, APTA, your NPTE deck, that guideline
> PDF from 2019. So we put them in one place. → limbic.center
>
> #physicaltherapy #dptstudent #ptschool #npte #physicaltherapist

## Caption (shorter, hook-forward)

> POV: every PT resource you need finally lives in one app 🧠 limbic.center
>
> #dpt #dptstudent #physicaltherapy #npte #ptstudent

## Caption (clinician-leaning)

> Built for the people who actually treat patients — clinical reference, decision rules,
> special tests, and evidence-grounded decision support. Free to start. limbic.center
>
> #physicaltherapist #ptclinic #evidencebasedpractice #rehab #physicaltherapy

## Hashtag bank

Core: `#physicaltherapy` `#physicaltherapist` `#dpt` `#dptstudent` `#ptstudent`
`#ptschool` `#npte` `#futuredpt`
Secondary: `#rehab` `#rehabilitation` `#evidencebasedpractice` `#clinicalreasoning`
`#ptlife` `#studytok` `#healthtech`

Use 4–6, not the whole bank. Keep at least two that name the audience (`#dptstudent`,
`#physicaltherapist`) — that's what the algorithm uses to find the right feed.

## Posting notes

- **Spec**: 1080×1920 (9:16), H.264 High, 30 fps, ~22s, silent AAC track for
  player compatibility. Well inside TikTok's upload limits.
- **Hook**: the first word is on screen at frame 1 and the hook resolves by 0:02.
  Don't add an intro card in front of it — that's the retention killer.
- **Safe zones**: all copy sits between y≈170 and y≈1450, clear of TikTok's right-hand
  action rail and bottom caption area. Phone mockups deliberately bleed off the bottom,
  so it doesn't matter that the UI covers that strip.
- **Pinned comment** worth adding: "Free to start at limbic.center — LimbicPRO's
  clinical reference (calculators, decision rules, special tests) doesn't cost anything."
- The same file works as-is for Instagram Reels and YouTube Shorts.

## What the video claims

Every claim is taken from the live product, and every screen is a real screenshot of
the app — nothing mocked up:

| Beat | Screen | Claim |
|---|---|---|
| Limbic Agent | `/agent` | "Decision support grounded in current evidence. Never a diagnosis." — the app's own disclaimer wording |
| AI PubMed Search | `/search` | The generated query is shown above results (`src/lib/ai-pubmed-query.ts`) |
| LimbicPRO | `/pro/toolbox` | "Free clinical reference for every PT" — the free tier per `LandingPage.tsx` |
| Limbic Atlas | `/atlas` | Interactive clinical anatomy by region |
| Limbic Boards | `/boards` | Term of the day, board question, case of the day |
| Limbic Nexus | `/nexus` | "Not adapted from somewhere else" — landing-page copy |

Two things to know before you post: the Agent beat shows a question typed into the
composer, not an answer (rendering a real answer needs `ANTHROPIC_API_KEY`, and a faked
one would be a false claim about the product). And "Free to start" is accurate for
LimbicPRO's reference tier — if you change tier gating, re-check that line.
