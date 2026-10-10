// Comparing and ordering ladder (curriculum A9). Levels 1-10.
import { randInt, pick, shuffle } from '../rng.js';

const choices = (answer, distractors, n = 4) => {
  const out = [String(answer)];
  for (const d of distractors) { const s = String(d); if (!out.includes(s) && out.length < n) out.push(s); }
  while (out.length < 2) out.push(out[0] + '0');
  return shuffle(out);
};
const num = (x) => String(Math.round(x * 1e6) / 1e6);
const neg = (s) => String(s).replace(/^-/, '−'); // display minus
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

// distinct random ints
function distinct(n, lo, hi) {
  const s = new Set();
  while (s.size < n) s.add(randInt(lo, hi));
  return [...s];
}
// Ordering question: items are {label, value}. Returns a choice question.
function orderQ(items, prompt, explainExtra = '', wrongTags = {}) {
  const asc = Math.random() < 0.6;
  const sorted = [...items].sort((a, b) => (asc ? a.value - b.value : b.value - a.value));
  const answer = sorted.map((i) => i.label).join(', ');
  const rev = [...sorted].reverse().map((i) => i.label).join(', ');
  const given = items.map((i) => i.label).join(', ');
  const perms = [];
  for (let k = 0; k < 6; k++) perms.push(shuffle(items).map((i) => i.label).join(', '));
  return {
    prompt: `${prompt} Order from ${asc ? 'smallest to biggest' : 'biggest to smallest'}: ${given}`,
    answer, choices: choices(answer, [rev, given, ...perms]),
    explain: `From ${asc ? 'smallest to biggest' : 'biggest to smallest'}: ${answer}.${explainExtra ? ' ' + explainExtra : ''}`,
    wrongTags: { [rev]: 'order-reversed', ...wrongTags },
  };
}
function signQ(a, b, visual, tag = 'symbol-reversed') {
  // a and b may arrive as formatted strings (e.g. "-0.45"); always compare numerically.
  const na = Number(a), nb = Number(b);
  const sign = na < nb ? '<' : na > nb ? '>' : '=';
  const q = {
    prompt: `Which sign goes in the box? ${neg(a)} [ ] ${neg(b)}`,
    answer: sign, choices: ['<', '>', '='],
    hint: 'The open side of the sign faces the bigger number.',
    explain: sign === '=' ? `${neg(a)} and ${neg(b)} are equal, so the sign is =.` : `${neg(a)} is ${sign === '<' ? 'less' : 'more'} than ${neg(b)}, so ${neg(a)} ${sign} ${neg(b)}.`,
    wrongTags: { [sign === '<' ? '>' : '<']: tag },
  };
  if (visual) q.visual = visual;
  return q;
}
function biggerQ(a, b, labelA, labelB, explain, wrongTag, visual, word = 'bigger') {
  const wantBigger = !['less', 'smaller', 'fewer'].includes(word);
  const ans = (wantBigger ? a > b : a < b) ? labelA : labelB;
  const other = ans === labelA ? labelB : labelA;
  const q = {
    prompt: `Which is ${word}: ${labelA} or ${labelB}?`,
    answer: ans, choices: [labelA, labelB],
    explain, wrongTags: wrongTag ? { [other]: wrongTag } : {},
  };
  if (visual) q.visual = visual;
  return q;
}

const L = {};

// 1. More/fewer/same with objects; numbers to 10.
L[1] = () => pick([
  () => {
    const [a, b] = distinct(2, 1, 10);
    const ans = a > b ? 'top' : 'bottom';
    return {
      prompt: 'Which ten frame has more dots?',
      answer: ans, choices: ['top', 'bottom'],
      visual: { type: 'tenframe', counts: [a, b] },
      hint: 'Count the dots in each frame.',
      explain: `The top has ${a} and the bottom has ${b}. ${Math.max(a, b)} is more, so the ${ans} frame has more.`,
    };
  },
  () => {
    const [a, b] = distinct(2, 1, 10);
    const ans = a < b ? 'top' : 'bottom';
    return {
      prompt: 'Which ten frame has fewer dots?',
      answer: ans, choices: ['top', 'bottom'],
      visual: { type: 'tenframe', counts: [a, b] },
      explain: `The top has ${a} and the bottom has ${b}. ${Math.min(a, b)} is fewer, so the ${ans} frame has fewer.`,
    };
  },
  () => {
    const a = randInt(1, 10), same = Math.random() < 0.4;
    const b = same ? a : pick([a - 1, a + 1].filter((x) => x >= 1 && x <= 10));
    return {
      prompt: 'Do the two frames have the same number of dots?',
      answer: same ? 'yes' : 'no', choices: ['yes', 'no'],
      visual: { type: 'tenframe', counts: [a, b] },
      explain: same ? `Both frames have ${a} dots, so yes.` : `The top has ${a} and the bottom has ${b}, so no.`,
    };
  },
  () => {
    const [a, b] = distinct(2, 0, 10);
    return biggerQ(a, b, String(a), String(b), `${Math.max(a, b)} comes after ${Math.min(a, b)} when counting, so ${Math.max(a, b)} is more.`, null, { type: 'numberline', min: 0, max: 10, marks: [a, b] }, 'more');
  },
  () => {
    const [a, b] = distinct(2, 0, 10);
    return biggerQ(a, b, String(a), String(b), `${Math.min(a, b)} comes before ${Math.max(a, b)} when counting, so ${Math.min(a, b)} is less.`, null, { type: 'numberline', min: 0, max: 10, marks: [a, b] }, 'less');
  },
])();

// 2. Compare and order to 20; <, >, =; number between.
L[2] = () => pick([
  () => {
    const [a, b] = distinct(2, 0, 20);
    return biggerQ(a, b, String(a), String(b), `${Math.max(a, b)} is further along the number line, so it is greater.`, null, { type: 'numberline', min: 0, max: 20, marks: [a, b] }, 'greater');
  },
  () => {
    const same = Math.random() < 0.2;
    const a = randInt(0, 20), b = same ? a : pick(distinct(2, 0, 20).filter((x) => x !== a));
    return signQ(a, b, { type: 'numberline', min: 0, max: 20, marks: [a, b] });
  },
  () => {
    const vals = distinct(3, 0, 20);
    return orderQ(vals.map((v) => ({ label: String(v), value: v })), 'Numbers to 20.');
  },
  () => {
    const a = randInt(0, 17), b = a + 2;
    return {
      prompt: `Which number is between ${a} and ${b}?`, answer: String(a + 1),
      visual: { type: 'numberline', min: 0, max: 20, marks: [a, b] },
      explain: `Counting ${a}, ${a + 1}, ${b}: the number between is ${a + 1}.`,
    };
  },
  () => {
    const a = randInt(2, 18);
    return {
      prompt: `Which number is 1 less than ${a}?`, answer: String(a - 1),
      visual: { type: 'numberline', min: 0, max: 20, highlight: a },
      explain: `One step back from ${a} is ${a - 1}.`,
    };
  },
])();

// 3. Compare to 100 using tens; order 3-4 numbers.
L[3] = () => pick([
  () => {
    const same = Math.random() < 0.15;
    const a = randInt(10, 99), b = same ? a : pick(distinct(2, 10, 99).filter((x) => x !== a));
    return signQ(a, b, { type: 'base10', value: a }, 'symbol-reversed');
  },
  () => {
    const t = randInt(1, 8), a = t * 10 + randInt(0, 9), b = (t + 1) * 10 + randInt(0, 9);
    // make ones-digit comparison misleading: a has bigger ones digit
    const a2 = t * 10 + randInt(5, 9), b2 = (t + 1) * 10 + randInt(0, 4);
    const [x, y] = shuffle([a2, b2]);
    return biggerQ(x, y, String(x), String(y), `Compare tens first: ${b2} has ${t + 1} tens and ${a2} has ${t} tens, so ${b2} is bigger.`, 'compares-ones-first', { type: 'base10', value: Math.max(x, y) });
  },
  () => {
    const n = pick([3, 4]);
    const vals = distinct(n, 10, 99);
    return orderQ(vals.map((v) => ({ label: String(v), value: v })), 'Numbers to 100.', 'Look at the tens digit first.');
  },
  () => {
    const t = randInt(1, 9), o1 = randInt(0, 9);
    let o2; do { o2 = randInt(0, 9); } while (o2 === o1);
    const a = t * 10 + o1, b = t * 10 + o2, c = (t - 1) * 10 + randInt(0, 9);
    const vals = shuffle([a, b, c]);
    const big = Math.max(a, b, c);
    return {
      prompt: `Which is the biggest: ${vals.join(', ')}?`, answer: String(big), choices: vals.map(String),
      explain: `${big} has the most tens, or the same tens and more ones, so it is the biggest.`,
    };
  },
  () => {
    const a = randInt(10, 89), gap = pick([2, 5, 10]);
    const b = a + gap;
    const ans = a + randInt(1, gap - 1);
    return {
      prompt: `Pick a number between ${a} and ${b}.`,
      answer: String(ans), choices: choices(ans, [a - 1, b + 1, a, b]),
      visual: { type: 'numberline', min: Math.floor(a / 10) * 10, max: Math.floor(a / 10) * 10 + 20, marks: [a, b] },
      explain: `${ans} is more than ${a} and less than ${b}.`,
    };
  },
])();

// 4. Compare to 1000 by place value; order 4-5 numbers.
L[4] = () => pick([
  () => {
    const vals = distinct(pick([4, 5]), 10, 999);
    return orderQ(vals.map((v) => ({ label: String(v), value: v })), 'Numbers to 1000.', 'A number with more digits is bigger. Then compare the hundreds.');
  },
  () => {
    const a = randInt(10, 99), b = randInt(100, 999);
    const [x, y] = shuffle([a, b]);
    return biggerQ(x, y, String(x), String(y), `${b} has 3 digits (hundreds) and ${a} has only 2, so ${b} is bigger even if ${a} has bigger digits.`, 'bigger-digits-not-places', { type: 'base10', value: b });
  },
  () => {
    const a = randInt(100, 999);
    let b; do { b = randInt(100, 999); } while (b === a);
    return signQ(a, b, { type: 'base10', value: Math.min(a, b) });
  },
  () => {
    const lo = randInt(1, 18) * 50, hi = lo + 50;
    const ans = lo + randInt(1, 49);
    return {
      prompt: `Pick a number between ${lo} and ${hi}.`,
      answer: String(ans), choices: choices(ans, [lo - randInt(1, 30), hi + randInt(1, 30), lo, hi]),
      visual: { type: 'numberline', min: lo - 50, max: hi + 50, step: 10, marks: [lo, hi] },
      explain: `${ans} is more than ${lo} and less than ${hi}.`,
    };
  },
  () => {
    const h = randInt(1, 9);
    const a = h * 100 + randInt(0, 99), b = h * 100 + randInt(0, 99), c = h * 100 + randInt(0, 99);
    if (new Set([a, b, c]).size < 3) return L[4]();
    const vals = shuffle([a, b, c]);
    const ans = Math.min(a, b, c);
    return {
      prompt: `Which is the smallest: ${vals.join(', ')}?`, answer: String(ans), choices: vals.map(String),
      explain: `All have ${h} hundreds, so compare the tens, then the ones. ${ans} is the smallest.`,
    };
  },
])();

// 5. Compare with different digit counts to 10 000.
L[5] = () => pick([
  () => {
    const vals = [randInt(100, 999), randInt(1000, 9999), randInt(1000, 9999), pick([10000, randInt(10001, 10999)])];
    if (new Set(vals).size < 4) return L[5]();
    return orderQ(shuffle(vals).map((v) => ({ label: String(v), value: v })), 'Mixed lengths.', 'Count the digits first: more digits means a bigger number.');
  },
  () => {
    const a = randInt(1000, 9999);
    let b; do { b = randInt(1000, 9999); } while (b === a);
    return signQ(a, b);
  },
  () => {
    const a = randInt(995, 999), b = randInt(1000, 1010);
    const [x, y] = shuffle([a, b]);
    return biggerQ(x, y, String(x), String(y), `${b} has 4 digits and ${a} has 3, so ${b} is bigger.`, 'digit-count-error');
  },
  () => {
    const t = randInt(1, 9);
    const vals = shuffle([t * 1000 + randInt(0, 99), t * 1000 + randInt(100, 999), t * 1000 + randInt(0, 999)]);
    if (new Set(vals).size < 3) return L[5]();
    const ans = Math.max(...vals);
    return {
      prompt: `Which is the biggest: ${vals.join(', ')}?`, answer: String(ans), choices: vals.map(String),
      explain: `All have ${t} thousands, so compare the hundreds next, then the tens. ${ans} is the biggest.`,
    };
  },
  () => {
    const vals = distinct(4, 1000, 9999);
    return orderQ(vals.map((v) => ({ label: String(v), value: v })), 'Four-digit numbers.', 'Compare thousands, then hundreds, then tens.');
  },
  () => {
    const a = randInt(1, 9) * 1000 + randInt(0, 999);
    const digits = String(a).split('');
    // swap two digits to make a tricky partner
    const i = randInt(0, 2), j = randInt(i + 1, 3);
    const d2 = digits.slice(); [d2[i], d2[j]] = [d2[j], d2[i]];
    const b = Number(d2.join(''));
    if (b === a || b < 1000) return L[5]();
    return biggerQ(a, b, String(a), String(b), `Same digits, but ${Math.max(a, b)} has the bigger digit in the first place where they differ.`, 'digit-count-error');
  },
])();

// 6. Unit and like fractions; decimals to hundredths.
L[6] = () => pick([
  () => {
    const [a, b] = distinct(2, 2, 12);
    const ans = `1/${Math.min(a, b)}`;
    return {
      prompt: `Which is bigger: 1/${a} or 1/${b}?`, answer: ans, choices: [`1/${a}`, `1/${b}`],
      visual: { type: 'fractionbar', bars: [{ parts: a, shaded: 1 }, { parts: b, shaded: 1 }] },
      hint: 'More pieces means smaller pieces.',
      explain: `Cutting into ${Math.max(a, b)} pieces makes smaller pieces than ${Math.min(a, b)}, so ${ans} is bigger.`,
      wrongTags: { [`1/${Math.max(a, b)}`]: 'bigger-denominator-bigger' },
    };
  },
  () => {
    const d = randInt(3, 12), [a, b] = distinct(2, 1, d - 1);
    const ans = `${Math.max(a, b)}/${d}`;
    return {
      prompt: `Which is bigger: ${a}/${d} or ${b}/${d}?`, answer: ans, choices: [`${a}/${d}`, `${b}/${d}`],
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: a }, { parts: d, shaded: b }] },
      explain: `Same size pieces, so more pieces is bigger: ${ans}.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    let h; do { h = randInt(10, 99); } while (h === t * 10);
    const a = `0.${t}`, b = `0.${h}`;
    const ans = t * 10 > h ? a : b;
    const [x, y] = shuffle([a, b]);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: ans, choices: [x, y],
      hint: `Write 0.${t} as 0.${t}0.`,
      explain: `0.${t} = 0.${t}0 = ${t * 10} hundredths. ${h} hundredths is ${h > t * 10 ? 'more' : 'less'}, so ${ans} is bigger.`,
      wrongTags: { [ans === a ? b : a]: ans === a ? 'longer-decimal-bigger' : 'shorter-decimal-bigger' },
    };
  },
  () => {
    const a = randInt(1, 99) / 100, b = randInt(1, 9) / 10;
    return signQ(num(a), num(b), null, 'longer-decimal-bigger');
  },
  () => {
    const vals = distinct(3, 1, 99).map((h) => h / 100);
    const items = vals.map((v) => ({ label: num(v), value: v }));
    return orderQ(items, 'Decimals.', 'Give every number two decimal places, then compare.');
  },
  () => {
    const d = randInt(4, 10), vals = distinct(3, 1, d - 1);
    return orderQ(vals.map((n) => ({ label: `${n}/${d}`, value: n / d })), 'Fractions with the same bottom.', 'Same size pieces, so just compare the top numbers.');
  },
])();

// 7. Unlike fractions by benchmark/equivalence; mix fractions and decimals.
const FD = [[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [4, 5, 0.8], [1, 10, 0.1], [3, 10, 0.3], [7, 10, 0.7], [9, 10, 0.9], [1, 8, 0.125], [3, 8, 0.375], [5, 8, 0.625]];
const lcm = (a, b) => (a * b) / gcd(a, b);
L[7] = () => pick([
  () => {
    const [n1, d1, v1] = pick(FD);
    let n2, d2, v2; do { [n2, d2, v2] = pick(FD); } while (v2 === v1);
    const dec = pick(FD.filter((f) => f[2] !== v1 && f[2] !== v2));
    const items = [{ label: `${n1}/${d1}`, value: v1 }, { label: `${n2}/${d2}`, value: v2 }, { label: num(dec[2]), value: dec[2] }];
    return orderQ(shuffle(items), 'Fractions and decimals.', `As decimals: ${n1}/${d1} = ${v1}, ${n2}/${d2} = ${v2}.`);
  },
  () => {
    const [n, d, v] = pick(FD);
    let dec; do { dec = randInt(1, 9) / 10; } while (dec === v);
    const [x, y] = shuffle([`${n}/${d}`, num(dec)]);
    const ans = v > dec ? `${n}/${d}` : num(dec);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: ans, choices: [x, y],
      visual: { type: 'numberline', min: 0, max: 1, step: 0.1, marks: [v, dec] },
      hint: `Change ${n}/${d} to a decimal first.`,
      explain: `${n}/${d} = ${v}. ${v} ${v > dec ? '>' : '<'} ${num(dec)}, so ${ans} is bigger.`,
      wrongTags: { [ans === num(dec) ? `${n}/${d}` : num(dec)]: 'compare-without-converting' },
    };
  },
  () => {
    const pairs = [[3, 8, 5, 12], [2, 3, 3, 5], [5, 6, 7, 8], [3, 4, 5, 8], [2, 5, 3, 8], [4, 9, 5, 12], [5, 7, 2, 3], [7, 10, 3, 4], [4, 6, 5, 9]];
    const [a, b, c, d] = pick(pairs);
    const l = lcm(b, d);
    const ans = a * d > c * b ? `${a}/${b}` : `${c}/${d}`;
    const [x, y] = shuffle([`${a}/${b}`, `${c}/${d}`]);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: ans, choices: [x, y],
      visual: { type: 'fractionbar', bars: [{ parts: b, shaded: a }, { parts: d, shaded: c }] },
      explain: `In ${l}ths: ${a}/${b} = ${a * (l / b)}/${l} and ${c}/${d} = ${c * (l / d)}/${l}. So ${ans} is bigger.`,
    };
  },
  () => {
    const d = pick([5, 7, 9, 11]);
    let n; do { n = randInt(1, d - 1); } while (n * 2 === d);
    const more = n * 2 > d;
    return {
      prompt: `Is ${n}/${d} more or less than 1/2?`, answer: more ? 'more' : 'less', choices: ['more', 'less'],
      visual: { type: 'numberline', min: 0, max: 1, step: 1 / d, labels: 'fraction', den: d, highlight: n / d },
      explain: `Half of ${d} is ${d / 2}. ${n} is ${more ? 'more' : 'less'} than that, so ${n}/${d} is ${more ? 'more' : 'less'} than 1/2.`,
    };
  },
  () => {
    const fs = shuffle(FD).slice(0, 3);
    return orderQ(fs.map(([n, d, v]) => ({ label: `${n}/${d}`, value: v })), 'Fractions.', `As decimals: ${fs.map(([n, d, v]) => `${n}/${d} = ${v}`).join(', ')}.`);
  },
  () => {
    // 1/4 and 3/4 sit exactly halfway between two benchmarks, so exclude them.
    const [n, d, v] = pick(FD.filter((f) => f[2] !== 0.25 && f[2] !== 0.75));
    const closest = [['0', 0], ['1/2', 0.5], ['1', 1]].sort((p, q) => Math.abs(p[1] - v) - Math.abs(q[1] - v))[0][0];
    return {
      prompt: `Is ${n}/${d} closest to 0, 1/2 or 1?`, answer: closest, choices: ['0', '1/2', '1'],
      visual: { type: 'numberline', min: 0, max: 1, step: 1 / d, labels: 'fraction', den: d, highlight: v },
      explain: `${n}/${d} = ${v}, which is closest to ${closest}.`,
    };
  },
])();

// 8. Integers; order with negatives.
L[8] = () => pick([
  () => {
    const vals = distinct(4, -20, 20);
    if (!vals.some((v) => v < 0)) vals[0] = -Math.abs(vals[0]) - 1;
    return orderQ(vals.map((v) => ({ label: neg(v), value: v })), 'Integers.', 'Negative numbers are to the left of 0, so they are smaller.', {});
  },
  () => {
    const [a, b] = distinct(2, -20, -1);
    const ans = neg(Math.max(a, b));
    const [x, y] = shuffle([a, b]);
    return {
      prompt: `Which is bigger: ${neg(x)} or ${neg(y)}?`, answer: ans, choices: [neg(x), neg(y)],
      visual: { type: 'numberline', min: -20, max: 0, marks: [a, b] },
      hint: 'Closer to 0 is bigger for negatives.',
      explain: `${ans} is closer to 0 on the number line, so it is bigger than ${neg(Math.min(a, b))}.`,
      wrongTags: { [neg(Math.min(a, b))]: 'negative-magnitude' },
    };
  },
  () => {
    const a = randInt(-30, 30);
    let b; do { b = randInt(-30, 30); } while (b === a);
    return signQ(a, b, { type: 'numberline', min: -30, max: 30, step: 5, marks: [a, b] }, 'negative-magnitude');
  },
  () => {
    const [a, b] = distinct(2, -15, 10);
    const ans = neg(Math.min(a, b));
    const [x, y] = shuffle([a, b]);
    return {
      prompt: `Which temperature is colder: ${neg(x)} degrees or ${neg(y)} degrees?`, answer: ans, choices: [neg(x), neg(y)],
      visual: { type: 'thermometer', value: Math.min(a, b), min: -20, max: 20 },
      explain: `${ans} is lower on the thermometer, so it is colder.`,
      wrongTags: { [neg(Math.max(a, b))]: 'negative-magnitude' },
    };
  },
  () => {
    const a = randInt(-9, 8), b = a + 2;
    return {
      prompt: `Which integer is between ${neg(a)} and ${neg(b)}?`, answer: String(a + 1),
      visual: { type: 'numberline', min: -10, max: 10, marks: [a, b] },
      explain: `Counting up from ${neg(a)}: ${neg(a)}, ${neg(a + 1)}, ${neg(b)}. The number between is ${neg(a + 1)}.`,
    };
  },
  () => {
    const vals = distinct(4, -100, 100);
    return orderQ(vals.map((v) => ({ label: neg(v), value: v })), 'Integers to 100.', 'The most negative number is the smallest.');
  },
])();

// 9. Percents, fractions, decimals mixed; large numbers to a million.
const PFD = [[1, 2, 0.5, 50], [1, 4, 0.25, 25], [3, 4, 0.75, 75], [1, 5, 0.2, 20], [2, 5, 0.4, 40], [3, 5, 0.6, 60], [4, 5, 0.8, 80], [1, 10, 0.1, 10], [3, 10, 0.3, 30], [7, 10, 0.7, 70], [9, 10, 0.9, 90], [1, 3, 0.333, 33.3], [2, 3, 0.667, 66.7], [1, 8, 0.125, 12.5], [3, 8, 0.375, 37.5], [5, 8, 0.625, 62.5]];
L[9] = () => pick([
  () => {
    const picks = shuffle(PFD).slice(0, 3);
    const items = picks.map(([n, d, v, p], i) => (i === 0 ? { label: `${n}/${d}`, value: v } : i === 1 ? { label: `${p}%`, value: v } : { label: num(v), value: v }));
    if (new Set(items.map((i) => i.value)).size < 3) return L[9]();
    return orderQ(shuffle(items), 'Mixed forms.', `As decimals: ${picks.map(([n, d, v]) => `${n}/${d} = ${v}`).join(', ')}.`);
  },
  () => {
    const [n, d, v, p] = pick([[2, 3, 0.667, 66.7], [1, 3, 0.333, 33.3], [3, 8, 0.375, 37.5], [5, 8, 0.625, 62.5], [1, 8, 0.125, 12.5]]);
    const pct = pick([Math.floor(p), Math.ceil(p), Math.round(p) + pick([-3, 3, -5, 5])].filter((x) => x !== p));
    const ans = v * 100 > pct ? `${n}/${d}` : `${pct}%`;
    const [x, y] = shuffle([`${n}/${d}`, `${pct}%`]);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: ans, choices: [x, y],
      hint: `Turn ${n}/${d} into a percent first.`,
      explain: `${n}/${d} = ${p}%. Compare with ${pct}%: ${ans} is bigger.`,
      wrongTags: { [ans === `${n}/${d}` ? `${pct}%` : `${n}/${d}`]: 'fraction-percent-mismatch' },
    };
  },
  () => {
    const [n, d, v, p] = pick(PFD);
    let dec; do { dec = randInt(1, 99) / 100; } while (Math.abs(dec - v) < 0.005);
    const ans = v > dec ? `${p}%` : num(dec);
    const [x, y] = shuffle([`${p}%`, num(dec)]);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: ans, choices: [x, y],
      explain: `${p}% = ${num(p / 100)}. Compared with ${num(dec)}, ${ans} is bigger.`,
    };
  },
  () => {
    const vals = distinct(4, 10000, 999999);
    vals[randInt(0, 3)] = pick([1000000, randInt(1000001, 1999999)]);
    return orderQ(shuffle(vals).map((v) => ({ label: String(v), value: v })), 'Big numbers.', 'Count the digits first, then compare from the left.');
  },
  () => {
    const a = randInt(100000, 999999);
    const digits = String(a).split('');
    const i = randInt(0, 4), j = randInt(i + 1, 5);
    const d2 = digits.slice(); [d2[i], d2[j]] = [d2[j], d2[i]];
    const b = Number(d2.join(''));
    if (b === a || b < 100000) return L[9]();
    return signQ(a, b);
  },
  () => {
    const [n, d, v, p] = pick(PFD.filter((f) => f[3] % 1 === 0));
    const items = [{ label: `${n}/${d}`, value: v }, { label: `${p}%`, value: v }, { label: num(v), value: v }];
    const odd = pick(PFD.filter((f) => f[2] !== v));
    const oddLabel = pick([`${odd[0]}/${odd[1]}`, `${odd[3]}%`, num(odd[2])]);
    return {
      prompt: `Three of these are equal. Which one is different: ${shuffle([...items.map((i) => i.label), oddLabel]).join(', ')}?`,
      answer: oddLabel, choices: shuffle([...items.map((i) => i.label), oddLabel]),
      explain: `${n}/${d} = ${num(v)} = ${p}%. The odd one out is ${oddLabel}.`,
    };
  },
])();

// 10. Negative fractions and decimals; rates.
const NEGF = [[-1, 2, -0.5], [-1, 4, -0.25], [-3, 4, -0.75], [-1, 5, -0.2], [-2, 5, -0.4], [-3, 5, -0.6], [-1, 10, -0.1], [-7, 10, -0.7], [-3, 8, -0.375], [-5, 8, -0.625]];
L[10] = () => pick([
  () => {
    const [n, d, v] = pick(NEGF);
    let dec; do { dec = -randInt(1, 99) / 100; } while (Math.abs(dec - v) < 0.005);
    const pos = randInt(1, 9) / 10;
    const items = [{ label: `${neg(n)}/${d}`, value: v }, { label: neg(num(dec)), value: dec }, { label: num(pos), value: pos }];
    return orderQ(shuffle(items), 'Positive and negative.', `${neg(n)}/${d} = ${neg(num(v))}. The most negative is the smallest.`, {});
  },
  () => {
    const [n, d, v] = pick(NEGF);
    let dec; do { dec = -randInt(1, 99) / 100; } while (Math.abs(dec - v) < 0.005);
    const fl = `${neg(n)}/${d}`, dl = neg(num(dec));
    const ans = v > dec ? fl : dl;
    const [x, y] = shuffle([fl, dl]);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: ans, choices: [x, y],
      visual: { type: 'numberline', min: -1, max: 0, step: 0.25, marks: [v, dec] },
      hint: 'For negatives, the one closer to 0 is bigger.',
      explain: `${fl} = ${neg(num(v))}. ${ans} is closer to 0, so it is bigger.`,
      wrongTags: { [ans === fl ? dl : fl]: 'sign-magnitude-confusion' },
    };
  },
  () => {
    const a = -randInt(1, 99) / 100, b = -randInt(1, 9) / 10;
    if (Math.abs(a - b) < 0.005) return L[10]();
    return signQ(num(a), num(b), { type: 'numberline', min: -1, max: 0, step: 0.1, marks: [a, b] }, 'sign-magnitude-confusion');
  },
  () => {
    const k1 = randInt(2, 6), k2 = randInt(2, 6);
    const u1 = randInt(2, 8), u2 = u1 + pick([-1, 1, -2, 2]);
    if (u2 < 1) return L[10]();
    const p1 = k1 * u1, p2 = k2 * u2;
    const A = `${k1} kg for $${p1}`, B = `${k2} kg for $${p2}`;
    const ans = u1 < u2 ? A : B;
    return {
      prompt: `Which is cheaper per kg: ${A} or ${B}?`, answer: ans, choices: [A, B],
      hint: 'Divide the price by the number of kg.',
      explain: `${A} is $${u1} per kg. ${B} is $${u2} per kg. ${ans} is cheaper.`,
      wrongTags: { [ans === A ? B : A]: 'compares-totals-not-rates' },
    };
  },
  () => {
    const h1 = randInt(2, 5), h2 = randInt(2, 5);
    const s1 = randInt(40, 90), s2 = s1 + pick([-10, 10, -5, 5]);
    const d1 = h1 * s1, d2 = h2 * s2;
    const A = `${d1} km in ${h1} h`, B = `${d2} km in ${h2} h`;
    const ans = s1 > s2 ? A : B;
    return {
      prompt: `Which is faster: ${A} or ${B}?`, answer: ans, choices: [A, B],
      explain: `${A} is ${s1} km/h. ${B} is ${s2} km/h. ${ans} is faster.`,
      wrongTags: { [ans === A ? B : A]: 'compares-totals-not-rates' },
    };
  },
  () => {
    const vals = shuffle([pick(NEGF)[2], -randInt(1, 9) / 10, randInt(1, 9) / 10, -randInt(1, 4)]);
    if (new Set(vals).size < 4) return L[10]();
    return orderQ(vals.map((v) => ({ label: neg(num(v)), value: v })), 'Decimals and negatives.', 'Negatives come first; the more negative, the smaller.');
  },
])();

export default {
  id: 'compare', name: 'Comparing and Ordering', emoji: '⚖️', group: 'number',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const q = L[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) delete q.wrongTags[String(q.answer)];
    return q;
  },
};
