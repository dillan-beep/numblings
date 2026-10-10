import { describe, it, expect } from 'vitest';
import { PALETTE, PETS, ACCESSORIES, MONSTERS, ICONS } from '../src/pixel/sprites.js';
import { SPECIES, ITEMS } from '../src/pets.js';

function collect() {
  const out = [];
  for (const [id, pet] of Object.entries(PETS)) {
    pet.stages.forEach((s, i) => out.push([`pet ${id} stage ${i}`, s, [16, 20, 24][i]]));
  }
  for (const [id, acc] of Object.entries(ACCESSORIES)) out.push([`accessory ${id}`, acc.sprite]);
  for (const [id, m] of Object.entries(MONSTERS)) out.push([`monster ${id}`, m.sprite]);
  for (const [id, s] of Object.entries(ICONS)) out.push([`icon ${id}`, s, 8]);
  return out;
}

describe('sprite data', () => {
  for (const [label, sprite, expectedSize] of collect()) {
    it(`${label} is well-formed`, () => {
      const pal = { ...PALETTE, ...(sprite.palette || {}) };
      expect(sprite.frames.length).toBeGreaterThanOrEqual(1);
      if (expectedSize) {
        expect(sprite.w).toBe(expectedSize);
        expect(sprite.h).toBe(expectedSize);
      }
      sprite.frames.forEach((frame, fi) => {
        expect(frame.length, `${label} frame ${fi} row count`).toBe(sprite.h);
        frame.forEach((row, ri) => {
          expect(row.length, `${label} frame ${fi} row ${ri} "${row}" width`).toBe(sprite.w);
          for (const ch of row) {
            if (ch === '.') continue;
            expect(pal[ch], `${label} frame ${fi} row ${ri} unknown key "${ch}"`).toBeDefined();
          }
        });
      });
    });
  }

  it('pets have 3 stages with 2 frames each and match src/pets.js species', () => {
    expect(Object.keys(PETS).sort()).toEqual(Object.keys(SPECIES).sort());
    for (const pet of Object.values(PETS)) {
      expect(pet.stages).toHaveLength(3);
      expect(pet.stageNames).toHaveLength(3);
      for (const s of pet.stages) expect(s.frames).toHaveLength(2);
    }
  });

  it('accessories cover every non-bg equippable item id', () => {
    const want = ITEMS.filter((i) => ['hat', 'weapon', 'wings', 'buddy'].includes(i.cat)).map((i) => i.id).sort();
    expect(Object.keys(ACCESSORIES).sort()).toEqual(want);
    for (const [id, acc] of Object.entries(ACCESSORIES)) {
      const item = ITEMS.find((i) => i.id === id);
      expect(acc.slot).toBe(item.cat);
      expect(['head', 'hand', 'back', 'side']).toContain(acc.anchor);
      if (acc.slot === 'buddy') expect(acc.sprite.frames).toHaveLength(2);
    }
  });

  it('monsters have name, hp and 2 frames', () => {
    for (const m of Object.values(MONSTERS)) {
      expect(typeof m.name).toBe('string');
      expect(m.hp).toBeGreaterThan(0);
      expect(m.sprite.frames).toHaveLength(2);
    }
  });

  it('palette values are hex colours', () => {
    for (const v of Object.values(PALETTE)) expect(v).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
