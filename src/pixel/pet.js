// Composes a pet (species + stage + equipped accessories) onto a canvas element.
import { PETS, ACCESSORIES, MONSTERS, ICONS } from './sprites.js';
import { drawSprite, spriteDataURL } from './render.js';
import { stageIndex } from '../pets.js';

// Layout constants (in sprite pixels, before scale). The pet is drawn at (ox, oy) inside a padded box:
// SIDE leaves room for a buddy (left) and a weapon (right); TOP leaves room for a hat; feet touch the bottom.
const SIDE = 14;
const TOP = 10;

export function petSprite(species, level) {
  const def = PETS[species] || PETS[Object.keys(PETS)[0]];
  return def.stages[stageIndex(level)];
}

/**
 * Render pet + gear. Returns a <canvas> with CSS size scale*box.
 * opts: { scale (default 6), equipped ({hat, weapon, wings, buddy}), frame (0|1), facing ('right'|'left') }
 */
export function petCanvas(species, level, opts = {}) {
  const { equipped = {}, frame = 0, facing = 'right', size } = opts;
  const sprite = petSprite(species, level);
  // size = target pet height in CSS px; scale is derived so all three stages look similar in size.
  const scale = opts.scale ?? Math.max(2, Math.round((size ?? 140) / sprite.h));
  const w = sprite.w + SIDE * 2, h = sprite.h + TOP;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale; canvas.height = h * scale;
  canvas.style.width = `${w * scale}px`; canvas.style.height = `${h * scale}px`;
  canvas.className = 'px';
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  if (facing === 'left') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }

  const ox = SIDE, oy = TOP; // feet on the bottom row of the canvas (sprite-grid units)
  const acc = (slot) => (equipped?.[slot] ? ACCESSORIES[equipped[slot]] : null);
  // drawSprite takes canvas pixels; `put` works in sprite-grid units.
  const put = (s, f, gx, gy) => drawSprite(ctx, s, f % s.frames.length, gx * scale, gy * scale, scale);

  // wings behind, centred on the upper body
  const wings = acc('wings');
  if (wings) {
    const s = wings.sprite;
    put(s, frame, ox + Math.floor((sprite.w - s.w) / 2), oy + Math.floor(sprite.h * 0.3) - Math.floor(s.h / 2));
  }
  put(sprite, frame, ox, oy);
  const hat = acc('hat');
  if (hat) {
    const s = hat.sprite;
    const top = topRow(sprite, frame);
    put(s, 0, ox + Math.floor((sprite.w - s.w) / 2) + headOffset(sprite, frame), oy + top - s.h + 2);
  }
  const weapon = acc('weapon');
  if (weapon) {
    const s = weapon.sprite;
    put(s, 0, ox + sprite.w - Math.floor(s.w / 2) - 1, oy + sprite.h - s.h);
  }
  const buddy = acc('buddy');
  if (buddy) {
    const s = buddy.sprite;
    put(s, frame, Math.max(0, ox - s.w - 1), oy + sprite.h - s.h);
  }
  return canvas;
}

// Topmost opaque row index in frame.
function topRow(sprite, frame) {
  const rows = sprite.frames[frame % sprite.frames.length];
  for (let y = 0; y < rows.length; y++) if (/[^.]/.test(rows[y])) return y;
  return 0;
}
// Horizontal center of the top 4 opaque rows relative to sprite center (so hats sit on the head, not the body).
function headOffset(sprite, frame) {
  const rows = sprite.frames[frame % sprite.frames.length];
  const top = topRow(sprite, frame);
  let min = Infinity, max = -Infinity;
  for (let y = top; y < Math.min(rows.length, top + 4); y++) {
    for (let x = 0; x < rows[y].length; x++) if (rows[y][x] !== '.') { min = Math.min(min, x); max = Math.max(max, x); }
  }
  if (!Number.isFinite(min)) return 0;
  return Math.round((min + max) / 2 - sprite.w / 2);
}

export function monsterCanvas(id, opts = {}) {
  const { frame = 0, size } = opts;
  const m = MONSTERS[id]; if (!m) return document.createElement('canvas');
  const s = m.sprite;
  const scale = opts.scale ?? Math.max(2, Math.round((size ?? 140) / s.h));
  const canvas = document.createElement('canvas');
  canvas.width = s.w * scale; canvas.height = s.h * scale;
  canvas.style.width = `${s.w * scale}px`; canvas.style.height = `${s.h * scale}px`;
  canvas.className = 'px';
  const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
  drawSprite(ctx, s, frame % s.frames.length, 0, 0, scale);
  return canvas;
}

export function spriteImg(sprite, scale = 4, frame = 0, cls = 'px') {
  return `<img class="${cls}" src="${spriteDataURL(sprite, frame, scale)}" width="${sprite.w * scale}" height="${sprite.h * scale}" alt="" />`;
}
export function iconImg(name, scale = 3) {
  const s = ICONS[name]; return s ? spriteImg(s, scale) : '';
}
export function accessoryImg(itemId, scale = 4) {
  const a = ACCESSORIES[itemId]; return a ? spriteImg(a.sprite, scale) : '';
}
export function petImg(species, level, scale = 4, frame = 0) {
  return spriteImg(petSprite(species, level), scale, frame);
}
export function monsterImg(id, scale = 4, frame = 0) {
  const m = MONSTERS[id]; return m ? spriteImg(m.sprite, scale, frame) : '';
}

// Animate: swap frames on all canvases rendered via petCanvas/monsterCanvas by re-rendering through a callback.
export function startIdleLoop(fn, ms = 600) {
  let frame = 0;
  const t = setInterval(() => { frame = 1 - frame; try { fn(frame); } catch { /* ignore */ } }, ms);
  return () => clearInterval(t);
}
