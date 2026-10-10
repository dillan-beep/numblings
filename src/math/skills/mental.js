// Mental math strategies — curriculum ladder A17. Every prompt names the strategy.
import { randInt, pick, shuffle } from '../rng.js';

const THIN = ' ';
const fmt = (n) => {
  const neg = n < 0, s = String(Math.abs(n));
  if (s.length < 5) return (neg ? '-' : '') + s;
  return (neg ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
};
const dec = (x, places) => Number(x.toFixed(places)).toString();
const uniq = (arr) => [...new Set(arr.map(String))];
const q = (prompt, answer, extra = {}) => ({ prompt, answer: String(answer), ...extra });

// ---------- Level 1: count on 1, 2, 3; count back 1, 2 ----------
function level1() {
  const kind = pick(['on', 'on', 'on', 'back', 'back']);
  if (kind === 'on') {
    const k = randInt(1, 3), a = randInt(2, 10 - k), swap = Math.random() < 0.3;
    const steps = Array.from({ length: k }, (_, i) => a + i + 1);
    return q(`Count on: ${swap ? `${k} + ${a}` : `${a} + ${k}`} = ?`, a + k, {
      visual: { type: 'numberline', min: 0, max: 10, highlight: a },
      hint: `Say ${a}, then count on ${k} more: ${steps[0]}...`,
      explain: `Start at ${a}. Count on ${k}: ${steps.join(', ')}. ${a} + ${k} = ${a + k}.`,
      wrongTags: { [String(a + k - 1)]: 'count-start-on-first' },
    });
  }
  const k = randInt(1, 2), a = randInt(k + 1, 10);
  const steps = Array.from({ length: k }, (_, i) => a - i - 1);
  return q(`Count back: ${a} - ${k} = ?`, a - k, {
    visual: { type: 'numberline', min: 0, max: 10, highlight: a },
    hint: `Say ${a}, then count back ${k}: ${steps[0]}...`,
    explain: `Start at ${a}. Count back ${k}: ${steps.join(', ')}. ${a} - ${k} = ${a - k}.`,
    wrongTags: { [String(a - k + 1)]: 'count-start-on-first' },
  });
}

// ---------- Level 2: doubles to 10 + 10; plus and minus 10 ----------
function level2() {
  const kind = pick(['double', 'double', 'plusTen', 'minusTen', 'halfDouble']);
  if (kind === 'double') {
    const a = randInt(1, 10);
    return q(`Doubles: ${a} + ${a} = ?`, 2 * a, {
      visual: { type: 'tenframe', counts: [a, a] },
      hint: `Two groups of ${a}. Picture ${a} fingers on each hand.`,
      explain: `Double ${a} is ${2 * a}. ${a} + ${a} = ${2 * a}.`,
      wrongTags: { [String(2 * a + 1)]: 'double-off-by-one', [String(2 * a - 1)]: 'double-off-by-one' },
    });
  }
  if (kind === 'halfDouble') {
    const a = randInt(2, 10);
    return q(`Doubles: what number doubled makes ${2 * a}?`, a, {
      visual: { type: 'tenframe', counts: [a, a] },
      hint: `Split ${2 * a} into two equal groups.`,
      explain: `${a} + ${a} = ${2 * a}, so ${a} doubled makes ${2 * a}.`,
    });
  }
  if (kind === 'plusTen') {
    const a = randInt(1, 10);
    return q(`Plus 10: ${a} + 10 = ?`, a + 10, {
      visual: { type: 'tenframe', counts: [10, a] },
      hint: 'A full ten frame and some more.',
      explain: `${a} + 10: ten and ${a} more is ${a + 10}. Only the tens digit changes.`,
      wrongTags: { [String(a + 1)]: 'tens-vs-ones' },
    });
  }
  const a = randInt(11, 20);
  return q(`Minus 10: ${a} - 10 = ?`, a - 10, {
    visual: { type: 'tenframe', counts: [10, a - 10] },
    hint: 'Take away the full ten frame. What is left?',
    explain: `${a} is ten and ${a - 10}. Take the ten away and ${a - 10} is left.`,
    wrongTags: { [String(a - 1)]: 'tens-vs-ones' },
  });
}

// ---------- Level 3: make ten; near doubles; ten-and-some-more ----------
function level3() {
  const kind = pick(['makeTen', 'makeTen', 'nearDouble', 'nearDouble', 'tenAndMore', 'makeTenBack']);
  if (kind === 'makeTen') {
    const a = randInt(6, 9), b = randInt(11 - a, 9);
    const swap = Math.random() < 0.3, x = swap ? b : a, y = swap ? a : b;
    const big = Math.max(a, b), small = Math.min(a, b), gap = 10 - big;
    return q(`Make ten: ${x} + ${y} = ?`, a + b, {
      visual: { type: 'tenframe', counts: [x, y] },
      hint: `${big} needs ${gap} to make 10. Take ${gap} from the ${small}.`,
      explain: `${big} + ${gap} = 10, and ${small} - ${gap} = ${small - gap}. So 10 + ${small - gap} = ${a + b}.`,
      wrongTags: { [String(a + b - 1)]: 'lost-count-past-ten', [String(10 + small)]: 'decomposed-wrong-addend' },
    });
  }
  if (kind === 'makeTenBack') {
    const a = randInt(11, 18), b = randInt(a - 10 + 1, 9);
    const toTen = a - 10;
    return q(`Make ten back: ${a} - ${b} = ?`, a - b, {
      visual: { type: 'tenframe', counts: [10, toTen] },
      hint: `${a} - ${toTen} gets you to 10. Then take away ${b - toTen} more.`,
      explain: `${a} - ${toTen} = 10, then 10 - ${b - toTen} = ${a - b}.`,
      wrongTags: { [String(a - b + 1)]: 'count-down-includes-start' },
    });
  }
  if (kind === 'nearDouble') {
    const a = randInt(4, 9), swap = Math.random() < 0.5;
    const x = swap ? a + 1 : a, y = swap ? a : a + 1;
    return q(`Near doubles: ${x} + ${y} = ?`, 2 * a + 1, {
      visual: { type: 'tenframe', counts: [x, y] },
      hint: `Double ${a} is ${2 * a}. Then add 1.`,
      explain: `${x} + ${y} = ${a} + ${a} + 1 = ${2 * a} + 1 = ${2 * a + 1}.`,
      wrongTags: { [String(2 * a)]: 'near-double-forgot-one', [String(2 * a + 2)]: 'decomposed-wrong-addend' },
    });
  }
  const a = randInt(1, 9), swap = Math.random() < 0.5;
  return q(`Ten and some more: ${swap ? `${a} + 10` : `10 + ${a}`} = ?`, 10 + a, {
    visual: { type: 'tenframe', counts: [10, a] },
    hint: 'Ten and some more is a teen number.',
    explain: `10 + ${a} = ${10 + a}. A ten and ${a} ${a === 1 ? 'one' : 'ones'}.`,
    wrongTags: { [String(a + 1)]: 'tens-vs-ones' },
  });
}

// ---------- Level 4: add/subtract 9 and 11 by compensation; adding tens ----------
function level4() {
  const kind = pick(['add9', 'add9', 'add11', 'sub9', 'sub11', 'addTens', 'addTens', 'subTens']);
  if (kind === 'add9') {
    const a = randInt(12, 88);
    return q(`Add 9: ${a} + 9 = ?`, a + 9, {
      visual: { type: 'numberline', min: a - 2, max: a + 12, marks: [a, a + 10, a + 9] },
      hint: `Add 10, then take 1 away: ${a} + 10 = ${a + 10}.`,
      explain: `${a} + 9 = ${a} + 10 - 1 = ${a + 10} - 1 = ${a + 9}.`,
      wrongTags: { [String(a + 10)]: 'forgot-adjust', [String(a + 11)]: 'adjust-wrong-direction' },
    });
  }
  if (kind === 'add11') {
    const a = randInt(12, 86);
    return q(`Add 11: ${a} + 11 = ?`, a + 11, {
      visual: { type: 'numberline', min: a - 2, max: a + 14, marks: [a, a + 10, a + 11] },
      hint: `Add 10, then 1 more: ${a} + 10 = ${a + 10}.`,
      explain: `${a} + 11 = ${a} + 10 + 1 = ${a + 10} + 1 = ${a + 11}.`,
      wrongTags: { [String(a + 10)]: 'forgot-adjust', [String(a + 9)]: 'adjust-wrong-direction' },
    });
  }
  if (kind === 'sub9') {
    const a = randInt(20, 99);
    return q(`Subtract 9: ${a} - 9 = ?`, a - 9, {
      visual: { type: 'numberline', min: a - 12, max: a + 2, marks: [a, a - 10, a - 9] },
      hint: `Take 10 away, then add 1 back: ${a} - 10 = ${a - 10}.`,
      explain: `${a} - 9 = ${a} - 10 + 1 = ${a - 10} + 1 = ${a - 9}.`,
      wrongTags: { [String(a - 10)]: 'forgot-adjust', [String(a - 11)]: 'adjust-wrong-direction' },
    });
  }
  if (kind === 'sub11') {
    const a = randInt(22, 99);
    return q(`Subtract 11: ${a} - 11 = ?`, a - 11, {
      visual: { type: 'numberline', min: a - 14, max: a + 2, marks: [a, a - 10, a - 11] },
      hint: `Take 10 away, then 1 more: ${a} - 10 = ${a - 10}.`,
      explain: `${a} - 11 = ${a} - 10 - 1 = ${a - 10} - 1 = ${a - 11}.`,
      wrongTags: { [String(a - 10)]: 'forgot-adjust', [String(a - 9)]: 'adjust-wrong-direction' },
    });
  }
  if (kind === 'subTens') {
    const a = randInt(41, 99), t = randInt(1, Math.floor(a / 10) - 1) * 10;
    return q(`Subtract tens: ${a} - ${t} = ?`, a - t, {
      visual: { type: 'base10', value: a },
      hint: `Count back ${t / 10} ${t === 10 ? 'ten' : 'tens'}. The ones digit stays ${a % 10}.`,
      explain: `${a} - ${t}: ${Math.floor(a / 10)} tens - ${t / 10} ${t === 10 ? 'ten' : 'tens'} = ${Math.floor(a / 10) - t / 10} ${Math.floor(a / 10) - t / 10 === 1 ? 'ten' : 'tens'}, ones stay ${a % 10}. Answer ${a - t}.`,
      wrongTags: { [String(a - t / 10)]: 'subtracting-tens-from-ones' },
    });
  }
  const a = randInt(11, 69), t = randInt(1, Math.floor((99 - a) / 10)) * 10;
  return q(`Add tens: ${a} + ${t} = ?`, a + t, {
    visual: { type: 'base10', value: a },
    hint: `Count on ${t / 10} ${t === 10 ? 'ten' : 'tens'} from ${a}.`,
    explain: `${a} + ${t}: count on by tens, ${Array.from({ length: t / 10 }, (_, i) => a + (i + 1) * 10).join(', ')}. Answer ${a + t}.`,
    wrongTags: { [String(a + t / 10)]: 'adding-tens-to-ones' },
  });
}

// ---------- Level 5: break apart by place value; count up for subtraction ----------
function level5() {
  const kind = pick(['breakApart', 'breakApart', 'breakApart', 'countUp', 'countUp', 'countUpStory']);
  if (kind === 'breakApart') {
    const a = randInt(23, 69), b = randInt(14, 99 - a);
    const B = Math.max(12, b);
    const tens = Math.floor(a / 10) * 10 + Math.floor(B / 10) * 10, ones = (a % 10) + (B % 10);
    return q(`Break apart: ${a} + ${B} = ?`, a + B, {
      visual: { type: 'base10', value: a },
      hint: `Tens: ${Math.floor(a / 10) * 10} + ${Math.floor(B / 10) * 10}. Ones: ${a % 10} + ${B % 10}.`,
      explain: `${a} + ${B} = (${Math.floor(a / 10) * 10} + ${Math.floor(B / 10) * 10}) + (${a % 10} + ${B % 10}) = ${tens} + ${ones} = ${a + B}.`,
      wrongTags: { [String(tens + (ones % 10))]: 'lost-partial-sum', [String(tens)]: 'lost-partial-sum' },
    });
  }
  const a = randInt(51, 99), b = randInt(a - 39, a - 12);
  const nextTen = Math.ceil(b / 10) * 10, lastTen = Math.floor(a / 10) * 10;
  const j1 = nextTen - b;
  const stops = [...new Set([b, nextTen, lastTen, a])].sort((x, y) => x - y);
  const jumps = stops.slice(1).map((s, i) => ({ from: stops[i], to: s, size: s - stops[i] }));
  const explain = `${jumps.map((j) => `${j.from} to ${j.to} is ${j.size}`).join(', ')}. ${jumps.map((j) => j.size).join(' + ')} = ${a - b}.`;
  if (kind === 'countUpStory') {
    return q(`Count up: Mia has ${b} points and needs ${a}. How many more points?`, a - b, {
      visual: { type: 'numberline', min: b - 5, max: a + 5, marks: stops },
      hint: `Jump from ${b} up to ${stops.slice(1).join(', then to ')}.`,
      explain,
      wrongTags: { [String(a - b - j1)]: 'lost-partial-sum' },
    });
  }
  return q(`Count up: ${a} - ${b} = ?`, a - b, {
    visual: { type: 'numberline', min: b - 5, max: a + 5, marks: stops },
    hint: `Start at ${b}. Jump to ${stops.slice(1).join(', then to ')}. Add the jumps.`,
    explain,
    wrongTags: { [String(a - b - j1)]: 'lost-partial-sum', [String(a - b + j1)]: 'lost-partial-sum' },
  });
}

// ---------- Level 6: compensation / friendly numbers; doubling and halving ----------
function level6() {
  const kind = pick(['friendlyAdd', 'friendlyAdd', 'friendlySub', 'doubleHalve', 'half', 'double', 'nearHundred']);
  if (kind === 'friendlyAdd') {
    const a = pick([99, 199, 299, 399, 499, 98, 198, 298, 97, 397]), b = randInt(104, 999 - a);
    const up = Math.ceil(a / 100) * 100, d = up - a;
    return q(`Friendly numbers: ${a} + ${b} = ?`, a + b, {
      visual: { type: 'numberline', min: a + b - 20, max: up + b + 5, marks: [up + b, a + b] },
      hint: `${a} is ${d} less than ${up}. Add ${up}, then take ${d} away.`,
      explain: `${a} + ${b} = ${up} + ${b} - ${d} = ${up + b} - ${d} = ${a + b}.`,
      wrongTags: { [String(up + b + d)]: 'adjust-wrong-direction', [String(up + b)]: 'forgot-adjust' },
    });
  }
  if (kind === 'friendlySub') {
    const b = pick([99, 199, 299, 98, 198, 97, 49, 149]), a = randInt(b + 50, 999);
    const up = Math.ceil(b / 100) * 100 === b ? b + 1 : Math.ceil(b / 50) * 50, d = up - b;
    return q(`Friendly numbers: ${a} - ${b} = ?`, a - b, {
      visual: { type: 'numberline', min: a - up - 10, max: a + 5, marks: [a - up, a - b, a] },
      hint: `Take away ${up} instead, then give ${d} back.`,
      explain: `${a} - ${b} = ${a} - ${up} + ${d} = ${a - up} + ${d} = ${a - b}.`,
      wrongTags: { [String(a - up - d)]: 'adjust-wrong-direction', [String(a - up)]: 'forgot-adjust' },
    });
  }
  if (kind === 'nearHundred') {
    const a = randInt(2, 8) * 100 + pick([1, 2, 3]), b = randInt(100, a - 150) + pick([97, 98, 99]) - 100;
    const B = Math.max(10, b);
    return q(`Compensation: ${a} - ${B} = ?`, a - B, {
      hint: `Change both by the same amount: ${a} - ${B} is the same as ${a - (a % 100)} - ${B - (a % 100)}.`,
      explain: `Shift both down by ${a % 100}: ${a - (a % 100)} - ${B - (a % 100)} = ${a - B}. The difference stays the same.`,
      wrongTags: { [String(a - B + 2 * (a % 100))]: 'adjust-wrong-direction' },
    });
  }
  if (kind === 'doubleHalve') {
    const pairs = [[16, 5], [14, 5], [18, 5], [12, 5], [24, 5], [36, 5], [15, 4], [25, 4], [35, 4], [45, 4], [8, 25], [6, 25], [12, 25], [16, 25], [14, 50], [18, 50]];
    const [p, r] = pick(pairs), swap = Math.random() < 0.5;
    // Always halve the even factor so the strategy stays in whole numbers (25 x 4 -> 50 x 2, not 12.5 x 8).
    const [a, b] = p % 2 === 0 ? [p, r] : [r, p];
    return q(`Doubling and halving: ${swap ? `${b} x ${a}` : `${a} x ${b}`} = ?`, a * b, {
      // The array visual is capped at 12 x 12, so only show it when it can show the real product.
      visual: a <= 12 && b <= 12 ? { type: 'array', rows: b, cols: a } : undefined,
      hint: `Halve ${a} and double ${b}: ${a / 2} x ${b * 2}.`,
      explain: `${a} x ${b} = ${a / 2} x ${b * 2} = ${a * b}. Halving one and doubling the other keeps the product.`,
      wrongTags: { [String((a / 2) * b)]: 'halved-only', [String(a * b * 2)]: 'doubled-only' },
    });
  }
  if (kind === 'half') {
    const n = randInt(11, 99) * 2 + pick([0, 0, 2, 4]);
    const N = Math.min(n, 998) - (Math.min(n, 998) % 2);
    let tensPart = Math.floor(N / 10) * 10 - (Math.floor(N / 10) % 2 === 1 ? 10 : 0);
    if (tensPart === N) tensPart -= 20; // keep a real second part (e.g. 40 -> 20 + 20, not 40 + 0)
    const onesPart = N - tensPart;
    return q(`Halving: half of ${N} = ?`, N / 2, {
      hint: `Split ${N} into ${tensPart} + ${onesPart}, then halve each part.`,
      explain: `Half of ${tensPart} is ${tensPart / 2}, half of ${onesPart} is ${onesPart / 2}. ${tensPart / 2} + ${onesPart / 2} = ${N / 2}.`,
      wrongTags: { [String(Math.floor(N / 10) / 2 * 10 + (N % 10) / 2)]: 'halved-digits-separately' },
    });
  }
  const n = randInt(2, 49) * 10 + randInt(1, 9); // never ends in 0, so both parts are worth doubling
  const tens = Math.floor(n / 10) * 10, ones = n % 10;
  return q(`Doubling: double ${n} = ?`, 2 * n, {
    hint: `Double ${tens}, double ${ones}, then add.`,
    explain: `Double ${tens} is ${2 * tens}, double ${ones} is ${2 * ones}. ${2 * tens} + ${2 * ones} = ${2 * n}.`,
    wrongTags: { [String(2 * tens + ones)]: 'doubled-tens-only' },
  });
}

// ---------- Level 7: multiplication strategies ----------
function level7() {
  const kind = pick(['nines', 'nines', 'doubleDouble', 'fives', 'split', 'split', 'eights']);
  if (kind === 'nines') {
    const a = randInt(3, 12), swap = Math.random() < 0.5;
    return q(`Times 9: ${swap ? `${a} x 9` : `9 x ${a}`} = ?`, 9 * a, {
      visual: { type: 'array', rows: 9, cols: a },
      hint: `10 x ${a} = ${10 * a}, then take away one ${a}.`,
      explain: `9 x ${a} = 10 x ${a} - ${a} = ${10 * a} - ${a} = ${9 * a}.`,
      wrongTags: { [String(10 * a - 1)]: 'subtracted-one-not-multiplier', [String(10 * a)]: 'forgot-adjust' },
    });
  }
  if (kind === 'doubleDouble') {
    const a = randInt(6, 25);
    return q(`Double double: 4 x ${a} = ?`, 4 * a, {
      visual: a <= 12 ? { type: 'array', rows: 4, cols: a } : undefined, // array is capped at 12 columns
      hint: `Double ${a} is ${2 * a}. Double again.`,
      explain: `4 x ${a}: double ${a} = ${2 * a}, double ${2 * a} = ${4 * a}.`,
      wrongTags: { [String(2 * a)]: 'doubled-once', [String(2 * a + 2)]: 'added-instead-of-doubling' },
    });
  }
  if (kind === 'eights') {
    const a = randInt(6, 15);
    return q(`Double double double: 8 x ${a} = ?`, 8 * a, {
      hint: `Double ${a} three times: ${2 * a}, ${4 * a}, ...`,
      explain: `8 x ${a}: ${a} doubled is ${2 * a}, again ${4 * a}, again ${8 * a}.`,
      wrongTags: { [String(4 * a)]: 'doubled-twice-only' },
    });
  }
  if (kind === 'fives') {
    const a = randInt(6, 28), swap = Math.random() < 0.5;
    return q(`Times 5: ${swap ? `${a} x 5` : `5 x ${a}`} = ?`, 5 * a, {
      hint: `10 x ${a} = ${10 * a}. Halve it.`,
      explain: `5 x ${a} = (10 x ${a}) / 2 = ${10 * a} / 2 = ${5 * a}.`,
      wrongTags: { [String(10 * a)]: 'forgot-halve', [String(a * 5 * 2)]: 'forgot-halve' },
    });
  }
  const a = pick([12, 13, 14, 15, 16, 17, 18, 11, 19]), b = randInt(3, 9), swap = Math.random() < 0.5;
  const extra = a - 10;
  return q(`Split it: ${swap ? `${b} x ${a}` : `${a} x ${b}`} = ?`, a * b, {
    visual: a <= 12 ? { type: 'array', rows: b, cols: a } : undefined, // array is capped at 12 columns
    hint: `${a} = 10 + ${extra}. Do 10 x ${b} and ${extra} x ${b}, then add.`,
    explain: `${a} x ${b} = 10 x ${b} + ${extra} x ${b} = ${10 * b} + ${extra * b} = ${a * b}.`,
    wrongTags: { [String(10 * b + extra)]: 'split-forgot-multiply', [String(10 * b)]: 'lost-partial-product' },
  });
}

// ---------- Level 8: x25, x50, x11, x12, divide by 5, x10/100/1000 ----------
function level8() {
  const kind = pick(['x25', 'x25', 'x50', 'x11', 'x11', 'x12', 'div5', 'div5', 'pow10']);
  if (kind === 'x25') {
    const A = pick([randInt(2, 25) * 4, randInt(6, 60)]); // often a multiple of 4, sometimes not
    return q(`Times 25: ${A} x 25 = ?`, A * 25, {
      hint: `25 is 100 / 4. Do ${A} x 100 = ${A * 100}, then divide by 4.`,
      explain: `${A} x 25 = ${A} x 100 / 4 = ${A * 100} / 4 = ${A * 25}.`,
      wrongTags: { [String(A * 100)]: 'forgot-divide', [String(A * 25 * 10)]: 'misplaced-zero' },
    });
  }
  if (kind === 'x50') {
    const a = randInt(6, 99) * 2;
    return q(`Times 50: ${a} x 50 = ?`, a * 50, {
      hint: `50 is half of 100. ${a} x 100 = ${a * 100}, then halve.`,
      explain: `${a} x 50 = ${a * 100} / 2 = ${a * 50}.`,
      wrongTags: { [String(a * 100)]: 'forgot-halve', [String(a * 5)]: 'misplaced-zero' },
    });
  }
  if (kind === 'x11') {
    const a = randInt(12, 90);
    return q(`Times 11: 11 x ${a} = ?`, 11 * a, {
      hint: `11 x ${a} = 10 x ${a} + ${a}.`,
      explain: `11 x ${a} = ${10 * a} + ${a} = ${11 * a}.`,
      wrongTags: { [String(10 * a + 1)]: 'added-one-not-multiplier', [String(10 * a)]: 'forgot-adjust' },
    });
  }
  if (kind === 'x12') {
    const a = randInt(12, 60);
    return q(`Times 12: 12 x ${a} = ?`, 12 * a, {
      hint: `10 x ${a} = ${10 * a}, 2 x ${a} = ${2 * a}. Add them.`,
      explain: `12 x ${a} = ${10 * a} + ${2 * a} = ${12 * a}.`,
      wrongTags: { [String(10 * a + 2)]: 'added-two-not-multiplier', [String(11 * a)]: 'lost-partial-product' },
    });
  }
  if (kind === 'div5') {
    const a = randInt(12, 400) * 5;
    return q(`Divide by 5: ${a} / 5 = ?`, a / 5, {
      hint: `Double ${a} to get ${2 * a}, then divide by 10.`,
      explain: `${a} / 5 = (${a} x 2) / 10 = ${2 * a} / 10 = ${a / 5}.`,
      wrongTags: { [String(2 * a)]: 'forgot-divide', [String(a / 50)]: 'misplaced-zero' },
    });
  }
  const p = pick([10, 100, 1000]), a = randInt(3, 99) + pick([0, 0, 0.5, 0.25]);
  const ans = a * p;
  const isDecimal = !Number.isInteger(a);
  return q(`Times ${p}: ${isDecimal ? a : a} x ${p} = ?`, dec(ans, 2), {
    hint: isDecimal ? `Move the decimal point ${String(p).length - 1} places right.` : `Write ${String(p).length - 1} zero${p > 10 ? 's' : ''} on the end.`,
    explain: isDecimal
      ? `${a} x ${p}: shift the digits ${String(p).length - 1} places left, giving ${dec(ans, 2)}.`
      : `${a} x ${p} = ${fmt(ans)}. Each place moves ${String(p).length - 1} to the left.`,
    wrongTags: { [dec(ans / 10, 2)]: 'misplaced-zero', [dec(ans * 10, 2)]: 'misplaced-zero' },
  });
}

// ---------- Level 9: percent benchmarks, fractions of amounts, estimation ----------
function level9() {
  const kind = pick(['ten', 'five', 'one', 'fifteen', 'fifteen', 'fracOf', 'fracOf', 'halfDec', 'estimate']);
  if (kind === 'ten') {
    const n = randInt(3, 99) * 10;
    return q(`10% benchmark: 10% of ${n} = ?`, n / 10, {
      visual: { type: 'fractionbar', parts: 10, shaded: 1 },
      hint: '10% is one tenth. Divide by 10.',
      explain: `10% of ${n} = ${n} / 10 = ${n / 10}.`,
      wrongTags: { [String(n / 100)]: 'misplaced-zero', [String(n - 10)]: 'percent-as-subtract' },
    });
  }
  if (kind === 'five') {
    const n = randInt(2, 60) * 20;
    return q(`5% benchmark: 5% of ${n} = ?`, n / 20, {
      visual: { type: 'fractionbar', parts: 20, shaded: 1 },
      hint: `Find 10% first: ${n / 10}. Then halve it.`,
      explain: `10% of ${n} is ${n / 10}. 5% is half of that: ${n / 20}.`,
      wrongTags: { [String(n / 100)]: 'divided-ten-percent-by-ten' },
    });
  }
  if (kind === 'one') {
    const n = randInt(3, 90) * 100;
    return q(`1% benchmark: 1% of ${n} = ?`, n / 100, {
      hint: '1% is one hundredth. Divide by 100.',
      explain: `1% of ${n} = ${n} / 100 = ${n / 100}.`,
      wrongTags: { [String(n / 10)]: 'misplaced-zero' },
    });
  }
  if (kind === 'fifteen') {
    const pct = pick([15, 20, 30, 15, 25, 35, 15]), n = randInt(2, 40) * 20;
    const tenP = n / 10, fiveP = n / 20;
    const parts = pct === 15 ? `10% (${tenP}) + 5% (${fiveP})` : pct === 25 ? `20% (${2 * tenP}) + 5% (${fiveP})` : pct === 35 ? `30% (${3 * tenP}) + 5% (${fiveP})` : `${pct / 10} lots of 10% (${tenP})`;
    return q(`Percent chunks: ${pct}% of ${n} = ?`, (n * pct) / 100, {
      visual: { type: 'fractionbar', parts: 20, shaded: pct / 5 },
      hint: `Build it from 10% chunks: 10% of ${n} is ${tenP}.`,
      explain: `${pct}% of ${n} = ${parts} = ${(n * pct) / 100}.`,
      wrongTags: { [String(tenP + fiveP / 10)]: 'divided-ten-percent-by-ten' },
    });
  }
  if (kind === 'fracOf') {
    const [num, den] = pick([[1, 4], [3, 4], [2, 3], [1, 3], [3, 5], [2, 5], [5, 8], [3, 8], [1, 6], [5, 6]]);
    const n = den * randInt(4, 15);
    return q(`Fraction of an amount: ${num}/${den} of ${n} = ?`, (n * num) / den, {
      visual: { type: 'fractionbar', parts: den, shaded: num },
      hint: `Find 1/${den} of ${n} first: ${n} / ${den} = ${n / den}. Then take ${num} of those.`,
      explain: `${n} / ${den} = ${n / den}, so 1/${den} of ${n} is ${n / den}. ${num} x ${n / den} = ${(n * num) / den}.`,
      wrongTags: { [String(n / den)]: 'took-one-part-only', [String(n / num)]: 'divided-by-numerator' },
    });
  }
  if (kind === 'halfDec') {
    const n = randInt(12, 99) * 2 + pick([0, 0, 1]);
    return q(`Half as 0.5: 0.5 x ${n} = ?`, dec(n / 2, 1), {
      hint: 'Multiplying by 0.5 is the same as halving.',
      explain: `0.5 x ${n} = half of ${n} = ${dec(n / 2, 1)}.`,
      wrongTags: { [String(n * 5)]: 'misplaced-decimal', [String(n * 2)]: 'doubled-instead' },
    });
  }
  // estimate a product: choice question
  const a = pick([19, 21, 29, 31, 39, 41, 49, 51, 59, 61, 79, 81, 98, 102]), b = pick([9, 11, 19, 21, 31, 29, 41, 51, 6, 7, 8]);
  const ra = Math.round(a / 10) * 10, rb = b < 10 ? b : Math.round(b / 10) * 10; // single digits stay as they are
  const est = ra * rb;
  // Distractors must all be far from the exact product (which is within ~16% of est), so "closest" has one answer.
  const wrong = uniq([est * 10, est / 10, est * 2, Math.round(est / 2), est * 4]).filter((w) => Number(w) !== est && Number(w) > 0);
  const choices = shuffle(uniq([est, ...shuffle(wrong).slice(0, 3)]));
  return q(`Estimate: ${a} x ${b} is closest to which number?`, est, {
    choices,
    hint: `Round: ${a} is about ${ra}, ${b} is about ${rb}.`,
    explain: `${a} x ${b} is about ${ra} x ${rb} = ${fmt(est)}. The exact answer is ${fmt(a * b)}.`,
    wrongTags: { [String(est * 10)]: 'misplaced-zero', [String(est / 10)]: 'misplaced-zero' },
  });
}

// ---------- Level 10: squares to 15^2, square roots, rounding/estimation, integer adds ----------
function level10() {
  const kind = pick(['square', 'square', 'root', 'root', 'intAdd', 'intAdd', 'round', 'estimateSum', 'squareNear']);
  if (kind === 'square') {
    const n = randInt(6, 15);
    return q(`Squares: ${n} squared = ?`, n * n, {
      visual: n <= 12 ? { type: 'array', rows: n, cols: n } : undefined, // array is capped at 12 x 12
      hint: `${n} squared means ${n} x ${n}.`,
      explain: n > 10
        ? `${n} x ${n} = (10 + ${n - 10}) x ${n} = ${10 * n} + ${(n - 10) * n} = ${n * n}.`
        : `${n} x ${n} = ${n * n}.`,
      wrongTags: { [String(2 * n)]: 'square-as-double', [String(n * n + n)]: 'square-off-by-one' },
    });
  }
  if (kind === 'squareNear') {
    const n = randInt(11, 15);
    return q(`Squares: ${n} x ${n} = ?`, n * n, {
      hint: `Split: ${n} x ${n} = ${n} x 10 + ${n} x ${n - 10}.`,
      explain: `${n} x 10 = ${n * 10}, ${n} x ${n - 10} = ${n * (n - 10)}. ${n * 10} + ${n * (n - 10)} = ${n * n}.`,
      wrongTags: { [String(2 * n)]: 'square-as-double' },
    });
  }
  if (kind === 'root') {
    const n = randInt(4, 15);
    return q(`Square root: the square root of ${n * n} = ?`, n, {
      visual: n <= 12 ? { type: 'array', rows: n, cols: n } : undefined, // array is capped at 12 x 12
      hint: `Which number times itself makes ${n * n}?`,
      explain: `${n} x ${n} = ${n * n}, so the square root of ${n * n} is ${n}.`,
      wrongTags: { [String((n * n) / 2)]: 'root-as-half', [String(n + 1)]: 'square-off-by-one' },
    });
  }
  if (kind === 'intAdd') {
    const neg = -randInt(11, 60), pos = randInt(11, 60), swap = Math.random() < 0.5;
    const ans = neg + pos;
    return q(`Integers: ${swap ? `${pos} + (${neg})` : `${neg} + ${pos}`} = ?`, ans, {
      visual: { type: 'numberline', min: Math.min(neg, ans) - 5, max: Math.max(pos, ans) + 5, marks: [neg, ans] },
      hint: `Find the difference between ${-neg} and ${pos}. The sign follows the bigger size.`,
      explain: `${-neg} and ${pos} pull opposite ways. ${Math.max(-neg, pos)} - ${Math.min(-neg, pos)} = ${Math.abs(ans)}, and the bigger size is ${pos > -neg ? 'positive' : 'negative'}, so ${ans}.`,
      wrongTags: { [String(-ans)]: 'integer-sign', [String(neg - pos)]: 'integer-add-magnitudes' },
    });
  }
  if (kind === 'round') {
    const to = pick([10, 100, 1000]), n = randInt(1234, 98765);
    const rounded = Math.round(n / to) * to;
    const name = { 10: 'ten', 100: 'hundred', 1000: 'thousand' }[to];
    const digit = Math.floor(n / (to / 10)) % 10;
    return q(`Rounding: round ${fmt(n)} to the nearest ${name}.`, rounded, {
      hint: `Look at the digit to the right of the ${name}s place: ${digit}. 5 or more rounds up.`,
      explain: `The next digit is ${digit}, so round ${digit >= 5 ? 'up' : 'down'}: ${fmt(n)} rounds to ${fmt(rounded)}.`,
      wrongTags: { [String(Math.floor(n / to) * to)]: 'rounded-down', [String(Math.ceil(n / to) * to)]: 'rounded-up' },
    });
  }
  // estimate a sum/difference: choice
  const a = randInt(1800, 9900) + pick([0, 50, 99]), b = randInt(1200, 8800) + pick([0, 49, 95]);
  // Subtraction only when the numbers are far enough apart that the estimate is not 0 or tiny.
  const op = Math.random() < 0.5 && Math.abs(a - b) >= 1500 ? '-' : '+';
  const [x, y] = op === '-' ? [Math.max(a, b), Math.min(a, b)] : [a, b];
  const rx = Math.round(x / 1000) * 1000, ry = Math.round(y / 1000) * 1000;
  const est = op === '+' ? rx + ry : rx - ry;
  const exact = op === '+' ? x + y : x - y;
  // Rounding error is under 1000, so distractors sit at least 3000 away: the taught estimate is also the closest choice.
  const wrongs = uniq([est + 3000, est - 3000, est + 5000, est * 10, Math.round(est / 10)]).filter((w) => Number(w) !== est && Number(w) > 0);
  const choices = shuffle(uniq([est, ...shuffle(wrongs).slice(0, 3)]));
  return q(`Estimate: ${fmt(x)} ${op} ${fmt(y)} is about ?`, est, {
    choices,
    hint: `Round each to the nearest thousand: ${fmt(rx)} ${op} ${fmt(ry)}.`,
    explain: `${fmt(x)} is about ${fmt(rx)} and ${fmt(y)} is about ${fmt(ry)}. ${fmt(rx)} ${op} ${fmt(ry)} = ${fmt(est)} (exact: ${fmt(exact)}).`,
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
  id: 'mental', name: 'Mental Math', emoji: '🧠', group: 'number',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return cleanTags(LEVELS[lvl - 1]());
  },
};
