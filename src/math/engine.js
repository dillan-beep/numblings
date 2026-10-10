// Adaptive skill selection + level movement.
import { SKILLS, SKILL_IDS, MAX_LEVEL, makeQuestion } from './skills.js';

export const STREAK_TO_LEVEL_UP = 5;
export const HISTORY = 6;

export function initSkills(grade) {
  const out = {};
  for (const id of SKILL_IDS) {
    const s = SKILLS[id];
    const start = s.start[grade] ?? s.start[1] ?? 1;
    out[id] = { level: start, streak: 0, history: [], answered: 0, correct: 0 };
  }
  return out;
}

export function isUnlocked(skills, id) {
  const u = SKILLS[id].unlock;
  if (!u) return true;
  return (skills[u.skill]?.level ?? 1) >= u.level;
}

export function unlockedSkillIds(skills) {
  return SKILL_IDS.filter((id) => isUnlocked(skills, id));
}

// Weighted pick: skills with fewer answers and recent misses get picked more.
export function pickSkill(skills, lastSkill) {
  const ids = unlockedSkillIds(skills).filter((id) => id !== lastSkill);
  const weights = ids.map((id) => {
    const s = skills[id];
    const recentMisses = s.history.filter((h) => !h).length;
    const freshness = 1 / (1 + s.answered / 20);
    return 1 + recentMisses * 1.5 + freshness * 2;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ids.length; i++) {
    r -= weights[i];
    if (r <= 0) return ids[i];
  }
  return ids[ids.length - 1];
}

export function nextQuestion(skills, lastSkill) {
  const id = pickSkill(skills, lastSkill);
  return makeQuestion(id, skills[id].level);
}

// Mutates skills[id]; returns { leveledUp, leveledDown }.
export function recordResult(skills, id, correct) {
  const s = skills[id];
  s.answered++;
  s.history.push(correct);
  if (s.history.length > HISTORY) s.history.shift();
  let leveledUp = false, leveledDown = false;
  if (correct) {
    s.correct++;
    s.streak++;
    if (s.streak >= STREAK_TO_LEVEL_UP && s.level < MAX_LEVEL) {
      s.level++;
      s.streak = 0;
      s.history = [];
      leveledUp = true;
    }
  } else {
    s.streak = 0;
    const misses = s.history.filter((h) => !h).length;
    if (misses >= 3 && s.level > 1) {
      s.level--;
      s.history = [];
      leveledDown = true;
    }
  }
  return { leveledUp, leveledDown };
}
