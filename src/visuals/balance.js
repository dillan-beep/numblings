import { svg, rect, line, poly, circle, text, C, r } from './svg.js';

const W = 400, H = 230;
const PIVOT_X = W / 2, PIVOT_Y = 150;
const ARM = 150;
const BLOCK = 38;

function sum(labels) {
  let total = 0;
  for (const l of labels) {
    const n = Number(l);
    if (!Number.isFinite(n)) return null; // unknown like 'x'
    total += n;
  }
  return total;
}

function pan(cx, cy, labels) {
  // Pan plate and stacked blocks above it, 3 per row.
  let out = rect(cx - 58, cy, 116, 8, C.dark, '', 1);
  const perRow = 3;
  labels.slice(0, 9).forEach((label, i) => {
    const row = Math.floor(i / perRow);
    const colCount = Math.min(perRow, labels.length - row * perRow);
    const col = i % perRow;
    const x = cx - (colCount * (BLOCK + 4)) / 2 + col * (BLOCK + 4) + 2;
    const y = cy - (row + 1) * (BLOCK + 2);
    out += rect(x, y, BLOCK, BLOCK, row % 2 ? C.warn : C.orange);
    out += text(x + BLOCK / 2, y + BLOCK / 2, String(label), { size: String(label).length > 2 ? 14 : 18 });
  });
  return out;
}

export function render(spec) {
  const left = (Array.isArray(spec.left) ? spec.left : []).map(String);
  const right = (Array.isArray(spec.right) ? spec.right : []).map(String);
  const ls = sum(left), rs = sum(right);
  let tilt = 0;
  if (ls != null && rs != null && ls !== rs) tilt = ls > rs ? -7 : 7; // heavier side goes down
  let inner = '';
  // Base + post
  inner += poly([[PIVOT_X - 50, H - 10], [PIVOT_X + 50, H - 10], [PIVOT_X + 12, PIVOT_Y], [PIVOT_X - 12, PIVOT_Y]], C.purple);
  // Beam + pans rotate around the pivot
  inner += `<g transform="rotate(${tilt} ${PIVOT_X} ${PIVOT_Y})">`;
  inner += rect(PIVOT_X - ARM, PIVOT_Y - 5, ARM * 2, 10, C.dark, '', 1);
  for (const side of [-1, 1]) {
    const px = PIVOT_X + side * (ARM - 10);
    // hangers
    inner += line(px, PIVOT_Y, px - 50, PIVOT_Y + 34, C.dark, 3);
    inner += line(px, PIVOT_Y, px + 50, PIVOT_Y + 34, C.dark, 3);
    inner += pan(px, PIVOT_Y + 34, side < 0 ? left : right);
  }
  inner += '</g>';
  inner += circle(PIVOT_X, PIVOT_Y, 8, C.bad, '', 3);
  return svg({ w: W, h: H, type: 'balance', maxHeight: 240 }, inner);
}
