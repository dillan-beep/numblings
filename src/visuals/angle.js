import { svg, line, circle, text, path, poly, C, r } from './svg.js';

const W = 240, H = 200;

// Angle opens counter-clockwise from a horizontal ray pointing right.
// Pass `label: true` to print the degrees (off by default so the picture
// does not give away "how many degrees?" questions).
export function render(spec) {
  let deg = Number(spec.degrees);
  if (!Number.isFinite(deg)) deg = 45;
  deg = ((deg % 360) + 360) % 360;
  const vx = deg > 180 ? W / 2 : 56;
  const vy = deg > 180 ? H / 2 : H - 40;
  const len = deg > 180 ? 80 : 150;
  const a = (-deg * Math.PI) / 180;
  const ex = vx + len * Math.cos(a), ey = vy + len * Math.sin(a);
  let inner = '';
  // Arc
  const arcR = 34;
  if (deg === 90) {
    inner += poly([[vx + 22, vy], [vx + 22, vy - 22], [vx, vy - 22]], 'none', '', 3);
  } else if (deg > 0) {
    const sx = vx + arcR, sy = vy;
    const tx = vx + arcR * Math.cos(a), ty = vy + arcR * Math.sin(a);
    const large = deg > 180 ? 1 : 0;
    inner += path(`M ${r(sx)} ${r(sy)} A ${arcR} ${arcR} 0 ${large} 0 ${r(tx)} ${r(ty)}`, 'none', `stroke="${C.orange}"`, 4);
  }
  inner += line(vx, vy, vx + (deg > 180 ? len : len + 20), vy, C.dark, 5);
  inner += line(vx, vy, ex, ey, C.dark, 5, 'shape-rendering="geometricPrecision"');
  inner += circle(vx, vy, 6, C.bad, '', 3);
  if (spec.label) {
    const mid = (-deg / 2 * Math.PI) / 180;
    const lx = vx + (arcR + 24) * Math.cos(mid), ly = vy + (arcR + 24) * Math.sin(mid);
    inner += text(lx, ly, `${Math.round(deg)}°`, { size: 18, fill: C.orange });
  }
  return svg({ w: W, h: H, type: 'angle', maxHeight: 200 }, inner);
}
