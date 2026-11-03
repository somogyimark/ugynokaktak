/*
 * Optional, synthesised sound effects (typewriter keys, terminal beeps, stamp thud).
 * Off by default; the choice is stored only in this browser. No audio files are loaded.
 */
const KEY = 'nya-sound';
const listeners = new Set<() => void>();
let enabled = read();
let ctx: AudioContext | null = null;
let lastClick = 0;

function read(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export const sound = {
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
    if (on) sound.stamp();
  },
  /** Typewriter key strike: a short filtered noise burst, throttled so fast typing does not buzz. */
  click() {
    const now = performance.now();
    if (now - lastClick < 45) return;
    lastClick = now;
    noise(0.03, 1800 + Math.random() * 900, 0.35);
  },
  beep() {
    tone(880, 0.05, 'square', 0.04);
  },
  stamp() {
    noise(0.09, 260, 0.9);
  },
};

function audio(): AudioContext | null {
  if (!enabled || typeof window === 'undefined' || !window.AudioContext) return null;
  ctx ??= new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noise(seconds: number, freq: number, gain: number) {
  const a = audio();
  if (!a) return;
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(a.destination);
  src.start();
}

function tone(freq: number, seconds: number, type: OscillatorType, gain: number) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + seconds);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + seconds);
}
