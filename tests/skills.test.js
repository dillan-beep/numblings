// Generic harness: every registered skill must produce valid questions at every level.
import { describe, it, expect } from 'vitest';
import { SKILLS, SKILL_IDS, MAX_LEVEL, makeQuestion, isCorrect } from '../src/math/skills.js';

const VISUAL_TYPES = new Set(['tenframe', 'counters', 'numberline', 'base10', 'array', 'fractionbar', 'fractioncircle', 'clock', 'coins', 'shape', 'angle', 'grid', 'bargraph', 'pictograph', 'balance', 'ruler', 'thermometer', 'area']);
const PAD_OK = /^-?[0-9]*\.?[0-9]*(\/[0-9]+)?$|^\d{1,2}:\d{2}$/;

describe('skill registry', () => {
  it('has skills', () => { expect(SKILL_IDS.length).toBeGreaterThan(0); });
  for (const id of SKILL_IDS) {
    const def = SKILLS[id];
    it(`${id}: definition is complete`, () => {
      expect(def.name).toBeTruthy();
      expect(def.emoji).toBeTruthy();
      expect(def.start && def.start[1] !== undefined && def.start[3] && def.start[4]).toBeTruthy();
      if (def.unlock) { expect(def.unlock.skill).toBeTruthy(); expect(def.unlock.level).toBeGreaterThan(0); }
    });
    it(`${id}: every level produces valid questions`, () => {
      for (let level = 1; level <= MAX_LEVEL; level++) {
        const prompts = new Set();
        for (let i = 0; i < 120; i++) {
          const q = makeQuestion(id, level);
          const tag = `${id} L${level}: ${q.prompt}`;
          expect(q.prompt, tag).toBeTruthy();
          expect(String(q.answer).length, tag).toBeGreaterThan(0);
          expect(String(q.answer), tag).not.toMatch(/NaN|undefined|Infinity|null/);
          expect(q.prompt, tag).not.toMatch(/NaN|undefined|Infinity|null|\[object/);
          expect(q.explain, `${tag} needs explain`).toBeTruthy();
          if (q.choices) {
            expect(q.choices.length, tag).toBeGreaterThanOrEqual(2);
            expect(q.choices.length, tag).toBeLessThanOrEqual(6);
            expect(q.choices, tag).toContain(String(q.answer));
            expect(new Set(q.choices).size, tag).toBe(q.choices.length);
          } else if (q.input === 'number') {
            expect(String(q.answer), `${tag} must be typeable on the number pad`).toMatch(PAD_OK);
          }
          if (q.visual) {
            expect(VISUAL_TYPES.has(q.visual.type), `${tag} unknown visual ${q.visual.type}`).toBe(true);
          }
          if (q.input === 'visual') expect(q.visual, tag).toBeTruthy();
          expect(isCorrect(q, q.answer), tag).toBe(true);
          prompts.add(q.prompt + '|' + q.answer);
        }
        expect(prompts.size, `${id} L${level} should vary (got ${prompts.size} unique of 120)`).toBeGreaterThanOrEqual(level <= 2 ? 4 : 8);
      }
    });
  }
});

describe('answer checking', () => {
  it('tolerates formatting', () => {
    expect(isCorrect({ answer: '12' }, ' 12 ')).toBe(true);
    expect(isCorrect({ answer: '4.5' }, '4.50')).toBe(true);
    expect(isCorrect({ answer: '1.25' }, '$1.25')).toBe(true);
    expect(isCorrect({ answer: '3/4' }, '6/8')).toBe(true);
    expect(isCorrect({ answer: '7:05' }, '7:5')).toBe(true);
    expect(isCorrect({ answer: '-3' }, '-3')).toBe(true);
    expect(isCorrect({ answer: '12' }, '13')).toBe(false);
    expect(isCorrect({ answer: '12' }, '')).toBe(false);
    expect(isCorrect({ answer: 'acute' }, 'Acute')).toBe(true);
    expect(isCorrect({ answer: '9/2' }, '4.5')).toBe(true);
    expect(isCorrect({ answer: '9/2' }, '4 1/2')).toBe(true);
    expect(isCorrect({ answer: '-3/4' }, '-0.75')).toBe(true);
    expect(isCorrect({ answer: '3/5', choices: ['3/5', '6/10'] }, '6/10')).toBe(false);
    expect(isCorrect({ answer: '0.5' }, '.5')).toBe(true);
  });
});
