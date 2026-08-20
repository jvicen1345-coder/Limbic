"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon, RefreshIcon } from "@/components/icons";

function formatStopwatch(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Two short tones on completion — a clinician running a timed test is usually watching
 *  the patient, not the screen. Wrapped in try/catch since Web Audio can be blocked or
 *  unsupported; the visual "Time's up" state below covers that case on its own. */
function playCompletionBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    for (const startOffset of [0, 0.3]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + 0.26);
    }
  } catch {
    // No-op — see comment above.
  }
}

export interface CalcTimerProps {
  /** "stopwatch" counts up with no fixed end (TUG, TUG Cognitive's two trials).
   *  "countdown" counts down from durationSeconds and alerts at zero (6MWT, 30-Second
   *  Sit to Stand, mBESS's per-stance hold). */
  mode: "stopwatch" | "countdown";
  durationSeconds?: number;
  /** Stopwatch only — pushes the elapsed seconds into the calculator's own time field so
   *  the clinician doesn't have to read the display and retype it. */
  onUseTime?: (seconds: number) => void;
  /** A short label shown above the display, for calculators that run more than one timer
   *  at once (TUG Cognitive's standard vs. dual-task trials). */
  label?: string;
}

/** A stopwatch/countdown widget for the five /pro/calculators tools that time a patient
 *  performing a task (TUG, TUG Cognitive, 6MWT, 30-Second Sit to Stand, mBESS) — the
 *  seconds those tools score against previously had to come from an external stopwatch,
 *  typed in by hand. Elapsed time is derived from wall-clock timestamps (not accumulated
 *  tick-by-tick) so it can't drift even if the tab is backgrounded mid-timing. */
export function CalcTimer({ mode, durationSeconds = 0, onUseTime, label }: CalcTimerProps) {
  const [running, setRunning] = useState(false);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  // Updated every 100ms while running, from inside the interval callback rather than read
  // directly during render — Date.now() is impure, so render itself must stay a pure
  // function of state/props (see the react-hooks/purity rule this dodges).
  const [nowMs, setNowMs] = useState<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  const totalMs = durationSeconds * 1000;
  const liveMs = running && startedAt != null && nowMs != null ? Math.max(0, nowMs - startedAt) : 0;
  const elapsedMs = accumulatedMs + liveMs;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const isComplete = mode === "countdown" && accumulatedMs >= totalMs;

  useEffect(() => {
    if (mode === "countdown" && running && remainingMs <= 0 && !completedRef.current) {
      completedRef.current = true;
      setAccumulatedMs(totalMs);
      setStartedAt(null);
      setRunning(false);
      playCompletionBeep();
    }
  }, [mode, running, remainingMs, totalMs]);

  function start() {
    const now = Date.now();
    setStartedAt(now);
    setNowMs(now);
    setRunning(true);
  }
  function pause() {
    if (startedAt != null) {
      const now = Date.now();
      setAccumulatedMs((a) => a + Math.max(0, now - startedAt));
    }
    setStartedAt(null);
    setRunning(false);
  }
  function reset() {
    setAccumulatedMs(0);
    setStartedAt(null);
    setRunning(false);
    completedRef.current = false;
  }

  const displayText = mode === "countdown" ? formatCountdown(remainingMs) : formatStopwatch(elapsedMs);
  const hasElapsed = accumulatedMs > 0;

  return (
    <div className={`calc-timer${isComplete ? " calc-timer-complete" : ""}`}>
      {label && <div className="calc-timer-label">{label}</div>}
      <div className="calc-timer-row">
        <div className="calc-timer-display">{displayText}</div>
        <div className="calc-timer-controls">
          {!running ? (
            <button type="button" className="btn btn-secondary calc-timer-btn" onClick={start} disabled={isComplete}>
              <PlayIcon size={12} />
              {hasElapsed ? "Resume" : "Start"}
            </button>
          ) : (
            <button type="button" className="btn btn-secondary calc-timer-btn" onClick={pause}>
              <PauseIcon size={12} />
              Pause
            </button>
          )}
          <button type="button" className="btn btn-ghost calc-timer-btn" onClick={reset} disabled={!hasElapsed && !running}>
            <RefreshIcon size={12} />
            Reset
          </button>
          {mode === "stopwatch" && onUseTime && elapsedMs > 0 && (
            <button
              type="button"
              className="btn btn-ghost calc-timer-btn"
              onClick={() => onUseTime(Math.round((elapsedMs / 1000) * 10) / 10)}
            >
              Use this time
            </button>
          )}
        </div>
      </div>
      {isComplete && <div className="calc-timer-complete-label">Time&rsquo;s up</div>}
    </div>
  );
}
