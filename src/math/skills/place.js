// Place value and rounding ladder (curriculum A6).
import { randInt, pick, shuffle } from '../rng.js';

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
function wt(answer, obj) {
  const out = {};
  for (const k of Object.keys(obj)) if (k !== String(answer)) out[k] = obj[k];
  return out;
}
const roundTo = (n, place) => Math.round(n / place) * place;
const PLACE_NAMES = { 1: 'ones', 10: 'tens', 100: 'hundreds', 1000: 'thousands', 10000: 'ten thousands', 100000: 'hundred thousands' };

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function words999(n) {
  const parts = [];
  if (n >= 100) { parts.push(`${ONES[Math.floor(n / 100)]} hundred`); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '')); }
  else if (n > 0) parts.push(ONES[n]);
  return parts.join(' ');
}
function words(n) {
  if (n === 0) return 'zero';
  const parts = [];
  if (n >= 1000) { parts.push(`${words999(Math.floor(n / 1000))} thousand`); n %= 1000; }
  if (n > 0) parts.push(words999(n));
  return parts.join(' ');
}

function L1() {
  const ones = randInt(1, 9), n = 10 + ones;
  const t = randInt(0, 2);
  if (t === 0) return {
    prompt: `${n} is 1 ten and __ ones.`, answer: String(ones),
    visual: { type: 'base10', value: n },
    choices: mkChoices(ones, [n, 1, ones + 1], () => randInt(1, 9)),
    hint: 'Take away the ten; what is left?',
    explain: `${n} = 10 + ${ones}: 1 ten and ${ones} ones.`,
    wrongTags: wt(ones, { [n]: 'whole-not-part', '1': 'counted-the-ten' }),
  };
  if (t === 1) return {
    prompt: `What number is 1 ten and ${ones} ones?`, answer: String(n),
    choices: mkChoices(n, [ones * 10 + 1, Number(`10${ones}`), ones + 1], () => randInt(10, 19)),
    hint: 'Start at 10 and count on.',
    explain: `10 + ${ones} = ${n}.`,
    wrongTags: wt(n, { [ones * 10 + 1]: 'digit-reversal', [Number(`10${ones}`)]: 'concatenate', [ones + 1]: 'rod-as-one' }),
  };
  return {
    prompt: 'What number do the blocks show?', answer: String(n),
    visual: { type: 'base10', value: n },
    choices: mkChoices(n, [ones * 10 + 1, ones + 1, n + 1], () => randInt(10, 19)),
    hint: 'The long rod is 10. Count the small cubes.',
    explain: `One rod is 10, plus ${ones} cubes: ${n}.`,
    wrongTags: wt(n, { [ones * 10 + 1]: 'digit-reversal', [ones + 1]: 'rod-as-one' }),
  };
}

function L2() {
  const tens = randInt(1, 4), ones = randInt(0, 9), n = tens * 10 + ones;
  const t = randInt(0, 3);
  if (t === 0) return {
    prompt: `${n} = __ tens and ${ones} ones`, answer: String(tens),
    visual: { type: 'base10', value: n },
    hint: 'How many rods of 10?',
    explain: `${n} = ${tens * 10} + ${ones}: ${tens} tens and ${ones} ones.`,
    wrongTags: { [n]: 'whole-not-part', [ones]: 'wrong-digit' },
  };
  if (t === 1) {
    const o = ones || randInt(1, 9), nn = tens * 10 + o;
    return {
      prompt: `${tens * 10} + ${o} = ?`, answer: String(nn),
      hint: `${tens} tens and ${o} ones.`,
      explain: `${tens * 10} + ${o} = ${nn}.`,
      wrongTags: { [tens + o]: 'rod-as-one', [Number(`${tens * 10}${o}`)]: 'concatenate' },
    };
  }
  if (t === 2) return {
    prompt: 'What number do the blocks show?', answer: String(n),
    visual: { type: 'base10', value: n },
    choices: mkChoices(n, [tens + ones, ones * 10 + tens, n + 10], () => randInt(10, 50)),
    hint: 'Each rod is 10, each cube is 1.',
    explain: `${tens} rods = ${tens * 10}, plus ${ones} cubes = ${n}.`,
    wrongTags: wt(n, { [tens + ones]: 'rod-as-one', [ones * 10 + tens]: 'digit-reversal' }),
  };
  const o = ones || randInt(1, 9), nn = tens * 10 + o;
  return {
    prompt: `${nn} = ${tens} tens and __ ones`, answer: String(o),
    hint: 'Look at the last digit.',
    explain: `${nn} = ${tens * 10} + ${o}, so ${o} ones.`,
    wrongTags: { [tens]: 'wrong-digit' },
  };
}

function L3() {
  const t = randInt(0, 4);
  if (t === 0) {
    const n = randInt(11, 89);
    return {
      prompt: `What is 10 more than ${n}?`, answer: String(n + 10),
      hint: 'Only the tens digit changes.',
      explain: `${n} + 10 = ${n + 10}: the tens digit goes up by 1.`,
      wrongTags: { [n + 1]: 'added-one', [n + 100]: 'added-hundred' },
    };
  }
  if (t === 1) {
    const n = randInt(20, 99);
    return {
      prompt: `What is 10 less than ${n}?`, answer: String(n - 10),
      hint: 'Only the tens digit changes.',
      explain: `${n} - 10 = ${n - 10}: the tens digit goes down by 1.`,
      wrongTags: { [n - 1]: 'subtracted-one' },
    };
  }
  if (t === 2) {
    // compare where the ones digit misleads (e.g. 59 vs 61)
    const big = randInt(2, 9) * 10 + randInt(0, 5); // ones digit small
    const small = randInt(1, Math.floor(big / 10) - 1) * 10 + randInt(big % 10 + 1, 9); // smaller, but bigger ones digit
    const [x, y] = Math.random() < 0.5 ? [big, small] : [small, big];
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: String(big),
      choices: [String(x), String(y)],
      hint: 'Compare the tens digits first.',
      explain: `${big} has ${Math.floor(big / 10)} tens and ${small} has ${Math.floor(small / 10)} tens, so ${big} is bigger.`,
      wrongTags: { [small]: 'ones-first' },
    };
  }
  if (t === 3) {
    const tens = randInt(5, 9), ones = randInt(1, 9), n = tens * 10 + ones;
    return {
      prompt: `${tens * 10} + ${ones} = ?`, answer: String(n),
      hint: `${tens} tens and ${ones} ones.`,
      explain: `${tens * 10} + ${ones} = ${n}.`,
      wrongTags: { [tens + ones]: 'rod-as-one' },
    };
  }
  const n = randInt(51, 99);
  return {
    prompt: `How many tens are in ${n}?`, answer: String(Math.floor(n / 10)),
    visual: { type: 'base10', value: n },
    hint: 'The tens digit tells you.',
    explain: `${n} = ${Math.floor(n / 10) * 10} + ${n % 10}, so ${Math.floor(n / 10)} tens.`,
    wrongTags: { [n % 10]: 'wrong-digit' },
  };
}

function L4() {
  const t = randInt(0, 4);
  if (t === 0) {
    const h = randInt(1, 9), tn = randInt(0, 9), o = tn === 0 ? randInt(1, 9) : randInt(0, 9), n = h * 100 + tn * 10 + o;
    const parts = [`${h * 100}`, tn ? `${tn * 10}` : null, o ? `${o}` : null].filter(Boolean);
    return {
      prompt: `${parts.join(' + ')} = ?`, answer: String(n),
      hint: 'Hundreds, tens, ones.',
      explain: `${parts.join(' + ')} = ${n}.`,
      wrongTags: { [h + tn + o]: 'rod-as-one', [Number(parts.join(''))]: 'concatenate' },
    };
  }
  if (t === 1) {
    const n = randInt(12, 99) * 10;
    return {
      prompt: `How many tens are in ${n}?`, answer: String(n / 10),
      choices: mkChoices(n / 10, [Math.floor((n % 100) / 10), Math.floor(n / 100), n], () => randInt(10, 99)),
      hint: `${n} ÷ 10.`,
      explain: `${n / 10} tens make ${n} (${n / 10} x 10 = ${n}), not just the tens digit.`,
      wrongTags: wt(n / 10, { [Math.floor((n % 100) / 10)]: 'tens-digit-vs-count', [Math.floor(n / 100)]: 'tens-digit-vs-count' }),
    };
  }
  if (t === 2) {
    const k = randInt(11, 60);
    return {
      prompt: `${k} tens = ?`, answer: String(k * 10),
      hint: `${k} x 10.`,
      explain: `${k} tens is ${k} x 10 = ${k * 10}.`,
      wrongTags: { [k]: 'tens-digit-vs-count' },
    };
  }
  if (t === 3) {
    const h = randInt(1, 9), tn = randInt(1, 9), o = randInt(1, 9), n = h * 100 + tn * 10 + o;
    const place = pick([100, 10, 1]), digit = place === 100 ? h : place === 10 ? tn : o;
    return {
      prompt: `What is the value of the ${digit} in ${n}?`, answer: String(digit * place),
      choices: mkChoices(digit * place, [digit, digit * place * 10, digit * place / 10], () => randInt(1, 9) * pick([1, 10, 100])),
      hint: `Which place is the ${digit} in: hundreds, tens or ones?`,
      explain: `The ${digit} is in the ${PLACE_NAMES[place]} place, so it is worth ${digit} x ${place} = ${digit * place}.`,
      wrongTags: wt(digit * place, { [digit]: 'digit-not-value' }),
    };
  }
  const n = randInt(101, 999);
  return {
    prompt: 'What number do the blocks show?', answer: String(n),
    visual: { type: 'base10', value: n },
    hint: 'Flats are 100, rods are 10, cubes are 1.',
    explain: `${Math.floor(n / 100)} flats = ${Math.floor(n / 100) * 100}, ${Math.floor((n % 100) / 10)} rods = ${Math.floor((n % 100) / 10) * 10}, ${n % 10} cubes: ${n}.`,
  };
}

function L5() {
  const t = randInt(0, 3);
  if (t === 0) {
    let n; do { n = randInt(101, 999); } while (n % 10 === 0 || n % 10 === 5);
    const a = roundTo(n, 10), down = Math.floor(n / 10) * 10;
    const other = a === down ? down + 10 : down;
    const wrongDigit = Math.floor(n / 100) * 100 + (n % 10 >= 5 ? 10 : 0) + Math.floor((n % 100) / 10) * 10; // looked at tens digit instead
    return {
      prompt: `Round ${n} to the nearest 10.`, answer: String(a),
      visual: { type: 'numberline', min: down, max: down + 10, step: 1, highlight: n },
      choices: mkChoices(a, [other, roundTo(n, 100), wrongDigit], () => randInt(10, 99) * 10),
      hint: `Is ${n} closer to ${down} or ${down + 10}? Look at the ones digit.`,
      explain: `${n} is between ${down} and ${down + 10}. The ones digit is ${n % 10}, ${n % 10 >= 5 ? 'so round up' : 'so round down'}: ${a}.`,
      wrongTags: wt(a, { [other]: 'rounded-wrong-way', [roundTo(n, 100)]: 'wrong-place' }),
    };
  }
  if (t === 1) {
    let n; do { n = randInt(101, 999); } while (n % 100 === 0 || n % 100 === 50);
    const a = roundTo(n, 100), down = Math.floor(n / 100) * 100;
    const other = a === down ? down + 100 : down;
    return {
      prompt: `Round ${n} to the nearest 100.`, answer: String(a),
      visual: { type: 'numberline', min: down, max: down + 100, step: 10, highlight: n },
      hint: `Is ${n} closer to ${down} or ${down + 100}? Look at the tens digit.`,
      explain: `${n} is between ${down} and ${down + 100}. The tens digit is ${Math.floor((n % 100) / 10)}, ${n % 100 >= 50 ? 'so round up' : 'so round down'}: ${a}.`,
      wrongTags: { [other]: 'rounded-wrong-way', [roundTo(n, 10)]: 'wrong-place' },
    };
  }
  if (t === 2) {
    const n = randInt(11, 99) * 10 + randInt(1, 9);
    const a = roundTo(n, 100) || 100;
    if (n % 100 === 50) return L5();
    return {
      prompt: `Round ${n} to the nearest hundred.`, answer: String(a),
      hint: 'Look at the tens digit: 5 or more rounds up.',
      explain: `${n}: the tens digit is ${Math.floor((n % 100) / 10)}, so ${n % 100 >= 50 ? 'round up' : 'round down'} to ${a}.`,
    };
  }
  let x, y;
  do { x = randInt(101, 899); y = randInt(101, 899); } while (x % 100 === 50 || y % 100 === 50);
  const rx = roundTo(x, 100), ry = roundTo(y, 100);
  return {
    prompt: `Estimate ${x} + ${y} by rounding each number to the nearest 100.`, answer: String(rx + ry),
    hint: `${x} is about ${rx}.`,
    explain: `${x} rounds to ${rx} and ${y} rounds to ${ry}; ${rx} + ${ry} = ${rx + ry}.`,
    wrongTags: { [x + y]: 'exact-not-estimate' },
  };
}

function L6() {
  const t = randInt(0, 4);
  if (t === 0) {
    let n; do { n = randInt(1001, 9999); } while (n % 1000 === 0);
    const a = roundTo(n, 1000), down = Math.floor(n / 1000) * 1000;
    const other = a === down ? down + 1000 : down;
    const half = n % 1000 === 500;
    return {
      prompt: `Round ${n} to the nearest 1000.`, answer: String(a),
      choices: mkChoices(a, [other, roundTo(n, 100), roundTo(n, 10)], () => randInt(1, 10) * 1000),
      hint: 'Look at the hundreds digit: 5 or more rounds up.',
      explain: half ? `${n} is exactly halfway between ${down} and ${down + 1000}; halfway rounds up to ${a}.` : `${n} is between ${down} and ${down + 1000}; the hundreds digit is ${Math.floor((n % 1000) / 100)}, so ${a}.`,
      wrongTags: wt(a, { [other]: half ? 'halfway-down' : 'rounded-wrong-way', [roundTo(n, 100)]: 'wrong-place' }),
    };
  }
  if (t === 1) {
    const n = pick([2999, 3999, 4999, 5999, 6999, 7999, 8999, 9999, 1999, 2099, 4599, 7899]);
    return {
      prompt: `${n} + 1 = ?`, answer: String(n + 1),
      hint: 'All the 9s roll over to 0 and the next digit goes up.',
      explain: `${n} + 1 = ${n + 1}: the 9s become 0s and the next place goes up by 1.`,
      wrongTags: { [Number(String(n + 1).replace(/0/g, '')) || n + 1]: 'dropped-zeros' },
    };
  }
  if (t === 2) {
    const digits = shuffle([randInt(1, 9), randInt(1, 9), randInt(1, 9), randInt(0, 9)]);
    const d0 = randInt(1, 9), d1 = d0 === 9 ? randInt(1, 8) : randInt(d0 + 1, 9); // two different nonzero digits
    digits[0] = d0; digits[1] = d1;
    const a = Number(digits.join(''));
    const b = Number([digits[1], digits[0], ...digits.slice(2)].join(''));
    const big = Math.max(a, b), small = Math.min(a, b);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
    return {
      prompt: `Which is greater: ${x} or ${y}?`, answer: String(big),
      choices: [String(x), String(y)],
      hint: 'Compare from the left: thousands first.',
      explain: `Both have 4 digits; the first digit that differs decides: ${big} is greater than ${small}.`,
      wrongTags: { [small]: 'compared-wrong-place' },
    };
  }
  if (t === 3) {
    const n = randInt(1000, 9999);
    const place = pick([1000, 100, 10, 1]);
    const digit = Math.floor(n / place) % 10;
    return {
      prompt: `What digit is in the ${PLACE_NAMES[place]} place of ${n}?`, answer: String(digit),
      hint: 'From the right: ones, tens, hundreds, thousands.',
      explain: `${n} = ${String(n).split('').map((d, i) => `${d} x ${10 ** (3 - i)}`).join(' + ')}; the ${PLACE_NAMES[place]} digit is ${digit}.`,
    };
  }
  const th = randInt(1, 9), h = randInt(0, 9), tn = randInt(0, 9), o = h === 0 && tn === 0 ? randInt(1, 9) : randInt(0, 9), n = th * 1000 + h * 100 + tn * 10 + o;
  const parts = [`${th * 1000}`, h ? `${h * 100}` : null, tn ? `${tn * 10}` : null, o ? `${o}` : null].filter(Boolean);
  return {
    prompt: `${parts.join(' + ')} = ?`, answer: String(n),
    hint: 'Put each value in its place; use 0 for empty places.',
    explain: `${parts.join(' + ')} = ${n}.`,
    wrongTags: { [Number(parts.join(''))]: 'concatenate' },
  };
}

function L7() {
  const t = randInt(0, 4);
  if (t === 0) {
    const n = randInt(100000, 999999);
    const place = pick([100000, 10000, 1000, 100, 10]);
    let digit = Math.floor(n / place) % 10;
    if (digit === 0) return L7();
    return {
      prompt: `What is the value of the ${digit} in ${n}?`, answer: String(digit * place),
      choices: mkChoices(digit * place, [digit, digit * place / 10, digit * place * 10], () => randInt(1, 9) * pick([10, 100, 1000, 10000, 100000])),
      hint: `Count the places from the right.`,
      explain: `The ${digit} is in the ${PLACE_NAMES[place]} place: ${digit} x ${place} = ${digit * place}.`,
      wrongTags: wt(digit * place, { [digit]: 'digit-not-value', [digit * place / 10]: 'off-by-one-place' }),
    };
  }
  if (t === 1) {
    // numbers with an internal zero so placeholders matter
    const th = randInt(101, 999), rest = pick([20, 30, 40, 50, 70, 5, 8, 90, 205, 306, 40, 12]);
    const n = th * 1000 + rest;
    const w = words(n);
    const wrongs = [Number(`${th}${rest}`), th * 100 + rest, th * 10000 + rest].filter((x) => x !== n);
    return {
      prompt: `Which number is "${w}"?`, answer: String(n),
      choices: mkChoices(n, wrongs, () => randInt(100000, 999999)),
      hint: 'Thousands period, then the last three places. Use 0 for empty places.',
      explain: `${words999(th)} thousand is ${th} followed by three places: ${th} ${String(rest).padStart(3, '0')} = ${n}.`,
      wrongTags: wt(n, { [Number(`${th}${rest}`)]: 'missing-placeholder', [th * 100 + rest]: 'missing-placeholder' }),
    };
  }
  if (t === 2) {
    const n = pick([randInt(1000, 9999), randInt(10000, 99999), randInt(100000, 999999)]);
    const w = words(n);
    const wrongs = new Set();
    const digits = String(n);
    while (wrongs.size < 3) {
      const i = randInt(0, digits.length - 1);
      const d = String(randInt(0, 9));
      const alt = Number(digits.slice(0, i) + d + digits.slice(i + 1));
      if (alt !== n && alt >= 1000) wrongs.add(words(alt));
    }
    return {
      prompt: `How do you write ${n} in words?`, answer: w,
      choices: shuffle([w, ...wrongs]),
      hint: 'Say the thousands group, then the rest.',
      explain: `${n} is ${w}.`,
    };
  }
  if (t === 3) {
    const n = randInt(100000, 999999);
    const place = pick([100000, 10000, 1000]);
    const digit = Math.floor(n / place) % 10;
    return {
      prompt: `What digit is in the ${PLACE_NAMES[place]} place of ${n}?`, answer: String(digit),
      hint: 'The thousands period is the first three digits.',
      explain: `${n}: ${PLACE_NAMES[place]} place holds ${digit}.`,
    };
  }
  const n = randInt(1000, 999999);
  const r = pick([1000, 10000]);
  if (n % r === r / 2) return L7();
  return {
    prompt: `Round ${n} to the nearest ${r}.`, answer: String(roundTo(n, r)),
    hint: `Look at the digit to the right of the ${PLACE_NAMES[r]} place.`,
    explain: `${n} is between ${Math.floor(n / r) * r} and ${Math.floor(n / r) * r + r}; it is closer to ${roundTo(n, r)}.`,
    wrongTags: { [roundTo(n, r / 10)]: 'wrong-place' },
  };
}

function L8() {
  const t = randInt(0, 4);
  if (t === 0) {
    let v; do { v = randInt(101, 999); } while (v % 10 === 0 || v % 10 === 5); // hundredths scaled by 100
    const a = Math.round(v / 10); // tenths scaled by 10
    const n = dec(v, 2), ans = dec(a, 1);
    const down = Math.floor(v / 10);
    const other = a === down ? down + 1 : down;
    return {
      prompt: `Round ${n} to the nearest tenth.`, answer: ans,
      choices: mkChoices(ans, [dec(other, 1), dec(Math.round(v / 100), 0), n], () => dec(randInt(10, 99), 1)),
      hint: 'Look at the hundredths digit: 5 or more rounds up.',
      explain: `${n} is between ${dec(down, 1)} and ${dec(down + 1, 1)}. The hundredths digit is ${v % 10}, so ${ans}.`,
      wrongTags: wt(ans, { [dec(other, 1)]: 'rounded-wrong-way', [dec(Math.round(v / 100), 0)]: 'wrong-place' }),
    };
  }
  if (t === 1) {
    let v; do { v = randInt(101, 999); } while (v % 100 === 50 || v % 100 === 0);
    const n = dec(v, 2), ans = String(Math.round(v / 100));
    return {
      prompt: `Round ${n} to the nearest whole number.`, answer: ans,
      hint: 'Look at the tenths digit.',
      explain: `${n}: the tenths digit is ${Math.floor((v % 100) / 10)}, so ${v % 100 >= 50 ? 'round up' : 'round down'} to ${ans}.`,
      wrongTags: { [dec(Math.round(v / 10), 1)]: 'wrong-place' },
    };
  }
  if (t === 2) {
    const tenths = randInt(1, 9);
    return {
      prompt: `0.${tenths} = __ hundredths`, answer: String(tenths * 10),
      choices: mkChoices(tenths * 10, [tenths, tenths * 100, tenths + 10], () => randInt(1, 99)),
      hint: 'Each tenth is 10 hundredths.',
      explain: `0.${tenths} = 0.${tenths}0 = ${tenths * 10} hundredths.`,
      wrongTags: wt(tenths * 10, { [tenths]: 'tenths-as-hundredths' }),
    };
  }
  if (t === 3) {
    // 0.37 vs 0.5 style: longer number is smaller
    const tenths = randInt(2, 9);
    let hv; do { hv = randInt(10, 99); } while (Math.floor(hv / 10) >= tenths);
    const big = `0.${tenths}`, small = dec(hv, 2);
    const [x, y] = Math.random() < 0.5 ? [big, small] : [small, big];
    return {
      prompt: `Which is bigger: ${x} or ${y}?`, answer: big,
      choices: [x, y],
      hint: 'Compare the tenths digit first.',
      explain: `${big} = ${tenths * 10} hundredths and ${small} = ${hv} hundredths, so ${big} is bigger.`,
      wrongTags: { [small]: 'longer-is-bigger' },
    };
  }
  const v = randInt(101, 999);
  const n = dec(v, 2);
  if (!n.includes('.') || n.split('.')[1].length < 2) return L8();
  const place = pick(['tenths', 'hundredths']);
  const digit = place === 'tenths' ? Math.floor((v % 100) / 10) : v % 10;
  return {
    prompt: `What digit is in the ${place} place of ${n}?`, answer: String(digit),
    hint: 'Tenths is the first digit after the point, hundredths is the second.',
    explain: `${n}: tenths digit ${Math.floor((v % 100) / 10)}, hundredths digit ${v % 10}. The ${place} digit is ${digit}.`,
  };
}

function L9() {
  const t = randInt(0, 4);
  if (t === 0) {
    // round to nearest hundredth with a double-rounding trap half the time (x.xx49)
    const whole = randInt(1, 9), d1 = randInt(0, 9), d2 = randInt(0, 9);
    const trap = Math.random() < 0.5;
    const d3 = trap ? 4 : pick([0, 1, 2, 3, 6, 7, 8, 9]), d4 = trap ? randInt(5, 9) : randInt(1, 9);
    const v = whole * 10000 + d1 * 1000 + d2 * 100 + d3 * 10 + d4; // scaled by 10^4
    const n = dec(v, 4);
    const ans = dec(Math.round(v / 100), 2);
    const dbl = dec(Math.round(Math.round(v / 10) / 10), 2);
    return {
      prompt: `Round ${n} to the nearest hundredth.`, answer: ans,
      choices: mkChoices(ans, [dbl, dec(Math.round(v / 10), 3), dec(Math.round(v / 1000), 1)], () => dec(randInt(100, 999), 2)),
      hint: 'Look only at the thousandths digit, in one step.',
      explain: `${n}: the thousandths digit is ${d3}, so ${d3 >= 5 ? 'round up' : 'keep the hundredths'}: ${ans}. Do not round in two steps.`,
      wrongTags: wt(ans, { [dbl]: 'double-rounding', [dec(Math.round(v / 10), 3)]: 'wrong-place' }),
    };
  }
  if (t === 1) {
    const whole = randInt(0, 9), d1 = randInt(0, 9), d2 = randInt(0, 9), d3 = randInt(1, 9);
    const v = whole * 1000 + d1 * 100 + d2 * 10 + d3;
    const n = dec(v, 3);
    const ans = dec(Math.round(v / 10), 2);
    if (d3 === 5) return L9();
    return {
      prompt: `Round ${n} to the nearest hundredth.`, answer: ans,
      hint: 'Look at the thousandths digit.',
      explain: `${n}: the thousandths digit is ${d3}, so ${d3 >= 5 ? 'round up' : 'round down'}: ${ans}.`,
      wrongTags: { [dec(Math.round(v / 100), 1)]: 'wrong-place' },
    };
  }
  if (t === 2) {
    const th = randInt(1, 9), tn = randInt(1, 9), tenth = randInt(1, 9), hund = pick([0, randInt(1, 9)]);
    const v = th * 100000 + tn * 1000 + tenth * 10 + hund; // scaled by 100
    const parts = [`${th} x 1000`, `${tn} x 10`, `${tenth} x 0.1`];
    if (hund) parts.push(`${hund} x 0.01`);
    return {
      prompt: `${parts.join(' + ')} = ?`, answer: dec(v, 2),
      hint: 'Work out each product, then add. Empty places get a 0.',
      explain: `${th * 1000} + ${tn * 10} + 0.${tenth}${hund ? ` + 0.0${hund}` : ''} = ${dec(v, 2)}.`,
      wrongTags: { [Number(`${th}${tn}${tenth}${hund || ''}`)]: 'concatenate' },
    };
  }
  if (t === 3) {
    const whole = randInt(0, 9), d1 = randInt(1, 9), d2 = randInt(1, 9), d3 = randInt(1, 9);
    const v = whole * 1000 + d1 * 100 + d2 * 10 + d3;
    const n = dec(v, 3);
    const which = pick([1, 2, 3]);
    const digit = which === 1 ? d1 : which === 2 ? d2 : d3;
    const val = which === 1 ? `0.${digit}` : which === 2 ? `0.0${digit}` : `0.00${digit}`;
    return {
      prompt: `What is the value of the ${['', 'first', 'second', 'third'][which]} digit after the point in ${n}?`, answer: val,
      choices: mkChoices(val, [String(digit), `0.${'0'.repeat(which)}${digit}`, `0.${'0'.repeat(Math.max(0, which - 2))}${digit}`], null),
      hint: ['', 'tenths', 'hundredths', 'thousandths'][which] + ' place.',
      explain: `The ${digit} is in the ${['', 'tenths', 'hundredths', 'thousandths'][which]} place, so it is worth ${val}.`,
      wrongTags: wt(val, { [String(digit)]: 'digit-not-value' }),
    };
  }
  const v = randInt(1001, 9999); // round to nearest tenth from thousandths
  const n = dec(v, 3);
  if (v % 100 === 50 || v % 10 === 0) return L9();
  const ans = dec(Math.round(v / 100), 1);
  return {
    prompt: `Round ${n} to the nearest tenth.`, answer: ans,
    hint: 'Look at the hundredths digit only.',
    explain: `${n}: the hundredths digit is ${Math.floor((v % 100) / 10)}, so ${v % 100 >= 50 ? 'round up' : 'round down'}: ${ans}.`,
    wrongTags: { [dec(Math.round(v / 10), 2)]: 'wrong-place' },
  };
}

function L10() {
  const t = randInt(0, 5);
  if (t === 0) {
    const e = randInt(2, 6);
    return {
      prompt: `10^${e} = ?`, answer: String(10 ** e),
      choices: mkChoices(10 ** e, [10 * e, 10 ** (e - 1), 10 ** (e + 1)], () => 10 ** randInt(1, 7)),
      hint: `10^${e} is a 1 followed by ${e} zeros.`,
      explain: `10^${e} = ${Array(e).fill(10).join(' x ')} = ${10 ** e}.`,
      wrongTags: wt(10 ** e, { [10 * e]: 'base-times-exponent', [10 ** (e - 1)]: 'off-by-one-zero' }),
    };
  }
  if (t === 1) {
    const m = randInt(1, 9), e = randInt(3, 6);
    return {
      prompt: `Write ${m} x 10^${e} as a number.`, answer: String(m * 10 ** e),
      hint: `${m} followed by ${e} zeros.`,
      explain: `10^${e} = ${10 ** e}, so ${m} x ${10 ** e} = ${m * 10 ** e}.`,
      wrongTags: { [m * 10 * e]: 'base-times-exponent', [m * 10 ** (e - 1)]: 'off-by-one-zero' },
    };
  }
  if (t === 2) {
    const m = randInt(11, 99), e = randInt(3, 6);
    const n = m * 10 ** (e - 1);
    return {
      prompt: `${n} = ${Math.floor(m / 10)}.${m % 10} x 10^?`, answer: String(e),
      hint: 'Count how many places the decimal point moves.',
      explain: `${Math.floor(m / 10)}.${m % 10} x ${10 ** e} = ${n}, so the exponent is ${e}.`,
      wrongTags: { [e - 1]: 'off-by-one-zero', [e + 1]: 'off-by-one-zero' },
    };
  }
  if (t === 3) {
    // one-significant-digit estimate of a product
    const a10 = pick([19, 21, 29, 31, 39, 41, 49, 51, 59, 61, 79, 81, 89, 91]);
    const b10 = pick([19, 21, 29, 31, 39, 41, 48, 52, 58, 62, 68, 72, 78, 82]); // tenths, e.g. 48 = 4.8
    const ra = roundTo(a10, 10), rb = Math.round(b10 / 10);
    const bs = dec(b10, 1);
    return {
      prompt: `Round each number to one nonzero digit, then multiply: ${bs} x ${a10}`, answer: String(ra * rb),
      hint: `${bs} is about ${rb} and ${a10} is about ${ra}.`,
      explain: `${bs} rounds to ${rb}, ${a10} rounds to ${ra}; ${rb} x ${ra} = ${ra * rb}.`,
    };
  }
  if (t === 4) {
    // (rounded divisor, quotient) pairs whose product has a single nonzero digit
    const [rd, q] = pick([[20, 20], [20, 30], [20, 40], [20, 100], [20, 200], [20, 300], [30, 20], [30, 30], [30, 100], [30, 200], [40, 20], [40, 100], [40, 200], [50, 10], [50, 100]]);
    const d = rd + pick([-1, 1]);
    const P = q * rd;
    const n = P + randInt(-9, 9) * (P >= 1000 ? 10 : 1);
    return {
      prompt: `Round each number to one nonzero digit, then divide: ${n} ÷ ${d}`, answer: String(q),
      hint: `${d} is about ${rd}, and ${n} is about ${q * rd}.`,
      explain: `${n} rounds to ${q * rd} and ${d} rounds to ${rd}; ${q * rd} ÷ ${rd} = ${q}.`,
    };
  }
  const d = randInt(1, 9), p1 = pick([10, 100, 1000]), p2 = pick([1, 10, 100]);
  if (p1 <= p2) return L10();
  const other = () => { let x; do { x = randInt(1, 9); } while (x === d); return x; };
  const big = d * p1 + other(), small = d * p2 + (p2 === 1 ? 0 : other());
  const ratio = p1 / p2;
  return {
    prompt: `How many times greater is the ${d} in ${big} than the ${d} in ${small}?`, answer: String(ratio),
    choices: mkChoices(ratio, [ratio * 10, ratio / 10, Math.log10(ratio)], () => 10 ** randInt(0, 4)),
    hint: 'Each place to the left is 10 times bigger.',
    explain: `In ${big} the ${d} is worth ${d * p1}; in ${small} it is worth ${d * p2}. ${d * p1} ÷ ${d * p2} = ${ratio}.`,
    wrongTags: wt(ratio, { [Math.log10(ratio)]: 'counted-places-not-ratio' }),
  };
}

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'place', name: 'Place Value', emoji: '🔟', group: 'number',
  start: { 1: 1, 3: 3, 4: 4 },
  gen(level) {
    const q = LEVELS[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) { delete q.wrongTags[String(q.answer)]; if (!Object.keys(q.wrongTags).length) delete q.wrongTags; }
    return q;
  },
};
