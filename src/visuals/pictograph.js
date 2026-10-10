import { svg, text, line, pixelIcon, C, fmt } from './svg.js';

const S = 4; // 32-unit icons
const ICON = 8 * S;

export function render(spec) {
  const rows = (Array.isArray(spec.rows) ? spec.rows : [])
    .slice(0, 8)
    .map((r) => ({ label: String(r.label ?? ''), count: Math.max(0, Number(r.count) || 0) }));
  const icon = spec.icon || 'star';
  const each = Number(spec.each) > 0 ? Number(spec.each) : 1;
  const W = 400, labelW = 96, rowH = ICON + 12, pad = 8;
  const keyH = 30;
  const H = pad + rows.length * rowH + keyH + pad;
  let inner = '';
  rows.forEach((row, i) => {
    const y = pad + i * rowH;
    inner += text(labelW - 10, y + rowH / 2 - 6, row.label, { size: 16, anchor: 'end' });
    if (i > 0) inner += line(pad, y - 6, W - pad, y - 6, '#b8bcd6', 1.5);
    const icons = row.count / each;
    const full = Math.floor(icons);
    const frac = icons - full;
    const maxIcons = Math.floor((W - labelW - pad) / (ICON + 4));
    for (let k = 0; k < Math.min(full, maxIcons); k++) {
      inner += pixelIcon(icon, labelW + k * (ICON + 4), y, S);
    }
    if (frac > 0.05 && full < maxIcons) {
      // Partial icon: clip to the left half (or quarter) of the bitmap.
      const cols = frac >= 0.5 ? 4 : 2;
      inner += pixelIcon(icon, labelW + full * (ICON + 4), y, S, { clipCols: cols });
    }
  });
  // Key
  const ky = pad + rows.length * rowH + 4;
  inner += line(pad, ky - 2, W - pad, ky - 2, C.dark, 2);
  inner += text(labelW - 10, ky + keyH / 2, 'Key:', { size: 14, anchor: 'end' });
  inner += pixelIcon(icon, labelW, ky + 2, 3);
  inner += text(labelW + 30, ky + keyH / 2, `= ${fmt(each)}`, { size: 16, anchor: 'start' });
  return svg({ w: W, h: H, type: 'pictograph', maxHeight: 260 }, inner);
}
