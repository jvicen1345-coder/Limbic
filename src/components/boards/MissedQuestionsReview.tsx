"use client";

import { useState } from "react";
import Link from "next/link";
import { domainSlug, npteDomainOf } from "@/lib/board-content";
import type { MissedQuestion } from "@/lib/boards-progress";

/** The questions this reader got wrong and hasn't since gotten right, newest first.
 *
 *  Boards has told students to "review any missed questions before starting the next day"
 *  in its Resources tab since that tab existed, while storing every answer and offering no
 *  way to see them — this is that review. A question leaves the list by being answered
 *  correctly on a later day (see lib/boards-progress.ts getBoardsProgress), so working
 *  through it actually shortens it.
 *
 *  Each entry starts collapsed to the question stem alone: the point is to try it again
 *  from memory, and a list that opens with every answer already showing is a list you read
 *  rather than practice. */
export function MissedQuestionsReview({ missed }: { missed: MissedQuestion[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (missed.length === 0) {
    return (
      <div className="card elev-sm">
        <div className="card-kicker">Review</div>
        <p className="boards-review-empty">
          Nothing to review — every question you&rsquo;ve answered, you got right the last time you saw it. Missed questions
          land here until you answer them correctly again.
        </p>
      </div>
    );
  }

  return (
    <div className="card elev-sm">
      <div className="boards-streak-header">
        <div className="card-kicker">Review</div>
        <div className="boards-streak-best">
          {missed.length} to revisit
        </div>
      </div>
      <p className="boards-review-intro">
        Questions you missed the last time you saw them. Answer one correctly on a future day and it drops off this list.
      </p>
      <div className="boards-review-list">
        {missed.map((m) => {
          const isOpen = openId === m.question.id;
          const domain = npteDomainOf(m.question);
          return (
            <div className="boards-review-item" key={m.question.id}>
              <button
                type="button"
                className="boards-review-toggle"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : m.question.id)}
              >
                <span className="boards-review-question">{m.question.question}</span>
                <span className="boards-review-domain">{domain}</span>
              </button>
              {isOpen && (
                <div className="boards-review-body">
                  <p className="boards-review-answer">
                    <span className="boards-review-answer-label">Correct</span>
                    {m.question.choices[m.question.correctIndex]}
                  </p>
                  <p className="boards-review-answer boards-review-answer--yours">
                    <span className="boards-review-answer-label">You picked</span>
                    {m.question.choices[m.selectedIndex] ?? "—"}
                  </p>
                  <p className="boards-review-explanation">{m.question.explanation}</p>
                  <Link className="boards-review-practice-link" href={`/student/domains/${domainSlug(domain)}`}>
                    Practice more {domain} →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
