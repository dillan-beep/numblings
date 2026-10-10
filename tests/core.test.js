import { describe, it, expect } from 'vitest';
import { SKILLS, SKILL_IDS, MAX_LEVEL, makeQuestion, isCorrect } from '../src/math/skills.js';
import { initSkills, recordResult, nextQuestion, unlockedSkillIds, STREAK_TO_LEVEL_UP } from '../src/math/engine.js';
import { coinsForAnswer, roundTokens, petLevelFromXp, xpForLevel, DEFAULT_RULES } from '../src/economy.js';
import { newPet, tickPet, mood, applyEffect, stageIndex } from '../src/pets.js';

describe('skill generators', () => {
  for (const id of SKILL_IDS) {
    it(`${id}: every level produces a valid question`, () => {
      for (let level = 1; level <= MAX_LEVEL; level++) {
        for (let i = 0; i < 150; i++) {
          const q = makeQuestion(id, level);
          expect(q.prompt, `${id} L${level}`).toBeTruthy();
          expect(q.answer, `${id} L${level} answer`).toBeTruthy();
          expect(String(q.answer)).not.toMatch(/NaN|undefined|Infinity/);
          if (q.choices) {
            expect(q.choices.length).toBeGreaterThanOrEqual(2);
            expect(q.choices).toContain(q.answer);
            expect(new Set(q.choices).size).toBe(q.choices.length);
          }
          expect(isCorrect(q, q.answer)).toBe(true);
        }
      }
    });
  }

  it('isCorrect tolerates formatting', () => {
    expect(isCorrect({ answer: '12' }, ' 12 ')).toBe(true);
    expect(isCorrect({ answer: '4.5' }, '4.50')).toBe(true);
    expect(isCorrect({ answer: '1.25' }, '$1.25')).toBe(true);
    expect(isCorrect({ answer: '3/4' }, '3 / 4')).toBe(true);
    expect(isCorrect({ answer: '12' }, '13')).toBe(false);
    expect(isCorrect({ answer: '12' }, '')).toBe(false);
  });
});

describe('engine', () => {
  it('starting levels follow grade', () => {
    expect(initSkills(1).add.level).toBe(SKILLS.add.start[1]);
    expect(initSkills(4).mul.level).toBe(SKILLS.mul.start[4]);
  });

  it('levels up after a streak and down after misses', () => {
    const s = initSkills(3);
    const start = s.add.level;
    let up = false;
    for (let i = 0; i < STREAK_TO_LEVEL_UP; i++) up = recordResult(s, 'add', true).leveledUp || up;
    expect(up).toBe(true);
    expect(s.add.level).toBe(start + 1);
    recordResult(s, 'add', false);
    recordResult(s, 'add', false);
    const r = recordResult(s, 'add', false);
    expect(r.leveledDown).toBe(true);
    expect(s.add.level).toBe(start);
  });

  it('a wrong answer breaks the streak', () => {
    const s = initSkills(1);
    recordResult(s, 'sub', true); recordResult(s, 'sub', true);
    recordResult(s, 'sub', false);
    expect(s.sub.streak).toBe(0);
  });

  it('locked skills unlock as prerequisites rise', () => {
    const s = initSkills(1);
    expect(unlockedSkillIds(s)).not.toContain('mul');
    s.add.level = 3;
    expect(unlockedSkillIds(s)).toContain('mul');
  });

  it('nextQuestion returns a question from an unlocked skill', () => {
    const s = initSkills(1);
    for (let i = 0; i < 50; i++) {
      const q = nextQuestion(s, null);
      expect(unlockedSkillIds(s)).toContain(q.skillId);
    }
  });
});

describe('economy', () => {
  it('coins scale with level', () => {
    expect(coinsForAnswer(DEFAULT_RULES, 1)).toBe(5);
    expect(coinsForAnswer(DEFAULT_RULES, 5)).toBe(13);
  });
  it('round tokens include bonuses', () => {
    expect(roundTokens(DEFAULT_RULES, 7, 0, false)).toBe(1);
    expect(roundTokens(DEFAULT_RULES, 10, 1, true)).toBe(4);
  });
  it('pet level curve is monotonic', () => {
    expect(petLevelFromXp(0)).toBe(1);
    expect(petLevelFromXp(xpForLevel(5))).toBe(5);
    expect(petLevelFromXp(xpForLevel(5) - 1)).toBe(4);
  });
});

describe('pets', () => {
  it('stats decay over time and clamp', () => {
    const p = newPet('dragon', 'Spike');
    p.lastTick = Date.now() - 10 * 3_600_000;
    tickPet(p);
    expect(p.hunger).toBeCloseTo(40, 0);
    expect(p.energy).toBe(100);
    applyEffect(p, { hunger: 500 });
    expect(p.hunger).toBe(100);
  });
  it('mood reflects stats', () => {
    const p = newPet('cat', 'Tom');
    expect(mood(p).label).toBe('Thriving');
    p.hunger = 5;
    expect(mood(p).label).toBe('Starving');
  });
  it('stages', () => {
    expect(stageIndex(1)).toBe(0);
    expect(stageIndex(5)).toBe(1);
    expect(stageIndex(12)).toBe(2);
  });
});
