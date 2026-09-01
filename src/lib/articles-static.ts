import type { WellnessArticle, WellnessVideo } from "@/lib/types";

/**
 * Bundled wellness content: four original Limbic-authored wellness articles (served at
 * /wellness/[id]) and a small curated pool of real, third-party YouTube videos that the
 * app links out to, each credited to its actual creator.
 *
 * This file used to also export SEED_ARTICLES — hand-authored feed filler whose entries
 * carried the bylines of real journals (JOSPT, Journal of Neurologic PT, Journal of
 * Geriatric PT, Pediatric Physical Therapy), a real federal document ("CMS CY2026
 * Physician Fee Schedule Final Rule", complete with an invented conversion factor), and
 * real organizations, for studies and policy changes that do not exist. getArticles() had
 * already stopped surfacing it (see lib/articles.ts for that reasoning), but
 * getArticleById() still resolved those ids, so /article/a1 and friends kept serving a
 * fabricated study under a real journal's name to anyone with the URL. It is deleted.
 * Nothing in this file may attribute content to a real source that did not publish it.
 */
export const SEED_WELLNESS_ARTICLES: WellnessArticle[] = [
  {
    id: "w1",
    source: "Limbic Health & Wellness",
    date: "2026-07-21",
    readMins: 4,
    title: "Desk-bound? Five stretches to break up a sitting-heavy workday",
    summary:
      "Simple, no-equipment movement snacks that counter the hip flexor tightness and thoracic stiffness of long sitting stretches.",
    tags: ["Ergonomics", "Office health"],
    body: [
      "Long, uninterrupted sitting shortens the hip flexors and lets thoracic mobility stiffen; neither shows up as pain right away, but both compound over a workweek. The fix isn't a single long stretch session; it's short, frequent breaks that reset the same tissues load builds up in.",
      "Five worth working into a normal day: a standing hip flexor stretch, seated figure-four for the glutes, a doorway pec stretch, thoracic rotations at your desk, and a couch or wall calf stretch. Each takes under a minute; the point is doing them every hour or two, not doing them well once.",
      "Set a recurring timer rather than relying on remembering. Clinically, patients who pair movement breaks with an external reminder report sticking with it far longer than those who mean to \"just remember.\"",
    ],
  },
  {
    id: "w2",
    source: "Limbic Health & Wellness",
    date: "2026-07-16",
    readMins: 5,
    title: "How much sleep actually helps muscle recovery? The research so far",
    summary:
      'A look at what sleep-and-recovery studies really show, and why "8 hours" is a starting point, not a hard rule.',
    tags: ["Sleep", "Recovery"],
    body: [
      "Most of the muscle-protein synthesis and tissue repair that follows hard training happens during deep (slow-wave) sleep, driven by a growth-hormone pulse that's largest in the first sleep cycles of the night, which is why sleep timing, not just total hours, matters for recovery.",
      "The oft-cited \"8 hours\" is a population average, not an individual target: recovery need scales with training load, age, and baseline sleep debt. Athletes in higher-volume blocks consistently show better recovery markers at 9+ hours than at 7, while someone in a lighter maintenance phase may recover fully closer to 7.",
      "Practically, consistency (a stable sleep/wake window) predicts recovery outcomes about as well as total duration does. A fixed schedule that yields 7.5 hours nightly tends to outperform an inconsistent schedule averaging 8.",
    ],
  },
  {
    id: "w3",
    source: "Limbic Health & Wellness",
    date: "2026-07-09",
    readMins: 3,
    title: "Walking pace vs. step count: which matters more for heart health",
    summary:
      "Recent cohort data suggests intensity may carry as much weight as total daily steps for cardiovascular outcomes.",
    tags: ["Cardio", "Walking"],
    body: [
      "Step-count targets like \"10,000 steps\" are easy to track but say nothing about intensity, and cohort studies following walkers over several years find that pace, not just volume, tracks independently with cardiovascular outcomes.",
      "In this body of research, adults who walked briskly (roughly 100+ steps per minute in bursts) saw meaningfully lower cardiovascular event rates than adults matching or exceeding their total daily steps at a leisurely pace alone.",
      "The practical takeaway isn't to abandon step counting; it's to fold in a few minutes of brisker walking rather than treating every step as equivalent. A short uphill stretch or a deliberately faster block or two accomplishes this without adding total distance.",
    ],
  },
  {
    id: "w4",
    source: "Limbic Health & Wellness",
    date: "2026-06-30",
    readMins: 4,
    title: "Hydration myths, retested: do you really need eight glasses a day",
    summary:
      "A plain-language rundown of what current evidence says about daily fluid needs and how they shift with activity level.",
    tags: ["Nutrition", "Hydration"],
    body: [
      "\"Eight glasses a day\" doesn't come from a controlled trial; it's a rounded-off rule of thumb, and actual fluid need varies widely by body size, climate, and activity level. Total water intake (including food) tracks closer to individual need than any fixed glass count.",
      "Thirst is a reasonably reliable guide for most healthy adults at rest; it becomes a lagging indicator during sustained exercise or heat exposure, where fluid loss can outpace the urge to drink. That's the specific scenario where deliberate hydration schedules actually earn their keep.",
      "Urine color remains one of the simplest practical checks: pale straw generally indicates adequate hydration, while consistently dark urine (outside of supplements or medications that tint it) is a more useful signal than counting glasses.",
    ],
  },
];

// Real YouTube videos found via search — not fabricated. Their exact runtimes couldn't be
// independently verified (youtube.com is unreachable from this dev sandbox), so duration
// is only set where the creator states it themselves in their own title, never invented.
export const WELLNESS_VIDEOS: WellnessVideo[] = [
  {
    id: "v1",
    title: "10 Min. Morning Mobility Routine | Full Body, No Equipment, Follow Along",
    source: "YouTube",
    duration: "10 min",
    url: "https://www.youtube.com/watch?v=aRVFt79LqCM",
  },
  {
    id: "v2",
    title: "Breathing Techniques To Reduce Pain",
    source: "YouTube",
    url: "https://www.youtube.com/watch?v=84I14L-vfjE",
  },
  {
    id: "v3",
    title: "3 Exercises Everyone Over 60 MUST DO for Total Body Strength",
    source: "Dr. Alyssa Kuhn, PT",
    url: "https://www.youtube.com/watch?v=oMrnI_EXHqk",
  },
];
