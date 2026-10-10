import { svg, poly, circle, text, C, fmt } from './svg.js';

const W = 260, H = 200;

function regular(n, cx, cy, rad, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  return pts;
}

export function render(spec) {
  const kind = String(spec.kind || 'square');
  const cx = W / 2, cy = H / 2 - 4;
  const fill = C.primary;
  let inner = '';
  const hasDims = spec.w != null || spec.h != null;
  const labelW = spec.w != null ? fmt(Number(spec.w)) : null;
  const labelH = spec.h != null ? fmt(Number(spec.h)) : null;

  let box = null; // [x0,y0,x1,y1] for side labels
  switch (kind) {
    case 'circle':
      inner += circle(cx, cy, 72, fill, '', 4);
      break;
    case 'triangle':
      inner += poly([[cx, cy - 72], [cx + 80, cy + 60], [cx - 80, cy + 60]], fill, '', 4);
      box = [cx - 80, cy - 72, cx + 80, cy + 60];
      break;
    case 'square': {
      const s = 140;
      inner += poly([[cx - s / 2, cy - s / 2], [cx + s / 2, cy - s / 2], [cx + s / 2, cy + s / 2], [cx - s / 2, cy + s / 2]], fill, '', 4);
      box = [cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2];
      break;
    }
    case 'rectangle': {
      let rw = 190, rh = 110;
      if (spec.w && spec.h && Number(spec.w) > 0 && Number(spec.h) > 0) {
        const ratio = Number(spec.w) / Number(spec.h);
        if (ratio >= 1) { rw = 190; rh = Math.max(50, 190 / ratio); } else { rh = 140; rw = Math.max(50, 140 * ratio); }
      }
      inner += poly([[cx - rw / 2, cy - rh / 2], [cx + rw / 2, cy - rh / 2], [cx + rw / 2, cy + rh / 2], [cx - rw / 2, cy + rh / 2]], fill, '', 4);
      box = [cx - rw / 2, cy - rh / 2, cx + rw / 2, cy + rh / 2];
      break;
    }
    case 'pentagon':
      inner += poly(regular(5, cx, cy + 6, 78), fill, '', 4);
      break;
    case 'hexagon':
      inner += poly(regular(6, cx, cy, 78, 0), fill, '', 4);
      break;
    case 'rhombus':
      inner += poly([[cx, cy - 76], [cx + 60, cy], [cx, cy + 76], [cx - 60, cy]], fill, '', 4);
      break;
    case 'trapezoid':
      inner += poly([[cx - 55, cy - 55], [cx + 55, cy - 55], [cx + 100, cy + 55], [cx - 100, cy + 55]], fill, '', 4);
      box = [cx - 100, cy - 55, cx + 100, cy + 55];
      break;
    default:
      inner += text(cx, cy, kind, { size: 20 });
  }

  if (hasDims && box) {
    const [x0, y0, x1, y1] = box;
    if (labelW != null) inner += text((x0 + x1) / 2, y0 - 14, labelW, { size: 18 });
    if (labelH != null && kind !== 'square') inner += text(x1 + 16, (y0 + y1) / 2, labelH, { size: 18, anchor: 'start' });
  }
  return svg({ w: W, h: H, type: 'shape', maxHeight: 200 }, inner);
}
