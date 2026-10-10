// Canvas renderer for the sprite format in ./sprites.js. See docs/contracts.md.
import { PALETTE } from './sprites.js';

function colorsFor(sprite) {
  return sprite.palette ? { ...PALETTE, ...sprite.palette } : PALETTE;
}

// Draw one frame of a sprite at (x, y) with integer `scale` px per sprite pixel.
// Runs of same-colour pixels in a row are merged into a single fillRect.
export function drawSprite(ctx, sprite, frameIndex = 0, x = 0, y = 0, scale = 1) {
  const frame = sprite.frames[frameIndex % sprite.frames.length];
  const pal = colorsFor(sprite);
  const prevSmoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  for (let row = 0; row < frame.length; row++) {
    const line = frame[row];
    let col = 0;
    while (col < line.length) {
      const ch = line[col];
      let run = 1;
      while (col + run < line.length && line[col + run] === ch) run++;
      if (ch !== '.') {
        ctx.fillStyle = pal[ch] || '#ff00ff';
        ctx.fillRect(x + col * scale, y + row * scale, run * scale, scale);
      }
      col += run;
    }
  }
  ctx.imageSmoothingEnabled = prevSmoothing;
}

const cache = new WeakMap(); // sprite -> Map<`${frame}:${scale}`, dataURL>

function makeCanvas(w, h) {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  throw new Error('spriteDataURL needs a DOM or OffscreenCanvas');
}

// PNG data URL of one frame, transparent background, nearest-neighbour scaled. Memoized.
export function spriteDataURL(sprite, frameIndex = 0, scale = 1) {
  let perSprite = cache.get(sprite);
  if (!perSprite) {
    perSprite = new Map();
    cache.set(sprite, perSprite);
  }
  const key = `${frameIndex % sprite.frames.length}:${scale}`;
  const hit = perSprite.get(key);
  if (hit) return hit;
  const canvas = makeCanvas(sprite.w * scale, sprite.h * scale);
  const ctx = canvas.getContext('2d');
  drawSprite(ctx, sprite, frameIndex, 0, 0, scale);
  if (typeof canvas.toDataURL !== 'function') {
    throw new Error('spriteDataURL requires an HTMLCanvasElement (toDataURL)');
  }
  const url = canvas.toDataURL('image/png');
  perSprite.set(key, url);
  return url;
}

// Convenience: an <img> element for a sprite frame (uses the memoized data URL).
export function spriteImage(sprite, frameIndex = 0, scale = 1) {
  const img = new Image(sprite.w * scale, sprite.h * scale);
  img.src = spriteDataURL(sprite, frameIndex, scale);
  img.style.imageRendering = 'pixelated';
  return img;
}
