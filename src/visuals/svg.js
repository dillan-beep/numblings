// Shared SVG helpers for the pixel-art visual library.
// Everything renders to a string; no DOM needed.

export const C = {
  primary: '#4f9cff',
  good: '#4fd38a',
  warn: '#ffcc4d',
  bad: '#ff6b6b',
  purple: '#c77dff',
  orange: '#ff9f43',
  light: '#f4f5ff',
  dark: '#1a1a2e',
  silver: '#c9ccd6',
  silverDark: '#9a9fb3',
  gold: '#e8b824',
  copper: '#c9773b',
  brown: '#8d5a2b',
  white: '#ffffff',
};
export const SERIES = [C.primary, C.good, C.warn, C.bad, C.purple, C.orange];
export const SW = 3; // chunky outline width

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function svg({ w, h, type = '', maxHeight = 240 }, inner) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" ` +
    `style="max-height:${maxHeight}px;display:block;margin:0 auto;overflow:visible" ` +
    `shape-rendering="crispEdges" font-family="inherit" font-weight="700" ` +
    `class="visual visual-${esc(type)}" data-visual="${esc(type)}" role="img">` +
    inner +
    `</svg>`
  );
}

export function rect(x, y, w, h, fill, extra = '', sw = SW) {
  return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}" stroke="${C.dark}" stroke-width="${sw}" ${extra}/>`;
}
export function rectNoStroke(x, y, w, h, fill, extra = '') {
  return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}" ${extra}/>`;
}
export function circle(cx, cy, rad, fill, extra = '', sw = SW) {
  return `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rad)}" fill="${fill}" stroke="${C.dark}" stroke-width="${sw}" shape-rendering="geometricPrecision" ${extra}/>`;
}
export function line(x1, y1, x2, y2, stroke = C.dark, sw = SW, extra = '') {
  return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="square" ${extra}/>`;
}
export function poly(points, fill, extra = '', sw = SW) {
  const pts = points.map(([x, y]) => `${r(x)},${r(y)}`).join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke="${C.dark}" stroke-width="${sw}" stroke-linejoin="miter" ${extra}/>`;
}
export function path(d, fill, extra = '', sw = SW) {
  return `<path d="${d}" fill="${fill}" stroke="${C.dark}" stroke-width="${sw}" stroke-linejoin="miter" shape-rendering="geometricPrecision" ${extra}/>`;
}
export function text(x, y, s, { size = 16, fill = C.dark, anchor = 'middle', extra = '', baseline = 'middle' } = {}) {
  return `<text x="${r(x)}" y="${r(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="${baseline}" ${extra}>${esc(s)}</text>`;
}

// Round to 2 decimals to keep markup small and stable.
export function r(n) {
  return Math.round(n * 100) / 100;
}

export function fmt(n) {
  if (typeof n !== 'number') return String(n);
  const v = Math.round(n * 1e6) / 1e6;
  return String(v);
}

// Deterministic PRNG (mulberry32).
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A "nice" step so an axis has roughly `target` ticks.
export function niceStep(range, target = 5) {
  if (range <= 0) return 1;
  const raw = range / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step;
  if (norm <= 1) step = 1;
  else if (norm <= 2) step = 2;
  else if (norm <= 2.5) step = 2.5;
  else if (norm <= 5) step = 5;
  else step = 10;
  return step * mag;
}

export function clampInt(v, lo, hi, dflt) {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

// ---- Pixel icons (8x8 bitmaps) -------------------------------------------
const PAL = {
  k: C.dark, w: C.white, r: C.bad, g: C.good, y: C.warn, b: C.primary,
  p: C.purple, o: C.orange, n: C.brown, s: C.silver, d: C.gold, l: C.light,
  t: '#f0d09a',
};

export const ICONS = {
  star: [
    '...kk...',
    '..kyyk..',
    'kkkyykkk',
    'kyyyyyyk',
    '.kyyyyk.',
    '.kyyyyk.',
    'kyykkyyk',
    'kkk..kkk',
  ],
  apple: [
    '....kk..',
    '...knk..',
    '..kkkkk.',
    '.krrrrrk',
    'krrrrrrk',
    'krrrrrrk',
    '.krrrrk.',
    '..kkkk..',
  ],
  heart: [
    '.kk..kk.',
    'krrkkrrk',
    'krrrrrrk',
    'krrrrrrk',
    '.krrrrk.',
    '..krrk..',
    '...kk...',
    '........',
  ],
  cookie: [
    '..kkkk..',
    '.kttttk.',
    'kttnttk.',
    'ktttttnk',
    'kntttttk',
    'ktttnttk',
    '.kttttk.',
    '..kkkk..',
  ],
  fish: [
    '........',
    '...kkk..',
    '..kbbbk.',
    'kkbbkbbk',
    'kbbbbbbk',
    'kkbbbbbk',
    '..kbbbk.',
    '...kkk..',
  ],
  ball: [
    '..kkkk..',
    '.kwwbbk.',
    'kwwbbbbk',
    'kwbbbbbk',
    'kbbbbbbk',
    'kbbbbbbk',
    '.kbbbbk.',
    '..kkkk..',
  ],
  block: [
    'kkkkkkkk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    'kppppppk',
    'kkkkkkkk',
  ],
  flower: [
    '..kppk..',
    '.kppppk.',
    'kppyyppk',
    'kppyyppk',
    '.kppppk.',
    '..kggk..',
    '...kgk..',
    '...kgk..',
  ],
  car: [
    '........',
    '..kkkk..',
    '.kbbbbk.',
    'kkbbbbkk',
    'kooooook',
    'kooooook',
    'kkkkkkkk',
    '.kk..kk.',
  ],
  beaver: [
    '........',
    '..kkkk..',
    '.knnnnk.',
    'knkknnkk',
    'knnnnnnk',
    '.knnnnkk',
    '..kkkkkk',
    '.......k',
  ],
  loon: [
    '........',
    '...kk...',
    '..kkkkk.',
    '...kk...',
    '.kkkkkk.',
    'kkwkwkkk',
    'kkkkkkkk',
    '.kkkkkk.',
  ],
  bear: [
    '........',
    '.kk..kk.',
    'klllllk.',
    'kllkllkk',
    'kllllllk',
    'klllkllk',
    '.klllllk',
    '..kkkkk.',
  ],
};

// Draw an 8x8 icon with its top-left at (x,y), each pixel `s` units.
export function pixelIcon(name, x, y, s, { tint, clipCols } = {}) {
  const rows = ICONS[name];
  if (!rows) {
    // Fallback: treat `name` as a glyph (emoji or letter).
    return text(x + 4 * s, y + 4 * s, name, { size: 7 * s, extra: 'shape-rendering="auto"' });
  }
  let out = '';
  for (let ry = 0; ry < rows.length; ry++) {
    const row = rows[ry];
    let cx = 0;
    const cols = clipCols == null ? row.length : Math.min(clipCols, row.length);
    while (cx < cols) {
      const ch = row[cx];
      if (ch === '.') { cx++; continue; }
      let run = 1;
      while (cx + run < cols && row[cx + run] === ch) run++;
      let fill = PAL[ch] || C.dark;
      if (tint && ch !== 'k') fill = tint;
      out += rectNoStroke(x + cx * s, y + ry * s, run * s, s, fill);
      cx += run;
    }
  }
  return out;
}

export function iconExists(name) {
  return Object.prototype.hasOwnProperty.call(ICONS, name);
}
