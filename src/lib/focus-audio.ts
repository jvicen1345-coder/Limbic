/**
 * Generated ambient sound and the end-of-block chime for the Focus timer (see
 * components/student/FocusTimer.tsx). Everything is synthesized with the Web Audio API, so
 * there are no audio files to host or license. Browsers only allow sound after the reader
 * interacts with the page, so every entry point here is called from a click or key handler.
 *
 * Kept outside the component on purpose: it holds long-lived audio nodes and timers that
 * belong to the page, not to any one render.
 */

export type AmbientSound = "off" | "rain" | "ocean" | "brown" | "cafe" | "lofi";

export const AMBIENT_SOUNDS: { id: AmbientSound; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "rain", label: "Rain" },
  { id: "ocean", label: "Ocean" },
  { id: "brown", label: "Brown noise" },
  { id: "cafe", label: "Café" },
  { id: "lofi", label: "Lo-fi hum" },
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: { out: GainNode; stop: () => void } | null = null;
let volume = 0.6;

function gainFor(v: number) {
  // A gentle curve so the lower half of the slider stays usable for quiet background sound.
  return Math.pow(Math.max(0, Math.min(1, v)), 1.6);
}

/** Creates or resumes the audio context. Must run inside a user gesture the first time. */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = gainFor(volume);
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setAmbientVolume(percent: number): void {
  volume = percent / 100;
  if (ctx && master) master.gain.setTargetAtTime(gainFor(volume), ctx.currentTime, 0.05);
}

export function playChime(): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.28);
    g.gain.linearRampToValueAtTime(0.12, t + i * 0.28 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.28 + 2.4);
    o.connect(g).connect(ctx!.destination);
    o.start(t + i * 0.28);
    o.stop(t + i * 0.28 + 2.5);
  });
}

type NoiseKind = "white" | "pink" | "brown" | "crackle";

function noise(c: AudioContext, kind: NoiseKind, seconds = 6): AudioBufferSourceNode {
  const len = c.sampleRate * seconds;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "brown") {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else if (kind === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else if (kind === "crackle") {
        d[i] = Math.random() < 0.0006 ? Math.random() * 2 - 1 : 0;
      } else {
        d[i] = w;
      }
    }
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function filter(c: AudioContext, type: BiquadFilterType, frequency: number, q?: number) {
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  if (q !== undefined) f.Q.value = q;
  return f;
}

function gain(c: AudioContext, value: number) {
  const g = c.createGain();
  g.gain.value = value;
  return g;
}

const BUILDERS: Record<Exclude<AmbientSound, "off">, (c: AudioContext, out: GainNode) => () => void> = {
  rain(c, out) {
    const a = noise(c, "brown");
    const b = noise(c, "white");
    a.connect(filter(c, "lowpass", 1400)).connect(out);
    b.connect(filter(c, "highpass", 3000)).connect(gain(c, 0.05)).connect(out);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  },
  ocean(c, out) {
    const n = noise(c, "pink", 8);
    const lp = filter(c, "lowpass", 700);
    const g = gain(c, 0.9);
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.075;
    lfo.connect(gain(c, 0.75)).connect(g.gain);
    lfo.connect(gain(c, 450)).connect(lp.frequency);
    n.connect(lp).connect(g).connect(out);
    n.start();
    lfo.start();
    return () => {
      n.stop();
      lfo.stop();
    };
  },
  brown(c, out) {
    const n = noise(c, "brown");
    n.connect(filter(c, "lowpass", 500)).connect(gain(c, 1.3)).connect(out);
    n.start();
    return () => n.stop();
  },
  cafe(c, out) {
    const n = noise(c, "pink", 8);
    const bp = filter(c, "bandpass", 650, 0.8);
    const g = gain(c, 1.4);
    n.connect(bp).connect(g).connect(out);
    n.start();
    const murmur = window.setInterval(() => {
      g.gain.setTargetAtTime(1 + Math.random() * 0.9, c.currentTime, 0.25);
      bp.frequency.setTargetAtTime(500 + Math.random() * 400, c.currentTime, 0.4);
    }, 450);
    const clinks = window.setInterval(() => {
      if (Math.random() > 0.35) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const cg = c.createGain();
      o.type = "sine";
      o.frequency.value = 2200 + Math.random() * 1600;
      cg.gain.setValueAtTime(0, t);
      cg.gain.linearRampToValueAtTime(0.025, t + 0.005);
      cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      o.connect(cg).connect(out);
      o.start(t);
      o.stop(t + 0.7);
    }, 1100);
    return () => {
      n.stop();
      window.clearInterval(murmur);
      window.clearInterval(clinks);
    };
  },
  lofi(c, out) {
    const chords = [
      [174.61, 220, 261.63, 329.63],
      [164.81, 196, 246.94, 293.66],
      [146.83, 174.61, 220, 261.63],
      [155.56, 196, 233.08, 293.66],
    ];
    const lp = filter(c, "lowpass", 1100);
    const pad = gain(c, 0.5);
    const trem = c.createOscillator();
    trem.frequency.value = 0.18;
    trem.connect(gain(c, 0.12)).connect(pad.gain);
    lp.connect(pad).connect(out);
    const oscs: OscillatorNode[] = [];
    chords[0].forEach((f) =>
      [-4, 4].forEach((dt) => {
        const o = c.createOscillator();
        o.type = "triangle";
        o.frequency.value = f;
        o.detune.value = dt;
        o.connect(gain(c, 0.045)).connect(lp);
        o.start();
        oscs.push(o);
      })
    );
    let ci = 0;
    const change = window.setInterval(() => {
      ci = (ci + 1) % chords.length;
      oscs.forEach((o, i) => o.frequency.setTargetAtTime(chords[ci][i >> 1], c.currentTime, 0.8));
    }, 8000);
    const crackle = noise(c, "crackle", 5);
    const hiss = noise(c, "white", 3);
    crackle.connect(filter(c, "highpass", 1800)).connect(gain(c, 0.35)).connect(out);
    hiss.connect(gain(c, 0.006)).connect(out);
    crackle.start();
    hiss.start();
    trem.start();
    return () => {
      oscs.forEach((o) => o.stop());
      crackle.stop();
      hiss.stop();
      trem.stop();
      window.clearInterval(change);
    };
  },
};

/** Cross-fades to the chosen ambient sound, or fades out for "off". */
export function playAmbient(sound: AmbientSound): void {
  unlockAudio();
  if (!ctx || !master) return;
  if (current) {
    const { out, stop } = current;
    out.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    window.setTimeout(() => {
      try {
        stop();
      } catch {
        // Already stopped.
      }
      out.disconnect();
    }, 1200);
    current = null;
  }
  if (sound === "off") return;
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(master);
  const stop = BUILDERS[sound](ctx, out);
  out.gain.setTargetAtTime(1, ctx.currentTime, 0.5);
  current = { out, stop };
}
