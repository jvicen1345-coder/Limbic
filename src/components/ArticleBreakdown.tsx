"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { generateArticleBreakdownAction, upgradeArticleBreakdownAction } from "@/app/actions/article-breakdown";
import {
  BREAKDOWN_AUDIENCES,
  BREAKDOWN_FIELDS,
  isCurrentBreakdown,
  takeawayFor,
  type ArticleBreakdown,
  type BreakdownAudience,
} from "@/lib/article-breakdown-shared";
import { assessEffects, MEANING_LABELS } from "@/lib/clinical-meaning";
import { PlainText } from "@/components/PlainText";

const AUDIENCE_STORAGE_KEY = "limbic.breakdownAudience";

function readStoredAudience(): BreakdownAudience | null {
  try {
    const v = window.localStorage.getItem(AUDIENCE_STORAGE_KEY);
    return v === "clinician" || v === "student" || v === "patient" ? v : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};
const serverAudience = (): BreakdownAudience | null => null;

function storeAudience(audience: BreakdownAudience) {
  try {
    window.localStorage.setItem(AUDIENCE_STORAGE_KEY, audience);
  } catch {
    // Private mode / blocked storage: the choice just won't be remembered.
  }
}

/** The article body on a research article — a study breakdown standing in for the
 *  publisher's abstract, which is no longer rendered anywhere on this page (see
 *  lib/article-breakdown.ts for why).
 *
 *  Paths in:
 *  - `initial` set: the breakdown was already cached when the page was built, so it
 *    server-renders with no fetch at all. This is every reader after the first.
 *  - `initial` null, `mode="app"`: nobody has opened this article yet. Generate on mount.
 *  - `initial` from before BREAKDOWN_VERSION, `mode="app"`: render it straight away and
 *    upgrade it in the background, swapping in the richer version when it arrives.
 *  - `mode="public"`: the signed-out evidence pages. Never generates or upgrades anything,
 *    so a crawler can't spend model calls; the page only renders this with a cached row.
 *
 *  On failure the reader gets a short line plus the page's own link out to the source —
 *  deliberately *not* the abstract as a fallback, since not reprinting it is the point. */
export function ArticleBreakdown({
  articleId,
  initial,
  mode = "app",
  defaultAudience = "clinician",
}: {
  articleId: string;
  initial: ArticleBreakdown | null;
  mode?: "app" | "public";
  defaultAudience?: BreakdownAudience;
}) {
  const [breakdown, setBreakdown] = useState<ArticleBreakdown | null>(initial);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<BreakdownAudience | null>(null);
  // The reader's remembered pick, read through useSyncExternalStore so the server render
  // (null snapshot) and the first client render agree and hydration doesn't warn.
  const stored = useSyncExternalStore(noopSubscribe, readStoredAudience, serverAudience);
  const audience = picked ?? stored ?? defaultAudience;
  const setAudience = (a: BreakdownAudience) => {
    setPicked(a);
    storeAudience(a);
  };

  useEffect(() => {
    if (mode !== "app") return;
    // Guards against a state update after the reader has already navigated (or swapped to
    // another article through Limbic Threads) while the call was in flight.
    let active = true;
    if (!initial) {
      generateArticleBreakdownAction(articleId).then((res) => {
        if (!active) return;
        if (res.result) setBreakdown(res.result);
        else setFailed(true);
      });
    } else if (!isCurrentBreakdown(initial)) {
      upgradeArticleBreakdownAction(articleId).then((res) => {
        if (active && res.result) setBreakdown(res.result);
      });
    }
    return () => {
      active = false;
    };
  }, [articleId, initial, mode]);

  if (failed) {
    return <p className="article-breakdown-failed">A breakdown isn&rsquo;t available for this study.</p>;
  }

  if (!breakdown) {
    return (
      <div className="article-breakdown-loading" aria-live="polite" aria-busy="true">
        <span className="visually-hidden">Preparing the study breakdown…</span>
        <div className="article-breakdown-loading-bar" aria-hidden="true" />
        <div className="article-breakdown-loading-bar" aria-hidden="true" />
        <div className="article-breakdown-loading-bar" aria-hidden="true" />
      </div>
    );
  }

  const hasAudiences = !!breakdown.audiences;
  const meanings = assessEffects(breakdown.effects);
  const facts = [
    breakdown.sampleSize ? `${breakdown.sampleSize.toLocaleString("en-US")} participants` : null,
    breakdown.followUp ? `${breakdown.followUp} follow-up` : null,
  ].filter((f): f is string => !!f);

  return (
    <div className="article-breakdown">
      {facts.length > 0 && (
        <div className="evidence-facts" aria-label="Study at a glance">
          {facts.map((f) => (
            <span key={f} className="evidence-fact">
              {f}
            </span>
          ))}
        </div>
      )}

      {BREAKDOWN_FIELDS.map(({ key, label }) => {
        if (key === "takeaway") {
          return (
            <div className="article-breakdown-row" key={key}>
              <div className="evidence-audience-head">
                <div className="article-breakdown-label">{label}</div>
                {hasAudiences && (
                  <div role="tablist" aria-label="Explain it for" className="pill-tabs evidence-audience-tabs">
                    {BREAKDOWN_AUDIENCES.map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        role="tab"
                        aria-selected={audience === a.key}
                        className={`pill-tab${audience === a.key ? " active" : ""}`}
                        onClick={() => setAudience(a.key)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="article-breakdown-value" role={hasAudiences ? "tabpanel" : undefined}>
                <PlainText glossary="research">{takeawayFor(breakdown, hasAudiences ? audience : "clinician")}</PlainText>
              </p>
              {hasAudiences && audience === "patient" && (
                <p className="evidence-patient-note">
                  One study is one piece of the picture. A physical therapist can help you decide what fits you.
                </p>
              )}
            </div>
          );
        }
        return (
          <div className="article-breakdown-row" key={key}>
            <div className="article-breakdown-label">{label}</div>
            {key === "findings" ? (
              <ul className="article-breakdown-findings">
                {breakdown.findings.map((finding, i) => (
                  <li key={i}>
                    <PlainText glossary="research">{finding}</PlainText>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="article-breakdown-value">
                <PlainText glossary="research">{breakdown[key]}</PlainText>
              </p>
            )}
          </div>
        );
      })}

      {meanings.length > 0 && (
        <div className="evidence-meaning" aria-label="Does it matter to patients?">
          <div className="article-breakdown-label">Does it matter to patients?</div>
          <ul className="evidence-meaning-list">
            {meanings.map((m) => (
              <li key={m.measure.id} className="evidence-meaning-row">
                <span className={`evidence-meaning-badge evidence-meaning-${m.verdict}`}>{MEANING_LABELS[m.verdict]}</span>
                <span className="evidence-meaning-detail">{m.detail}</span>
              </li>
            ))}
          </ul>
          <p className="evidence-meaning-note">
            Checked by arithmetic against published MCIDs (the smallest change patients typically notice), using the numbers
            reported in the abstract. MCIDs vary by population, so treat this as a prompt, not a verdict.
          </p>
        </div>
      )}

      <p className="article-breakdown-note">
        Summarized by Limbic from the published abstract. Tap an underlined term for a plain-language explanation. Read the
        source for the full text.
      </p>
    </div>
  );
}
