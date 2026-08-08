import type { TriviaTopic } from "@/lib/trivia-static";

/** Health Trivia's per-topic visual (see app/(app)/games/trivia/page.tsx,
 *  components/HealthTriviaGame.tsx) — pure inline SVG, no image files, one simple glyph per
 *  topic. Keyed by the caller on the current question's id so the pulse-in animation
 *  replays for every new question, not just the very first one. */
export function TriviaTopicIcon({ topic }: { topic: TriviaTopic }) {
  return (
    <div className="trivia-icon-wrap">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" role="img" aria-label={`${topic} icon`}>
        {ICON_BY_TOPIC[topic]}
      </svg>
    </div>
  );
}

const ICON_BY_TOPIC: Record<TriviaTopic, React.ReactNode> = {
  // Sleep — a simple crescent moon.
  sleep: (
    <path
      d="M38 12c-9.5 2-16.5 10.3-16.5 20.3 0 11.4 9.2 20.6 20.6 20.6 4.1 0 7.9-1.2 11.1-3.2C48 52 41.6 55 34.5 55 22.6 55 13 45.4 13 33.5 13 22.6 21 13.5 31.5 12c2.2-.3 4.4-.3 6.5 0z"
      fill="var(--color-accent)"
    />
  ),
  // Hydration — a simple water drop.
  hydration: (
    <path
      d="M30 9c8 10.5 15 19.6 15 27.5C45 46.7 38.3 53 30 53S15 46.7 15 36.5C15 28.6 22 19.5 30 9z"
      fill="var(--color-accent)"
    />
  ),
  // Exercise — a simple running figure.
  exercise: (
    <g stroke="var(--color-accent)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx="36" cy="12" r="4.2" fill="var(--color-accent)" stroke="none" />
      <path d="M32 18l-9 6 3 10" />
      <path d="M23 34l-7 12" />
      <path d="M32 18l6 8-2 12" />
      <path d="M36 38l9 8" />
      <path d="M32 18l10-1 6 7" />
    </g>
  ),
  // Nutrition — a simple plate.
  nutrition: (
    <g>
      <circle cx="30" cy="30" r="21" fill="var(--color-accent-200)" stroke="var(--color-accent)" strokeWidth="2.5" />
      <circle cx="30" cy="30" r="12.5" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
    </g>
  ),
  // Mental health — a simple brain outline.
  mental: (
    <path
      d="M24 12c-5 0-8.5 3.6-8.7 8.1-2.9 1.5-4.8 4.5-4.8 7.9 0 2.6 1.1 5 2.9 6.6-.3 1-.4 2-.4 3 0 5.8 4.7 10.4 10.5 10.4 1.6 0 3.1-.4 4.5-1v-30c0-2.8-1.8-5-4-5zm12 0c5 0 8.5 3.6 8.7 8.1 2.9 1.5 4.8 4.5 4.8 7.9 0 2.6-1.1 5-2.9 6.6.3 1 .4 2 .4 3 0 5.8-4.7 10.4-10.5 10.4-1.6 0-3.1-.4-4.5-1v-30c0-2.8 1.8-5 4-5z"
      stroke="var(--color-accent)"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="var(--color-accent-200)"
    />
  ),
  // General health — a simple heart.
  general: (
    <path
      d="M30 51S9 38.5 9 24.5C9 16.9 15 11 22.4 11c3.4 0 6.6 1.5 8.6 4.1 2-2.6 5.2-4.1 8.6-4.1C46.9 11 53 16.9 53 24.5 53 38.5 30 51 30 51z"
      fill="var(--color-accent)"
    />
  ),
};
