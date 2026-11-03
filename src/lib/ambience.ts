/*
 * Optional background score, synthesised live with WebAudio (no audio files): a slow analogue
 * synth pad in A minor with a low drone, a sparse music-box motif echoing through tape delay,
 * tape hiss with wow & flutter, and now and then a faint shortwave "numbers station" in Morse.
 * Off by default. The choice is remembered in this browser; browsers only allow audio after a
 * user gesture, so a remembered "on" resumes on the first click or key press.
 */

const KEY = 'nya-music';
const listeners = new Set<() => void>();
let enabled = read();
let engine: Engine | null = null;

function read(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export const midiToFreq = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** i – VI – iv – V in A minor (Am, Fmaj7, Dm9, E7sus→E7): MIDI notes, root first. */
export const CHORDS: number[][] = [
  [45, 57, 60, 64, 69],
  [41, 57, 60, 64, 65],
  [38, 57, 62, 65, 69],
  [40, 56, 59, 62, 64],
];
/** A harmonic minor, two octaves up: the music-box notes. */
export const MOTIF = [69, 71, 72, 74, 76, 77, 80, 81, 84];
const CHORD_SECONDS = 9;

export const ambience = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  isOn: () => enabled,
  set(on: boolean) {
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? '1' : '0');
    } catch {
      /* storage blocked: keep the in-memory choice */
    }
    listeners.forEach((l) => l());
    if (on) start();
    else stop();
  },
  /** Called once at startup: a remembered "on" starts with the first user gesture. */
  resumeOnGesture() {
    if (!enabled || typeof window === 'undefined') return;
    const go = () => {
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('keydown', go);
      if (enabled) start();
    };
    window.addEventListener('pointerdown', go, { once: true });
    window.addEventListener('keydown', go, { once: true });
  },
};

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  timers: number[];
}

function start() {
  if (engine || typeof window === 'undefined' || !window.AudioContext) return;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 4);
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);

  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 4.5);
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  reverb.connect(wet).connect(master);

  // Tape delay for the music box: echoes that darken as they repeat.
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.48;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2200;
  delay.connect(tone).connect(feedback).connect(delay);
  tone.connect(reverb);

  // Wow & flutter: one slow LFO bends every pad oscillator by a few cents.
  const wow = ctx.createOscillator();
  wow.frequency.value = 0.27;
  const wowDepth = ctx.createGain();
  wowDepth.gain.value = 5;
  wow.connect(wowDepth);
  wow.start();

  hiss(ctx, master);
  const timers: number[] = [];
  engine = { ctx, master, timers };

  let chord = 0;
  const nextChord = () => {
    pad(ctx, CHORDS[chord % CHORDS.length]!, ctx.currentTime + 0.05, master, reverb, wowDepth);
    chord++;
    timers.push(window.setTimeout(nextChord, CHORD_SECONDS * 1000));
  };
  nextChord();

  const nextNote = () => {
    musicBox(ctx, midiToFreq(MOTIF[Math.floor(Math.random() * MOTIF.length)]!), delay, reverb);
    timers.push(window.setTimeout(nextNote, 1800 + Math.random() * 4200));
  };
  timers.push(window.setTimeout(nextNote, 5000));

  const nextBroadcast = () => {
    numbersStation(ctx, master, reverb);
    timers.push(window.setTimeout(nextBroadcast, 28000 + Math.random() * 30000));
  };
  timers.push(window.setTimeout(nextBroadcast, 16000));
}

function stop() {
  const e = engine;
  if (!e) return;
  engine = null;
  e.timers.forEach(clearTimeout);
  const t = e.ctx.currentTime;
  e.master.gain.cancelScheduledValues(t);
  e.master.gain.setValueAtTime(e.master.gain.value, t);
  e.master.gain.linearRampToValueAtTime(0, t + 1.5);
  window.setTimeout(() => void e.ctx.close(), 1700);
}

/** Synthetic room reverb: decaying stereo noise. */
function impulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  return buf;
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** One chord of the pad: two detuned saws per note through a slowly breathing low-pass. */
function pad(ctx: AudioContext, notes: number[], at: number, out: AudioNode, reverb: AudioNode, wow: AudioNode) {
  const len = CHORD_SECONDS + 4; // overlaps the next chord for a crossfade
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(380, at);
  filter.frequency.linearRampToValueAtTime(900, at + len * 0.5);
  filter.frequency.linearRampToValueAtTime(420, at + len);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(0.09, at + 3.5);
  env.gain.setValueAtTime(0.09, at + len - 4);
  env.gain.linearRampToValueAtTime(0, at + len);
  filter.connect(env);
  env.connect(out);
  env.connect(reverb);
  notes.forEach((n, i) => {
    for (const cents of i === 0 ? [0] : [-7, 7]) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'sawtooth';
      osc.frequency.value = midiToFreq(i === 0 ? n - 12 : n);
      osc.detune.value = cents;
      wow.connect(osc.detune);
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 1.6 : 0.35;
      osc.connect(g).connect(filter);
      osc.start(at);
      osc.stop(at + len + 0.1);
    }
  });
}

/** A struck music-box/celesta note: sine + octave partial, fast decay, into the tape delay. */
function musicBox(ctx: AudioContext, freq: number, delay: AudioNode, reverb: AudioNode) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 1.2 - 0.6;
  g.connect(pan);
  pan.connect(delay);
  pan.connect(reverb);
  for (const [mult, level] of [
    [1, 1],
    [2.01, 0.25],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const lg = ctx.createGain();
    lg.gain.value = level;
    osc.connect(lg).connect(g);
    osc.start(t);
    osc.stop(t + 2.5);
  }
}

/** Constant, very quiet tape hiss with the odd crackle. */
function hiss(ctx: AudioContext, out: AudioNode) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 3);
  src.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 4000;
  const g = ctx.createGain();
  g.gain.value = 0.018;
  src.connect(hp).connect(g).connect(out);
  src.start();
}

/** Distant shortwave: a band-limited noise swell, a few Morse groups, then static fading out. */
function numbersStation(ctx: AudioContext, out: AudioNode, reverb: AudioNode) {
  const t = ctx.currentTime;
  const radio = ctx.createBiquadFilter();
  radio.type = 'bandpass';
  radio.frequency.value = 1400;
  radio.Q.value = 1.4;
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() < 0.5 ? -0.7 : 0.7;
  radio.connect(pan);
  pan.connect(out);
  pan.connect(reverb);

  const staticSrc = ctx.createBufferSource();
  staticSrc.buffer = noiseBuffer(ctx, 7);
  const sg = ctx.createGain();
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(0.05, t + 1.2);
  sg.gain.setValueAtTime(0.05, t + 5);
  sg.gain.linearRampToValueAtTime(0, t + 7);
  staticSrc.connect(sg).connect(radio);
  staticSrc.start(t);

  const beep = ctx.createOscillator();
  beep.frequency.value = 880;
  const bg = ctx.createGain();
  bg.gain.value = 0;
  beep.connect(bg).connect(radio);
  // Random dits and dahs in groups, like a coded five-figure message.
  let at = t + 1.4;
  for (let group = 0; group < 3; group++) {
    for (let k = 0; k < 4; k++) {
      const len = Math.random() < 0.5 ? 0.07 : 0.21;
      bg.gain.setValueAtTime(0.05, at);
      bg.gain.setValueAtTime(0, at + len);
      at += len + 0.08;
    }
    at += 0.35;
  }
  beep.start(t);
  beep.stop(t + 7);
}
