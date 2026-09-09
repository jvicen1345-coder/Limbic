# TikTok teaser — caption pack

The video is **silent by design** so you can drop any trending sound over it in the
TikTok editor. It runs 54.8s and is structured as three tiers, so a sound with a clear
build works better here than a single beat drop: the section cards land at 0:14
(Limbic Student), 0:28.5 (LimbicPRO) and 0:39.8 (Health & Wellness).

## Caption (primary)

> The profession, the research, and the public — finally in one place. Current research
> tailored to you, the whole DPT journey, a clinical toolbox at the point of care, and
> wellness tools for the people you treat. → limbic.center
>
> #physicaltherapy #dptstudent #ptschool #npte #physicaltherapist

## Caption (student-leaning)

> Your semester, your boards prep, your playbooks, and the research behind all of it —
> one app 🧠 limbic.center
>
> #dpt #dptstudent #ptschool #npte #futuredpt

## Caption (clinician-leaning)

> Calculators, decision rules, special tests, 224 exercises with dosage, and
> evidence-grounded decision support at the point of care. Free to start. limbic.center
>
> #physicaltherapist #ptclinic #evidencebasedpractice #rehab #physicaltherapy

## Hashtag bank

Core: `#physicaltherapy` `#physicaltherapist` `#dpt` `#dptstudent` `#ptstudent`
`#ptschool` `#npte` `#futuredpt`
Secondary: `#rehab` `#rehabilitation` `#evidencebasedpractice` `#clinicalreasoning`
`#ptlife` `#studytok` `#healthtech`

Use 4-6, not the whole bank. Keep at least two that name the audience (`#dptstudent`,
`#physicaltherapist`) — that's what the algorithm uses to find the right feed.

## Posting notes

- **Spec**: 1080x1920 (9:16), H.264 High, 30 fps, 54.8s, silent AAC track for player
  compatibility. Well inside TikTok's upload limits.
- **Hook**: "The profession," is on screen at frame 1. Don't add an intro card in front
  of it — that's the retention killer.
- **Length**: at ~55s this is a tour, not a hook-and-cut. If you want a short version for
  a cold audience, the first 12s (intro → logo → home feed → search) stands on its own;
  render it by trimming the `PLAN` array in `teaser.html`.
- **Safe zones**: all copy sits between y=170 and y=1450, clear of TikTok's right-hand
  action rail and bottom caption area. Phone mockups deliberately bleed off the bottom,
  so it doesn't matter that the UI covers that strip.
- **Pinned comment** worth adding: "Free to start at limbic.center — LimbicPRO's clinical
  reference (calculators, decision rules, special tests) doesn't cost anything."
- The same file works as-is for Instagram Reels and YouTube Shorts.

## What the video claims

Every screen is a real screenshot of the running app — nothing is mocked up, and the
research cards are live PubMed results, not seed content.

| Time | Beat | Screen | Claim and where it comes from |
|---|---|---|---|
| 0:00 | Intro | — | "The profession, the research, and the public." |
| 0:03 | Logo | — | "One platform. Every PT professional. Their entire career." — the site's own openGraph description |
| 0:05.8 | Your home feed | `/home` | Live PubMed, filtered to followed topics (`src/lib/pubmed.ts`, `news-live.ts`) |
| 0:09.2 | Search | `/search` | Plain-language → PubMed query, query shown (`src/lib/ai-pubmed-query.ts`) |
| 0:14 | **Limbic Student** | — | "Built for the DPT journey" — `LandingPage.tsx` |
| 0:15.9 | The Atrium | `/student` | Class schedule, assignments, rotation countdown, daily sharpening |
| 0:19.1 | Playbooks | `/student/guides/shoulder-examination` | "83 sources linked", values marked measured/convention/contested — `src/lib/guides.ts` |
| 0:22.5 | Boards | `/boards` | Term of the day, board question, case of the day |
| 0:25.6 | Limbic Atlas | `/atlas` | Anatomy by region; open to Student and PRO — the page's own gating note |
| 0:28.5 | **LimbicPRO** | — | "For the clinician at the point of care" |
| 0:30.4 | Clinical Toolbox | `/pro/toolbox` | "Free clinical reference for every PT" — the free tier per `LandingPage.tsx` |
| 0:33.6 | Limbic Agent | `/agent` | "Never a diagnosis. Always a starting point." — the app's own disclaimer wording |
| 0:36.8 | Movement Lab | `/hep?tab=movement-lab` | "224 therapeutic exercises and 19 phased protocols" — read off the page |
| 0:39.8 | **Health & Wellness** | — | "For the people they serve" |
| 0:41.7 | Limbic Wellness+ | `/wellness/metrics` | "Optional, all private to you" — the page's own wording |
| 0:44.9 | Limbic Games | `/games` | Daily Term, Mini Crossword |
| 0:47.7 | Limbic Clips | `/clips` | Curated + live-sourced (`src/lib/clips-live.ts`) |
| 0:50.5 | CTA | — | limbic.center · Free to start |

Two things to know before you post. The Agent beat shows a question typed into the
composer, not an answer — rendering a real answer needs `ANTHROPIC_API_KEY`, and a faked
one would be a false claim about the product. And "Free to start" is accurate for
LimbicPRO's reference tier — if you change tier gating, re-check that line.

## One thing worth fixing in the product

While picking a home-feed frame I had to scroll past the first two research cards: a
myasthenia-gravis thymectomy trial and a psychotherapy-for-suicide-risk secondary
analysis, both tagged **Orthopedic**, and the second one carrying a **Knee** chip. They
are real PubMed results, but the specialty classifier put them in the wrong bucket, and
"Orthopedic" on a suicide-risk paper is the kind of thing a PT notices immediately. The
frame in the video is scrolled to the strength-training/sarcopenia meta-analysis
instead. Worth a look at the keyword classifier in `src/lib/news-live.ts` /
`src/lib/pubmed.ts` before this feed goes in front of an audience.
