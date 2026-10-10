// Adaptive engine v2. Rules follow docs/curriculum.md section C.
//  - Promote: last 10 answers at the current level have >= 9 correct AND the last 5 are all correct.
//  - Gap (demote): 2 wrong in the last 5, or 3 wrong in the last 10. Never below level 1.
//  - Slip: a single miss schedules a parallel re-ask of the same skill soon.
//  - Review mix: most questions at the current level, some one level below, a few two below.
//  - Skill choice is weighted toward skills behind their grade target, rarely practised, or recently missed.
import { SKILLS, SKILL_IDS, MAX_LEVEL, makeQuestion } from './skills.js';

export const WINDOW = 10;
export const CLEAN_TAIL = 5;
export const PROMOTE_MIN = 9;

// "Well above grade" line per grade for June (curriculum section B).
export const GRADE_TARGET = { 1: 4, 3: 6, 4: 7 };
// Where a kid is expected to be at grade level right now (October).
export const GRADE_NOW = { 1: 1, 3: 3, 4: 4 };

export function newSkillState(level) {
  return { level, window: [], answered: 0, correct: 0, lastDay: null, reviewOk: 0, reviewMiss: 0, times: [] };
}

export function initSkills(grade) {
  const out = {};
  for (const id of SKILL_IDS) {
    const s = SKILLS[id];
    const start = s.start?.[grade] ?? s.start?.[1] ?? 1;
    out[id] = newSkillState(start);
  }
  return out;
}

// Add any skills that did not exist when the profile was created.
export function ensureSkills(skills, grade) {
  for (const id of SKILL_IDS) {
    if (!skills[id]) skills[id] = newSkillState(SKILLS[id].start?.[grade] ?? 1);
    const s = skills[id];
    s.window ||= []; s.times ||= []; s.answered ||= 0; s.correct ||= 0; s.reviewOk ||= 0; s.reviewMiss ||= 0;
    if (s.history && !s.window.length) { s.window = s.history.slice(); delete s.history; }
    delete s.streak;
  }
  for (const id of Object.keys(skills)) if (!SKILLS[id]) delete skills[id];
  return skills;
}

export function isUnlocked(skills, id) {
  const u = SKILLS[id]?.unlock;
  if (!u) return true;
  return (skills[u.skill]?.level ?? 1) >= u.level;
}
export const unlockedSkillIds = (skills) => SKILL_IDS.filter((id) => isUnlocked(skills, id));

export function targetLevel(grade) { return GRADE_TARGET[grade] ?? 5; }

// Weighted skill pick. ctx: { lastSkill, reask (skill id to prefer), today }
export function pickSkill(skills, grade, ctx = {}) {
  if (ctx.reask && skills[ctx.reask]) return ctx.reask;
  const ids = unlockedSkillIds(skills).filter((id) => id !== ctx.lastSkill);
  const target = targetLevel(grade);
  const weights = ids.map((id) => {
    const s = skills[id];
    const recentMisses = s.window.slice(-5).filter((h) => !h).length;
    const freshness = 1 / (1 + s.answered / 25);
    const behind = Math.max(0, target - s.level) * 0.35;
    const stale = s.lastDay && s.lastDay !== ctx.today ? 0.6 : 0;
    return 1 + recentMisses * 1.2 + freshness * 2 + behind + stale;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ids.length; i++) { r -= weights[i]; if (r <= 0) return ids[i]; }
  return ids[ids.length - 1];
}

// Which level to ask at: mostly current, sometimes review below. Warm-ups use one below.
export function pickLevel(skill, { warmup = false } = {}) {
  const cur = skill.level;
  if (cur === 1) return 1;
  if (warmup) return cur - 1;
  const r = Math.random();
  if (r < 0.7) return cur;
  if (r < 0.9 || cur === 2) return cur - 1;
  return cur - 2;
}

export function nextQuestion(skills, grade, ctx = {}) {
  const id = pickSkill(skills, grade, ctx);
  const level = ctx.reask ? skills[id].level : pickLevel(skills[id], ctx);
  const q = makeQuestion(id, level);
  q.review = level < skills[id].level;
  return q;
}

/**
 * Record an answer. Returns { leveledUp, leveledDown, slip, mastered }.
 * Review answers (below current level) count toward stats but not the promotion window,
 * except that a missed review counts as half a miss by pushing one false into the window.
 */
export function recordResult(skills, id, correct, { level, ms, today } = {}) {
  const s = skills[id];
  const isReview = level !== undefined && level < s.level;
  s.answered++; if (correct) s.correct++;
  s.lastDay = today ?? s.lastDay;
  if (ms) { s.times.push(ms); if (s.times.length > 10) s.times.shift(); }
  const out = { leveledUp: false, leveledDown: false, slip: false, mastered: false };

  if (isReview) {
    if (correct) s.reviewOk++; else { s.reviewMiss++; s.window.push(false); }
  } else {
    s.window.push(!!correct);
  }
  if (s.window.length > WINDOW) s.window.splice(0, s.window.length - WINDOW);

  const last5 = s.window.slice(-5);
  const wrong5 = last5.filter((h) => !h).length;
  const wrong10 = s.window.filter((h) => !h).length;

  if (!correct) {
    if (wrong5 >= 2 || wrong10 >= 3) {
      if (s.level > 1) { s.level--; out.leveledDown = true; }
      s.window = [];
    } else {
      out.slip = true;
    }
    return out;
  }

  const okCount = s.window.filter(Boolean).length;
  if (s.window.length >= WINDOW && okCount >= PROMOTE_MIN && last5.length === CLEAN_TAIL && last5.every(Boolean)) {
    if (s.level < MAX_LEVEL) { s.level++; out.leveledUp = true; s.window = []; }
    else { out.mastered = true; }
  }
  return out;
}

// Summary helpers for progress screens.
export function levelProgress(skill) {
  // 0..1 toward the next promotion: fraction of a clean window achieved.
  const ok = skill.window.filter(Boolean).length;
  return Math.min(1, ok / PROMOTE_MIN);
}
// "Above grade" = at least two levels past where this grade starts in October
// (one level up is roughly the end of the current grade).
export function aboveGradeCount(skills, grade) {
  return SKILL_IDS.filter((id) => {
    const start = SKILLS[id].start?.[grade] ?? GRADE_NOW[grade] ?? 1;
    return skills[id] && skills[id].level > start + 1;
  }).length;
}
export function isAboveGrade(skillId, level, grade) {
  const start = SKILLS[skillId].start?.[grade] ?? 1;
  return level > start + 1;
}
