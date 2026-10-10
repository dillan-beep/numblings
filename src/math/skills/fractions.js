// Fractions ladder (curriculum A7). Levels 1-10.
import { randInt, pick, shuffle } from '../rng.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
// simplified fraction string; whole numbers come out plain
const fr = (n, d) => {
  const g = gcd(Math.abs(n), d) || 1;
  n /= g; d /= g;
  return d === 1 ? `${n}` : `${n}/${d}`;
};
const raw = (n, d) => `${n}/${d}`;
const mixed = (n, d) => {
  const w = Math.floor(n / d), r = n % d;
  if (r === 0) return `${w}`;
  const g = gcd(r, d);
  return w === 0 ? `${r / g}/${d / g}` : `${w} ${r / g}/${d / g}`;
};
const num = (x) => String(Math.round(x * 1e6) / 1e6);
const choices = (answer, distractors, n = 4) => {
  const out = [String(answer)];
  for (const d of distractors) { const s = String(d); if (!out.includes(s) && out.length < n) out.push(s); }
  while (out.length < 2) out.push(out[0] + '0');
  return shuffle(out);
};
const FOODS = ['pizza', 'pie', 'cookie', 'sandwich', 'cake', 'waffle'];
const ORD = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 8: 'eighth', 10: 'tenth' };
const PL = { 2: 'halves', 3: 'thirds', 4: 'fourths', 5: 'fifths', 6: 'sixths', 8: 'eighths', 10: 'tenths' };

const L = {};

// 1. Halves and wholes; equal vs unequal parts.
L[1] = () => pick([
  () => {
    const parts = pick([2, 3, 4]);
    const yes = parts === 2;
    return {
      prompt: 'This circle is cut into equal parts. Is it cut in half?',
      answer: yes ? 'yes' : 'no', choices: ['yes', 'no'],
      visual: { type: 'fractioncircle', parts, shaded: 1 },
      hint: 'A half means 2 equal parts.',
      explain: yes ? 'There are 2 equal parts, so each part is a half.' : `There are ${parts} equal parts, not 2, so these are not halves.`,
      wrongTags: yes ? {} : { yes: 'unequal-halves' },
    };
  },
  () => ({
    prompt: 'What fraction of the circle is shaded?',
    answer: '1/2', choices: shuffle(['1/2', '1 whole', '2']),
    visual: { type: 'fractioncircle', parts: 2, shaded: 1 },
    explain: 'The circle has 2 equal parts and 1 is shaded, so 1/2 is shaded.',
  }),
  () => ({
    prompt: 'The circle is cut into halves. How many halves are shaded?',
    answer: '2',
    visual: { type: 'fractioncircle', parts: 2, shaded: 2 },
    explain: 'Both halves are shaded, so 2 halves are shaded. That is one whole.',
  }),
  () => {
    const n = pick([2, 3, 4]), food = pick(FOODS);
    const yes = n === 2;
    return {
      prompt: `A ${food} is cut into ${n} equal pieces. Is each piece a half?`,
      answer: yes ? 'yes' : 'no', choices: ['yes', 'no'],
      visual: { type: 'fractioncircle', parts: n, shaded: 1 },
      explain: yes ? '2 equal pieces means each piece is a half.' : `Halves need exactly 2 equal pieces. This has ${n}, so each piece is a ${ORD[n]}.`,
      wrongTags: yes ? {} : { yes: 'unequal-halves' },
    };
  },
  () => ({
    prompt: 'How many halves make one whole?', answer: '2',
    visual: { type: 'fractionbar', parts: 2, shaded: 2 },
    explain: 'Two halves put together make one whole.',
  }),
  () => {
    const food = pick(FOODS);
    return {
      prompt: `A ${food} is cut into 2 equal pieces. What is one piece called?`,
      answer: 'a half', choices: shuffle(['a half', 'a third', 'a whole']),
      visual: { type: 'fractioncircle', parts: 2, shaded: 1 },
      explain: 'One of 2 equal pieces is a half.',
    };
  },
])();

// 2. Halves, thirds, fourths; name the unit fraction.
L[2] = () => pick([
  () => {
    const p = pick([2, 3, 4]);
    const type = pick(['fractionbar', 'fractioncircle']);
    return {
      prompt: 'What fraction is shaded?',
      answer: `1/${p}`, choices: choices(`1/${p}`, [`${p}/1`, `1/${p === 4 ? 3 : p + 1}`, `${p - 1}/${p}`]),
      visual: { type, parts: p, shaded: 1 },
      hint: 'Count the equal parts. That number goes on the bottom.',
      explain: `There are ${p} equal parts and 1 is shaded, so 1/${p} is shaded.`,
      wrongTags: { [`${p}/1`]: 'numerator-denominator-swapped' },
    };
  },
  () => {
    const [a, b] = shuffle(pick([[2, 3], [2, 4], [3, 4]]));
    const big = Math.min(a, b);
    return {
      prompt: `Which is bigger: 1/${a} or 1/${b}?`,
      answer: `1/${big}`, choices: [`1/${a}`, `1/${b}`],
      visual: { type: 'fractionbar', bars: [{ parts: a, shaded: 1 }, { parts: b, shaded: 1 }] },
      hint: 'More parts means each part is smaller.',
      explain: `Cutting into ${Math.max(a, b)} parts makes smaller pieces than ${big} parts, so 1/${big} is bigger.`,
      wrongTags: { [`1/${Math.max(a, b)}`]: 'bigger-denominator-bigger' },
    };
  },
  () => {
    const p = pick([2, 3, 4]), food = pick(FOODS);
    const names = { 2: 'one half', 3: 'one third', 4: 'one fourth' };
    return {
      prompt: `A ${food} is cut into ${p} equal slices. What is one slice called?`,
      answer: names[p], choices: shuffle(Object.values(names)),
      visual: { type: 'fractioncircle', parts: p, shaded: 1 },
      explain: `One of ${p} equal slices is ${names[p]}.`,
    };
  },
  () => {
    const p = pick([2, 3, 4]);
    return {
      prompt: `Tap the bar to shade 1/${p} of it.`,
      answer: '1', input: 'visual',
      visual: { type: 'fractionbar', parts: p, shaded: 0, select: true },
      explain: `The bar has ${p} equal parts. 1/${p} means shade 1 of them.`,
    };
  },
  () => {
    const p = pick([2, 3, 4]);
    return {
      prompt: `How many ${PL[p]} make one whole?`, answer: String(p),
      visual: { type: 'fractionbar', parts: p, shaded: p },
      explain: `A whole cut into ${PL[p]} has ${p} pieces, so ${p} ${PL[p]} make a whole.`,
    };
  },
])();

// 3. Fractions of a set; unit fractions to 1/10; count fractional parts.
L[3] = () => pick([
  () => {
    const p = randInt(4, 10), s = randInt(1, p - 1);
    return {
      prompt: 'What fraction of the bar is shaded? Type it like 3/4.',
      answer: raw(s, p),
      visual: { type: 'fractionbar', parts: p, shaded: s },
      hint: 'Shaded parts on top, total parts on the bottom.',
      explain: `${s} of ${p} equal parts are shaded, so ${s}/${p} is shaded.`,
    };
  },
  () => {
    const p = randInt(4, 10), s = randInt(1, p - 1);
    return {
      prompt: 'What fraction of the bar is shaded?',
      answer: raw(s, p), choices: choices(raw(s, p), [raw(p, s), raw(s, p - s), raw(p - s, p)]),
      visual: { type: 'fractionbar', parts: p, shaded: s },
      explain: `${s} of ${p} equal parts are shaded, so ${s}/${p} is shaded.`,
      wrongTags: { [raw(p, s)]: 'numerator-denominator-swapped', [raw(s, p - s)]: 'shaded-over-unshaded' },
    };
  },
  () => {
    const k = randInt(2, 5), m = randInt(2, 5), n = k * m;
    return {
      prompt: `Here are ${n} counters. How many is 1/${k} of them?`,
      answer: String(m),
      visual: { type: 'counters', count: n },
      hint: `Split the ${n} counters into ${k} equal groups.`,
      explain: `${n} counters split into ${k} equal groups gives ${m} in each group, so 1/${k} of ${n} is ${m}.`,
    };
  },
  () => {
    const p = randInt(3, 8), s = randInt(1, p - 1);
    return {
      prompt: `Tap the bar to shade ${s}/${p} of it.`,
      answer: String(s), input: 'visual',
      visual: { type: 'fractionbar', parts: p, shaded: 0, select: true },
      explain: `${s}/${p} means ${s} of the ${p} equal parts.`,
    };
  },
  () => {
    const p = pick([4, 5, 6, 8, 10]), s = randInt(3, p - 1);
    return {
      prompt: `Count by ${PL[p]}: ${raw(s - 2, p)}, ${raw(s - 1, p)}, ?`,
      answer: raw(s, p),
      explain: `Counting by ${PL[p]} adds 1 on top each time: ${raw(s - 2, p)}, ${raw(s - 1, p)}, ${raw(s, p)}.`,
    };
  },
  () => {
    const p = randInt(5, 10);
    return {
      prompt: `A shape is cut into ${p} equal parts. What fraction is one part?`,
      answer: `1/${p}`,
      visual: { type: 'fractionbar', parts: p, shaded: 1 },
      explain: `One of ${p} equal parts is 1/${p}.`,
    };
  },
])();

// 4. Number line; equivalence 1/2 = 2/4; compare unit fractions.
L[4] = () => pick([
  () => {
    const d = pick([3, 4, 5, 6, 8, 10]), n = randInt(1, d - 1);
    return {
      prompt: 'What fraction is at the dot?',
      answer: raw(n, d), choices: choices(raw(n, d), [raw(n, d - 1), raw(n, d + 1), raw(n + 1, d)]),
      visual: { type: 'numberline', min: 0, max: 1, step: 1 / d, labels: 'fraction', den: d, highlight: n / d },
      hint: `Count the spaces between 0 and 1, not the tick marks.`,
      explain: `The line from 0 to 1 is cut into ${d} equal spaces. The dot is ${n} spaces along, so it is ${n}/${d}.`,
      wrongTags: { [raw(n, d - 1)]: 'count-ticks-not-spaces', [raw(n, d + 1)]: 'count-ticks-not-spaces' },
    };
  },
  () => {
    const d = pick([2, 4, 5, 10]), n = randInt(1, d - 1);
    return {
      prompt: `Tap ${n}/${d} on the number line.`,
      answer: num(n / d), input: 'visual',
      visual: { type: 'numberline', min: 0, max: 1, step: 1 / d, labels: 'fraction', den: d, question: 'point' },
      explain: `The line is cut into ${d} equal spaces. ${n}/${d} is ${n} space${n === 1 ? '' : 's'} from 0.`,
    };
  },
  () => {
    const d = pick([4, 6, 8, 10, 12]);
    return {
      prompt: `Fill in the missing number: 1/2 = ?/${d}`,
      answer: String(d / 2),
      visual: { type: 'fractionbar', bars: [{ parts: 2, shaded: 1 }, { parts: d, shaded: d / 2 }] },
      hint: 'Half of the bottom number.',
      explain: `Half of ${d} parts is ${d / 2} parts, so 1/2 = ${d / 2}/${d}.`,
    };
  },
  () => {
    const d = pick([3, 4]), k = pick([2, 3]);
    return {
      prompt: `Fill in the missing number: 1/${d} = ?/${d * k}`,
      answer: String(k),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: 1 }, { parts: d * k, shaded: k }] },
      explain: `Each ${ORD[d]} is cut into ${k} smaller pieces, so 1/${d} = ${k}/${d * k}.`,
    };
  },
  () => {
    const ans = pick(['2/4', '3/6', '4/8', '5/10']);
    const d = Number(ans.split('/')[1]);
    return {
      prompt: 'Which fraction equals 1/2?',
      answer: ans, choices: choices(ans, [`1/${d}`, `${d / 2 + 1}/${d}`, `2/${d + 2}`]),
      visual: { type: 'fractionbar', bars: [{ parts: 2, shaded: 1 }, { parts: d, shaded: d / 2 }] },
      explain: `${ans} shades exactly half of the bar, the same as 1/2.`,
    };
  },
  () => {
    const a = randInt(2, 12);
    let b; do { b = randInt(2, 12); } while (b === a);
    const big = Math.min(a, b), small = Math.max(a, b);
    return {
      prompt: `Which is bigger: 1/${a} or 1/${b}?`,
      answer: `1/${big}`, choices: [`1/${a}`, `1/${b}`],
      visual: { type: 'fractionbar', bars: [{ parts: a, shaded: 1 }, { parts: b, shaded: 1 }] },
      explain: `Splitting a whole into ${small} pieces makes smaller pieces than ${big}, so 1/${big} is bigger.`,
      wrongTags: { [`1/${small}`]: 'bigger-denominator-bigger' },
    };
  },
  () => {
    const d = pick([2, 3, 4]), n = randInt(1, d - 1);
    const val = (d + n) / d;
    return {
      prompt: 'What number is at the dot?',
      answer: mixed(d + n, d), choices: choices(mixed(d + n, d), [raw(n, d), mixed(d + n + 1, d), `${d + n}`]),
      visual: { type: 'numberline', min: 0, max: 2, step: 1 / d, labels: 'fraction', den: d, highlight: val },
      explain: `The dot is past 1 by ${n}/${d}, so it is ${mixed(d + n, d)}.`,
    };
  },
])();

// 5. Equivalent fractions by scaling; same numerator/denominator compare; mixed and improper.
const SIMPLE = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [5, 6]];
L[5] = () => pick([
  () => {
    const [n, d] = pick(SIMPLE), k = randInt(2, 4);
    const askNum = Math.random() < 0.5;
    return {
      prompt: askNum ? `Fill in the missing number: ${n}/${d} = ?/${d * k}` : `Fill in the missing number: ${n}/${d} = ${n * k}/?`,
      answer: String(askNum ? n * k : d * k),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: n }, { parts: d * k, shaded: n * k }] },
      hint: `Multiply the top and bottom by the same number.`,
      explain: `Multiply top and bottom by ${k}: ${n}/${d} = ${n * k}/${d * k}.`,
    };
  },
  () => {
    const [n, d] = pick(SIMPLE), k = randInt(2, 4);
    return {
      prompt: `Fill in the missing number: ${n * k}/${d * k} = ?/${d}`,
      answer: String(n),
      hint: `Divide the top and bottom by the same number.`,
      explain: `Divide top and bottom by ${k}: ${n * k}/${d * k} = ${n}/${d}.`,
    };
  },
  () => {
    const [n, d] = pick(SIMPLE), k = randInt(2, 4);
    const ans = raw(n * k, d * k);
    return {
      prompt: `Which fraction is equivalent to ${n}/${d}?`,
      answer: ans, choices: choices(ans, [raw(n + 1, d + 1), raw(n, d * k), raw(n * k, d)]),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: n }, { parts: d * k, shaded: n * k }] },
      explain: `Multiplying top and bottom by ${k} keeps the same amount: ${n}/${d} = ${ans}.`,
      wrongTags: { [raw(n + 1, d + 1)]: 'add-to-both' },
    };
  },
  () => {
    const d = randInt(5, 12), a = randInt(1, d - 2), b = randInt(a + 1, d - 1);
    const [x, y] = shuffle([a, b]);
    return {
      prompt: `Which is bigger: ${x}/${d} or ${y}/${d}?`,
      answer: raw(b, d), choices: [raw(x, d), raw(y, d)],
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: x }, { parts: d, shaded: y }] },
      explain: `Same size pieces, so more pieces is bigger: ${b}/${d} > ${a}/${d}.`,
    };
  },
  () => {
    const n = randInt(2, 5), a = randInt(n + 1, 10), b = randInt(a + 1, 12);
    const [x, y] = shuffle([a, b]);
    return {
      prompt: `Which is bigger: ${n}/${x} or ${n}/${y}?`,
      answer: raw(n, a), choices: [raw(n, x), raw(n, y)],
      visual: { type: 'fractionbar', bars: [{ parts: x, shaded: n }, { parts: y, shaded: n }] },
      explain: `Same number of pieces, but 1/${a} pieces are bigger than 1/${b} pieces, so ${n}/${a} is bigger.`,
      wrongTags: { [raw(n, b)]: 'bigger-denominator-bigger' },
    };
  },
  () => {
    const d = randInt(2, 6), w = randInt(1, 3);
    let r; do { r = randInt(1, d - 1); } while (gcd(r, d) !== 1); // so the mixed number needs no extra simplifying
    const n = w * d + r;
    const ans = mixed(n, d);
    return {
      prompt: `Write ${n}/${d} as a mixed number.`,
      answer: ans, choices: choices(ans, [`${w} ${r + 1}/${d}`, `${w + 1} ${r}/${d}`, `${r}/${d}`]),
      hint: `How many whole ${d}/${d}s fit inside ${n}/${d}?`,
      explain: `${n} ÷ ${d} = ${w} remainder ${r}, so ${n}/${d} = ${ans}.`,
      wrongTags: { [`${r}/${d}`]: 'drop-whole' },
    };
  },
  () => {
    const d = randInt(2, 6), w = randInt(1, 4), r = randInt(1, d - 1);
    return {
      prompt: `Write ${w} ${r}/${d} as an improper fraction.`,
      answer: raw(w * d + r, d),
      hint: `${w} wholes is ${w} × ${d} ${PL[d] || 'pieces'}.`,
      explain: `${w} × ${d} + ${r} = ${w * d + r}, so ${w} ${r}/${d} = ${w * d + r}/${d}.`,
    };
  },
])();

// 6. Add/subtract like denominators; simplest form; fraction of a quantity.
L[6] = () => pick([
  () => {
    const d = randInt(3, 12), a = randInt(1, d - 2), b = randInt(1, d - a);
    return {
      prompt: `${a}/${d} + ${b}/${d} = ?`,
      answer: fr(a + b, d),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: a }, { parts: d, shaded: b }] },
      hint: 'Same size pieces: add the tops, keep the bottom.',
      explain: `${a} + ${b} = ${a + b} pieces of size 1/${d}, so the sum is ${a + b}/${d}${fr(a + b, d) !== raw(a + b, d) ? ' = ' + fr(a + b, d) : ''}.`,
    };
  },
  () => {
    const d = randInt(3, 12), a = randInt(1, d - 2), b = randInt(1, d - a - 1 > 0 ? d - a - 1 : 1);
    const ans = raw(a + b, d);
    return {
      prompt: `${a}/${d} + ${b}/${d} = ?`,
      answer: ans, choices: choices(ans, [raw(a + b, 2 * d), raw(a * b, d), raw(a + b, d + 1)]),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: a }, { parts: d, shaded: b }] },
      explain: `Add the numerators only: ${a} + ${b} = ${a + b}. The pieces are still ${PL[d] || '1/' + d + 's'}, so ${ans}.`,
      wrongTags: { [raw(a + b, 2 * d)]: 'add-denominators', [raw(a + b, d + 1)]: 'add-denominators' },
    };
  },
  () => {
    const d = randInt(3, 12), b = randInt(1, d - 2), a = randInt(b + 1, d - 1);
    return {
      prompt: `${a}/${d} − ${b}/${d} = ?`,
      answer: fr(a - b, d),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: a }, { parts: d, shaded: b }] },
      hint: 'Subtract the tops, keep the bottom.',
      explain: `${a} − ${b} = ${a - b} piece${a - b === 1 ? '' : 's'} of size 1/${d}, so ${a - b}/${d}${fr(a - b, d) !== raw(a - b, d) ? ' = ' + fr(a - b, d) : ''}.`,
    };
  },
  () => {
    const [n, d] = pick(SIMPLE), k = randInt(2, 4);
    const ans = raw(n, d);
    return {
      prompt: `Write ${n * k}/${d * k} in simplest form.`,
      answer: ans, choices: choices(ans, [raw(n * k, d * k), raw(n, d * k), raw(n * k, d * k + 1)]),
      hint: `What number divides into both ${n * k} and ${d * k}?`,
      explain: `Divide top and bottom by ${k}: ${n * k}/${d * k} = ${ans}.`,
      wrongTags: { [raw(n * k, d * k)]: 'not-simplified' },
    };
  },
  () => {
    const [n, d] = pick(SIMPLE), m = randInt(2, 8), q = d * m;
    return {
      prompt: `What is ${n}/${d} of ${q}?`,
      answer: String(n * m),
      visual: { type: 'fractionbar', parts: d, shaded: n },
      hint: n === 1 ? `Split ${q} into ${d} equal groups.` : `First find 1/${d} of ${q}, then multiply by ${n}.`,
      explain: n === 1 ? `${q} ÷ ${d} = ${m}. So 1/${d} of ${q} is ${m}.` : `${q} ÷ ${d} = ${m}, and ${n} × ${m} = ${n * m}. So ${n}/${d} of ${q} is ${n * m}.`,
    };
  },
])();

// 7. Unlike denominators; benchmark comparisons.
const lcm = (a, b) => (a * b) / gcd(a, b);
const UNLIKE = [[2, 3], [2, 5], [3, 4], [2, 6], [3, 6], [4, 6], [2, 8], [4, 8], [3, 9], [2, 10], [5, 10], [4, 12], [3, 12], [6, 12]];
L[7] = () => pick([
  () => {
    const [d1, d2] = shuffle(pick(UNLIKE)), a = randInt(1, d1 - 1), b = randInt(1, d2 - 1);
    const l = lcm(d1, d2), n = a * (l / d1) + b * (l / d2);
    return {
      prompt: `${a}/${d1} + ${b}/${d2} = ?`,
      answer: fr(n, l),
      visual: { type: 'fractionbar', bars: [{ parts: d1, shaded: a }, { parts: d2, shaded: b }] },
      hint: `Change both to ${PL[l] || l + 'ths'} first.`,
      explain: `${a}/${d1} = ${a * (l / d1)}/${l} and ${b}/${d2} = ${b * (l / d2)}/${l}. Add: ${n}/${l}${fr(n, l) !== raw(n, l) ? ' = ' + fr(n, l) : ''}.`,
    };
  },
  () => {
    const [d1, d2] = shuffle(pick(UNLIKE)), a = randInt(1, d1 - 1), b = randInt(1, d2 - 1);
    const l = lcm(d1, d2), n = a * (l / d1) + b * (l / d2);
    const ans = raw(n, l);
    return {
      prompt: `${a}/${d1} + ${b}/${d2} = ?`,
      answer: ans, choices: choices(ans, [raw(a + b, d1 + d2), raw(a + b, l), raw(a * b, d1 * d2)]),
      explain: `Use ${l} as the common denominator: ${a * (l / d1)}/${l} + ${b * (l / d2)}/${l} = ${ans}.`,
      wrongTags: { [raw(a + b, d1 + d2)]: 'add-denominators', [raw(a + b, l)]: 'forgot-to-scale-numerator' },
    };
  },
  () => {
    const [d1, d2] = shuffle(pick(UNLIKE));
    const l = lcm(d1, d2);
    let a, b, n;
    do { a = randInt(1, d1 - 1); b = randInt(1, d2 - 1); n = a * (l / d1) - b * (l / d2); } while (n <= 0);
    return {
      prompt: `${a}/${d1} − ${b}/${d2} = ?`,
      answer: fr(n, l),
      hint: `Change both to ${PL[l] || l + 'ths'} first.`,
      explain: `${a}/${d1} = ${a * (l / d1)}/${l} and ${b}/${d2} = ${b * (l / d2)}/${l}. Subtract: ${n}/${l}${fr(n, l) !== raw(n, l) ? ' = ' + fr(n, l) : ''}.`,
    };
  },
  () => {
    const d1 = pick([4, 5, 6, 8, 10, 12]);
    let d2; do { d2 = pick([4, 5, 6, 8, 10, 12]); } while (d2 === d1);
    const f1 = [d1 - 1, d1], f2 = [d2 - 1, d2];
    const closer = 1 / d1 < 1 / d2 ? f1 : f2;
    const [x, y] = shuffle([f1, f2]);
    return {
      prompt: `Which is closer to 1: ${raw(...x)} or ${raw(...y)}?`,
      answer: raw(...closer), choices: [raw(...x), raw(...y)],
      visual: { type: 'fractionbar', bars: [{ parts: x[1], shaded: x[0] }, { parts: y[1], shaded: y[0] }] },
      hint: 'How far is each one from 1?',
      explain: `${raw(...f1)} is 1/${d1} away from 1 and ${raw(...f2)} is 1/${d2} away. The smaller gap is 1/${closer[1]}, so ${raw(...closer)} is closer.`,
    };
  },
  () => {
    const d = pick([3, 5, 7, 8, 9, 10, 11, 12]);
    let n; do { n = randInt(1, d - 1); } while (n * 2 === d);
    const more = n * 2 > d;
    return {
      prompt: `Is ${n}/${d} more or less than 1/2?`,
      answer: more ? 'more' : 'less', choices: ['more', 'less'],
      visual: { type: 'numberline', min: 0, max: 1, step: 1 / d, labels: 'fraction', den: d, highlight: n / d },
      hint: `Half of ${d} is ${d / 2}.`,
      explain: `Half of ${d} is ${d / 2}. ${n} is ${more ? 'more' : 'less'} than ${d / 2}, so ${n}/${d} is ${more ? 'more' : 'less'} than 1/2.`,
    };
  },
  () => {
    const [d1, d2] = shuffle(pick(UNLIKE));
    let a, b;
    do { a = randInt(1, d1 - 1); b = randInt(1, d2 - 1); } while (a * d2 === b * d1);
    const big = a * d2 > b * d1 ? raw(a, d1) : raw(b, d2);
    const l = lcm(d1, d2);
    return {
      prompt: `Which is bigger: ${a}/${d1} or ${b}/${d2}?`,
      answer: big, choices: [raw(a, d1), raw(b, d2)],
      visual: { type: 'fractionbar', bars: [{ parts: d1, shaded: a }, { parts: d2, shaded: b }] },
      explain: `In ${l}ths: ${a}/${d1} = ${a * (l / d1)}/${l} and ${b}/${d2} = ${b * (l / d2)}/${l}. So ${big} is bigger.`,
    };
  },
])();

// 8. Multiply fractions; mixed number add/subtract with regrouping.
L[8] = () => pick([
  () => {
    const [n, d] = pick(SIMPLE), m = randInt(2, 6), w = d * m;
    return {
      prompt: `${n}/${d} × ${w} = ?`,
      answer: String(n * m),
      hint: `${n}/${d} of ${w}.`,
      explain: `${n}/${d} × ${w} = ${n * w}/${d} = ${n * m}.`,
    };
  },
  () => {
    const [n, d] = pick(SIMPLE), w = randInt(2, 9);
    return {
      prompt: `${n}/${d} × ${w} = ? (a fraction is fine)`,
      answer: fr(n * w, d),
      explain: `Multiply the top by ${w}: ${n * w}/${d}${fr(n * w, d) !== raw(n * w, d) ? ' = ' + fr(n * w, d) : ''}.`,
    };
  },
  () => {
    const [a, b] = pick(SIMPLE), [c, e] = pick(SIMPLE);
    return {
      prompt: `${a}/${b} × ${c}/${e} = ?`,
      answer: fr(a * c, b * e),
      visual: { type: 'area', w: b, h: e },
      hint: 'Multiply the tops, then multiply the bottoms.',
      explain: `${a} × ${c} = ${a * c} and ${b} × ${e} = ${b * e}, so the product is ${a * c}/${b * e}${fr(a * c, b * e) !== raw(a * c, b * e) ? ' = ' + fr(a * c, b * e) : ''}.`,
    };
  },
  () => {
    const [d1, d2] = shuffle(pick(UNLIKE)), a = randInt(1, d1 - 1), b = randInt(1, d2 - 1);
    const l = lcm(d1, d2), n = a * (l / d1) + b * (l / d2);
    const ans = fr(n, l);
    return {
      prompt: `${a}/${d1} + ${b}/${d2} = ?`,
      answer: ans, choices: choices(ans, [fr(a * b, d1 * d2), raw(a + b, d1 + d2), fr(a * d2 + b * d1 + 1, d1 * d2)]),
      explain: `Adding needs a common denominator: ${a * (l / d1)}/${l} + ${b * (l / d2)}/${l} = ${ans}. Only multiply straight across when multiplying.`,
      wrongTags: { [fr(a * b, d1 * d2)]: 'multiply-when-adding', [raw(a + b, d1 + d2)]: 'add-denominators' },
    };
  },
  () => {
    const d = pick([2, 3, 4, 5, 6, 8]), w1 = randInt(1, 4), w2 = randInt(1, 4);
    const units = [...Array(d).keys()].filter((r) => r > 0 && gcd(r, d) === 1);
    const r1 = pick(units), r2 = pick(units.filter((r) => r + r1 >= d)); // r1 + r2 >= d forces regrouping
    const total = (w1 + w2) * d + r1 + r2;
    const ans = mixed(total, d);
    return {
      prompt: `${w1} ${r1}/${d} + ${w2} ${r2}/${d} = ?`,
      answer: ans, choices: choices(ans, [`${w1 + w2} ${r1 + r2}/${d}`, `${w1 + w2} ${r1 + r2}/${2 * d}`, mixed(total + 1, d)]),
      hint: `Add the wholes, add the fractions, then regroup if the fraction is more than 1.`,
      explain: `${w1} + ${w2} = ${w1 + w2} and ${r1}/${d} + ${r2}/${d} = ${r1 + r2}/${d} = ${mixed(r1 + r2, d)}. Together: ${ans}.`,
      wrongTags: { [`${w1 + w2} ${r1 + r2}/${d}`]: 'no-regroup', [`${w1 + w2} ${r1 + r2}/${2 * d}`]: 'add-denominators' },
    };
  },
  () => {
    const d = pick([3, 4, 5, 6, 8]), w2 = randInt(1, 3), w1 = randInt(w2 + 1, w2 + 4);
    const units = [...Array(d).keys()].filter((r) => r > 0 && gcd(r, d) === 1);
    const r2 = pick(units.filter((r) => r > 1)), r1 = pick(units.filter((r) => r < r2)); // r1 < r2 forces borrowing
    const total = (w1 * d + r1) - (w2 * d + r2);
    const ans = mixed(total, d);
    return {
      prompt: `${w1} ${r1}/${d} − ${w2} ${r2}/${d} = ?`,
      answer: ans, choices: choices(ans, [`${w1 - w2} ${r2 - r1}/${d}`, mixed(total + d, d), mixed(total - 1, d)]),
      hint: `Borrow 1 whole as ${d}/${d} before subtracting the fractions.`,
      explain: `Rewrite ${w1} ${r1}/${d} as ${w1 - 1} ${r1 + d}/${d}. Then ${w1 - 1} − ${w2} = ${w1 - 1 - w2} and ${r1 + d}/${d} − ${r2}/${d} = ${r1 + d - r2}/${d}${fr(r1 + d - r2, d) !== raw(r1 + d - r2, d) ? ' = ' + fr(r1 + d - r2, d) : ''}. Answer: ${ans}.`,
      wrongTags: { [`${w1 - w2} ${r2 - r1}/${d}`]: 'smaller-from-larger' },
    };
  },
])();

// 9. Divide fractions; fraction/decimal/percent conversions.
const CONV = [[1, 2, '0.5', 50], [1, 4, '0.25', 25], [3, 4, '0.75', 75], [1, 5, '0.2', 20], [2, 5, '0.4', 40], [3, 5, '0.6', 60], [4, 5, '0.8', 80], [1, 8, '0.125', 12.5], [3, 8, '0.375', 37.5], [5, 8, '0.625', 62.5], [7, 8, '0.875', 87.5], [1, 10, '0.1', 10], [3, 10, '0.3', 30], [7, 10, '0.7', 70], [9, 10, '0.9', 90], [1, 20, '0.05', 5], [3, 20, '0.15', 15], [1, 25, '0.04', 4], [1, 50, '0.02', 2]];
L[9] = () => pick([
  () => {
    const d2 = pick([2, 3, 4, 5, 6, 8, 10]), d1 = pick([2, 3, 4, 5]);
    let a; do { a = randInt(1, d1 - 1); } while (gcd(a, d1) !== 1); // no "2/4" in the prompt
    const n = a * d2, d = d1;
    return {
      prompt: `${a}/${d1} ÷ 1/${d2} = ?`,
      answer: fr(n, d),
      hint: `How many ${PL[d2] || '1/' + d2 + 's'} fit into ${a}/${d1}? Flip the second fraction and multiply.`,
      explain: `Dividing by 1/${d2} is the same as multiplying by ${d2}: ${a}/${d1} × ${d2} = ${n}/${d}${fr(n, d) !== raw(n, d) ? ' = ' + fr(n, d) : ''}.`,
    };
  },
  () => {
    const [a, b] = pick(SIMPLE);
    let c, e; do { [c, e] = pick(SIMPLE); } while (c === a && e === b);
    const ans = fr(a * e, b * c);
    return {
      prompt: `${a}/${b} ÷ ${c}/${e} = ?`,
      answer: ans, choices: choices(ans, [fr(b * c, a * e), fr(a * c, b * e), fr(b * e, a * c)]),
      hint: 'Keep the first fraction, flip the second, then multiply.',
      explain: `Keep ${a}/${b}, flip ${c}/${e} to ${e}/${c}, multiply: ${a * e}/${b * c}${ans !== raw(a * e, b * c) ? ' = ' + ans : ''}.`,
      wrongTags: { [fr(b * c, a * e)]: 'flip-dividend', [fr(a * c, b * e)]: 'multiply-instead-of-divide' },
    };
  },
  () => {
    const [n, d] = pick(SIMPLE), w = randInt(2, 6);
    return {
      prompt: `${n}/${d} ÷ ${w} = ?`,
      answer: fr(n, d * w),
      hint: `Dividing by ${w} is the same as multiplying by 1/${w}.`,
      explain: `${n}/${d} × 1/${w} = ${n}/${d * w}${fr(n, d * w) !== raw(n, d * w) ? ' = ' + fr(n, d * w) : ''}.`,
    };
  },
  () => {
    const w = randInt(2, 9), d = pick([2, 3, 4, 5, 8]);
    return {
      prompt: `${w} ÷ 1/${d} = ?`,
      answer: String(w * d),
      hint: `How many ${PL[d]} are in ${w} wholes?`,
      explain: `Each whole has ${d} ${PL[d]}, so ${w} wholes have ${w} × ${d} = ${w * d}.`,
    };
  },
  () => {
    const [n, d, dec] = pick(CONV);
    return {
      prompt: `Write ${n}/${d} as a decimal.`,
      answer: dec,
      hint: `Divide ${n} by ${d}, or change the bottom to 10, 100 or 1000.`,
      explain: `${n} ÷ ${d} = ${dec}.`,
    };
  },
  () => {
    const [n, d, dec] = pick(CONV);
    return {
      prompt: `Write ${dec} as a fraction.`,
      answer: raw(n, d),
      explain: `${dec} is ${dec.split('.')[1]} out of ${Math.pow(10, dec.split('.')[1].length)}, which simplifies to ${n}/${d}.`,
    };
  },
  () => {
    const [n, d, , pct] = pick(CONV);
    return {
      prompt: `Write ${n}/${d} as a percent (just the number).`,
      answer: num(pct),
      hint: 'Percent means out of 100.',
      explain: `${n}/${d} = ${n * (100 / d) % 1 === 0 ? n * (100 / d) + '/100' : num(pct) + '/100'}, so it is ${num(pct)}%.`,
    };
  },
  () => {
    const [n, d, , pct] = pick(CONV.filter((c) => c[3] % 1 === 0));
    return {
      prompt: `Write ${pct}% as a fraction in simplest form.`,
      answer: raw(n, d), choices: choices(raw(n, d), [raw(pct, 100), raw(n, 100), raw(d, n), raw(n + 1, d)]),
      explain: `${pct}% = ${pct}/100 = ${n}/${d}.`,
      wrongTags: { [raw(pct, 100)]: 'not-simplified' },
    };
  },
])();

// 10. Ratios, negative fractions, multi-step fraction problems.
const PAIRS = [['cats', 'dogs'], ['red marbles', 'blue marbles'], ['boys', 'girls'], ['apples', 'pears']];
L[10] = () => pick([
  () => {
    const a = randInt(1, 5); let b; do { b = randInt(1, 7); } while (b === a);
    const k = randInt(2, 6), total = (a + b) * k;
    const [p, q] = pick(PAIRS);
    const askFirst = Math.random() < 0.5;
    const ans = askFirst ? a * k : b * k;
    return {
      prompt: `The ratio of ${p} to ${q} is ${a}:${b}. There are ${total} in all. How many ${askFirst ? p : q}?`,
      answer: String(ans),
      hint: `${a} + ${b} = ${a + b} parts in total. How big is one part?`,
      explain: `${a + b} parts make ${total}, so one part is ${k}. ${askFirst ? a : b} parts is ${askFirst ? a : b} × ${k} = ${ans}.`,
    };
  },
  () => {
    const a = randInt(1, 4), b = randInt(a + 1, 6), k = randInt(1, 4) * b, total = (a + b) * k;
    const [p, q] = pick(PAIRS);
    const ans = a * k;
    return {
      prompt: `The ratio of ${p} to ${q} is ${a}:${b}. There are ${total} in all. How many ${p}?`,
      answer: String(ans), choices: choices(ans, [(total * a) / b, total - a, a * b]),
      explain: `${a}:${b} means ${a} parts out of ${a + b} parts. ${total} ÷ ${a + b} = ${k} per part, so ${a} × ${k} = ${ans}.`,
      wrongTags: { [(total * a) / b]: 'ratio-as-fraction-of-total' },
    };
  },
  () => {
    const [d1, d2] = pick([[2, 4], [3, 6], [4, 8], [2, 6], [5, 10], [2, 8], [3, 12], [4, 12]]);
    const a = randInt(1, d1 - 1), b = randInt(1, d2 - 1);
    const l = lcm(d1, d2);
    const n = -a * (l / d1) + b * (l / d2);
    const ans = fr(n, l);
    const op = Math.random() < 0.5 ? 'plus' : 'minus';
    if (op === 'minus') {
      const m = -a * (l / d1) - b * (l / d2);
      return {
        prompt: `−${a}/${d1} − ${b}/${d2} = ?`,
        answer: fr(m, l),
        hint: 'Both parts are negative, so the answer is negative.',
        explain: `−${a * (l / d1)}/${l} − ${b * (l / d2)}/${l} = ${fr(m, l)}.`,
      };
    }
    return {
      prompt: `−${a}/${d1} + ${b}/${d2} = ?`,
      answer: ans,
      visual: { type: 'numberline', min: -1, max: 1, step: 1 / l, labels: 'fraction', den: l, highlight: n / l },
      hint: `Change both to ${l}ths. Start at −${a * (l / d1)}/${l} and move right ${b * (l / d2)}/${l}.`,
      explain: `−${a * (l / d1)}/${l} + ${b * (l / d2)}/${l} = ${n}/${l}${ans !== raw(n, l) ? ' = ' + ans : ''}.`,
    };
  },
  () => {
    const [d1, d2] = pick([[2, 4], [3, 6], [4, 8], [2, 6]]);
    const l = lcm(d1, d2);
    let a, b, n;
    do { a = randInt(1, d1 - 1); b = randInt(1, d2 - 1); n = -a * (l / d1) + b * (l / d2); } while (n === 0);
    const ans = fr(n, l);
    return {
      prompt: `−${a}/${d1} + ${b}/${d2} = ?`,
      answer: ans, choices: choices(ans, [fr(-n, l), fr(-a * (l / d1) - b * (l / d2), l), fr(a * (l / d1) + b * (l / d2), l)]),
      explain: `In ${l}ths: −${a * (l / d1)} + ${b * (l / d2)} = ${n}, so the answer is ${ans}.`,
      wrongTags: { [fr(-n, l)]: 'sign-error', [fr(a * (l / d1) + b * (l / d2), l)]: 'ignored-negative' },
    };
  },
  () => {
    const k = randInt(2, 8), money = 12 * k, name = pick(['Sam', 'Ava', 'Leo', 'Mia']);
    return {
      prompt: `${name} had $${money}. ${name} spent 1/3 of it, then 1/4 of what was left. How much is left?`,
      answer: String(6 * k),
      hint: 'Do one step at a time.',
      explain: `1/3 of ${money} is ${4 * k}, leaving ${8 * k}. 1/4 of ${8 * k} is ${2 * k}, leaving ${6 * k}.`,
    };
  },
  () => {
    const [n, d] = pick([[3, 4], [2, 3], [2, 5], [3, 5], [5, 8]]), m = randInt(2, 6);
    const price = n * m, whole = d * m;
    return {
      prompt: `${n}/${d} of a pizza costs $${price}. How much does a whole pizza cost?`,
      answer: String(whole),
      hint: `First find the cost of 1/${d}.`,
      explain: `${n} parts cost $${price}, so 1 part costs $${m}. The whole pizza is ${d} parts: ${d} × ${m} = $${whole}.`,
    };
  },
  () => {
    const [n, d] = pick([[2, 3], [3, 4], [3, 5], [5, 6], [2, 5]]), k = randInt(2, 9);
    return {
      prompt: `A recipe needs ${n}/${d} cup of flour per batch. How many cups for ${k} batches? (a fraction is fine)`,
      answer: fr(n * k, d),
      explain: `${n}/${d} × ${k} = ${n * k}/${d}${fr(n * k, d) !== raw(n * k, d) ? ' = ' + fr(n * k, d) : ''} cups.`,
    };
  },
  () => {
    const [n, d] = pick([[2, 3], [3, 4], [3, 5], [5, 6], [2, 5], [5, 8]]), m = randInt(2, 9);
    return {
      prompt: `${n}/${d} of a number is ${n * m}. What is the number?`,
      answer: String(d * m),
      hint: `If ${n} parts are ${n * m}, what is 1 part?`,
      explain: `${n} parts = ${n * m}, so 1 part = ${m}. The whole is ${d} parts = ${d * m}.`,
    };
  },
])();

export default {
  id: 'fractions', name: 'Fractions', emoji: '🍕', group: 'number',
  start: { 1: 1, 3: 2, 4: 3 },
  unlock: undefined,
  gen(level) {
    const q = L[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) delete q.wrongTags[String(q.answer)];
    return q;
  },
};
