import { svg, rect, C, clampInt, r } from './svg.js';
import { makeMount, HIT } from './interact.js';

const W = 400;
const BAR_W = W - 24;
const BAR_H = 52;
const GAP = 14;

function bars(spec) {
  if (Array.isArray(spec.bars) && spec.bars.length) {
    return spec.bars.slice(0, 5).map((b) => ({
      parts: clampInt(b.parts, 1, 24, 1),
      shaded: clampInt(b.shaded, 0, 24, 0),
    }));
  }
  return [{ parts: clampInt(spec.parts, 1, 24, 1), shaded: clampInt(spec.shaded, 0, 24, 0) }];
}

function initial(spec) {
  return {
    sets: bars(spec).map((b) => {
      const s = new Set();
      // Start from the given shading when select mode is used to adjust it.
      for (let i = 0; i < Math.min(b.shaded, b.parts); i++) s.add(i);
      return s;
    }),
  };
}

export function renderWith(spec, state) {
  const list = bars(spec);
  const select = !!spec.select;
  if (select && !state) state = initial(spec);
  const h = 12 + list.length * (BAR_H + GAP) - GAP + 12;
  let inner = '';
  list.forEach((b, bi) => {
    const y = 12 + bi * (BAR_H + GAP);
    const pw = BAR_W / b.parts;
    for (let i = 0; i < b.parts; i++) {
      const on = select ? state.sets[bi].has(i) : i < b.shaded;
      const extra = select
        ? `data-act="toggle" data-value="${bi},${i}" style="${HIT}"`
        : '';
      inner += rect(12 + i * pw, y, pw, BAR_H, on ? C.primary : C.light, extra);
    }
    // Thick outer outline on top so the bar reads as one object
    inner += `<rect x="12" y="${y}" width="${r(BAR_W)}" height="${BAR_H}" fill="none" stroke="${C.dark}" stroke-width="4" pointer-events="none"/>`;
  });
  return svg({ w: W, h, type: 'fractionbar', maxHeight: Math.min(240, h) }, inner);
}

export function render(spec) {
  return renderWith(spec, null);
}

export const mount = makeMount({
  initial,
  render: renderWith,
  reduce: (spec, state, act, value) => {
    if (act !== 'toggle') return state;
    const [bi, i] = String(value).split(',').map(Number);
    if (!state.sets[bi]) return state;
    const sets = state.sets.map((s) => new Set(s));
    if (sets[bi].has(i)) sets[bi].delete(i); else sets[bi].add(i);
    return { sets };
  },
  answerOf: (spec, state) => String(state.sets.reduce((a, s) => a + s.size, 0)),
});
