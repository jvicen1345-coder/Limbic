import "server-only";
import { prisma } from "@/lib/db";
import type { Specialty } from "@/lib/types";

/**
 * Nexus directory/feed seed data — fictional filler profiles only ("curated demo
 * profiles"), with invented names that impersonate nobody and original, generic
 * professional commentary attributed to no real source. Each is a plain `User` record
 * with no email/licenseNumber, so it can never sign in.
 *
 * This file used to also carry a REAL_PEOPLE list: real, named PT/OT professionals
 * sourced via web search, each with a post written in their voice. Even though those
 * posts linked to something the person had genuinely published, the post text itself was
 * an invented first-person statement signed with a real practitioner's name and
 * credentials, and nothing in the directory marked those profiles as seeded — so they
 * read as members who had joined and posted. That is a real person's name and
 * professional identity used to populate a commercial product without their consent, and
 * it is removed. RETIRED_SEED_IDS below deletes the rows from any database that already
 * has them. Don't reintroduce this pattern: a real practitioner gets into the directory
 * by claiming an account, not by being seeded into one.
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
  post: { body: string };
}

const DEMO_PEOPLE: SeedPerson[] = [
  {
    id: "nexus-seed-maria-alvarez",
    name: "Maria Alvarez, DPT",
    headline: "Clinic Director, Alvarez Sports & Spine PT",
    bio: "Outpatient ortho clinic owner. Big on loaded exercise over passive treatment.",
    specialty: "ortho",
    practiceState: "Texas",
    post: {
      body: "Hot take: manual therapy is a bridge to loaded exercise, not the destination. If a plan of care hasn't progressed past soft-tissue work by week three, it's not a plan; it's a routine.",
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
      body: "Reminder for anyone writing school-based OT goals this month: 'improve fine motor skills' isn't a goal a teacher can act on. Tie it to the classroom task: pencil grasp for writing legibly across a full worksheet, not in isolation.",
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
      body: "Return-to-play is a conversation, not a form. The hop-test numbers matter, but so does asking the athlete directly whether the knee 'feels like theirs' again; that answer changes the timeline more than people admit.",
    },
  },
];

export const ALL_SEED_PEOPLE = DEMO_PEOPLE;

/** Ids of the retired REAL_PEOPLE seed profiles (see the note at the top of this file).
 *  Removing them from source isn't enough on its own — ensureNexusSeedData() already
 *  upserted them into every database it has ever run against, production included — so
 *  they're deleted by id on the next seed run. Deleting the `User` cascades to their seed
 *  post and to any connection request or message a real reader sent them (every one of
 *  those relations is onDelete: Cascade, see schema.prisma). Safe to keep running
 *  indefinitely: deleteMany on absent ids is a no-op, not an error. */
const RETIRED_SEED_IDS = [
  "nexus-seed-sean-collins",
  "nexus-seed-larry-benz",
  "nexus-seed-karen-richards",
  "nexus-seed-ben-fedewa",
  "nexus-seed-neva-kirk-sanchez",
  "nexus-seed-david-dansereau",
];

let ensured: Promise<void> | null = null;

/** Upserts one seed profile + their one seed post — a fixed id, so a no-op after the
 *  first call in a given database. */
async function seedOnePerson(person: (typeof ALL_SEED_PEOPLE)[number]): Promise<void> {
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
      // Seed profiles can't log in to opt themselves in, so they're always
      // considered "in" Nexus — this is what makes them show up in the directory
      // and feed regardless of any real user's own opt-in choice.
      nexusOptIn: true,
    },
  });

  const existingPost = await prisma.nexusPost.findFirst({ where: { authorId: user.id } });
  if (!existingPost) {
    await prisma.nexusPost.create({
      data: {
        authorId: user.id,
        body: person.post.body,
      },
    });
  }
}

/** Ensures every seed profile + their one seed post exist, so every Nexus page can just
 *  call this before querying. Cached per-process (the `ensured` promise below) so this
 *  only actually does any work once. If seeding fails, the cached promise is cleared so
 *  the *next* call retries instead of every future call in this process replaying the
 *  same stale rejection forever. */
export async function ensureNexusSeedData(): Promise<void> {
  if (!ensured) {
    // Sequential rather than Promise.all across every seed person — SQLite (the local dev
    // datastore behind the same libSQL adapter used in production) can't reliably serve a
    // couple dozen concurrent write connections to one file; that many upserts fired at
    // once was intermittently corrupting the query engine's response stream. Only runs
    // once per process (see the `ensured` cache above), so the extra latency of going
    // one-at-a-time here is a one-time cost, not a per-request one.
    ensured = (async () => {
      // Ahead of the upserts, so a database still carrying the retired real-person
      // profiles is cleaned on the very first Nexus page load after this deploys.
      await prisma.user.deleteMany({ where: { id: { in: RETIRED_SEED_IDS } } });
      for (const person of ALL_SEED_PEOPLE) {
        await seedOnePerson(person);
      }
    })()
      .then(() => undefined)
      .catch((err) => {
        ensured = null;
        throw err;
      });
  }
  return ensured;
}
