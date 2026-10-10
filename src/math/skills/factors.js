// Factors, multiples, primes, exponents ladder (curriculum A18).
import { randInt, pick, shuffle } from '../rng.js';

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function lcm(a, b) { return (a * b) / gcd(a, b); }
function frac(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; }
function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
function factorsOf(n) { const f = []; for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i); return f; }
function primeFactors(n) { const f = []; let d = 2; while (n > 1) { while (n % d === 0) { f.push(d); n /= d; } d++; } return f; }
function mkChoices(answer, wrongs, fill) {
  const a = String(answer);
  const set = new Set([a]);
  for (const w of wrongs) {
    if (set.size >= 4) break;
    const s = String(w);
    if (s !== a && !/NaN|Infinity|undefined/.test(s)) set.add(s);
  }
  let tries = 0;
  while (set.size < 4 && fill && tries++ < 60) { const s = String(fill()); if (s !== a) set.add(s); }
  return shuffle([...set]);
}
function wt(answer, obj) {
  const out = {};
  for (const k of Object.keys(obj)) if (k !== String(answer)) out[k] = obj[k];
  return out;
}
const PRIMES_100 = Array.from({ length: 99 }, (_, i) => i + 2).filter(isPrime);
const sup = (e) => (e === 2 ? '²' : e === 3 ? '³' : `^${e}`);

function L1() {
  const t = randInt(0, 2);
  if (t === 0) {
    const n = randInt(1, 10), a = 2 * n;
    return {
      prompt: `Double ${n}.`, answer: String(a),
      visual: { type: 'array', rows: 2, cols: n },
      choices: mkChoices(a, [n + 1, n + 2, a + 1], () => randInt(2, 20)),
      hint: `${n} + ${n}.`,
      explain: `Double ${n} is ${n} + ${n} = ${a}.`,
      wrongTags: wt(a, { [n + 2]: 'add-two-not-double' }),
    };
  }
  if (t === 1) {
    const h = randInt(1, 10), n = 2 * h;
    return {
      prompt: `What is half of ${n}?`, answer: String(h),
      visual: { type: 'array', rows: 2, cols: h },
      choices: mkChoices(h, [n - 2, h + 1, h - 1], () => randInt(1, 10)),
      hint: 'Split it into 2 equal groups.',
      explain: `${h} + ${h} = ${n}, so half of ${n} is ${h}.`,
      wrongTags: wt(h, { [n - 2]: 'subtract-two-not-half' }),
    };
  }
  const n = randInt(2, 10), a = 2 * n;
  return {
    prompt: `${n} + ${n} = ?`, answer: String(a),
    hint: 'This is a double.',
    explain: `Double ${n} is ${a}.`,
  };
}

function L2() {
  const t = randInt(0, 2);
  if (t === 0) {
    const n = randInt(2, 99);
    const odd = n % 2 === 1;
    return {
      prompt: `Is ${n} even or odd?`, answer: odd ? 'odd' : 'even',
      choices: ['even', 'odd'],
      hint: 'Look at the last digit only.',
      explain: `The ones digit is ${n % 10}. ${odd ? 'It cannot be split into pairs, so ' + n + ' is odd.' : 'That splits into pairs, so ' + n + ' is even.'}`,
      wrongTags: { [odd ? 'even' : 'odd']: 'tens-digit-check' },
    };
  }
  if (t === 1) {
    const wantEven = Math.random() < 0.5;
    const tensOpp = wantEven ? [1, 3, 5, 7, 9] : [2, 4, 6, 8];
    const onesOpp = wantEven ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
    const onesAns = wantEven ? [0, 2, 4, 6, 8] : [1, 3, 5, 7, 9];
    const answer = pick(tensOpp) * 10 + pick(onesAns); // tens digit looks like the opposite parity
    const wrongs = new Set();
    while (wrongs.size < 3) { const w = pick([2, 4, 6, 8, 1, 3, 5, 7, 9]) * 10 + pick(onesOpp); if (w !== answer) wrongs.add(w); }
    const tags = {};
    for (const w of wrongs) tags[w] = 'tens-digit-check';
    return {
      prompt: `Which number is ${wantEven ? 'even' : 'odd'}?`, answer: String(answer),
      choices: shuffle([String(answer), ...[...wrongs].map(String)]),
      hint: 'Only the ones digit matters.',
      explain: `${answer} ends in ${answer % 10}, so it is ${wantEven ? 'even' : 'odd'}.`,
      wrongTags: tags,
    };
  }
  const n = randInt(5, 40);
  const odd = n % 2 === 1;
  return {
    prompt: `Can ${n} be split into pairs with none left over?`, answer: odd ? 'no' : 'yes',
    choices: ['yes', 'no'],
    hint: 'Even numbers make pairs exactly.',
    explain: `${n} is ${odd ? 'odd, so one is left over' : 'even, so it makes ' + n / 2 + ' pairs'}.`,
  };
}

function L3() {
  const f = pick([2, 5, 10]);
  const t = randInt(0, 3);
  if (t === 0) {
    const yes = Math.random() < 0.5;
    let n;
    if (yes) n = f * randInt(2, Math.floor(100 / f));
    else { do { n = randInt(3, 100); } while (n % f === 0); }
    return {
      prompt: `Is ${n} a multiple of ${f}?`, answer: yes ? 'yes' : 'no',
      choices: ['yes', 'no'],
      hint: `Can you get to ${n} by counting by ${f}s?`,
      explain: yes ? `${f} x ${n / f} = ${n}, so yes.` : `${n} ends in ${n % 10}; multiples of ${f} end in ${f === 2 ? '0, 2, 4, 6 or 8' : f === 5 ? '0 or 5' : '0'}. So no.`,
      wrongTags: { [yes ? 'no' : 'yes']: 'multiple-check' },
    };
  }
  if (t === 1) {
    const k = randInt(2, 9), a = f * k;
    const words = ['second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
    return {
      prompt: `What is the ${words[k - 2]} multiple of ${f}?`, answer: String(a),
      hint: `Count by ${f}s ${k} times.`,
      explain: `${Array.from({ length: k }, (_, i) => f * (i + 1)).join(', ')}: the ${words[k - 2]} multiple is ${a}.`,
    };
  }
  if (t === 2) {
    const k = randInt(2, 9), a = f * k;
    const wrongs = f === 10 ? [5, 2, a + 5] : f === 5 ? [1, a + 2, a - 1] : [1, a + 1, a - 1];
    return {
      prompt: `Which number is a multiple of ${f}?`, answer: String(a),
      choices: mkChoices(a, wrongs, () => { let w; do { w = randInt(3, 99); } while (w % f === 0); return w; }),
      hint: `Multiples come from counting by ${f}s: ${f}, ${2 * f}, ${3 * f}...`,
      explain: `${f} x ${k} = ${a}, so ${a} is a multiple of ${f}.`,
      wrongTags: wt(a, f === 10 ? { '5': 'factor-vs-multiple', '2': 'factor-vs-multiple' } : { '1': 'factor-vs-multiple' }),
    };
  }
  const k = randInt(3, 8);
  const seq = Array.from({ length: k }, (_, i) => f * (i + 1));
  return {
    prompt: `Multiples of ${f}: ${seq.join(', ')}, __`, answer: String(f * (k + 1)),
    hint: `Add ${f}.`,
    explain: `${seq[k - 1]} + ${f} = ${f * (k + 1)}.`,
  };
}

function L4() {
  const t = randInt(0, 4);
  if (t === 0) {
    const n = pick([6, 8, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 50]);
    const fs = factorsOf(n);
    return {
      prompt: `How many factors does ${n} have?`, answer: String(fs.length),
      choices: mkChoices(fs.length, [fs.length - 2, fs.length - 1, fs.length + 1], () => randInt(2, 10)),
      hint: `Start with 1 x ${n}, then try 2, 3, 4...`,
      explain: `Factors of ${n}: ${fs.join(', ')}. That is ${fs.length} factors.`,
      wrongTags: wt(fs.length, { [fs.length - 2]: 'missing-one-pair', [fs.length - 1]: 'missing-one-pair' }),
    };
  }
  if (t === 1) {
    const n = pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 42, 48]);
    const fs = factorsOf(n);
    const a = pick(fs.filter((x) => x > 1 && x < n));
    const nonF = [];
    while (nonF.length < 3) { const w = randInt(2, n - 1); if (n % w !== 0 && !nonF.includes(w)) nonF.push(w); }
    return {
      prompt: `Which number is a factor of ${n}?`, answer: String(a),
      choices: shuffle([String(a), ...nonF.map(String)]),
      hint: `A factor divides ${n} with nothing left over.`,
      explain: `${a} x ${n / a} = ${n}, so ${a} is a factor of ${n}.`,
    };
  }
  if (t === 2) {
    const n = pick([12, 16, 18, 20, 24, 30, 36]);
    const fs = factorsOf(n);
    const pairs = Math.ceil(fs.length / 2);
    const r = pick(fs.filter((x) => x <= 6 && x > 1 && n / x <= 12));
    return {
      prompt: `How many different rectangles can you make with ${n} squares?`, answer: String(pairs),
      visual: { type: 'array', rows: r, cols: n / r },
      choices: mkChoices(pairs, [pairs - 1, pairs + 1, fs.length], () => randInt(1, 8)),
      hint: `Each factor pair of ${n} makes one rectangle, including 1 by ${n}.`,
      explain: `Factor pairs of ${n}: ${fs.slice(0, pairs).map((f) => `${f} x ${n / f}`).join(', ')}. That is ${pairs} rectangles.`,
      wrongTags: wt(pairs, { [pairs - 1]: 'missing-one-pair', [fs.length]: 'counted-factors-not-pairs' }),
    };
  }
  if (t === 3) {
    const a = randInt(2, 9), b = randInt(2, 9), n = a * b;
    return {
      prompt: `${n} = ${a} x __`, answer: String(b),
      hint: `${n} ÷ ${a}.`,
      explain: `${a} x ${b} = ${n}, so the missing factor is ${b}.`,
    };
  }
  const n = pick([8, 10, 12, 14, 15, 18, 20, 21, 22, 24, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 50]);
  const fs = factorsOf(n);
  const big = fs[fs.length - 2];
  return {
    prompt: `What is the largest factor of ${n} that is smaller than ${n}?`, answer: String(big),
    hint: `Divide ${n} by its smallest factor bigger than 1 (try ${n % 2 === 0 ? 2 : 3} first).`,
    explain: `${n} ÷ ${n / big} = ${big}, and nothing bigger divides ${n} except ${n} itself.`,
  };
}

function L5() {
  const t = randInt(0, 4);
  if (t === 0) {
    const f = randInt(3, 12), k = randInt(3, 9), a = f * k;
    const words = ['third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
    return {
      prompt: `What is the ${words[k - 3]} multiple of ${f}?`, answer: String(a),
      hint: `${f} x ${k}.`,
      explain: `${f} x ${k} = ${a}.`,
    };
  }
  if (t === 1) {
    const pairs = [[4, 6], [6, 8], [3, 4], [2, 3], [4, 10], [6, 9], [5, 10], [3, 5], [6, 10], [8, 12], [4, 5], [2, 7]];
    const [a, b] = pick(pairs), l = lcm(a, b);
    return {
      prompt: `What is the smallest common multiple of ${a} and ${b}?`, answer: String(l),
      choices: mkChoices(l, [a * b, l * 2, Math.max(a, b)], () => l + randInt(1, 10)),
      hint: `List multiples of ${a} and of ${b}; find the first match.`,
      explain: `Multiples of ${a}: ${[1, 2, 3, 4].map((i) => a * i).join(', ')}... Multiples of ${b}: ${[1, 2, 3, 4].map((i) => b * i).join(', ')}... First shared: ${l}.`,
      wrongTags: wt(l, { [a * b]: 'product-as-lcm' }),
    };
  }
  if (t === 2) {
    const rule = pick([2, 5, 10]);
    const n = randInt(11, 99);
    const yes = n % rule === 0;
    return {
      prompt: `Is ${n} divisible by ${rule}?`, answer: yes ? 'yes' : 'no',
      choices: ['yes', 'no'],
      hint: 'Check the ones digit.',
      explain: `${n} ends in ${n % 10}. Divisible by ${rule} needs a last digit of ${rule === 2 ? '0, 2, 4, 6 or 8' : rule === 5 ? '0 or 5' : '0'}. So ${yes ? 'yes' : 'no'}.`,
      wrongTags: { [yes ? 'no' : 'yes']: 'divisibility-rule' },
    };
  }
  if (t === 3) {
    const f = randInt(3, 12);
    let k; do { k = randInt(2, 8); } while (k === f);
    const a = f * k;
    return {
      prompt: `Which number is a multiple of both ${f} and ${k}?`, answer: String(a),
      choices: mkChoices(a, [f + k, a + f, a - k].filter((w) => w % f !== 0 || w % k !== 0), () => { let w; do { w = randInt(6, 99); } while (w % f === 0 && w % k === 0); return w; }),
      hint: `${f} x ${k} works.`,
      explain: `${f} x ${k} = ${a}, so ${a} is a multiple of both.`,
    };
  }
  const f = randInt(3, 12);
  const lo = randInt(2, 6), hi = lo + 2;
  const seq = [lo, lo + 1, hi].map((i) => f * i);
  return {
    prompt: `Multiples of ${f}: ${seq[0]}, __, ${seq[2]}`, answer: String(seq[1]),
    hint: `Add ${f} to ${seq[0]}.`,
    explain: `${seq[0]} + ${f} = ${seq[1]}.`,
  };
}

function L6() {
  const t = randInt(0, 4);
  if (t === 0) {
    const n = randInt(2, 100);
    const p = isPrime(n);
    const small = primeFactors(n);
    return {
      prompt: `Is ${n} prime or composite?`, answer: p ? 'prime' : 'composite',
      choices: ['prime', 'composite'],
      hint: 'A prime has exactly two factors: 1 and itself.',
      explain: p ? `Nothing but 1 and ${n} divides ${n}, so it is prime.` : `${n} = ${small[0]} x ${n / small[0]}, so it is composite.`,
      wrongTags: { [p ? 'composite' : 'prime']: n % 2 === 1 && !p ? 'all-odds-prime' : 'prime-check' },
    };
  }
  if (t === 1) {
    const n = pick([1, 2, 1, 2, 9, 15, 21, 27, 33, 39, 49, 51, 57, 87, 91]);
    const yes = isPrime(n);
    return {
      prompt: `Is ${n} a prime number?`, answer: yes ? 'yes' : 'no',
      choices: ['yes', 'no'],
      hint: n === 1 ? 'How many factors does 1 have?' : n === 2 ? 'Can an even number be prime?' : 'Try dividing by 3 or 7.',
      explain: n === 1 ? '1 has only one factor, so it is not prime.' : n === 2 ? '2 has exactly two factors (1 and 2), so it is prime, the only even prime.' : `${n} = ${primeFactors(n)[0]} x ${n / primeFactors(n)[0]}, so it is not prime.`,
      wrongTags: { [yes ? 'no' : 'yes']: n === 1 ? 'one-is-prime' : n === 2 ? 'two-not-prime' : 'all-odds-prime' },
    };
  }
  if (t === 2) {
    const rule = pick([3, 6, 9]);
    const n = randInt(12, 99);
    const yes = n % rule === 0;
    const digits = String(n).split('').map(Number), sum = digits.reduce((s, x) => s + x, 0);
    const why = rule === 6 ? `${n} is ${n % 2 === 0 ? 'even' : 'odd'} and its digit sum ${sum} ${sum % 3 === 0 ? 'is' : 'is not'} divisible by 3.` : `Digit sum ${digits.join(' + ')} = ${sum}, which ${sum % rule === 0 ? 'is' : 'is not'} divisible by ${rule}.`;
    return {
      prompt: `Is ${n} divisible by ${rule}?`, answer: yes ? 'yes' : 'no',
      choices: ['yes', 'no'],
      hint: rule === 6 ? 'It must be even AND have a digit sum divisible by 3.' : 'Add the digits.',
      explain: `${why} So ${yes ? 'yes' : 'no'}.`,
      wrongTags: { [yes ? 'no' : 'yes']: 'divisibility-rule' },
    };
  }
  if (t === 3) {
    const a = pick(PRIMES_100.filter((p) => p > 10));
    const wrongs = new Set();
    while (wrongs.size < 3) { const w = randInt(11, 99); if (!isPrime(w) && w % 2 === 1) wrongs.add(w); }
    const tags = {};
    for (const w of wrongs) tags[w] = 'all-odds-prime';
    return {
      prompt: 'Which number is prime?', answer: String(a),
      choices: shuffle([String(a), ...[...wrongs].map(String)]),
      hint: 'Test each one by dividing by 3, 5 and 7.',
      explain: `${[...wrongs].map((w) => `${w} = ${primeFactors(w)[0]} x ${w / primeFactors(w)[0]}`).join('; ')}. Only ${a} has no factors besides 1 and itself.`,
      wrongTags: tags,
    };
  }
  const lo = pick([10, 20, 30, 40, 50, 60, 70, 80, 90]);
  const count = PRIMES_100.filter((p) => p > lo && p < lo + 10).length;
  return {
    prompt: `How many prime numbers are between ${lo} and ${lo + 10}?`, answer: String(count),
    choices: mkChoices(count, [count + 1, count - 1, count + 2], () => randInt(0, 5)),
    hint: 'Only odd numbers that do not end in 5 can be prime here.',
    explain: `Primes between ${lo} and ${lo + 10}: ${PRIMES_100.filter((p) => p > lo && p < lo + 10).join(', ') || 'none'}. That is ${count}.`,
  };
}

function pfString(n) {
  const pf = primeFactors(n);
  const counts = {};
  for (const p of pf) counts[p] = (counts[p] || 0) + 1;
  return Object.keys(counts).map((p) => (counts[p] === 1 ? p : `${p}${sup(counts[p])}`)).join(' x ');
}

function L7() {
  const t = randInt(0, 4);
  if (t === 0) {
    const n = pick([12, 18, 20, 24, 28, 36, 40, 45, 48, 50, 54, 60, 72, 75, 80, 90, 96, 100, 108, 120, 144, 150, 180, 200]);
    const a = pfString(n);
    const pf = primeFactors(n);
    const wrongs = [`${pf[0]} x ${n / pf[0]}`, pfString(n * 2), pfString(n / pf[0])].filter((w) => w !== a);
    return {
      prompt: `What is the prime factorization of ${n}?`, answer: a,
      choices: mkChoices(a, wrongs, null),
      hint: 'Make a factor tree until every branch ends in a prime.',
      explain: `${n} = ${pf.join(' x ')} = ${a}.`,
      wrongTags: wt(a, { [`${pf[0]} x ${n / pf[0]}`]: 'not-all-prime' }),
    };
  }
  if (t === 1) {
    const n = pick([12, 18, 24, 36, 40, 48, 54, 72, 80, 96, 100, 108, 144, 200]);
    const pf = primeFactors(n);
    const counts = {};
    for (const p of pf) counts[p] = (counts[p] || 0) + 1;
    const ps = Object.keys(counts).map(Number);
    const ask = pick(ps);
    const parts = ps.map((p) => (p === ask ? `${p}^?` : counts[p] === 1 ? `${p}` : `${p}${sup(counts[p])}`)).join(' x ');
    return {
      prompt: `${n} = ${parts}. What is the missing exponent?`, answer: String(counts[ask]),
      hint: `How many times does ${ask} divide into ${n}?`,
      explain: `${n} = ${pf.join(' x ')}; ${ask} appears ${counts[ask]} time${counts[ask] > 1 ? 's' : ''}.`,
    };
  }
  if (t === 2) {
    const pairs = [[6, 8], [4, 6], [6, 9], [8, 12], [10, 15], [12, 18], [9, 12], [10, 12], [14, 21], [15, 20], [6, 10], [8, 10]];
    const [a, b] = pick(pairs), l = lcm(a, b);
    return {
      prompt: `What is the LCM of ${a} and ${b}?`, answer: String(l),
      hint: 'LCM = lowest common multiple. List multiples until they match.',
      explain: `Multiples of ${a}: ${Array.from({ length: l / a }, (_, i) => a * (i + 1)).join(', ')}. Multiples of ${b}: ${Array.from({ length: l / b }, (_, i) => b * (i + 1)).join(', ')}. Lowest shared: ${l}.`,
      wrongTags: { [a * b]: 'product-as-lcm' },
    };
  }
  if (t === 3) {
    const pairs = [[24, 36], [12, 18], [16, 24], [20, 30], [18, 27], [32, 48], [15, 25], [28, 42], [36, 48], [40, 60], [14, 35], [21, 28]];
    const [a, b] = pick(pairs), g = gcd(a, b);
    return {
      prompt: `What is the GCF of ${a} and ${b}?`, answer: String(g),
      choices: mkChoices(g, [1, g % 2 === 0 ? g / 2 : g * 2, Math.min(a, b)], () => randInt(2, 12)),
      hint: 'GCF = greatest common factor: the biggest number that divides both.',
      explain: `Factors of ${a}: ${factorsOf(a).join(', ')}. Factors of ${b}: ${factorsOf(b).join(', ')}. Greatest shared: ${g}.`,
      wrongTags: wt(g, { '1': 'gcf-always-one' }),
    };
  }
  const n = pick([30, 42, 66, 70, 78, 102, 105, 110, 130, 154, 165, 170, 182, 190, 195]);
  const pf = primeFactors(n);
  return {
    prompt: `${n} = ${pf.slice(0, -1).join(' x ')} x __ (all primes)`, answer: String(pf[pf.length - 1]),
    hint: `Divide ${n} by ${pf.slice(0, -1).join(' and then by ')}.`,
    explain: `${n} ÷ ${pf.slice(0, -1).reduce((p, x) => p * x, 1)} = ${pf[pf.length - 1]}.`,
  };
}

function L8() {
  const t = randInt(0, 4);
  if (t === 0) {
    const b = randInt(2, 12), a = b * b;
    return {
      prompt: `${b}${sup(2)} = ?`, answer: String(a),
      choices: mkChoices(a, [b * 2, a + b, b * 3], () => randInt(4, 150)),
      hint: `${b} squared means ${b} x ${b}.`,
      explain: `${b}${sup(2)} = ${b} x ${b} = ${a}.`,
      wrongTags: wt(a, { [b * 2]: 'base-times-exponent' }),
    };
  }
  if (t === 1) {
    const b = randInt(2, 10), a = b ** 3;
    return {
      prompt: `${b}${sup(3)} = ?`, answer: String(a),
      hint: `${b} x ${b} x ${b}.`,
      explain: `${b}${sup(3)} = ${b} x ${b} x ${b} = ${a}.`,
      wrongTags: { [b * 3]: 'base-times-exponent', [b * b]: 'stopped-early' },
    };
  }
  if (t === 2) {
    const b = pick([2, 2, 2, 10, 3, 5]);
    const e = b === 2 ? randInt(4, 9) : b === 10 ? randInt(2, 3) : randInt(3, 4);
    const a = b ** e;
    return {
      prompt: `${b}^${e} = ?`, answer: String(a),
      hint: `${b}^${e} means ${e} copies of ${b} multiplied together.`,
      explain: `${b}^${e} = ${Array(e).fill(b).join(' x ')} = ${a}.`,
      wrongTags: { [b * e]: 'base-times-exponent' },
    };
  }
  if (t === 3) {
    const r = randInt(2, 15), sq = r * r;
    return {
      prompt: `What is the square root of ${sq}?`, answer: String(r),
      hint: `Which number times itself makes ${sq}?`,
      explain: `${r} x ${r} = ${sq}, so the square root of ${sq} is ${r}.`,
      wrongTags: { [sq / 2]: 'halved-instead-of-root' },
    };
  }
  const n = randInt(3, 12);
  return {
    prompt: `What is ${n} squared?`, answer: String(n * n),
    visual: { type: 'array', rows: n, cols: n },
    hint: 'A square array: same number of rows and columns.',
    explain: `${n} x ${n} = ${n * n}.`,
    wrongTags: { [2 * n]: 'base-times-exponent' },
  };
}

function L9() {
  const t = randInt(0, 4);
  if (t === 0) {
    const a = randInt(1, 9), b = randInt(2, 6), c = randInt(2, 5);
    const ans = a + b * b * c;
    const wrong = (a + b) ** 2 * c, wrong2 = a + (b * c) ** 2;
    return {
      prompt: `${a} + ${b}${sup(2)} x ${c} = ?`, answer: String(ans),
      choices: mkChoices(ans, [wrong2, wrong, (a + b * b) * c], () => randInt(10, 200)),
      hint: 'Exponents first, then multiply, then add.',
      explain: `${b}${sup(2)} = ${b * b}; ${b * b} x ${c} = ${b * b * c}; ${a} + ${b * b * c} = ${ans}.`,
      wrongTags: wt(ans, { [wrong2]: 'squared-after-multiplying', [(a + b * b) * c]: 'added-before-multiplying' }),
    };
  }
  if (t === 1) {
    const a = randInt(2, 6), b = randInt(1, 5), ans = (a + b) ** 2;
    return {
      prompt: `(${a} + ${b})${sup(2)} = ?`, answer: String(ans),
      hint: 'Brackets first.',
      explain: `${a} + ${b} = ${a + b}; ${a + b}${sup(2)} = ${ans}.`,
      wrongTags: { [a * a + b * b]: 'squared-each-term', [a + b * b]: 'ignored-brackets' },
    };
  }
  if (t === 2) {
    let m; do { m = randInt(11, 99); } while (m % 10 === 0); // e.g. 4.5 x 10^3 = 4500
    const e = randInt(2, 4), ans = m * 10 ** (e - 1);
    const ms = `${Math.floor(m / 10)}.${m % 10}`;
    return {
      prompt: `${ms} x 10^${e} = ?`, answer: String(ans),
      hint: `Move the decimal point ${e} places to the right.`,
      explain: `10^${e} = ${10 ** e}; ${ms} x ${10 ** e} = ${ans}.`,
      wrongTags: { [m * 10 ** (e - 2)]: 'moved-too-few-places', [m * e]: 'base-times-exponent' },
    };
  }
  if (t === 3) {
    const h = randInt(1, 9), tn = randInt(1, 9), o = randInt(1, 9);
    const ans = h * 100 + tn * 10 + o;
    return {
      prompt: `${h} x 10${sup(2)} + ${tn} x 10 + ${o} = ?`, answer: String(ans),
      hint: '10 squared is 100.',
      explain: `${h} x 100 = ${h * 100}, ${tn} x 10 = ${tn * 10}, plus ${o}: ${ans}.`,
    };
  }
  const a = randInt(2, 9), b = randInt(2, 5), c = randInt(1, 9);
  const ans = a * b * b - c;
  return {
    prompt: `${a} x ${b}${sup(2)} - ${c} = ?`, answer: String(ans),
    hint: 'Square first, then multiply, then subtract.',
    explain: `${b}${sup(2)} = ${b * b}; ${a} x ${b * b} = ${a * b * b}; minus ${c} is ${ans}.`,
    wrongTags: { [(a * b) ** 2 - c]: 'squared-after-multiplying' },
  };
}

function L10() {
  const t = randInt(0, 5);
  if (t === 0) {
    const b = pick([2, 3, 5, 10]), m = randInt(2, 5), n = randInt(2, 5);
    return {
      prompt: `${b}^${m} x ${b}^${n} = ${b}^?`, answer: String(m + n),
      choices: mkChoices(m + n, [m * n, m + n + 1, Math.abs(m - n)], () => randInt(2, 12)),
      hint: 'Same base: count the total number of copies.',
      explain: `${b}^${m} is ${m} copies of ${b} and ${b}^${n} is ${n} more, so ${m + n} copies: ${b}^${m + n}.`,
      wrongTags: wt(m + n, { [m * n]: 'multiplied-exponents' }),
    };
  }
  if (t === 1) {
    const b = pick([2, 3, 10]), m = randInt(4, 8), n = randInt(1, m - 1);
    return {
      prompt: `${b}^${m} ÷ ${b}^${n} = ${b}^?`, answer: String(m - n),
      hint: 'Same base: subtract the exponents.',
      explain: `${b}^${m} ÷ ${b}^${n} cancels ${n} copies of ${b}, leaving ${m - n}: ${b}^${m - n}.`,
      wrongTags: { [m / n]: 'divided-exponents' },
    };
  }
  if (t === 2) {
    const e = randInt(1, 3);
    return {
      prompt: `Write 10^-${e} as a decimal.`, answer: `0.${'0'.repeat(e - 1)}1`,
      choices: mkChoices(`0.${'0'.repeat(e - 1)}1`, [`-${10 ** e}`, `0.${'0'.repeat(e)}1`, `-0.${'0'.repeat(e - 1)}1`], null),
      hint: 'A negative exponent means 1 divided by the power.',
      explain: `10^-${e} = 1/10^${e} = 1/${10 ** e} = 0.${'0'.repeat(e - 1)}1.`,
      wrongTags: { [`-${10 ** e}`]: 'negative-exponent-as-negative', [`-0.${'0'.repeat(e - 1)}1`]: 'negative-exponent-as-negative' },
    };
  }
  if (t === 3) {
    const b = pick([2, 3, 4, 5]), e = b === 2 ? randInt(1, 4) : randInt(1, 2);
    return {
      prompt: `Write ${b}^-${e} as a fraction.`, answer: `1/${b ** e}`,
      hint: `${b}^-${e} = 1 over ${b}^${e}.`,
      explain: `${b}^-${e} = 1/${b}^${e} = 1/${b ** e}.`,
      wrongTags: { [`-${b ** e}`]: 'negative-exponent-as-negative', [`-1/${b ** e}`]: 'negative-exponent-as-negative' },
    };
  }
  if (t === 4) {
    const pairs = [[12, 18], [8, 12], [6, 10], [10, 15], [9, 12], [12, 20], [14, 21], [15, 25], [16, 24], [18, 30]];
    const [a, b] = pick(pairs), l = lcm(a, b);
    const [who, unit] = pick([['Buses leave', 'min'], ['Trains leave', 'min'], ['Lights blink', 'sec'], ['Bells ring', 'sec']]);
    return {
      prompt: `${who} every ${a} ${unit} and every ${b} ${unit}, both now. How many ${unit} until both again?`, answer: String(l),
      hint: 'Find the lowest common multiple.',
      explain: `LCM of ${a} and ${b}: ${a} = ${pfString(a)}, ${b} = ${pfString(b)}, so LCM = ${l}.`,
      wrongTags: { [a * b]: 'product-as-lcm' },
    };
  }
  const g = pick([2, 3, 4, 5, 6, 8, 9, 12]);
  let n, d;
  do { n = g * randInt(1, 9); d = g * randInt(2, 12); } while (gcd(n, d) !== g || n >= d);
  return {
    prompt: `Simplify ${n}/${d} using the GCF.`, answer: frac(n, d),
    hint: `GCF of ${n} and ${d} is ${g}.`,
    explain: `Divide top and bottom by ${g}: ${n}/${d} = ${frac(n, d)}.`,
  };
}

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'factors', name: 'Factors & Primes', emoji: '🔢', group: 'number',
  start: { 1: 1, 3: 2, 4: 3 },
  unlock: { skill: 'mul', level: 3 },
  gen(level) {
    const q = LEVELS[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) { delete q.wrongTags[String(q.answer)]; if (!Object.keys(q.wrongTags).length) delete q.wrongTags; }
    return q;
  },
};
