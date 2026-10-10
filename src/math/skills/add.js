// Addition — curriculum ladder A2.
import { randInt, pick, shuffle } from '../rng.js';

const THIN = ' ';
const fmt = (n) => {
  const neg = n < 0, s = String(Math.abs(n));
  if (s.length < 5) return (neg ? '-' : '') + s;
  return (neg ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
};
const dec = (x, places) => Number(x.toFixed(places)).toString();
const money = (c) => `$${(c / 100).toFixed(2)}`;
const uniq = (arr) => [...new Set(arr.map(String))];
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const frac = (n, d) => { const g = gcd(n, d) || 1; return `${n / g}/${d / g}`; };
const mixedStr = (n, d) => { // n/d as a mixed number string, d > 0
  const w = Math.trunc(n / d), r = Math.abs(n % d);
  if (r === 0) return String(w);
  if (w === 0) return frac(n, d);
  return `${w} ${frac(r, d)}`;
};
const q = (prompt, answer, extra = {}) => ({ prompt, answer: String(answer), ...extra });

// ---------- Level 1: within 5 with objects ----------
function level1() {
  const kind = pick(['plus', 'plus', 'oneMore', 'twoMore', 'story']);
  if (kind === 'oneMore' || kind === 'twoMore') {
    const k = kind === 'oneMore' ? 1 : 2, a = randInt(1, 5 - k);
    return q(`${a} and ${k} more is ?`, a + k, {
      visual: { type: 'tenframe', counts: [a, k] },
      hint: `Say ${a}, then count ${k} more.`,
      explain: `Start at ${a} and count on ${k}: ${Array.from({ length: k }, (_, i) => a + i + 1).join(', ')}. ${a} + ${k} = ${a + k}.`,
    });
  }
  if (kind === 'story') {
    const a = randInt(2, 4), b = randInt(1, 5 - a);
    const thing = pick(['apples', 'blocks', 'fish', 'cars']);
    return q(`You have ${a} ${thing}. You get ${b} more. How many ${thing} now?`, a + b, {
      visual: { type: 'counters', count: a + b, icon: 'star' },
      hint: 'Count all of them together.',
      explain: `${a} ${thing} and ${b} more makes ${a + b}. ${a} + ${b} = ${a + b}.`,
    });
  }
  const a = randInt(1, 4), b = randInt(1, 5 - a);
  return q(`${a} + ${b} = ?`, a + b, {
    visual: { type: 'tenframe', counts: [a, b] },
    hint: `Start at ${a}, then count on ${b} more.`,
    explain: `Keep ${a} in your head and count on ${b}: ${a} + ${b} = ${a + b}. No need to recount from 1.`,
  });
}

// ---------- Level 2: within 10, combinations of 10 ----------
function level2() {
  const kind = pick(['plus', 'plus', 'makeTen', 'makeTenFront', 'missing', 'swap']);
  if (kind === 'makeTen') {
    const a = randInt(1, 9);
    return q(`${a} + __ = 10`, 10 - a, {
      visual: { type: 'tenframe', count: a },
      hint: 'How many empty spaces are left in the ten frame?',
      explain: `The frame shows ${a} dots and ${10 - a} empty spaces. ${a} + ${10 - a} = 10.`,
    });
  }
  if (kind === 'makeTenFront') {
    const b = randInt(1, 9);
    return q(`__ + ${b} = 10`, 10 - b, {
      visual: { type: 'tenframe', count: b },
      hint: `Count up from ${b} to 10.`,
      explain: `From ${b}, count up to 10: that is ${10 - b} more. ${10 - b} + ${b} = 10.`,
    });
  }
  if (kind === 'missing') {
    const total = randInt(5, 10), a = randInt(1, total - 1);
    return q(`${a} + __ = ${total}`, total - a, {
      visual: { type: 'tenframe', counts: [a, total - a] },
      hint: `Count on from ${a} until you reach ${total}.`,
      explain: `From ${a}, count up to ${total}: ${total - a} more. ${a} + ${total - a} = ${total}.`,
    });
  }
  if (kind === 'swap') {
    const a = randInt(1, 4), b = randInt(a + 1, 10 - a);
    return q(`${a} + ${b} = ?`, a + b, {
      visual: { type: 'tenframe', counts: [b, a] },
      hint: `Start with the bigger number, ${b}, and count on ${a}.`,
      explain: `Start at the bigger number: ${b}, then count on ${a}: ${b} + ${a} = ${a + b}.`,
      wrongTags: { [String(a + b - 1)]: 'count-start-on-first' },
    });
  }
  const a = randInt(1, 9), b = randInt(1, 10 - a);
  return q(`${a} + ${b} = ?`, a + b, {
    visual: { type: 'tenframe', counts: [a, b] },
    hint: `Start at ${Math.max(a, b)} and count on ${Math.min(a, b)}.`,
    explain: `${Math.max(a, b)} and ${Math.min(a, b)} more: ${a} + ${b} = ${a + b}.`,
    wrongTags: { [String(a + b - 1)]: 'count-start-on-first' },
  });
}

// ---------- Level 3: within 20 with doubles, near doubles, make ten ----------
function level3() {
  const kind = pick(['double', 'nearDouble', 'makeTen', 'makeTen', 'missing', 'swap']);
  if (kind === 'double') {
    const a = randInt(5, 10);
    return q(`${a} + ${a} = ?`, 2 * a, {
      visual: { type: 'tenframe', counts: [a, a] },
      hint: `This is a double. Double ${a}.`,
      explain: `Doubles: ${a} + ${a} = ${2 * a}.`,
      wrongTags: { [String(2 * a + 1)]: 'double-off-by-one', [String(2 * a - 1)]: 'double-off-by-one' },
    });
  }
  if (kind === 'nearDouble') {
    const a = randInt(5, 9), swap = Math.random() < 0.5;
    const x = swap ? a + 1 : a, y = swap ? a : a + 1;
    return q(`${x} + ${y} = ?`, 2 * a + 1, {
      visual: { type: 'tenframe', counts: [x, y] },
      hint: `Near double: ${a} + ${a} and 1 more.`,
      explain: `${x} + ${y} is a near double: ${a} + ${a} = ${2 * a}, plus 1 = ${2 * a + 1}.`,
      wrongTags: { [String(2 * a)]: 'near-double-forgot-one', [String(2 * a + 2)]: 'double-wrong-addend' },
    });
  }
  if (kind === 'missing') {
    const a = randInt(6, 9), total = randInt(11, Math.min(18, a + 9));
    return q(`${a} + __ = ${total}`, total - a, {
      visual: { type: 'tenframe', counts: [a, total - a] },
      hint: `Count up from ${a} to 10 first, then on to ${total}.`,
      explain: `From ${a} to 10 is ${10 - a}, then 10 to ${total} is ${total - 10}. ${10 - a} + ${total - 10} = ${total - a}.`,
    });
  }
  // make ten (also 'swap' which puts the smaller addend first)
  let a = randInt(6, 9), b = randInt(11 - a, 9);
  if (a === b) b = b === 9 ? 8 : b + 1;
  const x = kind === 'swap' ? Math.min(a, b) : a, y = kind === 'swap' ? Math.max(a, b) : b;
  const big = Math.max(x, y), small = Math.min(x, y), gap = 10 - big;
  return q(`${x} + ${y} = ?`, a + b, {
    visual: { type: 'tenframe', counts: [x, y] },
    hint: `Make ten: ${big} needs ${gap} more to reach 10.`,
    explain: `${x} + ${y}: take ${gap} from the ${small} to make ${big} into 10, then 10 + ${small - gap} = ${a + b}.`,
    wrongTags: { [String(a + b - 1)]: 'lost-count-past-ten', [String(a + b + 1)]: 'lost-count-past-ten' },
  });
}

// ---------- Level 4: two-digit + one-digit, + multiples of ten ----------
function level4() {
  const kind = pick(['noRegroup', 'regroup', 'regroup', 'tens', 'tens', 'missingTens', 'storyTens']);
  if (kind === 'noRegroup') {
    const a = randInt(1, 8) * 10 + randInt(1, 8), bb = randInt(1, 9 - (a % 10));
    return q(`${a} + ${bb} = ?`, a + bb, {
      visual: { type: 'base10', value: a },
      hint: 'Add the ones only. The tens stay the same.',
      explain: `${a} + ${bb}: ${a % 10} ones + ${bb} ones = ${(a % 10) + bb} ones, so ${a + bb}.`,
      wrongTags: { [String(a + bb * 10)]: 'adding-ones-to-tens' },
    });
  }
  if (kind === 'regroup') {
    const a = randInt(11, 89), b = randInt(10 - (a % 10) + (a % 10 === 0 ? 1 : 0), 9);
    const safeB = Math.max(1, Math.min(9, b)), toTen = 10 - (a % 10);
    const regroups = (a % 10) + safeB >= 10;
    return q(`${a} + ${safeB} = ?`, a + safeB, {
      visual: { type: 'base10', value: a },
      hint: regroups ? `Jump to the next ten first: ${a} + ${toTen} = ${a + toTen}.` : 'Add the ones.',
      explain: regroups
        ? `${a} + ${toTen} = ${a + toTen}, then ${a + toTen} + ${safeB - toTen} = ${a + safeB}.`
        : `${a} + ${safeB} = ${a + safeB}.`,
      wrongTags: { [String(a + safeB - 10)]: 'forgot-regroup-ten' },
    });
  }
  if (kind === 'missingTens') {
    const a = randInt(11, 59), t = randInt(1, Math.floor((99 - a) / 10)) * 10;
    return q(`${a} + __ = ${a + t}`, t, {
      visual: { type: 'base10', value: a },
      hint: 'Only the tens digit changed.',
      explain: `${a} to ${a + t}: the tens went from ${Math.floor(a / 10)} to ${Math.floor((a + t) / 10)}, that is ${t / 10} tens = ${t}.`,
      wrongTags: { [String(t / 10)]: 'tens-as-ones' },
    });
  }
  if (kind === 'storyTens') {
    const a = randInt(12, 69), t = randInt(1, Math.floor((99 - a) / 10)) * 10;
    return q(`A jar has ${a} marbles. ${t} more are added. How many now?`, a + t, {
      visual: { type: 'base10', value: a },
      hint: `${t} is ${t / 10} tens. Count on by tens.`,
      explain: `${a} + ${t}: count on by tens, ${Array.from({ length: t / 10 }, (_, i) => a + (i + 1) * 10).join(', ')}. Answer ${a + t}.`,
      wrongTags: { [String(a + t / 10)]: 'adding-tens-to-ones' },
    });
  }
  const a = randInt(11, 79), t = randInt(1, Math.floor((99 - a) / 10)) * 10;
  const swap = Math.random() < 0.3;
  return q(swap ? `${t} + ${a} = ?` : `${a} + ${t} = ?`, a + t, {
    visual: { type: 'base10', value: a },
    hint: `${t} is ${t / 10} tens. Add them to the tens of ${a}; the ones stay ${a % 10}.`,
    explain: `${a} + ${t}: ${Math.floor(a / 10)} tens + ${t / 10} tens = ${Math.floor(a / 10) + t / 10} tens, ones stay ${a % 10}. Answer ${a + t}.`,
    wrongTags: { [String(a + t / 10)]: 'adding-tens-to-ones' },
  });
}

// ---------- Level 5: two-digit + two-digit with regrouping, sums <= 200 ----------
function level5() {
  const kind = pick(['std', 'std', 'std', 'three', 'missing', 'story', 'column']);
  if (kind === 'three') {
    const a = pick([25, 25, 15, 35, 45, 20, 30]), b = pick([a, a, randInt(10, 60)]), c = pick([a, randInt(10, 60)]);
    return q(`${a} + ${b} + ${c} = ?`, a + b + c, {
      hint: `Add two first: ${a} + ${b} = ${a + b}, then add ${c}.`,
      explain: `${a} + ${b} = ${a + b}, then ${a + b} + ${c} = ${a + b + c}.`,
    });
  }
  if (kind === 'missing') {
    const a = randInt(23, 69), total = randInt(a + 15, Math.min(150, a + 90));
    return q(`${a} + __ = ${total}`, total - a, {
      visual: { type: 'numberline', min: a - 5, max: total + 5, marks: [a, total] },
      hint: `Count up from ${a} to the next ten, then by tens, then to ${total}.`,
      explain: `Count up: ${a} to ${Math.ceil(a / 10) * 10} is ${Math.ceil(a / 10) * 10 - a}, then on to ${total} is ${total - Math.ceil(a / 10) * 10} more. Total jump ${total - a}.`,
    });
  }
  // Always regroup in the ones: a's ones digit is 1-9 and b's ones digit is at least 10 - that.
  const a = randInt(2, 9) * 10 + randInt(1, 9);
  const bb = randInt(1, Math.min(8, Math.floor((199 - a) / 10) - 1)) * 10 + randInt(10 - (a % 10), 9);
  const onesSum = (a % 10) + (bb % 10), carries = onesSum >= 10;
  const total = a + bb;
  const forgotCarry = total - 10, wroteEleven = carries ? Number(`${Math.floor(a / 10) + Math.floor(bb / 10)}${onesSum}`) : total;
  if (kind === 'story') {
    const [t1, t2] = pick([['stickers', 'album'], ['cards', 'box'], ['beads', 'bag']]);
    return q(`One ${t2} has ${a} ${t1} and another has ${bb}. How many ${t1} altogether?`, total, {
      visual: { type: 'base10', value: a },
      hint: 'Add the tens, add the ones, then combine.',
      explain: `${Math.floor(a / 10) * 10} + ${Math.floor(bb / 10) * 10} = ${(Math.floor(a / 10) + Math.floor(bb / 10)) * 10}, and ${a % 10} + ${bb % 10} = ${onesSum}. Together ${total}.`,
      wrongTags: { [String(forgotCarry)]: 'forgot-carry' },
    });
  }
  if (kind === 'column') {
    return q(`${a} + ${bb} = ?  (line up the ones under the ones)`, total, {
      visual: { type: 'base10', value: bb },
      hint: carries ? `${a % 10} + ${bb % 10} = ${onesSum}: write ${onesSum % 10}, carry 1 ten.` : 'No carrying needed here.',
      explain: carries
        ? `Ones: ${a % 10} + ${bb % 10} = ${onesSum}, write ${onesSum % 10} and carry 1. Tens: ${Math.floor(a / 10)} + ${Math.floor(bb / 10)} + 1 = ${Math.floor(a / 10) + Math.floor(bb / 10) + 1}. Answer ${total}.`
        : `Ones: ${a % 10} + ${bb % 10} = ${onesSum}. Tens: ${Math.floor(a / 10)} + ${Math.floor(bb / 10)}. Answer ${total}.`,
      wrongTags: { [String(forgotCarry)]: 'forgot-carry', [String(wroteEleven)]: 'wrote-two-digits-in-ones' },
    });
  }
  return q(`${a} + ${bb} = ?`, total, {
    visual: { type: 'numberline', min: a - 2, max: total + 2, marks: [a, a + Math.floor(bb / 10) * 10, total] },
    hint: `Jump strategy: ${a} + ${Math.floor(bb / 10) * 10} = ${a + Math.floor(bb / 10) * 10}, then add ${bb % 10}.`,
    explain: `${a} + ${Math.floor(bb / 10) * 10} = ${a + Math.floor(bb / 10) * 10}, then + ${bb % 10} = ${total}.`,
    wrongTags: { [String(forgotCarry)]: 'forgot-carry', [String(wroteEleven)]: 'wrote-two-digits-in-ones' },
  });
}

// ---------- Level 6: three-digit with regrouping, 3 addends, sums <= 2000 ----------
function level6() {
  const kind = pick(['std', 'std', 'std', 'nines', 'three', 'missing']);
  if (kind === 'nines') {
    const a = pick([199, 299, 399, 499, 599, 699, 799, 899, 999, 998, 997]), b = randInt(1, 9);
    return q(`${a} + ${b} = ?`, a + b, {
      visual: { type: 'base10', value: a },
      hint: `${a} is close to ${Math.ceil((a + 1) / 100) * 100}. What is 1 more than ${a}?`,
      explain: `${a} + 1 = ${a + 1}, then ${a + 1} + ${b - 1} = ${a + b}. The 9s roll over together.`,
      wrongTags: { [String(Number(`${Math.floor(a / 100) + 1}${100 + b - 1}`))]: 'double-carry-written-out', [String(a + b * 10)]: 'adding-ones-to-tens' },
    });
  }
  if (kind === 'three') {
    const a = randInt(100, 400), b = randInt(100, 400), c = randInt(50, 400);
    return q(`${a} + ${b} + ${c} = ?`, a + b + c, {
      hint: `Add two at a time: ${a} + ${b} = ${a + b}.`,
      explain: `${a} + ${b} = ${a + b}, then ${a + b} + ${c} = ${a + b + c}.`,
    });
  }
  if (kind === 'missing') {
    const a = randInt(150, 700), total = randInt(a + 100, Math.min(1500, a + 800));
    return q(`${a} + __ = ${total}`, total - a, {
      visual: { type: 'numberline', min: a - 10, max: total + 10, marks: [a, total] },
      hint: `Count up from ${a} to ${total} by hundreds, tens, then ones.`,
      explain: `Count up: ${a} to ${Math.ceil(a / 100) * 100} is ${Math.ceil(a / 100) * 100 - a}, then ${Math.ceil(a / 100) * 100} to ${total} is ${total - Math.ceil(a / 100) * 100}. Total ${total - a}.`,
    });
  }
  // standard with at least one regroup
  let a = randInt(145, 999), b = randInt(145, 999);
  if ((a % 10) + (b % 10) < 10 && (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) < 10) b = b + (10 - (b % 10)) + (9 - (b % 10)); // nudge ones to regroup
  b = Math.min(b, 999);
  const total = a + b;
  const onesSum = (a % 10) + (b % 10), tensSum = Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 + (onesSum >= 10 ? 1 : 0);
  const hundSum = Math.floor(a / 100) + Math.floor(b / 100) + (tensSum >= 10 ? 1 : 0);
  return q(`${a} + ${b} = ?`, total, {
    visual: { type: 'base10', value: a },
    hint: 'Add ones, then tens, then hundreds. Carry when a column reaches 10.',
    explain: `Ones ${a % 10} + ${b % 10} = ${onesSum}${onesSum >= 10 ? ' (carry 1)' : ''}; tens make ${tensSum}${tensSum >= 10 ? ' (carry 1)' : ''}; hundreds make ${hundSum}. Answer ${total}.`,
    wrongTags: { [String(total - 10)]: 'forgot-carry', [String(total - 100)]: 'forgot-carry' },
  });
}

// ---------- Level 7: four-digit and beyond, money ----------
function level7() {
  const kind = pick(['four', 'four', 'uneven', 'five', 'money', 'money', 'missing']);
  if (kind === 'money') {
    const a = randInt(205, 4999), b = randInt(105, 2999);
    const ans = ((a + b) / 100).toFixed(2);
    return q(`${money(a)} + ${money(b)} = ?  (answer in dollars, like 4.25)`, ans, {
      hint: 'Line up the decimal points. Cents add like a two-digit number.',
      explain: `${money(a)} + ${money(b)}: cents ${a % 100} + ${b % 100} = ${(a % 100) + (b % 100)}, dollars ${Math.floor(a / 100)} + ${Math.floor(b / 100)}. Total $${ans}.`,
      wrongTags: { [((a + b) / 100 - 1).toFixed(2)]: 'forgot-carry-dollar' },
    });
  }
  if (kind === 'uneven') {
    const a = randInt(1000, 9000), b = randInt(100, 999);
    const misaligned = a + b * 10;
    return q(`${fmt(a)} + ${b} = ?`, a + b, {
      hint: 'Line up the ones under the ones, not the first digits.',
      explain: `${fmt(a)} + ${b} = ${fmt(a + b)}. ${b} has no thousands digit, so it sits under the hundreds, tens and ones.`,
      wrongTags: { [String(misaligned)]: 'misaligned-columns' },
    });
  }
  if (kind === 'five') {
    const a = randInt(10000, 60000), b = randInt(10000, 39999);
    return q(`${fmt(a)} + ${fmt(b)} = ?`, a + b, {
      hint: 'Work column by column from the ones.',
      explain: `${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.`,
      wrongTags: { [String(a + b - 1000)]: 'forgot-carry', [String(a + b - 100)]: 'forgot-carry' },
    });
  }
  if (kind === 'missing') {
    const a = randInt(1200, 6000), total = randInt(a + 500, a + 5000);
    return q(`${fmt(a)} + __ = ${fmt(total)}`, total - a, {
      hint: `Count up from ${fmt(a)} to the next thousand, then on to ${fmt(total)}.`,
      explain: `${fmt(total)} - ${fmt(a)} = ${fmt(total - a)}. Check: ${fmt(a)} + ${fmt(total - a)} = ${fmt(total)}.`,
    });
  }
  const a = randInt(1000, 8999), b = randInt(1000, 9999);
  const total = a + b;
  return q(`${fmt(a)} + ${fmt(b)} = ?`, total, {
    hint: 'Add ones, tens, hundreds, thousands. Carry when needed.',
    explain: `${fmt(a)} + ${fmt(b)} = ${fmt(total)}. Add each column from the right and carry any ten.`,
    wrongTags: { [String(total - 10)]: 'forgot-carry', [String(total - 100)]: 'forgot-carry', [String(total - 1000)]: 'forgot-carry' },
  });
}

// ---------- Level 8: decimals (tenths, hundredths) and like-denominator fractions ----------
function level8() {
  const kind = pick(['dec', 'dec', 'decMixed', 'frac', 'frac', 'fracWhole', 'decStory']);
  if (kind === 'frac' || kind === 'fracWhole') {
    const d = pick([4, 5, 6, 8, 10, 12]);
    const n1 = randInt(1, d - 1), n2 = kind === 'fracWhole' ? d - n1 : randInt(1, d - n1 - 1 > 0 ? d - n1 - 1 : 1);
    const ans = frac(n1 + n2, d);
    return q(`${n1}/${d} + ${n2}/${d} = ?  (write a fraction like 3/4)`, ans, {
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: n1 }, { parts: d, shaded: n2 }] },
      hint: 'The pieces are the same size, so only count the pieces. The bottom number stays.',
      explain: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d}${ans !== `${n1 + n2}/${d}` ? ` = ${ans}` : ''}. Same-size pieces: add the tops, keep the bottom.`,
      wrongTags: { [`${n1 + n2}/${2 * d}`]: 'add-denominators' },
    });
  }
  if (kind === 'decMixed') {
    const a = randInt(10, 99) / 10, b = randInt(101, 999) / 100; // tenths + hundredths
    const ans = dec(a + b, 2);
    const rightAligned = dec(a / 10 + b, 2);
    return q(`${dec(a, 1)} + ${dec(b, 2)} = ?`, ans, {
      hint: `Write ${dec(a, 1)} as ${a.toFixed(2)} so both have two decimal places. Line up the points.`,
      explain: `${a.toFixed(2)} + ${b.toFixed(2)} = ${ans}. Line up the decimal points, not the right-hand ends.`,
      wrongTags: { [rightAligned]: 'decimal-right-aligned' },
    });
  }
  if (kind === 'decStory') {
    const a = randInt(100, 999) / 100, b = randInt(100, 999) / 100;
    return q(`A ribbon is ${a.toFixed(2)} m long and another is ${b.toFixed(2)} m. Total length in metres?`, dec(a + b, 2), {
      hint: 'Add the hundredths, tenths, then the whole metres.',
      explain: `${a.toFixed(2)} + ${b.toFixed(2)} = ${dec(a + b, 2)} m.`,
    });
  }
  const places = pick([1, 1, 2]);
  const a = randInt(10, 999) / (places === 1 ? 10 : 100), b = randInt(10, 999) / (places === 1 ? 10 : 100);
  const ans = dec(a + b, places);
  return q(`${a.toFixed(places)} + ${b.toFixed(places)} = ?`, ans, {
    hint: 'Line up the decimal points and add like whole numbers.',
    explain: `${a.toFixed(places)} + ${b.toFixed(places)} = ${ans}. Keep the decimal point in the same column.`,
    wrongTags: { [dec(a + b - 1, places)]: 'forgot-carry' },
  });
}

// ---------- Level 9: unlike fractions, mixed numbers, integers ----------
function level9() {
  const kind = pick(['unlike', 'unlike', 'mixed', 'int', 'int', 'intNegNeg', 'unlikeHint']);
  if (kind === 'int' || kind === 'intNegNeg') {
    if (kind === 'intNegNeg') {
      const a = -randInt(2, 40), b = -randInt(2, 40);
      return q(`${a} + (${b}) = ?`, a + b, {
        visual: { type: 'numberline', min: Math.min(-80, a + b - 5), max: 10, marks: [a, a + b] },
        hint: 'Both are below zero, so you move further left.',
        explain: `Start at ${a}, move ${-b} more to the left: ${a} + (${b}) = ${a + b}.`,
        wrongTags: { [String(-(a + b))]: 'integer-sign', [String(a - b)]: 'integer-direction' },
      });
    }
    const neg = -randInt(2, 40), pos = randInt(2, 40), swap = Math.random() < 0.5;
    const ans = neg + pos;
    return q(swap ? `${pos} + (${neg}) = ?` : `${neg} + ${pos} = ?`, ans, {
      visual: { type: 'numberline', min: Math.min(neg, ans) - 5, max: Math.max(pos, ans) + 5, marks: [neg, ans] },
      hint: `Start at ${swap ? pos : neg} and move ${swap ? -neg + ' left' : pos + ' right'}.`,
      explain: `${neg} + ${pos}: the numbers pull in opposite directions. ${pos} - ${-neg} = ${pos + neg}, so the answer is ${ans}.`,
      wrongTags: { [String(neg - pos)]: 'integer-add-magnitudes', [String(-ans)]: 'integer-sign' },
    });
  }
  if (kind === 'mixed') {
    const d1 = pick([2, 4]), d2 = pick([4, 8, 2]);
    const w1 = randInt(1, 5), w2 = randInt(1, 4), n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
    const L = (d1 * d2) / gcd(d1, d2);
    const num = (w1 * L + (n1 * L) / d1) + (w2 * L + (n2 * L) / d2);
    const ans = mixedStr(num, L);
    const improper = frac(num, L);
    const addDen = mixedStr((w1 + w2) * (d1 + d2) + n1 + n2, d1 + d2);
    const forgotCarry = `${w1 + w2} ${frac((n1 * L) / d1 + (n2 * L) / d2, L)}`; // keeps an improper fraction part
    const choices = shuffle(uniq([ans, addDen, forgotCarry, mixedStr(num + L / d2, L), mixedStr(num - L, L)]).slice(0, 4));
    return q(`${w1} ${n1}/${d1} + ${w2} ${n2}/${d2} = ?`, ans, {
      choices: choices.includes(ans) ? choices : shuffle(uniq([ans, ...choices.slice(0, 3)])),
      visual: { type: 'fractionbar', bars: [{ parts: d1, shaded: n1 }, { parts: d2, shaded: n2 }] },
      hint: `Add the wholes: ${w1 + w2}. Then add the fractions using ${L}ths.`,
      explain: `Wholes: ${w1} + ${w2} = ${w1 + w2}. Fractions: ${n1}/${d1} + ${n2}/${d2} = ${frac((n1 * L) / d1 + (n2 * L) / d2, L)}. Together ${ans} (that is ${improper}).`,
      wrongTags: { [addDen]: 'add-denominators', [forgotCarry]: 'improper-not-regrouped' },
    });
  }
  // unlike denominators
  const pairs = [[2, 3], [2, 5], [3, 4], [2, 4], [3, 6], [4, 6], [4, 8], [3, 5], [5, 10], [4, 12], [6, 12], [4, 10]];
  const [d1, d2] = shuffle(pick(pairs));
  const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
  const L = (d1 * d2) / gcd(d1, d2);
  const top = (n1 * L) / d1 + (n2 * L) / d2;
  const ans = frac(top, L);
  const hintText = kind === 'unlikeHint' ? `  (use ${L}ths)` : '  (write a fraction like 5/6)';
  return q(`${n1}/${d1} + ${n2}/${d2} = ?${hintText}`, ans, {
    visual: { type: 'fractionbar', bars: [{ parts: d1, shaded: n1 }, { parts: d2, shaded: n2 }] },
    hint: `Change both to ${L}ths: ${n1}/${d1} = ${(n1 * L) / d1}/${L} and ${n2}/${d2} = ${(n2 * L) / d2}/${L}.`,
    explain: `${n1}/${d1} = ${(n1 * L) / d1}/${L} and ${n2}/${d2} = ${(n2 * L) / d2}/${L}. Add: ${top}/${L}${ans !== `${top}/${L}` ? ` = ${ans}` : ''}.`,
    wrongTags: { [`${n1 + n2}/${d1 + d2}`]: 'add-denominators', [`${n1 + n2}/${L}`]: 'unconverted-numerators' },
  });
}

// ---------- Level 10: rational addition, mental compensation with large numbers ----------
function level10() {
  const kind = pick(['negDec', 'negDec', 'compensate', 'compensate', 'negFrac', 'threeDec', 'mixedForms']);
  if (kind === 'compensate') {
    const a = pick([3999, 2998, 4997, 1999, 5999, 7998, 9999]), b = randInt(1000, 5999) + pick([0, 998, 999]);
    const bb = Math.min(b, 9999);
    const up = Math.ceil(a / 1000) * 1000, diff = up - a;
    return q(`Solve mentally: ${fmt(a)} + ${fmt(bb)} = ?`, a + bb, {
      hint: `${fmt(a)} is ${diff} less than ${fmt(up)}. Add ${fmt(up)}, then take ${diff} away.`,
      explain: `${fmt(a)} + ${fmt(bb)} = ${fmt(up)} + ${fmt(bb)} - ${diff} = ${fmt(up + bb)} - ${diff} = ${fmt(a + bb)}.`,
      wrongTags: { [String(up + bb + diff)]: 'compensate-wrong-direction', [String(up + bb)]: 'forgot-compensation' },
    });
  }
  if (kind === 'negFrac') {
    const d = pick([4, 6, 8, 10, 12]);
    const dd = pick([d, d / 2]); // second denominator: the same, or half of it (d is always even)
    const n1 = -randInt(1, d - 1), n2 = randInt(1, dd - 1);
    const L = d, top = n1 + (n2 * L) / dd;
    const ans = frac(top, L);
    return q(`-${-n1}/${d} + ${n2}/${dd} = ?  (write a fraction like -1/4)`, top === 0 ? '0' : ans, {
      visual: { type: 'numberline', min: -1, max: 1, step: 1 / d, marks: [n1 / d, top / L] },
      hint: `Change to ${L}ths, then combine the tops: ${n1} + ${(n2 * L) / dd}.`,
      explain: `-${-n1}/${d} + ${(n2 * L) / dd}/${L} = ${top}/${L}${top !== 0 && ans !== `${top}/${L}` ? ` = ${ans}` : ''}. Opposite signs: subtract the sizes, keep the sign of the bigger one.`,
      wrongTags: { [frac(-n1 + (n2 * L) / dd, L)]: 'ignored-negative-sign' },
    });
  }
  if (kind === 'threeDec') {
    const a = randInt(1000, 99999) / 1000, b = randInt(10, 999) / 10;
    const ans = dec(a + b, 3);
    return q(`${dec(a, 3)} + ${b.toFixed(1)} = ?`, ans, {
      hint: `Pad ${b.toFixed(1)} to ${b.toFixed(3)} so the decimal points line up.`,
      explain: `${a.toFixed(3)} + ${b.toFixed(3)} = ${ans}.`,
      wrongTags: { [dec(a + b / 100, 3)]: 'decimal-right-aligned' },
    });
  }
  if (kind === 'mixedForms') {
    const w = randInt(1, 9), fr = pick([[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [3, 5, 0.6]]);
    const d = randInt(100, 999) / 100;
    const ans = dec(w + fr[2] + d, 2);
    return q(`${w} ${fr[0]}/${fr[1]} + ${d.toFixed(2)} = ?  (answer as a decimal)`, ans, {
      hint: `${fr[0]}/${fr[1]} = ${fr[2]}, so ${w} ${fr[0]}/${fr[1]} = ${(w + fr[2]).toFixed(2)}.`,
      explain: `${w} ${fr[0]}/${fr[1]} = ${(w + fr[2]).toFixed(2)}. Then ${(w + fr[2]).toFixed(2)} + ${d.toFixed(2)} = ${ans}.`,
      wrongTags: { [dec(w + fr[0] / 10 + d, 2)]: 'fraction-as-decimal-digits' },
    });
  }
  // negative decimal + positive decimal (either order)
  const a = -(randInt(10, 99) / 10), b = randInt(100, 999) / 100, swap = Math.random() < 0.5;
  const ans = dec(a + b, 2);
  return q(swap ? `${b.toFixed(2)} + (${a.toFixed(1)}) = ?` : `${a.toFixed(1)} + ${b.toFixed(2)} = ?`, ans, {
    visual: { type: 'numberline', min: Math.floor(a) - 1, max: Math.ceil(b) + 1, marks: [a, a + b] },
    hint: `Opposite signs: find the difference between ${(-a).toFixed(2)} and ${b.toFixed(2)}, then use the sign of the bigger one.`,
    explain: `${a.toFixed(1)} + ${b.toFixed(2)}: the difference of ${(-a).toFixed(2)} and ${b.toFixed(2)} is ${Math.abs(a + b).toFixed(2)}; the bigger size is ${Math.abs(a) > b ? 'negative' : 'positive'}, so ${ans}.`,
    wrongTags: { [dec(-(a + b), 2)]: 'integer-sign', [dec(a - b, 2)]: 'integer-add-magnitudes' },
  });
}

// Drop any misconception tag whose text would match the correct answer (e.g. a negated zero).
function cleanTags(q) {
  if (!q.wrongTags) return q;
  const ans = String(q.answer), numAns = Number(ans);
  for (const k of Object.keys(q.wrongTags)) {
    if (k === ans || (!Number.isNaN(numAns) && Number(k) === numAns) || /NaN|undefined/.test(k)) delete q.wrongTags[k];
  }
  if (Object.keys(q.wrongTags).length === 0) delete q.wrongTags;
  return q;
}

const LEVELS = [level1, level2, level3, level4, level5, level6, level7, level8, level9, level10];

export default {
  id: 'add', name: 'Addition', emoji: '➕', group: 'number',
  start: { 1: 1, 3: 4, 4: 5 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return cleanTags(LEVELS[lvl - 1]());
  },
};
