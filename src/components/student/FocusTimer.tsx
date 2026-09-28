"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  deleteRecall,
  reviewRecall,
  saveFocusBlock,
  submitRecalls,
  type FocusData,
  type FocusSessionSummary,
  type RecallItem,
} from "@/app/actions/focus";
import type { RecallFeedback } from "@/lib/focus-recall";
import {
  formatClock,
  formatMinutes,
  getFocusSettings,
  getServerFocusSettings,
  isEveningHour,
  localDateKey,
  subscribeFocusSettings,
  updateFocusSettings,
  type FocusSettings,
} from "@/lib/focus-settings";
import { AMBIENT_SOUNDS, playAmbient, playChime, setAmbientVolume, unlockAudio, type AmbientSound } from "@/lib/focus-audio";
import { nowMs } from "@/lib/clock";

/**
 * The Focus timer on /student/focus (see app/(app)/student/focus/page.tsx). A calm
 * Pomodoro-style timer ("Slow Tide") with its own look, wired into the student's account:
 * blocks are tagged with one of their courses (Syllabus rows), every finished focus block is
 * saved, and afterwards the student recalls 1 to 3 topics from memory. Claude checks each
 * recall (lib/focus-recall.ts), the topic joins that course's Self-Quiz deck, and a spaced
 * review queue (lib/focus-review.ts) brings it back 1, 3, 7... days later.
 *
 * Timer preferences live in the browser (lib/focus-settings.ts); the study record lives on
 * the server (app/actions/focus.ts).
 */

type Mode = "focus" | "short" | "long";
type TrayTab = "sound" | "review" | "week" | "notes" | "settings";

type TimerState =
  | { status: "idle" }
  | { status: "running"; endAt: number; total: number }
  | { status: "paused"; left: number; total: number };

type Banner = { text: string; action: "start" | null };

type RecallSheet = {
  session: FocusSessionSummary;
  items: { key: number; topic: string; note: string }[];
  status: "editing" | "checking" | "done";
  results: RecallItem[];
  error: string | null;
};

type ReviewSheet = {
  item: RecallItem;
  note: string;
  status: "editing" | "checking" | "done";
  result: RecallItem | null;
  error: string | null;
};

const MODE_LABEL: Record<Mode, string> = { focus: "Focus", short: "Short break", long: "Long break" };
const R = 94;
const CIRC = 2 * Math.PI * R;
const GOAL_R = 11;
const GOAL_CIRC = 2 * Math.PI * GOAL_R;
const LIMITS = { focus: 180, short: 60, long: 60, goal: 24 } as const;
const PRESETS = [
  { label: "Classic 25 / 5", focus: 25, short: 5, long: 15 },
  { label: "Deep 50 / 10", focus: 50, short: 10, long: 20 },
  { label: "Long 90 / 20", focus: 90, short: 20, long: 30 },
];

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
  const major = i % 5 === 0;
  const r1 = major ? 81 : 83.5;
  return {
    major,
    x1: 100 + r1 * Math.cos(a),
    y1: 100 + r1 * Math.sin(a),
    x2: 100 + 87 * Math.cos(a),
    y2: 100 + 87 * Math.sin(a),
  };
});

// A clock that ticks once a minute, for the evening palette and "today". The server
// snapshot is null, so the first paint uses the daytime palette and fills in after hydration.
const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};
const minuteSnapshot = () => Math.floor(Date.now() / 60_000);
const minuteServerSnapshot = () => null;

function lastSevenDateKeys(now: Date): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    keys.push(localDateKey(d));
  }
  return keys;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · ${d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

function scoreWord(score: number) {
  if (score >= 80) return "Solid";
  if (score >= 50) return "Partial";
  return "Needs work";
}

function FeedbackView({ topic, feedback, note }: { topic: string; feedback: RecallFeedback | null; note?: string }) {
  if (!feedback) {
    return (
      <div className="ft-feedback">
        <div className="ft-feedback-head">
          <strong>{topic}</strong>
        </div>
        <p className="ft-muted">
          {note ? "Couldn't check this one right now. Your note is saved and the topic will come back for review tomorrow." : "Saved. Add what you remember next time to get feedback."}
        </p>
      </div>
    );
  }
  const band = feedback.score >= 80 ? "good" : feedback.score >= 50 ? "mid" : "low";
  return (
    <div className="ft-feedback">
      <div className="ft-feedback-head">
        <strong>{topic}</strong>
        <span className={`ft-score ft-score--${band}`}>
          {feedback.score} · {scoreWord(feedback.score)}
        </span>
      </div>
      <p className="ft-verdict">{feedback.verdict}</p>
      {feedback.correct.length > 0 && (
        <div className="ft-fb-group">
          <div className="ft-label">Got right</div>
          <ul>
            {feedback.correct.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.missed.length > 0 && (
        <div className="ft-fb-group">
          <div className="ft-label">Missed</div>
          <ul>
            {feedback.missed.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.incorrect.length > 0 && (
        <div className="ft-fb-group ft-fb-group--fix">
          <div className="ft-label">Correct this</div>
          <ul>
            {feedback.incorrect.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FocusTimer({ initial, fontClassName }: { initial: FocusData; fontClassName: string }) {
  const settings = useSyncExternalStore(subscribeFocusSettings, getFocusSettings, getServerFocusSettings);
  const minute = useSyncExternalStore(subscribeMinute, minuteSnapshot, minuteServerSnapshot);

  const [mode, setMode] = useState<Mode>("focus");
  const [timer, setTimer] = useState<TimerState>({ status: "idle" });
  const [tick, setTick] = useState(0);
  const [breathStart, setBreathStart] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [sound, setSound] = useState<AmbientSound>("off");
  const [tray, setTray] = useState<TrayTab | null>(null);
  const [sessions, setSessions] = useState(initial.sessions);
  const [recalls, setRecalls] = useState(initial.recalls);
  const [due, setDue] = useState(initial.due);
  const [recallSheet, setRecallSheet] = useState<RecallSheet | null>(null);
  const [reviewSheet, setReviewSheet] = useState<ReviewSheet | null>(null);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);
  const itemKey = useRef(1);

  const courses = initial.courses;
  const subject = courses.find((c) => c.id === settings.subjectId) ?? null;
  const set = (patch: Partial<FocusSettings>) => updateFocusSettings(patch);

  // Derived timer values.
  const idleTotal = settings[mode] * 60;
  const total = timer.status === "idle" ? idleTotal : timer.total;
  const left = timer.status === "running" ? Math.max(0, (timer.endAt - tick) / 1000) : timer.status === "paused" ? timer.left : idleTotal;
  const frac = total > 0 ? left / total : 0;
  const running = timer.status === "running";
  const resting = mode !== "focus";

  const now = minute === null ? null : new Date(minute * 60_000);
  const evening = settings.evening && now !== null && isEveningHour(now.getHours());
  const todayKey = now ? localDateKey(now) : null;
  const todayCount = todayKey ? sessions.filter((s) => s.dateKey === todayKey).length : 0;

  const week = useMemo(() => {
    if (!now) return null;
    const keys = lastSevenDateKeys(now);
    const byDay = keys.map((k) => sessions.filter((s) => s.dateKey === k).reduce((a, s) => a + s.minutes, 0));
    const bySubject = new Map<string, number>();
    sessions
      .filter((s) => keys.includes(s.dateKey))
      .forEach((s) => bySubject.set(s.subjectLabel, (bySubject.get(s.subjectLabel) ?? 0) + s.minutes));
    return {
      keys,
      byDay,
      total: byDay.reduce((a, b) => a + b, 0),
      subjects: [...bySubject.entries()].sort((a, b) => b[1] - a[1]),
    };
    // `now` changes once a minute, which is plenty for day buckets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, minute]);

  // Dial geometry: the remaining arc runs from the moving dot clockwise back to 12 o'clock.
  const angle = (1 - frac) * 2 * Math.PI - Math.PI / 2;
  const dotX = 100 + R * Math.cos(angle);
  const dotY = 100 + R * Math.sin(angle);

  // Glow drifts across a focus block: sage to dusk blue by day, red to crimson in the evening.
  const p = 1 - frac;
  const glow = resting
    ? evening
      ? "hsla(12,55%,38%,.18)"
      : "hsla(40,40%,55%,.2)"
    : evening
      ? `hsla(${2 - 20 * p},${60 - 8 * p}%,${38 - 6 * p}%,${0.22 + 0.08 * p})`
      : `hsla(${160 + 65 * p},${35 - 8 * p}%,${46 - 6 * p}%,${0.18 + 0.08 * p})`;

  const inhale = running && resting ? (tick - breathStart) % 8000 < 4000 : true;
  const subLine = resting ? (running ? (inhale ? "Breathe in" : "Breathe out") : "Rest your eyes") : settings.task || subject?.short || "General";

  // ---------- timer control ----------

  async function lockScreen() {
    try {
      wakeRef.current = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {
      wakeRef.current = null;
    }
  }

  function releaseScreen() {
    void wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }

  function start() {
    unlockAudio();
    const t = nowMs();
    const remaining = timer.status === "paused" ? timer.left : idleTotal;
    const blockTotal = timer.status === "paused" ? timer.total : idleTotal;
    setTimer({ status: "running", endAt: t + remaining * 1000, total: blockTotal });
    setTick(t);
    if (timer.status !== "paused") setBreathStart(t);
    setBanner(null);
    void lockScreen();
  }

  function pause() {
    if (timer.status !== "running") return;
    setTimer({ status: "paused", left: Math.max(0, (timer.endAt - nowMs()) / 1000), total: timer.total });
    releaseScreen();
  }

  function switchMode(m: Mode) {
    setMode(m);
    setTimer({ status: "idle" });
    setBanner(null);
    releaseScreen();
  }

  function skip() {
    // Skipping never saves a block: only a focus block that actually ran out counts.
    if (mode === "focus") {
      const next = cycle + 1;
      setCycle(next);
      switchMode(next % 4 === 0 ? "long" : "short");
    } else {
      switchMode("focus");
    }
  }

  function notify(title: string, body: string) {
    if (!settings.notify || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (!document.hidden) return;
    try {
      new Notification(title, { body, tag: "limbic-focus" });
    } catch {
      // Some mobile browsers only allow notifications from a service worker.
    }
  }

  const finishBlock = useEffectEvent((endedAt: number, late: boolean) => {
    const endedMode = mode;
    const minutes = Math.round(total / 60);
    setTimer({ status: "idle" });
    releaseScreen();
    if (settings.chime) playChime();
    const at = new Date(endedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

    if (endedMode === "focus") {
      const nextCycle = cycle + 1;
      setCycle(nextCycle);
      const next: Mode = nextCycle % 4 === 0 ? "long" : "short";
      setMode(next);
      setBanner({ text: late ? `Focus block ended at ${at} while you were away` : "Focus block done", action: "start" });
      notify("Focus block done", `Time for a ${MODE_LABEL[next].toLowerCase()}.`);
      void saveFocusBlock({
        syllabusId: subject?.id ?? null,
        task: settings.task,
        minutes,
        dateKey: localDateKey(new Date(endedAt)),
      }).then((res) => {
        if ("error" in res) {
          setBanner({ text: res.error, action: "start" });
          return;
        }
        setSessions((s) => [...s, res.session]);
        if (settings.recall) {
          setTray(null);
          setRecallSheet({
            session: res.session,
            items: [{ key: itemKey.current++, topic: "", note: "" }],
            status: "editing",
            results: [],
            error: null,
          });
        }
      });
    } else {
      setMode("focus");
      setBanner({ text: late ? `Break ended at ${at} while you were away` : "Break's over", action: "start" });
      notify("Break's over", "Ready for the next focus block?");
    }
  });

  useEffect(() => {
    if (timer.status !== "running") return;
    const endAt = timer.endAt;
    const id = window.setInterval(() => {
      const t = nowMs();
      setTick(t);
      if (t >= endAt) {
        window.clearInterval(id);
        finishBlock(endAt, t - endAt > 4000 || document.hidden);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [timer]);

  // Tab title: the countdown while running, a gentle flash when a block has ended.
  useEffect(() => {
    if (running) {
      document.title = `${formatClock(left)} · ${MODE_LABEL[mode]}`;
      return;
    }
    if (!banner) {
      document.title = "Focus · Limbic";
      return;
    }
    let on = false;
    const id = window.setInterval(() => {
      on = !on;
      document.title = on ? "Time's up · Limbic" : banner.text;
    }, 1200);
    return () => window.clearInterval(id);
  }, [running, left, mode, banner]);

  const onVisible = useEffectEvent(() => {
    if (document.visibilityState !== "visible") return;
    if (timer.status === "running") {
      setTick(nowMs());
      void lockScreen();
    }
  });
  useEffect(() => {
    const handler = () => onVisible();
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  function toggleMinimal() {
    const on = !settings.minimal;
    set({ minimal: on });
    if (on) {
      setTray(null);
      pageRef.current?.requestFullscreen?.().catch(() => {});
    } else if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
    if (e.key === "Escape") {
      if (recallSheet && recallSheet.status !== "checking") setRecallSheet(null);
      else if (reviewSheet && reviewSheet.status !== "checking") setReviewSheet(null);
      else setTray(null);
      return;
    }
    if (recallSheet || reviewSheet) return;
    if (e.code === "Space") {
      e.preventDefault();
      if (running) pause();
      else start();
    } else if (e.key === "m" || e.key === "M") {
      toggleMinimal();
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ---------- settings ----------

  async function toggleNotify() {
    setNotifyError(null);
    if (settings.notify) {
      set({ notify: false });
      return;
    }
    if (typeof Notification === "undefined") {
      setNotifyError("This browser doesn't support notifications.");
      return;
    }
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission === "granted") set({ notify: true });
    else setNotifyError("Notifications are blocked for this site. Allow them in your browser's site settings, then try again.");
  }

  function changeNumber(key: keyof typeof LIMITS, raw: string) {
    const v = Math.min(LIMITS[key], Math.max(1, parseInt(raw, 10) || settings[key]));
    set({ [key]: v } as Partial<FocusSettings>);
  }

  function chooseSound(s: AmbientSound) {
    setSound(s);
    setAmbientVolume(settings.volume);
    playAmbient(s);
  }

  // ---------- recall ----------

  function updateItem(key: number, patch: Partial<{ topic: string; note: string }>) {
    setRecallSheet((sheet) => (sheet ? { ...sheet, items: sheet.items.map((i) => (i.key === key ? { ...i, ...patch } : i)) } : sheet));
  }

  async function submitRecall(e: FormEvent) {
    e.preventDefault();
    if (!recallSheet) return;
    const items = recallSheet.items.map((i) => ({ topic: i.topic.trim(), note: i.note.trim() })).filter((i) => i.topic);
    if (items.length === 0) {
      setRecallSheet({ ...recallSheet, error: "Name at least one topic, or skip." });
      return;
    }
    const sessionId = recallSheet.session.id;
    setRecallSheet({ ...recallSheet, status: "checking", error: null });
    // The break starts now; feedback arrives while it runs.
    if (timer.status === "idle" && mode !== "focus") start();
    const res = await submitRecalls({ sessionId, items });
    if ("error" in res) {
      setRecallSheet((s) => (s ? { ...s, status: "editing", error: res.error } : s));
      return;
    }
    setRecalls((r) => [...res.recalls, ...r].slice(0, 30));
    setRecallSheet((s) => (s ? { ...s, status: "done", results: res.recalls } : s));
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    if (!reviewSheet || !reviewSheet.note.trim()) {
      if (reviewSheet) setReviewSheet({ ...reviewSheet, error: "Write what you remember first." });
      return;
    }
    const { item, note } = reviewSheet;
    setReviewSheet({ ...reviewSheet, status: "checking", error: null });
    const res = await reviewRecall({ recallId: item.id, note });
    if ("error" in res) {
      setReviewSheet((s) => (s ? { ...s, status: "editing", error: res.error } : s));
      return;
    }
    setDue((d) => d.filter((x) => x.id !== item.id));
    setRecalls((r) => [res.recall, ...r.filter((x) => x.id !== item.id)].slice(0, 30));
    setReviewSheet((s) => (s ? { ...s, status: "done", result: res.recall } : s));
  }

  async function removeTopic(id: string) {
    const res = await deleteRecall(id);
    if ("error" in res) return;
    setDue((d) => d.filter((x) => x.id !== id));
    setRecalls((r) => r.filter((x) => x.id !== id));
  }

  // ---------- render ----------

  const pageClass = [
    "ft-page",
    fontClassName,
    evening ? "ft-evening" : "",
    resting ? "ft-resting" : "",
    running ? "ft-running" : "",
    settings.minimal ? "ft-minimal" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const soundLabel = AMBIENT_SOUNDS.find((s) => s.id === sound)?.label ?? "Off";
  const startLabel = running ? "Pause" : timer.status === "paused" ? "Resume" : "Start";

  return (
    <div ref={pageRef} className={pageClass} style={{ "--ft-glow": glow } as CSSProperties}>
      <div className="ft-atmo" aria-hidden="true">
        <i className="ft-blob ft-blob--a" />
        <i className="ft-blob ft-blob--b" />
      </div>
      <div className="ft-grain" aria-hidden="true" />

      <div className="ft-wrap">
        <header className="ft-header ft-hide-min">
          <div>
            <Link href="/student" className="ft-back">
              ← Atrium
            </Link>
            <h1 className="ft-title">Focus</h1>
          </div>
          <div className="ft-head-right">
            <div className="ft-goal" title="Focus blocks finished today">
              <svg viewBox="0 0 30 30" aria-hidden="true">
                <circle className="ft-goal-track" cx="15" cy="15" r={GOAL_R} />
                <circle
                  className="ft-goal-prog"
                  cx="15"
                  cy="15"
                  r={GOAL_R}
                  style={{ strokeDasharray: GOAL_CIRC, strokeDashoffset: GOAL_CIRC * (1 - Math.min(1, todayCount / settings.goal)) }}
                />
              </svg>
              <span>
                <b>{todayCount}</b> / {settings.goal} today
              </span>
            </div>
            <button type="button" className="ft-pill-btn" onClick={toggleMinimal}>
              Minimal
            </button>
          </div>
        </header>

        {banner && (
          <div className="ft-banner" role="status">
            <span>{banner.text}</span>
            {banner.action === "start" && (
              <button type="button" onClick={start}>
                Start {MODE_LABEL[mode].toLowerCase()}
              </button>
            )}
          </div>
        )}

        <div className="ft-modes ft-hide-min" role="group" aria-label="Timer mode">
          {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchMode(m)}>
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        <div className="ft-dial">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="ft-arc-grad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" className="ft-stop-a" />
                <stop offset="1" className="ft-stop-b" />
              </linearGradient>
              <filter id="ft-soft" x="-2" y="-2" width="5" height="5">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            <circle className="ft-breath" cx="100" cy="100" r="76" />
            <g>
              {TICKS.map((t, i) => (
                <line key={i} className={t.major ? "ft-tick ft-tick--major" : "ft-tick"} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
              ))}
            </g>
            <g className="ft-rot">
              <circle className="ft-track" cx="100" cy="100" r={R} />
              <circle
                className="ft-arc"
                cx="100"
                cy="100"
                r={R}
                style={{ strokeDasharray: `${(CIRC * frac).toFixed(2)} ${CIRC}`, strokeDashoffset: (-CIRC * (1 - frac)).toFixed(2) }}
              />
            </g>
            <circle className="ft-dot-halo" r="7" cx={dotX} cy={dotY} filter="url(#ft-soft)" />
            <circle className="ft-dot" r="3.2" cx={dotX} cy={dotY} />
          </svg>
          <div className="ft-readout">
            <div className="ft-time" aria-live="off">
              {formatClock(left)}
            </div>
            <div className="ft-phase">{mode === "focus" ? `Focus · ${(cycle % 4) + 1} of 4` : MODE_LABEL[mode]}</div>
            <div className={inhale ? "ft-sub" : "ft-sub ft-sub--fade"}>{subLine}</div>
          </div>
        </div>

        <div className="ft-study ft-hide-min">
          <div className="ft-chips" role="group" aria-label="Course">
            <button type="button" className="ft-chip" aria-pressed={subject === null} onClick={() => set({ subjectId: null })}>
              General
            </button>
            {courses.map((c) => (
              <button key={c.id} type="button" className="ft-chip" aria-pressed={subject?.id === c.id} title={c.label} onClick={() => set({ subjectId: c.id })}>
                {c.short}
              </button>
            ))}
          </div>
          {courses.length === 0 && (
            <p className="ft-hint">
              Add your courses in <Link href="/student/assignments">Assignments</Link> to tag blocks and build a Self-Quiz deck from your recall.
            </p>
          )}
          <input
            id="ft-task"
            className="ft-task"
            type="text"
            maxLength={80}
            placeholder="What are you studying? e.g. Brachial plexus"
            aria-label="What you're studying"
            value={settings.task}
            onChange={(e) => set({ task: e.target.value })}
          />
        </div>

        <div className="ft-controls">
          <button type="button" className="ft-btn" onClick={() => switchMode(mode)}>
            Reset
          </button>
          <button type="button" className="ft-btn ft-btn--primary" onClick={running ? pause : start}>
            {startLabel}
          </button>
          <button type="button" className="ft-btn" onClick={skip}>
            Skip
          </button>
        </div>

        <nav className="ft-tray-tabs ft-hide-min" aria-label="Focus tools">
          <button type="button" onClick={() => setTray("review")}>
            Review<em className={due.length ? "ft-due" : undefined}>{due.length}</em>
          </button>
          <button type="button" onClick={() => setTray("sound")}>
            Sound<em>{soundLabel.toLowerCase()}</em>
          </button>
          <button type="button" onClick={() => setTray("week")}>
            This week<em>{week ? formatMinutes(week.total) : "–"}</em>
          </button>
          <button type="button" onClick={() => setTray("notes")}>
            Notes<em>{recalls.length}</em>
          </button>
          <button type="button" onClick={() => setTray("settings")}>
            Settings
          </button>
        </nav>

        {settings.minimal && (
          <button type="button" className="ft-pill-btn ft-exit-min" onClick={toggleMinimal}>
            Exit minimal
          </button>
        )}
      </div>

      {/* Tray */}
      <div className={tray ? "ft-tray-scrim ft-open" : "ft-tray-scrim"} onClick={() => setTray(null)} />
      <section className={tray ? "ft-tray ft-open" : "ft-tray"} aria-label="Focus tools" aria-hidden={!tray}>
        <div className="ft-handle" />
        <div className="ft-tray-head">
          <div className="ft-seg" role="tablist">
            {(
              [
                ["review", "Review"],
                ["sound", "Sound"],
                ["week", "This week"],
                ["notes", "Notes"],
                ["settings", "Settings"],
              ] as [TrayTab, string][]
            ).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tray === id} onClick={() => setTray(id)}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="ft-close" onClick={() => setTray(null)}>
            Done
          </button>
        </div>

        {tray === "review" && (
          <div className="ft-pane">
            {due.length === 0 ? (
              <p className="ft-empty">
                Nothing due. Topics you recall after a focus block come back here 1, 3, 7 and more days later, sooner if you struggled with them.
              </p>
            ) : (
              <>
                <p className="ft-muted">Write each topic from memory again. Strong recalls come back less often.</p>
                <div className="ft-review-list">
                  {due.map((d) => (
                    <div key={d.id} className="ft-review-row">
                      <div>
                        <div className="ft-review-topic">{d.topic}</div>
                        <div className="ft-meta">
                          {d.subjectLabel}
                          {d.score !== null ? ` · last ${d.score}` : ""}
                        </div>
                      </div>
                      <div className="ft-row-actions">
                        <button type="button" className="ft-link-btn" onClick={() => removeTopic(d.id)}>
                          Remove
                        </button>
                        <button
                          type="button"
                          className="ft-btn ft-btn--small"
                          onClick={() => {
                            setTray(null);
                            setReviewSheet({ item: d, note: "", status: "editing", result: null, error: null });
                          }}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tray === "sound" && (
          <div className="ft-pane">
            <div className="ft-chips ft-chips--left" role="group" aria-label="Ambient sound">
              {AMBIENT_SOUNDS.map((s) => (
                <button key={s.id} type="button" className="ft-chip" aria-pressed={sound === s.id} onClick={() => chooseSound(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <label className="ft-volume" htmlFor="ft-volume">
              <span>Volume</span>
              <input
                id="ft-volume"
                type="range"
                min={0}
                max={100}
                value={settings.volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  set({ volume: v });
                  setAmbientVolume(v);
                }}
              />
            </label>
            <button type="button" className="ft-switch" aria-pressed={settings.chime} onClick={() => set({ chime: !settings.chime })}>
              <span className="ft-pip" />
              Chime at the end of each block
            </button>
          </div>
        )}

        {tray === "week" && (
          <div className="ft-pane">
            {!week || week.total === 0 ? (
              <p className="ft-empty">Finished focus blocks from the last 7 days show up here, by day and by course.</p>
            ) : (
              <>
                <div className="ft-stat-line">
                  <span className="ft-label">Last 7 days</span>
                  <strong>{formatMinutes(week.total)}</strong>
                </div>
                <div className="ft-week">
                  {week.byDay.map((m, i) => {
                    const max = Math.max(...week.byDay, 1);
                    const [y, mo, d] = week.keys[i].split("-").map(Number);
                    const day = "SMTWTFS"[new Date(y, mo - 1, d).getDay()];
                    return (
                      <div key={week.keys[i]} title={formatMinutes(m)}>
                        <i style={{ height: `${Math.max(2, (m / max) * 58)}px` }} />
                        <span className={i === 6 ? "ft-today" : undefined}>{day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="ft-label">By course</div>
                <div className="ft-bars">
                  {week.subjects.map(([label, m]) => (
                    <div key={label} className="ft-bar-row">
                      <span className="ft-bar-name" title={label}>
                        {label}
                      </span>
                      <span className="ft-bar-track">
                        <span className="ft-bar-fill" style={{ width: `${(m / week.subjects[0][1]) * 100}%` }} />
                      </span>
                      <span className="ft-bar-val">{formatMinutes(m)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tray === "notes" && (
          <div className="ft-pane">
            {recalls.length === 0 ? (
              <p className="ft-empty">What you recall after each focus block, and Claude&rsquo;s feedback on it, is kept here.</p>
            ) : (
              <div className="ft-notes">
                {recalls.map((r) => (
                  <div key={r.id} className="ft-note">
                    <div className="ft-meta">
                      {formatWhen(r.createdAt)} · {r.subjectLabel}
                      {r.score !== null ? ` · ${r.score}` : ""}
                    </div>
                    <div className="ft-note-topic">{r.topic}</div>
                    {r.note && <p className="ft-note-body">{r.note}</p>}
                    {r.feedback && r.feedback.keyPoints.length > 0 && (
                      <ul className="ft-keypoints">
                        {r.feedback.keyPoints.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tray === "settings" && (
          <div className="ft-pane">
            <div className="ft-chips ft-chips--left" role="group" aria-label="Presets">
              {PRESETS.map((pr) => (
                <button
                  key={pr.label}
                  type="button"
                  className="ft-chip"
                  aria-pressed={settings.focus === pr.focus && settings.short === pr.short && settings.long === pr.long}
                  onClick={() => set({ focus: pr.focus, short: pr.short, long: pr.long })}
                >
                  {pr.label}
                </button>
              ))}
            </div>
            <div className="ft-fields">
              {(
                [
                  ["focus", "Focus"],
                  ["short", "Short"],
                  ["long", "Long"],
                  ["goal", "Daily goal"],
                ] as [keyof typeof LIMITS, string][]
              ).map(([key, label]) => (
                <label key={key} htmlFor={`ft-f-${key}`}>
                  {label}
                  <input
                    id={`ft-f-${key}`}
                    key={`${key}-${settings[key]}`}
                    type="number"
                    min={1}
                    max={LIMITS[key]}
                    defaultValue={settings[key]}
                    onBlur={(e) => changeNumber(key, e.target.value)}
                  />
                </label>
              ))}
            </div>
            <div className="ft-switches">
              <button type="button" className="ft-switch" aria-pressed={settings.recall} onClick={() => set({ recall: !settings.recall })}>
                <span className="ft-pip" />
                Recall prompt after each focus block
              </button>
              <button type="button" className="ft-switch" aria-pressed={settings.evening} onClick={() => set({ evening: !settings.evening })}>
                <span className="ft-pip" />
                Warm red colors from 7 pm to 6 am
              </button>
              <button type="button" className="ft-switch" aria-pressed={settings.notify} onClick={toggleNotify}>
                <span className="ft-pip" />
                Notify me when a block ends in another tab
              </button>
              {notifyError && <p className="ft-error">{notifyError}</p>}
            </div>
            <p className="ft-hint">Space starts or pauses · M toggles minimal mode · Every 4th break is a long one. These settings are saved in this browser.</p>
          </div>
        )}
      </section>

      {/* Recall after a focus block */}
      {recallSheet && (
        <div className="ft-scrim">
          <form className="ft-sheet" onSubmit={submitRecall} aria-labelledby="ft-recall-h">
            {recallSheet.status === "done" ? (
              <>
                <h2 id="ft-recall-h">How your recall held up</h2>
                <p className="ft-sheet-sub">
                  {recallSheet.results.some((r) => r.feedback) && recallSheet.session.subjectLabel !== "General"
                    ? `Checked topics were added to your ${recallSheet.session.subjectLabel} Self-Quiz deck. `
                    : ""}
                  Each topic comes back for review in the Review tab.
                </p>
                {recallSheet.results.map((r) => (
                  <FeedbackView key={r.id} topic={r.topic} feedback={r.feedback} note={r.note} />
                ))}
                <div className="ft-sheet-actions ft-sheet-actions--end">
                  <button type="button" className="ft-btn ft-btn--primary" onClick={() => setRecallSheet(null)}>
                    Back to my break
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="ft-recall-h">Before the break: what stuck?</h2>
                <p className="ft-sheet-sub">
                  You just finished {recallSheet.session.minutes} minutes of {recallSheet.session.subjectLabel}. Name 1 to 3 topics and write what you remember,
                  without looking at your notes. Claude will check it.
                </p>
                {recallSheet.items.map((item, i) => (
                  <div key={item.key} className="ft-topic">
                    <div className="ft-topic-head">
                      <span className="ft-label">Topic {i + 1}</span>
                      {i > 0 && recallSheet.status === "editing" && (
                        <button
                          type="button"
                          className="ft-link-btn"
                          onClick={() => setRecallSheet({ ...recallSheet, items: recallSheet.items.filter((x) => x.key !== item.key) })}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      id={`ft-topic-${item.key}`}
                      type="text"
                      maxLength={80}
                      placeholder={i === 0 && settings.task ? settings.task : "e.g. Brachial plexus"}
                      aria-label={`Topic ${i + 1}`}
                      value={item.topic}
                      disabled={recallSheet.status === "checking"}
                      autoFocus={i === recallSheet.items.length - 1}
                      onChange={(e) => updateItem(item.key, { topic: e.target.value })}
                    />
                    <textarea
                      id={`ft-note-${item.key}`}
                      maxLength={1500}
                      placeholder="What do you remember about it?"
                      aria-label={`What you remember about topic ${i + 1}`}
                      value={item.note}
                      disabled={recallSheet.status === "checking"}
                      onChange={(e) => updateItem(item.key, { note: e.target.value })}
                    />
                  </div>
                ))}
                {recallSheet.items.length < 3 && recallSheet.status === "editing" && (
                  <button
                    type="button"
                    className="ft-link-btn ft-add-topic"
                    onClick={() => setRecallSheet({ ...recallSheet, items: [...recallSheet.items, { key: itemKey.current++, topic: "", note: "" }] })}
                  >
                    + Add another topic
                  </button>
                )}
                {recallSheet.error && <p className="ft-error">{recallSheet.error}</p>}
                <div className="ft-sheet-actions">
                  <button type="button" className="ft-btn" disabled={recallSheet.status === "checking"} onClick={() => setRecallSheet(null)}>
                    Skip
                  </button>
                  <button type="submit" className="ft-btn ft-btn--primary" disabled={recallSheet.status === "checking"}>
                    {recallSheet.status === "checking" ? "Checking your recall…" : "Save and start break"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* Spaced review of one topic */}
      {reviewSheet && (
        <div className="ft-scrim">
          <form className="ft-sheet" onSubmit={submitReview} aria-labelledby="ft-review-h">
            <h2 id="ft-review-h">{reviewSheet.item.topic}</h2>
            <p className="ft-sheet-sub">
              {reviewSheet.item.subjectLabel}
              {reviewSheet.status === "done" ? "" : ". Write everything you remember about this topic, without notes."}
            </p>
            {reviewSheet.status === "done" && reviewSheet.result ? (
              <>
                <FeedbackView topic={reviewSheet.result.topic} feedback={reviewSheet.result.feedback} note={reviewSheet.result.note} />
                {reviewSheet.result.nextReviewAt && (
                  <p className="ft-muted">Next review: {new Date(reviewSheet.result.nextReviewAt).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}.</p>
                )}
                <div className="ft-sheet-actions ft-sheet-actions--end">
                  <button
                    type="button"
                    className="ft-btn ft-btn--primary"
                    onClick={() => {
                      setReviewSheet(null);
                      if (due.length > 0) setTray("review");
                    }}
                  >
                    {due.length > 0 ? `Next topic (${due.length} left)` : "Done"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <textarea
                  id="ft-review-note"
                  className="ft-review-note"
                  maxLength={1500}
                  placeholder="What do you remember?"
                  aria-label="What you remember"
                  value={reviewSheet.note}
                  autoFocus
                  disabled={reviewSheet.status === "checking"}
                  onChange={(e) => setReviewSheet({ ...reviewSheet, note: e.target.value })}
                />
                {reviewSheet.error && <p className="ft-error">{reviewSheet.error}</p>}
                <div className="ft-sheet-actions">
                  <button type="button" className="ft-btn" disabled={reviewSheet.status === "checking"} onClick={() => setReviewSheet(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="ft-btn ft-btn--primary" disabled={reviewSheet.status === "checking"}>
                    {reviewSheet.status === "checking" ? "Checking…" : "Check my recall"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
