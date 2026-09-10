#!/usr/bin/env node
// Regenerates src/lib/topic-photos-data.ts from Wikimedia Commons
// (https://commons.wikimedia.org). PEXELS_API_KEY is empty in this environment (and may be
// for any given deployment), so lib/pexels.ts's fetchTopicPhoto silently returns null and
// articles without their own og:image show no picture at all — see lib/topic-image.ts. This
// bundled pool is the guaranteed fallback for that case: a small, hand-curated set of real,
// freely-licensed photos spanning physical therapy, medical equipment, and general exercise/
// activity, tagged so lib/topic-photos.ts can still rotate a topically-relevant pick per
// article rather than a single repeated stock photo.
//
// The title list below is the result of manual curation, not an automated search — every one
// of these was visually inspected for actual PT/health relevance and to keep the pool from
// skewing toward military-uniformed subjects (Commons' modern, real, no-API-key-needed PT
// photography leans heavily military/DVIDS-sourced, so this was a deliberate rebalance, not
// an oversight). Re-run this script (`node scripts/fetch-topic-photos.mjs`) to refresh license/
// URL metadata for the same list; edit TITLES below to change which photos are included.
//
// Part of that visual inspection is how the photo survives Home's crop, not just what it
// shows at full size: every card scales the picture to its own width and keeps a wide band
// through the middle (see .hero-card-media in src/styles/home.css — a 320px-tall box the full
// width of the card — and ArticleImage's 120px grid thumbnails). A landscape source keeps
// most of its frame through that crop and still reads as a clinical scene; a portrait one
// keeps only a narrow slice through the middle of the frame, which on a standing subject is
// a torso close-up. MAX_ASPECT below therefore rejects portrait sources outright — a photo
// can be a perfectly good picture and still be wrong for this pool.
//
// Usage: node scripts/fetch-topic-photos.mjs

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "..", "src", "lib", "topic-photos-data.ts");
const USER_AGENT = "LimbicPTNews-ImageCuration/1.0 (contact: see repository)";

// Largest height/width a bundled photo may have. Landscape only — see the note above on how
// Home crops these. Enforced at generation time so a portrait photo can't reach the pool by
// being added to TITLES.
const MAX_ASPECT = 0.9;

// title: exact Wikimedia Commons file title.
// tags: loose topic keywords this photo suits — matched against src/lib/topic-image.ts's
// TOPIC_KEYWORDS/specialty names so an article about, say, "ACL" can preferentially draw from
// tagged-acl/knee photos before falling back to the whole pool.
const TITLES = [
  { title: "File:Physical Therapy Session Aboard the USS George Washington DVIDS387343.jpg", tags: ["general", "gait"] },
  { title: "File:Child receiving physical therapy treatment for back pain in a comfortable clinic setting during the day.jpg", tags: ["pediatric", "back pain", "low back", "spine"] },
  { title: "File:Kinesio taping.jpg", tags: ["ankle", "sports injury", "general"] },
  { title: "File:Physical therapy clinic receives new equipment 130103-F-ES880-430.jpg", tags: ["equipment", "gait"] },
  { title: "File:On the frontlines against COVID- Physical Therapy Assistant (6559676).jpg", tags: ["general"] },
  { title: "File:Pacific Partnership 2024-1- Physical Therapy at BNH (8187681).jpg", tags: ["general", "knee"] },
  { title: "File:Meaning beyond movement- JTF-Bravo physical therapist provides hope to Honduran communities (9352736).jpg", tags: ["gait", "geriatric"] },
  { title: "File:Strength in numbers- group physical therapy (7652217).jpg", tags: ["equipment", "general"] },
  { title: "File:Dr. Jesus Olmo Isokinetic ACL Injury.jpg", tags: ["acl", "knee", "sports injury"] },
  { title: "File:Yoga Class - Nisana Foundation - Chamrail - Howrah 2013-08-24 1989.JPG", tags: ["pediatric", "balance"] },
  { title: "File:Team U S competes in wheelchair basketball during 2025 Invictus Games (8863262).jpg", tags: ["sports", "sports injury", "post-surgical"] },
  { title: "File:Gait Analysis Clinic helps improve running, prevent injuries 130108-F-GE255-011.jpg", tags: ["gait", "sports"] },
  { title: "File:Strength in numbers- group physical therapy (7652210).jpg", tags: ["equipment", "balance"] },
  { title: "File:US Navy 091003-N-8960W-011 Gunner's Mate 2nd Class Patrick Cornwell undergoes an exam by Lt. Cristi Zohlen to document his shoulder pain in the physical therapy clinic aboard the aircraft carrier USS Nimitz (CVN 68).jpg", tags: ["shoulder", "rotator cuff"] },
  { title: "File:US Navy 090702-N-1783P-003 Hospital Corpsman 1st Class Guy Duke, left, and Electronics Technician 3rd Class Joshua Benedict demonstrate how the Physical therapy Department at Naval Health Clinic, Charleston use the Wii Fit's yoga.jpg", tags: ["balance", "equipment", "vestibular"] },
  { title: "File:LRMC staff targets to improve relationships, patient care with Ukrainian counterparts (5931161).jpg", tags: ["knee", "post-surgical"] },
  { title: "File:Physical Therapy Teaching Lab at CU Anschutz (October 2025).jpg", tags: ["equipment", "general"] },
  { title: "File:MEDIMAX Physiotherapy Clinic Tel Aviv.jpg", tags: ["equipment", "sports"] },
  { title: "File:Leg treatment in physiatry closeup. Physiotherapist working examining treating.jpg", tags: ["knee", "post-surgical", "equipment"] },
  { title: "File:Dunamis Therapy and Fitness.jpg", tags: ["equipment", "sports", "general"] },
  { title: "File:AWH Pediatric Physical Therapy.JPG", tags: ["pediatric", "balance", "general"] },
  { title: "File:Occupational Therapist Melanie Glapa works with student George Hage to shape the hand splint for hand therapy patient ‘Pemoli’ at the physiotherapy ward at the National Referral Hospital, Honiara. (10711530113).jpg", tags: ["wrist", "post-surgical"] },
  { title: "File:Spangdahlem physical therapy rehabilitates Airmen after injury (7270858).jpg", tags: ["balance", "equipment", "gait"] },
  { title: "File:Spangdahlem physical therapy rehabilitates Airmen after injury (7270860).jpg", tags: ["shoulder", "rotator cuff", "equipment"] },
  { title: "File:Spangdahlem physical therapy rehabilitates Airmen after injury (7270864).jpg", tags: ["shoulder", "neck", "general"] },
  { title: "File:Pacific Partnership 2024-1- Physical Therapy Clinic (8103289).jpg", tags: ["geriatric", "general"] },
  { title: "File:US Navy 110613-N-YM336-079 Lynn Boulanger, an occupational therapy assistant and certified hand therapist, uses mirror therapy to help address phan.jpg", tags: ["post-surgical", "gait"] },
];

function stripHtml(s) {
  return (s ?? "").replace(/<[^>]+>/g, "").trim();
}

async function main() {
  const titles = TITLES.map((t) => t.title);
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&titles=" +
    encodeURIComponent(titles.join("|")) +
    "&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1280&format=json";
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Commons API fetch failed: ${res.status}`);
  const json = await res.json();
  const pages = Object.values(json.query.pages);

  const byTitle = new Map(pages.map((p) => [p.title, p]));
  const photos = [];
  for (const { title, tags } of TITLES) {
    const page = byTitle.get(title);
    const info = page?.imageinfo?.[0];
    if (!info) {
      console.error(`MISSING from Commons, skipping: ${title}`);
      continue;
    }
    if (info.thumbheight / info.thumbwidth > MAX_ASPECT) {
      console.error(
        `PORTRAIT (${info.thumbwidth}x${info.thumbheight}), skipping — crops to a torso band on Home: ${title}`
      );
      continue;
    }
    const license = info.extmetadata?.LicenseShortName?.value ?? "Unknown";
    const artist = stripHtml(info.extmetadata?.Artist?.value) || "Unknown";
    photos.push({
      url: info.thumburl,
      width: info.thumbwidth,
      height: info.thumbheight,
      tags,
      credit: `${artist} — ${license}, via Wikimedia Commons`,
      sourceUrl: info.descriptionurl,
    });
  }

  const banner = `// Generated by scripts/fetch-topic-photos.mjs from Wikimedia Commons.
// A hand-curated, real, freely-licensed photo pool — not fetched live (see the script for
// why). Re-run the script to refresh URLs/licenses for the same title list.
export interface BundledTopicPhoto {
  url: string;
  width: number;
  height: number;
  tags: string[];
  credit: string;
  sourceUrl: string;
}

export const BUNDLED_TOPIC_PHOTOS: BundledTopicPhoto[] = ${JSON.stringify(photos, null, 2)};
`;

  writeFileSync(OUT_FILE, banner);
  console.log(`Wrote ${photos.length} photos to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
