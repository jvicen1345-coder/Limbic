import "server-only";
import { prisma } from "@/lib/db";
import type { Specialty } from "@/lib/types";

/**
 * Nexus directory/feed seed data. Two kinds of rows, both plain `User` records with no
 * email/licenseNumber (so they can never sign in — same trick as any other demo account):
 *
 *  - REAL_PEOPLE: real, named PT/OT/healthcare professionals, sourced via web search. Their
 *    seed post links out to a real thing they actually published (sourceUrl/sourceLabel) —
 *    never a fabricated quote attributed to them, same integrity bar as the rest of the
 *    app's "real" content (APTA News, wellness videos, Clips).
 *  - DEMO_PEOPLE: fictional filler profiles for the directory ("curated demo profiles"),
 *    invented names that don't impersonate anyone real. Their posts are original,
 *    generic professional commentary, not attributed to any real source.
 *
 * ensureNexusSeedData() is idempotent (fixed ids, upsert) and safe to call on every Nexus
 * page load — no separate seed script to remember to run against Turso in production.
 */

interface SeedPerson {
  id: string;
  name: string;
  headline: string;
  bio: string;
  specialty: Specialty;
  practiceState: string;
  post: { body: string; sourceUrl?: string; sourceLabel?: string };
}

const REAL_PEOPLE: SeedPerson[] = [
  {
    id: "nexus-seed-sean-collins",
    name: "Sean Collins, PT, DPT",
    headline: "Professor of Clinical Inquiry · Writer, A Peripatetic Physical Therapist",
    bio: "PT educator writing about clinical reasoning and how PTs think through diagnosis, on Substack.",
    specialty: "ortho",
    practiceState: "New Hampshire",
    post: {
      body: "New essay up on A Peripatetic Physical Therapist digging into how clinicians separate correlation from causation in diagnosis — worth a read if you teach differential reasoning or just want to sharpen your own.",
      sourceUrl: "https://peripateticpt.substack.com/p/exploring-causation-and-diagnostic",
      sourceLabel: "A Peripatetic Physical Therapist",
    },
  },
  {
    id: "nexus-seed-larry-benz",
    name: "Larry Benz, PT, DPT",
    headline: "Practice owner & writer, All Things #Physicaltherapy",
    bio: "Physical therapy practice owner writing on industry trends, patient volume, and practice management.",
    specialty: "ortho",
    practiceState: "Kentucky",
    post: {
      body: "Been writing about the 'mill effect' in high-volume ortho clinics — what happens to outcomes and clinician retention when visit counts become the whole strategy. More on the Substack.",
      sourceUrl: "https://physicaltherapy.substack.com",
      sourceLabel: "All Things #Physicaltherapy",
    },
  },
  {
    id: "nexus-seed-karen-richards",
    name: "Karen Richards, OT",
    headline: "Pediatric Occupational Therapist · Writer, Kids OT",
    bio: "Pediatric OT writing about private-practice OT work and hands-on treatment ideas.",
    specialty: "pediatric",
    practiceState: "United Kingdom",
    post: {
      body: "Wrote up some of the everyday prejudices private-practice pediatric OTs run into in the UK system — and a few creative therapy-putty activities for sensory work, for anyone who wants something lighter after that one.",
      sourceUrl: "https://kidsot.substack.com/t/occupational-therapy",
      sourceLabel: "Kids OT",
    },
  },
  {
    id: "nexus-seed-ben-fedewa",
    name: "Ben Fedewa, PT, DPT",
    headline: "Sports Physical Therapist, OSO Physical Therapy",
    bio: "Sports PT focused on ACL rehab and criteria-based return-to-sport testing.",
    specialty: "sports",
    practiceState: "California",
    post: {
      body: "Put together a criteria-based checklist for clearing athletes to return to sport after ACL reconstruction — objective hop testing and strength symmetry, not just a date on the calendar.",
      sourceUrl: "https://osophysicaltherapy.com/blog/criteria-based-checklist-for-returning-to-sport-after-acl-reconstruction-in-alameda",
      sourceLabel: "OSO Physical Therapy",
    },
  },
  {
    id: "nexus-seed-neva-kirk-sanchez",
    name: "Neva Kirk-Sanchez, PT, PhD",
    headline: "Geriatric PT researcher · Lead author, APTA fall-risk CPG",
    bio: "Researcher focused on fall risk and balance in community-dwelling older adults.",
    specialty: "geriatric",
    practiceState: "Florida",
    post: {
      body: "Our team's evidence-based clinical practice guideline on managing fall risk in community-dwelling older adults is out in the Journal of Geriatric Physical Therapy — multicomponent, progressive balance training remains the strongest lever we have.",
      sourceUrl: "https://journals.lww.com/jgpt/fulltext/2025/04000/physical_therapy_management_of_fall_risk_in.3.aspx",
      sourceLabel: "Journal of Geriatric Physical Therapy",
    },
  },
  {
    id: "nexus-seed-david-dansereau",
    name: "David Dansereau, MSPT",
    headline: "Neurologic PT · Host, Know Stroke · Writer, Achieve Balance",
    bio: "Neuro PT writing and podcasting about stroke recovery and rebuilding balance after stroke.",
    specialty: "neuro",
    practiceState: "Massachusetts",
    post: {
      body: "New Know Stroke piece on how remote therapeutic monitoring is starting to close the gap between clinic visits for stroke survivors — more data between appointments, faster adjustments to the plan of care.",
      sourceUrl: "https://knowstroke.substack.com/p/revolutionizing-neuro-rehab-with",
      sourceLabel: "Know Stroke",
    },
  },
];

const DEMO_PEOPLE: SeedPerson[] = [
  {
    id: "nexus-seed-maria-alvarez",
    name: "Maria Alvarez, DPT",
    headline: "Clinic Director, Alvarez Sports & Spine PT",
    bio: "Outpatient ortho clinic owner. Big on loaded exercise over passive treatment.",
    specialty: "ortho",
    practiceState: "Texas",
    post: {
      body: "Hot take: manual therapy is a bridge to loaded exercise, not the destination. If a plan of care hasn't progressed past soft-tissue work by week three, it's not a plan — it's a routine.",
    },
  },
  {
    id: "nexus-seed-james-okafor",
    name: "James Okafor, PT",
    headline: "Neuro Rehab PT, outpatient stroke & TBI",
    bio: "Neuro-focused outpatient PT. Interested in gait retraining and caregiver education.",
    specialty: "neuro",
    practiceState: "Illinois",
    post: {
      body: "The most underrated part of neuro rehab isn't the exercise prescription, it's caregiver education. A family that understands the 'why' behind a transfer technique prevents more falls than any home program alone.",
    },
  },
  {
    id: "nexus-seed-priya-nandakumar",
    name: "Priya Nandakumar, OTR/L",
    headline: "School-Based Occupational Therapist",
    bio: "School-based OT working with kids on fine motor, sensory regulation, and classroom participation.",
    specialty: "pediatric",
    practiceState: "New Jersey",
    post: {
      body: "Reminder for anyone writing school-based OT goals this month: 'improve fine motor skills' isn't a goal a teacher can act on. Tie it to the classroom task — pencil grasp for writing legibly across a full worksheet, not in isolation.",
    },
  },
  {
    id: "nexus-seed-tom-bricker",
    name: "Tom Bricker, PT",
    headline: "Home Health Physical Therapist",
    bio: "Home health PT, mostly post-hospital deconditioning and fall-risk cases.",
    specialty: "geriatric",
    practiceState: "Ohio",
    post: {
      body: "Home health PSA: the biggest fall-risk factor I see in the field isn't strength, it's clutter and lighting. Half my first visit is just walking the actual path from bed to bathroom with the patient.",
    },
  },
  {
    id: "nexus-seed-alicia-ferreira",
    name: "Alicia Ferreira, DPT, SCS",
    headline: "Sports Medicine Fellow",
    bio: "Sports medicine fellow, mostly field-side coverage and return-to-play decisions.",
    specialty: "sports",
    practiceState: "North Carolina",
    post: {
      body: "Return-to-play is a conversation, not a form. The hop-test numbers matter, but so does asking the athlete directly whether the knee 'feels like theirs' again — that answer changes the timeline more than people admit.",
    },
  },
];

export const ALL_SEED_PEOPLE = [...REAL_PEOPLE, ...DEMO_PEOPLE];

let ensured: Promise<void> | null = null;

/** Upserts every seed profile + their one seed post. Cheap (fixed ids, no-op after the
 *  first call in a given database) so every Nexus page can just call this before querying. */
export async function ensureNexusSeedData(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      for (const person of ALL_SEED_PEOPLE) {
        const user = await prisma.user.upsert({
          where: { id: person.id },
          update: {},
          create: {
            id: person.id,
            name: person.name,
            headline: person.headline,
            bio: person.bio,
            specialty: person.specialty,
            practiceState: person.practiceState,
          },
        });

        const existingPost = await prisma.nexusPost.findFirst({ where: { authorId: user.id } });
        if (!existingPost) {
          await prisma.nexusPost.create({
            data: {
              authorId: user.id,
              body: person.post.body,
              sourceUrl: person.post.sourceUrl,
              sourceLabel: person.post.sourceLabel,
            },
          });
        }
      }
    })();
  }
  return ensured;
}
