import { svg, rect, text, C, clampInt, esc } from './svg.js';

export function render(spec) {
  const w = clampInt(spec.w, 1, 15, 1);
  const h = clampInt(spec.h, 1, 15, 1);
  const cell = w > 10 || h > 10 ? 20 : 28;
  const ml = 30, mt = 26, pad = 8;
  const W = ml + w * cell + pad;
  const H = mt + h * cell + pad;
  const unit = spec.unitLabel ? String(spec.unitLabel) : '';
  let inner = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      inner += rect(ml + x * cell, mt + y * cell, cell, cell, C.good, '', 2);
    }
  }
  inner += `<rect x="${ml}" y="${mt}" width="${w * cell}" height="${h * cell}" fill="none" stroke="${C.dark}" stroke-width="4"/>`;
  inner += text(ml + (w * cell) / 2, mt - 12, `${w}${unit ? ' ' + unit : ''}`, { size: 16 });
  inner += text(ml - 10, mt + (h * cell) / 2, `${h}${unit ? ' ' + unit : ''}`, {
    size: 16, anchor: 'middle',
    extra: `transform="rotate(-90 ${ml - 10} ${mt + (h * cell) / 2})"`,
  });
  return svg({ w: W, h: H, type: 'area', maxHeight: 240 }, inner);
}
