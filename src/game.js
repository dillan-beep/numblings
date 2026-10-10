// Gameplay logic shared by Train and Battle: answering, rewards, quests, badges, days.
import { recordResult, nextQuestion, ensureSkills, aboveGradeCount } from './math/engine.js';
import { SKILLS } from './math/skills.js';
import { isCorrect } from './math/skills.js';
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
  const warmup = round.mode === 'train' && round.n < 2;
  const q = nextQuestion(p.skills, p.grade, { lastSkill: round.lastSkill, reask: round.reask, today: todayKey(), warmup });
  round.reask = null;
  round.lastSkill = q.skillId;
  round.q = q; round.input = ''; round.feedback = null; round.tutor = null;
  round.qStartedAt = Date.now();
  return q;
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
  const r = recordResult(p.skills, q.skillId, ok, { level: q.level, ms, today });
  p.stats.answered++;
  round.n++;
  let coins = 0, xp = 0;
  const m = mood(p.pet);
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
