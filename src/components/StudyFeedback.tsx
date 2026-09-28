"use client";

import { useState, useTransition } from "react";
import { setStudyFeedbackAction } from "@/app/actions/study-feedback";
import type { StudyFeedbackSummary } from "@/lib/study-feedback";

/** Two one-tap questions under a study breakdown. They are how the site learns whether a
 *  breakdown was digestible (useful) and applicable (would change practice) — see the
 *  StudyFeedback model. */
export function StudyFeedback({ articleId, initial }: { articleId: string; initial: StudyFeedbackSummary }) {
  const [summary, setSummary] = useState(initial);
  const [pending, startTransition] = useTransition();

  const set = (field: "useful" | "changesPractice") => {
    const next = !(summary.mine?.[field] ?? false);
    const mine = { useful: summary.mine?.useful ?? false, changesPractice: summary.mine?.changesPractice ?? false, [field]: next };
    const countKey = field === "useful" ? "usefulCount" : "changesPracticeCount";
    const previous = summary;
    // Optimistic, so the button responds on a slow connection; reverted if the write fails.
    setSummary({ ...summary, mine, [countKey]: Math.max(0, summary[countKey] + (next ? 1 : -1)) });
    startTransition(async () => {
      const res = await setStudyFeedbackAction(articleId, field, next);
      setSummary(res.ok ? res.summary : previous);
    });
  };

  const counts = [
    summary.usefulCount > 0 ? `${summary.usefulCount} found this useful` : null,
    summary.changesPracticeCount > 0 ? `${summary.changesPracticeCount} said it would change how they treat` : null,
  ].filter(Boolean);

  return (
    <div className="study-feedback" aria-busy={pending}>
      <div className="article-breakdown-label">Was this breakdown helpful?</div>
      <div className="study-feedback-buttons">
        <button
          type="button"
          className={`study-feedback-btn${summary.mine?.useful ? " is-on" : ""}`}
          aria-pressed={!!summary.mine?.useful}
          onClick={() => set("useful")}
        >
          Useful
        </button>
        <button
          type="button"
          className={`study-feedback-btn${summary.mine?.changesPractice ? " is-on" : ""}`}
          aria-pressed={!!summary.mine?.changesPractice}
          onClick={() => set("changesPractice")}
        >
          Would change how I treat
        </button>
      </div>
      {counts.length > 0 && <p className="study-feedback-counts">{counts.join(" · ")}</p>}
    </div>
  );
}
