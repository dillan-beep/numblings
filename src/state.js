import { initSkills } from './math/engine.js';
import { DEFAULT_RULES } from './economy.js';
import { DEFAULT_REWARDS } from './rewards.js';

export const STORAGE_KEY = 'petmath.save.v1';
const VERSION = 1;

export const KIDS = [
  { id: 'jack', name: 'Jack', age: 6, grade: 1, color: '#4fd38a' },
  { id: 'luke', name: 'Luke', age: 8, grade: 3, color: '#4f9cff' },
  { id: 'madeline', name: 'Madeline', age: 9, grade: 4, color: '#c77dff' },
];

export function newProfile(kid) {
  return {
    ...kid,
    pet: null,
    coins: 50,
    tokens: 0,
    tokensEarned: 0,
    skills: initSkills(kid.grade),
    stats: { rounds: 0, answered: 0, correct: 0, lastRoundDay: null, dayStreak: 0, bestStreak: 0 },
    redemptions: [],
    log: [],
  };
}

export function defaultState() {
  return {
    version: VERSION,
    parentPin: '1234',
    rules: { ...DEFAULT_RULES },
    rewards: DEFAULT_REWARDS.map((r) => ({ ...r })),
    profiles: Object.fromEntries(KIDS.map((k) => [k.id, newProfile(k)])),
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const data = JSON.parse(raw);
    return migrate(data);
  } catch {
    return defaultState();
  }
}

function migrate(data) {
  const base = defaultState();
  const out = { ...base, ...data, rules: { ...base.rules, ...(data.rules || {}) } };
  for (const k of KIDS) {
    if (!out.profiles[k.id]) out.profiles[k.id] = newProfile(k);
    const p = out.profiles[k.id];
    for (const id of Object.keys(base.profiles[k.id].skills)) {
      if (!p.skills[id]) p.skills[id] = base.profiles[k.id].skills[id];
    }
    p.stats = { ...base.profiles[k.id].stats, ...(p.stats || {}) };
    p.log ||= [];
    p.redemptions ||= [];
  }
  return out;
}

export function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

export function logEvent(profile, text) {
  profile.log.unshift({ at: Date.now(), text });
  if (profile.log.length > 50) profile.log.length = 50;
}
