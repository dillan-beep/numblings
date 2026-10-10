import { svg, rect, line, circle, C, clampInt } from './svg.js';

const CELL = 40;
const FRAME_W = CELL * 5;
const FRAME_H = CELL * 2;

function frame(x, y, count, color) {
  let out = rect(x, y, FRAME_W, FRAME_H, C.light);
  for (let i = 1; i < 5; i++) out += line(x + i * CELL, y, x + i * CELL, y + FRAME_H);
  out += line(x, y + CELL, x + FRAME_W, y + CELL);
  for (let i = 0; i < Math.min(10, count); i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    out += circle(x + col * CELL + CELL / 2, y + row * CELL + CELL / 2, 13, color);
  }
  return out;
}

export function render(spec) {
  const pad = 6;
  let counts;
  if (Array.isArray(spec.counts)) {
    counts = spec.counts.slice(0, 2).map((n) => clampInt(n, 0, 10, 0));
  } else {
    const n = clampInt(spec.count, 0, 20, 0);
    counts = n > 10 ? [10, n - 10] : [n];
  }
  const colors = [C.primary, C.orange];
  const gap = 24;
  const w = pad * 2 + counts.length * FRAME_W + (counts.length - 1) * gap;
  const h = pad * 2 + FRAME_H;
  let inner = '';
  counts.forEach((n, i) => {
    inner += frame(pad + i * (FRAME_W + gap), pad, n, colors[i % colors.length]);
  });
  return svg({ w, h, type: 'tenframe', maxHeight: 160 }, inner);
}
