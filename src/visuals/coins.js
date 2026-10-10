import { svg, circle, text, pixelIcon, C, clampInt } from './svg.js';

// Diameters in mm, scaled by PX per mm.
const PX = 3.2;
const CA = [
  { key: 'toonies', mm: 28, label: '$2', fill: C.silver, core: C.gold, icon: 'bear' },
  { key: 'loonies', mm: 26.5, label: '$1', fill: C.gold, icon: 'loon' },
  { key: 'quarters', mm: 23.9, label: '25¢', fill: C.silver },
  { key: 'nickels', mm: 21.2, label: '5¢', fill: C.silver, icon: 'beaver' },
  { key: 'pennies', mm: 19, label: '1¢', fill: C.copper },
  { key: 'dimes', mm: 18, label: '10¢', fill: C.silver },
];
const US = [
  { key: 'toonies', mm: 26.5, label: '$2', fill: C.gold },
  { key: 'loonies', mm: 26.5, label: '$1', fill: C.gold },
  { key: 'quarters', mm: 24.3, label: '25¢', fill: C.silver },
  { key: 'nickels', mm: 21.2, label: '5¢', fill: C.silver },
  { key: 'pennies', mm: 19, label: '1¢', fill: C.copper },
  { key: 'dimes', mm: 17.9, label: '10¢', fill: C.silver },
];

function coin(x, y, d, def) {
  const rad = d / 2;
  const cx = x + rad, cy = y + rad;
  let out = circle(cx, cy, rad, def.fill, '', 3);
  out += circle(cx, cy, rad - 6, def.core || def.fill, 'stroke-dasharray="4 3"', 2);
  const size = d >= 70 ? 22 : d >= 62 ? 18 : 15;
  if (def.icon) {
    const s = Math.max(2, Math.floor(d / 28));
    out += pixelIcon(def.icon, cx - 4 * s, cy - 8 * s - 2, s);
    out += text(cx, cy + 12, def.label, { size });
  } else {
    out += text(cx, cy, def.label, { size });
  }
  return out;
}

export function render(spec) {
  const defs = spec.us ? US : CA;
  const list = [];
  for (const def of defs) {
    const n = clampInt(spec[def.key], 0, 30, 0);
    for (let i = 0; i < n; i++) list.push(def);
  }
  const W = 400, pad = 8, gap = 8;
  let x = pad, y = pad, rowH = 0;
  let inner = '';
  for (const def of list) {
    const d = Math.round(def.mm * PX);
    if (x + d > W - pad && x > pad) {
      x = pad;
      y += rowH + gap;
      rowH = 0;
    }
    inner += coin(x, y, d, def);
    x += d + gap;
    rowH = Math.max(rowH, d);
  }
  const H = Math.max(60, y + rowH + pad);
  if (!list.length) inner += text(W / 2, 30, 'no coins', { size: 18, extra: 'opacity="0.6"' });
  return svg({ w: W, h: H, type: 'coins', maxHeight: 260 }, inner);
}
