// Badges. check(profile, ctx) returns true when earned. Earned ids live in profile.badges = { id: timestamp }.
import { SKILL_IDS, MAX_LEVEL } from './math/skills.js';

const skillsAt = (p, lvl) => SKILL_IDS.filter((id) => p.skills[id].level >= lvl).length;

export const BADGES = [
  { id: 'first', name: 'First Steps', desc: 'Finish your first round', emoji: '👣', check: (p) => p.stats.rounds >= 1 },
  { id: 'hatch', name: 'Hatched!', desc: 'Hatch a pet', emoji: '🐣', check: (p) => !!p.pet },
  { id: 'ten', name: 'Ten in a Row', desc: 'Answer 10 in a row correctly', emoji: '🔟', check: (p) => (p.stats.bestAnswerStreak || 0) >= 10 },
  { id: 'twenty', name: 'Unstoppable', desc: '20 in a row correctly', emoji: '⚡', check: (p) => (p.stats.bestAnswerStreak || 0) >= 20 },
  { id: 'perfect', name: 'Perfect Round', desc: 'Get 10/10 in a round', emoji: '🏆', check: (p) => (p.stats.perfectRounds || 0) >= 1 },
  { id: 'perfect5', name: 'Perfectionist', desc: 'Five perfect rounds', emoji: '💎', check: (p) => (p.stats.perfectRounds || 0) >= 5 },
  { id: 'hundred', name: 'Century', desc: 'Answer 100 questions', emoji: '💯', check: (p) => p.stats.answered >= 100 },
  { id: 'fivehundred', name: 'Math Machine', desc: 'Answer 500 questions', emoji: '🤖', check: (p) => p.stats.answered >= 500 },
  { id: 'thousand', name: 'Legend', desc: 'Answer 1,000 questions', emoji: '🌟', check: (p) => p.stats.answered >= 1000 },
  { id: 'streak3', name: 'Habit Builder', desc: 'Play 3 days in a row', emoji: '📅', check: (p) => p.stats.bestStreak >= 3 },
  { id: 'streak7', name: 'Week Warrior', desc: 'Play 7 days in a row', emoji: '🗓️', check: (p) => p.stats.bestStreak >= 7 },
  { id: 'streak30', name: 'Monthly Master', desc: 'Play 30 days in a row', emoji: '🏅', check: (p) => p.stats.bestStreak >= 30 },
  { id: 'lvl5', name: 'Climber', desc: 'Get any skill to level 5', emoji: '🧗', check: (p) => skillsAt(p, 5) >= 1 },
  { id: 'lvl10', name: 'Summit', desc: 'Max out a skill at level 10', emoji: '🏔️', check: (p) => skillsAt(p, MAX_LEVEL) >= 1 },
  { id: 'all5', name: 'Well Rounded', desc: 'Every skill at level 5+', emoji: '🎓', check: (p) => skillsAt(p, 5) === SKILL_IDS.length },
  { id: 'above', name: 'Above Grade', desc: 'Pass your grade target in 5 skills', emoji: '🚀', check: (p, ctx) => ctx?.aboveGradeCount >= 5 },
  { id: 'rich', name: 'Rich Pet', desc: 'Hold 1,000 coins', emoji: '💰', check: (p) => p.coins >= 1000 },
  { id: 'shopper', name: 'Shopper', desc: 'Buy 10 things', emoji: '🛍️', check: (p) => (p.stats.purchases || 0) >= 10 },
  { id: 'evolve', name: 'Evolution!', desc: 'Evolve your pet', emoji: '✨', check: (p) => (p.stats.evolutions || 0) >= 1 },
  { id: 'evolve2', name: 'Final Form', desc: 'Reach the final evolution', emoji: '🐉', check: (p) => (p.stats.evolutions || 0) >= 2 },
  { id: 'battle1', name: 'Monster Slayer', desc: 'Win a monster battle', emoji: '⚔️', check: (p) => (p.stats.battlesWon || 0) >= 1 },
  { id: 'battle10', name: 'Champion', desc: 'Win 10 battles', emoji: '🛡️', check: (p) => (p.stats.battlesWon || 0) >= 10 },
  { id: 'boss', name: 'Boss Buster', desc: 'Defeat a boss', emoji: '👑', check: (p) => (p.stats.bossesBeaten || 0) >= 1 },
  { id: 'quests10', name: 'Quest Hero', desc: 'Complete 10 daily quests', emoji: '📜', check: (p) => (p.stats.questsDone || 0) >= 10 },
  { id: 'tokens50', name: 'Token Collector', desc: 'Earn 50 tokens', emoji: '🎟️', check: (p) => p.tokensEarned >= 50 },
  { id: 'tokens250', name: 'Token Tycoon', desc: 'Earn 250 tokens', emoji: '🎫', check: (p) => p.tokensEarned >= 250 },
  { id: 'helper', name: 'Good Question', desc: 'Ask Pip the helper for help', emoji: '💬', check: (p) => (p.stats.tutorAsks || 0) >= 1 },
  { id: 'comeback', name: 'Comeback Kid', desc: 'Get one right after 3 wrong', emoji: '💪', check: (p) => (p.stats.comebacks || 0) >= 1 },
];

// Returns newly earned badges (and records them).
export function checkBadges(profile, ctx = {}) {
  profile.badges ||= {};
  const fresh = [];
  for (const b of BADGES) {
    if (profile.badges[b.id]) continue;
    let ok = false;
    try { ok = b.check(profile, ctx); } catch { ok = false; }
    if (ok) { profile.badges[b.id] = Date.now(); fresh.push(b); }
  }
  return fresh;
}
