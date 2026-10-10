// Skill registry. Each file in ./skills/ default-exports one skill definition:
// { id, name, emoji, group, start: {1: lvl, 3: lvl, 4: lvl}, unlock?: {skill, level}, gen(level) }
// gen(level) returns { prompt, answer, choices?, hint?, explain?, visual?, input?, wrongTags? }.
// See docs/contracts.md (Questions) and docs/curriculum.md (ladders).

const modules = import.meta.glob('./skills/*.js', { eager: true });

export const SKILLS = {};
for (const path of Object.keys(modules).sort()) {
  const def = modules[path].default;
  if (!def || !def.id) continue;
  SKILLS[def.id] = def;
}

// Display order: number sense first, then operations, then the rest.
const ORDER = ['counting', 'add', 'sub', 'mental', 'mul', 'div', 'factors', 'place', 'fractions', 'decimals', 'compare', 'algebra', 'measurement', 'time', 'money', 'geometry', 'data', 'word'];
export const SKILL_IDS = [...ORDER.filter((id) => SKILLS[id]), ...Object.keys(SKILLS).filter((id) => !ORDER.includes(id))];

export const MAX_LEVEL = 10;

export function makeQuestion(skillId, level) {
  const skill = SKILLS[skillId];
  const lvl = Math.min(MAX_LEVEL, Math.max(1, level));
  const q = skill.gen(lvl);
  if (q.choices) q.choices = [...new Set(q.choices.map(String))];
  q.answer = String(q.answer);
  if (!q.input) q.input = q.choices ? 'choice' : 'number';
  return { skillId, level: lvl, ...q };
}

export function normalizeAnswer(s) {
  return String(s).trim().toLowerCase()
    .replace(/\s+/g, '')
    .replace(/^\$/, '').replace(/¢$/, '').replace(/,/g, '').replace(/^\+/, '')
    .replace(/^0+(\d)/, '$1');
}

function parseFraction(s) {
  const m = /^(-?\d+)\/(\d+)$/.exec(s);
  if (!m || Number(m[2]) === 0) return null;
  return Number(m[1]) / Number(m[2]);
}

export function isCorrect(q, given) {
  const a = normalizeAnswer(q.answer), g = normalizeAnswer(given);
  if (a === g) return true;
  if (a === '' || g === '') return false;
  // numeric equivalence (handles 4.50 vs 4.5, 012 vs 12)
  const na = Number(a), ng = Number(g);
  if (!Number.isNaN(na) && !Number.isNaN(ng)) return Math.abs(na - ng) < 1e-9;
  // fraction equivalence only when the expected answer is a fraction and the child typed a fraction
  const fa = parseFraction(a), fg = parseFraction(g);
  if (fa !== null && fg !== null) return Math.abs(fa - fg) < 1e-9;
  // time: 3:5 vs 3:05
  const ta = /^(\d{1,2}):(\d{1,2})$/.exec(a), tg = /^(\d{1,2}):(\d{1,2})$/.exec(g);
  if (ta && tg) return Number(ta[1]) === Number(tg[1]) && Number(ta[2]) === Number(tg[2]);
  return false;
}
