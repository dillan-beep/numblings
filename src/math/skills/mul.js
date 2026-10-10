// Multiplication ladder (curriculum A4).
import { randInt, pick, shuffle } from '../rng.js';

const NAMES = ['Jack', 'Luke', 'Madelyn', 'Ava', 'Noah', 'Mia', 'Leo', 'Zoe'];
const THINGS = ['apples', 'stickers', 'marbles', 'cookies', 'blocks', 'shells'];
const BAGS = ['bags', 'boxes', 'baskets', 'jars'];

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function frac(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; }
// intVal is the value scaled by 10^places; returns a clean decimal string.
function dec(intVal, places) {
  const neg = intVal < 0;
  const s = String(Math.abs(intVal)).padStart(places + 1, '0');
  const ip = s.slice(0, s.length - places);
  const fp = s.slice(s.length - places).replace(/0+$/, '');
  return (neg ? '-' : '') + ip + (fp ? '.' + fp : '');
}
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
// a proper fraction n/d in lowest terms
function properFrac(minD, maxD) {
  let n, d;
  do { d = randInt(minD, maxD); n = randInt(1, d - 1); } while (gcd(n, d) !== 1);
  return [n, d];
}
const eq = (raw, simplified) => (raw === simplified ? raw : `${raw} = ${simplified}`);
function wt(answer, obj) {
  const out = {};
  for (const k of Object.keys(obj)) if (k !== String(answer)) out[k] = obj[k];
  return out;
}
const plus = (n, g) => Array(g).fill(n).join(' + ');

function L1() {
  const n = pick([2, 5]);
  const g = n === 5 ? randInt(2, 4) : randInt(2, 8);
  const a = g * n;
  const t = randInt(0, 2);
  if (t === 0) {
    return {
      prompt: `${g} groups of ${n}. How many in all?`, answer: String(a),
      visual: { type: 'array', rows: g, cols: n },
      choices: mkChoices(a, [g, g + n, a + n], () => randInt(2, 20)),
      hint: 'Count every dot, not just the groups.',
      explain: `${g} groups of ${n}: ${plus(n, g)} = ${a}.`,
      wrongTags: wt(a, { [g]: 'count-groups', [g + n]: 'add-instead-of-multiply' }),
    };
  }
  if (t === 1) {
    return {
      prompt: `${plus(n, g)} = ${g} x __`, answer: String(n),
      choices: mkChoices(n, [g, a, g + n], () => randInt(1, 10)),
      hint: 'How many in each group?',
      explain: `There are ${g} groups and each one is ${n}, so ${g} x ${n} = ${a}.`,
      wrongTags: wt(n, { [g]: 'count-groups', [a]: 'total-not-group' }),
    };
  }
  const name = pick(NAMES), thing = pick(THINGS), bag = pick(BAGS);
  return {
    prompt: `${name} has ${g} ${bag} with ${n} ${thing} in each. How many ${thing}?`, answer: String(a),
    visual: { type: 'array', rows: g, cols: n },
    choices: mkChoices(a, [g, g + n, a - n], () => randInt(2, 20)),
    hint: `Skip count by ${n}: ${n}, ${2 * n}, ...`,
    explain: `${g} ${bag} of ${n}: ${plus(n, g)} = ${a}.`,
    wrongTags: wt(a, { [g]: 'count-groups', [g + n]: 'add-instead-of-multiply' }),
  };
}

function L2() {
  const f = pick([2, 5, 10]);
  const n = randInt(2, f === 10 ? 5 : 10);
  const a = f * n;
  const t = randInt(0, 3);
  if (t === 0) {
    const [r, c] = Math.random() < 0.5 ? [f, n] : [n, f];
    return {
      prompt: `This array has ${r} rows of ${c}. How many dots?`, answer: String(a),
      visual: { type: 'array', rows: r, cols: c },
      hint: `Skip count by ${c} for each row.`,
      explain: `${r} rows of ${c}: ${r} x ${c} = ${a}.`,
      wrongTags: { [r + c]: 'rows-plus-cols' },
    };
  }
  if (t === 1) {
    const [x, y] = Math.random() < 0.5 ? [f, n] : [n, f];
    return {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: `Skip count by ${f}, ${n} times.`,
      explain: `Skip count by ${f}: ${Array.from({ length: n }, (_, i) => f * (i + 1)).join(', ')}. So ${x} x ${y} = ${a}.`,
      wrongTags: { [x + y]: 'rows-plus-cols' },
    };
  }
  if (t === 2) {
    const k = randInt(3, 6);
    const seq = Array.from({ length: k }, (_, i) => f * (i + 1));
    return {
      prompt: `Skip count by ${f}: ${seq.join(', ')}, __`, answer: String(f * (k + 1)),
      hint: `Add ${f} to the last number.`,
      explain: `${seq[k - 1]} + ${f} = ${f * (k + 1)}.`,
    };
  }
  return {
    prompt: `A ${n} by ${f} array has how many squares?`, answer: String(a),
    visual: { type: 'array', rows: n, cols: f },
    choices: mkChoices(a, [n + f, a + f, a - f], () => randInt(4, 50)),
    hint: 'Rows times columns.',
    explain: `${n} rows times ${f} columns: ${n} x ${f} = ${a}.`,
    wrongTags: wt(a, { [n + f]: 'rows-plus-cols' }),
  };
}

function L3() {
  const t = randInt(0, 4);
  if (t === 0 || t === 1) {
    const f = pick([2, 5, 10]), n = randInt(2, 10), a = f * n;
    const [x, y] = Math.random() < 0.5 ? [f, n] : [n, f];
    if (t === 0) return {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: f === 2 ? `Double ${n}.` : f === 5 ? `Count by 5s ${n} times.` : `${n} tens.`,
      explain: f === 2 ? `${n} doubled is ${a}.` : f === 10 ? `${n} tens is ${a}.` : `Count by 5s: ${n} fives make ${a}.`,
    };
    return {
      prompt: `__ x ${y} = ${a}`, answer: String(x),
      hint: `How many ${y}s make ${a}?`,
      explain: `${x} x ${y} = ${a}, so the missing number is ${x}.`,
    };
  }
  if (t === 2) {
    const f = pick([2, 5, 10]);
    let n; do { n = randInt(3, 10); } while (n === f);
    const a = f * n;
    return {
      prompt: `If ${f} x ${n} = ${a}, what is ${n} x ${f}?`, answer: String(a),
      hint: 'Turn the array around: the total stays the same.',
      explain: `Order does not change the product: ${n} x ${f} = ${f} x ${n} = ${a}.`,
    };
  }
  if (t === 3) {
    const n = randInt(2, 10);
    const [x, y] = Math.random() < 0.5 ? [0, n] : [n, 0];
    return {
      prompt: `${x} x ${y} = ?`, answer: '0',
      choices: mkChoices(0, [n, 1, n + 1], () => randInt(2, 12)),
      hint: `${n} groups with nothing in them.`,
      explain: `Any number times 0 is 0: ${x} x ${y} = 0.`,
      wrongTags: { [n]: 'zero-times-n', '1': 'zero-times-n' },
    };
  }
  const n = randInt(2, 10);
  const [x, y] = Math.random() < 0.5 ? [1, n] : [n, 1];
  return {
    prompt: `${x} x ${y} = ?`, answer: String(n),
    choices: mkChoices(n, [1, 0, n + 1], () => randInt(2, 12)),
    hint: `One group of ${n}.`,
    explain: `One group of ${n} is just ${n}: ${x} x ${y} = ${n}.`,
    wrongTags: { '1': 'one-times-n', '0': 'one-times-n' },
  };
}

function doubleExplain(f, n) {
  const a = f * n;
  if (f === 3) return `3 x ${n}: 2 x ${n} = ${2 * n}, plus one more ${n} is ${a}.`;
  if (f === 4) return `4 x ${n}: 2 x ${n} = ${2 * n}, doubled is ${a}.`;
  return `6 x ${n}: 3 x ${n} = ${3 * n}, doubled is ${a}.`;
}

function L4() {
  const f = pick([3, 4, 6]), n = randInt(2, 10), a = f * n;
  const [x, y] = Math.random() < 0.5 ? [f, n] : [n, f];
  const t = randInt(0, 3);
  const hint = f === 3 ? '3s are the 2s plus one more group.' : f === 4 ? '4s are double the 2s.' : '6s are double the 3s.';
  if (t === 0) return { prompt: `${x} x ${y} = ?`, answer: String(a), hint, explain: doubleExplain(f, n), visual: { type: 'array', rows: x, cols: y } };
  if (t === 1) return { prompt: `${x} x ${y} = ?`, answer: String(a), hint, explain: doubleExplain(f, n) };
  if (t === 2) return {
    prompt: `__ x ${f} = ${a}`, answer: String(n),
    hint: `How many ${f}s make ${a}?`,
    explain: `${n} x ${f} = ${a}, so the missing factor is ${n}.`,
  };
  return {
    prompt: `${x} x ${y} = ?`, answer: String(a),
    choices: mkChoices(a, [a + f, a - f, (f === 6 ? 3 : 2) * n], () => randInt(6, 60)),
    hint,
    explain: doubleExplain(f, n),
    wrongTags: wt(a, { [a + f]: 'adjacent-fact', [a - f]: 'adjacent-fact', [(f === 6 ? 3 : 2) * n]: 'forgot-to-double' }),
  };
}

function strategyExplain(x, y) {
  const a = x * y;
  if (x === 9 || y === 9) { const n = x === 9 ? y : x; return `9 x ${n}: 10 x ${n} = ${10 * n}, take away ${n}, so ${a}.`; }
  if (x === 8 || y === 8) { const n = x === 8 ? y : x; return `8 x ${n}: 5 x ${n} = ${5 * n} and 3 x ${n} = ${3 * n}, so ${a}.`; }
  if (x === 7 || y === 7) { const n = x === 7 ? y : x; return `7 x ${n}: 5 x ${n} = ${5 * n} and 2 x ${n} = ${2 * n}, so ${a}.`; }
  if (x === 6 || y === 6) { const n = x === 6 ? y : x; return `6 x ${n}: 3 x ${n} = ${3 * n}, doubled is ${a}.`; }
  return `${x} x ${y} = ${a}.`;
}

function L5() {
  const t = randInt(0, 3);
  let x, y;
  if (t === 3) { x = randInt(2, 10); y = randInt(2, 10); }
  else { x = pick([7, 8, 9]); y = randInt(2, 10); if (Math.random() < 0.5) [x, y] = [y, x]; }
  const a = x * y;
  const hint = (x === 9 || y === 9) ? 'Use 10 times the number, then take one group away.'
    : (x === 7 || y === 7 || x === 8 || y === 8) ? 'Split one factor into 5 and the rest.'
      : (x === 6 || y === 6) ? '6s are double the 3s.' : 'Use a fact you know.';
  if (t === 0) return { prompt: `${x} x ${y} = ?`, answer: String(a), hint, explain: strategyExplain(x, y) };
  if (t === 1) return {
    prompt: `${x} x ${y} = ?`, answer: String(a),
    choices: mkChoices(a, [a - Math.min(x, y), a + Math.min(x, y), a - Math.max(x, y)], () => randInt(10, 100)),
    hint, explain: strategyExplain(x, y),
    wrongTags: wt(a, { [a - Math.min(x, y)]: 'adjacent-fact', [a + Math.min(x, y)]: 'adjacent-fact', [a - Math.max(x, y)]: 'adjacent-fact' }),
  };
  if (t === 2) return {
    prompt: `${x} x __ = ${a}`, answer: String(y),
    hint: `How many ${x}s make ${a}?`,
    explain: `${x} x ${y} = ${a}, so the missing factor is ${y}.`,
  };
  const name = pick(NAMES), thing = pick(THINGS);
  return {
    prompt: `${name} packs ${x} boxes with ${y} ${thing} each. How many ${thing}?`, answer: String(a),
    hint, explain: strategyExplain(x, y),
  };
}

function L6() {
  const t = randInt(0, 3);
  if (t === 0) {
    const f = pick([11, 12]), n = randInt(2, 12), a = f * n;
    const [x, y] = Math.random() < 0.5 ? [f, n] : [n, f];
    return {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: `${f} = 10 + ${f - 10}.`,
      explain: `${f} x ${n}: 10 x ${n} = ${10 * n} and ${f - 10} x ${n} = ${(f - 10) * n}, so ${a}.`,
    };
  }
  if (t === 1) {
    const n = randInt(2, 9), p = pick([10, 100, 1000]), k = pick([1, 1, 2]);
    const m = k === 1 ? p : n * p; // e.g. 7 x 300
    const other = k === 1 ? n : randInt(2, 9);
    const a = m * other;
    const [x, y] = Math.random() < 0.5 ? [m, other] : [other, m];
    return {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: 'Multiply the front digits, then put the zeros back.',
      explain: `${other} x ${m / p} = ${other * (m / p)}, then ${String(p).length - 1} zero${p > 10 ? 's' : ''}: ${a}.`,
      wrongTags: { [a / 10]: 'lost-a-zero', [a * 10]: 'extra-zero' },
    };
  }
  const tens = randInt(1, 9), ones = randInt(1, 9), d = randInt(3, 9);
  const n = tens * 10 + ones, a = n * d;
  const forgot = tens * d * 10 + (ones * d) % 10;
  if (t === 2) return {
    prompt: `${n} x ${d} = ?`, answer: String(a),
    hint: `Split ${n} into ${tens * 10} + ${ones}.`,
    explain: `${n} x ${d}: ${tens * 10} x ${d} = ${tens * 10 * d} and ${ones} x ${d} = ${ones * d}, so ${a}.`,
    wrongTags: { [forgot]: 'forgot-carry' },
  };
  return {
    prompt: `${d} x ${n} = ?`, answer: String(a),
    choices: mkChoices(a, [forgot, a + d, a - 10], () => randInt(50, 900)),
    hint: `Split ${n} into ${tens * 10} + ${ones}.`,
    explain: `${d} x ${n}: ${d} x ${tens * 10} = ${tens * 10 * d} and ${d} x ${ones} = ${ones * d}, so ${a}.`,
    wrongTags: wt(a, { [forgot]: 'forgot-carry' }),
  };
}

function L7() {
  const t = randInt(0, 3);
  if (t === 0 || t === 1) {
    let x, y;
    do { x = randInt(12, 49); y = randInt(12, 49); } while (x % 10 === 0 || y % 10 === 0);
    const a = x * y;
    const xt = Math.floor(x / 10) * 10, xo = x % 10, yt = Math.floor(y / 10) * 10, yo = y % 10;
    const wrong = (xt / 10) * (yt / 10) + xt * yo + xo * yt + xo * yo; // forgot to scale tens x tens
    const q = {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: `Area model: split ${x} into ${xt} + ${xo} and ${y} into ${yt} + ${yo}.`,
      explain: `${x} x ${y}: ${xt} x ${yt} = ${xt * yt}, ${xt} x ${yo} = ${xt * yo}, ${xo} x ${yt} = ${xo * yt}, ${xo} x ${yo} = ${xo * yo}. Total ${a}.`,
      wrongTags: { [wrong]: 'partial-product' },
    };
    if (t === 1) { q.choices = mkChoices(a, [wrong, a + x, a - y], () => randInt(200, 2500)); q.wrongTags = wt(a, { [wrong]: 'partial-product' }); }
    return q;
  }
  if (t === 2) {
    const n = randInt(102, 999), d = randInt(3, 9), a = n * d;
    const h = Math.floor(n / 100) * 100, tn = Math.floor((n % 100) / 10) * 10, o = n % 10;
    return {
      prompt: `${n} x ${d} = ?`, answer: String(a),
      hint: `Split ${n} into hundreds, tens and ones.`,
      explain: `${n} x ${d}: ${h} x ${d} = ${h * d}, ${tn} x ${d} = ${tn * d}, ${o} x ${d} = ${o * d}. Total ${a}.`,
    };
  }
  const f = randInt(3, 9), k = randInt(3, 12), a = f * k;
  const wrongs = [a + 1, a - 1, a + randInt(2, f - 1)].filter((w) => w % f !== 0);
  return {
    prompt: `Which number is a multiple of ${f}?`, answer: String(a),
    choices: mkChoices(a, wrongs, () => { let w; do { w = randInt(10, 100); } while (w % f === 0); return w; }),
    hint: `Multiples of ${f} are ${f}, ${2 * f}, ${3 * f}, ...`,
    explain: `${f} x ${k} = ${a}, so ${a} is a multiple of ${f}.`,
  };
}

function L8() {
  const t = randInt(0, 3);
  if (t === 0) {
    const x = randInt(102, 999), y = randInt(11, 99), a = x * y;
    const yt = Math.floor(y / 10) * 10, yo = y % 10;
    return {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: `Split ${y} into ${yt} + ${yo}.`,
      explain: `${x} x ${yt} = ${x * yt} and ${x} x ${yo} = ${x * yo}. Add: ${a}.`,
    };
  }
  if (t === 1) {
    const x = randInt(1234, 9876), y = randInt(11, 99), a = x * y;
    const yt = Math.floor(y / 10) * 10, yo = y % 10;
    return {
      prompt: `${x} x ${y} = ?`, answer: String(a),
      hint: `Multiply by ${yt}, then by ${yo}, then add.`,
      explain: `${x} x ${yt} = ${x * yt} and ${x} x ${yo} = ${x * yo}. Add: ${a}.`,
    };
  }
  // decimal x whole: one or two decimal places
  const places = pick([1, 1, 2]);
  let scaled;
  do { scaled = places === 1 ? randInt(3, 99) : randInt(101, 999); } while (scaled % 10 === 0);
  const w = randInt(2, 9);
  const prod = scaled * w;
  const ds = dec(scaled, places), a = dec(prod, places);
  const aFull = (prod / 10 ** places).toFixed(places); // e.g. 48.0, so the child sees the place being counted
  const [x, y] = Math.random() < 0.5 ? [ds, w] : [w, ds];
  const q = {
    prompt: `${x} x ${y} = ?`, answer: a,
    hint: `Multiply as whole numbers, then count ${places} decimal place${places > 1 ? 's' : ''}.`,
    explain: `${scaled} x ${w} = ${prod}. ${ds} has ${places} decimal place${places > 1 ? 's' : ''}, so ${eq(aFull, a)}.`,
    wrongTags: { [dec(prod, places + 1)]: 'decimal-place', [dec(prod, places - 1)]: 'decimal-place' },
  };
  if (t === 3) { q.choices = mkChoices(a, [dec(prod, places + 1), dec(prod, places - 1), String(prod)], () => dec(randInt(10, 999), places)); q.wrongTags = wt(a, q.wrongTags); }
  return q;
}

function L9() {
  const t = randInt(0, 3);
  if (t === 0) {
    const x = randInt(2, 9), y = randInt(2, 9), p = x * y; // 0.x * 0.y
    const a = dec(p, 2);
    return {
      prompt: `0.${x} x 0.${y} = ?`, answer: a,
      choices: mkChoices(a, [dec(p, 1), String(p), dec(p, 3)], () => dec(randInt(2, 90), 2)),
      hint: 'Tenths times tenths gives hundredths.',
      explain: `${x} x ${y} = ${p}, and tenths x tenths = hundredths, so ${a}.`,
      wrongTags: wt(a, { [dec(p, 1)]: 'decimal-place', [String(p)]: 'decimal-place' }),
    };
  }
  if (t === 1) {
    let x; do { x = randInt(11, 49); } while (x % 10 === 0); // e.g. 1.2 x 0.5
    const y = randInt(2, 9), p = x * y;
    const a = dec(p, 2);
    const aFull = (p / 100).toFixed(2);
    return {
      prompt: `${dec(x, 1)} x 0.${y} = ?`, answer: a,
      hint: 'Multiply as whole numbers, then count two decimal places.',
      explain: `${x} x ${y} = ${p}. Two decimal places in total, so ${eq(aFull, a)}.`,
      wrongTags: { [dec(p, 1)]: 'decimal-place' },
    };
  }
  if (t === 2) {
    const w = randInt(2, 9), [n, d] = properFrac(2, 8);
    const a = frac(w * n, d);
    const [x, y] = Math.random() < 0.5 ? [`${w}`, `${n}/${d}`] : [`${n}/${d}`, `${w}`];
    return {
      prompt: `${x} x ${y} = ? (fraction or whole number)`, answer: a,
      hint: `Multiply the top by ${w}; the bottom stays ${d}.`,
      explain: `${w} x ${n}/${d} = ${eq(`${w * n}/${d}`, a)}.`,
    };
  }
  const [n1, d1] = properFrac(2, 6), [n2, d2] = properFrac(2, 6);
  const a = frac(n1 * n2, d1 * d2);
  return {
    prompt: `${n1}/${d1} x ${n2}/${d2} = ?`, answer: a,
    hint: 'Multiply the tops, multiply the bottoms, then simplify.',
    explain: `Tops: ${n1} x ${n2} = ${n1 * n2}. Bottoms: ${d1} x ${d2} = ${d1 * d2}. ${eq(`${n1 * n2}/${d1 * d2}`, a)}.`,
  };
}

function mixed(whole, n, d) { return `${whole} ${n}/${d}`; }

function L10() {
  const t = randInt(0, 4);
  if (t === 0) {
    let x = randInt(2, 12), y = randInt(2, 12);
    const negX = Math.random() < 0.7, negY = Math.random() < 0.5;
    if (negX) x = -x; if (negY) y = -y;
    if (x > 0 && y > 0) x = -x;
    const a = x * y;
    const sx = x < 0 ? `(${x})` : `${x}`, sy = y < 0 ? `(${y})` : `${y}`;
    const q = {
      prompt: `${sx} x ${sy} = ?`, answer: String(a),
      hint: 'Same signs give a positive, different signs give a negative.',
      explain: `${Math.abs(x)} x ${Math.abs(y)} = ${Math.abs(a)}; ${x < 0 && y < 0 ? 'two negatives make a positive' : 'one negative makes the answer negative'}, so ${a}.`,
      wrongTags: { [-a]: 'sign-error' },
    };
    if (Math.random() < 0.5) { q.choices = mkChoices(a, [-a, a + (a > 0 ? 1 : -1) * Math.abs(x), -(a + Math.abs(x))], () => randInt(-144, 144)); q.wrongTags = wt(a, { [-a]: 'sign-error' }); }
    return q;
  }
  if (t === 1) {
    const w1 = randInt(1, 3), d1 = pick([2, 3, 4]), n1 = d1 === 4 ? pick([1, 3]) : randInt(1, d1 - 1);
    const w2 = randInt(1, 3), d2 = pick([2, 3, 4, 5]), n2 = d2 === 4 ? pick([1, 3]) : randInt(1, d2 - 1);
    const top1 = w1 * d1 + n1, top2 = w2 * d2 + n2;
    const a = frac(top1 * top2, d1 * d2);
    return {
      prompt: `${mixed(w1, n1, d1)} x ${mixed(w2, n2, d2)} = ? (improper fraction or whole number)`, answer: a,
      hint: 'Change each mixed number to an improper fraction first.',
      explain: `${mixed(w1, n1, d1)} = ${top1}/${d1} and ${mixed(w2, n2, d2)} = ${top2}/${d2}. ${top1} x ${top2} = ${top1 * top2}, ${d1} x ${d2} = ${d1 * d2}, so ${a}.`,
    };
  }
  if (t === 2) {
    const b = pick([2, 2, 3, 4, 5, 10]), e = b === 2 ? randInt(3, 7) : b === 10 ? randInt(2, 5) : randInt(2, 3);
    const a = b ** e;
    return {
      prompt: `${b}^${e} = ?`, answer: String(a),
      choices: mkChoices(a, [b * e, b ** (e - 1), b ** e + b], () => randInt(4, 200)),
      hint: `${b}^${e} means ${b} multiplied by itself ${e} times.`,
      explain: `${b}^${e} = ${Array(e).fill(b).join(' x ')} = ${a}.`,
      wrongTags: wt(a, { [b * e]: 'base-times-exponent' }),
    };
  }
  if (t === 3) {
    const by = pick([25, 50]);
    const n = by === 25 ? 4 * randInt(3, 24) : 2 * randInt(6, 49);
    const a = n * by;
    return {
      prompt: `${n} x ${by} = ?`, answer: String(a),
      hint: by === 25 ? 'Four 25s make 100.' : 'Two 50s make 100.',
      explain: by === 25 ? `${n} x 25: ${n} / 4 = ${n / 4}, and ${n / 4} x 100 = ${a}.` : `${n} x 50: ${n} / 2 = ${n / 2}, and ${n / 2} x 100 = ${a}.`,
    };
  }
  const n = randInt(12, 89), a = n * 99;
  return {
    prompt: `${n} x 99 = ?`, answer: String(a),
    hint: '99 is 100 take away 1.',
    explain: `${n} x 100 = ${n * 100}, take away ${n}: ${a}.`,
  };
}

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'mul', name: 'Multiplication', emoji: '✖️', group: 'number',
  start: { 1: 1, 3: 2, 4: 4 },
  unlock: { skill: 'add', level: 3 },
  gen(level) {
    const q = LEVELS[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) { delete q.wrongTags[String(q.answer)]; if (!Object.keys(q.wrongTags).length) delete q.wrongTags; }
    return q;
  },
};
