// Tiny chiptune synth. No audio files: everything is generated with WebAudio.
let ctx = null;
let muted = false;
try { muted = localStorage.getItem('petmath.muted') === '1'; } catch { /* ignore */ }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// note: [freq, durationSec, type?, gain?]
function play(notes, { type = 'square', gain = 0.08, gap = 0 } = {}) {
  if (muted) return;
  const c = ac(); if (!c) return;
  let t = c.currentTime + 0.01;
  for (const [f, d, ty, g] of notes) {
    if (f > 0) {
      const o = c.createOscillator(); const v = c.createGain();
      o.type = ty || type; o.frequency.setValueAtTime(f, t);
      v.gain.setValueAtTime(g ?? gain, t);
      v.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(v).connect(c.destination);
      o.start(t); o.stop(t + d + 0.02);
    }
    t += d + gap;
  }
}

const SFX = {
  click: () => play([[880, 0.04]], { gain: 0.04 }),
  correct: () => play([[523, 0.08], [659, 0.08], [784, 0.14]], { gap: 0.01 }),
  wrong: () => play([[220, 0.12, 'sawtooth'], [180, 0.2, 'sawtooth']], { gain: 0.06 }),
  coin: () => play([[988, 0.05], [1319, 0.12]], { gain: 0.05 }),
  token: () => play([[659, 0.06], [784, 0.06], [988, 0.06], [1319, 0.18]], { gain: 0.06 }),
  levelup: () => play([[392, 0.08], [523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.25]], { gap: 0.01 }),
  hit: () => play([[150, 0.08, 'sawtooth'], [100, 0.12, 'sawtooth']], { gain: 0.1 }),
  hurt: () => play([[300, 0.06, 'triangle'], [200, 0.1, 'triangle']], { gain: 0.08 }),
  win: () => play([[523, 0.1], [523, 0.1], [523, 0.1], [659, 0.3], [0, 0.05], [587, 0.1], [659, 0.4]], { gap: 0.02 }),
  lose: () => play([[392, 0.2], [349, 0.2], [311, 0.2], [262, 0.5]], { type: 'triangle', gain: 0.07 }),
  buy: () => play([[784, 0.05], [1047, 0.05], [1319, 0.1]], { gain: 0.05 }),
  eat: () => play([[300, 0.05, 'triangle'], [250, 0.05, 'triangle'], [300, 0.05, 'triangle'], [250, 0.05, 'triangle']], { gain: 0.08 }),
  evolve: () => play([[262, 0.1], [330, 0.1], [392, 0.1], [523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.5]], { gap: 0.02 }),
  quest: () => play([[659, 0.08], [880, 0.08], [1109, 0.2]], { gain: 0.06 }),
  pop: () => play([[600, 0.03, 'triangle']], { gain: 0.05 }),
};

export function sfx(name) { const f = SFX[name]; if (f) { try { f(); } catch { /* ignore */ } } }
export function setMuted(m) { muted = !!m; try { localStorage.setItem('petmath.muted', muted ? '1' : '0'); } catch { /* ignore */ } }
export function isMuted() { return muted; }
export function unlockAudio() { ac(); }
