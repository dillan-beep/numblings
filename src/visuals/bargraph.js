import { svg, rect, line, text, SERIES, C, niceStep, fmt } from './svg.js';

export function render(spec) {
  const cats = (Array.isArray(spec.categories) ? spec.categories : [])
    .slice(0, 8)
    .map((c) => ({ label: String(c.label ?? ''), value: Math.max(0, Number(c.value) || 0) }));
  const W = 400, H = 230;
  const ml = 44, mr = 12, mt = 12, mb = 40;
  const pw = W - ml - mr, ph = H - mt - mb;
  const dataMax = Math.max(1, ...cats.map((c) => c.value));
  let step = niceStep(spec.max != null ? Number(spec.max) : dataMax, 5);
  let max = spec.max != null && Number(spec.max) > 0 ? Number(spec.max) : Math.ceil(dataMax / step) * step;
  if (max < dataMax) max = Math.ceil(dataMax / step) * step;
  const py = (v) => mt + ph - (v / max) * ph;
  let inner = '';
  // gridlines + y labels
  for (let v = 0; v <= max + 1e-9; v += step) {
    inner += line(ml, py(v), W - mr, py(v), v === 0 ? C.dark : '#b8bcd6', v === 0 ? 3 : 1.5);
    inner += text(ml - 8, py(v), fmt(Math.round(v * 100) / 100), { size: 13, anchor: 'end' });
  }
  inner += line(ml, mt, ml, mt + ph, C.dark, 3);
  const n = Math.max(1, cats.length);
  const slot = pw / n;
  const bw = Math.min(56, slot * 0.6);
  cats.forEach((c, i) => {
    const x = ml + slot * i + (slot - bw) / 2;
    const top = py(c.value);
    if (c.value > 0) inner += rect(x, top, bw, mt + ph - top, SERIES[i % SERIES.length]);
    inner += text(ml + slot * i + slot / 2, H - mb + 18, c.label, { size: c.label.length > 6 ? 12 : 14 });
  });
  return svg({ w: W, h: H, type: 'bargraph', maxHeight: 240 }, inner);
}
