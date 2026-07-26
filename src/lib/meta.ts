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
