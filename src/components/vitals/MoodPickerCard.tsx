"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMoodLogAction } from "@/app/actions/mood";
import { CheckIcon } from "@/components/icons";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "Low" },
  { value: 2, emoji: "😕", label: "Down" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
] as const;

export interface MoodHistoryEntry {
  /** Local ISO "YYYY-MM-DD". */
  date: string;
  mood: number;
}

/** A same-day mood check-in — 1 (Low) to 5 (Great), the primary and most reliable source for
 *  Limbic's mood tracking (see app/actions/mood.ts). Also best-effort synced from a
 *  connected Google Health account (lib/mood-sync.ts), which never overwrites a manual pick
 *  for the same day — picking here always wins. The 7-day strip below is read-only context,
 *  not a way to edit past days: same "same-day self-report only" reasoning as the action
 *  itself. */
export function MoodPickerCard({ todayMood, recentDays }: { todayMood: number | null; recentDays: MoodHistoryEntry[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(todayMood);
  const [pending, startTransition] = useTransition();
  const [showSaved, setShowSaved] = useState(false);

  const handlePick = (value: number) => {
    setSelected(value);
    startTransition(async () => {
      await saveMoodLogAction(value);
      setShowSaved(true);
      window.setTimeout(() => setShowSaved(false), 1600);
      router.refresh();
    });
  };

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">How are you feeling today?</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {MOOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className="mood-picker-option"
              data-selected={selected === o.value}
              disabled={pending}
              onClick={() => handlePick(o.value)}
              aria-label={o.label}
              title={o.label}
            >
              {o.emoji}
            </button>
          ))}
        </div>
        {showSaved && <CheckIcon size={14} className="profile-date-saved-check" />}
      </div>

      {recentDays.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
          <span style={{ fontSize: "var(--fs-11-5)", color: "var(--color-neutral-700)" }}>Last 7 days</span>
          <div style={{ display: "flex", gap: 5 }}>
            {recentDays.map((d) => (
              <span key={d.date} title={d.date} style={{ fontSize: 15 }}>
                {MOOD_OPTIONS.find((o) => o.value === d.mood)?.emoji ?? "·"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
