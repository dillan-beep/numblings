// Division ladder (curriculum A5).
import { randInt, pick, shuffle } from '../rng.js';

const NAMES = ['Jack', 'Luke', 'Madelyn', 'Ava', 'Noah', 'Mia', 'Leo', 'Zoe'];
const THINGS = ['cookies', 'stickers', 'marbles', 'grapes', 'cards', 'blocks'];

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function frac(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}`; }
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
// a fraction n/d in lowest terms with n !== d
function simpleFrac(maxN, minD, maxD) {
  let n, d;
  do { n = randInt(1, maxN); d = randInt(minD, maxD); } while (gcd(n, d) !== 1 || n === d);
  return [n, d];
}
const eq = (raw, simplified) => (raw === simplified ? raw : `${raw} = ${simplified}`);
function wt(answer, obj) {
  const out = {};
  for (const k of Object.keys(obj)) if (k !== String(answer)) out[k] = obj[k];
  return out;
}

function L1() {
  const g = pick([2, 3]);
  const each = randInt(2, g === 2 ? 6 : 4);
  const total = g * each;
  const name = pick(NAMES), thing = pick(THINGS);
  const t = randInt(0, 2);
  if (t === 0) return {
    prompt: `Share ${total} ${thing} equally between ${g} friends. How many each?`, answer: String(each),
    visual: { type: 'counters', count: total },
    choices: mkChoices(each, [total, g, each + 1], () => randInt(1, 8)),
    hint: 'Deal them out one at a time until they are all gone.',
    explain: `${total} ${thing} into ${g} equal groups: ${Array(g).fill(each).join(' + ')} = ${total}, so ${each} each.`,
    wrongTags: wt(each, { [total]: 'did-not-share', [g]: 'count-groups' }),
  };
  if (t === 1) return {
    prompt: `${name} puts ${total} ${thing} into ${g} equal rows. How many in each row?`, answer: String(each),
    visual: { type: 'array', rows: g, cols: each },
    choices: mkChoices(each, [total, g, each - 1], () => randInt(1, 8)),
    hint: `Count one row.`,
    explain: `${g} rows of ${each} make ${total}, so each row has ${each}.`,
    wrongTags: wt(each, { [total]: 'did-not-share', [g]: 'count-groups' }),
  };
  return {
    prompt: `${total} ÷ ${g} = ?`, answer: String(each),
    visual: { type: 'counters', count: total },
    choices: mkChoices(each, [total, g, each + 1], () => randInt(1, 8)),
    hint: `Split ${total} into ${g} equal groups.`,
    explain: `${g} groups of ${each} make ${total}, so ${total} ÷ ${g} = ${each}.`,
    wrongTags: wt(each, { [total]: 'did-not-share', [g]: 'count-groups' }),
  };
}

function L2() {
  const t = randInt(0, 3);
  if (t === 0) {
    const d = pick([2, 2, 3, 4, 5]), q = randInt(2, Math.floor(20 / d)), total = d * q;
    return {
      prompt: `${total} ÷ ${d} = ?`, answer: String(q),
      visual: { type: 'array', rows: d, cols: q },
      hint: `How many in each of ${d} equal groups?`,
      explain: `${d} groups of ${q} make ${total}, so ${total} ÷ ${d} = ${q}.`,
      wrongTags: { [total]: 'did-not-share' },
    };
  }
  if (t === 1) {
    const q = randInt(2, 10), total = 2 * q;
    return {
      prompt: `How many pairs can you make from ${total}?`, answer: String(q),
      visual: { type: 'counters', count: total },
      choices: mkChoices(q, [total, q + 1, q - 1], () => randInt(1, 10)),
      hint: 'A pair is a group of 2.',
      explain: `Count by 2s to ${total}: that takes ${q} jumps, so ${q} pairs.`,
      wrongTags: wt(q, { [total]: 'did-not-group' }),
    };
  }
  if (t === 2) {
    const q = randInt(1, 10), total = 2 * q;
    return {
      prompt: `What is half of ${total}?`, answer: String(q),
      hint: 'Half means 2 equal shares.',
      explain: `${q} + ${q} = ${total}, so half of ${total} is ${q}.`,
    };
  }
  const size = pick([2, 3, 4, 5]), groups = randInt(2, Math.floor(20 / size)), total = size * groups;
  const thing = pick(THINGS);
  return {
    prompt: `${total} ${thing} go into bags of ${size}. How many bags?`, answer: String(groups),
    visual: { type: 'array', rows: groups, cols: size },
    hint: `Count by ${size}s up to ${total}.`,
    explain: `${Array.from({ length: groups }, (_, i) => size * (i + 1)).join(', ')}: ${groups} bags.`,
    wrongTags: { [size]: 'confused-share-group' },
  };
}

function L3() {
  const d = pick([2, 5, 10]);
  let q; do { q = randInt(2, 10); } while (q === d); // avoid "If 2 x 2 = 4, what is 4 ÷ 2?"
  const total = d * q;
  const t = randInt(0, 4);
  if (t === 0) return {
    prompt: `${total} ÷ ${d} = ?`, answer: String(q),
    hint: `Think: __ x ${d} = ${total}.`,
    explain: `${q} x ${d} = ${total}, so ${total} ÷ ${d} = ${q}.`,
  };
  if (t === 1) return {
    prompt: `__ x ${d} = ${total}`, answer: String(q),
    hint: `This is the same as ${total} ÷ ${d}.`,
    explain: `${total} ÷ ${d} = ${q}, so ${q} x ${d} = ${total}.`,
  };
  if (t === 2) return {
    prompt: `If ${q} x ${d} = ${total}, what is ${total} ÷ ${q}?`, answer: String(d),
    hint: 'Division undoes multiplication. Use the fact family.',
    explain: `${q} x ${d} = ${total} means ${total} ÷ ${q} = ${d} and ${total} ÷ ${d} = ${q}.`,
  };
  if (t === 3) return {
    prompt: `${total} ÷ ${q} = ?`, answer: String(d),
    hint: `How many ${q}s make ${total}?`,
    explain: `${q} x ${d} = ${total}, so ${total} ÷ ${q} = ${d}.`,
  };
  return {
    prompt: `Which one is true?`, answer: `${total} ÷ ${d} = ${q}`,
    choices: shuffle([`${total} ÷ ${d} = ${q}`, `${d} ÷ ${total} = ${q}`, `${total} ÷ ${q} = ${total}`]),
    hint: 'The big number (the total) goes first in division.',
    explain: `${total} split into ${d}s gives ${q}. You cannot swap the numbers in division.`,
    wrongTags: { [`${d} ÷ ${total} = ${q}`]: 'div-commutative', [`${total} ÷ ${q} = ${total}`]: 'div-commutative' },
  };
}

function L4() {
  const t = randInt(0, 5);
  if (t <= 1) {
    const d = randInt(2, 10), q = randInt(2, 10), total = d * q;
    return {
      prompt: `${total} ÷ ${d} = ?`, answer: String(q),
      hint: `Think: ${d} x __ = ${total}.`,
      explain: `${d} x ${q} = ${total}, so ${total} ÷ ${d} = ${q}.`,
    };
  }
  if (t === 2) {
    const d = randInt(2, 10), q = randInt(2, 10), total = d * q;
    return {
      prompt: `${total} ÷ __ = ${q}`, answer: String(d),
      hint: `${q} x __ = ${total}.`,
      explain: `${q} x ${d} = ${total}, so ${total} ÷ ${d} = ${q}.`,
    };
  }
  if (t === 3) {
    const n = randInt(2, 12);
    return {
      prompt: `${n} ÷ 1 = ?`, answer: String(n),
      choices: mkChoices(n, [1, 0, n + 1], () => randInt(2, 12)),
      hint: `${n} shared into 1 group.`,
      explain: `One group gets everything: ${n} ÷ 1 = ${n}.`,
      wrongTags: { '1': 'n-div-1', '0': 'n-div-1' },
    };
  }
  if (t === 4) {
    const n = randInt(2, 12);
    return {
      prompt: `0 ÷ ${n} = ?`, answer: '0',
      choices: mkChoices(0, [n, 1, n + 1], () => randInt(2, 12)),
      hint: 'Nothing to share.',
      explain: `Zero shared into ${n} groups is still zero: 0 ÷ ${n} = 0.`,
      wrongTags: { [n]: 'zero-div-n', '1': 'zero-div-n' },
    };
  }
  const n = randInt(2, 12);
  return {
    prompt: `What is ${n} ÷ 0?`, answer: 'cannot be done',
    choices: shuffle(['cannot be done', '0', String(n), '1']),
    hint: 'How many groups of 0 would it take to make the total?',
    explain: `No number times 0 can make ${n}, so dividing by 0 cannot be done.`,
    wrongTags: { '0': 'div-by-zero', [n]: 'div-by-zero', '1': 'div-by-zero' },
  };
}

function L5() {
  const d = randInt(3, 9), r = randInt(1, d - 1), q = randInt(3, Math.floor((100 - r) / d)), total = d * q + r; // total <= 100
  const t = randInt(0, 4);
  const strat = `${d} x ${q} = ${d * q}, and ${total} - ${d * q} = ${r}`;
  if (t === 0) return {
    prompt: `${total} ÷ ${d} = ?`, answer: `${q} R${r}`,
    choices: mkChoices(`${q} R${r}`, [`${q}`, `${q - 1} R${r + d}`, `${q + 1} R${r}`, `${q} R${r + 1}`], null),
    hint: `How many ${d}s fit in ${total}? What is left over?`,
    explain: `${strat}, so ${total} ÷ ${d} = ${q} R${r}.`,
    wrongTags: { [`${q}`]: 'dropped-remainder', [`${q - 1} R${r + d}`]: 'remainder-too-big' },
  };
  if (t === 1) return {
    prompt: `What is the remainder when ${total} is divided by ${d}?`, answer: String(r),
    hint: `Find the biggest multiple of ${d} that fits in ${total}.`,
    explain: `${strat}. The remainder is ${r}.`,
    wrongTags: { [r + d]: 'remainder-too-big' },
  };
  if (t === 2) return {
    prompt: `${total} ÷ ${d}: how many whole ${d}s fit? (ignore the leftover)`, answer: String(q),
    hint: `Count by ${d}s without going past ${total}.`,
    explain: `${strat}. So ${q} whole groups with ${r} left over.`,
  };
  const thing = pick(['pencils', 'eggs', 'muffins', 'stickers']);
  const Thing = thing[0].toUpperCase() + thing.slice(1);
  if (t === 3) return {
    prompt: `${Thing} come in packs of ${d}. ${total} ${thing} make how many full packs?`, answer: String(q),
    hint: 'Full packs only; the leftovers do not count.',
    explain: `${strat}. ${q} full packs and ${r} left over.`,
    wrongTags: { [q + 1]: 'rounded-up-remainder' },
  };
  return {
    prompt: `${Thing} come in packs of ${d}. With ${total} ${thing}, how many are left over?`, answer: String(r),
    hint: `${q} full packs use ${d * q}.`,
    explain: `${strat}. ${r} ${r === 1 ? 'is' : 'are'} left over.`,
  };
}

function L6() {
  const t = randInt(0, 4);
  if (t === 0 || t === 1) {
    const d = randInt(3, 9);
    // sometimes force a zero in the middle of the quotient (e.g. 102); keep the dividend 3-digit
    const q = t === 1 ? randInt(1, Math.floor(9 / d)) * 100 + randInt(1, 9) : randInt(12, Math.floor(999 / d));
    const total = q * d;
    const missing = Number(String(q).replace('0', ''));
    const parts = [Math.floor(q / 100) * 100, Math.floor((q % 100) / 10) * 10, q % 10];
    while (parts.length > 1 && parts[0] === 0) parts.shift(); // no "0 x d" line for a 2-digit quotient
    return {
      prompt: `${total} ÷ ${d} = ?`, answer: String(q),
      hint: q >= 100 ? 'Divide the hundreds, then the tens, then the ones.' : 'Divide the tens, then the ones.',
      explain: `${total} ÷ ${d}: ${parts.map((p) => `${p} x ${d} = ${p * d}`).join(', ')}. Quotient ${q}.`,
      wrongTags: wt(q, { [missing]: 'missing-zero' }),
    };
  }
  if (t === 2) {
    const d = randInt(3, 9), q = randInt(12, Math.floor(999 / d)), r = randInt(1, d - 1), total = q * d + r;
    return {
      prompt: `${total} ÷ ${d} = ?`, answer: `${q} R${r}`,
      choices: mkChoices(`${q} R${r}`, [`${q}`, `${q - 1} R${r + d}`, `${q + 1} R${r}`], null),
      hint: `Biggest multiple of ${d} under ${total}, then the leftover.`,
      explain: `${d} x ${q} = ${d * q}, and ${total} - ${d * q} = ${r}. So ${q} R${r}.`,
      wrongTags: { [`${q}`]: 'dropped-remainder', [`${q - 1} R${r + d}`]: 'remainder-too-big' },
    };
  }
  if (t === 3) {
    const per = pick([20, 24, 30, 40, 48, 50]), q = randInt(2, 8), r = randInt(1, per - 1), kids = per * q + r;
    return {
      prompt: `Buses hold ${per}. How many buses do ${kids} kids need?`, answer: String(q + 1),
      choices: mkChoices(q + 1, [q, r, q + 2], null),
      hint: 'Everyone needs a seat, even the leftovers.',
      explain: `${kids} ÷ ${per} = ${q} R${r}. The ${r} extra kids need one more bus: ${q + 1}.`,
      wrongTags: wt(q + 1, { [q]: 'ignored-remainder' }),
    };
  }
  const price = randInt(3, 9), q = randInt(12, 99), r = randInt(1, price - 1), money = price * q + r;
  return {
    prompt: `Pens cost ${price} dollars each. With ${money} dollars, how many pens can you buy?`, answer: String(q),
    choices: mkChoices(q, [q + 1, r, q - 1], null),
    hint: 'You cannot buy part of a pen.',
    explain: `${money} ÷ ${price} = ${q} R${r}. The leftover ${r} dollar${r === 1 ? '' : 's'} is not enough for another pen, so ${q}.`,
    wrongTags: wt(q, { [q + 1]: 'rounded-up-remainder' }),
  };
}

function L7() {
  const t = randInt(0, 4);
  if (t === 0) {
    const p = pick([10, 100, 1000]), q = randInt(2, 99), total = q * p;
    return {
      prompt: `${total} ÷ ${p} = ?`, answer: String(q),
      hint: `Dividing by ${p} moves each digit ${String(p).length - 1} place${p > 10 ? 's' : ''} to the right.`,
      explain: `${total} ÷ ${p}: take off ${String(p).length - 1} zero${p > 10 ? 's' : ''}: ${q}.`,
      wrongTags: { [q * 10]: 'wrong-zero-count', [q / 10]: 'wrong-zero-count' },
    };
  }
  if (t === 1) {
    const d = pick([20, 30, 40, 50, 60, 70, 80, 90]), q = randInt(2, 12), total = d * q;
    return {
      prompt: `${total} ÷ ${d} = ?`, answer: String(q),
      hint: `${total} ÷ ${d} is the same as ${total / 10} ÷ ${d / 10}.`,
      explain: `Take a zero off both: ${total / 10} ÷ ${d / 10} = ${q}.`,
      wrongTags: { [q * 10]: 'removed-zero-from-wrong-number' },
    };
  }
  if (t === 2) {
    const q = randInt(3, 99), p = pick([10, 100]), total = q * p;
    return {
      prompt: `__ ÷ ${p} = ${q}`, answer: String(total),
      hint: `Multiply ${q} by ${p} to find the starting number.`,
      explain: `${q} x ${p} = ${total}, so ${total} ÷ ${p} = ${q}.`,
    };
  }
  const rule = pick([2, 3, 5, 9, 10]);
  const n = randInt(101, 999);
  const yes = n % rule === 0;
  const digits = String(n).split('').map(Number), sum = digits.reduce((s, x) => s + x, 0);
  const why = rule === 2 ? `The last digit is ${n % 10}, which is ${n % 2 === 0 ? 'even' : 'odd'}.`
    : rule === 5 ? `The last digit is ${n % 10}; it must be 0 or 5.`
      : rule === 10 ? `The last digit is ${n % 10}; it must be 0.`
        : `Digit sum ${digits.join(' + ')} = ${sum}, which ${yes ? 'is' : 'is not'} divisible by ${rule}.`;
  return {
    prompt: `Is ${n} divisible by ${rule}?`, answer: yes ? 'yes' : 'no',
    choices: ['yes', 'no'],
    hint: rule === 3 || rule === 9 ? 'Add up the digits.' : 'Look at the last digit.',
    explain: `${why} So ${n} is ${yes ? '' : 'not '}divisible by ${rule}.`,
    wrongTags: { [yes ? 'no' : 'yes']: 'divisibility-rule' },
  };
}

function L8() {
  const t = randInt(0, 4);
  if (t === 0 || t === 1) {
    const d = randInt(11, 49), q = randInt(12, 99), total = d * q;
    const q10 = Math.floor(q / 10) * 10;
    return {
      prompt: `${total} ÷ ${d} = ?`, answer: String(q),
      hint: `Estimate: ${total} is close to ${d} x ${q10}.`,
      explain: `${d} x ${q10} = ${d * q10}, leaving ${total - d * q10}. ${d} x ${q % 10} = ${d * (q % 10)}. Quotient ${q}.`,
    };
  }
  if (t === 2) {
    const places = pick([1, 2]);
    const d = randInt(2, 9);
    let q, scaled;
    do { q = places === 1 ? randInt(3, 99) : randInt(101, 999); scaled = q * d; } while (scaled % 10 === 0); // dividend must really be a decimal
    const sd = dec(scaled, places), a = dec(q, places);
    return {
      prompt: `${sd} ÷ ${d} = ?`, answer: a,
      hint: 'Divide as whole numbers; the decimal point stays in the same place.',
      explain: `${scaled} ÷ ${d} = ${q}. Keep ${places} decimal place${places > 1 ? 's' : ''}: ${a}.`,
      wrongTags: { [dec(q, places - 1)]: 'decimal-place', [dec(q, places + 1)]: 'decimal-place' },
    };
  }
  if (t === 3) {
    let n, d;
    do { d = randInt(2, 10); n = randInt(1, d - 1); } while (gcd(n, d) !== 1); // proper, so the answer really is a fraction
    const a = frac(n, d);
    return {
      prompt: `Write ${n} ÷ ${d} as a fraction.`, answer: a,
      hint: 'Dividing by a number puts it on the bottom.',
      explain: `${n} ÷ ${d} = ${n}/${d}${a === `${n}/${d}` ? '' : ` = ${a}`}.`,
      wrongTags: { [`${d}/${n}`]: 'inverted-fraction' },
    };
  }
  const d = randInt(11, 49), q = randInt(12, 99), r = randInt(1, d - 1), total = d * q + r;
  return {
    prompt: `What is the remainder of ${total} ÷ ${d}?`, answer: String(r),
    hint: `Find ${d} x ${q} first.`,
    explain: `${d} x ${q} = ${d * q}, and ${total} - ${d * q} = ${r}.`,
  };
}

function L9() {
  const t = randInt(0, 4);
  if (t === 0) {
    const d = randInt(2, 9), q = randInt(2, 12), scaled = d * q; // e.g. 4.8 ÷ 0.6 = 8
    return {
      prompt: `${dec(scaled, 1)} ÷ 0.${d} = ?`, answer: String(q),
      hint: 'Multiply both numbers by 10 first.',
      explain: `${dec(scaled, 1)} ÷ 0.${d} is the same as ${scaled} ÷ ${d} = ${q}.`,
      wrongTags: { [dec(q, 1)]: 'decimal-place' },
    };
  }
  if (t === 1) {
    const d = randInt(2, 9), q = randInt(11, 99), scaled = d * q; // e.g. 7.2 ÷ 0.3 = 24, or 1.44 ÷ 0.6
    const a = dec(q, 1);
    return {
      prompt: `${dec(scaled, 2)} ÷ 0.${d} = ?`, answer: a,
      hint: 'Multiply both by 10 so you divide by a whole number.',
      explain: `${dec(scaled, 2)} ÷ 0.${d} = ${dec(scaled, 1)} ÷ ${d} = ${a}.`,
      wrongTags: { [String(q)]: 'decimal-place', [dec(q, 2)]: 'decimal-place' },
    };
  }
  if (t === 2) {
    const w = randInt(2, 9), d = randInt(2, 6), a = w * d;
    return {
      prompt: `${w} ÷ 1/${d} = ?`, answer: String(a),
      choices: mkChoices(a, [frac(w, d), w, a + d], () => randInt(2, 60)),
      hint: `How many ${['', '', 'halves', 'thirds', 'quarters', 'fifths', 'sixths'][d]} fit in ${w}?`,
      explain: `Each whole has ${d} pieces of size 1/${d}, so ${w} wholes have ${w} x ${d} = ${a}.`,
      wrongTags: wt(a, { [frac(w, d)]: 'division-makes-smaller', [w]: 'division-makes-smaller' }),
    };
  }
  if (t === 3) {
    const d = randInt(2, 6), w = randInt(2, 9), a = frac(1, d * w);
    return {
      prompt: `1/${d} ÷ ${w} = ?`, answer: a,
      hint: `Cut each ${d === 2 ? 'half' : 'piece'} into ${w} smaller pieces.`,
      explain: `1/${d} split into ${w} equal parts: multiply the bottom by ${w}: 1/${d * w}.`,
      wrongTags: { [frac(w, d)]: 'inverted-wrong-fraction' },
    };
  }
  let d; do { d = randInt(11, 25); } while (d % 10 === 0); // divisor must really be a decimal
  const q = randInt(2, 9), scaled = d * q;
  const dd = dec(d, 1), sd = dec(scaled, 1); // e.g. 4.8 ÷ 1.2 = 4
  return {
    prompt: `${sd} ÷ ${dd} = ?`, answer: String(q),
    hint: 'Multiply both by 10 first.',
    explain: `${sd} ÷ ${dd} is the same as ${scaled} ÷ ${d} = ${q}.`,
    wrongTags: { [dec(q, 1)]: 'decimal-place' },
  };
}

function L10() {
  const t = randInt(0, 4);
  if (t === 0) {
    let d = randInt(2, 12), q = randInt(2, 12);
    const negD = Math.random() < 0.5, negQ = Math.random() < 0.6;
    if (negD) d = -d; if (negQ) q = -q;
    if (d > 0 && q > 0) q = -q;
    const total = d * q;
    const sd = d < 0 ? `(${d})` : `${d}`;
    const qq = {
      prompt: `${total} ÷ ${sd} = ?`, answer: String(q),
      hint: 'Same signs give a positive; different signs give a negative.',
      explain: `${Math.abs(total)} ÷ ${Math.abs(d)} = ${Math.abs(q)}; ${total < 0 !== d < 0 ? 'the signs differ, so' : 'the signs match, so'} ${q}.`,
      wrongTags: { [-q]: 'sign-error' },
    };
    if (Math.random() < 0.5) { qq.choices = mkChoices(q, [-q, q + 1, -(q + 1)], () => randInt(-12, 12)); qq.wrongTags = wt(q, { [-q]: 'sign-error' }); }
    return qq;
  }
  if (t === 1) {
    const [n1, d1] = simpleFrac(5, 2, 6), [n2, d2] = simpleFrac(5, 2, 6);
    const a = frac(n1 * d2, d1 * n2);
    return {
      prompt: `${n1}/${d1} ÷ ${n2}/${d2} = ?`, answer: a,
      hint: 'Keep the first, flip the second, multiply.',
      explain: `${n1}/${d1} x ${d2}/${n2} = ${eq(`${n1 * d2}/${d1 * n2}`, a)}.`,
      wrongTags: { [frac(d1 * n2, n1 * d2)]: 'inverted-wrong-fraction', [frac(n1 * n2, d1 * d2)]: 'forgot-to-flip' },
    };
  }
  if (t === 2) {
    const k = randInt(4, 6), mean = randInt(3, 12);
    const vals = [];
    let sum = 0;
    for (let i = 0; i < k - 1; i++) { const v = randInt(Math.max(1, mean - 5), mean + 5); vals.push(v); sum += v; }
    const last = mean * k - sum;
    if (last < 0 || last > 30) return L10();
    vals.push(last);
    const list = shuffle(vals);
    return {
      prompt: `Find the mean of ${list.join(', ')}.`, answer: String(mean),
      hint: 'Add them all, then divide by how many there are.',
      explain: `Sum ${list.join(' + ')} = ${mean * k}; ${mean * k} ÷ ${k} = ${mean}.`,
    };
  }
  if (t === 3) {
    const kg = randInt(2, 8);
    const perCents = pick([150, 175, 200, 225, 240, 250, 275, 300, 325, 350, 375, 400]);
    const totalCents = kg * perCents;
    const a = dec(perCents, 2);
    const money = `$${(totalCents / 100).toFixed(2)}`, per = `$${(perCents / 100).toFixed(2)}`;
    return {
      prompt: `${money} for ${kg} kg of apples. What is the price per kg?`, answer: a,
      hint: `Divide the total cost by ${kg}.`,
      explain: `${money} ÷ ${kg} = ${per} per kg.`,
    };
  }
  const w = randInt(2, 6), [n, d] = simpleFrac(7, 2, 8);
  // whole ÷ fraction, e.g. 6 ÷ 3/4 = 8
  const a = frac(w * d, n);
  return {
    prompt: `${w} ÷ ${n}/${d} = ?`, answer: a,
    hint: 'Multiply by the flipped fraction.',
    explain: `${w} x ${d}/${n} = ${eq(`${w * d}/${n}`, a)}.`,
    wrongTags: { [frac(w * n, d)]: 'inverted-wrong-fraction' },
  };
}

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'div', name: 'Division', emoji: '➗', group: 'number',
  start: { 1: 1, 3: 1, 4: 3 },
  unlock: { skill: 'mul', level: 3 },
  gen(level) {
    const q = LEVELS[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) { delete q.wrongTags[String(q.answer)]; if (!Object.keys(q.wrongTags).length) delete q.wrongTags; }
    return q;
  },
};
