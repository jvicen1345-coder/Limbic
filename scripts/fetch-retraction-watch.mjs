#!/usr/bin/env node
// Regenerates src/lib/retraction-watch-data.ts from the Crossref/Retraction Watch
// database (https://gitlab.com/crossref/retraction-watch-data). That CSV is the
// authoritative list of retracted papers, corrections, and expressions of concern
// across all of science — tens of thousands of rows — so this script downloads it,
// keeps only rows from journals PTs actually read, and bakes the result into a small
// TypeScript file the app imports directly.
//
// Not fetched live at request time: the source CSV is ~65MB, which is too large and
// too slow to download inside a single request in a serverless function. Crossref
// updates it daily, so re-run this script (`node scripts/fetch-retraction-watch.mjs`)
// whenever you want a fresher snapshot — it's a deliberate, occasional refresh, not
// something the running app does on its own.
//
// Usage: node scripts/fetch-retraction-watch.mjs [gitlab-commit-sha]

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv[2] || "893860dd47c7c08efe7b179a08c4fcde8fe9d9f7";
const CSV_URL = `https://gitlab.com/crossref/retraction-watch-data/-/raw/${COMMIT}/retraction_watch.csv`;
const OUT_FILE = path.join(__dirname, "..", "src", "lib", "retraction-watch-data.ts");

// Real PT/rehab journals only — the dataset's own "(HSC) Medicine - Rehabilitation/
// Therapy" subject tag turned out to cover general medical "therapy" (drug regimens,
// cancer treatment, etc.), not the physical therapy profession, so journal name is a
// far more precise filter than subject for this app's audience.
const PT_JOURNAL_KEYWORDS = [
  "physical therapy",
  "physiotherapy",
  "disability and rehabilitation",
  "clinical rehabilitation",
  "archives of physical medicine and rehabilitation",
  "american journal of physical medicine",
  "journal of geriatric physical therapy",
  "pediatric physical therapy",
  "journal of neurologic physical therapy",
  "international journal of sports physical therapy",
  "manual therapy",
  "musculoskeletal science and practice",
  "gait & posture",
  "journal of manual",
  "journal of sport rehabilitation",
  "topics in geriatric rehabilitation",
  "topics in stroke rehabilitation",
  "neurorehabilitation",
  "journal of rehabilitation medicine",
  "european journal of physical and rehabilitation medicine",
  "journal of hand therapy",
  "journal of athletic training",
];

const SPECIALTY_KEYWORDS = {
  ortho: ["orthopedic", "orthopaedic", "knee", "hip", "spine", "joint", "acl", "fracture", "shoulder", "back pain", "tendon", "ankle"],
  neuro: ["stroke", "neurologic", "neurological", "vestibular", "parkinson", "brain injury", "multiple sclerosis", "spinal cord"],
  sports: ["sports", "athlete", "athletic", "concussion", "return to play", "return-to-sport", "jump", "runners", "isokinetic"],
  pediatric: ["pediatric", "paediatric", "children", "child", "infant", "cerebral palsy", "toddler"],
  geriatric: ["geriatric", "older adult", "elderly", "senior", "fall risk", "falls prevention", "aging", "osteoarthritis"],
};

function classifySpecialty(text) {
  const lower = text.toLowerCase();
  let best = "ortho";
  let bestHits = 0;
  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    const hits = keywords.filter((kw) => lower.includes(kw)).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = specialty;
    }
  }
  return best;
}

// Minimal RFC4180-ish CSV parser — handles quoted fields, embedded commas, and "" escapes.
// The dataset has no embedded newlines inside quoted fields in practice, so a line-based
// split is sufficient here.
function parseCsvLine(line) {
  const fields = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

function parseMdyDate(raw) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec((raw || "").trim());
  if (!m) return null;
  const [, mo, d, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function humanizeReasons(raw) {
  return (raw || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^(date of article|notice -)/i.test(s))
    .slice(0, 3)
    .join("; ");
}

function firstUrl(raw) {
  const match = /(https?:\/\/\S+)/.exec(raw || "");
  return match ? match[0].replace(/[;,]$/, "") : null;
}

async function main() {
  console.log(`Fetching ${CSV_URL} ...`);
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const csv = await res.text();
  const lines = csv.split("\n").filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const journal = fields[col["Journal"]] || "";
    if (!PT_JOURNAL_KEYWORDS.some((kw) => journal.toLowerCase().includes(kw))) continue;

    const title = (fields[col["Title"]] || "").trim().replace(/\.$/, "");
    if (!title) continue;
    const recordId = fields[col["Record ID"]];
    const nature = (fields[col["RetractionNature"]] || "Retraction").trim();
    const reason = humanizeReasons(fields[col["Reason"]]);
    const retractionDate = parseMdyDate(fields[col["RetractionDate"]]);
    const retractionDoi = (fields[col["RetractionDOI"]] || "").trim();
    const originalDoi = (fields[col["OriginalPaperDOI"]] || "").trim();
    const url =
      firstUrl(fields[col["URLS"]]) ||
      (retractionDoi && retractionDoi !== "Unavailable" ? `https://doi.org/${retractionDoi}` : null) ||
      (originalDoi && originalDoi !== "Unavailable" ? `https://doi.org/${originalDoi}` : null);

    records.push({
      id: `rw-${recordId}`,
      type: "research",
      specialty: classifySpecialty(`${title} ${reason}`),
      title,
      source: journal.trim(),
      sourceUrl: url ?? undefined,
      date: retractionDate || "2000-01-01",
      readMins: 3,
      summary: `${nature} issued ${retractionDate ? `on ${retractionDate}` : ""} by ${journal.trim()}${
        reason ? ` — ${reason}.` : "."
      } See the retraction notice for full details.`,
      tags: [nature],
      reviewStatus: nature,
      underReview: reason || "Flagged by Retraction Watch — see notice for details.",
    });
  }

  // Most recent first, and de-duped by id (a couple of records share an id in edge cases).
  const seen = new Set();
  const deduped = records
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));

  const banner = `// Generated by scripts/fetch-retraction-watch.mjs from
// https://gitlab.com/crossref/retraction-watch-data at commit ${COMMIT}.
// A real, point-in-time snapshot — not fetched live (see the script for why).
// Re-run the script to refresh.
import type { Article } from "@/lib/types";

export const RETRACTION_WATCH_ARTICLES: Article[] = ${JSON.stringify(deduped, null, 2)};
`;

  writeFileSync(OUT_FILE, banner);
  console.log(`Wrote ${deduped.length} records to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
