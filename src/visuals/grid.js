import { svg, line, circle, text, C, clampInt, r, esc } from './svg.js';
import { makeMount, HIT } from './interact.js';

export function renderWith(spec, state) {
  const w = clampInt(spec.w, 1, 20, 10);
  const h = clampInt(spec.h, 1, 20, 10);
  const cell = w > 12 || h > 12 ? 22 : 30;
  const ml = 34, mb = 30, mt = 12, mr = 12;
  const W = ml + w * cell + mr;
  const H = mt + h * cell + mb;
  const px = (x) => ml + x * cell;
  const py = (y) => mt + (h - y) * cell;
  const interactive = spec.question === 'point';
  const fontSize = cell >= 30 ? 14 : 12;

  let inner = '';
  inner += `<rect x="${ml}" y="${mt}" width="${w * cell}" height="${h * cell}" fill="${C.light}"/>`;
  for (let x = 0; x <= w; x++) inner += line(px(x), py(0), px(x), py(h), C.dark, x === 0 ? 4 : 1.5);
  for (let y = 0; y <= h; y++) inner += line(px(0), py(y), px(w), py(y), C.dark, y === 0 ? 4 : 1.5);
  const every = w > 12 ? 2 : 1;
  for (let x = 0; x <= w; x += every) inner += text(px(x), py(0) + 16, String(x), { size: fontSize });
  for (let y = 0; y <= h; y += every) inner += text(px(0) - 14, py(y), String(y), { size: fontSize });

  const points = Array.isArray(spec.points) ? spec.points : [];
  for (const p of points) {
    if (!Array.isArray(p)) continue;
    const [x, y, label] = p;
    if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) continue;
    inner += circle(px(Number(x)), py(Number(y)), 7, C.bad);
    if (label != null && label !== '') {
      inner += text(px(Number(x)) + 10, py(Number(y)) - 10, String(label), { size: 15, anchor: 'start', fill: C.bad });
    }
  }

  if (interactive) {
    const half = cell / 2;
    for (let x = 0; x <= w; x++) {
      for (let y = 0; y <= h; y++) {
        inner += `<rect x="${r(px(x) - half)}" y="${r(py(y) - half)}" width="${cell}" height="${cell}" fill="transparent" data-act="pick" data-value="${x},${y}" style="${HIT}"/>`;
      }
    }
    if (state && state.value) {
      const [sx, sy] = state.value.split(',').map(Number);
      inner += circle(px(sx), py(sy), 9, C.good, 'pointer-events="none"');
      inner += text(px(sx) + 12, py(sy) - 12, `(${sx}, ${sy})`, { size: 15, anchor: 'start', fill: C.good, extra: 'pointer-events="none"' });
    }
  }
  return svg({ w: W, h: H, type: 'grid', maxHeight: 260 }, inner);
}

export function render(spec) {
  return renderWith(spec, null);
}

export const mount = makeMount({
  initial: () => ({ value: null }),
  render: renderWith,
  reduce: (spec, state, act, value) => (act === 'pick' && /^\d+,\d+$/.test(String(value)) ? { value: String(value) } : state),
  answerOf: (spec, state) => state.value,
});
