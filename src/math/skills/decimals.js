// Decimals and percent ladder (curriculum A8). Levels 1-10.
import { randInt, pick, shuffle } from '../rng.js';

const num = (x) => String(Math.round(x * 1e6) / 1e6);
const money = (x) => x.toFixed(2);
const choices = (answer, distractors, n = 4) => {
  const out = [String(answer)];
  for (const d of distractors) { const s = String(d); if (!out.includes(s) && out.length < n) out.push(s); }
  while (out.length < 2) out.push(out[0] + '0');
  return shuffle(out);
};
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (n, d) => { const g = gcd(n, d) || 1; return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`; };
const NAMES = ['Sam', 'Ava', 'Leo', 'Mia', 'Zoe', 'Max'];

const L = {};

// 1. Half and quarter as 0.5 and 0.25 in money.
L[1] = () => pick([
  () => ({
    prompt: 'Half of a dollar is how much? Pick the decimal.',
    answer: '0.50', choices: shuffle(['0.50', '0.05', '0.20', '5.00']),
    visual: { type: 'coins', quarters: 2 },
    hint: 'A dollar is 100 cents. Half of 100 is 50.',
    explain: 'Half a dollar is 50 cents, written $0.50.',
    wrongTags: { '0.05': 'half-as-0.05' },
  }),
  () => ({
    prompt: 'A quarter is one fourth of a dollar. How much is that as a decimal?',
    answer: '0.25', choices: shuffle(['0.25', '0.52', '0.04', '2.50']),
    visual: { type: 'coins', quarters: 1 },
    explain: 'A quarter is 25 cents, written $0.25.',
  }),
  () => ({
    prompt: 'How many quarters make one dollar?', answer: '4',
    visual: { type: 'coins', quarters: 4 },
    explain: '25 + 25 + 25 + 25 = 100 cents, so 4 quarters make a dollar.',
  }),
  () => ({
    prompt: 'How many 50-cent halves make one dollar?', answer: '2',
    explain: '50 + 50 = 100 cents, so 2 halves make a dollar.',
  }),
  () => ({
    prompt: '$0.50 is the same as what part of a dollar?',
    answer: 'half', choices: shuffle(['half', 'a quarter', 'a whole', 'a tenth']),
    visual: { type: 'coins', quarters: 2 },
    explain: '50 cents is half of 100 cents, so $0.50 is half a dollar.',
  }),
  () => ({
    prompt: 'Two quarters together are how much? Pick the decimal.',
    answer: '0.50', choices: shuffle(['0.50', '0.25', '0.05', '2.00']),
    visual: { type: 'coins', quarters: 2 },
    explain: '25 cents + 25 cents = 50 cents, which is $0.50.',
    wrongTags: { '0.05': 'half-as-0.05' },
  }),
  () => ({
    prompt: '$0.25 is the same as what part of a dollar?',
    answer: 'a quarter', choices: shuffle(['a quarter', 'half', 'a whole', 'a fifth']),
    visual: { type: 'coins', quarters: 1 },
    explain: '25 cents is one fourth of 100 cents, so $0.25 is a quarter of a dollar.',
  }),
])();

// 2. Tenths.
const TENTHS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
L[2] = () => pick([
  () => {
    const t = randInt(1, 9);
    return {
      prompt: `0.${t} = ?/10`, answer: String(t),
      visual: { type: 'fractionbar', parts: 10, shaded: t },
      explain: `0.${t} means ${t} tenths, so 0.${t} = ${t}/10.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: `Write ${t}/10 as a decimal.`, answer: `0.${t}`,
      hint: 'Tenths go right after the decimal point.',
      explain: `${t} tenths is written 0.${t}.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: 'Write the shaded amount as a decimal.', answer: `0.${t}`,
      visual: { type: 'fractionbar', parts: 10, shaded: t },
      explain: `${t} of 10 parts are shaded. That is ${t} tenths, or 0.${t}.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: 'What decimal is at the dot?', answer: `0.${t}`,
      choices: choices(`0.${t}`, [`${t}`, `0.0${t}`, `0.${t === 9 ? 8 : t + 1}`]),
      visual: { type: 'numberline', min: 0, max: 1, step: 0.1, highlight: t / 10 },
      explain: `The line from 0 to 1 is cut into 10 tenths. The dot is ${t} tenths along: 0.${t}.`,
      wrongTags: { [`${t}`]: 'tenths-read-as-whole', [`0.0${t}`]: 'tenths-as-hundredths' },
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: `Tap 0.${t} on the number line.`, answer: `0.${t}`, input: 'visual',
      visual: { type: 'numberline', min: 0, max: 1, step: 0.1, question: 'point' },
      explain: `0.${t} is ${t} tenths, so count ${t} spaces from 0.`,
    };
  },
  () => {
    const a = randInt(1, 7), b = a + 2, mid = a + 1;
    const ans = `0.${mid}`;
    return {
      prompt: `Which number is between 0.${a} and 0.${b}?`,
      answer: ans, choices: choices(ans, [`0.${a === 1 ? 9 : a - 1}`, `0.${b === 9 ? 1 : b + 1}`, `${mid}`]),
      visual: { type: 'numberline', min: 0, max: 1, step: 0.1, marks: [a / 10, b / 10] },
      explain: `${mid} tenths sits between ${a} tenths and ${b} tenths, so 0.${mid} is between them.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: `How do you say 0.${t}?`,
      answer: `${TENTHS[t]} tenths`, choices: shuffle([`${TENTHS[t]} tenths`, TENTHS[t], `${TENTHS[t]} hundredths`, `${TENTHS[t]}ty`]),
      explain: `The first digit after the point is tenths, so 0.${t} is ${TENTHS[t]} tenths.`,
      wrongTags: { [TENTHS[t]]: 'tenths-read-as-whole' },
    };
  },
])();

// 3. Hundredths; money as decimals; compare tenths vs hundredths.
L[3] = () => pick([
  () => {
    const t = randInt(1, 9), h = randInt(10, 99);
    let a = `0.${t}`, b = `0.${h}`;
    const bigger = t * 10 > h ? a : b;
    const [x, y] = shuffle([a, b]);
    return {
      prompt: `Which is bigger: ${x} or ${y}?`,
      answer: bigger, choices: [x, y],
      hint: `Write 0.${t} as 0.${t}0 so both have hundredths.`,
      explain: `0.${t} = 0.${t}0 = ${t * 10} hundredths. Compare with ${h} hundredths: ${bigger} is bigger.`,
      wrongTags: { [bigger === a ? b : a]: bigger === a ? 'longer-decimal-bigger' : 'shorter-decimal-bigger' },
    };
  },
  () => {
    const d = randInt(1, 9), c = randInt(1, 99);
    return {
      prompt: `How many cents is $${d}.${String(c).padStart(2, '0')}?`,
      answer: String(d * 100 + c),
      explain: `$${d} is ${d * 100} cents, plus ${c} cents is ${d * 100 + c} cents.`,
    };
  },
  () => {
    const c = randInt(1, 99);
    return {
      prompt: `Write ${c} cents in dollars, like 0.45.`,
      answer: `0.${String(c).padStart(2, '0')}`,
      hint: 'A dollar is 100 cents, so cents are hundredths of a dollar.',
      explain: `${c} cents is ${c} hundredths of a dollar: $0.${String(c).padStart(2, '0')}.`,
    };
  },
  () => {
    const h = randInt(1, 99);
    return {
      prompt: `Write ${h}/100 as a decimal.`,
      answer: `0.${String(h).padStart(2, '0')}`,
      explain: `${h} hundredths is written 0.${String(h).padStart(2, '0')}.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: `0.${t} = ?/100`, answer: String(t * 10),
      visual: { type: 'fractionbar', parts: 10, shaded: t },
      hint: 'Each tenth is 10 hundredths.',
      explain: `${t} tenths is ${t} × 10 = ${t * 10} hundredths, so 0.${t} = ${t * 10}/100.`,
    };
  },
  () => {
    const h = randInt(1, 9);
    const ans = `0.0${h}`;
    return {
      prompt: `Which decimal is ${h} hundredths?`,
      answer: ans, choices: choices(ans, [`0.${h}`, `${h}.00`, `0.${h}0`]),
      explain: `Hundredths are the second place after the point, so ${h} hundredths is 0.0${h}.`,
      wrongTags: { [`0.${h}`]: 'hundredths-as-tenths' },
    };
  },
  () => {
    const q = randInt(0, 3), d = randInt(0, 4), n = randInt(0, 1), p = randInt(0, 4);
    const cents = q * 25 + d * 10 + n * 5 + p;
    if (cents === 0) return { prompt: 'Write 7 cents in dollars, like 0.45.', answer: '0.07', explain: '7 cents is 7 hundredths of a dollar: $0.07.' };
    return {
      prompt: 'How much money is this, in dollars? (like 0.45)',
      answer: money(cents / 100),
      visual: { type: 'coins', quarters: q, dimes: d, nickels: n, pennies: p },
      explain: `${q} quarters + ${d} dimes + ${n} nickels + ${p} pennies = ${cents} cents = $${money(cents / 100)}.`,
    };
  },
])();

// 4. Add/subtract decimals to hundredths; round to whole.
L[4] = () => pick([
  () => {
    const a = randInt(10, 99) / 10, b = randInt(100, 999) / 100;
    return {
      prompt: `${num(a)} + ${num(b)} = ?`, answer: num(a + b),
      hint: 'Line up the decimal points.',
      explain: `Line up the points: ${a.toFixed(2)} + ${b.toFixed(2)} = ${(a + b).toFixed(2)}.`,
    };
  },
  () => {
    const a = randInt(10, 99) / 10, b = randInt(100, 999) / 100;
    const ans = num(a + b);
    const wrong = num((a * 10 + b * 100) / 100);
    return {
      prompt: `${num(a)} + ${num(b)} = ?`,
      answer: ans, choices: choices(ans, [wrong, num(a + b + 1), num(a + b - 0.1)]),
      explain: `Line up the decimal points: ${a.toFixed(2)} + ${b.toFixed(2)} = ${(a + b).toFixed(2)}.`,
      wrongTags: { [wrong]: 'misaligned-digits' },
    };
  },
  () => {
    const b = randInt(100, 999) / 100, a = randInt(Math.ceil(b) + 1, 20);
    return {
      prompt: `${a} − ${num(b)} = ?`, answer: num(a - b),
      hint: `Write ${a} as ${a}.00 first.`,
      explain: `${a}.00 − ${b.toFixed(2)} = ${(a - b).toFixed(2)}.`,
    };
  },
  () => {
    const b = randInt(100, 999) / 100, a = (Math.round(b * 100) + randInt(50, 900)) / 100;
    return {
      prompt: `${num(a)} − ${num(b)} = ?`, answer: num(a - b),
      explain: `Line up the points: ${a.toFixed(2)} − ${b.toFixed(2)} = ${(a - b).toFixed(2)}.`,
    };
  },
  () => {
    const x = randInt(100, 999) / 100;
    const r = Math.round(x);
    return {
      prompt: `Round ${num(x)} to the nearest whole number.`, answer: String(r),
      visual: { type: 'numberline', min: Math.floor(x), max: Math.floor(x) + 1, step: 0.1, highlight: x },
      hint: 'Look at the tenths digit. 5 or more rounds up.',
      explain: `${num(x)} is between ${Math.floor(x)} and ${Math.floor(x) + 1}. The tenths digit is ${Math.floor(x * 10) % 10}, so it rounds to ${r}.`,
    };
  },
  () => {
    const a = randInt(10, 99) / 10, b = randInt(10, 99) / 10, name = pick(NAMES);
    return {
      prompt: `${name} ran ${num(a)} km on Monday and ${num(b)} km on Tuesday. Total km?`,
      answer: num(a + b),
      explain: `${num(a)} + ${num(b)} = ${num(a + b)} km.`,
    };
  },
])();

// 5. Percent as out of 100; 50%, 25%, 10%, 100%.
L[5] = () => pick([
  () => {
    const amt = randInt(2, 50) * 2;
    return {
      prompt: `What is 50% of ${amt}? (just the number)`, answer: String(amt / 2),
      choices: choices(amt / 2, [50, amt, amt * 2]),
      hint: '50% is one half.',
      explain: `50% is half. Half of ${amt} is ${amt / 2}.`,
      wrongTags: { 50: 'percent-as-number' },
    };
  },
  () => {
    const amt = randInt(2, 30) * 4;
    return {
      prompt: `What is 25% of ${amt}?`, answer: String(amt / 4),
      visual: { type: 'fractionbar', parts: 4, shaded: 1 },
      hint: '25% is one quarter.',
      explain: `25% is one quarter. ${amt} ÷ 4 = ${amt / 4}.`,
    };
  },
  () => {
    const amt = randInt(2, 60) * 10;
    return {
      prompt: `What is 10% of ${amt}?`, answer: String(amt / 10),
      visual: { type: 'fractionbar', parts: 10, shaded: 1 },
      hint: '10% is one tenth.',
      explain: `10% is one tenth. ${amt} ÷ 10 = ${amt / 10}.`,
    };
  },
  () => {
    const amt = randInt(7, 99);
    return {
      prompt: `What is 100% of ${amt}?`, answer: String(amt),
      explain: `100% means all of it, so 100% of ${amt} is ${amt}.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: 'What percent of the bar is shaded? (just the number)', answer: String(t * 10),
      visual: { type: 'fractionbar', parts: 10, shaded: t },
      explain: `${t} of 10 parts is ${t * 10} out of 100, so ${t * 10}%.`,
    };
  },
  () => {
    const p = pick([10, 25, 50, 75, 100]);
    return {
      prompt: `${p}% means ? out of 100.`, answer: String(p),
      explain: `Percent means out of 100, so ${p}% is ${p} out of 100.`,
    };
  },
  () => {
    const amt = randInt(2, 25) * 4, q = randInt(1, 3), name = pick(NAMES);
    const pct = q * 25;
    return {
      prompt: `${name} has ${amt} stickers and gives away ${pct}%. How many are given away?`,
      answer: String((amt * q) / 4),
      visual: { type: 'fractionbar', parts: 4, shaded: q },
      explain: `25% of ${amt} is ${amt / 4}, so ${pct}% is ${q} × ${amt / 4} = ${(amt * q) / 4}.`,
    };
  },
])();

// 6. Fraction <-> decimal <-> percent for common values.
const COMMON = [[1, 2, '0.5', 50], [1, 4, '0.25', 25], [3, 4, '0.75', 75], [1, 5, '0.2', 20], [2, 5, '0.4', 40], [3, 5, '0.6', 60], [4, 5, '0.8', 80], [1, 10, '0.1', 10], [3, 10, '0.3', 30], [7, 10, '0.7', 70], [9, 10, '0.9', 90]];
L[6] = () => pick([
  () => {
    const [n, d, , p] = pick(COMMON);
    return {
      prompt: `${n}/${d} = ?% (just the number)`, answer: String(p),
      explain: `${n}/${d} = ${p}/100 = ${p}%.`,
    };
  },
  () => {
    const [, , dec, p] = pick(COMMON);
    return {
      prompt: `${dec} = ?% (just the number)`, answer: String(p),
      hint: 'Move the digits two places: hundredths become percent.',
      explain: `${dec} is ${p} hundredths, so ${dec} = ${p}%.`,
    };
  },
  () => {
    const [n, d, dec] = pick(COMMON);
    return {
      prompt: `Write ${n}/${d} as a decimal.`, answer: dec,
      explain: `${n} ÷ ${d} = ${dec}.`,
    };
  },
  () => {
    const [n, d, , p] = pick(COMMON);
    return {
      prompt: `Write ${p}% as a fraction in simplest form.`,
      answer: `${n}/${d}`, choices: choices(`${n}/${d}`, [`${p}/100`, `${n}/${d * 2}`, `${d}/${n}`]),
      explain: `${p}% = ${p}/100 = ${n}/${d}.`,
      wrongTags: { [`${p}/100`]: 'not-simplified' },
    };
  },
  () => {
    const [n, d, dec] = pick(COMMON.filter((c) => c[1] === 5 || c[1] === 4));
    const wrong = d === 5 ? `0.${n}5` : `0.${n}4`;
    return {
      prompt: `Which decimal equals ${n}/${d}?`,
      answer: dec, choices: choices(dec, [wrong, `${n}.${d}`, `0.${n}${d}`]),
      explain: `${n}/${d} = ${n * (100 / d)}/100 = ${dec}.`,
      wrongTags: { [wrong]: 'fifth-as-0.15' },
    };
  },
  () => ({
    prompt: 'Which decimal is closest to 1/3?',
    answer: '0.33', choices: shuffle(['0.33', '0.3', '3.0', '0.13']),
    explain: '1 ÷ 3 = 0.333..., so 0.33 is closest.',
  }),
  () => {
    const [n, d, dec, p] = pick(COMMON);
    const kind = pick(['decimal', 'percent']);
    const ans = kind === 'decimal' ? dec : `${p}%`;
    return {
      prompt: `Which ${kind} is the same as ${n}/${d}?`,
      answer: ans, choices: kind === 'decimal' ? choices(ans, [`${n}.${d}`, `0.${n}${d}`, `0.0${p}`]) : choices(ans, [`${n}%`, `${d}%`, `${p / 10}%`]),
      explain: `${n}/${d} = ${dec} = ${p}%.`,
    };
  },
])();

// 7. x/÷ by 10, 100; decimal x whole; thousandths.
L[7] = () => pick([
  () => {
    const x = randInt(100, 999) / 100, k = pick([10, 100]);
    const ans = num(x * k);
    return {
      prompt: `${num(x)} × ${k} = ?`,
      answer: ans, choices: choices(ans, [`${num(x)}0`, num(x * (k === 10 ? 100 : 10)), num(x / k)]),
      hint: `Each digit moves ${k === 10 ? 1 : 2} place${k === 10 ? '' : 's'} to the left.`,
      explain: `Multiplying by ${k} moves every digit ${k === 10 ? 'one place' : 'two places'} left: ${num(x)} × ${k} = ${ans}.`,
      wrongTags: { [`${num(x)}0`]: 'add-a-zero' },
    };
  },
  () => {
    const x = randInt(10, 999) / 10, k = pick([10, 100]);
    return {
      prompt: `${num(x)} ÷ ${k} = ?`, answer: num(x / k),
      hint: `Each digit moves ${k === 10 ? 1 : 2} place${k === 10 ? '' : 's'} to the right.`,
      explain: `Dividing by ${k} moves every digit ${k === 10 ? 'one place' : 'two places'} right: ${num(x)} ÷ ${k} = ${num(x / k)}.`,
    };
  },
  () => {
    const x = randInt(11, 99) / 10, w = randInt(2, 9);
    return {
      prompt: `${num(x)} × ${w} = ?`, answer: num(x * w),
      hint: `Think ${Math.round(x * 10)} × ${w}, then put the decimal back.`,
      explain: `${Math.round(x * 10)} × ${w} = ${Math.round(x * 10) * w}. One decimal place gives ${num(x * w)}.`,
    };
  },
  () => {
    const [n, d, dec] = pick([[1, 8, '0.125'], [3, 8, '0.375'], [5, 8, '0.625'], [7, 8, '0.875'], [1, 4, '0.25'], [3, 4, '0.75'], [1, 2, '0.5'], [1, 5, '0.2'], [1, 40, '0.025'], [3, 40, '0.075']]);
    return {
      prompt: `Write ${dec} as a fraction.`, answer: `${n}/${d}`,
      hint: `${dec} is ${dec.split('.')[1]} ${dec.length === 5 ? 'thousandths' : dec.length === 4 ? 'hundredths' : 'tenths'}.`,
      explain: `${dec} = ${dec.split('.')[1]}/${Math.pow(10, dec.split('.')[1].length)} = ${n}/${d}.`,
    };
  },
  () => {
    const t = randInt(1, 9);
    return {
      prompt: `Write ${t} thousandths as a decimal.`, answer: `0.00${t}`,
      explain: `Thousandths are the third place after the point: 0.00${t}.`,
    };
  },
  () => {
    const digits = [randInt(1, 9), randInt(0, 9), randInt(0, 9), randInt(1, 9)];
    const x = `${digits[0]}.${digits[1]}${digits[2]}${digits[3]}`;
    const place = pick([['tenths', 1], ['hundredths', 2], ['thousandths', 3]]);
    return {
      prompt: `Which digit is in the ${place[0]} place of ${x}?`, answer: String(digits[place[1]]),
      explain: `After the point the places are tenths, hundredths, thousandths. In ${x} the ${place[0]} digit is ${digits[place[1]]}.`,
    };
  },
  () => {
    const x = randInt(1000, 9999) / 1000;
    const r = Math.round(x * 100) / 100;
    return {
      prompt: `Round ${num(x)} to the nearest hundredth.`, answer: num(r),
      hint: 'Look at the thousandths digit.',
      explain: `The thousandths digit is ${Math.round(x * 1000) % 10}, so ${num(x)} rounds to ${num(r)}.`,
    };
  },
])();

// 8. Percent of any number; discounts; percent as ratio.
L[8] = () => pick([
  () => {
    const p = pick([5, 15, 20, 30, 35, 40, 45, 60, 70, 75, 80, 90]), base = randInt(2, 20) * 20;
    return {
      prompt: `What is ${p}% of ${base}?`, answer: num((p * base) / 100),
      hint: `10% of ${base} is ${base / 10}. Build from there.`,
      explain: `10% of ${base} is ${base / 10}, so 1% is ${base / 100}. ${p}% = ${p} × ${base / 100} = ${num((p * base) / 100)}.`,
    };
  },
  () => {
    const p = pick([10, 20, 25, 30, 40, 50]), price = randInt(2, 20) * 10, item = pick(['game', 'book', 'toy', 'hoodie']);
    const ans = price - (price * p) / 100;
    return {
      prompt: `A $${price} ${item} is ${p}% off. What is the new price?`,
      answer: num(ans), choices: choices(num(ans), [num(price - p), num((price * p) / 100), num(price + (price * p) / 100)]),
      hint: `First find ${p}% of ${price}, then take it away.`,
      explain: `${p}% of ${price} is ${(price * p) / 100}. ${price} − ${(price * p) / 100} = ${num(ans)}.`,
      wrongTags: { [num(price - p)]: 'subtract-percent-from-price', [num((price * p) / 100)]: 'discount-not-price' },
    };
  },
  () => {
    const d = pick([20, 25, 40, 50]), n = randInt(1, d - 1);
    return {
      prompt: `${n} out of ${d} as a percent? (just the number)`, answer: num((n * 100) / d),
      hint: `Scale ${d} up to 100.`,
      explain: `${n}/${d} = ${num((n * 100) / d)}/100, so ${num((n * 100) / d)}%.`,
    };
  },
  () => {
    const p = pick([10, 15, 20]), bill = randInt(2, 16) * 5;
    return {
      prompt: `A meal costs $${bill}. What is a ${p}% tip?`, answer: num((bill * p) / 100),
      explain: `10% of ${bill} is ${bill / 10}. ${p}% is ${num((bill * p) / 100)}.`,
    };
  },
  () => {
    const p = pick([5, 15, 35, 45, 65, 85]), base = randInt(2, 10) * 20;
    const ans = num((p * base) / 100);
    return {
      prompt: `What is ${p}% of ${base}?`,
      answer: ans, choices: choices(ans, [num((p * base) / 10), num(base - p), num(p)]),
      visual: { type: 'fractionbar', parts: 20, shaded: p / 5 },
      explain: `${p}% is ${p}/100. ${base} × ${p} ÷ 100 = ${ans}.`,
      wrongTags: { [num(base - p)]: 'subtract-percent-from-price', [num(p)]: 'percent-as-number' },
    };
  },
  () => {
    const total = randInt(2, 10) * 10, p = pick([10, 20, 30, 40, 60, 70, 80, 90]), name = pick(NAMES);
    return {
      prompt: `${name} got ${p}% on a test with ${total} questions. How many were right?`,
      answer: String((p * total) / 100),
      explain: `${p}% of ${total} = ${p} × ${total} ÷ 100 = ${(p * total) / 100}.`,
    };
  },
])();

// 9. Decimal x decimal, ÷ decimal; repeating decimals; percent of a base.
L[9] = () => pick([
  () => {
    const a = randInt(11, 29) / 10, b = randInt(11, 49) / 100;
    return {
      prompt: `${num(a)} × ${num(b)} = ?`, answer: num(a * b),
      hint: `Multiply ${Math.round(a * 10)} × ${Math.round(b * 100)}, then count 3 decimal places.`,
      explain: `${Math.round(a * 10)} × ${Math.round(b * 100)} = ${Math.round(a * 10) * Math.round(b * 100)}. Three decimal places in total gives ${num(a * b)}.`,
    };
  },
  () => {
    const a = randInt(2, 9) / 10, b = randInt(2, 9) / 10;
    return {
      prompt: `${num(a)} × ${num(b)} = ?`, answer: num(a * b),
      explain: `${Math.round(a * 10)} × ${Math.round(b * 10)} = ${Math.round(a * 10) * Math.round(b * 10)}, with two decimal places: ${num(a * b)}.`,
    };
  },
  () => {
    const b = pick([0.5, 0.2, 0.25, 0.4, 0.05, 0.08, 0.3]), q = randInt(3, 30);
    const a = num(b * q);
    return {
      prompt: `${a} ÷ ${num(b)} = ?`, answer: String(q),
      hint: 'Multiply both numbers by 100 so you divide by a whole number.',
      explain: `${a} ÷ ${num(b)} is the same as ${num(b * q * 100)} ÷ ${num(b * 100)} = ${q}.`,
    };
  },
  () => {
    const [n, d, dec] = pick([[1, 3, '0.333...'], [2, 3, '0.666...'], [1, 6, '0.1666...'], [1, 9, '0.111...'], [5, 9, '0.555...'], [4, 9, '0.444...']]);
    const wrong = dec.slice(0, 4);
    return {
      prompt: `Which decimal equals ${n}/${d}?`,
      answer: dec, choices: choices(dec, [wrong, `${n}.${d}`, `0.${n}${d}`]),
      explain: `${n} ÷ ${d} never ends: ${dec}. The dots mean the digit repeats.`,
      wrongTags: { [wrong]: 'truncated-repeating' },
    };
  },
  () => {
    const d = pick([20, 24, 25, 40, 48, 50, 60, 80]);
    const opts = [];
    for (let n = 1; n < d; n++) if ((n * 100) % d === 0) opts.push(n);
    const n = pick(opts);
    const ans = String((n * 100) / d);
    return {
      prompt: `What percent is ${n} of ${d}? (just the number)`,
      answer: ans, choices: choices(ans, [num(Math.round((d * 10000) / n) / 100), String(d - n), String(n)]),
      hint: `The base (the whole) is ${d}.`,
      explain: `${n} ÷ ${d} = ${num(n / d)}, which is ${ans}%.`,
      wrongTags: { [num(Math.round((d * 10000) / n) / 100)]: 'percent-of-wrong-base' },
    };
  },
  () => {
    const a = randInt(2, 9) / 100, q = randInt(2, 99);
    const dividend = num(a * q);
    return {
      prompt: `${dividend} ÷ ${num(a)} = ?`, answer: String(q),
      explain: `Multiply both by 100: ${num(a * q * 100)} ÷ ${num(a * 100)} = ${q}.`,
    };
  },
])();

// 10. Percent change, HST, tips, simple interest, proportional reasoning.
L[10] = () => pick([
  () => {
    const price = randInt(2, 30) * 10;
    const ans = num(price * 1.13);
    return {
      prompt: `A $${price} item has 13% HST added. What is the total cost in dollars?`,
      answer: ans,
      hint: `13% of ${price} is ${num(price * 0.13)}.`,
      explain: `13% of ${price} = ${num(price * 0.13)}. ${price} + ${num(price * 0.13)} = ${ans}.`,
    };
  },
  () => {
    const old = pick([20, 25, 40, 50, 80, 100, 200]), p = pick([10, 20, 25, 30, 50, 60]);
    const now = old + (old * p) / 100;
    const wrong = num(Math.round(((now - old) / now) * 1000) / 10);
    return {
      prompt: `A price rose from $${old} to $${now}. What is the percent increase? (just the number)`,
      answer: String(p), choices: choices(p, [wrong, now - old, num(Math.round((now / old) * 1000) / 10)]),
      hint: 'Divide the change by the ORIGINAL price.',
      explain: `Change is ${now - old}. ${now - old} ÷ ${old} = ${num((now - old) / old)} = ${p}%.`,
      wrongTags: { [wrong]: 'new-value-as-base', [String(now - old)]: 'change-not-percent' },
    };
  },
  () => {
    const old = pick([40, 50, 60, 80, 100, 120, 200]), p = pick([10, 20, 25, 40, 50]);
    const now = old - (old * p) / 100;
    return {
      prompt: `A price dropped from $${old} to $${now}. What is the percent decrease? (just the number)`,
      answer: String(p),
      hint: 'Divide the change by the original price.',
      explain: `Change is ${old - now}. ${old - now} ÷ ${old} = ${num((old - now) / old)} = ${p}%.`,
    };
  },
  () => {
    const P = randInt(1, 10) * 100, r = pick([2, 3, 4, 5, 6, 8, 10]), t = randInt(1, 5);
    return {
      prompt: `$${P} is saved at ${r}% simple interest per year for ${t} years. How much interest?`,
      answer: num((P * r * t) / 100),
      hint: 'Interest = amount × rate × years.',
      explain: `${r}% of ${P} is ${(P * r) / 100} each year. ${(P * r) / 100} × ${t} = ${(P * r * t) / 100}.`,
    };
  },
  () => {
    const bill = randInt(4, 24) * 5, p = pick([15, 18, 20]);
    return {
      prompt: `Dinner costs $${bill}. With a ${p}% tip, what is the total in dollars?`,
      answer: num(bill * (1 + p / 100)),
      explain: `${p}% of ${bill} is ${num((bill * p) / 100)}. Total: ${bill} + ${num((bill * p) / 100)} = ${num(bill * (1 + p / 100))}.`,
    };
  },
  () => {
    const n = randInt(2, 6), each = randInt(2, 9) / 2, m = randInt(n + 1, 12), item = pick(['pens', 'apples', 'muffins', 'stickers']);
    return {
      prompt: `${n} ${item} cost $${num(n * each)}. How much do ${m} ${item} cost?`,
      answer: num(m * each),
      hint: 'Find the cost of one first.',
      explain: `One costs ${num(n * each)} ÷ ${n} = ${num(each)}. ${m} × ${num(each)} = ${num(m * each)}.`,
    };
  },
  () => {
    const sale = randInt(2, 12) * 10, p = pick([20, 25, 50]);
    const orig = sale / (1 - p / 100);
    return {
      prompt: `After a ${p}% discount a jacket costs $${sale}. What was the original price?`,
      answer: num(orig), choices: choices(num(orig), [num(sale * (1 + p / 100)), num(sale + p), num(sale * 2)]),
      hint: `The sale price is ${100 - p}% of the original.`,
      explain: `$${sale} is ${100 - p}% of the original. ${sale} ÷ ${(100 - p) / 100} = ${num(orig)}.`,
      wrongTags: { [num(sale * (1 + p / 100))]: 'new-value-as-base' },
    };
  },
])();

export default {
  id: 'decimals', name: 'Decimals and Percent', emoji: '🔟', group: 'number',
  start: { 1: 1, 3: 1, 4: 2 },
  unlock: { skill: 'fractions', level: 3 },
  gen(level) {
    const q = L[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) delete q.wrongTags[String(q.answer)];
    return q;
  },
};
