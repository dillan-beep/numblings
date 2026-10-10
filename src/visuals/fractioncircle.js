import { svg, circle, path, C, clampInt, r } from './svg.js';

export function wedgePath(cx, cy, rad, a0, a1) {
  // angles in radians, clockwise from 12 o'clock
  const p = (a) => [cx + rad * Math.sin(a), cy - rad * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${r(cx)} ${r(cy)} L ${r(x0)} ${r(y0)} A ${r(rad)} ${r(rad)} 0 ${large} 1 ${r(x1)} ${r(y1)} Z`;
}

export function render(spec) {
  const parts = clampInt(spec.parts, 1, 24, 1);
  const shaded = clampInt(spec.shaded, 0, parts, 0);
  const size = 220;
  const cx = size / 2, cy = size / 2, rad = 96;
  let inner = '';
  if (parts === 1) {
    inner += circle(cx, cy, rad, shaded ? C.primary : C.light, '', 4);
  } else {
    for (let i = 0; i < parts; i++) {
      const a0 = (i / parts) * Math.PI * 2;
      const a1 = ((i + 1) / parts) * Math.PI * 2;
      inner += path(wedgePath(cx, cy, rad, a0, a1), i < shaded ? C.primary : C.light, '', 4);
    }
  }
  return svg({ w: size, h: size, type: 'fractioncircle', maxHeight: 220 }, inner);
}
