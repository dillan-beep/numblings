// Subtraction — curriculum ladder A3.
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
const mixedStr = (n, d) => {
  const w = Math.trunc(n / d), r = Math.abs(n % d);
  if (r === 0) return String(w);
  if (w === 0) return frac(n, d);
  return `${w} ${frac(r, d)}`;
};
const q = (prompt, answer, extra = {}) => ({ prompt, answer: String(answer), ...extra });
// Classic "smaller digit from larger digit in every column" bug.
const smallerFromLarger = (a, b) => {
  const da = String(a).split('').map(Number), db = String(b).padStart(da.length, '0').split('').map(Number);
  return Number(da.map((x, i) => Math.abs(x - db[i])).join(''));
};

// ---------- Level 1: take away within 5 ----------
function level1() {
  const kind = pick(['takeAway', 'takeAway', 'story', 'left', 'oneLess']);
  if (kind === 'story') {
    const a = randInt(2, 5), b = randInt(1, a);
    const thing = pick(['cookies', 'grapes', 'crackers', 'berries']);
    return q(`There are ${a} ${thing}. You eat ${b}. How many are left?`, a - b, {
      visual: { type: 'counters', count: a, icon: 'star' },
      hint: `Cover up ${b} of them and count what is left.`,
      explain: `Start with ${a}, take away ${b}: ${a} - ${b} = ${a - b}.`,
    });
  }
  if (kind === 'oneLess') {
    const a = randInt(1, 5);
    return q(`What is 1 less than ${a}?`, a - 1, {
      visual: { type: 'tenframe', count: a },
      hint: 'Take one dot away.',
      explain: `${a} take away 1 is ${a - 1}.`,
    });
  }
  const a = randInt(2, 5), b = randInt(1, a);
  const prompt = kind === 'left' ? `${a} - ${b} = ?` : `${a} take away ${b} = ?`;
  const left = a - b;
  return q(prompt, left, {
    visual: { type: 'tenframe', count: a },
    hint: `Cross out ${b} ${b === 1 ? 'dot' : 'dots'}. Count the dots that are left.`,
    explain: `${a} dots, cross out ${b}, and ${left} ${left === 1 ? 'is' : 'are'} left. ${a} - ${b} = ${left}.`,
    wrongTags: { [String(a - b + 1)]: 'removed-wrong-count', [String(Math.max(0, a - b - 1))]: 'removed-wrong-count' },
  });
}

// ---------- Level 2: within 10, related facts ----------
function level2() {
  const kind = pick(['std', 'std', 'missingSub', 'missingStart', 'related', 'fromTen']);
  if (kind === 'missingSub') {
    const a = randInt(5, 10), ans = randInt(1, a - 1);
    return q(`${a} - __ = ${a - ans}`, ans, {
      visual: { type: 'tenframe', count: a },
      hint: `Whole is ${a}, one part is ${a - ans}. Find the other part.`,
      explain: `Part-part-whole: ${a - ans} + ${ans} = ${a}, so ${a} - ${ans} = ${a - ans}.`,
    });
  }
  if (kind === 'missingStart') {
    const b = randInt(1, 6), r = randInt(1, 10 - b);
    return q(`__ - ${b} = ${r}`, r + b, {
      visual: { type: 'tenframe', counts: [r, b] },
      hint: `Put the parts back together: ${r} + ${b}.`,
      explain: `The whole is the two parts together: ${r} + ${b} = ${r + b}. So ${r + b} - ${b} = ${r}.`,
    });
  }
  if (kind === 'related') {
    const a = randInt(1, 5), b = randInt(1, 10 - a);
    return q(`${a} + ${b} = ${a + b}, so ${a + b} - ${b} = ?`, a, {
      visual: { type: 'tenframe', counts: [a, b] },
      hint: 'The subtraction undoes the addition.',
      explain: `${a} and ${b} make ${a + b}. Take the ${b} back off and ${a} is left.`,
    });
  }
  if (kind === 'fromTen') {
    const b = randInt(1, 9);
    return q(`10 - ${b} = ?`, 10 - b, {
      visual: { type: 'tenframe', count: 10 },
      hint: `Cross out ${b} of the 10 dots.`,
      explain: `10 - ${b} = ${10 - b}. ${b} and ${10 - b} are a pair that makes 10.`,
      wrongTags: { [String(11 - b)]: 'count-down-includes-start' },
    });
  }
  const a = randInt(3, 10), b = randInt(1, a - 1);
  return q(`${a} - ${b} = ?`, a - b, {
    visual: { type: 'tenframe', count: a },
    hint: `Start at ${a}. Count back ${b}, starting with ${a - 1}.`,
    explain: `Count back ${b} from ${a}: ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}. ${a} - ${b} = ${a - b}.`,
    wrongTags: { [String(a - b + 1)]: 'count-down-includes-start' },
  });
}

// ---------- Level 3: within 20 with think-addition, count back, make ten back ----------
function level3() {
  const kind = pick(['backThroughTen', 'backThroughTen', 'thinkAdd', 'missingSub', 'countBack', 'story']);
  if (kind === 'thinkAdd') {
    const b = randInt(5, 9), a = randInt(11, Math.min(18, b + 9));
    return q(`Think addition: ${b} + __ = ${a}, so ${a} - ${b} = ?`, a - b, {
      visual: { type: 'tenframe', counts: [10, a - 10] },
      hint: `Count up from ${b}: how many to reach ${a}?`,
      explain: `${b} + ${10 - b} = 10, then 10 + ${a - 10} = ${a}. That is ${a - b} in total, so ${a} - ${b} = ${a - b}.`,
    });
  }
  if (kind === 'missingSub') {
    const a = randInt(11, 18), ans = randInt(2, 9), r = a - ans;
    return q(`${a} - __ = ${r}`, ans, {
      visual: { type: 'numberline', min: 0, max: 20, marks: [r, a] },
      hint: `How far is it from ${r} up to ${a}?`,
      explain: `From ${r} up to ${a} is ${ans}. ${a} - ${ans} = ${r}.`,
    });
  }
  if (kind === 'countBack') {
    const a = randInt(11, 20), b = randInt(1, 3);
    return q(`${a} - ${b} = ?`, a - b, {
      visual: { type: 'numberline', min: 0, max: 20, highlight: a },
      hint: 'A small number: just count back.',
      explain: `Count back ${b} from ${a}: ${Array.from({ length: b }, (_, i) => a - i - 1).join(', ')}. Answer ${a - b}.`,
      wrongTags: { [String(a - b + 1)]: 'count-down-includes-start' },
    });
  }
  if (kind === 'story') {
    const a = randInt(12, 18), b = randInt(a - 10 + 1, 9); // always crosses back through ten
    const thing = pick(['grapes', 'stickers', 'crayons', 'marbles']);
    return q(`Sam has ${a} ${thing} and gives away ${b}. How many are left?`, a - b, {
      visual: { type: 'tenframe', counts: [10, a - 10] },
      hint: `Take away ${a - 10} to get to 10, then take away ${b - (a - 10)} more.`,
      explain: `${a} - ${a - 10} = 10, then 10 - ${b - (a - 10)} = ${a - b}.`,
    });
  }
  const a = randInt(11, 18), b = randInt(a - 10 + 1, 9); // crosses ten
  const toTen = a - 10, rest = b - toTen;
  return q(`${a} - ${b} = ?`, a - b, {
    visual: { type: 'tenframe', counts: [10, toTen] },
    hint: `Make ten back: ${a} - ${toTen} = 10, then take away ${rest} more.`,
    explain: `${a} - ${b}: first ${a} - ${toTen} = 10, then 10 - ${rest} = ${a - b}.`,
    wrongTags: { [String(a - b + 1)]: 'count-down-includes-start', [String(a - b - 1)]: 'lost-count-past-ten' },
  });
}

// ---------- Level 4: two-digit minus one-digit / multiples of ten ----------
function level4() {
  const kind = pick(['noRegroup', 'regroup', 'regroup', 'tens', 'tensFromTens', 'missing', 'story']);
  if (kind === 'noRegroup') {
    const a = randInt(1, 9) * 10 + randInt(3, 9), b = randInt(1, (a % 10) - 1);
    return q(`${a} - ${b} = ?`, a - b, {
      visual: { type: 'base10', value: a },
      hint: 'Take the ones away. The tens do not change.',
      explain: `${a} - ${b}: ${a % 10} ones - ${b} ones = ${(a % 10) - b}, so ${a - b}.`,
      wrongTags: { [String(a - b * 10)]: 'subtracting-ones-from-tens' },
    });
  }
  if (kind === 'regroup') {
    const a = randInt(2, 9) * 10 + randInt(0, 6), b = randInt((a % 10) + 1, 9);
    const ones = a % 10, rest = b - ones;
    return q(`${a} - ${b} = ?`, a - b, {
      visual: { type: 'base10', value: a },
      hint: `Go back to the ten first: ${a} - ${ones} = ${a - ones}, then take away ${rest} more.`,
      explain: `${a} - ${ones} = ${a - ones}, then ${a - ones} - ${rest} = ${a - b}.`,
      wrongTags: { [String(smallerFromLarger(a, b))]: 'smaller-from-larger', [String(a - b + 10)]: 'forgot-regroup-ten' },
    });
  }
  if (kind === 'tensFromTens') {
    const a = randInt(3, 10) * 10, b = randInt(1, a / 10 - 1) * 10;
    return q(`${a} - ${b} = ?`, a - b, {
      visual: { type: 'base10', value: a },
      hint: `${a / 10} tens take away ${b / 10} tens.`,
      explain: `${a / 10} tens - ${b / 10} tens = ${(a - b) / 10} tens = ${a - b}.`,
      wrongTags: { [String(a - b / 10)]: 'tens-as-ones' },
    });
  }
  if (kind === 'missing') {
    const a = randInt(31, 99), t = randInt(1, Math.floor(a / 10) - 1) * 10;
    return q(`${a} - __ = ${a - t}`, t, {
      visual: { type: 'base10', value: a },
      hint: 'Only the tens digit changed. How many tens is that?',
      explain: `From ${a} to ${a - t}, the tens went down by ${t / 10}. That is ${t}.`,
      wrongTags: { [String(t / 10)]: 'tens-as-ones' },
    });
  }
  if (kind === 'story') {
    const a = randInt(35, 99), t = randInt(1, Math.floor(a / 10) - 1) * 10;
    return q(`A bus has ${a} seats. ${t} are taken. How many seats are empty?`, a - t, {
      visual: { type: 'base10', value: a },
      hint: `Count back by tens from ${a}.`,
      explain: `${a} - ${t}: count back ${t / 10} tens: ${Array.from({ length: t / 10 }, (_, i) => a - (i + 1) * 10).join(', ')}. Answer ${a - t}.`,
      wrongTags: { [String(a - t / 10)]: 'subtracting-tens-from-ones' },
    });
  }
  const a = randInt(31, 99), t = randInt(1, Math.floor(a / 10) - 1) * 10;
  return q(`${a} - ${t} = ?`, a - t, {
    visual: { type: 'base10', value: a },
    hint: `${t} is ${t / 10} tens. The ones digit stays ${a % 10}.`,
    explain: `${Math.floor(a / 10)} tens - ${t / 10} tens = ${Math.floor(a / 10) - t / 10} tens, ones stay ${a % 10}. Answer ${a - t}.`,
    wrongTags: { [String(a - t / 10)]: 'subtracting-tens-from-ones' },
  });
}

// ---------- Level 5: two-digit minus two-digit with regrouping; difference by counting up ----------
function level5() {
  const kind = pick(['std', 'std', 'std', 'difference', 'countUp', 'missing', 'story']);
  const a = randInt(41, 99), b = randInt(12, a - 11);
  const bb = (a % 10) >= (b % 10) ? b + ((a % 10) - (b % 10) + 1) : b; // force ones regroup
  const B = Math.min(bb, a - 11);
  const needsRegroup = (a % 10) < (B % 10);
  const sfl = smallerFromLarger(a, B);
  const nextTen = Math.ceil(B / 10) * 10, tensTo = Math.floor(a / 10) * 10;
  const stops = [...new Set([B, nextTen, tensTo, a])].sort((x, y) => x - y);
  const jumps = stops.slice(1).map((s, i) => ({ from: stops[i], to: s, size: s - stops[i] }));
  const upExplain = `${jumps.map((j) => `${j.from} to ${j.to} is ${j.size}`).join(', ')}. ${jumps.map((j) => j.size).join(' + ')} = ${a - B}.`;
  if (kind === 'difference') {
    return q(`What is the difference between ${a} and ${B}?`, a - B, {
      visual: { type: 'numberline', min: B - 5, max: a + 5, marks: [B, a] },
      hint: `Count up from ${B} to ${a}.`,
      explain: `Count up: ${upExplain}`,
      wrongTags: { [String(sfl)]: 'smaller-from-larger' },
    });
  }
  if (kind === 'countUp') {
    return q(`Count up to subtract: ${a} - ${B} = ?`, a - B, {
      visual: { type: 'numberline', min: B - 5, max: a + 5, marks: [B, nextTen, tensTo, a] },
      hint: `Start at ${B}. Jump to ${nextTen}, then to ${tensTo}, then to ${a}. Add the jumps.`,
      explain: upExplain,
      wrongTags: { [String(sfl)]: 'smaller-from-larger' },
    });
  }
  if (kind === 'missing') {
    return q(`${a} - __ = ${a - B}`, B, {
      visual: { type: 'numberline', min: 0, max: a + 5, marks: [a - B, a] },
      hint: `How far from ${a - B} up to ${a}?`,
      explain: `${a} - ${a - B} = ${B}. Check: ${a} - ${B} = ${a - B}.`,
    });
  }
  if (kind === 'story') {
    const [thing, ctx] = pick([['pages', 'A book has'], ['stickers', 'A sheet has'], ['points', 'A game needs']]);
    return q(`${ctx} ${a} ${thing}. You have done ${B}. How many are left?`, a - B, {
      visual: { type: 'base10', value: a },
      hint: 'Subtract the tens, then the ones. Trade a ten if you need to.',
      explain: needsRegroup
        ? `${a} - ${B}: trade a ten so the ones become ${(a % 10) + 10}. ${(a % 10) + 10} - ${B % 10} = ${(a % 10) + 10 - (B % 10)}; tens ${Math.floor(a / 10) - 1} - ${Math.floor(B / 10)} = ${Math.floor(a / 10) - 1 - Math.floor(B / 10)}. Answer ${a - B}.`
        : `${a} - ${B} = ${a - B}.`,
      wrongTags: { [String(sfl)]: 'smaller-from-larger', [String(a - B + 10)]: 'forgot-reduce-tens' },
    });
  }
  return q(`${a} - ${B} = ?`, a - B, {
    visual: { type: 'base10', value: a },
    hint: needsRegroup ? `${a % 10} is less than ${B % 10}: trade one ten for ten ones.` : 'Subtract ones, then tens.',
    explain: needsRegroup
      ? `Trade a ten: ${a} becomes ${Math.floor(a / 10) - 1} tens and ${(a % 10) + 10} ones. Ones: ${(a % 10) + 10} - ${B % 10} = ${(a % 10) + 10 - (B % 10)}. Tens: ${Math.floor(a / 10) - 1} - ${Math.floor(B / 10)} = ${Math.floor(a / 10) - 1 - Math.floor(B / 10)}. Answer ${a - B}.`
      : `Ones: ${a % 10} - ${B % 10} = ${(a % 10) - (B % 10)}. Tens: ${Math.floor(a / 10)} - ${Math.floor(B / 10)}. Answer ${a - B}.`,
    wrongTags: { [String(sfl)]: 'smaller-from-larger', [String(a - B + 10)]: 'forgot-reduce-tens' },
  });
}

// ---------- Level 6: three-digit, including across zeros ----------
function level6() {
  const kind = pick(['std', 'std', 'zero', 'zero', 'thousand', 'missing', 'difference']);
  if (kind === 'thousand') {
    const b = randInt(105, 895);
    return q(`1000 - ${b} = ?`, 1000 - b, {
      visual: { type: 'numberline', min: 0, max: 1000, marks: [b, 1000] },
      hint: `Count up: ${b} to ${Math.ceil(b / 100) * 100}, then to 1000.`,
      explain: `${b} to ${Math.ceil(b / 100) * 100} is ${Math.ceil(b / 100) * 100 - b}, then to 1000 is ${1000 - Math.ceil(b / 100) * 100}. Total ${1000 - b}.`,
      wrongTags: { [String(1000 - b + 100)]: 'zero-column-error', [String(smallerFromLarger(1000, b))]: 'smaller-from-larger' },
    });
  }
  if (kind === 'zero') {
    const a = randInt(2, 9) * 100 + pick([0, 0, randInt(1, 9)]), b = randInt(101, a - 50);
    const B = (b % 10) <= (a % 10) ? b + ((a % 10) - (b % 10) + 1) : b;
    const BB = Math.min(B, a - 1);
    return q(`${a} - ${BB} = ?`, a - BB, {
      visual: { type: 'base10', value: a },
      hint: 'There is a 0 in the tens place. Trade a hundred for 10 tens, then a ten for 10 ones.',
      explain: `${a} - ${BB}: trade so ${a} is ${Math.floor(a / 100) - 1} hundreds, 9 tens, ${(a % 10) + 10} ones. Then subtract each column: ${a - BB}.`,
      wrongTags: { [String(smallerFromLarger(a, BB))]: 'smaller-from-larger', [String(a - BB + 100)]: 'double-borrow-missed' },
    });
  }
  if (kind === 'missing') {
    const a = randInt(300, 999), r = randInt(50, a - 100);
    return q(`${a} - __ = ${r}`, a - r, {
      hint: `How far from ${r} up to ${a}?`,
      explain: `${a} - ${r} = ${a - r}. Check: ${a} - ${a - r} = ${r}.`,
    });
  }
  if (kind === 'difference') {
    const a = randInt(400, 999), b = randInt(100, a - 100);
    return q(`What is the difference between ${b} and ${a}?`, a - b, {
      visual: { type: 'numberline', min: b - 20, max: a + 20, marks: [b, a] },
      hint: `Count up from ${b} to ${a} in hundreds, tens and ones.`,
      explain: `${b} to ${Math.ceil(b / 100) * 100} is ${Math.ceil(b / 100) * 100 - b}; then to ${a} is ${a - Math.ceil(b / 100) * 100}. Total ${a - b}.`,
      wrongTags: { [String(smallerFromLarger(a, b))]: 'smaller-from-larger' },
    });
  }
  const a = randInt(300, 999), b = randInt(100, a - 100);
  const B = (b % 10) <= (a % 10) ? Math.min(a - 100, b + ((a % 10) - (b % 10) + 1)) : b;
  return q(`${a} - ${B} = ?`, a - B, {
    visual: { type: 'base10', value: a },
    hint: 'Subtract ones, tens, hundreds. Trade when the top digit is smaller.',
    explain: `${a} - ${B} = ${a - B}. Work right to left and trade a ten or a hundred when needed.`,
    wrongTags: { [String(smallerFromLarger(a, B))]: 'smaller-from-larger', [String(a - B + 10)]: 'forgot-reduce-tens' },
  });
}

// ---------- Level 7: multi-digit, money with change ----------
function level7() {
  const kind = pick(['four', 'four', 'zeros', 'five', 'change', 'change', 'missing']);
  if (kind === 'change') {
    const paid = pick([500, 1000, 2000, 2000, 5000, 10000]), cost = randInt(105, paid - 5);
    const c = cost - (cost % 5); // no pennies: prices in 5-cent steps
    const ans = ((paid - c) / 100).toFixed(2);
    return q(`You pay with ${money(paid)} for something that costs ${money(c)}. How much change?  (like 6.35)`, ans, {
      hint: `Count up from ${money(c)} to the next dollar, then up to ${money(paid)}.`,
      explain: `Count up: ${money(c)} to $${Math.ceil(c / 100).toFixed(2)} is ${money(Math.ceil(c / 100) * 100 - c)}, then to ${money(paid)} is ${money(paid - Math.ceil(c / 100) * 100)}. Change $${ans}.`,
      wrongTags: { [((paid - c + 100) / 100).toFixed(2)]: 'zero-column-error' },
    });
  }
  if (kind === 'zeros') {
    const a = pick([5003, 4000, 7002, 6010, 9001, 3000, 8005]), b = randInt(1111, a - 500);
    return q(`${fmt(a)} - ${fmt(b)} = ?`, a - b, {
      hint: 'Zeros in the middle: borrow across them, or count up from the smaller number.',
      explain: `${fmt(a)} - ${fmt(b)} = ${fmt(a - b)}. Counting up: ${fmt(b)} to ${fmt(Math.ceil(b / 1000) * 1000)} is ${Math.ceil(b / 1000) * 1000 - b}, then on to ${fmt(a)}.`,
      wrongTags: { [String(smallerFromLarger(a, b))]: 'smaller-from-larger', [String(a - b + 100)]: 'zero-column-error' },
    });
  }
  if (kind === 'five') {
    const a = randInt(30000, 99999), b = randInt(10000, a - 5000);
    return q(`${fmt(a)} - ${fmt(b)} = ?`, a - b, {
      hint: 'Line up the columns and work from the ones.',
      explain: `${fmt(a)} - ${fmt(b)} = ${fmt(a - b)}.`,
      wrongTags: { [String(smallerFromLarger(a, b))]: 'smaller-from-larger' },
    });
  }
  if (kind === 'missing') {
    const a = randInt(5000, 9999), r = randInt(1000, a - 1000);
    return q(`${fmt(a)} - __ = ${fmt(r)}`, a - r, {
      hint: `Find how far it is from ${fmt(r)} up to ${fmt(a)}.`,
      explain: `${fmt(a)} - ${fmt(r)} = ${fmt(a - r)}. Check: ${fmt(a)} - ${fmt(a - r)} = ${fmt(r)}.`,
    });
  }
  const a = randInt(2000, 9999), b = randInt(1000, a - 500);
  return q(`${fmt(a)} - ${fmt(b)} = ?`, a - b, {
    hint: 'Subtract column by column, trading when the top digit is smaller.',
    explain: `${fmt(a)} - ${fmt(b)} = ${fmt(a - b)}.`,
    wrongTags: { [String(smallerFromLarger(a, b))]: 'smaller-from-larger', [String(a - b + 1000)]: 'forgot-reduce-thousands' },
  });
}

// ---------- Level 8: decimals, like fractions, elapsed time ----------
function level8() {
  const kind = pick(['dec', 'dec', 'decPad', 'decPad', 'frac', 'frac', 'elapsed', 'elapsed']);
  if (kind === 'frac') {
    const d = pick([4, 5, 6, 8, 10, 12]);
    const n1 = randInt(2, d - 1), n2 = randInt(1, n1 - 1);
    const ans = frac(n1 - n2, d);
    return q(`${n1}/${d} - ${n2}/${d} = ?  (write a fraction like 1/4)`, ans, {
      visual: { type: 'fractionbar', parts: d, shaded: n1 },
      hint: 'Same-size pieces: take away pieces, keep the bottom number.',
      explain: `${n1}/${d} - ${n2}/${d} = ${n1 - n2}/${d}${ans !== `${n1 - n2}/${d}` ? ` = ${ans}` : ''}.`,
      wrongTags: { [`${n1 - n2}/0`]: 'subtract-denominators', [`${n1 - n2}/${d - d}`]: 'subtract-denominators' },
    });
  }
  if (kind === 'elapsed') {
    const sh = randInt(1, 10), sm = pick([0, 15, 30, 45, 10, 20, 50]);
    const dur = randInt(35, 170);
    const total = sh * 60 + sm + dur, eh = Math.floor(total / 60), em = total % 60;
    const pad = (m) => String(m).padStart(2, '0');
    const nextHour = (sh + 1) * 60;
    return q(`A movie starts at ${sh}:${pad(sm)} and ends at ${eh}:${pad(em)}. How many minutes long is it?`, dur, {
      visual: { type: 'clock', hour: sh, minute: sm },
      hint: `Count up: ${sh}:${pad(sm)} to ${sh + 1}:00 is ${60 - sm} minutes, then hours, then the rest.`,
      explain: `${sh}:${pad(sm)} to ${sh + 1}:00 is ${60 - sm} min; ${sh + 1}:00 to ${eh}:${pad(em)} is ${total - nextHour} min. ${60 - sm} + ${total - nextHour} = ${dur} min.`,
      wrongTags: { [String(Math.abs((eh - sh) * 100 + (em - sm)))]: 'time-as-base-100' },
    });
  }
  if (kind === 'decPad') {
    const a = randInt(30, 99) / 10, b = randInt(101, Math.floor(a * 100) - 50) / 100;
    const ans = dec(a - b, 2);
    const unpadded = dec(a / 10 - b, 2);
    return q(`${a.toFixed(1)} - ${b.toFixed(2)} = ?`, ans, {
      hint: `Write ${a.toFixed(1)} as ${a.toFixed(2)} first so the hundredths line up.`,
      explain: `${a.toFixed(2)} - ${b.toFixed(2)} = ${ans}. Pad with a zero so both have two decimal places.`,
      wrongTags: { [unpadded]: 'decimal-not-padded' },
    });
  }
  const places = pick([1, 2]);
  const scale = places === 1 ? 10 : 100;
  const a = randInt(30 * (scale / 10), 99 * (scale / 10)) / scale, b = randInt(10 * (scale / 10), Math.floor(a * scale) - 5) / scale;
  const ans = dec(a - b, places);
  return q(`${a.toFixed(places)} - ${b.toFixed(places)} = ?`, ans, {
    hint: 'Line up the decimal points. Subtract like whole numbers.',
    explain: `${a.toFixed(places)} - ${b.toFixed(places)} = ${ans}.`,
    wrongTags: { [dec(a - b + 1, places)]: 'forgot-reduce-whole' },
  });
}

// ---------- Level 9: unlike fractions, mixed with regrouping, integers ----------
function level9() {
  const kind = pick(['unlike', 'unlike', 'mixed', 'subNeg', 'subNeg', 'negMinus', 'negMinusNeg']);
  if (kind === 'subNeg') {
    const a = randInt(-10, 15), b = -randInt(1, 15);
    const ans = a - b;
    return q(`${a} - (${b}) = ?`, ans, {
      visual: { type: 'numberline', min: Math.min(a, 0) - 5, max: Math.max(ans, 0) + 5, marks: [a, ans] },
      hint: 'Subtracting a negative is the same as adding its opposite.',
      explain: `${a} - (${b}) = ${a} + ${-b} = ${ans}. Taking away a debt is a gain.`,
      wrongTags: { [String(a + b)]: 'subtract-negative-as-positive', [String(-ans)]: 'integer-sign' },
    });
  }
  if (kind === 'negMinus') {
    const a = -randInt(1, 30), b = randInt(1, 30);
    return q(`${a} - ${b} = ?`, a - b, {
      visual: { type: 'numberline', min: a - b - 5, max: 5, marks: [a, a - b] },
      hint: `Start at ${a} and move ${b} further left.`,
      explain: `${a} - ${b}: start below zero and go ${b} more below. ${a} - ${b} = ${a - b}.`,
      wrongTags: { [String(b + a)]: 'integer-direction', [String(-(a - b))]: 'integer-sign' },
    });
  }
  if (kind === 'negMinusNeg') {
    const a = -randInt(2, 30), b = -randInt(1, 30);
    const ans = a - b;
    return q(`${a} - (${b}) = ?`, ans, {
      visual: { type: 'numberline', min: Math.min(a, ans) - 5, max: Math.max(ans, 0) + 5, marks: [a, ans] },
      hint: `Change it to ${a} + ${-b}.`,
      explain: `${a} - (${b}) = ${a} + ${-b} = ${ans}.`,
      wrongTags: { [String(a + b)]: 'subtract-negative-as-positive' },
    });
  }
  if (kind === 'mixed') {
    const d = pick([4, 6, 8]);
    const w1 = randInt(2, 6), n1 = randInt(1, d - 2), w2 = randInt(1, w1 - 1), n2 = randInt(n1 + 1, d - 1); // forces regroup
    const top = (w1 * d + n1) - (w2 * d + n2);
    const ans = mixedStr(top, d);
    const wrongWay = mixedStr((w1 - w2) * d + (n2 - n1), d); // subtracts the small fraction from the big one
    const noRegroup = `${w1 - w2} ${frac(Math.abs(n1 - n2), d)}`;
    const choices = shuffle(uniq([ans, wrongWay, noRegroup, mixedStr(top + d, d), mixedStr(top - 1, d)]).slice(0, 4));
    return q(`${w1} ${n1}/${d} - ${w2} ${n2}/${d} = ?`, ans, {
      choices: choices.includes(ans) ? choices : shuffle(uniq([ans, ...choices.slice(0, 3)])),
      visual: { type: 'fractionbar', bars: [{ parts: d, shaded: n1 }, { parts: d, shaded: n2 }] },
      hint: `${n1}/${d} is less than ${n2}/${d}: trade one whole for ${d}/${d} first.`,
      explain: `${w1} ${n1}/${d} = ${w1 - 1} ${n1 + d}/${d}. Then ${w1 - 1} - ${w2} = ${w1 - 1 - w2} and ${n1 + d}/${d} - ${n2}/${d} = ${frac(n1 + d - n2, d)}. Answer ${ans}.`,
      wrongTags: { [wrongWay]: 'subtract-wrong-way', [noRegroup]: 'subtract-wrong-way' },
    });
  }
  const pairs = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 6], [4, 8], [5, 10], [6, 12], [4, 12], [3, 5], [4, 10]];
  const [d1, d2] = shuffle(pick(pairs));
  const L = (d1 * d2) / gcd(d1, d2);
  let n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
  // make the first fraction the larger one
  if ((n1 * L) / d1 <= (n2 * L) / d2) {
    n1 = d1 - 1;
    while ((n1 * L) / d1 <= (n2 * L) / d2 && n2 > 1) n2--;
    if ((n1 * L) / d1 <= (n2 * L) / d2) n2 = 1;
  }
  const top = (n1 * L) / d1 - (n2 * L) / d2;
  const ans = top === 0 ? '0' : frac(top, L);
  return q(`${n1}/${d1} - ${n2}/${d2} = ?  (write a fraction like 5/12)`, ans, {
    visual: { type: 'fractionbar', bars: [{ parts: d1, shaded: n1 }, { parts: d2, shaded: n2 }] },
    hint: `Change both to ${L}ths: ${(n1 * L) / d1}/${L} and ${(n2 * L) / d2}/${L}.`,
    explain: `${n1}/${d1} = ${(n1 * L) / d1}/${L}, ${n2}/${d2} = ${(n2 * L) / d2}/${L}. ${(n1 * L) / d1}/${L} - ${(n2 * L) / d2}/${L} = ${top}/${L}${ans !== `${top}/${L}` ? ` = ${ans}` : ''}.`,
    wrongTags: { [`${Math.abs(n1 - n2)}/${Math.abs(d1 - d2) || 1}`]: 'subtract-denominators', [`${Math.abs(n1 - n2)}/${L}`]: 'unconverted-numerators' },
  });
}

// ---------- Level 10: rational, mixed forms, multi-step ----------
function level10() {
  const kind = pick(['negDec', 'negDec', 'mixedForm', 'mixedForm', 'twoStep', 'bigInt', 'fracDec']);
  if (kind === 'mixedForm') {
    const w = randInt(8, 20), fr = pick([[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 5, 0.2], [4, 5, 0.8]]);
    const d = randInt(100, (w - 1) * 100) / 100;
    const ans = dec(w + fr[2] - d, 2);
    return q(`${w} ${fr[0]}/${fr[1]} - ${d.toFixed(2)} = ?  (answer as a decimal)`, ans, {
      hint: `${fr[0]}/${fr[1]} = ${fr[2]}, so ${w} ${fr[0]}/${fr[1]} = ${(w + fr[2]).toFixed(2)}.`,
      explain: `${w} ${fr[0]}/${fr[1]} = ${(w + fr[2]).toFixed(2)}. ${(w + fr[2]).toFixed(2)} - ${d.toFixed(2)} = ${ans}.`,
      wrongTags: { [dec(w + fr[0] / 10 - d, 2)]: 'fraction-as-decimal-digits' },
    });
  }
  if (kind === 'twoStep') {
    const a = randInt(300, 999), b = randInt(50, 200), c = randInt(50, 200);
    return q(`${a} - ${b} - ${c} = ?`, a - b - c, {
      hint: `Take ${b} away first, then ${c}. Or take away ${b + c} all at once.`,
      explain: `${a} - ${b} = ${a - b}, then ${a - b} - ${c} = ${a - b - c}. (Same as ${a} - ${b + c}.)`,
      wrongTags: { [String(a - b + c)]: 'sign-of-second-subtraction' },
    });
  }
  if (kind === 'bigInt') {
    const a = -randInt(10, 60), b = -randInt(10, 90);
    const ans = a - b;
    return q(`${a} - (${b}) = ?`, ans, {
      visual: { type: 'numberline', min: Math.min(a, ans) - 10, max: Math.max(ans, 0) + 10, marks: [a, ans] },
      hint: `Rewrite as ${a} + ${-b}.`,
      explain: `${a} - (${b}) = ${a} + ${-b} = ${ans}.`,
      wrongTags: { [String(a + b)]: 'subtract-negative-as-positive', [String(-ans)]: 'integer-sign' },
    });
  }
  if (kind === 'fracDec') {
    const fr = pick([[3, 4, 0.75], [1, 2, 0.5], [1, 4, 0.25], [2, 5, 0.4], [3, 5, 0.6], [1, 8, 0.125]]);
    const d = randInt(10, 30) / 10;
    const places = fr[2] === 0.125 ? 3 : 2;
    const ans = dec(fr[2] - d, places);
    return q(`${fr[0]}/${fr[1]} - ${d.toFixed(1)} = ?  (answer as a decimal)`, ans, {
      visual: { type: 'numberline', min: -4, max: 1, marks: [fr[2], fr[2] - d] },
      hint: `${fr[0]}/${fr[1]} = ${fr[2]}. Taking away more than you have goes below zero.`,
      explain: `${fr[2]} - ${d.toFixed(1)} = ${ans}. The answer is negative because ${d.toFixed(1)} is bigger than ${fr[2]}.`,
      wrongTags: { [dec(d - fr[2], places)]: 'integer-sign' },
    });
  }
  const a = -(randInt(10, 99) / 10), b = randInt(100, 999) / 100;
  const ans = dec(a - b, 2);
  return q(`${a.toFixed(1)} - ${b.toFixed(2)} = ?`, ans, {
    visual: { type: 'numberline', min: Math.floor(a - b) - 1, max: 1, marks: [a, a - b] },
    hint: 'Both parts push further below zero. Add the sizes and keep the minus sign.',
    explain: `${a.toFixed(1)} - ${b.toFixed(2)}: ${(-a).toFixed(2)} + ${b.toFixed(2)} = ${(-a + b).toFixed(2)} below zero, so ${ans}.`,
    wrongTags: { [dec(-(a - b), 2)]: 'integer-sign', [dec(a + b, 2)]: 'integer-direction' },
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
  id: 'sub', name: 'Subtraction', emoji: '➖', group: 'number',
  start: { 1: 1, 3: 3, 4: 5 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return cleanTags(LEVELS[lvl - 1]());
  },
};
