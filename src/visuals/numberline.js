import { svg, line, circle, poly, rectNoStroke, text, C, fmt, r } from './svg.js';
import { makeMount, HIT } from './interact.js';

const W = 400;
const H = 96;
const X0 = 24, X1 = W - 24;
const Y = 56;

function layout(spec) {
  const min = Number.isFinite(Number(spec.min)) ? Number(spec.min) : 0;
  let max = Number.isFinite(Number(spec.max)) ? Number(spec.max) : min + 10;
  if (max <= min) max = min + 10;
  let step = Number(spec.step);
  if (!Number.isFinite(step) || step <= 0) step = 1;
  let n = Math.round((max - min) / step) + 1;
  if (n > 101) { step = (max - min) / 100; n = 101; }
  const ticks = [];
  for (let i = 0; i < n; i++) {
    const v = Math.round((min + i * step) * 1e6) / 1e6;
    ticks.push({ v, x: X0 + ((v - min) / (max - min)) * (X1 - X0) });
  }
  return { min, max, step, ticks };
}

export function renderWith(spec, state) {
  const { ticks } = layout(spec);
  const n = ticks.length;
  const labelEvery = n > 20 ? 5 : 1;
  const fontSize = n > 11 ? 14 : 18;
  const interactive = spec.question === 'point';
  const selected = state && state.value != null ? Number(state.value) : null;
  const highlight = spec.highlight != null && Number.isFinite(Number(spec.highlight)) ? Number(spec.highlight) : null;
  const marks = Array.isArray(spec.marks) ? spec.marks.map(Number).filter(Number.isFinite) : [];

  let inner = '';
  // Arrowheads at both ends
  inner += line(X0 - 10, Y, X1 + 10, Y, C.dark, 4);
  inner += poly([[X0 - 16, Y], [X0 - 6, Y - 7], [X0 - 6, Y + 7]], C.dark, '', 1);
  inner += poly([[X1 + 16, Y], [X1 + 6, Y - 7], [X1 + 6, Y + 7]], C.dark, '', 1);

  const lastLabelled = Math.floor((n - 1) / labelEvery) * labelEvery;
  ticks.forEach((t, i) => {
    let labelled = i % labelEvery === 0;
    // Always label the max unless it would collide with the previous label.
    if (i === n - 1 && !labelled && t.x - ticks[lastLabelled].x >= 24) labelled = true;
    const th = labelled ? 12 : 7;
    inner += line(t.x, Y - th, t.x, Y + th, C.dark, labelled ? 3 : 2);
    if (labelled) inner += text(t.x, Y + 28, fmt(t.v), { size: fontSize });
  });

  // marks: small orange arrows pointing down at the value
  const xOf = (v) => {
    const { min, max } = layout(spec);
    return X0 + ((v - min) / (max - min)) * (X1 - X0);
  };
  for (const m of marks) {
    const x = xOf(m);
    inner += poly([[x - 9, Y - 34], [x + 9, Y - 34], [x, Y - 18]], C.orange);
    inner += rectNoStroke(x - 3, Y - 44, 6, 11, C.orange);
  }
  if (highlight != null) {
    inner += circle(xOf(highlight), Y, 10, C.bad);
  }
  if (interactive) {
    // Hit targets for each tick
    const half = n > 1 ? (ticks[1].x - ticks[0].x) / 2 : 20;
    ticks.forEach((t) => {
      inner += `<rect x="${r(t.x - half)}" y="${Y - 40}" width="${r(half * 2)}" height="80" fill="transparent" data-act="pick" data-value="${fmt(t.v)}" style="${HIT}"/>`;
    });
    if (selected != null) {
      const x = xOf(selected);
      inner += circle(x, Y, 12, C.good, 'pointer-events="none"');
      inner += text(x, Y - 30, fmt(selected), { size: 18, fill: C.good, extra: 'pointer-events="none"' });
    } else {
      inner += text(W / 2, 14, 'Tap a number', { size: 14, fill: C.dark, extra: 'pointer-events="none" opacity="0.7"' });
    }
  }
  return svg({ w: W, h: H, type: 'numberline', maxHeight: 140 }, inner);
}

export function render(spec) {
  return renderWith(spec, null);
}

export const mount = makeMount({
  initial: () => ({ value: null }),
  render: renderWith,
  reduce: (spec, state, act, value) => (act === 'pick' ? { value } : state),
  answerOf: (spec, state) => (state.value == null ? null : String(state.value)),
});
