// Counting and number sense — curriculum ladder A1.
import { randInt, pick, shuffle } from '../rng.js';

const THIN = ' ';
// Numbers under 10 000 are written plain; larger ones get a thin-space group separator (prompts only).
const fmt = (n) => {
  const neg = n < 0, s = String(Math.abs(n));
  if (s.length < 5) return (neg ? '-' : '') + s;
  return (neg ? '-' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
};
const dec = (x, places) => Number(x.toFixed(places)).toString();
const seq = (arr) => arr.join(', ');
const uniq = (arr) => [...new Set(arr.map(String))];

// ---------- Level 1: count to 10, subitize, after/before ----------
function level1() {
  const kind = pick(['tenframe', 'counters', 'after', 'before', 'dice']);
  if (kind === 'tenframe') {
    const n = randInt(1, 10);
    return {
      prompt: 'How many dots are in the ten frame?', answer: String(n),
      visual: { type: 'tenframe', count: n },
      hint: 'Touch each dot once as you count.',
      explain: `Count each dot one time: 1, 2, 3 ... up to ${n}. There are ${n} dots.`,
    };
  }
  if (kind === 'counters') {
    const n = randInt(1, 8);
    return {
      prompt: 'How many stars can you count?', answer: String(n),
      visual: { type: 'counters', count: n, icon: 'star' },
      hint: 'Count each star just once.',
      explain: `Point to each star and say one number each time. The last number you say, ${n}, is how many.`,
    };
  }
  if (kind === 'dice') {
    const n = randInt(1, 6);
    return {
      prompt: 'How many dots? Try to see it without counting.', answer: String(n),
      visual: { type: 'counters', count: n, icon: 'dot' },
      explain: `This pattern shows ${n} dots. Seeing a small group all at once is called subitizing.`,
    };
  }
  if (kind === 'after') {
    const n = randInt(0, 9);
    return {
      prompt: `What number comes right after ${n}?`, answer: String(n + 1),
      visual: { type: 'numberline', min: 0, max: 10, highlight: n },
      hint: 'Say the numbers in order and listen for the next one.',
      explain: `Counting up: ${n}, ${n + 1}. The number after ${n} is ${n + 1}.`,
    };
  }
  const n = randInt(1, 10);
  return {
    prompt: `What number comes right before ${n}?`, answer: String(n - 1),
    visual: { type: 'numberline', min: 0, max: 10, highlight: n },
    hint: 'The number before is one step to the left on the number line.',
    explain: `Going back one: ${n} becomes ${n - 1}. The number before ${n} is ${n - 1}.`,
  };
}

// ---------- Level 2: count on / back from any number, ordinals, to 20 ----------
function level2() {
  const kind = pick(['on', 'back', 'before', 'after', 'frames', 'ordinal']);
  if (kind === 'on') {
    const start = randInt(5, 17), k = randInt(2, 3), ans = Math.min(20, start + k);
    const steps = Array.from({ length: ans - start }, (_, i) => start + i + 1);
    return {
      prompt: `Start at ${start} and count on ${ans - start}. What number do you land on?`, answer: String(ans),
      visual: { type: 'numberline', min: 0, max: 20, highlight: start },
      hint: `Do not start from 1. Begin at ${start} and say the next numbers.`,
      explain: `Start at ${start}, then count on: ${seq(steps)}. You land on ${ans}.`,
      wrongTags: { [String(ans - 1)]: 'count-start-on-first' },
    };
  }
  if (kind === 'back') {
    const start = randInt(4, 20), k = randInt(1, 3), ans = start - k;
    const steps = Array.from({ length: k }, (_, i) => start - i - 1);
    return {
      prompt: `Start at ${start} and count back ${k}. What number do you land on?`, answer: String(ans),
      visual: { type: 'numberline', min: 0, max: 20, highlight: start },
      hint: 'Counting back means moving left on the number line.',
      explain: `Start at ${start}, then count back: ${seq(steps)}. You land on ${ans}.`,
      wrongTags: { [String(ans + 1)]: 'count-start-on-first' },
    };
  }
  if (kind === 'before') {
    const n = randInt(11, 20);
    return {
      prompt: `What number comes just before ${n}?`, answer: String(n - 1),
      visual: { type: 'numberline', min: 0, max: 20, highlight: n },
      explain: `One step back from ${n} is ${n - 1}.`,
      wrongTags: { [String(n + 1)]: 'before-after-swap' },
    };
  }
  if (kind === 'after') {
    const n = randInt(10, 19);
    return {
      prompt: `What number comes just after ${n}?`, answer: String(n + 1),
      visual: { type: 'numberline', min: 0, max: 20, highlight: n },
      explain: `One step forward from ${n} is ${n + 1}.`,
      wrongTags: { [String(n - 1)]: 'before-after-swap' },
    };
  }
  if (kind === 'frames') {
    const extra = randInt(1, 10), n = 10 + extra;
    const reversed = String(extra) + '1';
    return {
      prompt: 'How many dots are there in the two ten frames?', answer: String(n),
      visual: { type: 'tenframe', counts: [10, extra] },
      hint: 'The first frame is full: that is 10. Count on from 10.',
      explain: `The first frame holds 10. Count on ${extra} more: 10 and ${extra} is ${n}.`,
      wrongTags: { [reversed]: 'teen-reversal' },
    };
  }
  // ordinal
  const animals = shuffle(['cat', 'dog', 'fox', 'hen', 'owl', 'pig', 'cow', 'bee', 'ant', 'elk']).slice(0, randInt(5, 7));
  const ord = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
  const idx = randInt(1, animals.length - 1);
  const wrong = [animals[idx - 1], animals[(idx + 1) % animals.length], animals[0]].filter((a) => a !== animals[idx]);
  return {
    prompt: `In this line: ${animals.join(', ')}. Which one is ${ord[idx]}?`, answer: animals[idx],
    choices: shuffle(uniq([animals[idx], ...wrong]).slice(0, 4)),
    hint: 'The 1st is at the front of the line. Count along from there.',
    explain: `Count the places from the front: ${animals.slice(0, idx + 1).map((a, i) => `${ord[i]} ${a}`).join(', ')}. The ${ord[idx]} is ${animals[idx]}.`,
  };
}

// ---------- Level 3: skip count by 2s, 5s, 10s to 50 ----------
function level3() {
  const step = pick([2, 5, 10, 2, 5]);
  const kind = pick(['next', 'next', 'missing', 'fromStart', 'groups']);
  const maxStart = 50 - step * 4;
  if (kind === 'groups') {
    const g = randInt(2, step === 10 ? 5 : 8);
    const unit = step === 2 ? 'pairs of socks' : step === 5 ? 'hands' : 'boxes of 10 crayons';
    const thing = step === 2 ? 'socks' : step === 5 ? 'fingers' : 'crayons';
    const steps = Array.from({ length: g }, (_, i) => (i + 1) * step);
    return {
      prompt: `There are ${g} ${unit}. Count by ${step}s. How many ${thing} in all?`, answer: String(g * step),
      visual: { type: 'numberline', min: 0, max: Math.max(20, g * step), step, marks: steps },
      hint: `Each group has ${step}. Say ${seq(steps.slice(0, 2))}, ...`,
      explain: `Each group has ${step}, so count by ${step}s: ${seq(steps)}. That is ${g * step} ${thing}.`,
    };
  }
  // 'next' and 'missing' start at the first multiple; 'fromStart' begins at any number (for 2s) or any multiple.
  let start = kind === 'fromStart' ? randInt(1, Math.floor(maxStart / step)) * step : 0;
  if (kind === 'fromStart' && step === 2) start = randInt(1, 20);
  const list = start === 0 ? [step, 2 * step, 3 * step, 4 * step] : [start, start + step, start + 2 * step, start + 3 * step];
  if (kind === 'missing') {
    const hole = randInt(1, 2);
    const shown = list.map((v, i) => (i === hole ? '__' : v));
    return {
      prompt: `Fill in the missing number: ${seq(shown)}`, answer: String(list[hole]),
      visual: { type: 'numberline', min: 0, max: Math.max(20, list[3]), step, marks: list.filter((_, i) => i !== hole) },
      hint: `These numbers go up by ${step} each time.`,
      explain: `Counting by ${step}s: ${seq(list)}. The missing number is ${list[hole]}.`,
      wrongTags: { [String(list[hole] + 1)]: 'skip-count-by-ones', [String(list[hole] - 1)]: 'skip-count-by-ones' },
    };
  }
  const ans = list[3] + step;
  const label = kind === 'fromStart' ? `Count by ${step}s from ${list[0]}: ` : `Count by ${step}s: `;
  return {
    prompt: `${label}${seq(list)}, __`, answer: String(ans),
    visual: { type: 'numberline', min: 0, max: Math.max(20, ans), step, marks: list },
    hint: `Each number is ${step} more than the one before.`,
    explain: `${list[3]} + ${step} = ${ans}. The next number when counting by ${step}s is ${ans}.`,
    wrongTags: { [String(list[3] + 1)]: 'skip-count-by-ones' },
  };
}

// ---------- Level 4: to 120, decade crossing, skip count from any start ----------
function level4() {
  const kind = pick(['decade', 'decade', 'tens', 'tenMore', 'tenLess', 'back', 'fives']);
  if (kind === 'decade') {
    const d = randInt(2, 11) * 10; // 20..110
    const list = [d - 2, d - 1, '__', d + 1];
    return {
      prompt: `Fill in the missing number: ${seq(list)}`, answer: String(d),
      visual: { type: 'numberline', min: d - 5, max: d + 5, marks: [d - 2, d - 1, d + 1] },
      hint: `After ${d - 1} comes a new ten.`,
      explain: `${d - 1} and 1 more is ${d}. The sequence is ${d - 2}, ${d - 1}, ${d}, ${d + 1}.`,
      wrongTags: { [String(d - 10)]: 'decade-crossing', [String(d + 10)]: 'decade-crossing' },
    };
  }
  if (kind === 'tens') {
    const start = randInt(11, 59);
    const list = [start, start + 10, start + 20];
    const wrongOnes = start + 21;
    return {
      prompt: `Count by 10s from ${start}: ${seq(list)}, __`, answer: String(start + 30),
      visual: { type: 'numberline', min: start - 1, max: start + 35, step: 10, marks: list },
      hint: 'Only the tens digit changes when you count by 10s.',
      explain: `${start + 20} + 10 = ${start + 30}. The ones digit stays ${start % 10}; the tens go up by one.`,
      wrongTags: { [String(wrongOnes)]: 'off-decade-skip' },
    };
  }
  if (kind === 'tenMore') {
    const n = randInt(20, 109);
    return {
      prompt: `What is 10 more than ${n}?`, answer: String(n + 10),
      visual: { type: 'base10', value: n },
      hint: 'Add one more ten rod.',
      explain: `${n} + 10 = ${n + 10}. Adding ten moves you one row down on a hundred chart.`,
      wrongTags: { [String(n + 1)]: 'tens-vs-ones' },
    };
  }
  if (kind === 'tenLess') {
    const n = randInt(20, 120);
    return {
      prompt: `What is 10 less than ${n}?`, answer: String(n - 10),
      visual: { type: 'base10', value: n },
      hint: 'Take away one ten rod.',
      explain: `${n} - 10 = ${n - 10}. Taking ten away moves you one row up on a hundred chart.`,
      wrongTags: { [String(n - 1)]: 'tens-vs-ones' },
    };
  }
  if (kind === 'back') {
    const d = randInt(3, 12) * 10; // 30..120
    const list = [d + 1, d, '__', d - 2];
    return {
      prompt: `Count back. Fill in the missing number: ${seq(list)}`, answer: String(d - 1),
      visual: { type: 'numberline', min: d - 5, max: d + 5, marks: [d + 1, d, d - 2] },
      hint: `One less than ${d} ends in a 9.`,
      explain: `${d} - 1 = ${d - 1}. Counting back: ${d + 1}, ${d}, ${d - 1}, ${d - 2}.`,
      wrongTags: { [String(d - 10)]: 'decade-crossing' },
    };
  }
  const start = randInt(3, 15) * 5 + pick([0, 0, 1, 2, 3, 4]); // skip by 5 from any start
  const list = [start, start + 5, start + 10, start + 15];
  return {
    prompt: `Count by 5s from ${start}: ${seq(list)}, __`, answer: String(start + 20),
    visual: { type: 'numberline', min: start - 1, max: start + 25, step: 5, marks: list },
    explain: `${start + 15} + 5 = ${start + 20}.`,
    wrongTags: { [String(start + 16)]: 'skip-count-by-ones' },
  };
}

// ---------- Level 5: to 1000 by 1s/10s/100s, even/odd ----------
function level5() {
  const kind = pick(['ones', 'ones', 'tens', 'hundreds', 'evenodd', 'evenodd', 'back']);
  if (kind === 'ones') {
    const target = randInt(1, 9) * 100 + pick([0, 0, randInt(1, 8) * 10]); // crossing a hundred or a decade
    const list = [target - 2, target - 1, '__'];
    return {
      prompt: `Fill in the missing number: ${seq(list)}`, answer: String(target),
      visual: { type: 'numberline', min: target - 5, max: target + 5, marks: [target - 2, target - 1] },
      hint: `${target - 1} plus one. Watch the digits roll over.`,
      explain: `${target - 1} + 1 = ${target}. When the ones digit is 9, the next ten starts.`,
      wrongTags: { [String(target * 10)]: 'extra-zero', [String(target - 10)]: 'decade-crossing' },
    };
  }
  if (kind === 'tens') {
    const start = randInt(12, 95) * 10 + randInt(0, 9) - 20;
    const list = [start, start + 10, start + 20];
    return {
      prompt: `Count by 10s: ${seq(list)}, __`, answer: String(start + 30),
      visual: { type: 'numberline', min: start - 5, max: start + 35, step: 10, marks: list },
      hint: 'Add one ten each time. Crossing a hundred changes the hundreds digit.',
      explain: `${start + 20} + 10 = ${start + 30}.`,
      wrongTags: { [String(start + 21)]: 'off-decade-skip' },
    };
  }
  if (kind === 'hundreds') {
    const start = randInt(1, 6) * 100 + randInt(0, 99);
    const list = [start, start + 100, start + 200];
    return {
      prompt: `Count by 100s: ${seq(list)}, __`, answer: String(start + 300),
      visual: { type: 'base10', value: start },
      hint: 'Only the hundreds digit changes.',
      explain: `${start + 200} + 100 = ${start + 300}. Add one hundred flat each time.`,
      wrongTags: { [String(start + 210)]: 'tens-vs-hundreds' },
    };
  }
  if (kind === 'back') {
    const h = randInt(2, 10) * 100;
    const list = [h + 1, h, '__'];
    return {
      prompt: `Count back by 1s: ${seq(list)}`, answer: String(h - 1),
      visual: { type: 'numberline', min: h - 5, max: h + 5, marks: [h + 1, h] },
      hint: `One less than ${h} ends in 99.`,
      explain: `${h} - 1 = ${h - 1}. Going back past a hundred, the digits become 99.`,
      wrongTags: { [String(h - 10)]: 'decade-crossing', [String(h - 100)]: 'decade-crossing' },
    };
  }
  // even / odd
  const n = randInt(100, 999);
  const isEven = n % 2 === 0;
  const first = Math.floor(n / 100), last = n % 10;
  const firstDigitSays = first % 2 === 0 ? 'even' : 'odd';
  const q = {
    prompt: `Is ${n} even or odd?`, answer: isEven ? 'even' : 'odd', choices: ['even', 'odd'],
    hint: 'Only the last digit tells you. 0, 2, 4, 6, 8 are even.',
    explain: `Look at the ones digit: ${last}. ${last} is ${isEven ? 'even' : 'odd'}, so ${n} is ${isEven ? 'even' : 'odd'}.`,
  };
  if (firstDigitSays !== q.answer) q.wrongTags = { [firstDigitSays]: 'even-odd-first-digit' };
  return q;
}

// ---------- Level 6: skip by 3s/4s/6s/25s, patterns to 10 000 ----------
function level6() {
  const kind = pick(['skip', 'skip', 'skipFrom', 'plus10', 'plus100', 'plus1000', 'missing']);
  if (kind === 'skip' || kind === 'missing') {
    const step = pick([3, 4, 6, 25]);
    const list = [step, 2 * step, 3 * step, 4 * step];
    if (kind === 'missing') {
      const hole = randInt(1, 3);
      const shown = list.map((v, i) => (i === hole ? '__' : v));
      return {
        prompt: `Fill in the missing number: ${seq(shown)}`, answer: String(list[hole]),
        visual: { type: 'numberline', min: 0, max: list[3] + step, step, marks: list.filter((_, i) => i !== hole) },
        hint: `Each jump is ${step}.`,
        explain: `Counting by ${step}s: ${seq(list)}. The missing number is ${list[hole]}.`,
      };
    }
    return {
      prompt: `Count by ${step}s: 0, ${seq(list)}, __`, answer: String(5 * step),
      visual: { type: 'numberline', min: 0, max: 5 * step + step, step, marks: [0, ...list] },
      hint: `Add ${step} to the last number.`,
      explain: `${4 * step} + ${step} = ${5 * step}.`,
    };
  }
  if (kind === 'skipFrom') {
    const step = pick([3, 4, 6, 25]);
    const start = step === 25 ? randInt(1, 30) * 5 : randInt(5, 60);
    const list = [start, start + step, start + 2 * step];
    return {
      prompt: `Count by ${step}s from ${start}: ${seq(list)}, __`, answer: String(start + 3 * step),
      visual: { type: 'numberline', min: start - 1, max: start + 4 * step, step, marks: list },
      hint: 'You do not need to start at 0. Just keep adding the same jump.',
      explain: `${start + 2 * step} + ${step} = ${start + 3 * step}.`,
      wrongTags: { [String(4 * step)]: 'skip-from-zero-only' },
    };
  }
  if (kind === 'plus10') {
    const n = randInt(1000, 9980) + pick([0, 5, 9]);
    const safe = n + 10 <= 10000 ? n : n - 20;
    return {
      prompt: `${fmt(safe)} + 10 = ?`, answer: String(safe + 10),
      visual: { type: 'base10', value: safe % 1000 },
      hint: 'Add one ten. If the tens digit is 9, the hundreds digit goes up.',
      explain: `${fmt(safe)} + 10 = ${fmt(safe + 10)}.`,
      wrongTags: { [String(safe + 1)]: 'tens-vs-ones', [String(safe + 100)]: 'tens-vs-hundreds' },
    };
  }
  if (kind === 'plus100') {
    const n = randInt(1000, 9800) + randInt(0, 99);
    return {
      prompt: `What is 100 more than ${fmt(n)}?`, answer: String(n + 100),
      hint: 'Only the hundreds digit changes, unless it rolls over from 9.',
      explain: `${fmt(n)} + 100 = ${fmt(n + 100)}.`,
      wrongTags: { [String(n + 10)]: 'tens-vs-hundreds', [String(n + 1000)]: 'place-shift' },
    };
  }
  if (kind === 'plus1000') {
    const n = randInt(1000, 8999);
    const list = [n, n + 1000, n + 2000];
    return {
      prompt: `Count by 1000s: ${seq(list.map(fmt))}, __`, answer: String(n + 3000),
      explain: `${fmt(n + 2000)} + 1000 = ${fmt(n + 3000)}. Only the thousands digit changes.`,
    };
  }
  return level6();
}

// ---------- Level 7: integers -50..50 in context ----------
function level7() {
  const kind = pick(['less', 'more', 'colder', 'warmer', 'rise', 'drop', 'sequence', 'order']);
  if (kind === 'less') {
    const n = randInt(-20, 10), k = randInt(1, 9);
    return {
      prompt: `What is ${k} less than ${n}?`, answer: String(n - k),
      visual: { type: 'thermometer', value: n, min: -30, max: 20 },
      hint: 'Less means move down the thermometer.',
      explain: `Start at ${n} and go down ${k}: ${n} - ${k} = ${n - k}.`,
      wrongTags: { [String(n + k)]: 'integer-direction', [String(-(n - k))]: 'integer-sign' },
    };
  }
  if (kind === 'more') {
    const n = randInt(-20, 5), k = randInt(1, 9);
    return {
      prompt: `What is ${k} more than ${n}?`, answer: String(n + k),
      visual: { type: 'thermometer', value: n, min: -30, max: 20 },
      hint: 'More means move up the thermometer, even when you start below zero.',
      explain: `Start at ${n} and go up ${k}: ${n} + ${k} = ${n + k}.`,
      wrongTags: { [String(n - k)]: 'integer-direction' },
    };
  }
  if (kind === 'colder' || kind === 'warmer') {
    let a = randInt(-15, -1), b = randInt(-15, 8);
    if (a === b) b = a + randInt(1, 5);
    const colder = Math.min(a, b), warmer = Math.max(a, b);
    const ans = kind === 'colder' ? colder : warmer;
    const wrong = kind === 'colder' ? warmer : colder;
    return {
      prompt: `Which temperature is ${kind}: ${a} degrees or ${b} degrees?`, answer: String(ans),
      choices: shuffle([String(a), String(b)]),
      visual: { type: 'thermometer', value: a, min: -20, max: 10 },
      hint: 'Below zero, a bigger number after the minus sign means colder.',
      explain: `${colder} is further below zero than ${warmer}, so ${colder} is colder and ${warmer} is warmer.`,
      wrongTags: { [String(wrong)]: 'negative-magnitude' },
    };
  }
  if (kind === 'rise') {
    const t = randInt(-15, -1), k = randInt(2, 20);
    return {
      prompt: `The temperature is ${t} degrees. It rises ${k} degrees. What is it now?`, answer: String(t + k),
      visual: { type: 'thermometer', value: t, min: -20, max: 20 },
      hint: 'Count up to 0 first, then keep going.',
      explain: `From ${t}, going up ${-t} reaches 0, then ${k - (-t)} more: ${t} + ${k} = ${t + k}.`,
      wrongTags: { [String(t - k)]: 'integer-direction', [String(-(t + k))]: 'integer-sign' },
    };
  }
  if (kind === 'drop') {
    const t = randInt(1, 12), k = randInt(t + 1, t + 15);
    return {
      prompt: `It is ${t} degrees. The temperature drops ${k} degrees. What is it now?`, answer: String(t - k),
      visual: { type: 'thermometer', value: t, min: -20, max: 20 },
      hint: 'Count down to 0, then keep counting below zero.',
      explain: `From ${t}, going down ${t} reaches 0, then ${k - t} more below zero: ${t} - ${k} = ${t - k}.`,
      wrongTags: { [String(k - t)]: 'integer-sign' },
    };
  }
  if (kind === 'sequence') {
    const start = randInt(-6, 3), step = pick([-1, -2, 1, 2]);
    const list = [start, start + step, start + 2 * step];
    return {
      prompt: `Continue the pattern: ${seq(list)}, __`, answer: String(start + 3 * step),
      visual: { type: 'numberline', min: -12, max: 12, marks: list },
      hint: step < 0 ? 'The numbers go down each time.' : 'The numbers go up each time.',
      explain: `Each step is ${step > 0 ? '+' : ''}${step}. ${start + 2 * step} ${step > 0 ? '+' : '-'} ${Math.abs(step)} = ${start + 3 * step}.`,
      wrongTags: { [String(start + 2 * step - step)]: 'integer-direction' },
    };
  }
  // order: which is smallest
  const nums = shuffle([randInt(-20, -11), randInt(-10, -1), randInt(0, 15)]);
  const smallest = Math.min(...nums);
  const magnitudeTrap = nums.reduce((a, b) => (Math.abs(a) < Math.abs(b) ? a : b));
  return {
    prompt: `Which number is the smallest: ${seq(nums)}?`, answer: String(smallest),
    choices: nums.map(String),
    visual: { type: 'numberline', min: -20, max: 20, marks: nums },
    hint: 'The smallest number is furthest left on the number line.',
    explain: `On a number line, ${smallest} is furthest to the left, so it is the smallest.`,
    wrongTags: magnitudeTrap !== smallest ? { [String(magnitudeTrap)]: 'negative-magnitude' } : undefined,
  };
}

// ---------- Level 8: count by decimals and fractions ----------
function level8() {
  const kind = pick(['tenths', 'tenths', 'quarters', 'halves', 'halvesChoice', 'tenthsBack', 'fifths']);
  if (kind === 'tenths') {
    const start = randInt(0, 60) / 10;
    const list = [start, start + 0.1, start + 0.2].map((x) => dec(x, 1));
    const ans = dec(start + 0.3, 1);
    const trap = dec(start + 0.2, 1) + '0';
    const trapAns = /\.9$/.test(list[2]) ? list[2].replace(/\.9$/, '.10') : trap;
    return {
      prompt: `Count by tenths: ${seq(list)}, __`, answer: ans,
      visual: { type: 'numberline', min: Math.floor(start), max: Math.floor(start) + 1, step: 0.1, marks: list.map(Number) },
      hint: 'Ten tenths make one whole. After 0.9 comes 1.0.',
      explain: `${list[2]} + 0.1 = ${ans}.`,
      wrongTags: { [trapAns]: 'decimal-ten-tenths' },
    };
  }
  if (kind === 'tenthsBack') {
    const start = randInt(10, 60) / 10;
    const list = [start, start - 0.1, start - 0.2].map((x) => dec(x, 1));
    return {
      prompt: `Count back by tenths: ${seq(list)}, __`, answer: dec(start - 0.3, 1),
      visual: { type: 'numberline', min: Math.floor(start - 0.3), max: Math.ceil(start), step: 0.1, marks: list.map(Number) },
      explain: `${list[2]} - 0.1 = ${dec(start - 0.3, 1)}.`,
    };
  }
  if (kind === 'quarters') {
    const start = randInt(0, 12) / 4; // 0, 0.25, ... 3
    const list = [start, start + 0.25, start + 0.5].map((x) => dec(x, 2));
    return {
      prompt: `Count by 0.25: ${seq(list)}, __`, answer: dec(start + 0.75, 2),
      visual: { type: 'numberline', min: Math.floor(start), max: Math.floor(start) + 2, step: 0.25, marks: list.map(Number) },
      hint: 'Four quarters make one whole: 0.25, 0.5, 0.75, 1.',
      explain: `${list[2]} + 0.25 = ${dec(start + 0.75, 2)}.`,
    };
  }
  if (kind === 'fifths') {
    const k = randInt(1, 6);
    const list = [`${k}/5`, `${k + 1}/5`, `${k + 2}/5`];
    return {
      prompt: `Count by fifths: ${seq(list)}, __  (write it as a fraction)`, answer: `${k + 3}/5`,
      visual: { type: 'numberline', min: 0, max: 2, step: 0.2, marks: [k / 5, (k + 1) / 5, (k + 2) / 5] },
      hint: 'Add one more fifth to the top number.',
      explain: `The top number goes up by 1 each time: ${k + 2}/5 + 1/5 = ${k + 3}/5.`,
      wrongTags: { [`${k + 3}/6`]: 'add-denominators' },
    };
  }
  if (kind === 'halves') {
    const k = randInt(1, 7); // in halves
    const list = [k, k + 1, k + 2].map((h) => `${h}/2`);
    return {
      prompt: `Count by halves: ${seq(list)}, __  (write it as a fraction)`, answer: `${k + 3}/2`,
      visual: { type: 'numberline', min: 0, max: 5, step: 0.5, marks: [k / 2, (k + 1) / 2, (k + 2) / 2] },
      explain: `Each step adds one half: ${k + 2}/2 + 1/2 = ${k + 3}/2.`,
    };
  }
  // halvesChoice: mixed numbers as choices
  const mixed = (h) => (h % 2 === 0 ? String(h / 2) : h < 2 ? '1/2' : `${Math.floor(h / 2)} 1/2`);
  const k = randInt(1, 6);
  const list = [k, k + 1, k + 2].map(mixed);
  const ans = mixed(k + 3);
  return {
    prompt: `Count by halves: ${seq(list)}, __`, answer: ans,
    choices: shuffle(uniq([ans, mixed(k + 4), mixed(k + 2), mixed(k + 5)]).slice(0, 4)),
    visual: { type: 'numberline', min: 0, max: 5, step: 0.5, marks: [k / 2, (k + 1) / 2, (k + 2) / 2] },
    hint: 'Each jump is one half. Two halves make a whole.',
    explain: `${list[2]} plus one half is ${ans}.`,
  };
}

// ---------- Level 9: to one million, thousands, square and triangular numbers ----------
function level9() {
  const kind = pick(['thousands', 'thousands', 'plus1000', 'square', 'triangular', 'tenThousands', 'before']);
  if (kind === 'thousands') {
    const start = randInt(10, 990) * 1000 + pick([0, 0, randInt(1, 999)]);
    const list = [start, start + 1000, start + 2000];
    return {
      prompt: `Count by thousands: ${seq(list.map(fmt))}, __`, answer: String(start + 3000),
      hint: 'Only the thousands group changes.',
      explain: `${fmt(start + 2000)} + 1000 = ${fmt(start + 3000)}.`,
      wrongTags: { [String(start + 2100)]: 'place-shift', [String(start + 20000)]: 'place-shift' },
    };
  }
  if (kind === 'plus1000') {
    const n = pick([999000, 99000, 9000, 199000, 499000, 989000, 998000]);
    return {
      prompt: `${fmt(n)} + 1000 = ?`, answer: String(n + 1000),
      hint: 'When the thousands group is 999, adding 1 000 rolls over to the next group.',
      explain: `${fmt(n)} + 1000 = ${fmt(n + 1000)}. Check the zeros: ${String(n + 1000).length} digits.`,
      wrongTags: { [String((n + 1000) * 10)]: 'extra-zero', [String((n + 1000) / 10)]: 'missing-zero' },
    };
  }
  if (kind === 'tenThousands') {
    const start = randInt(2, 90) * 10000 + randInt(0, 9999);
    const list = [start, start + 10000, start + 20000];
    return {
      prompt: `Count by ten thousands: ${seq(list.map(fmt))}, __`, answer: String(start + 30000),
      explain: `${fmt(start + 20000)} + 10 000 = ${fmt(start + 30000)}.`,
      wrongTags: { [String(start + 21000)]: 'place-shift' },
    };
  }
  if (kind === 'before') {
    const n = pick([100000, 1000000, 500000, 10000, 20000, 300000, 1000]);
    return {
      prompt: `What number comes just before ${fmt(n)}?`, answer: String(n - 1),
      hint: 'All the zeros become 9s.',
      explain: `${fmt(n)} - 1 = ${fmt(n - 1)}.`,
      wrongTags: { [String(n - 10)]: 'place-shift' },
    };
  }
  if (kind === 'square') {
    const r = randInt(2, 11);
    return {
      prompt: `${r * r} is a square number. What is the next square number after ${r * r}?`, answer: String((r + 1) * (r + 1)),
      visual: { type: 'array', rows: r, cols: r },
      hint: `${r * r} = ${r} x ${r}. Try ${r + 1} x ${r + 1}.`,
      explain: `${r * r} = ${r} x ${r}, so the next square is ${r + 1} x ${r + 1} = ${(r + 1) * (r + 1)}.`,
      wrongTags: { [String(r * r + r)]: 'square-as-add', [String(r * r + 2 * r)]: 'square-off-by-one' },
    };
  }
  // triangular
  const n = randInt(3, 8);
  const tri = (k) => (k * (k + 1)) / 2;
  const list = Array.from({ length: n }, (_, i) => tri(i + 1));
  return {
    prompt: `Triangular numbers: ${seq(list)}, __`, answer: String(tri(n + 1)),
    hint: `Each step adds one more than the last: +2, +3, +4, ...`,
    explain: `The gaps grow by 1 each time. ${tri(n)} + ${n + 1} = ${tri(n + 1)}.`,
    wrongTags: { [String(tri(n) + n)]: 'repeat-last-gap' },
  };
}

// ---------- Level 10: integer, decimal and fraction stepping; sequences with a rule ----------
function level10() {
  const kind = pick(['negStep', 'negStep', 'hundredths', 'eighths', 'rule', 'nth', 'backThroughZero']);
  if (kind === 'negStep') {
    const start = randInt(-5, 12), step = pick([-3, -4, -5, -6, -7]);
    const list = [start, start + step, start + 2 * step];
    return {
      prompt: `Continue: ${seq(list)}, __`, answer: String(start + 3 * step),
      visual: { type: 'numberline', min: Math.min(-25, start + 3 * step - 2), max: Math.max(15, start + 2), marks: list },
      hint: `Each step is ${step}. Keep going in the same direction past zero.`,
      explain: `Each term is ${-step} less than the one before: ${start + 2 * step} - ${-step} = ${start + 3 * step}.`,
      wrongTags: { [String(start + 2 * step - step)]: 'integer-direction', [String(-(start + 3 * step))]: 'integer-sign' },
    };
  }
  if (kind === 'backThroughZero') {
    const start = randInt(3, 12), step = pick([-3, -4, -5, -8]);
    const list = [start, start + step, start + 2 * step];
    return {
      prompt: `Count by ${step}s: ${seq(list)}, __`, answer: String(start + 3 * step),
      visual: { type: 'numberline', min: start + 4 * step, max: start + 2, marks: list },
      explain: `${start + 2 * step} + (${step}) = ${start + 3 * step}.`,
      wrongTags: { [String(-(start + 3 * step))]: 'integer-sign' },
    };
  }
  if (kind === 'hundredths') {
    const step = pick([0.05, 0.05, 0.02, 0.25, 0.125]);
    const places = step === 0.125 ? 3 : 2;
    const start = step === 0.125 ? randInt(0, 6) * 0.125 : randInt(0, 40) * step;
    const list = [start, start + step, start + 2 * step].map((x) => dec(x, places));
    const ans = dec(start + 3 * step, places);
    return {
      prompt: `Continue: ${seq(list)}, __`, answer: ans,
      hint: `The step is ${step}.`,
      explain: `${list[2]} + ${step} = ${ans}.`,
    };
  }
  if (kind === 'eighths') {
    const k = randInt(1, 9), step = pick([1, 1, 3]);
    const list = [k, k + step, k + 2 * step].map((e) => `${e}/8`);
    return {
      prompt: `Continue: ${seq(list)}, __  (write it as a fraction)`, answer: `${k + 3 * step}/8`,
      visual: { type: 'numberline', min: 0, max: 3, step: 0.125, marks: [k / 8, (k + step) / 8, (k + 2 * step) / 8] },
      hint: `Each step adds ${step}/8.`,
      explain: `The numerators go up by ${step}: ${k + 2 * step}/8 + ${step}/8 = ${k + 3 * step}/8.`,
      wrongTags: { [`${k + 3 * step}/${8 + 8}`]: 'add-denominators' },
    };
  }
  if (kind === 'rule') {
    const mult = randInt(2, 3), add = pick([-1, 1, 2, -2]), start = randInt(1, 4);
    const f = (x) => mult * x + add;
    const t1 = start, t2 = f(t1), t3 = f(t2), t4 = f(t3);
    const rule = `multiply by ${mult}, then ${add > 0 ? 'add' : 'subtract'} ${Math.abs(add)}`;
    return {
      prompt: `Rule: ${rule}. Start at ${t1}: ${t1}, ${t2}, ${t3}, __`, answer: String(t4),
      hint: `Apply the rule to ${t3}.`,
      explain: `${t3} x ${mult} = ${t3 * mult}, then ${add > 0 ? '+' : '-'} ${Math.abs(add)} gives ${t4}.`,
      wrongTags: { [String(mult * (t3 + add))]: 'rule-order' },
    };
  }
  // nth term of an arithmetic sequence
  const a = randInt(1, 9), d = randInt(2, 7), n = pick([8, 10, 12, 15, 20]);
  const list = [a, a + d, a + 2 * d, a + 3 * d];
  return {
    prompt: `${seq(list)}, ... What is the ${n}th number in this pattern?`, answer: String(a + (n - 1) * d),
    hint: `From the 1st number there are ${n - 1} jumps of ${d}.`,
    explain: `The ${n}th term is ${a} + ${n - 1} jumps of ${d}: ${a} + ${(n - 1) * d} = ${a + (n - 1) * d}.`,
    wrongTags: { [String(a + n * d)]: 'off-by-one-term' },
  };
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
  id: 'counting', name: 'Counting', emoji: '🔢', group: 'number',
  start: { 1: 1, 3: 4, 4: 5 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return cleanTags(LEVELS[lvl - 1]());
  },
};
