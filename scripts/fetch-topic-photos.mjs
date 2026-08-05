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
// Usage: node scripts/fetch-topic-photos.mjs

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "..", "src", "lib", "topic-photos-data.ts");
const USER_AGENT = "LimbicPTNews-ImageCuration/1.0 (contact: see repository)";

// title: exact Wikimedia Commons file title.
// tags: loose topic keywords this photo suits — matched against src/lib/topic-image.ts's
// TOPIC_KEYWORDS/specialty names so an article about, say, "ACL" can preferentially draw from
// tagged-acl/knee photos before falling back to the whole pool.
const TITLES = [
  { title: "File:Physical Therapy Session Aboard the USS George Washington DVIDS387343.jpg", tags: ["general", "gait"] },
  { title: "File:Child receiving physical therapy treatment for back pain in a comfortable clinic setting during the day.jpg", tags: ["pediatric", "back pain", "low back"] },
  { title: "File:US Navy 090508-F-7885G-021 Staff Sgt. Hugo Reiner, a physical therapy craftsman aboard the Military Sealift Command hospital ship USNS Comfort (T-AH 20), makes a wrist brace for Teresa De la Pena during a Continuing Promise 200.jpg", tags: ["wrist", "geriatric"] },
  { title: "File:Kinesio taping.jpg", tags: ["ankle", "sports injury", "general"] },
  { title: "File:Flickr - The U.S. Army - Patient at Walter Reed test next-generation prosthesis.jpg", tags: ["gait", "post-surgical"] },
  { title: "File:Physical therapy clinic receives new equipment 130103-F-ES880-430.jpg", tags: ["equipment", "gait"] },
  { title: "File:On the frontlines against COVID- Physical Therapy Assistant (6559676).jpg", tags: ["general"] },
  { title: "File:Pacific Partnership 2024-1- Physical Therapy at BNH (8187681).jpg", tags: ["general", "knee"] },
  { title: "File:US Navy 070509-N-4772B-008 Robert J. Jadgchew, Naval Special Warfare Group One athletic trainer, adjusts the underwater treadmill for a patient.jpg", tags: ["equipment", "gait", "sports"] },
  { title: "File:Personal trainer monitoring a client's movement during a fitball exercise.JPG", tags: ["equipment", "sports", "balance"] },
  { title: "File:Meaning beyond movement- JTF-Bravo physical therapist provides hope to Honduran communities (9352736).jpg", tags: ["gait", "geriatric"] },
  { title: "File:Strength in numbers- group physical therapy (7652217).jpg", tags: ["equipment", "general"] },
  { title: "File:Dr. Jesus Olmo Isokinetic ACL Injury.jpg", tags: ["acl", "knee", "sports injury"] },
  { title: "File:Balance training board 2.jpg", tags: ["balance", "vestibular", "equipment"] },
  { title: "File:Yoga Class - Nisana Foundation - Chamrail - Howrah 2013-08-24 1989.JPG", tags: ["pediatric", "balance"] },
  { title: "File:Team U S competes in wheelchair basketball during 2025 Invictus Games (8863262).jpg", tags: ["sports", "sports injury", "post-surgical"] },
  { title: "File:US Navy 071015-N-5086M-002 U.S. Army Spc. Saul Martinez trains with the medicine ball while standing on a balancing tool and using the hands-free harness walking gait-training device during a therapy session.jpg", tags: ["equipment", "balance", "gait", "post-surgical"] },
  { title: "File:US Navy 071015-N-5086M-202 Retired Marine Corps Cpl. Timothy Jeffers walks on his prosthetic legs while using the hands-free harness walking gait training device during a therapy session in the new Comprehensive Combat and Com.jpg", tags: ["equipment", "gait", "post-surgical"] },
  { title: "File:Gait Analysis Clinic helps improve running, prevent injuries 130108-F-GE255-011.jpg", tags: ["gait", "sports"] },
  { title: "File:Strength in numbers- group physical therapy (7652210).jpg", tags: ["equipment", "balance"] },
  { title: "File:US Navy 091003-N-8960W-011 Gunner's Mate 2nd Class Patrick Cornwell undergoes an exam by Lt. Cristi Zohlen to document his shoulder pain in the physical therapy clinic aboard the aircraft carrier USS Nimitz (CVN 68).jpg", tags: ["shoulder", "rotator cuff"] },
  { title: "File:Canadian Army Capt. Natalie Royer, top, helps relieve a pinched nerve in the neck of U.S. Navy Cmdr. Ingrid Byles during a physical therapy treatment aboard Military Sealift Command hospital ship USNS Mercy 120602-O-ZZ999-001.jpg", tags: ["neck", "spine"] },
  { title: "File:Physical therapists make every visit count 130309-A-RB400-024.jpg", tags: ["general"] },
  { title: "File:Physical therapy taking away soldiers’ pain 111008-A-IX584-002.jpg", tags: ["back pain", "spine", "general"] },
  { title: "File:US Navy 090702-N-1783P-003 Hospital Corpsman 1st Class Guy Duke, left, and Electronics Technician 3rd Class Joshua Benedict demonstrate how the Physical therapy Department at Naval Health Clinic, Charleston use the Wii Fit's yoga.jpg", tags: ["balance", "equipment", "vestibular"] },
  { title: "File:355th MDOS 130626-F-WZ808-005.jpg", tags: ["equipment", "knee"] },
  { title: "File:LRMC staff targets to improve relationships, patient care with Ukrainian counterparts (5931161).jpg", tags: ["knee", "post-surgical"] },
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
