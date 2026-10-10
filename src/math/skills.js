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

// Numeric value of "12", "4.5", "3/4", "-3/4", or a mixed number "2 1/2" (raw, un-normalized input). null if not numeric.
export function numericValue(raw) {
  const s = String(raw).trim().replace(/^\$/, '').replace(/¢$/, '').replace(/,/g, '').replace(/−/g, '-');
  const mixed = /^(-?)(\d+)\s+(\d+)\/(\d+)$/.exec(s);
  if (mixed && Number(mixed[4]) !== 0) { const v = Number(mixed[2]) + Number(mixed[3]) / Number(mixed[4]); return mixed[1] ? -v : v; }
  const t = s.replace(/\s+/g, '');
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2]);
  if (t === '' || t === '-' || t === '.') return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
}

export function isCorrect(q, given) {
  const a = normalizeAnswer(q.answer), g = normalizeAnswer(given);
  if (a === g) return true;
  if (a === '' || g === '') return false;
  // Choice questions must match the chosen button exactly (e.g. "simplest form" questions).
  if (q.choices) return false;
  // Typed answers: any numerically equal form counts (4.50, 6/8, 2 1/2, .5).
  const va = numericValue(q.answer), vg = numericValue(given);
  if (va !== null && vg !== null) return Math.abs(va - vg) < 1e-9;
  // time: 3:5 vs 3:05
  const ta = /^(\d{1,2}):(\d{1,2})$/.exec(a), tg = /^(\d{1,2}):(\d{1,2})$/.exec(g);
  if (ta && tg) return Number(ta[1]) === Number(tg[1]) && Number(ta[2]) === Number(tg[2]);
  return false;
}
