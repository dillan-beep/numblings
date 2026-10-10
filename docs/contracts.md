# Module contracts (v2)

## Pixel sprites — `src/pixel/sprites.js`

```js
// A sprite is a palette plus one or more frames of row strings. '.' = transparent.
// Every row in a frame has exactly `w` chars; every frame has exactly `h` rows.
export const PALETTE = { k: '#1a1a2e', w: '#ffffff', r: '#e63946', ... }; // shared letters
// sprite = { w, h, frames: [ [row, row, ...], [row, ...] ], palette?: {...overrides} }

export const PETS = {
  dragon: { name: 'Dragon', stages: [sprite16, sprite20, sprite24], stageNames: ['Hatchling','Drake','Elder Dragon'] },
  ...
};
// Stage 0 is 16x16, stage 1 is 20x20, stage 2 is 24x24. Each has 2 idle frames (frame 1 = blink or small bob).
// Pets face RIGHT. Keep a 1px transparent margin on all sides. Feet touch the bottom row.

export const ACCESSORIES = {
  crown: { sprite, slot: 'hat', anchor: 'head' },      // drawn centered on head top, hats overlap the top 2px of the head
  sword: { sprite, slot: 'weapon', anchor: 'hand' },   // drawn at the pet's right side
  feather: { sprite, slot: 'wings', anchor: 'back' },  // drawn BEHIND the pet, centered, slightly up
  frog: { sprite, slot: 'buddy', anchor: 'side' },     // drawn to the LEFT of the pet on the ground
};
// Accessory ids must match item ids in src/pets.js.

export const MONSTERS = { slime: { name:'Slime', sprite, hp: 30 }, ... }; // 16x16, 2 frames, face LEFT
export const ICONS = { coin: sprite8, token: sprite8, heart: sprite8, star: sprite8, ... };
```

## Rendering — `src/pixel/render.js`

```js
drawSprite(ctx, sprite, frameIndex, x, y, scale)
spriteDataURL(sprite, frameIndex, scale) -> 'data:image/png;base64,...'  (memoized)
```

## Questions — `src/math/skills.js`

```js
// gen(level) returns:
{
  prompt: string,                 // plain text; may be short when a visual carries the question
  answer: string,                 // canonical answer
  choices?: string[],             // if present, UI shows buttons
  hint?: string,                  // shown before answering
  explain?: string,               // shown after a wrong answer: a one-line worked explanation
  visual?: { type: string, ...props },   // optional picture under the prompt (see visuals)
  input?: 'number' | 'choice' | 'visual' // default: 'choice' if choices else 'number'
}
```

## Visuals — `src/visuals/index.js`

```js
renderVisual(spec) -> string    // SVG/HTML markup, pixel-art styled, max width 100%, uses CSS vars for colors
// Interactive visuals (input: 'visual'): after the markup is inserted,
mountVisual(spec, containerEl, { onAnswer(valueString) })  // wires clicks; calls onAnswer when the child commits
```

Visual types and props:

| type | props | interactive? |
|---|---|---|
| `tenframe` | `{ count }` or `{ counts: [a, b] }` two frames | no |
| `counters` | `{ count, icon? }` scattered objects | no |
| `numberline` | `{ min, max, step?, marks?: number[], highlight?: number, question?: 'point' }` | yes when `question: 'point'` → answer is the clicked value |
| `base10` | `{ value }` hundreds flats, tens rods, ones cubes | no |
| `array` | `{ rows, cols }` dot array for multiplication | no |
| `fractionbar` | `{ parts, shaded }` or `{ bars: [{parts, shaded}] }` | yes when `select: true` → child clicks parts, answer = number shaded |
| `fractioncircle` | `{ parts, shaded }` | no |
| `clock` | `{ hour, minute }` analog clock face | yes when `set: true` → child taps hour then minute positions, answer = "h:mm" |
| `coins` | `{ quarters, dimes, nickels, pennies, loonies?, toonies? }` | no |
| `shape` | `{ kind: 'triangle'|'square'|'rectangle'|'pentagon'|'hexagon'|'circle'|'rhombus'|'trapezoid', w?, h? }` | no |
| `angle` | `{ degrees }` | no |
| `grid` | `{ w, h, points?: [[x,y,label]], question?: 'point' }` coordinate grid | yes when `question: 'point'` → answer "x,y" |
| `bargraph` | `{ categories: [{label, value}], max? }` | no |
| `pictograph` | `{ rows: [{label, count}], icon, each }` | no |
| `balance` | `{ left: string[], right: string[] }` scale with labelled weights | no |
| `ruler` | `{ length, unit: 'cm'|'in', max }` object against a ruler | no |
| `thermometer` | `{ value, min, max }` | no |
| `area` | `{ w, h, unitLabel? }` grid of unit squares | no |

## Audio — `src/audio.js`

```js
sfx('correct' | 'wrong' | 'coin' | 'levelup' | 'hit' | 'win' | 'click' | 'buy' | 'evolve')
setMuted(bool); isMuted()
```
