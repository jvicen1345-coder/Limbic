import type { Article } from "@/lib/types";

/**
 * Curated fallback for the APTA News section — used when the live scrape of
 * apta.org/news (lib/apta-news.ts) returns too few results. Fictional but written in
 * APTA's real news categories (advocacy wins, CSM, workforce policy, practice
 * resources), same convention as the rest of lib/articles-static.ts.
 */
export const APTA_NEWS_SEED: Article[] = [
  {
    id: "apta-seed-1",
    type: "industry",
    specialty: "ortho",
    title: "APTA-backed bill expanding direct access advances in three more state legislatures",
    source: "APTA",
    date: "2026-07-21",
    readMins: 4,
    summary:
      "Bills removing physician-referral requirements for PT evaluation cleared committee votes in Michigan, Georgia, and Missouri this week, part of APTA's ongoing state-level advocacy push.",
    tags: ["APTA News", "Advocacy", "Direct access"],
    body: [
      "APTA's state affairs team reports committee-level approval this week for direct access legislation in Michigan, Georgia, and Missouri, each of which would remove or further loosen physician-referral requirements before a patient can be evaluated by a physical therapist.",
      "APTA chapters in all three states coordinated testimony from practicing clinicians and patients describing delays in care under current referral rules, a strategy the association says has been decisive in prior successful campaigns.",
      "If passed, the three states would bring the total number of states with some form of direct access to physical therapy services to a large majority nationwide, though restriction levels still vary widely state to state.",
    ],
  },
  {
    id: "apta-seed-2",
    type: "industry",
    specialty: "geriatric",
    title: "Registration opens for APTA's Combined Sections Meeting, with a new falls-prevention track",
    source: "APTA",
    date: "2026-07-14",
    readMins: 3,
    summary:
      "Next year's CSM adds a dedicated falls-prevention and healthy aging track spanning geriatric, neurologic, and orthopedic sections, alongside the usual full slate of specialty programming.",
    tags: ["APTA News", "CSM", "Conference"],
    body: [
      "Registration is now open for APTA's Combined Sections Meeting, the association's largest annual conference, with early-bird pricing available through the fall.",
      "New this year is a cross-section falls-prevention and healthy-aging track, co-programmed by the Geriatric, Neurology, and Orthopaedic academies, reflecting growing member interest in this shared patient population.",
      "As in past years, attendees can earn the majority of their annual continuing-education requirements across the multi-day event, with recorded sessions available afterward for registered attendees.",
    ],
  },
  {
    id: "apta-seed-3",
    type: "industry",
    specialty: "sports",
    title: "APTA releases updated clinical practice resource on return-to-sport decision-making",
    source: "APTA",
    date: "2026-07-02",
    readMins: 5,
    summary:
      "A new member resource compiles current evidence-based return-to-sport criteria across common lower-extremity injuries into a single practical reference, developed with the Academy of Orthopaedic Physical Therapy.",
    tags: ["APTA News", "Practice resource", "Return to sport"],
    body: [
      "APTA's practice department, working with the Academy of Orthopaedic Physical Therapy, published a consolidated clinical resource summarizing return-to-sport testing criteria across ACL reconstruction, ankle sprain, and hamstring injury protocols.",
      "The resource is designed as a quick clinical reference rather than a full guideline, pointing clinicians to the underlying evidence base for deeper review case by case.",
      "It's freely available to members through APTA's practice resource library and will be updated as new consensus statements are published.",
    ],
  },
  {
    id: "apta-seed-4",
    type: "industry",
    specialty: "neuro",
    title: "APTA testifies before Congress on telehealth parity extension for PT services",
    source: "APTA",
    date: "2026-06-19",
    readMins: 4,
    summary:
      "Association leadership urged a House subcommittee to make pandemic-era Medicare telehealth flexibilities for physical therapy permanent, citing rural-access data gathered by APTA's research team.",
    tags: ["APTA News", "Telehealth", "Medicare"],
    body: [
      "APTA's chief advocacy officer testified before a House Ways and Means subcommittee this month, presenting association-gathered data on telehealth utilization among Medicare beneficiaries in rural counties since temporary flexibilities were introduced.",
      "The testimony argued that allowing the current telehealth authority to lapse would disproportionately affect patients in counties with the fewest in-person PT providers per capita.",
      "No committee vote has been scheduled yet; APTA says it will continue pushing for a permanent extension ahead of the current authorization's expiration.",
    ],
  },
  {
    id: "apta-seed-5",
    type: "industry",
    specialty: "pediatric",
    title: "APTA workforce report: pediatric PT vacancy rates remain highest of any specialty",
    source: "APTA",
    date: "2026-06-08",
    readMins: 4,
    summary:
      "APTA's annual workforce survey finds pediatric physical therapy positions take longest to fill nationally, with the association pointing to reimbursement and school-based staffing models as key factors.",
    tags: ["APTA News", "Workforce", "Pediatric"],
    body: [
      "APTA's annual member workforce survey found pediatric physical therapy openings had the longest average time-to-fill of any practice setting surveyed, ahead of skilled nursing and home health.",
      "Survey respondents most often cited school-district reimbursement structures and limited new-graduate exposure to pediatric settings during clinical education as contributing factors.",
      "APTA says it is expanding pediatric-track scholarship funding and working with academic programs to increase pediatric clinical placement availability.",
    ],
  },
];
