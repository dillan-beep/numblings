import { describe, it, expect } from 'vitest';
import { generateQuests, ensureQuests, questEvent } from '../src/quests.js';
import { checkBadges, BADGES } from '../src/achievements.js';
import { newBattle, applyAnswer, availableMonsters, MONSTER_LADDER, rollLoot, petMaxHp } from '../src/battle.js';
import { newProfile, KIDS } from '../src/state.js';
import { ITEMS } from '../src/pets.js';

const kid = () => newProfile(KIDS[1]);

describe('quests', () => {
  it('are deterministic per kid and day', () => {
    const p = kid();
    const a = generateQuests(p, '2026-10-10'), b = generateQuests(p, '2026-10-10'), c = generateQuests(p, '2026-10-11');
    expect(a.items.map((i) => i.id + i.goal)).toEqual(b.items.map((i) => i.id + i.goal));
    expect(a.items.length).toBe(3);
    expect(new Set(a.items.map((i) => i.id)).size).toBe(3);
    expect(a.items.map((i) => i.text).join()).not.toEqual(c.items.map((i) => i.text).join());
  });
  it('regenerate on a new day and track progress', () => {
    const p = kid();
    ensureQuests(p, '2026-10-10');
    const q = p.quests.items.find((i) => i.id === 'answer' || i.id === 'correct');
    for (let i = 0; i < q.goal; i++) questEvent(p, { type: 'answer', ok: true, skillId: 'add', level: 1 });
    expect(q.done).toBe(true);
    ensureQuests(p, '2026-10-11');
    expect(p.quests.day).toBe('2026-10-11');
  });
  it('streak quests use max not sum', () => {
    const p = kid(); p.quests = { day: 'x', items: [{ id: 'streak', goal: 5, progress: 0, done: false }] };
    questEvent(p, { type: 'streak', value: 3 }); questEvent(p, { type: 'streak', value: 3 });
    expect(p.quests.items[0].progress).toBe(3);
    expect(questEvent(p, { type: 'streak', value: 5 }).length).toBe(1);
  });
});

describe('badges', () => {
  it('awards once and only when earned', () => {
    const p = kid();
    expect(checkBadges(p).map((b) => b.id)).toEqual([]);
    p.stats.rounds = 1;
    expect(checkBadges(p).map((b) => b.id)).toEqual(['first']);
    expect(checkBadges(p)).toEqual([]);
  });
  it('every badge check is safe on a fresh profile', () => {
    const p = kid();
    for (const b of BADGES) expect(() => b.check(p, {})).not.toThrow();
  });
});

describe('battle', () => {
  it('unlocks monsters by pet level', () => {
    expect(availableMonsters(1).length).toBe(2);
    expect(availableMonsters(10).length).toBe(MONSTER_LADDER.length);
  });
  it('correct answers damage the monster, wrong ones damage the pet', () => {
    const m = MONSTER_LADDER[0];
    const b = newBattle(m, 3, { energy: 100 });
    const r = applyAnswer(b, m, { ok: true, questionLevel: 2, weaponId: 'sword' });
    expect(r.by).toBe('pet'); expect(b.monsterHp).toBeLessThan(m.hp); expect(b.combo).toBe(1);
    const r2 = applyAnswer(b, m, { ok: false, questionLevel: 2, weaponId: null });
    expect(r2.by).toBe('monster'); expect(b.petHp).toBeLessThan(b.petMax); expect(b.combo).toBe(0);
  });
  it('ends when a side hits zero', () => {
    const m = MONSTER_LADDER[0];
    const b = newBattle(m, 1, { energy: 100 });
    for (let i = 0; i < 20 && !b.over; i++) applyAnswer(b, m, { ok: true, questionLevel: 10, weaponId: 'lightsaber' });
    expect(b.over).toBe(true); expect(b.won).toBe(true);
  });
  it('energy affects pet hp and shield halves damage', () => {
    expect(petMaxHp(1, 100)).toBeGreaterThan(petMaxHp(1, 0));
    const m = MONSTER_LADDER[3];
    let shielded = 0, plain = 0;
    for (let i = 0; i < 50; i++) {
      const b1 = newBattle(m, 1, { energy: 100 }); applyAnswer(b1, m, { ok: false, questionLevel: 1, weaponId: 'shield' }); shielded += b1.petMax - b1.petHp;
      const b2 = newBattle(m, 1, { energy: 100 }); applyAnswer(b2, m, { ok: false, questionLevel: 1, weaponId: null }); plain += b2.petMax - b2.petHp;
    }
    expect(shielded).toBeLessThan(plain);
  });
  it('loot never gives owned or consumable items', () => {
    for (let i = 0; i < 100; i++) {
      const { item } = rollLoot(MONSTER_LADDER[7], new Set(['sword']), ITEMS);
      if (item) { expect(item.id).not.toBe('sword'); expect(['food', 'toy', 'bg']).not.toContain(item.cat); }
    }
  });
});

import { newPlacement, drawQuestion, answer, finishPlacement, newLightning, finishLightning, needsPlacement } from '../src/game.js';
import { defaultState } from '../src/state.js';
import { newPet } from '../src/pets.js';
import { unlockedSkillIds } from '../src/math/engine.js';

const fresh = (idx = 1) => { const st = defaultState(); const p = st.profiles[KIDS[idx].id]; p.pet = newPet('cat', 'Tom'); return { st, p }; };

describe('placement', () => {
  it('asks one question per unlocked skill at one level up and bumps correct ones', () => {
    const { st, p } = fresh(1);
    expect(needsPlacement(p)).toBe(true);
    const r = newPlacement(st, p);
    expect(r.total).toBe(unlockedSkillIds(p.skills).length);
    const starts = Object.fromEntries(Object.entries(p.skills).map(([k, v]) => [k, v.level]));
    let i = 0;
    while (r.queue.length) {
      drawQuestion(st, p, r);
      expect(r.q.level).toBe(Math.min(10, starts[r.q.skillId] + 1));
      answer(st, p, r, i % 2 === 0 ? r.q.answer : 'zzz');
      i++;
    }
    finishPlacement(st, p, r);
    expect(p.placed).toBe(true);
    expect(needsPlacement(p)).toBe(false);
    for (const res of r.results) expect(p.skills[res.skillId].level).toBe(res.ok ? starts[res.skillId] + 1 : starts[res.skillId]);
    expect(r.bumped.length).toBe(r.results.filter((x) => x.ok).length);
    for (const id of Object.keys(p.skills)) expect(p.skills[id].window.length).toBe(0);
  });
});

describe('lightning', () => {
  it('serves quick typeable facts without repeating prompts', () => {
    const { st, p } = fresh(0);
    const r = newLightning(st, p); r.endsAt = Date.now() + 60000;
    const prompts = [];
    for (let i = 0; i < 20; i++) { drawQuestion(st, p, r); prompts.push(r.q.prompt); expect(r.q.choices).toBeUndefined(); expect(r.q.visual).toBeUndefined(); answer(st, p, r, r.q.answer); }
    expect(new Set(prompts).size).toBeGreaterThanOrEqual(11);
    expect(r.correct).toBe(20);
    for (const id of Object.keys(p.skills)) expect(p.skills[id].window.length).toBe(0);
  });
  it('pays tokens by score', () => {
    const { st, p } = fresh(2);
    const r = newLightning(st, p); r.correct = 15; finishLightning(st, p, r);
    expect(r.tokens).toBe(2); expect(p.stats.lightningBest).toBe(15); expect(r.isBest).toBe(true);
    const r2 = newLightning(st, p); r2.correct = 3; finishLightning(st, p, r2);
    expect(r2.tokens).toBe(0); expect(r2.isBest).toBe(false);
  });
});
