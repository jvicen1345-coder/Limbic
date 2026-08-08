"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { recordBodyConnectionsAction } from "@/app/actions/daily-completion";
import { ShareButton } from "@/components/ShareButton";
import { BodySilhouette, type BodyRegionId } from "@/components/BodySilhouette";
import { useIsMobile } from "@/lib/use-is-mobile";
import type { BodyMatchPair } from "@/lib/body-connections-static";

// Matches the CSS incorrect-flash animation's duration (see .body-region-flash /
// .body-function-flash in globals.css) — the JS clears the flash state at the same moment
// the CSS animation finishes fading it out.
const FLASH_MS = 600;

const CARD_LETTERS = ["A", "B", "C", "D", "E"];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic (seeded) shuffle — same order for every reader given the same seed, so the
 *  function list / mobile option order is stable across reloads without persisting it. */
function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = hashString(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    h = (Math.imul(h, 31) + i) >>> 0;
    const j = h % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function BodyConnectionsGame({
  dateKey,
  pairs,
  initialMatchedRegions,
}: {
  dateKey: string;
  pairs: BodyMatchPair[];
  /** Regions already matched today, in match order — a full-length array means today's
   *  round is already finished. */
  initialMatchedRegions: string[];
}) {
  const [matchedRegions, setMatchedRegions] = useState<string[]>(initialMatchedRegions);
  const [phase, setPhase] = useState<"playing" | "results">(initialMatchedRegions.length >= pairs.length ? "results" : "playing");
  const [, startTransition] = useTransition();
  const isMobile = useIsMobile();

  const activeRegions = useMemo(() => pairs.map((p) => p.region), [pairs]);

  function persist(nextMatched: string[]) {
    const status = nextMatched.length >= pairs.length ? "won" : "playing";
    startTransition(() => recordBodyConnectionsAction(dateKey, nextMatched, status));
    if (nextMatched.length >= pairs.length) setPhase("results");
  }

  function commitMatch(region: string) {
    const next = [...matchedRegions, region];
    setMatchedRegions(next);
    persist(next);
  }

  if (phase === "results") {
    const dateLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const shareText = `Limbic Body Connections — ${dateLabel}\nMatched: ${pairs.length}/${pairs.length}\nlimbic.center/games/body`;

    return (
      <div className="screen-pad body-page">
        <div className="body-complete-scrim">
          <div className="body-complete-card">
            <div className="card-kicker">Body Connections</div>
            <div className="body-complete-title">All matched</div>
            <div className="body-results-score">
              {pairs.length} of {pairs.length}
            </div>
            <div className="body-results-review">
              {pairs.map((p) => (
                <div key={p.region} className="body-review-row">
                  <div>
                    <div className="body-review-part">{p.bodyPart}</div>
                    <div className="body-review-function">{p.function}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="body-results-actions">
              <ShareButton text={shareText} label="Share Results" className="btn btn-primary btn-block" />
              <Link href="/games" className="btn btn-secondary btn-block">
                Back to Games
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (matchedRegions.length / pairs.length) * 100;

  return (
    <div className="screen-pad body-page">
      <div className="body-header">
        <div className="card-kicker">Body Connections</div>
        <h1 className="body-title">Body Connections</h1>
        <p className="body-progress">
          {matchedRegions.length} of {pairs.length} matched
        </p>
        <div className="body-progress-bar">
          <div className="body-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="body-instruction">
          {isMobile ? "Tap the body part being described below" : "Tap a body part, then tap its function"}
        </p>
      </div>
      {isMobile ? (
        <MobileBody pairs={pairs} matchedRegions={matchedRegions} activeRegions={activeRegions} onMatch={commitMatch} />
      ) : (
        <DesktopBody dateKey={dateKey} pairs={pairs} matchedRegions={matchedRegions} activeRegions={activeRegions} onMatch={commitMatch} />
      )}
    </div>
  );
}

function DesktopBody({
  dateKey,
  pairs,
  matchedRegions,
  activeRegions,
  onMatch,
}: {
  dateKey: string;
  pairs: BodyMatchPair[];
  matchedRegions: string[];
  activeRegions: string[];
  onMatch: (region: string) => void;
}) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedFunctionIdx, setSelectedFunctionIdx] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ region: string; functionIdx: number } | null>(null);

  const functions = useMemo(
    () => seededShuffle(pairs.map((p) => p.function), `${dateKey}:functions`),
    [pairs, dateKey]
  );

  function reset() {
    setSelectedRegion(null);
    setSelectedFunctionIdx(null);
    setFlash(null);
  }

  function attemptMatch(region: string, functionIdx: number) {
    const pair = pairs.find((p) => p.region === region);
    const isCorrect = !!pair && functions[functionIdx] === pair.function;
    if (isCorrect) {
      onMatch(region);
      reset();
    } else {
      setFlash({ region, functionIdx });
      window.setTimeout(reset, FLASH_MS);
    }
  }

  function clickRegion(region: BodyRegionId) {
    if (flash) return;
    if (selectedFunctionIdx !== null) {
      attemptMatch(region, selectedFunctionIdx);
    } else {
      setSelectedRegion((prev) => (prev === region ? null : region));
    }
  }

  function clickFunction(idx: number) {
    if (flash) return;
    const functionText = functions[idx];
    const isMatched = matchedRegions.some((r) => pairs.find((p) => p.region === r)?.function === functionText);
    if (isMatched) return;
    if (selectedRegion !== null) {
      attemptMatch(selectedRegion, idx);
    } else {
      setSelectedFunctionIdx((prev) => (prev === idx ? null : idx));
    }
  }

  const selectedBodyPart = selectedRegion ? pairs.find((p) => p.region === selectedRegion)?.bodyPart : null;

  return (
    <div className="body-desktop-layout">
      <div className="body-silhouette-col">
        <div className="body-silhouette-card">
          <BodySilhouette
            activeRegions={activeRegions}
            matchedRegions={matchedRegions}
            selectedRegion={selectedRegion}
            flashRegion={flash?.region ?? null}
            onRegionClick={clickRegion}
          />
          {selectedBodyPart && <div className="body-selected-tooltip">{selectedBodyPart} selected</div>}
        </div>
      </div>
      <div className="body-functions-col">
        {functions.map((functionText, idx) => {
          const matchedRegion = matchedRegions.find((r) => pairs.find((p) => p.region === r)?.function === functionText);
          const isMatched = !!matchedRegion;
          const matchedBodyPart = isMatched ? pairs.find((p) => p.region === matchedRegion)?.bodyPart : null;
          let cls = "body-function-card";
          if (isMatched) cls += " body-function-matched";
          else if (flash?.functionIdx === idx) cls += " body-function-flash";
          else if (selectedFunctionIdx === idx) cls += " body-function-selected";
          return (
            <button key={functionText} type="button" className={cls} disabled={isMatched} onClick={() => clickFunction(idx)}>
              <span className="body-function-letter">{CARD_LETTERS[idx]}</span>
              <span className="body-function-text-wrap">
                <span className="body-function-text">{functionText}</span>
                {isMatched && <span className="body-function-matched-label">Matched — {matchedBodyPart}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileBody({
  pairs,
  matchedRegions,
  activeRegions,
  onMatch,
}: {
  pairs: BodyMatchPair[];
  matchedRegions: string[];
  activeRegions: string[];
  onMatch: (region: string) => void;
}) {
  const [wrongOption, setWrongOption] = useState<string | null>(null);

  const remaining = useMemo(() => pairs.filter((p) => !matchedRegions.includes(p.region)), [pairs, matchedRegions]);
  const target = remaining[0];

  const options = useMemo(() => {
    if (!target) return [];
    const others = pairs.filter((p) => p.region !== target.region).map((p) => p.function);
    const distractors = seededShuffle(others, `${target.region}:distractors`).slice(0, 3);
    return seededShuffle([target.function, ...distractors], `${target.region}:options`);
  }, [pairs, target]);

  if (!target) return null;

  function choose(option: string) {
    if (wrongOption) return;
    if (option === target.function) {
      onMatch(target.region);
    } else {
      setWrongOption(option);
      window.setTimeout(() => setWrongOption(null), FLASH_MS);
    }
  }

  return (
    <div className="body-mobile-layout">
      <div className="body-silhouette-card">
        <BodySilhouette activeRegions={activeRegions} matchedRegions={matchedRegions} pulsingRegion={target.region} />
      </div>
      <p className="body-mobile-prompt">Where is the {target.bodyPart}?</p>
      <div className="body-mobile-options">
        {options.map((option, idx) => (
          <button
            key={option}
            type="button"
            className={`body-mobile-option${wrongOption === option ? " body-mobile-option-wrong" : ""}`}
            onClick={() => choose(option)}
          >
            <span className="body-function-letter">{CARD_LETTERS[idx]}</span>
            <span className="body-function-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
