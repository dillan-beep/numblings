import { svg, rect, line, circle, text, C, niceStep, fmt } from './svg.js';

const W = 170, H = 240;

export function render(spec) {
  let min = Number(spec.min), max = Number(spec.max), value = Number(spec.value);
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max) || max <= min) max = min + 100;
  if (!Number.isFinite(value)) value = min;
  value = Math.max(min, Math.min(max, value));
  const tubeX = 54, tubeW = 26, top = 16, bottom = H - 50;
  const py = (v) => bottom - ((v - min) / (max - min)) * (bottom - top);
  let inner = '';
  // Tube and bulb
  inner += rect(tubeX, top, tubeW, bottom - top, C.light);
  inner += circle(tubeX + tubeW / 2, bottom + 14, 24, C.bad, '', 3);
  // Mercury
  const fy = py(value);
  inner += rect(tubeX + 4, fy, tubeW - 8, bottom - fy + 2, C.bad, '', 0);
  inner += `<rect x="${tubeX}" y="${top}" width="${tubeW}" height="${bottom - top}" fill="none" stroke="${C.dark}" stroke-width="3"/>`;
  // Scale on the right
  const step = niceStep(max - min, 5);
  const first = Math.ceil(min / step) * step;
  for (let v = first; v <= max + 1e-9; v += step) {
    const y = py(v);
    inner += line(tubeX + tubeW, y, tubeX + tubeW + 12, y, C.dark, 3);
    inner += text(tubeX + tubeW + 18, y, fmt(Math.round(v * 100) / 100), { size: 14, anchor: 'start' });
    // minor ticks
    const minor = v + step / 2;
    if (minor <= max) inner += line(tubeX + tubeW, py(minor), tubeX + tubeW + 6, py(minor), C.dark, 2);
  }
  return svg({ w: W, h: H, type: 'thermometer', maxHeight: 240 }, inner);
}
