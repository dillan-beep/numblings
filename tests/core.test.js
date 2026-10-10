import { describe, it, expect } from 'vitest';
import { SKILLS, SKILL_IDS } from '../src/math/skills.js';
import { initSkills, ensureSkills, recordResult, nextQuestion, unlockedSkillIds, pickLevel, WINDOW, PROMOTE_MIN, aboveGradeCount } from '../src/math/engine.js';
import { coinsForAnswer, roundTokens, petLevelFromXp, xpForLevel, DEFAULT_RULES } from '../src/economy.js';
import { newPet, tickPet, mood, applyEffect, stageIndex } from '../src/pets.js';

const firstSkill = () => SKILL_IDS[0];

describe('engine', () => {
  it('starting levels follow grade', () => {
    const id = firstSkill();
    expect(initSkills(1)[id].level).toBe(SKILLS[id].start[1]);
    expect(initSkills(4)[id].level).toBe(SKILLS[id].start[4]);
  });

  it('promotes after 9 of 10 with a clean last 5', () => {
    const s = initSkills(3); const id = firstSkill(); s[id].level = 3;
    const seq = [true, false, true, true, true, true, true, true, true, true];
    let up = false;
    for (const ok of seq) up = recordResult(s, id, ok, { level: 3 }).leveledUp || up;
    expect(up).toBe(true);
    expect(s[id].level).toBe(4);
    expect(s[id].window).toEqual([]);
  });

  it('does not promote on a 10-streak with a recent miss in the last 5', () => {
    const s = initSkills(3); const id = firstSkill(); s[id].level = 3;
    const seq = [true, true, true, true, true, true, true, false, true, true];
    for (const ok of seq) recordResult(s, id, ok, { level: 3 });
    expect(s[id].level).toBe(3);
  });

  it('demotes on 2 wrong in the last 5 and treats a single miss as a slip', () => {
    const s = initSkills(3); const id = firstSkill(); s[id].level = 4;
    expect(recordResult(s, id, true, { level: 4 }).slip).toBe(false);
    const r1 = recordResult(s, id, false, { level: 4 });
    expect(r1.slip).toBe(true); expect(s[id].level).toBe(4);
    recordResult(s, id, true, { level: 4 });
    const r2 = recordResult(s, id, false, { level: 4 });
    expect(r2.leveledDown).toBe(true); expect(s[id].level).toBe(3);
  });

  it('never goes below level 1 and caps at 10', () => {
    const s = initSkills(1); const id = firstSkill(); s[id].level = 1;
    for (let i = 0; i < 10; i++) recordResult(s, id, false, { level: 1 });
    expect(s[id].level).toBe(1);
    s[id].level = 10; s[id].window = [];
    for (let i = 0; i < WINDOW; i++) recordResult(s, id, true, { level: 10 });
    expect(s[id].level).toBe(10);
  });

  it('review answers do not count toward promotion but a missed review hurts', () => {
    const s = initSkills(3); const id = firstSkill(); s[id].level = 5;
    for (let i = 0; i < WINDOW; i++) recordResult(s, id, true, { level: 4 });
    expect(s[id].level).toBe(5);
    expect(s[id].window.length).toBe(0);
    recordResult(s, id, false, { level: 4 });
    expect(s[id].window).toEqual([false]);
  });

  it('locked skills unlock as prerequisites rise', () => {
    const s = initSkills(1);
    const locked = SKILL_IDS.filter((id) => SKILLS[id].unlock);
    if (!locked.length) return;
    const id = locked[0]; const u = SKILLS[id].unlock;
    s[u.skill].level = 1;
    expect(unlockedSkillIds(s)).not.toContain(id);
    s[u.skill].level = u.level;
    expect(unlockedSkillIds(s)).toContain(id);
  });

  it('nextQuestion only asks unlocked skills and marks review levels', () => {
    const s = initSkills(4);
    for (let i = 0; i < 60; i++) {
      const q = nextQuestion(s, 4, { today: 'd' });
      expect(unlockedSkillIds(s)).toContain(q.skillId);
      expect(q.level).toBeLessThanOrEqual(s[q.skillId].level);
      expect(q.review).toBe(q.level < s[q.skillId].level);
    }
  });

  it('pickLevel stays within two below and warmups use one below', () => {
    for (let i = 0; i < 100; i++) {
      const l = pickLevel({ level: 6 }); expect(l).toBeGreaterThanOrEqual(4); expect(l).toBeLessThanOrEqual(6);
    }
    expect(pickLevel({ level: 6 }, { warmup: true })).toBe(5);
    expect(pickLevel({ level: 1 })).toBe(1);
  });

  it('ensureSkills migrates old shapes', () => {
    const s = { [firstSkill()]: { level: 2, streak: 3, history: [true, false] } };
    ensureSkills(s, 3);
    expect(s[firstSkill()].window).toEqual([true, false]);
    expect(s[firstSkill()].streak).toBeUndefined();
    expect(Object.keys(s).length).toBe(SKILL_IDS.length);
  });

  it('counts skills above grade', () => {
    const s = initSkills(1);
    s[firstSkill()].level = 3;
    expect(aboveGradeCount(s, 1)).toBeGreaterThanOrEqual(1);
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
    expect(stageIndex(1)).toBe(0); expect(stageIndex(5)).toBe(1); expect(stageIndex(12)).toBe(2);
  });
});
