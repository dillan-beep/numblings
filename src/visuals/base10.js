import { svg, rect, line, text, C, clampInt } from './svg.js';

const U = 10; // one unit cube = 10x10

function flat(x, y, fill) {
  let out = rect(x, y, U * 10, U * 10, fill);
  for (let i = 1; i < 10; i++) {
    out += line(x + i * U, y, x + i * U, y + U * 10, C.dark, 1.5);
    out += line(x, y + i * U, x + U * 10, y + i * U, C.dark, 1.5);
  }
  return out;
}
function rod(x, y, fill) {
  let out = rect(x, y, U, U * 10, fill);
  for (let i = 1; i < 10; i++) out += line(x, y + i * U, x + U, y + i * U, C.dark, 1.5);
  return out;
}
function cube(x, y, fill) {
  return rect(x, y, U, U, fill);
}

export function render(spec) {
  const value = clampInt(spec.value, 0, 9999, 0);
  const thousands = Math.floor(value / 1000);
  const hundreds = Math.floor((value % 1000) / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  const pad = 8;
  const gap = 12;
  let x = pad;
  let inner = '';
  const H = U * 10;

  // Thousands: a flat with a bold "1000" label (rare; contract only promises 0-999).
  for (let i = 0; i < thousands; i++) {
    inner += rect(x, pad, H, H, C.purple);
    inner += text(x + H / 2, pad + H / 2, '1000', { size: 22, fill: C.light });
    x += H + gap;
  }
  // Hundreds: 10x10 flats, up to 5 per row.
  const hRows = Math.ceil(hundreds / 5);
  const hCols = Math.min(hundreds, 5);
  for (let i = 0; i < hundreds; i++) {
    const col = i % 5, row = Math.floor(i / 5);
    inner += flat(x + col * (H + gap), pad + row * (H + gap), C.primary);
  }
  if (hundreds) x += hCols * (H + gap);
  // Tens rods.
  for (let i = 0; i < tens; i++) {
    inner += rod(x + i * (U + 6), pad, C.good);
  }
  if (tens) x += tens * (U + 6) + gap;
  // Ones cubes: 2-column stack, filling from the bottom.
  for (let i = 0; i < ones; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    inner += cube(x + col * (U + 4), pad + H - U - row * (U + 4), C.warn);
  }
  if (ones) x += 2 * (U + 4) + gap;

  const w = Math.max(x + pad - gap, 60);
  const rows = Math.max(1, hRows);
  const h = pad * 2 + rows * H + (rows - 1) * gap;
  if (value === 0) inner += text(30, pad + H / 2, '0', { size: 28 });
  return svg({ w, h, type: 'base10' }, inner);
}
