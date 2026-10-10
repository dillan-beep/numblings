import { svg, circle, C, clampInt } from './svg.js';

export function render(spec) {
  const rows = clampInt(spec.rows, 1, 12, 1);
  const cols = clampInt(spec.cols, 1, 12, 1);
  const cell = 32;
  const pad = 6;
  const w = pad * 2 + cols * cell;
  const h = pad * 2 + rows * cell;
  let inner = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      inner += circle(pad + c * cell + cell / 2, pad + r * cell + cell / 2, 11, C.primary);
    }
  }
  return svg({ w, h, type: 'array' }, inner);
}
