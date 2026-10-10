import { describe, it, expect, vi } from 'vitest';
import { renderVisual, mountVisual, isInteractive, VISUAL_TYPES } from '../src/visuals/index.js';

// One example spec per type (plus variants), matching docs/contracts.md.
const EXAMPLES = {
  tenframe: [{ type: 'tenframe', count: 7 }, { type: 'tenframe', counts: [6, 3] }, { type: 'tenframe', count: 14 }],
  counters: [{ type: 'counters', count: 6 }, { type: 'counters', count: 17, icon: 'apple' }, { type: 'counters', count: 3, icon: '🐸' }],
  numberline: [
    { type: 'numberline', min: 0, max: 10, highlight: 4, marks: [7] },
    { type: 'numberline', min: 0, max: 100, step: 2 },
    { type: 'numberline', min: 0, max: 20, question: 'point' },
  ],
  base10: [{ type: 'base10', value: 247 }, { type: 'base10', value: 0 }, { type: 'base10', value: 999 }],
  array: [{ type: 'array', rows: 3, cols: 4 }, { type: 'array', rows: 40, cols: 40 }],
  fractionbar: [
    { type: 'fractionbar', parts: 4, shaded: 3 },
    { type: 'fractionbar', bars: [{ parts: 2, shaded: 1 }, { parts: 4, shaded: 2 }] },
    { type: 'fractionbar', parts: 6, shaded: 0, select: true },
  ],
  fractioncircle: [{ type: 'fractioncircle', parts: 8, shaded: 5 }, { type: 'fractioncircle', parts: 1, shaded: 1 }],
  clock: [{ type: 'clock', hour: 3, minute: 30 }, { type: 'clock', set: true }],
  coins: [
    { type: 'coins', quarters: 2, dimes: 1, nickels: 3, loonies: 1, toonies: 1 },
    { type: 'coins', us: true, quarters: 1, dimes: 2, nickels: 1, pennies: 4 },
    { type: 'coins' },
  ],
  shape: ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'circle', 'rhombus', 'trapezoid'].map((kind) => ({ type: 'shape', kind, w: 5, h: 3 })),
  angle: [{ type: 'angle', degrees: 45 }, { type: 'angle', degrees: 90 }, { type: 'angle', degrees: 240, label: true }],
  grid: [{ type: 'grid', w: 8, h: 6, points: [[2, 3, 'A'], [5, 1, 'B']] }, { type: 'grid', w: 10, h: 10, question: 'point' }],
  bargraph: [{ type: 'bargraph', categories: [{ label: 'Red', value: 4 }, { label: 'Blue', value: 7 }, { label: 'Green', value: 2 }] }, { type: 'bargraph', categories: [], max: 10 }],
  pictograph: [{ type: 'pictograph', rows: [{ label: 'Cats', count: 6 }, { label: 'Dogs', count: 9 }], icon: 'heart', each: 2 }],
  balance: [{ type: 'balance', left: ['3', '4'], right: ['5'] }, { type: 'balance', left: ['x', '2'], right: ['7'] }],
  ruler: [{ type: 'ruler', length: 7, unit: 'cm', max: 10 }, { type: 'ruler', length: 3.5, unit: 'in', max: 6 }],
  thermometer: [{ type: 'thermometer', value: 23, min: -10, max: 40 }],
  area: [{ type: 'area', w: 5, h: 3, unitLabel: 'cm' }, { type: 'area', w: 12, h: 12 }],
};

// A minimal stand-in for a DOM container: stores innerHTML and lets tests
// dispatch fake clicks on elements carrying data-act / data-value.
function fakeContainer() {
  const listeners = {};
  const el = {
    innerHTML: '',
    addEventListener: (t, fn) => { (listeners[t] ||= []).push(fn); },
    removeEventListener: (t, fn) => { listeners[t] = (listeners[t] || []).filter((f) => f !== fn); },
    click(act, value) {
      const node = {
        getAttribute: (n) => (n === 'data-act' ? act : n === 'data-value' ? value : null),
        parentNode: el,
      };
      for (const fn of listeners.click || []) fn({ target: node });
    },
    listenerCount: () => (listeners.click || []).length,
  };
  return el;
}

describe('renderVisual', () => {
  it('covers every type in the contract', () => {
    for (const t of VISUAL_TYPES) expect(EXAMPLES[t], `missing example for ${t}`).toBeTruthy();
    expect(VISUAL_TYPES.length).toBe(18);
  });

  for (const [type, specs] of Object.entries(EXAMPLES)) {
    it(`${type}: renders inline SVG for every example`, () => {
      for (const spec of specs) {
        const out = renderVisual(spec);
        expect(typeof out).toBe('string');
        expect(out.length).toBeGreaterThan(0);
        expect(out).toContain('<svg');
        expect(out).toContain('viewBox=');
        expect(out).toContain('width="100%"');
        expect(out).toContain('shape-rendering="crispEdges"');
        expect(out).not.toMatch(/NaN|undefined/);
      }
    });
  }

  it('unknown type returns empty string and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(renderVisual({ type: 'nope' })).toBe('');
    expect(renderVisual(null)).toBe('');
    expect(renderVisual({})).toBe('');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('counters layout is deterministic for the same count', () => {
    const a = renderVisual({ type: 'counters', count: 8 });
    const b = renderVisual({ type: 'counters', count: 8 });
    expect(a).toBe(b);
    expect(a).not.toBe(renderVisual({ type: 'counters', count: 9 }));
  });

  it('numberline labels every 5th tick when there are many ticks', () => {
    const out = renderVisual({ type: 'numberline', min: 0, max: 50 });
    expect(out).toContain('>0<');
    expect(out).toContain('>5<');
    expect(out).toContain('>50<');
    expect(out).not.toContain('>1<');
  });

  it('balance tilts only when both sides are numeric and differ', () => {
    expect(renderVisual({ type: 'balance', left: ['6'], right: ['2'] })).toContain('rotate(-7');
    expect(renderVisual({ type: 'balance', left: ['2'], right: ['6'] })).toContain('rotate(7');
    expect(renderVisual({ type: 'balance', left: ['3', '3'], right: ['6'] })).toContain('rotate(0');
    expect(renderVisual({ type: 'balance', left: ['x'], right: ['6'] })).toContain('rotate(0');
  });

  it('escapes labels', () => {
    const out = renderVisual({ type: 'bargraph', categories: [{ label: '<b>', value: 1 }] });
    expect(out).not.toContain('<b>');
    expect(out).toContain('&lt;b&gt;');
  });
});

describe('mountVisual', () => {
  it('is exported and handles a null container gracefully', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(typeof mountVisual).toBe('function');
    expect(() => mountVisual({ type: 'clock', set: true }, null, { onAnswer() {} })).not.toThrow();
    expect(mountVisual({ type: 'clock', set: true }, null, {})).toBeNull();
    expect(mountVisual({ type: 'nope' }, fakeContainer(), {})).toBeNull();
    warn.mockRestore();
  });

  it('isInteractive flags the right specs', () => {
    expect(isInteractive({ type: 'numberline', question: 'point' })).toBe(true);
    expect(isInteractive({ type: 'numberline' })).toBe(false);
    expect(isInteractive({ type: 'fractionbar', select: true })).toBe(true);
    expect(isInteractive({ type: 'clock', set: true })).toBe(true);
    expect(isInteractive({ type: 'grid', question: 'point' })).toBe(true);
    expect(isInteractive({ type: 'tenframe', count: 3 })).toBe(false);
  });

  it('non-interactive spec: fills the container and returns null', () => {
    const el = fakeContainer();
    const h = mountVisual({ type: 'tenframe', count: 3 }, el, { onAnswer() {} });
    expect(h).toBeNull();
    expect(el.innerHTML).toContain('<svg');
    expect(el.listenerCount()).toBe(0);
  });

  it('numberline point: click snaps and reports the value, re-click changes it', () => {
    const el = fakeContainer();
    const answers = [];
    const h = mountVisual({ type: 'numberline', min: 0, max: 10, question: 'point' }, el, { onAnswer: (v) => answers.push(v) });
    expect(el.innerHTML).toContain('data-act="pick"');
    el.click('pick', '7');
    el.click('pick', '3');
    expect(answers).toEqual(['7', '3']);
    expect(h.getAnswer()).toBe('3');
    h.destroy();
    expect(el.listenerCount()).toBe(0);
  });

  it('fractionbar select: toggles parts and reports shaded count', () => {
    const el = fakeContainer();
    const answers = [];
    mountVisual({ type: 'fractionbar', parts: 4, shaded: 0, select: true }, el, { onAnswer: (v) => answers.push(v) });
    el.click('toggle', '0,1');
    el.click('toggle', '0,2');
    el.click('toggle', '0,1');
    expect(answers).toEqual(['1', '2', '1']);
  });

  it('clock set: hour then minute, answers h:mm, re-tappable', () => {
    const el = fakeContainer();
    const answers = [];
    const h = mountVisual({ type: 'clock', set: true }, el, { onAnswer: (v) => answers.push(v) });
    expect(el.innerHTML).toContain('HOUR');
    el.click('face', '3');
    expect(answers).toEqual([]); // not complete yet
    expect(el.innerHTML).toContain('MINUTE');
    el.click('face', '6');
    expect(answers).toEqual(['3:30']);
    el.click('stage', 'hour');
    el.click('face', '0');
    expect(answers.at(-1)).toBe('12:30');
    el.click('face', '1'); // auto-advanced to minute
    expect(h.getAnswer()).toBe('12:05');
  });

  it('grid point: answers x,y', () => {
    const el = fakeContainer();
    const answers = [];
    mountVisual({ type: 'grid', w: 6, h: 6, question: 'point' }, el, { onAnswer: (v) => answers.push(v) });
    el.click('pick', '2,5');
    expect(answers).toEqual(['2,5']);
    expect(el.innerHTML).toContain('(2, 5)');
  });
});
