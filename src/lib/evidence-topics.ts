/**
 * The conditions Limbic organizes its evidence around — one record per condition, shared by
 * the public condition pages (app/evidence/topics/[slug]), the practice links under each
 * study (lib/practice-links.ts), and the Home "Evidence by condition" strip.
 *
 * A single study is rarely the right unit for a reader who wants to know "what works for
 * knee pain?". These records are what let the app answer at the level of the condition:
 * the guideline first, then the reviews that pool many trials, then the newest trials.
 *
 * Everything here is hand-maintained and pure — no fetch, no model. `pubmed` is a clause for
 * the condition only, restricted to MeSH *major* topic ([majr]) and title ([ti]) matches —
 * a title/abstract match let in trials that merely list the condition among outcomes; lib/evidence-topic-feed.ts combines it with
 * a rehab clause and a publication-type filter. `match` is what decides whether an
 * already-fetched article (a feed item, a study page) belongs to the topic, and is checked
 * against the article's title and tags — never the abstract, which mentions comorbidities
 * and exclusion criteria often enough to put a stroke trial under "low back pain".
 */

export interface EvidenceTopic {
  slug: string;
  /** The clinician's name for the condition. */
  name: string;
  /** How a patient would say it — shown under the name on public pages. */
  plainName: string;
  /** One sentence for the public page: what this condition is, in plain words. */
  blurb: string;
  /** Case-insensitive patterns checked against an article's title and tags. */
  match: RegExp[];
  /** PubMed clause for the condition itself (see note above). */
  pubmed: string;
  /** ORTHOPT_CPG_SEED ids (see lib/orthopt-cpg-static.ts) that cover this condition. */
  cpgIds: string[];
  /** lib/outcome-measures.ts ids a clinician would track for this condition. */
  measureIds: string[];
  /** lib/atlas-content.ts region id, for the special-tests deep link. */
  atlasRegion: string | null;
}

export const EVIDENCE_TOPICS: readonly EvidenceTopic[] = [
  {
    slug: "low-back-pain",
    name: "Low back pain",
    plainName: "Lower back pain",
    blurb: "Pain between the bottom of the ribs and the top of the legs, with or without pain down a leg. Most episodes improve, and staying active is central to recovery.",
    match: [/\blow(er)?[- ]back pain\b/i, /\blumbar\b/i, /\bsciatica\b/i, /\bLBP\b/],
    pubmed: '("Low Back Pain"[majr] OR "low back pain"[ti] OR sciatica[ti])',
    cpgIds: ["cpg-low-back-pain-2021"],
    measureIds: ["odi", "nprs", "psfs"],
    atlasRegion: "lumbar-spine",
  },
  {
    slug: "neck-pain",
    name: "Neck pain",
    plainName: "Neck pain and stiffness",
    blurb: "Pain or stiffness in the neck, sometimes with headaches or pain into the arm.",
    match: [/\bneck pain\b/i, /\bcervical\b/i, /\bwhiplash\b/i, /\bcervicogenic\b/i],
    pubmed: '("Neck Pain"[majr] OR "neck pain"[ti] OR whiplash[ti])',
    cpgIds: ["cpg-neck-pain-2017"],
    measureIds: ["nprs", "psfs"],
    atlasRegion: "cervical-posterior",
  },
  {
    slug: "shoulder-pain",
    name: "Rotator cuff and shoulder pain",
    plainName: "Shoulder pain",
    blurb: "Pain around the shoulder, often when lifting the arm, most commonly from the rotator cuff tendons.",
    match: [/\brotator cuff\b/i, /\bshoulder pain\b/i, /\bsubacromial\b/i, /\bfrozen shoulder\b/i, /\badhesive capsulitis\b/i],
    pubmed: '("Rotator Cuff Injuries"[majr] OR "Shoulder Pain"[majr] OR "rotator cuff"[ti] OR "shoulder pain"[ti] OR subacromial[ti])',
    cpgIds: ["cpg-rotator-cuff-tendinopathy-2025"],
    measureIds: ["dash", "nprs", "psfs"],
    atlasRegion: "rotator-cuff-posterior",
  },
  {
    slug: "knee-osteoarthritis",
    name: "Knee osteoarthritis",
    plainName: "Knee arthritis",
    blurb: "Wear-related changes in the knee joint that cause pain and stiffness. Exercise is one of the most studied treatments.",
    match: [/\bknee osteoarthritis\b/i, /\bosteoarthritis of the knee\b/i, /\bknee OA\b/i, /\bgonarthrosis\b/i],
    pubmed: '("Osteoarthritis, Knee"[majr] OR "knee osteoarthritis"[ti])',
    cpgIds: [],
    measureIds: ["lefs", "nprs", "sts30"],
    atlasRegion: "knee-anterior",
  },
  {
    slug: "knee-meniscus-cartilage",
    name: "Meniscus and cartilage injuries",
    plainName: "Knee cartilage and meniscus tears",
    blurb: "Damage to the cushioning cartilage inside the knee, often from twisting, that can cause pain, swelling or catching.",
    match: [/\bmeniscus\b/i, /\bmeniscal\b/i, /\barticular cartilage\b/i, /\bchondral\b/i],
    pubmed: '("Tibial Meniscus Injuries"[majr] OR meniscal[ti] OR meniscus[ti] OR "articular cartilage"[ti])',
    cpgIds: ["cpg-knee-meniscal-cartilage-2018"],
    measureIds: ["lefs", "nprs"],
    atlasRegion: "knee-anterior",
  },
  {
    slug: "acl",
    name: "ACL injury and reconstruction",
    plainName: "ACL tears",
    blurb: "A tear of the anterior cruciate ligament, a key stabilizer of the knee, common in pivoting sports.",
    match: [/\bACL\b/, /\banterior cruciate\b/i],
    pubmed: '("Anterior Cruciate Ligament Injuries"[majr] OR "anterior cruciate ligament"[ti])',
    cpgIds: [],
    measureIds: ["lefs", "nprs"],
    atlasRegion: "knee-anterior",
  },
  {
    slug: "patellofemoral-pain",
    name: "Patellofemoral pain",
    plainName: "Pain around the kneecap",
    blurb: "Pain around or behind the kneecap, often worse with stairs, squatting or sitting for a long time.",
    match: [/\bpatellofemoral\b/i, /\banterior knee pain\b/i, /\brunner'?s knee\b/i],
    pubmed: '("Patellofemoral Pain Syndrome"[majr] OR patellofemoral[ti] OR "anterior knee pain"[ti])',
    cpgIds: [],
    measureIds: ["lefs", "nprs"],
    atlasRegion: "knee-anterior",
  },
  {
    slug: "hip-osteoarthritis",
    name: "Hip osteoarthritis",
    plainName: "Hip arthritis",
    blurb: "Wear-related changes in the hip joint that cause groin or hip pain and stiffness.",
    match: [/\bhip osteoarthritis\b/i, /\bosteoarthritis of the hip\b/i, /\bhip OA\b/i, /\bhip pain\b/i],
    pubmed: '("Osteoarthritis, Hip"[majr] OR "hip osteoarthritis"[ti])',
    cpgIds: ["cpg-hip-oa-2025"],
    measureIds: ["lefs", "nprs", "sts30"],
    atlasRegion: "hip-flexors",
  },
  {
    slug: "ankle-sprain",
    name: "Lateral ankle sprain",
    plainName: "Sprained ankle",
    blurb: "A stretched or torn ligament on the outside of the ankle, usually from rolling it inward.",
    match: [/\bankle sprain/i, /\blateral ankle\b/i, /\bchronic ankle instability\b/i],
    pubmed: '("Ankle Injuries"[majr] OR "ankle sprain"[ti] OR "ankle instability"[ti])',
    cpgIds: ["cpg-ankle-lateral-ligament-sprains-2021"],
    measureIds: ["lefs", "nprs"],
    atlasRegion: "ankle-foot-anterior",
  },
  {
    slug: "achilles-tendinopathy",
    name: "Achilles tendinopathy",
    plainName: "Achilles tendon pain",
    blurb: "Pain and stiffness in the tendon at the back of the ankle, common in runners.",
    match: [/\bachilles\b/i],
    pubmed: '("Achilles Tendon"[majr] OR achilles[ti]) AND (tendinopathy[ti] OR tendinitis[ti] OR tendinosis[ti] OR "Tendinopathy"[majr])',
    cpgIds: ["cpg-achilles-tendinopathy-2024"],
    measureIds: ["lefs", "nprs"],
    atlasRegion: "achilles-posterior-ankle",
  },
  {
    slug: "stroke",
    name: "Stroke rehabilitation",
    plainName: "Recovering after a stroke",
    blurb: "Rebuilding movement, balance and everyday function after a stroke.",
    match: [/\bstroke\b/i, /\bhemipare/i, /\bhemiplegi/i],
    pubmed: '("Stroke"[majr] OR "Stroke Rehabilitation"[majr] OR stroke[ti])',
    cpgIds: [],
    measureIds: ["fga", "berg", "sixmwt", "tug"],
    atlasRegion: null,
  },
  {
    slug: "parkinsons",
    name: "Parkinson's disease",
    plainName: "Parkinson's disease",
    blurb: "A progressive condition affecting movement. Exercise and balance training are a major focus of research.",
    match: [/\bparkinson/i],
    pubmed: '("Parkinson Disease"[majr] OR parkinson*[ti])',
    cpgIds: [],
    measureIds: ["fga", "berg", "tug", "sixmwt"],
    atlasRegion: null,
  },
  {
    slug: "falls-balance",
    name: "Falls and balance in older adults",
    plainName: "Preventing falls",
    blurb: "Balance and strength training to lower the chance of falling, especially in older adults.",
    match: [/\bfalls?\b.*\b(prevent|risk|older)/i, /\bfall prevention\b/i, /\bfall risk\b/i, /\bbalance training\b/i],
    pubmed: '("Accidental Falls"[majr] OR "fall prevention"[ti] OR "falls prevention"[ti] OR "postural balance"[majr])',
    cpgIds: [],
    measureIds: ["berg", "tug", "fga", "sts30"],
    atlasRegion: null,
  },
  {
    slug: "concussion",
    name: "Concussion",
    plainName: "Concussion",
    blurb: "A mild brain injury from a blow or jolt to the head that can cause headache, dizziness and balance problems.",
    match: [/\bconcussion/i, /\bmild traumatic brain injury\b/i, /\bmTBI\b/],
    pubmed: '("Brain Concussion"[majr] OR concussion[ti] OR "mild traumatic brain injury"[ti])',
    cpgIds: [],
    measureIds: ["mbess"],
    atlasRegion: null,
  },
];

export function getEvidenceTopic(slug: string): EvidenceTopic | null {
  return EVIDENCE_TOPICS.find((t) => t.slug === slug) ?? null;
}

/** The topics an article belongs to, judged from its title and tags only (see the note at
 *  the top of this file for why not the abstract). */
export function topicsForArticle(article: { title: string; tags: string[] }): EvidenceTopic[] {
  const haystack = [article.title, ...article.tags].join(" · ");
  return EVIDENCE_TOPICS.filter((t) => t.match.some((re) => re.test(haystack)));
}
