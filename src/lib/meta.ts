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

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function firstName(name: string): string {
  return name.replace(/^Dr\.\s*/, "").split(" ")[0];
}

/** YouTube's own thumbnail CDN — every public video has a jpg here at a predictable URL,
 *  no API key or scraping needed. Returns null for a non-YouTube or unparseable URL. */
export function youtubeThumbnailUrl(videoUrl: string): string | null {
  const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return match ? `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg` : null;
}

/** Default display name for a general (non-PT) account, derived from the email's local
 *  part since there's no license record to pull a real name from. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "there";
  const words = local.replace(/[._+-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "there";
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
