import { svg, circle, line, text, poly, rect, C, r } from './svg.js';
import { makeMount, HIT } from './interact.js';
import { wedgePath } from './fractioncircle.js';

const SIZE = 240;
const CX = SIZE / 2, CY = SIZE / 2, R = 106;

function hand(angleDeg, len, width, fill) {
  const a = (angleDeg * Math.PI) / 180;
  const tipX = CX + len * Math.sin(a), tipY = CY - len * Math.cos(a);
  const px = Math.cos(a) * width / 2, py = Math.sin(a) * width / 2;
  const backX = CX - 14 * Math.sin(a), backY = CY + 14 * Math.cos(a);
  return poly(
    [[backX - px, backY - py], [backX + px, backY + py], [tipX + px * 0.4, tipY + py * 0.4], [tipX - px * 0.4, tipY - py * 0.4]],
    fill,
    'shape-rendering="geometricPrecision"'
  );
}

function face() {
  let out = circle(CX, CY, R + 6, C.dark, '', 0);
  out += circle(CX, CY, R, C.light, '', 4);
  for (let m = 0; m < 60; m++) {
    const a = (m / 60) * Math.PI * 2;
    const hourTick = m % 5 === 0;
    const r0 = hourTick ? R - 14 : R - 7;
    out += line(CX + r0 * Math.sin(a), CY - r0 * Math.cos(a), CX + (R - 2) * Math.sin(a), CY - (R - 2) * Math.cos(a), C.dark, hourTick ? 4 : 2, 'shape-rendering="geometricPrecision"');
  }
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const rr = R - 30;
    out += text(CX + rr * Math.sin(a), CY - rr * Math.cos(a), String(h), { size: 20 });
  }
  return out;
}

function hands(hour, minute, { hourSnapped = false } = {}) {
  const hAngle = hourSnapped ? (hour % 12) * 30 : ((hour % 12) + minute / 60) * 30;
  const mAngle = minute * 6;
  let out = '';
  if (minute != null) out += hand(mAngle, R - 22, 7, C.primary);
  if (hour != null) out += hand(hAngle, R - 50, 11, C.dark);
  out += circle(CX, CY, 7, C.bad, '', 3);
  return out;
}

export function renderWith(spec, state) {
  const set = !!spec.set;
  if (!set) {
    const hour = Number(spec.hour) || 0;
    const minute = Number(spec.minute) || 0;
    return svg({ w: SIZE, h: SIZE, type: 'clock', maxHeight: 240 }, face() + hands(hour, minute));
  }
  // Interactive: hour then minute, re-tappable via the two tabs below.
  if (!state) state = initial();
  const H = SIZE + 64;
  let inner = face();
  // 12 transparent wedge hit areas (snap positions)
  for (let i = 0; i < 12; i++) {
    const a0 = ((i - 0.5) / 12) * Math.PI * 2;
    const a1 = ((i + 0.5) / 12) * Math.PI * 2;
    inner += `<path d="${wedgePath(CX, CY, R, a0, a1)}" fill="transparent" data-act="face" data-value="${i}" style="${HIT}"/>`;
  }
  const hour = state.hour, minute = state.minute;
  inner += `<g pointer-events="none">${hands(hour, minute, { hourSnapped: true })}</g>`;
  // Tabs
  const tabY = SIZE + 10, tabH = 42, tabW = 108;
  const tabs = [
    { key: 'hour', label: 'Hour hand', x: 8 },
    { key: 'minute', label: 'Minute hand', x: SIZE - tabW - 8 },
  ];
  for (const t of tabs) {
    const active = state.stage === t.key;
    inner += rect(t.x, tabY, tabW, tabH, active ? C.warn : C.light, `data-act="stage" data-value="${t.key}" style="${HIT}"`);
    inner += text(t.x + tabW / 2, tabY + tabH / 2, t.label, { size: 16, extra: 'pointer-events="none"' });
  }
  const msg = state.stage === 'hour' ? 'Tap where the HOUR hand points' : 'Tap where the MINUTE hand points';
  inner += text(CX, tabY + tabH + 8, msg, { size: 13, extra: 'pointer-events="none" opacity="0.8"', baseline: 'hanging' });
  return svg({ w: SIZE, h: H, type: 'clock', maxHeight: 300 }, inner);
}

export function render(spec) {
  return renderWith(spec, null);
}

function initial() {
  return { stage: 'hour', hour: null, minute: null };
}

export const mount = makeMount({
  initial,
  render: renderWith,
  reduce: (spec, state, act, value) => {
    if (act === 'stage') {
      if (value !== 'hour' && value !== 'minute') return state;
      return { ...state, stage: value };
    }
    if (act === 'face') {
      const pos = Number(value);
      if (!Number.isInteger(pos)) return state;
      if (state.stage === 'hour') {
        return { stage: 'minute', hour: pos === 0 ? 12 : pos, minute: state.minute };
      }
      return { stage: 'minute', hour: state.hour, minute: pos * 5 };
    }
    return state;
  },
  answerOf: (spec, state) =>
    state.hour == null || state.minute == null
      ? null
      : `${state.hour}:${String(state.minute).padStart(2, '0')}`,
});
