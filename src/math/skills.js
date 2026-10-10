// Each skill has 10 levels. gen(level) returns { prompt, answer, choices? , hint? }.
// answer is always a string. If choices is present the UI shows buttons; otherwise a number pad.
import { randInt, pick, shuffle } from './rng.js';

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const simplify = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const frac = (n, d) => (d === 1 ? `${n}` : `${n}/${d}`);
const money = (c) => `$${(c / 100).toFixed(2)}`;
const choicesAround = (ans, spread, count = 4, min = -Infinity) => {
  const set = new Set([ans]);
  let guard = 0;
  while (set.size < count && guard++ < 200) {
    const v = ans + randInt(-spread, spread);
    if (v !== ans && v >= min) set.add(v);
  }
  return shuffle([...set].map(String));
};

const MAX = 10;

export const SKILLS = {
  add: {
    name: 'Addition', emoji: '➕', start: { 1: 1, 3: 4, 4: 5 },
    gen(l) {
      let a, b, c;
      switch (l) {
        case 1: a = randInt(0, 5); b = randInt(0, 5); break;
        case 2: a = randInt(1, 10); b = randInt(1, 10); break;
        case 3: a = randInt(5, 15); b = randInt(5, 15); break;
        case 4: a = randInt(10, 60); b = randInt(1, 9); break;
        case 5: a = randInt(10, 50); b = randInt(10, 49); break;
        case 6: a = randInt(50, 99); b = randInt(50, 99); break;
        case 7: a = randInt(100, 999); b = randInt(100, 999); break;
        case 8: a = randInt(10, 99); b = randInt(10, 99); c = randInt(10, 99);
          return { prompt: `${a} + ${b} + ${c}`, answer: String(a + b + c) };
        case 9: a = randInt(1000, 9999); b = randInt(1000, 9999); break;
        default: {
          const x = randInt(10, 99) / 10, y = randInt(10, 99) / 10;
          return { prompt: `${x.toFixed(1)} + ${y.toFixed(1)}`, answer: (Math.round((x + y) * 10) / 10).toString() };
        }
      }
      return { prompt: `${a} + ${b}`, answer: String(a + b) };
    },
  },
  sub: {
    name: 'Subtraction', emoji: '➖', start: { 1: 1, 3: 4, 4: 5 },
    gen(l) {
      let a, b;
      switch (l) {
        case 1: a = randInt(1, 5); b = randInt(0, a); break;
        case 2: a = randInt(5, 10); b = randInt(0, a); break;
        case 3: a = randInt(10, 20); b = randInt(1, 10); break;
        case 4: a = randInt(20, 99); b = randInt(1, 9); break;
        case 5: a = randInt(30, 99); b = randInt(10, a - 1); break;
        case 6: a = randInt(100, 500); b = randInt(10, 99); break;
        case 7: a = randInt(200, 999); b = randInt(100, a - 1); break;
        case 8: a = randInt(1000, 9999); b = randInt(100, 999); break;
        case 9: a = randInt(1, 20); b = randInt(a + 1, 30);
          return { prompt: `${a} − ${b}`, answer: String(a - b), hint: 'The answer is negative.' };
        default: {
          const x = randInt(50, 99) / 10, y = randInt(10, 49) / 10;
          return { prompt: `${x.toFixed(1)} − ${y.toFixed(1)}`, answer: (Math.round((x - y) * 10) / 10).toString() };
        }
      }
      return { prompt: `${a} − ${b}`, answer: String(a - b) };
    },
  },
  mul: {
    name: 'Multiplication', emoji: '✖️', start: { 1: 1, 3: 2, 4: 4 },
    unlock: { skill: 'add', level: 3 },
    gen(l) {
      let a, b;
      switch (l) {
        case 1: a = pick([1, 2, 5, 10]); b = randInt(1, 10); break;
        case 2: a = pick([2, 3, 4, 5]); b = randInt(1, 10); break;
        case 3: a = randInt(2, 6); b = randInt(2, 9); break;
        case 4: a = randInt(2, 10); b = randInt(2, 10); break;
        case 5: a = randInt(3, 12); b = randInt(3, 12); break;
        case 6: a = randInt(11, 49); b = randInt(2, 9); break;
        case 7: a = randInt(11, 30); b = randInt(11, 30); break;
        case 8: a = randInt(100, 999); b = randInt(2, 9); break;
        case 9: a = randInt(100, 999); b = randInt(11, 40); break;
        default: {
          const x = randInt(11, 99) / 10, y = randInt(2, 9);
          return { prompt: `${x.toFixed(1)} × ${y}`, answer: (Math.round(x * y * 10) / 10).toString() };
        }
      }
      if (Math.random() < 0.5) [a, b] = [b, a];
      return { prompt: `${a} × ${b}`, answer: String(a * b) };
    },
  },
  div: {
    name: 'Division', emoji: '➗', start: { 1: 1, 3: 1, 4: 3 },
    unlock: { skill: 'mul', level: 3 },
    gen(l) {
      let a, b, q;
      switch (l) {
        case 1: b = pick([1, 2, 5, 10]); q = randInt(1, 10); break;
        case 2: b = pick([2, 3, 4, 5]); q = randInt(1, 10); break;
        case 3: b = randInt(2, 6); q = randInt(2, 10); break;
        case 4: b = randInt(2, 10); q = randInt(2, 10); break;
        case 5: b = randInt(3, 12); q = randInt(3, 12); break;
        case 6: b = randInt(2, 9); q = randInt(11, 40); break;
        case 7: { b = randInt(2, 9); q = randInt(3, 12); const r = randInt(1, b - 1); a = b * q + r;
          return { prompt: `${a} ÷ ${b} — what is the remainder?`, answer: String(r), hint: `${b} × ${q} = ${b * q}` }; }
        case 8: b = randInt(2, 9); q = randInt(100, 400); break;
        case 9: b = randInt(11, 25); q = randInt(5, 40); break;
        default: { b = randInt(2, 9); const x = randInt(2, 40) / 10; a = Math.round(x * b * 10) / 10;
          return { prompt: `${a} ÷ ${b}`, answer: x.toString() }; }
      }
      a = b * q;
      return { prompt: `${a} ÷ ${b}`, answer: String(q) };
    },
  },
  compare: {
    name: 'Comparing', emoji: '⚖️', start: { 1: 1, 3: 3, 4: 4 },
    gen(l) {
      const cmp = (a, b, la = String(a), lb = String(b)) => ({
        prompt: `Which is bigger?`, choices: shuffle([la, lb]), answer: a > b ? la : lb,
      });
      switch (l) {
        case 1: { const a = randInt(0, 10), b = (a + randInt(1, 5)) % 11; return a === b ? this.gen(l) : cmp(a, b); }
        case 2: { const a = randInt(0, 100); let b = randInt(0, 100); if (b === a) b = (a + 7) % 101; return cmp(a, b); }
        case 3: { const a = randInt(100, 999); let b = randInt(100, 999); if (b === a) b++; return cmp(a, b); }
        case 4: { const d = randInt(3, 10); const n1 = randInt(1, d - 1); let n2 = randInt(1, d - 1); if (n2 === n1) n2 = (n1 % (d - 1)) + 1;
          return cmp(n1 / d, n2 / d, frac(n1, d), frac(n2, d)); }
        case 5: { const d1 = randInt(2, 8), d2 = randInt(2, 8); const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
          if (n1 * d2 === n2 * d1) return this.gen(l); return cmp(n1 / d1, n2 / d2, frac(n1, d1), frac(n2, d2)); }
        case 6: { const a = randInt(1, 99) / 10; let b = randInt(1, 999) / 100; if (a === b) b += 0.01; return cmp(a, b, a.toFixed(1), b.toFixed(2)); }
        case 7: { const a = randInt(-20, 20); let b = randInt(-20, 20); if (a === b) b = -a - 1; return cmp(a, b); }
        case 8: { const a1 = randInt(2, 9), a2 = randInt(2, 9), b1 = randInt(2, 9), b2 = randInt(2, 9);
          if (a1 * a2 === b1 * b2) return this.gen(l); return cmp(a1 * a2, b1 * b2, `${a1} × ${a2}`, `${b1} × ${b2}`); }
        case 9: { const d = pick([2, 4, 5, 8]); const n = randInt(1, d - 1); const dec = randInt(1, 99) / 100;
          if (n / d === dec) return this.gen(l); return cmp(n / d, dec, frac(n, d), dec.toFixed(2)); }
        default: { const a = randInt(1, 9) / 10, p = randInt(5, 95); const b = p / 100;
          if (a === b) return this.gen(l); return cmp(a, b, `${a * 100}%`, b.toFixed(2)); }
      }
    },
  },
  place: {
    name: 'Place Value', emoji: '🔢', start: { 1: 1, 3: 3, 4: 4 },
    gen(l) {
      const digit = (n, p) => Math.floor(n / p) % 10;
      switch (l) {
        case 1: { const n = randInt(10, 99); const w = pick(['tens', 'ones']); return { prompt: `What digit is in the ${w} place of ${n}?`, answer: String(digit(n, w === 'tens' ? 10 : 1)) }; }
        case 2: { const n = randInt(100, 999); const w = pick(['hundreds', 'tens', 'ones']); return { prompt: `What digit is in the ${w} place of ${n}?`, answer: String(digit(n, { hundreds: 100, tens: 10, ones: 1 }[w])) }; }
        case 3: { const n = randInt(11, 99); return { prompt: `Round ${n} to the nearest 10`, answer: String(Math.round(n / 10) * 10) }; }
        case 4: { const n = randInt(1000, 9999); const w = pick(['thousands', 'hundreds', 'tens']); return { prompt: `What digit is in the ${w} place of ${n}?`, answer: String(digit(n, { thousands: 1000, hundreds: 100, tens: 10 }[w])) }; }
        case 5: { const n = randInt(101, 999); return { prompt: `Round ${n} to the nearest 100`, answer: String(Math.round(n / 100) * 100) }; }
        case 6: { const h = randInt(1, 9), t = randInt(1, 9), o = randInt(1, 9); const n = h * 100 + t * 10 + o;
          const right = `${h * 100} + ${t * 10} + ${o}`; const wrongs = [`${h} + ${t} + ${o}`, `${h * 100} + ${t} + ${o}`, `${h * 10} + ${t * 10} + ${o}`];
          return { prompt: `Which is the expanded form of ${n}?`, choices: shuffle([right, ...wrongs]), answer: right }; }
        case 7: { const n = randInt(1001, 99999); return { prompt: `Round ${n.toLocaleString()} to the nearest 1,000`, answer: String(Math.round(n / 1000) * 1000) }; }
        case 8: { const n = randInt(100, 9999) / 100; const w = pick(['tenths', 'hundredths']); const s = n.toFixed(2);
          return { prompt: `What digit is in the ${w} place of ${s}?`, answer: w === 'tenths' ? s.split('.')[1][0] : s.split('.')[1][1] }; }
        case 9: { const n = randInt(100, 9999) / 100; return { prompt: `Round ${n.toFixed(2)} to the nearest whole number`, answer: String(Math.round(n)) }; }
        default: { const n = randInt(100, 9999) / 100; return { prompt: `Round ${n.toFixed(2)} to the nearest tenth`, answer: (Math.round(n * 10) / 10).toString() }; }
      }
    },
  },
  fractions: {
    name: 'Fractions', emoji: '🍕', start: { 1: 1, 3: 1, 4: 3 },
    unlock: { skill: 'div', level: 2 },
    gen(l) {
      switch (l) {
        case 1: { const d = pick([2, 3, 4, 5, 6, 8]); const n = randInt(1, d - 1);
          const right = frac(n, d); const wrongs = new Set(); while (wrongs.size < 3) { const w = frac(randInt(1, 9), randInt(2, 9)); if (w !== right) wrongs.add(w); }
          return { prompt: `A pizza is cut into ${d} equal slices. You eat ${n}. What fraction did you eat?`, choices: shuffle([right, ...wrongs]), answer: right }; }
        case 2: { const d = pick([2, 3, 4, 5]); const n = randInt(1, d - 1); const k = randInt(2, 4);
          return { prompt: `${frac(n, d)} = ?/${d * k}`, answer: String(n * k), hint: 'Multiply top and bottom by the same number.' }; }
        case 3: { const d = randInt(3, 10); const a = randInt(1, d - 2); const b = randInt(1, d - a - 1); const [sn, sd] = simplify(a + b, d);
          const right = frac(sn, sd); return { prompt: `${frac(a, d)} + ${frac(b, d)}`, choices: shuffle([right, frac(a + b, d * 2), frac(a + b + 1, d), frac(Math.max(1, a - b), d)].filter((v, i, arr) => arr.indexOf(v) === i)).slice(0, 4), answer: right }; }
        case 4: { const k = randInt(2, 5); const d = randInt(2, 6); const n = randInt(1, d - 1); const [sn, sd] = simplify(n, d);
          const right = frac(sn, sd); return { prompt: `Simplify ${frac(n * k, d * k)}`, choices: shuffle([right, frac(n * k, d), frac(n, d * k), frac(sn + 1, sd + 1)].filter((v, i, arr) => arr.indexOf(v) === i)), answer: right }; }
        case 5: { const d = pick([2, 3, 4, 5, 6, 8, 10]); const n = randInt(1, d - 1); const whole = d * randInt(2, 6);
          return { prompt: `What is ${frac(n, d)} of ${whole}?`, answer: String((whole / d) * n) }; }
        case 6: { const d1 = pick([2, 3, 4]), d2 = pick([3, 4, 6, 8]); if (d1 === d2) return this.gen(l); const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
          const [sn, sd] = simplify(n1 * d2 + n2 * d1, d1 * d2); const right = frac(sn, sd);
          return { prompt: `${frac(n1, d1)} + ${frac(n2, d2)}`, choices: shuffle([right, frac(n1 + n2, d1 + d2), frac(n1 + n2, d1 * d2), frac(sn + 1, sd)].filter((v, i, arr) => arr.indexOf(v) === i)), answer: right }; }
        case 7: { const w = randInt(1, 5), d = randInt(2, 8), n = randInt(1, d - 1); const right = frac(w * d + n, d);
          return { prompt: `Write ${w} ${frac(n, d)} as an improper fraction`, choices: shuffle([right, frac(w + n, d), frac(w * n, d), frac(w * d + n + 1, d)]), answer: right }; }
        case 8: { const a = randInt(1, 5), b = randInt(2, 6), c = randInt(1, 5), d = randInt(2, 6); const [sn, sd] = simplify(a * c, b * d); const right = frac(sn, sd);
          return { prompt: `${frac(a, b)} × ${frac(c, d)}`, choices: shuffle([right, frac(a * c, b + d), frac(a + c, b * d), frac(sn + 1, sd)].filter((v, i, arr) => arr.indexOf(v) === i)), answer: right }; }
        case 9: { const d = pick([2, 4, 5, 10, 20, 25]); const n = randInt(1, d - 1); return { prompt: `Write ${frac(n, d)} as a decimal`, answer: String(n / d) }; }
        default: { const a = randInt(1, 5), b = randInt(2, 6), c = randInt(1, 5), d = randInt(2, 6); const [sn, sd] = simplify(a * d, b * c); const right = frac(sn, sd);
          return { prompt: `${frac(a, b)} ÷ ${frac(c, d)}`, choices: shuffle([right, frac(a * c, b * d), frac(a, b * c), frac(sn + 1, sd)].filter((v, i, arr) => arr.indexOf(v) === i)), answer: right, hint: 'Flip the second fraction and multiply.' }; }
      }
    },
  },
  missing: {
    name: 'Missing Number', emoji: '❓', start: { 1: 1, 3: 3, 4: 5 },
    gen(l) {
      switch (l) {
        case 1: { const t = randInt(2, 10), a = randInt(0, t); return { prompt: `${a} + ? = ${t}`, answer: String(t - a) }; }
        case 2: { const a = randInt(5, 20), b = randInt(1, a); return { prompt: `? − ${b} = ${a - b}`, answer: String(a) }; }
        case 3: { const t = randInt(20, 100), a = randInt(1, t); return { prompt: `${a} + ? = ${t}`, answer: String(t - a) }; }
        case 4: { const a = randInt(2, 10), x = randInt(2, 10); return { prompt: `${a} × ? = ${a * x}`, answer: String(x) }; }
        case 5: { const b = randInt(2, 10), q = randInt(2, 10); return { prompt: `? ÷ ${b} = ${q}`, answer: String(b * q) }; }
        case 6: { const a = randInt(2, 5), x = randInt(1, 10), b = randInt(1, 9); return { prompt: `${a}x + ${b} = ${a * x + b}`, answer: String(x), hint: 'Find x.' }; }
        case 7: { const a = randInt(2, 6), x = randInt(2, 12), b = randInt(1, 9); return { prompt: `${a}x − ${b} = ${a * x - b}`, answer: String(x), hint: 'Find x.' }; }
        case 8: { const d = randInt(2, 5), x = d * randInt(1, 8), b = randInt(1, 9); return { prompt: `x ÷ ${d} + ${b} = ${x / d + b}`, answer: String(x), hint: 'Find x.' }; }
        case 9: { const a = randInt(2, 5), x = randInt(1, 10), b = randInt(1, 6); return { prompt: `${a}(x + ${b}) = ${a * (x + b)}`, answer: String(x), hint: 'Find x.' }; }
        default: { const a = randInt(2, 5), x = randInt(1, 10), b = randInt(1, 9); const c = (a - 1) * x + b; return { prompt: `${a}x + ${b} = x + ${c + b}`, answer: String(x), hint: 'Get the x terms on one side.' }; }
      }
    },
  },
  patterns: {
    name: 'Patterns', emoji: '🔁', start: { 1: 1, 3: 3, 4: 4 },
    gen(l) {
      const seq = (start, step, n = 4) => Array.from({ length: n }, (_, i) => start + i * step);
      const ask = (arr, next, hint) => ({ prompt: `What comes next? ${arr.join(', ')}, ?`, answer: String(next), hint });
      switch (l) {
        case 1: { const s = pick([2, 5, 10]); const st = s * randInt(0, 3); const a = seq(st, s); return ask(a, st + 4 * s); }
        case 2: { const s = pick([3, 4]); const st = randInt(0, 5); const a = seq(st, s); return ask(a, st + 4 * s); }
        case 3: { const s = randInt(2, 10); const st = randInt(50, 100); const a = seq(st, -s); return ask(a, st - 4 * s); }
        case 4: { const s = randInt(6, 15); const st = randInt(1, 30); const a = seq(st, s); return ask(a, st + 4 * s); }
        case 5: { const r = pick([2, 3]); const st = randInt(1, 5); const a = [st, st * r, st * r * r, st * r ** 3]; return ask(a, st * r ** 4, 'Each number is multiplied by the same amount.'); }
        case 6: { const st = randInt(1, 5); const a = [st, st + 1, st + 2, st + 3].map((x) => x * x); return ask(a, (st + 4) ** 2, 'Square numbers.'); }
        case 7: { let a = [randInt(1, 3), randInt(2, 5)]; while (a.length < 5) a.push(a.at(-1) + a.at(-2)); return ask(a.slice(0, 4), a[4], 'Add the two numbers before.'); }
        case 8: { const st = randInt(1, 10), up = randInt(3, 9), down = randInt(1, up - 1); const a = [st, st + up, st + up - down, st + 2 * up - down]; return ask(a, st + 2 * up - 2 * down, 'Up, then down, then up…'); }
        case 9: { const st = randInt(1, 5), m = randInt(2, 3), add = randInt(1, 4); const a = [st]; while (a.length < 4) a.push(a.at(-1) * m + add); return ask(a, a[3] * m + add, 'Multiply, then add.'); }
        default: { const st = randInt(1, 4); const tri = (n) => (n * (n + 1)) / 2; const a = [st, st + 1, st + 2, st + 3].map(tri); return ask(a, tri(st + 4), 'Triangular numbers: the gaps grow by 1.'); }
      }
    },
  },
  money: {
    name: 'Money', emoji: '💵', start: { 1: 1, 3: 3, 4: 5 },
    gen(l) {
      switch (l) {
        case 1: { const d = randInt(0, 4), n = randInt(0, 3), p = randInt(0, 4); const c = d * 10 + n * 5 + p; if (c === 0) return this.gen(l);
          return { prompt: `${d} dime${d === 1 ? '' : 's'}, ${n} nickel${n === 1 ? '' : 's'}, and ${p} penn${p === 1 ? 'y' : 'ies'}. How many cents?`, answer: String(c) }; }
        case 2: { const q = randInt(1, 3), d = randInt(0, 4), n = randInt(0, 2); return { prompt: `${q} quarter${q === 1 ? '' : 's'}, ${d} dime${d === 1 ? '' : 's'}, and ${n} nickel${n === 1 ? '' : 's'}. How many cents?`, answer: String(q * 25 + d * 10 + n * 5) }; }
        case 3: { const c = randInt(5, 95); return { prompt: `Something costs ${c}¢. You pay with $1. How many cents change?`, answer: String(100 - c) }; }
        case 4: { const a = randInt(100, 999), b = randInt(100, 999); return { prompt: `${money(a)} + ${money(b)} = ? (answer in dollars, like 4.25)`, answer: ((a + b) / 100).toFixed(2) }; }
        case 5: { const c = randInt(105, 495); return { prompt: `Something costs ${money(c)}. You pay with $5. How much change?`, answer: ((500 - c) / 100).toFixed(2) }; }
        case 6: { const p = randInt(1, 9), q = randInt(2, 6); return { prompt: `${q} toys at $${p} each. Total cost in dollars?`, answer: String(p * q) }; }
        case 7: { const base = pick([8, 12, 16, 20, 24, 40, 60]); const pct = pick([50, 25]); return { prompt: `A $${base} game is ${pct}% off. What is the new price in dollars?`, answer: String(base - (base * pct) / 100) }; }
        case 8: { const base = randInt(2, 30) * 10; return { prompt: `What is 10% of $${base}?`, answer: String(base / 10) }; }
        case 9: { const base = pick([20, 40, 60, 80, 100]); return { prompt: `A $${base} meal. What is a 15% tip in dollars?`, answer: String(base * 0.15) }; }
        default: { const base = pick([100, 200, 500, 1000]); const pct = pick([5, 10, 20]); return { prompt: `You save $${base} at ${pct}% interest for 1 year. How much do you have after?`, answer: String(base + (base * pct) / 100) }; }
      }
    },
  },
  ops: {
    name: 'Order of Operations', emoji: '🧮', start: { 1: 1, 3: 1, 4: 2 },
    unlock: { skill: 'mul', level: 4 },
    gen(l) {
      const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9), d = randInt(2, 5);
      switch (l) {
        case 1: return { prompt: `${a} + ${b} × ${c}`, answer: String(a + b * c), hint: 'Multiply first.' };
        case 2: return { prompt: `${a * b + c} − ${a} × ${b}`, answer: String(c), hint: 'Multiply first.' };
        case 3: return { prompt: `(${a} + ${b}) × ${c}`, answer: String((a + b) * c), hint: 'Brackets first.' };
        case 4: return { prompt: `${a} × ${b} + ${c} × ${d}`, answer: String(a * b + c * d) };
        case 5: return { prompt: `${a * b} ÷ ${a} + ${c}`, answer: String(b + c) };
        case 6: return { prompt: `${a} × (${b} + ${c}) − ${d}`, answer: String(a * (b + c) - d) };
        case 7: return { prompt: `${a}² + ${b}`, answer: String(a * a + b), hint: 'Powers first.' };
        case 8: return { prompt: `(${a} + ${b})² − ${c}`, answer: String((a + b) ** 2 - c) };
        case 9: return { prompt: `${a * b * c} ÷ (${a} × ${b}) + ${d}`, answer: String(c + d) };
        default: return { prompt: `${a} × ${b} − ${c * d} ÷ ${d} + ${a}²`, answer: String(a * b - c + a * a) };
      }
    },
  },
  word: {
    name: 'Word Problems', emoji: '📖', start: { 1: 1, 3: 3, 4: 5 },
    gen(l) {
      const thing = pick(['apples', 'cookies', 'stickers', 'marbles', 'LEGO bricks', 'crayons', 'dinosaurs', 'books']);
      const name = pick(['Jack', 'Luke', 'Madeline', 'Mom', 'Dad', 'Grandma', 'Your friend']);
      switch (l) {
        case 1: { const a = randInt(2, 5), b = randInt(1, 5); return { prompt: `You have ${a} ${thing}. ${name} gives you ${b} more. How many now?`, answer: String(a + b) }; }
        case 2: { const a = randInt(5, 15), b = randInt(1, a); return { prompt: `You have ${a} ${thing}. You give ${b} to ${name}. How many are left?`, answer: String(a - b) }; }
        case 3: { const a = randInt(2, 6), b = randInt(2, 9); return { prompt: `There are ${a} bags with ${b} ${thing} in each. How many ${thing} in total?`, answer: String(a * b) }; }
        case 4: { const a = randInt(2, 6), b = randInt(2, 9); return { prompt: `${a * b} ${thing} are shared equally among ${a} kids. How many does each kid get?`, answer: String(b) }; }
        case 5: { const a = randInt(20, 80), b = randInt(10, 40), c = randInt(5, 30); return { prompt: `${name} had ${a} ${thing}, bought ${b} more, then lost ${c}. How many now?`, answer: String(a + b - c) }; }
        case 6: { const p = randInt(2, 9), q = randInt(3, 8), paid = p * q + randInt(1, 10); return { prompt: `${q} packs of ${thing} cost $${p} each. You pay $${paid}. How much change (in dollars)?`, answer: String(paid - p * q) }; }
        case 7: { const t = randInt(3, 9) * 10, m = randInt(15, 55); return { prompt: `A movie starts at ${t / 10 + 1}:00 and lasts ${60 + m} minutes. How many minutes past ${t / 10 + 2}:00 does it end?`, answer: String(m) }; }
        case 8: { const w = randInt(3, 12), h = randInt(3, 12); return { prompt: `A rectangle is ${w} cm wide and ${h} cm tall. What is its area in cm²?`, answer: String(w * h) }; }
        case 9: { const d = pick([2, 3, 4, 5]); const total = d * randInt(4, 12); return { prompt: `${name} ate ${frac(1, d)} of ${total} ${thing}. How many are left?`, answer: String(total - total / d) }; }
        default: { const speed = randInt(30, 80), hrs = randInt(2, 5); return { prompt: `A car drives ${speed} km every hour. How far does it go in ${hrs} hours?`, answer: String(speed * hrs) }; }
      }
    },
  },
  time: {
    name: 'Time', emoji: '⏰', start: { 1: 1, 3: 3, 4: 4 },
    gen(l) {
      const fmt = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
      switch (l) {
        case 1: { const h = randInt(1, 12); const right = fmt(h, 0); return { prompt: `The short hand points at ${h} and the long hand points at 12. What time is it?`, choices: shuffle([right, fmt(h + 1, 0), fmt(h, 30), fmt(12, h)]).filter((v, i, a) => a.indexOf(v) === i), answer: right }; }
        case 2: { const h = randInt(1, 12); const right = fmt(h, 30); return { prompt: `The short hand is between ${h} and ${(h % 12) + 1}, the long hand points at 6. What time is it?`, choices: shuffle([right, fmt(h + 1, 30), fmt(h, 0), fmt(6, h)]).filter((v, i, a) => a.indexOf(v) === i), answer: right }; }
        case 3: { const h = randInt(1, 12), m = pick([15, 45]); const right = fmt(h, m); return { prompt: `The long hand points at ${m === 15 ? 3 : 9} and the short hand is just ${m === 15 ? 'past' : 'before'} ${m === 15 ? h : (h % 12) + 1}. What time is it?`, choices: shuffle([right, fmt(h, m === 15 ? 45 : 15), fmt(h + 1, m), fmt(h, 30)]), answer: right }; }
        case 4: { const h = randInt(1, 11), add = pick([1, 2, 3]); return { prompt: `It is ${fmt(h, 0)}. What time is it ${add} hour${add > 1 ? 's' : ''} later? (like 4:00)`, answer: fmt(h + add, 0) }; }
        case 5: { const m = randInt(1, 5) * 10, add = pick([15, 30, 45]); const h = randInt(1, 11); const tm = m + add; return { prompt: `It is ${fmt(h, m)}. What time is it ${add} minutes later?`, answer: fmt(h + Math.floor(tm / 60), tm % 60) }; }
        case 6: { const hrs = randInt(1, 5); return { prompt: `How many minutes are in ${hrs} hour${hrs > 1 ? 's' : ''}?`, answer: String(hrs * 60) }; }
        case 7: { const h1 = randInt(1, 6), h2 = h1 + randInt(1, 5), m = pick([0, 15, 30, 45]); return { prompt: `A trip starts at ${fmt(h1, 0)} and ends at ${fmt(h2, m)}. How many minutes long is it?`, answer: String((h2 - h1) * 60 + m) }; }
        case 8: { const d = randInt(2, 6); return { prompt: `How many hours are in ${d} days?`, answer: String(d * 24) }; }
        case 9: { const h = randInt(13, 23); return { prompt: `${h}:00 on a 24-hour clock is what time in the afternoon? (like 3:00)`, answer: `${h - 12}:00` }; }
        default: { const s = randInt(2, 9) * 60 + randInt(1, 59); return { prompt: `${s} seconds is how many minutes and seconds? Answer the minutes.`, answer: String(Math.floor(s / 60)) }; }
      }
    },
  },
};

export const MAX_LEVEL = MAX;
export const SKILL_IDS = Object.keys(SKILLS);

export function makeQuestion(skillId, level) {
  const skill = SKILLS[skillId];
  const lvl = Math.min(MAX, Math.max(1, level));
  const q = skill.gen(lvl);
  if (q.choices) q.choices = [...new Set(q.choices)];
  return { skillId, level: lvl, ...q };
}

export function normalizeAnswer(s) {
  return String(s).trim().replace(/\s+/g, '').replace(/^\$/, '').replace(/,/g, '').replace(/^\+/, '');
}

export function isCorrect(q, given) {
  const a = normalizeAnswer(q.answer), g = normalizeAnswer(given);
  if (a === g) return true;
  const na = Number(a), ng = Number(g);
  if (!Number.isNaN(na) && !Number.isNaN(ng) && a !== '' && g !== '') return Math.abs(na - ng) < 1e-9;
  return false;
}
