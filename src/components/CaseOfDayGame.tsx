"use client";

import { useState } from "react";
import Link from "next/link";
import type { DailyCase } from "@/lib/cases-static";
import { recordCaseOfDayAction } from "@/app/actions/daily-completion";
import { LockIcon, ChevronRightIcon, CheckCircleIcon } from "@/components/icons";
import { nowMs } from "@/lib/clock";

type CaseStatus = "playing" | "correct-first" | "correct-second" | "wrong";

export interface CaseOfDayInitialState {
  attemptedIndexes: number[];
  status: CaseStatus;
}

const POINTS_FOR_STATUS: Record<Exclude<CaseStatus, "playing">, number> = {
  "correct-first": 3,
  "correct-second": 1,
  wrong: 0,
};

export function CaseOfDayGame({
  dateKey,
  dayCase,
  initial,
  learnMoreHref,
  isPro,
}: {
  dateKey: string;
  dayCase: DailyCase;
  /** Today's progress for this user, persisted server-side — null the first time they
   *  play today (see app/actions/daily-completion.ts's recordCaseOfDayAction). */
  initial: CaseOfDayInitialState | null;
  learnMoreHref: string;
  isPro: boolean;
}) {
  const [attemptedIndexes, setAttemptedIndexes] = useState<number[]>(initial?.attemptedIndexes ?? []);
  const [status, setStatus] = useState<CaseStatus>(initial?.status ?? "playing");
  const [startedAt] = useState(() => nowMs());

  function selectOption(index: number) {
    if (status !== "playing") return;
    if (attemptedIndexes.includes(index)) return;

    const isCorrect = index === dayCase.correctIndex;
    const nextAttempted = [...attemptedIndexes, index];
    const nextStatus: CaseStatus = isCorrect
      ? nextAttempted.length === 1
        ? "correct-first"
        : "correct-second"
      : nextAttempted.length >= 2
        ? "wrong"
        : "playing";

    setAttemptedIndexes(nextAttempted);
    setStatus(nextStatus);

    const elapsedSeconds = nextStatus === "playing" ? undefined : Math.round((nowMs() - startedAt) / 1000);
    recordCaseOfDayAction(dateKey, nextAttempted, index, nextStatus, elapsedSeconds);
  }

  const isFinished = status !== "playing";
  const points = isFinished ? POINTS_FOR_STATUS[status] : null;

  return (
    <div className="screen-pad" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="card-kicker">{dayCase.specialty} · Case of the Day</div>
      <h1 style={{ fontSize: 22, margin: "4px 0 16px" }}>
        {dayCase.patientAge}-year-old {dayCase.patientSex} — {dayCase.chiefComplaint}
      </h1>

      <div className="card elev-sm case-section">
        <div className="case-section-title">History</div>
        <ul className="case-bullet-list">
          {dayCase.history.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>

      <div className="card elev-sm case-section">
        <div className="case-section-title">Key Findings</div>
        <ul className="case-bullet-list">
          {dayCase.keyFindings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      <div className="card elev-sm case-section">
        <div className="case-section-title">{dayCase.question}</div>
        <div className="case-option-list">
          {dayCase.options.map((option, i) => {
            const wasAttempted = attemptedIndexes.includes(i);
            const isCorrectOption = i === dayCase.correctIndex;
            let cls = "case-option";
            if (isFinished && isCorrectOption) cls += " case-option-correct";
            else if (wasAttempted) cls += " case-option-wrong";
            return (
              <button
                key={i}
                type="button"
                className={cls}
                disabled={isFinished || wasAttempted}
                onClick={() => selectOption(i)}
              >
                <span>{option}</span>
                {isFinished && isCorrectOption && <CheckCircleIcon size={16} />}
              </button>
            );
          })}
        </div>
        {!isFinished && attemptedIndexes.length === 1 && (
          <p className="case-hint">Not quite — you have one more try.</p>
        )}
      </div>

      {isFinished && (
        <div className="card elev-sm case-reveal">
          <div className="case-reveal-header">
            <span className="case-reveal-points">
              {status === "wrong" ? "0 points" : `+${points} point${points === 1 ? "" : "s"}`}
            </span>
            <span className="case-reveal-verdict">
              {status === "correct-first" ? "Correct on the first try!" : status === "correct-second" ? "Correct on the second try." : "Not quite this time."}
            </span>
          </div>
          <p className="case-reveal-explanation">{dayCase.explanation}</p>

          <div className="case-reveal-actions">
            <Link href={learnMoreHref} className="btn btn-secondary threads-detail-cta">
              Learn More
            </Link>
            {isPro ? (
              <Link href={`/agent?topic=${encodeURIComponent(dayCase.relatedTopic)}`} className="btn btn-primary threads-detail-cta">
                Discuss with Limbic Agent
                <ChevronRightIcon size={13} />
              </Link>
            ) : (
              <Link href="/pro" className="btn btn-primary threads-detail-cta">
                <LockIcon size={12} />
                Discuss with Limbic Agent
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
