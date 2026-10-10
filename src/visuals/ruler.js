import { svg, rect, line, poly, text, C, fmt } from './svg.js';

const W = 400, H = 130;
const X0 = 24, X1 = W - 60; // room for the unit label at the right end

export function render(spec) {
  const unit = spec.unit === 'in' ? 'in' : 'cm';
  let max = Number(spec.max);
  if (!Number.isFinite(max) || max <= 0) max = unit === 'in' ? 12 : 20;
  let length = Number(spec.length);
  if (!Number.isFinite(length) || length < 0) length = 0;
  length = Math.min(length, max);
  const px = (v) => X0 + (v / max) * (X1 - X0);
  const rulerY = 62, rulerH = 56;
  let inner = '';
  // Ruler body
  inner += rect(X0 - 8, rulerY, X1 - X0 + 52, rulerH, C.warn);
  const labelEvery = max > 20 ? 5 : max > 12 ? 2 : 1;
  const sub = unit === 'in' ? 4 : 2; // quarter inches / half cms
  for (let v = 0; v <= max; v++) {
    const x = px(v);
    inner += line(x, rulerY, x, rulerY + 22, C.dark, 3);
    if (v % labelEvery === 0) inner += text(x, rulerY + 40, fmt(v), { size: 14 });
    if (v < max) {
      for (let s = 1; s < sub; s++) {
        const sx = px(v + s / sub);
        inner += line(sx, rulerY, sx, rulerY + (s * 2 === sub ? 14 : 9), C.dark, 2);
      }
    }
  }
  inner += text(X1 + 26, rulerY + rulerH / 2, unit, { size: 16 });
  // Object: a pencil-like bar from 0 to length
  const oy = 18, oh = 28;
  const end = px(length);
  if (length > 0) {
    const tip = Math.min(18, end - px(0));
    inner += rect(px(0), oy, Math.max(0, end - px(0) - tip), oh, C.good);
    inner += poly([[end - tip, oy], [end, oy + oh / 2], [end - tip, oy + oh]], C.orange);
    inner += rect(px(0), oy, Math.min(12, end - px(0)), oh, C.bad); // eraser end
  }
  return svg({ w: W, h: H, type: 'ruler', maxHeight: 150 }, inner);
}
