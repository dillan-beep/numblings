// Data and probability (curriculum A15). Levels 1..10.
import { randInt, pick, shuffle } from '../rng.js';

const COLOURS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const PETS = ['dogs', 'cats', 'fish', 'birds', 'rabbits', 'hamsters'];
const FRUIT = ['apples', 'bananas', 'grapes', 'oranges', 'pears', 'berries'];
const SPORTS = ['hockey', 'soccer', 'swimming', 'skating', 'baseball', 'biking'];
const SEASONS = ['winter', 'spring', 'summer', 'fall'];
const KIDS = ['Jack', 'Luke', 'Madeline'];
const ICONS = ['star', 'heart', 'coin', 'token'];

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const frac = (n, d) => { const g = gcd(n, d); return n === 0 ? '0' : (n === d ? '1' : `${n / g}/${d / g}`); };
const sum = (a) => a.reduce((x, y) => x + y, 0);
const sorted = (a) => a.slice().sort((x, y) => x - y);
const seq = (a) => a.join(' ');

function distinct(n, min, max) {
  const s = new Set();
  while (s.size < n) s.add(randInt(min, max));
  return [...s];
}
function choicesFrom(answer, pool) {
  const out = [String(answer)];
  for (const p of shuffle(pool.map(String))) {
    if (out.length >= 4) break;
    if (!out.includes(p)) out.push(p);
  }
  return shuffle(out);
}
function cats(list, n, min, max, mult = 1) {
  const labels = shuffle(list).slice(0, n);
  const vals = distinct(n, min, max).map((v) => v * mult);
  return labels.map((label, i) => ({ label, value: vals[i] }));
}
const maxCat = (c) => c.reduce((a, b) => (b.value > a.value ? b : a));
const minCat = (c) => c.reduce((a, b) => (b.value < a.value ? b : a));

function mean(a) { return sum(a) / a.length; }
function median(a) { const s = sorted(a); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function mode(a) { const c = {}; let best = a[0]; for (const v of a) { c[v] = (c[v] || 0) + 1; if (c[v] > c[best]) best = v; } return best; }
function modeList(len, lo, hi) {
  // a list with exactly one mode
  for (;;) {
    const a = []; for (let i = 0; i < len; i++) a.push(randInt(lo, hi));
    const c = {}; for (const v of a) c[v] = (c[v] || 0) + 1;
    const counts = Object.values(c).sort((x, y) => y - x);
    if (counts[0] >= 2 && (counts.length === 1 || counts[0] > counts[1])) return a;
  }
}
function meanList(len, target, lo, hi) {
  // integers whose mean is exactly target
  for (;;) {
    const a = []; for (let i = 0; i < len - 1; i++) a.push(randInt(lo, hi));
    const last = target * len - sum(a);
    if (last >= lo && last <= hi) return shuffle([...a, last]);
  }
}

const LEVELS = {
  1() {
    const t = randInt(0, 2);
    if (t === 0) {
      const c = cats(COLOURS, 3, 1, 8);
      const ask = pick(c);
      return {
        prompt: `Each picture is 1 kid. How many kids chose ${ask.label}?`,
        answer: String(ask.value),
        visual: { type: 'pictograph', rows: c.map((x) => ({ label: x.label, count: x.value })), icon: pick(ICONS), each: 1 },
        hint: 'Count the pictures in that row.',
        explain: `The ${ask.label} row has ${ask.value} pictures, so ${ask.value} kids chose ${ask.label}.`,
      };
    }
    if (t === 1) {
      const c = cats(PETS, 3, 1, 9);
      const more = randInt(0, 1) === 0;
      const ans = more ? maxCat(c) : minCat(c);
      return {
        prompt: `Which pet did the ${more ? 'most' : 'fewest'} kids pick?`,
        answer: ans.label,
        choices: shuffle(c.map((x) => x.label)),
        visual: { type: 'bargraph', categories: c, max: 10 },
        hint: `Look for the ${more ? 'tallest' : 'shortest'} bar.`,
        explain: `${ans.label} has the ${more ? 'tallest' : 'shortest'} bar with ${ans.value}, so ${ans.label} is the answer.`,
      };
    }
    const a = randInt(2, 7);
    let b = randInt(2, 7);
    if (b === a) b = a + 1;
    const [x, y] = shuffle(COLOURS).slice(0, 2);
    const more = a > b ? x : y;
    return {
      prompt: `Jack sorted ${a + b} blocks. ${a} are ${x} and ${b} are ${y}. Which colour has more?`,
      answer: more,
      choices: shuffle([x, y]),
      visual: { type: 'counters', count: a + b },
      hint: 'Compare the two numbers.',
      explain: `${Math.max(a, b)} is more than ${Math.min(a, b)}, so ${more} has more.`,
    };
  },

  2() {
    const t = randInt(0, 2);
    if (t === 0) {
      const n = randInt(4, 20);
      const groups = Math.floor(n / 5), rest = n % 5;
      const desc = groups === 0 ? `${rest} single marks` : `${groups} group${groups > 1 ? 's' : ''} of 5${rest ? ` and ${rest} more mark${rest > 1 ? 's' : ''}` : ''}`;
      return {
        prompt: `A tally chart shows ${desc}. What number is that?`,
        answer: String(n),
        hint: 'Count by 5s for each group, then count on.',
        explain: `${groups} groups of 5 is ${groups * 5}. ${groups * 5} + ${rest} = ${n}.`,
        wrongTags: { [String(groups + rest)]: 'tally-group-as-one' },
      };
    }
    if (t === 1) {
      const c = cats(PETS, 3, 2, 18);
      const [p, q] = shuffle(c).slice(0, 2);
      const hi = p.value > q.value ? p : q, lo = p.value > q.value ? q : p;
      return {
        prompt: `How many more kids chose ${hi.label} than ${lo.label}?`,
        answer: String(hi.value - lo.value),
        visual: { type: 'bargraph', categories: c, max: 20 },
        hint: 'Find the two bars and subtract.',
        explain: `${hi.label} is ${hi.value} and ${lo.label} is ${lo.value}. ${hi.value} − ${lo.value} = ${hi.value - lo.value}.`,
        wrongTags: { [String(hi.value + lo.value)]: 'added-instead-of-compared' },
      };
    }
    const c = cats(FRUIT, 3, 1, 7);
    const total = sum(c.map((x) => x.value));
    return {
      prompt: 'Each picture is 1 kid. How many kids are in the whole graph?',
      answer: String(total),
      visual: { type: 'pictograph', rows: c.map((x) => ({ label: x.label, count: x.value })), icon: pick(ICONS), each: 1 },
      hint: 'Add up all the rows.',
      explain: `${c.map((x) => x.value).join(' + ')} = ${total}.`,
    };
  },

  3() {
    const t = randInt(0, 2);
    if (t === 0) {
      const each = pick([2, 5]);
      const c = cats(SPORTS, 3, 1, 8);
      const ask = pick(c);
      return {
        prompt: `Each picture stands for ${each} kids. How many kids chose ${ask.label}?`,
        answer: String(ask.value * each),
        visual: { type: 'pictograph', rows: c.map((x) => ({ label: x.label, count: x.value })), icon: pick(ICONS), each },
        hint: `Count the pictures, then multiply by ${each}.`,
        explain: `${ask.label} has ${ask.value} pictures. ${ask.value} × ${each} = ${ask.value * each}.`,
        wrongTags: { [String(ask.value)]: 'ignored-key' },
      };
    }
    if (t === 1) {
      const scale = pick([2, 5]);
      const c = cats(FRUIT, 4, 1, 9, scale);
      const ask = pick(c);
      return {
        prompt: `The bar graph counts by ${scale}s. How many kids chose ${ask.label}?`,
        answer: String(ask.value),
        visual: { type: 'bargraph', categories: c, max: scale * 10 },
        hint: `Each step on the scale is ${scale}.`,
        explain: `The ${ask.label} bar reaches ${ask.value} on the scale.`,
      };
    }
    const events = [
      ['the sun comes up tomorrow', 'certain'],
      ['a dog grows wings', 'impossible'],
      ['it snows in Ontario in January', 'likely'],
      ['it snows in Ontario in July', 'unlikely'],
      ['you roll a 7 on a normal die', 'impossible'],
      ['you pick a red marble from a bag of only red marbles', 'certain'],
      ['you get heads when you flip a coin 5 times in a row', 'unlikely'],
      ['you pick a blue marble from a bag with 9 blue and 1 green', 'likely'],
      ['a Tuesday comes after a Monday', 'certain'],
      ['you spin red on a spinner that is almost all red', 'likely'],
    ];
    const [ev, ans] = pick(events);
    return {
      prompt: `How likely is it that ${ev}?`,
      answer: ans,
      choices: ['certain', 'likely', 'unlikely', 'impossible'],
      explain: `It is ${ans} that ${ev}.`,
      wrongTags: ans === 'likely' ? { certain: 'likely-means-will-happen' } : undefined,
    };
  },

  4() {
    const t = randInt(0, 2);
    if (t === 0) {
      const c = cats(SEASONS, 4, 1, 9, 10);
      const [p, q] = shuffle(c).slice(0, 2);
      const hi = p.value > q.value ? p : q, lo = p.value > q.value ? q : p;
      if (randInt(0, 1) === 0) {
        return {
          prompt: `The graph counts by 10s. How many more kids chose ${hi.label} than ${lo.label}?`,
          answer: String(hi.value - lo.value),
          visual: { type: 'bargraph', categories: c, max: 100 },
          hint: 'Read both bars on the 10s scale, then subtract.',
          explain: `${hi.label} is ${hi.value} and ${lo.label} is ${lo.value}. ${hi.value} − ${lo.value} = ${hi.value - lo.value}.`,
        };
      }
      const total = sum(c.map((x) => x.value));
      return {
        prompt: 'The graph counts by 10s. How many kids were asked in total?',
        answer: String(total),
        visual: { type: 'bargraph', categories: c, max: 100 },
        hint: 'Add all four bars.',
        explain: `${c.map((x) => x.value).join(' + ')} = ${total}.`,
      };
    }
    if (t === 1) {
      const marks = [];
      const lo = randInt(0, 3), hi = lo + randInt(3, 5);
      const n = randInt(7, 11);
      for (let i = 0; i < n; i++) marks.push(randInt(lo, hi));
      if (randInt(0, 1) === 0) {
        const v = randInt(lo, hi);
        const count = marks.filter((m) => m === v).length;
        return {
          prompt: `The line plot shows how many books each kid read. How many kids read exactly ${v} books?`,
          answer: String(count),
          visual: { type: 'numberline', min: lo, max: hi, step: 1, marks },
          hint: `Count the dots above ${v}.`,
          explain: `There are ${count} dots above ${v}, so ${count} kids read ${v} books.`,
        };
      }
      const over = randInt(lo, hi - 1);
      const count = marks.filter((m) => m > over).length;
      return {
        prompt: `The line plot shows how many goals each player scored. How many players scored more than ${over}?`,
        answer: String(count),
        visual: { type: 'numberline', min: lo, max: hi, step: 1, marks },
        hint: `Count every dot to the right of ${over}.`,
        explain: `Dots at numbers bigger than ${over}: ${count} in all.`,
      };
    }
    // spinner: three colours with distinct counts
    const [a, b, c3] = shuffle(COLOURS).slice(0, 3);
    const [na, nb, nc] = shuffle(distinct(3, 1, 5));
    const parts = na + nb + nc;
    const arr = [[a, na], [b, nb], [c3, nc]];
    const askMost = randInt(0, 1) === 0;
    const ans = arr.reduce((x, y) => ((askMost ? y[1] > x[1] : y[1] < x[1]) ? y : x));
    return {
      prompt: `A spinner has ${parts} equal parts: ${na} ${a}, ${nb} ${b} and ${nc} ${c3}. Which colour is ${askMost ? 'most' : 'least'} likely?`,
      answer: ans[0],
      choices: shuffle([a, b, c3]),
      hint: `The colour with the ${askMost ? 'most' : 'fewest'} parts.`,
      explain: `${ans[0]} covers ${ans[1]} of ${parts} parts, the ${askMost ? 'most' : 'fewest'}, so it is ${askMost ? 'most' : 'least'} likely.`,
    };
  },

  5() {
    const t = randInt(0, 3);
    if (t === 0) {
      const a = modeList(randInt(5, 7), 1, 12);
      return {
        prompt: `Find the mode of these numbers: ${seq(a)}`,
        answer: String(mode(a)),
        hint: 'The mode is the number that shows up most often.',
        explain: `${mode(a)} appears more times than any other number, so the mode is ${mode(a)}.`,
      };
    }
    if (t === 1) {
      const a = distinct(randInt(5, 6), 2, 60);
      const s = sorted(a);
      const hi = s[s.length - 1], lo = s[0];
      return {
        prompt: `Find the range of these numbers: ${seq(a)}`,
        answer: String(hi - lo),
        hint: 'Range is biggest minus smallest.',
        explain: `Biggest is ${hi}, smallest is ${lo}. ${hi} − ${lo} = ${hi - lo}.`,
        wrongTags: { [String(hi)]: 'range-is-max' },
      };
    }
    if (t === 2) {
      const parts = randInt(4, 10);
      const [a, b] = shuffle(COLOURS).slice(0, 2);
      const na = randInt(1, parts - 1);
      const f = frac(na, parts);
      return {
        prompt: `A spinner has ${parts} equal parts: ${na} ${a} and ${parts - na} ${b}. What is the probability of landing on ${a}? Write a fraction.`,
        answer: f,
        hint: `${na} good parts out of ${parts} parts in all.`,
        explain: `${na} of the ${parts} parts are ${a}, so P(${a}) = ${na}/${parts}${f !== `${na}/${parts}` ? ` = ${f}` : ''}.`,
        wrongTags: { [`${na}/${parts - na}`]: 'part-over-other-part' },
      };
    }
    const kid = pick(KIDS);
    const labels = shuffle(SPORTS).slice(0, 3);
    const cls = labels.map((l) => ({ label: `${l} (class)`, value: randInt(2, 9) * 5 }));
    const mine = labels.map((l) => ({ label: `${l} (${kid})`, value: randInt(2, 9) * 5 }));
    const i = randInt(0, 2);
    const diff = Math.abs(cls[i].value - mine[i].value);
    return {
      prompt: `The double bar graph compares the class with ${kid}. How far apart are the two ${labels[i]} bars?`,
      answer: String(diff),
      visual: { type: 'bargraph', categories: [...cls, ...mine], max: 50 },
      hint: 'Find both bars for that sport and subtract.',
      explain: `Class ${labels[i]} is ${cls[i].value}, ${kid} ${labels[i]} is ${mine[i].value}. The difference is ${diff}.`,
    };
  },

  6() {
    const t = randInt(0, 3);
    if (t === 0) {
      const n = randInt(4, 5);
      const target = randInt(3, 20);
      const a = meanList(n, target, 1, 40);
      return {
        prompt: `Find the mean (average) of these numbers: ${seq(a)}`,
        answer: String(target),
        hint: `Add them all, then divide by ${n}.`,
        explain: `${a.join(' + ')} = ${sum(a)}. ${sum(a)} ÷ ${n} = ${target}.`,
        wrongTags: { [String(median(a))]: 'mean-is-middle' },
      };
    }
    if (t === 1) {
      const n = pick([5, 7]);
      const a = distinct(n, 1, 50);
      return {
        prompt: `Find the median of these numbers: ${seq(a)}`,
        answer: String(median(a)),
        hint: 'Put them in order first. The median is the middle one.',
        explain: `In order: ${seq(sorted(a))}. The middle number is ${median(a)}.`,
        wrongTags: { [String(a[Math.floor(n / 2)])]: 'median-without-sorting' },
      };
    }
    if (t === 2) {
      const opts = [
        ['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]], ['a number bigger than 4', [5, 6]],
        ['a number less than 3', [1, 2]], ['a 6', [6]], ['a number bigger than 1', [2, 3, 4, 5, 6]],
        ['a multiple of 3', [3, 6]],
      ];
      const [desc, good] = pick(opts);
      if (randInt(0, 1) === 0) {
        const pct = Math.round((good.length / 6) * 1000) / 10;
        const ans = String(pct);
        return {
          prompt: `You roll a normal 6-sided die. What is the probability of rolling ${desc}? Answer as a percent.`,
          answer: ans,
          choices: choicesFrom(ans, ['50', '33.3', '16.7', '66.7', '83.3', '100']),
          hint: `${good.length} good faces out of 6. Turn ${good.length}/6 into a percent.`,
          explain: `${good.length} of 6 faces work: ${good.join(', ')}. ${good.length}/6 = ${pct}%.`,
        };
      }
      return {
        prompt: `You roll a normal 6-sided die. What is the probability of rolling ${desc}? Write a fraction.`,
        answer: frac(good.length, 6),
        hint: `${good.length} good faces out of 6.`,
        explain: `${good.length} of the 6 faces work (${good.join(', ')}), so P = ${good.length}/6${frac(good.length, 6) !== `${good.length}/6` ? ` = ${frac(good.length, 6)}` : ''}.`,
      };
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const temps = days.map(() => randInt(-8, 12));
    const list = days.map((d, j) => `${d} ${temps[j]}`).join(', ');
    if (randInt(0, 1) === 0) {
      const hi = Math.max(...temps), lo = Math.min(...temps);
      return {
        prompt: `A line graph shows the temperature each day: ${list}. What is the range of temperatures?`,
        answer: String(hi - lo),
        visual: { type: 'numberline', min: -10, max: 15, step: 5, marks: temps },
        hint: 'Highest minus lowest.',
        explain: `Highest is ${hi}, lowest is ${lo}. ${hi} − (${lo}) = ${hi - lo}.`,
      };
    }
    const i = randInt(0, 3), j = i + 1;
    return {
      prompt: `A line graph shows the temperature each day: ${list}. How much did it change from ${days[i]} to ${days[j]}?`,
      answer: String(temps[j] - temps[i]),
      hint: 'New minus old. It can be negative.',
      explain: `${days[j]} is ${temps[j]} and ${days[i]} is ${temps[i]}. ${temps[j]} − (${temps[i]}) = ${temps[j] - temps[i]}.`,
    };
  },

  7() {
    const t = randInt(0, 3);
    if (t === 0) {
      const n = randInt(4, 8), m = randInt(5, 25);
      return {
        prompt: `The mean of ${n} numbers is ${m}. What is the total of the ${n} numbers?`,
        answer: String(n * m),
        hint: 'Mean × how many = total.',
        explain: `Mean ${m} times ${n} numbers: ${m} × ${n} = ${n * m}.`,
        wrongTags: { [String(n + m)]: 'added-mean-and-count' },
      };
    }
    if (t === 1) {
      const faces = pick([6, 6, 6, 4, 8]);
      const rolls = faces * randInt(5, 15);
      const face = randInt(1, faces);
      return {
        prompt: `You roll a fair ${faces}-sided die ${rolls} times. About how many times should you expect to roll a ${face}?`,
        answer: String(rolls / faces),
        hint: `One out of every ${faces} rolls.`,
        explain: `P(${face}) = 1/${faces}. ${rolls} ÷ ${faces} = ${rolls / faces}.`,
      };
    }
    if (t === 2) {
      const base = distinct(4, 5, 15);
      const outlier = randInt(40, 60);
      const a = shuffle([...base, outlier]);
      const mn = mean(a), md = median(a);
      const ans = mn > md ? 'mean' : 'median';
      return {
        prompt: `Scores: ${seq(a)}. One score is much bigger than the rest. Which is larger, the mean or the median?`,
        answer: ans,
        choices: ['mean', 'median', 'they are equal'],
        hint: 'A very big number pulls the mean up but not the median.',
        explain: `Median is ${md}. Mean is ${sum(a)} ÷ 5 = ${mn}. The ${ans} is larger.`,
      };
    }
    const n = randInt(4, 6), m = randInt(6, 20);
    const known = meanList(n, m, 1, 40);
    const hidden = known.pop();
    return {
      prompt: `${pick(KIDS)} has ${n} test scores with a mean of ${m}. ${n - 1} of them are ${seq(known)}. What is the missing score?`,
      answer: String(hidden),
      hint: `Total must be ${n} × ${m}. Subtract the known scores.`,
      explain: `Total = ${n} × ${m} = ${n * m}. Known scores add to ${sum(known)}. ${n * m} − ${sum(known)} = ${hidden}.`,
    };
  },

  8() {
    const t = randInt(0, 3);
    if (t === 0) {
      const total = pick([40, 60, 80, 100, 120, 200, 240, 300]);
      const pct = pick([10, 20, 25, 50, 75]);
      const ans = (total * pct) / 100;
      if (!Number.isInteger(ans)) return LEVELS[8]();
      const sport = pick(SPORTS);
      const g = gcd(100, pct);
      return {
        prompt: `A circle graph shows ${pct}% of ${total} kids picked ${sport} as their favourite. How many kids is that?`,
        answer: String(ans),
        visual: { type: 'fractioncircle', parts: 100 / g, shaded: pct / g },
        hint: `${pct}% means ${pct} out of every 100.`,
        explain: `${pct}% of ${total} = ${pct}/100 × ${total} = ${ans}.`,
      };
    }
    if (t === 1) {
      const total = pick([80, 120, 200, 240, 400]);
      const a = pick([10, 15, 20, 25, 30, 35, 40]);
      const b = pick([10, 15, 20, 25, 30]);
      const c = 100 - a - b;
      if (c <= 0 || c === a || c === b || a === b) return LEVELS[8]();
      const ans = (total * c) / 100;
      return {
        prompt: `A circle graph of ${total} votes has three parts: ${a}% hockey, ${b}% soccer, and the rest skating. How many votes for skating?`,
        answer: String(ans),
        hint: `The parts add to 100%. Skating is ${c}%.`,
        explain: `100 − ${a} − ${b} = ${c}%. ${c}% of ${total} = ${ans}.`,
        wrongTags: { [String((total * (a + b)) / 100)]: 'used-given-percents' },
      };
    }
    if (t === 2) {
      const qs = [
        ['two heads', 1], ['two tails', 1], ['one head and one tail in any order', 2], ['at least one head', 3],
      ];
      const [desc, n] = pick(qs);
      const f = frac(n, 4);
      return {
        prompt: `You flip two coins. What is the probability of getting ${desc}? Write a fraction.`,
        answer: f,
        hint: 'List all 4 outcomes: HH, HT, TH, TT.',
        explain: `The 4 outcomes are HH, HT, TH, TT. ${n} of them give ${desc}, so P = ${n}/4${f !== `${n}/4` ? ` = ${f}` : ''}.`,
        wrongTags: { '1/2': 'two-heads-is-half' },
      };
    }
    const parts = pick([4, 5, 8, 10]);
    const [a, b] = shuffle(COLOURS).slice(0, 2);
    const na = randInt(1, parts - 1);
    if (randInt(0, 1) === 0) {
      const pct = Math.round((na / parts) * 1000) / 10;
      return {
        prompt: `A spinner has ${parts} equal parts: ${na} ${a} and ${parts - na} ${b}. What percent chance is there of landing on ${a}?`,
        answer: String(pct),
        hint: `${na}/${parts} as a percent.`,
        explain: `${na}/${parts} = ${pct}%.`,
      };
    }
    const spins = parts * randInt(5, 20);
    return {
      prompt: `A spinner has ${parts} equal parts: ${na} ${a} and ${parts - na} ${b}. In ${spins} spins, about how many should land on ${a}?`,
      answer: String((spins * na) / parts),
      hint: `${na}/${parts} of the spins.`,
      explain: `${na}/${parts} × ${spins} = ${(spins * na) / parts}.`,
    };
  },

  9() {
    const t = randInt(0, 3);
    if (t === 0) {
      const items = [
        ['a coin and a 6-sided die', 2, 6], ['two 6-sided dice', 6, 6], ['a coin and a 4-colour spinner', 2, 4],
        ['a 6-sided die and a 5-colour spinner', 6, 5], ['three coins', 2, 2, 2], ['a 4-sided die and an 8-sided die', 4, 8],
        ['a coin, a 6-sided die and a 3-colour spinner', 2, 6, 3], ['two coins and a 10-sided die', 2, 2, 10],
      ];
      const [desc, ...ns] = pick(items);
      const ans = ns.reduce((x, y) => x * y, 1);
      return {
        prompt: `You use ${desc} at the same time. How many different outcomes are possible?`,
        answer: String(ans),
        hint: 'Multiply the number of options for each thing.',
        explain: `${ns.join(' × ')} = ${ans} outcomes.`,
        wrongTags: { [String(sum(ns))]: 'added-outcomes' },
      };
    }
    if (t === 1) {
      const qs = [
        ['a coin shows heads and a die shows 6', 1, 12], ['a coin shows tails and a die shows an even number', 3, 12],
        ['both dice show 6', 1, 36], ['two dice add to 7', 6, 36], ['two dice add to 12', 1, 36], ['two dice show the same number', 6, 36],
        ['two dice add to 4', 3, 36], ['three coins all show heads', 1, 8], ['a coin shows heads and a die shows a number bigger than 4', 2, 12],
        ['two dice add to 10', 3, 36],
      ];
      const [desc, n, d] = pick(qs);
      const f = frac(n, d);
      return {
        prompt: `What is the probability that ${desc}? Write a fraction.`,
        answer: f,
        hint: `Count the good outcomes out of ${d} total outcomes.`,
        explain: `There are ${d} equally likely outcomes and ${n} of them work: ${n}/${d}${f !== `${n}/${d}` ? ` = ${f}` : ''}.`,
      };
    }
    if (t === 2) {
      const pairs = [
        ['hours of practice', 'goals scored', 'goes up'], ['outside temperature', 'hot chocolate sold', 'goes down'],
        ['shoe size', 'spelling test score', 'no trend'], ['minutes reading each day', 'books finished', 'goes up'],
        ['age of a car', 'price of the car', 'goes down'], ['height', 'favourite number', 'no trend'],
        ['days since snowfall', 'size of the snow pile', 'goes down'], ['number of players', 'number of hockey sticks needed', 'goes up'],
      ];
      const [x, y, ans] = pick(pairs);
      return {
        prompt: `A scatter plot compares ${x} with ${y}. As ${x} increases, what most likely happens to ${y}?`,
        answer: ans,
        choices: ['goes up', 'goes down', 'no trend'],
        explain: `As ${x} increases, ${y} ${ans === 'no trend' ? 'has no clear pattern' : ans}.`,
      };
    }
    const bins = ['0-9', '10-19', '20-29', '30-39', '40-49'];
    const vals = bins.map(() => randInt(1, 12));
    const c = bins.map((label, i) => ({ label, value: vals[i] }));
    const k = randInt(1, 3);
    const ans = sum(vals.slice(k));
    return {
      prompt: `The histogram shows minutes spent on homework. How many students spent ${k * 10} minutes or more?`,
      answer: String(ans),
      visual: { type: 'bargraph', categories: c, max: 15 },
      hint: `Add the bars from ${bins[k]} to the end.`,
      explain: `Bars for ${bins.slice(k).join(', ')}: ${vals.slice(k).join(' + ')} = ${ans}.`,
    };
  },

  10() {
    const t = randInt(0, 3);
    if (t === 0) {
      const start = pick([50, 80, 90, 100, 200]);
      const a = start + randInt(2, 10), b = start + randInt(12, 25);
      return {
        prompt: `A bar graph's axis starts at ${start} instead of 0. Bar A is ${a} and bar B is ${b}. Why does the graph exaggerate the difference?`,
        answer: 'the axis does not start at 0',
        choices: shuffle(['the axis does not start at 0', 'bar B is really double bar A', 'the bars are the wrong colour', 'there are too few bars']),
        visual: { type: 'bargraph', categories: [{ label: 'A', value: a }, { label: 'B', value: b }], max: b + 5 },
        explain: `Starting the axis at ${start} cuts off the bottom, so a difference of ${b - a} looks huge. Real values ${a} and ${b} are close.`,
        wrongTags: { 'bar B is really double bar A': 'trusting-the-graph' },
      };
    }
    if (t === 1) {
      const qs = [
        ['asking only hockey players which sport is best', 'biased'], ['asking every 10th student entering the school', 'fair'],
        ['asking kids at a candy store if sugar should be banned', 'biased'], ['picking names from a hat with every student in it', 'fair'],
        ['asking your 3 best friends what the whole school likes', 'biased'], ['surveying kids from every class, chosen at random', 'fair'],
        ['asking people leaving a pizza shop for their favourite food', 'biased'], ['asking only grade 6 kids what the whole school wants for lunch', 'biased'],
      ];
      const [desc, ans] = pick(qs);
      return {
        prompt: `A survey sample is made by ${desc}. Is this sample fair or biased?`,
        answer: ans,
        choices: ['fair', 'biased'],
        explain: `${desc[0].toUpperCase() + desc.slice(1)} gives a ${ans} sample${ans === 'biased' ? ' because it does not represent everyone' : ' because everyone has an equal chance'}.`,
      };
    }
    if (t === 2) {
      const total = pick([20, 25, 40, 50, 60, 80, 100]);
      const hits = randInt(1, total - 1);
      if (randInt(0, 1) === 0) {
        return {
          prompt: `${pick(KIDS)} flipped a bottle cap ${total} times and it landed up ${hits} times. What is the relative frequency of landing up? Write a fraction in lowest terms.`,
          answer: frac(hits, total),
          hint: `${hits} out of ${total}, then simplify.`,
          explain: `${hits}/${total} simplifies to ${frac(hits, total)}.`,
        };
      }
      const pct = Math.round((hits / total) * 1000) / 10;
      return {
        prompt: `${pick(KIDS)} shot ${total} pucks and scored ${hits} times. What is the relative frequency of scoring, as a percent?`,
        answer: String(pct),
        hint: `${hits} ÷ ${total} × 100.`,
        explain: `${hits} ÷ ${total} = ${hits / total}, which is ${pct}%.`,
      };
    }
    const makers = [
      () => {
        const w = pick([2, 5, 10]), p = pick([4, 5, 10]), n = pick([20, 40, 50, 100]);
        return [`A game pays ${w} dollars with probability 1/${p}. If you play ${n} times, how many dollars should you expect to win in total?`, (n / p) * w,
          `${n} ÷ ${p} = ${n / p} wins. ${n / p} × ${w} = ${(n / p) * w} dollars.`];
      },
      () => {
        const n = pick([30, 60, 120, 180]);
        return [`You roll a 6-sided die ${n} times. You win a token every time you roll a 5 or 6. How many tokens should you expect?`, n / 3,
          `P(5 or 6) = 2/6 = 1/3. ${n} ÷ 3 = ${n / 3}.`];
      },
      () => {
        const p = pick([4, 5, 8, 10]), cost = randInt(1, 3), win = p * cost + pick([-p, 0, p, 2 * p]);
        const ev = win / p - cost;
        return [`A ticket costs ${cost} dollars. You win ${win} dollars with probability 1/${p}. On average, how many dollars do you gain or lose per ticket? Use a minus sign for a loss.`, ev,
          `Expected win = ${win} ÷ ${p} = ${win / p}. Minus the ${cost} dollar cost gives ${ev}.`];
      },
    ];
    const [prompt, val, explain] = pick(makers)();
    return {
      prompt,
      answer: Number.isInteger(val) ? String(val) : val.toFixed(2),
      hint: 'Expected value = probability × amount, over all the tries.',
      explain,
    };
  },
};

export default {
  id: 'data',
  name: 'Data & Probability',
  emoji: '📊',
  group: 'apply',
  start: { 1: 1, 3: 2, 4: 3 },
  unlock: undefined,
  gen(level) {
    const l = Math.min(10, Math.max(1, level));
    return LEVELS[l]();
  },
};
