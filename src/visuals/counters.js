import { svg, pixelIcon, rng, clampInt } from './svg.js';

const S = 5; // pixel size -> 40-unit icons
const ICON = 8 * S;

export function render(spec) {
  const count = clampInt(spec.count, 0, 50, 0);
  const icon = spec.icon || 'star';
  const pad = 8;
  let inner = '';
  let w, h;

  if (count <= 10) {
    // Scattered on a 5-column grid with deterministic jitter so the same
    // count always looks the same (stable re-renders).
    const cols = 5;
    const rows = Math.max(1, Math.ceil(count / cols));
    const cellW = 72, cellH = 64;
    w = pad * 2 + cols * cellW;
    h = pad * 2 + rows * cellH;
    const rand = rng(1000 + count * 7919);
    // Shuffle cell order deterministically so the layout feels scattered.
    const cells = [];
    for (let i = 0; i < cols * rows; i++) cells.push(i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    for (let i = 0; i < count; i++) {
      const c = cells[i];
      const cx = c % cols, cy = Math.floor(c / cols);
      const jx = Math.round((rand() - 0.5) * (cellW - ICON - 4));
      const jy = Math.round((rand() - 0.5) * (cellH - ICON - 4));
      const x = pad + cx * cellW + (cellW - ICON) / 2 + jx;
      const y = pad + cy * cellH + (cellH - ICON) / 2 + jy;
      inner += pixelIcon(icon, x, y, S);
    }
  } else {
    // Rows of 5 so kids can subitize; a wider gap after each group of 5.
    const perRow = 10;
    const rows = Math.ceil(count / perRow);
    const step = ICON + 8;
    const groupGap = 20;
    w = pad * 2 + perRow * step + groupGap;
    h = pad * 2 + rows * (ICON + 12);
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = pad + col * step + (col >= 5 ? groupGap : 0);
      const y = pad + row * (ICON + 12);
      inner += pixelIcon(icon, x, y, S);
    }
  }
  return svg({ w, h, type: 'counters' }, inner);
}
