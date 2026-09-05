import type { ArticleType, Specialty } from "@/lib/types";

export const TYPE_META: Record<ArticleType, { label: string; tag: string }> = {
  research: { label: "Research", tag: "tag-accent" },
  guideline: { label: "Guidelines", tag: "tag-accent-2" },
  industry: { label: "Industry & Policy", tag: "tag-neutral" },
  ce: { label: "CE & Events", tag: "tag-outline" },
  product: { label: "Equipment", tag: "tag-accent-2" },
};

export const SPECIALTY_META: Record<Specialty, string> = {
  ortho: "Orthopedic",
  neuro: "Neurologic",
  sports: "Sports",
  pediatric: "Pediatric",
  geriatric: "Geriatric",
};

export const STATES = ["California", "Texas", "New York", "Florida", "Illinois", "Ohio"];

/** Shared page size for every paginated list view (Under Review, Search, APTA News,
 *  Saved Articles/Guidelines) so long lists never render as one unbroken page. */
export const PAGE_SIZE = 12;

export const SPECIALTIES: { id: Specialty; label: string }[] = [
  { id: "ortho", label: "Orthopedic" },
  { id: "neuro", label: "Neurologic" },
  { id: "sports", label: "Sports" },
  { id: "pediatric", label: "Pediatric" },
  { id: "geriatric", label: "Geriatric" },
];

export const TYPES: { id: ArticleType; label: string }[] = [
  { id: "research", label: "Research" },
  { id: "guideline", label: "Guidelines" },
  { id: "industry", label: "Industry & Policy" },
  { id: "ce", label: "CE & Events" },
  { id: "product", label: "Equipment" },
];

/** The canonical specialty/type labels — used both as Profile's "Suggested" topic chips
 *  and as the picker on the onboarding screen (app/onboarding/page.tsx). Kept separate
 *  from the long-tail keyword-derived topics (see lib/news-live.ts allKnownKeywordTopics),
 *  which come from a fixed vocabulary rather than whatever's currently loaded. */
export const SUGGESTED_TOPICS = [...SPECIALTIES.map((s) => s.label), ...TYPES.map((t) => t.label)];

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Same date with the year — for the article detail page's byline (see
 *  components/ArticleReadingPane.tsx). formatDate above deliberately omits the year and
 *  stays that way: it labels feed cards and row lists, where the year is noise on the
 *  recent items that make up nearly all of them. On the article page it's the opposite.
 *  A reader appraising a study needs to know whether it's from this year or from 2015 —
 *  that single fact changes how much weight the findings carry — and "Apr 1" alone leaves
 *  them guessing, or quietly assuming it's recent. */
export function formatDateWithYear(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function firstName(name: string): string {
  return name.replace(/^Dr\.\s*/, "").split(" ")[0];
}

/** "Good morning/afternoon/evening" off a 0-23 local hour — for the Home page's Daily PT
 *  Dashboard greeting (see app/(app)/page.tsx). Standard tri-split: before noon, before
 *  5pm, everything else. */
export function timeOfDayGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** A credential suffix like "PT" out of a name like "Dr. Amara Chen, PT" — null for names
 *  with no comma (e.g. a general sign-in's plain "John Doe", see lib/session.ts
 *  nameFromEmail), which have no credential to show. */
export function credentialFromName(name: string): string | null {
  const commaIndex = name.lastIndexOf(",");
  if (commaIndex === -1) return null;
  const credential = name.slice(commaIndex + 1).trim();
  return credential || null;
}

/** m:ss, for Daily Term / Limbic Boards completion times (see
 *  app/actions/daily-completion.ts) — clamped at 0 since a clock skew or a stale client
 *  timestamp could otherwise produce a negative elapsed time. */
export function formatElapsed(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Extracts the 11-character video ID from any common YouTube URL shape (watch, youtu.be,
 *  or Shorts). Returns null if it doesn't look like a YouTube URL. */
export function youtubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/** YouTube's own thumbnail CDN — every public video has a jpg here at a predictable URL,
 *  no API key or scraping needed. Returns null for a non-YouTube or unparseable URL. */
export function youtubeThumbnailUrl(videoUrl: string): string | null {
  const id = youtubeVideoId(videoUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** YouTube's no-API-key iframe embed URL. `autoplay` requires `muted` per browser
 *  autoplay policy — the caller is responsible for pairing them. Always includes
 *  `enablejsapi=1` so a caller that needs to toggle mute after the fact (see
 *  components/ClipsFeed.tsx) can do it via postMessage instead of changing `src` and
 *  reloading the whole player from the start. */
export function youtubeEmbedUrl(videoUrl: string, opts?: { autoplay?: boolean; muted?: boolean }): string | null {
  const id = youtubeVideoId(videoUrl);
  if (!id) return null;
  const params = new URLSearchParams({ playsinline: "1", rel: "0", modestbranding: "1", enablejsapi: "1" });
  if (opts?.autoplay) params.set("autoplay", "1");
  if (opts?.muted) params.set("mute", "1");
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/** Default display name for a general (non-PT) account, derived from the email's local
 *  part since there's no license record to pull a real name from. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "there";
  const words = local.replace(/[._+-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "there";
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
