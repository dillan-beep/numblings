// Daily quests: three per day, seeded by date + kid so they are stable across reloads.
// Progress is tracked in profile.quests = { day, items: [{id, goal, progress, done, claimed}] }.
import { SKILLS, SKILL_IDS } from './math/skills.js';
import { unlockedSkillIds } from './math/engine.js';

const seeded = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
};

// Quest templates. `count(ev)` returns how much an event advances the quest.
export const TEMPLATES = {
  answer: { text: (g) => `Answer ${g} questions`, goals: [15, 20, 30], emoji: '🧠', reward: 1, count: (e) => (e.type === 'answer' ? 1 : 0) },
  correct: { text: (g) => `Get ${g} answers right`, goals: [10, 15, 20], emoji: '✅', reward: 1, count: (e) => (e.type === 'answer' && e.ok ? 1 : 0) },
  streak: { text: (g) => `Get ${g} right in a row`, goals: [5, 7, 10], emoji: '🔥', reward: 2, count: (e) => (e.type === 'streak' ? e.value : 0), max: true },
  skill: { text: (g, s) => `Get ${g} ${SKILLS[s].name} questions right`, goals: [4, 6, 8], emoji: '🎯', reward: 2, count: (e, q) => (e.type === 'answer' && e.ok && e.skillId === q.skill ? 1 : 0) },
  rounds: { text: (g) => `Finish ${g} training rounds`, goals: [2, 3], emoji: '🏁', reward: 2, count: (e) => (e.type === 'round' ? 1 : 0) },
  perfect: { text: () => `Get a perfect 10/10 round`, goals: [1], emoji: '🏆', reward: 3, count: (e) => (e.type === 'round' && e.perfect ? 1 : 0) },
  battle: { text: (g) => `Win ${g} monster battle${g > 1 ? 's' : ''}`, goals: [1, 2], emoji: '⚔️', reward: 2, count: (e) => (e.type === 'battlewin' ? 1 : 0) },
  feed: { text: () => `Feed your pet`, goals: [1], emoji: '🍎', reward: 1, count: (e) => (e.type === 'feed' ? 1 : 0) },
  levelup: { text: () => `Level up any skill`, goals: [1], emoji: '🚀', reward: 2, count: (e) => (e.type === 'levelup' ? 1 : 0) },
  hard: { text: (g) => `Get ${g} right at level 5 or higher`, goals: [5, 8], emoji: '💪', reward: 3, count: (e) => (e.type === 'answer' && e.ok && e.level >= 5 ? 1 : 0) },
};

export function generateQuests(profile, day) {
  const rnd = seeded(`${profile.id}:${day}`);
  const unlocked = unlockedSkillIds(profile.skills);
  const maxLevel = Math.max(...SKILL_IDS.map((id) => profile.skills[id].level));
  const pool = Object.keys(TEMPLATES).filter((k) => k !== 'hard' || maxLevel >= 5);
  const picked = [];
  // Always one "answer"/"correct" style quest, then two others.
  picked.push(rnd() < 0.5 ? 'answer' : 'correct');
  while (picked.length < 3) {
    const k = pool[Math.floor(rnd() * pool.length)];
    if (!picked.includes(k) && !(k === 'answer' && picked.includes('correct')) && !(k === 'correct' && picked.includes('answer'))) picked.push(k);
  }
  return {
    day,
    items: picked.map((k) => {
      const t = TEMPLATES[k];
      const goal = t.goals[Math.floor(rnd() * t.goals.length)];
      const skill = k === 'skill' ? unlocked[Math.floor(rnd() * unlocked.length)] : undefined;
      return { id: k, skill, goal, progress: 0, done: false, claimed: false, text: t.text(goal, skill), emoji: t.emoji, reward: t.reward };
    }),
  };
}

export function ensureQuests(profile, day) {
  if (!profile.quests || profile.quests.day !== day) profile.quests = generateQuests(profile, day);
  return profile.quests;
}

// Feed an event; returns the list of quests that just completed.
export function questEvent(profile, ev) {
  const q = profile.quests; if (!q) return [];
  const completed = [];
  for (const item of q.items) {
    if (item.done) continue;
    const t = TEMPLATES[item.id];
    const n = t.count(ev, item);
    if (!n) continue;
    item.progress = t.max ? Math.max(item.progress, n) : item.progress + n;
    if (item.progress >= item.goal) { item.progress = item.goal; item.done = true; completed.push(item); }
  }
  return completed;
}
