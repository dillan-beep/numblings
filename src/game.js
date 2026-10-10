// Gameplay logic shared by Train and Battle: answering, rewards, quests, badges, days.
import { recordResult, nextQuestion, ensureSkills, aboveGradeCount, unlockedSkillIds } from './math/engine.js';
import { SKILLS, MAX_LEVEL, makeQuestion, isCorrect } from './math/skills.js';
import { shuffle } from './math/rng.js';
import { ROUND_SIZE, coinsForAnswer, roundTokens, petLevelFromXp } from './economy.js';
import { mood, stageIndex, applyEffect, itemById, CONSUMABLE } from './pets.js';
import { ensureQuests, questEvent } from './quests.js';
import { checkBadges } from './achievements.js';
import { todayKey, logEvent } from './state.js';

export { ROUND_SIZE };

/** Call once per screen load for a profile: ticks day-based structures. */
export function prepareProfile(state, p) {
  ensureSkills(p.skills, p.grade);
  ensureQuests(p, todayKey());
  return p;
}

export function newRound(state, p, { mode = 'train', monster = null } = {}) {
  return {
    mode, monster,
    n: 0, correct: 0, coins: 0, xp: 0, levelUps: [], levelDowns: [], results: [],
    q: null, input: '', feedback: null, lastSkill: null, reask: null, done: false,
    startedAt: Date.now(), qStartedAt: 0, questsDone: [], badges: [], tutor: null,
  };
}

export function drawQuestion(state, p, round) {
  let q;
  if (round.mode === 'placement') {
    const id = round.queue.shift();
    q = makeQuestion(id, Math.min(MAX_LEVEL, p.skills[id].level + 1));
    q.review = false;
  } else if (round.mode === 'lightning') {
    round.seen ||= new Set();
    q = lightningQuestion(p, round.lastSkill, round.seen);
    round.seen.add(q.prompt);
  } else {
    const warmup = round.mode === 'train' && round.n < 2;
    q = nextQuestion(p.skills, p.grade, { lastSkill: round.lastSkill, reask: round.reask, today: todayKey(), warmup });
  }
  round.reask = null;
  round.lastSkill = q.skillId;
  round.q = q; round.input = ''; round.feedback = null; round.tutor = null;
  round.qStartedAt = Date.now();
  return q;
}

/* ---------- Placement (first play) ---------- */

export function needsPlacement(p) {
  return !p.placed && p.stats.rounds === 0;
}

export function newPlacement(state, p) {
  const round = newRound(state, p, { mode: 'placement' });
  round.queue = shuffle(unlockedSkillIds(p.skills));
  round.total = round.queue.length;
  return round;
}

export function finishPlacement(state, p, round) {
  const bumped = [];
  for (const r of round.results) {
    if (r.ok && p.skills[r.skillId].level < r.level) { p.skills[r.skillId].level = r.level; bumped.push(r.skillId); }
  }
  p.placed = true;
  p.tokens += 1; p.tokensEarned += 1;
  round.bumped = bumped; round.tokens = 1; round.done = true;
  p.stats.minutes = (p.stats.minutes || 0) + (Date.now() - round.startedAt) / 60000;
  logEvent(p, `Placement: ${round.correct}/${round.total}, bumped ${bumped.length} skills`);
  return round;
}

/* ---------- Lightning (60-second fact drill) ---------- */

export const LIGHTNING_SECONDS = 60;
const LIGHTNING_SKILLS = ['add', 'sub', 'mental', 'mul', 'div'];

export function newLightning(state, p) {
  const round = newRound(state, p, { mode: 'lightning' });
  round.endsAt = Date.now() + LIGHTNING_SECONDS * 1000;
  return round;
}

function lightningQuestion(p, lastSkill, seen = new Set()) {
  const unlocked = unlockedSkillIds(p.skills);
  const ids = LIGHTNING_SKILLS.filter((id) => p.skills[id] && unlocked.includes(id));
  const pool = ids.length ? ids : ['add'];
  let fallback = null;
  for (let tries = 0; tries < 16; tries++) {
    const id = pool[Math.floor(Math.random() * pool.length)];
    // mix one below, current, and one above so facts stay quick but varied
    const r = Math.random();
    const level = Math.max(1, Math.min(p.skills[id].level + (r < 0.25 ? -1 : r < 0.7 ? 0 : 1), 6));
    const q = makeQuestion(id, level);
    if (q.visual || q.choices || q.prompt.length > 40) continue;
    q.review = false;
    if (!seen.has(q.prompt)) return q;
    fallback ||= q;
  }
  if (fallback) return fallback;
  const q = makeQuestion('add', Math.max(1, Math.min(p.skills.add?.level || 1, 4)));
  delete q.visual; delete q.choices; q.review = false; return q;
}

export function finishLightning(state, p, round) {
  const c = round.correct;
  const t = c >= 25 ? 3 : c >= 15 ? 2 : c >= 8 ? 1 : 0;
  p.tokens += t; p.tokensEarned += t;
  p.stats.lightningBest = Math.max(p.stats.lightningBest || 0, c);
  p.stats.lightningRuns = (p.stats.lightningRuns || 0) + 1;
  p.stats.minutes = (p.stats.minutes || 0) + (Date.now() - round.startedAt) / 60000;
  round.tokens = t; round.done = true;
  round.isBest = c > 0 && c >= (p.stats.lightningBest || 0);
  const today = todayKey();
  const h = p.history.find((x) => x.day === today); if (h) h.tokens += t;
  logEvent(p, `Lightning: ${c} correct in ${LIGHTNING_SECONDS}s, +${t} tokens`);
  round.badges.push(...checkBadges(p, { aboveGradeCount: aboveGradeCount(p.skills, p.grade) }));
  return round;
}

/**
 * Apply an answer. Mutates profile + round. Returns the feedback object.
 * Does NOT touch battle HP; the battle screen calls battle.applyAnswer separately.
 */
export function answer(state, p, round, given) {
  const q = round.q;
  const ok = isCorrect(q, given);
  const ms = Date.now() - round.qStartedAt;
  const today = todayKey();
  const light = round.mode === 'placement' || round.mode === 'lightning';
  // Placement and lightning never move skill levels; they only pay out.
  const r = light ? { leveledUp: false, leveledDown: false, slip: false } : recordResult(p.skills, q.skillId, ok, { level: q.level, ms, today });
  p.stats.answered++;
  round.n++;
  let coins = 0, xp = 0;
  const m = mood(p.pet);
  if (light) {
    if (ok) {
      coins = round.mode === 'lightning' ? state.rules.coinsPerCorrect : coinsForAnswer(state.rules, q.level);
      xp = round.mode === 'lightning' ? 4 : state.rules.xpPerCorrect;
      p.coins += coins; round.coins += coins; round.correct++; p.stats.correct++; p.pet.xp += xp; round.xp += xp;
      p.stats.answerStreak++; p.stats.bestAnswerStreak = Math.max(p.stats.bestAnswerStreak || 0, p.stats.answerStreak);
    } else p.stats.answerStreak = 0;
    const done = questEvent(p, { type: 'answer', ok, skillId: q.skillId, level: q.level });
    for (const d of done) { p.tokens += d.reward; p.tokensEarned += d.reward; p.stats.questsDone = (p.stats.questsDone || 0) + 1; }
    round.questsDone.push(...done);
    round.results.push({ skillId: q.skillId, level: q.level, ok, prompt: q.prompt, answer: q.answer, given, explain: q.explain, ms });
    round.feedback = { ok, coins, xp, levelUp: false, levelDown: false, slip: false, questsDone: done };
    dayHistory(p, today, ok);
    return round.feedback;
  }
  if (ok) {
    coins = Math.round(coinsForAnswer(state.rules, q.level) * m.bonus * (q.review ? 0.5 : 1));
    xp = Math.round(state.rules.xpPerCorrect * (q.review ? 0.5 : 1));
    p.coins += coins; round.coins += coins; round.correct++; p.stats.correct++;
    p.pet.xp += xp; round.xp += xp;
    p.stats.answerStreak++;
    p.stats.bestAnswerStreak = Math.max(p.stats.bestAnswerStreak || 0, p.stats.answerStreak);
    if ((p.stats.wrongRun || 0) >= 3) p.stats.comebacks = (p.stats.comebacks || 0) + 1;
    p.stats.wrongRun = 0;
  } else {
    p.stats.answerStreak = 0;
    p.stats.wrongRun = (p.stats.wrongRun || 0) + 1;
    if (r.slip) round.reask = q.skillId; // parallel re-ask soon
  }
  if (r.leveledUp) {
    round.levelUps.push(q.skillId);
    p.tokens += state.rules.tokensPerLevelUp; p.tokensEarned += state.rules.tokensPerLevelUp;
    logEvent(p, `Leveled up ${SKILLS[q.skillId].name} to ${p.skills[q.skillId].level}`);
  }
  if (r.leveledDown) round.levelDowns.push(q.skillId);

  // quests
  const done = [];
  done.push(...questEvent(p, { type: 'answer', ok, skillId: q.skillId, level: q.level }));
  if (ok) done.push(...questEvent(p, { type: 'streak', value: p.stats.answerStreak }));
  if (r.leveledUp) done.push(...questEvent(p, { type: 'levelup' }));
  for (const d of done) { p.tokens += d.reward; p.tokensEarned += d.reward; p.stats.questsDone = (p.stats.questsDone || 0) + 1; logEvent(p, `Quest done: ${d.text} (+${d.reward} tokens)`); }
  round.questsDone.push(...done);

  round.results.push({ skillId: q.skillId, level: q.level, ok, prompt: q.prompt, answer: q.answer, given, explain: q.explain, ms });
  round.feedback = { ok, coins, xp, levelUp: r.leveledUp, levelDown: r.leveledDown, slip: r.slip, questsDone: done };
  dayHistory(p, today, ok);
  round.badges.push(...checkBadges(p, { aboveGradeCount: aboveGradeCount(p.skills, p.grade) }));
  return round.feedback;
}

export function finishRound(state, p, round) {
  const today = todayKey();
  const firstToday = p.stats.lastRoundDay !== today;
  if (firstToday) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    p.stats.dayStreak = p.stats.lastRoundDay === todayKey(y) ? p.stats.dayStreak + 1 : 1;
    p.stats.bestStreak = Math.max(p.stats.bestStreak, p.stats.dayStreak);
    p.stats.lastRoundDay = today;
  }
  const perfect = round.correct === ROUND_SIZE;
  if (perfect) p.stats.perfectRounds = (p.stats.perfectRounds || 0) + 1;
  const t = roundTokens(state.rules, round.correct, 0, firstToday);
  p.tokens += t; p.tokensEarned += t; p.stats.rounds++;
  p.stats.minutes = (p.stats.minutes || 0) + (Date.now() - round.startedAt) / 60000;
  round.tokens = t; round.firstToday = firstToday; round.done = true;
  const oldLvl = petLevelFromXp(p.pet.xp - round.xp), newLvl = petLevelFromXp(p.pet.xp);
  round.petLevelUp = newLvl > oldLvl ? newLvl : null;
  round.evolved = round.petLevelUp && stageIndex(newLvl) > stageIndex(oldLvl);
  if (round.evolved) p.stats.evolutions = (p.stats.evolutions || 0) + 1;
  const done = questEvent(p, { type: 'round', perfect });
  for (const d of done) { p.tokens += d.reward; p.tokensEarned += d.reward; p.stats.questsDone = (p.stats.questsDone || 0) + 1; }
  round.questsDone.push(...done);
  const h = p.history.find((x) => x.day === today); if (h) h.tokens += t + done.reduce((a, d) => a + d.reward, 0);
  logEvent(p, `Round: ${round.correct}/${ROUND_SIZE}, +${round.coins} coins, +${t} tokens`);
  round.badges.push(...checkBadges(p, { aboveGradeCount: aboveGradeCount(p.skills, p.grade) }));
  return round;
}

export function battleOutcome(state, p, round, battle, monster, loot) {
  const today = todayKey();
  if (battle.won) {
    p.stats.battlesWon = (p.stats.battlesWon || 0) + 1;
    if (monster.boss) p.stats.bossesBeaten = (p.stats.bossesBeaten || 0) + 1;
    p.coins += loot.coins;
    if (loot.item) { p.pet.inventory[loot.item.id] = (p.pet.inventory[loot.item.id] || 0) + 1; }
    const done = questEvent(p, { type: 'battlewin' });
    for (const d of done) { p.tokens += d.reward; p.tokensEarned += d.reward; p.stats.questsDone = (p.stats.questsDone || 0) + 1; }
    round.questsDone.push(...done);
    logEvent(p, `Beat ${monster.name}: +${loot.coins} coins${loot.item ? `, found ${loot.item.name}` : ''}`);
  } else {
    p.stats.battlesLost = (p.stats.battlesLost || 0) + 1;
    logEvent(p, `Lost to ${monster.name}`);
  }
  p.stats.minutes = (p.stats.minutes || 0) + (Date.now() - round.startedAt) / 60000;
  round.done = true;
  const oldLvl = petLevelFromXp(p.pet.xp - round.xp), newLvl = petLevelFromXp(p.pet.xp);
  round.petLevelUp = newLvl > oldLvl ? newLvl : null;
  round.evolved = round.petLevelUp && stageIndex(newLvl) > stageIndex(oldLvl);
  if (round.evolved) p.stats.evolutions = (p.stats.evolutions || 0) + 1;
  round.badges.push(...checkBadges(p, { aboveGradeCount: aboveGradeCount(p.skills, p.grade) }));
  if (p.stats.lastRoundDay !== today) { p.stats.lastRoundDay = today; p.stats.dayStreak = Math.max(1, p.stats.dayStreak); }
}

export function buyItem(state, p, id) {
  const item = itemById(id);
  if (!item || p.coins < item.price) return { ok: false, reason: 'coins' };
  p.coins -= item.price;
  p.stats.purchases = (p.stats.purchases || 0) + 1;
  p.pet.inventory[id] = (p.pet.inventory[id] || 0) + 1;
  logEvent(p, `Bought ${item.name} for ${item.price} coins`);
  if (CONSUMABLE.has(item.cat)) { useItem(state, p, id); }
  else p.pet.equipped[item.cat] = id;
  checkBadges(p);
  return { ok: true, item };
}

export function useItem(state, p, id) {
  const item = itemById(id);
  if (!item || !(p.pet.inventory[id] > 0)) return false;
  p.pet.inventory[id]--; if (p.pet.inventory[id] === 0) delete p.pet.inventory[id];
  applyEffect(p.pet, item.effect || {});
  if (item.cat === 'food') { const d = questEvent(p, { type: 'feed' }); for (const x of d) { p.tokens += x.reward; p.tokensEarned += x.reward; p.stats.questsDone = (p.stats.questsDone || 0) + 1; } }
  return true;
}

function dayHistory(p, day, ok) {
  let h = p.history.find((x) => x.day === day);
  if (!h) { h = { day, answered: 0, correct: 0, tokens: 0 }; p.history.push(h); if (p.history.length > 120) p.history.shift(); }
  h.answered++; if (ok) h.correct++;
}
