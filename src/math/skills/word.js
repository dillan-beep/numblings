// Word problems (curriculum A16). Levels 1..10.
import { randInt, pick, shuffle } from '../rng.js';

const KIDS = ['Jack', 'Luke', 'Madeline'];
// [singular, plural]
const ITEMS = [
  ['hockey card', 'hockey cards'], ['Pokemon card', 'Pokemon cards'], ['LEGO brick', 'LEGO bricks'], ['Timbit', 'Timbits'],
  ['book', 'books'], ['apple', 'apples'], ['sticker', 'stickers'], ['marble', 'marbles'], ['toy car', 'toy cars'], ['loonie', 'loonies'],
];
const money = (n) => (Math.round(n * 100) / 100).toFixed(2);
const num = (n) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));
const two = () => shuffle(KIDS).slice(0, 2);
const item = () => pick(ITEMS);
const plural = (it, n) => (n === 1 ? it[0] : it[1]);

const LEVELS = {
  1() {
    const k = pick(KIDS), it = item();
    const t = randInt(0, 2);
    if (t === 0) {
      const a = randInt(1, 6), b = randInt(1, 10 - a);
      return {
        prompt: `${k} has ${a} ${plural(it, a)}. ${k} gets ${b} more. How many ${it[1]} now?`,
        answer: String(a + b),
        visual: { type: 'counters', count: a + b },
        hint: 'Getting more means add.',
        explain: `${a} + ${b} = ${a + b}.`,
        wrongTags: { [String(Math.abs(a - b))]: 'wrong-operation' },
      };
    }
    if (t === 1) {
      const a = randInt(3, 10), b = randInt(1, a - 1);
      return {
        prompt: `${k} has ${a} ${plural(it, a)}. ${k} gives ${b} away. How many are left?`,
        answer: String(a - b),
        visual: { type: 'counters', count: a },
        hint: 'Giving away means take away.',
        explain: `${a} − ${b} = ${a - b}.`,
        wrongTags: { [String(a + b)]: 'keyword-only' },
      };
    }
    const a = randInt(1, 5), b = randInt(1, 5);
    const [p, q] = two();
    return {
      prompt: `${p} has ${a} ${plural(it, a)} and ${q} has ${b}. How many ${it[1]} do they have together?`,
      answer: String(a + b),
      visual: { type: 'tenframe', counts: [a, b] },
      hint: 'Put both groups together.',
      explain: `${a} + ${b} = ${a + b}.`,
    };
  },

  2() {
    const it = item();
    const t = randInt(0, 2);
    if (t === 0) {
      const a = randInt(3, 12), c = randInt(a + 2, 20);
      const k = pick(KIDS);
      return {
        prompt: `${k} had ${a} ${plural(it, a)}. After a trade, ${k} has ${c}. How many ${it[1]} did ${k} get?`,
        answer: String(c - a),
        visual: { type: 'numberline', min: 0, max: 20, marks: [a, c] },
        hint: `Count up from ${a} to ${c}.`,
        explain: `${a} + ? = ${c}, so ? = ${c} − ${a} = ${c - a}.`,
        wrongTags: { [String(c + a)]: 'added-both-numbers' },
      };
    }
    if (t === 1) {
      const [p, q] = two();
      const a = randInt(2, 12), b = randInt(a + 1, 20);
      return {
        prompt: `${p} has ${a} ${plural(it, a)}. ${q} has ${b}. How many more does ${q} have than ${p}?`,
        answer: String(b - a),
        visual: { type: 'tenframe', counts: [a, b] },
        hint: 'Find the difference between the two numbers.',
        explain: `${b} − ${a} = ${b - a}. ${q} has ${b - a} more.`,
        wrongTags: { [String(a + b)]: 'added-both-numbers' },
      };
    }
    const k = pick(KIDS);
    const a = randInt(8, 20), left = randInt(1, a - 3);
    return {
      prompt: `${k} had ${a} ${plural(it, a)}. ${k} lost some. Now there are ${left}. How many did ${k} lose?`,
      answer: String(a - left),
      visual: { type: 'numberline', min: 0, max: 20, marks: [left, a] },
      hint: `How far is it from ${left} back up to ${a}?`,
      explain: `${a} − ? = ${left}, so ? = ${a} − ${left} = ${a - left}.`,
    };
  },

  3() {
    const it = item();
    const t = randInt(0, 2);
    if (t === 0) {
      const lost = randInt(5, 30), now = randInt(10, 60);
      const k = pick(KIDS);
      return {
        prompt: `${k} had some ${it[1]}. ${k} gave ${lost} to a friend and now has ${now}. How many did ${k} start with?`,
        answer: String(lost + now),
        hint: 'Undo the giving away: add it back.',
        explain: `Start − ${lost} = ${now}, so start = ${now} + ${lost} = ${now + lost}.`,
        wrongTags: { [String(Math.abs(now - lost))]: 'keyword-only' },
      };
    }
    if (t === 1) {
      const k = pick(KIDS);
      const a = randInt(20, 60), b = randInt(5, 30), c = randInt(5, a + b - 5);
      return {
        prompt: `${k} had ${a} ${it[1]}. ${k} got ${b} more for a birthday, then gave ${c} away. How many now?`,
        answer: String(a + b - c),
        hint: 'Do the first step, then the second.',
        explain: `${a} + ${b} = ${a + b}. Then ${a + b} − ${c} = ${a + b - c}.`,
        wrongTags: { [String(a + b)]: 'solved-only-first-step' },
      };
    }
    const [p, q] = two();
    const a = randInt(15, 50), more = randInt(3, 25);
    return {
      prompt: `${p} has ${a} ${it[1]}. ${q} has ${more} more than ${p}. How many ${it[1]} do they have altogether?`,
      answer: String(a + a + more),
      hint: `First find how many ${q} has.`,
      explain: `${q} has ${a} + ${more} = ${a + more}. Together: ${a} + ${a + more} = ${a + a + more}.`,
      wrongTags: { [String(a + more)]: 'solved-only-first-step' },
    };
  },

  4() {
    const it = item();
    const t = randInt(0, 3);
    if (t === 0) {
      const packs = randInt(2, 6), each = randInt(4, 10), gave = randInt(3, packs * each - 5);
      const k = pick(KIDS);
      return {
        prompt: `${k} buys ${packs} packs of ${it[1]} with ${each} in each pack. ${k} gives ${gave} away. How many are left?`,
        answer: String(packs * each - gave),
        visual: { type: 'array', rows: packs, cols: each },
        hint: 'Multiply first to find the total, then subtract.',
        explain: `${packs} packs of ${each} is ${packs * each}. Gave away ${gave}: ${packs * each} − ${gave} = ${packs * each - gave}.`,
        wrongTags: { [String(packs * (each - gave))]: 'wrong-order', [String(packs * each)]: 'solved-only-first-step' },
      };
    }
    if (t === 1) {
      const kids = randInt(2, 5), each = randInt(3, 9), extra = randInt(1, 9);
      const k = pick(KIDS);
      return {
        prompt: `${k} shares ${it[1]} with friends. ${kids} kids get ${each} each, and there are ${extra} left in the box. How many were there?`,
        answer: String(kids * each + extra),
        hint: 'Multiply, then add the leftovers.',
        explain: `${kids} × ${each} = ${kids * each}. Plus ${extra} left over: ${kids * each + extra}.`,
      };
    }
    if (t === 2) {
      const kids = randInt(2, 5), each = randInt(3, 12), total = kids * each;
      const k = pick(KIDS);
      const take = randInt(1, each - 1);
      return {
        prompt: `${total} ${it[1]} are shared equally by ${kids} kids. Then ${k} eats ${take} of ${k === 'Madeline' ? 'hers' : 'his'}. How many does ${k} have left?`,
        answer: String(each - take),
        hint: 'Divide first, then subtract.',
        explain: `${total} ÷ ${kids} = ${each} each. ${each} − ${take} = ${each - take}.`,
        wrongTags: { [String(each)]: 'solved-only-first-step' },
      };
    }
    const a = randInt(3, 8), b = randInt(2, 6), c = randInt(2, 5);
    const k = pick(KIDS);
    return {
      prompt: `${k} builds ${a} LEGO towers with ${b} bricks each and ${c} more towers with ${a} bricks each. How many bricks in all?`,
      answer: String(a * b + c * a),
      hint: 'Find the bricks in each group of towers, then add.',
      explain: `${a} × ${b} = ${a * b} and ${c} × ${a} = ${c * a}. ${a * b} + ${c * a} = ${a * b + c * a}.`,
    };
  },

  5() {
    const t = randInt(0, 3);
    const k = pick(KIDS);
    const age = pick([6, 8, 9]);
    if (t === 0) {
      const price = randInt(3, 12), n = randInt(2, 5), paid = pick([20, 50, 100]);
      const cost = price * n;
      if (cost >= paid) return LEVELS[5]();
      return {
        prompt: `Movie tickets cost ${price} dollars each. ${k}, who is ${age} years old, buys ${n} tickets and pays with a ${paid} dollar bill. How much change, in dollars?`,
        answer: money(paid - cost),
        hint: 'Find the total cost first. Not every number matters.',
        explain: `${n} tickets × ${price} = ${cost} dollars. Change: ${paid} − ${cost} = ${paid - cost} dollars.`,
        wrongTags: { [money(paid - cost - age)]: 'used-every-number', [money(cost)]: 'solved-only-first-step' },
      };
    }
    if (t === 1) {
      const start = randInt(1, 4) * 15 + 30, practice = randInt(2, 6) * 15, walk = randInt(1, 4) * 5, cards = randInt(10, 60);
      return {
        prompt: `Hockey practice lasts ${practice} minutes. The walk home takes ${walk} minutes. ${k} has ${cards} hockey cards. How many minutes from the start of practice until ${k} gets home?`,
        answer: String(practice + walk),
        hint: 'Which numbers are about time?',
        explain: `${practice} + ${walk} = ${practice + walk} minutes. The ${cards} cards do not matter.`,
        wrongTags: { [String(practice + walk + cards)]: 'used-every-number' },
      };
    }
    if (t === 2) {
      const box = pick([2.5, 3.5, 4]), n = randInt(2, 5), juice = pick([1.5, 2, 2.5]);
      const total = box * n + juice;
      return {
        prompt: `A box of Timbits costs ${money(box)} dollars. ${k} buys ${n} boxes and one juice for ${money(juice)} dollars. How much does ${k} spend, in dollars?`,
        answer: money(total),
        hint: 'Boxes times price, then add the juice.',
        explain: `${n} × ${money(box)} = ${money(box * n)}. Plus ${money(juice)} = ${money(total)} dollars.`,
      };
    }
    const kids = randInt(3, 6), each = pick([1.25, 1.5, 2, 2.25, 2.5]), snow = randInt(5, 30);
    return {
      prompt: `It snowed ${snow} cm last night, so it is a snow day. ${k} sells hot chocolate for ${money(each)} dollars a cup to ${kids} neighbours. How many dollars does ${k} make?`,
      answer: money(each * kids),
      hint: 'How much snow fell does not change the money.',
      explain: `${kids} cups × ${money(each)} = ${money(each * kids)} dollars.`,
      wrongTags: { [money(each * snow)]: 'used-every-number' },
    };
  },

  6() {
    const it = item();
    const t = randInt(0, 3);
    if (t === 0) {
      const [p, q] = two();
      const times = randInt(2, 5), unit = randInt(3, 30);
      const total = unit * (times + 1);
      return {
        prompt: `${q} has ${times} times as many ${it[1]} as ${p}. Together they have ${total}. How many does ${p} have?`,
        answer: String(unit),
        visual: { type: 'balance', left: [`${p}`, ...Array(times).fill(`${p}`)], right: [`${total}`] },
        hint: `${p} is 1 part and ${q} is ${times} parts. How many parts in all?`,
        explain: `${times} parts + 1 part = ${times + 1} parts. ${total} ÷ ${times + 1} = ${unit}.`,
        wrongTags: { [String(total - times)]: 'times-as-many-is-plus', [String(total / 2)]: 'split-in-half' },
      };
    }
    if (t === 1) {
      const [p, q] = two();
      const times = randInt(2, 6), unit = randInt(4, 40);
      return {
        prompt: `${p} has ${unit} ${it[1]}. ${q} has ${times} times as many. How many more does ${q} have than ${p}?`,
        answer: String(unit * times - unit),
        hint: `First find ${q}'s amount, then compare.`,
        explain: `${q} has ${times} × ${unit} = ${unit * times}. ${unit * times} − ${unit} = ${unit * times - unit} more.`,
        wrongTags: { [String(unit * times)]: 'solved-only-first-step', [String(times)]: 'times-as-many-is-plus' },
      };
    }
    if (t === 2) {
      const per = randInt(4, 8), n = per * randInt(3, 12) + randInt(1, per - 1);
      const vans = Math.ceil(n / per);
      return {
        prompt: `${n} kids are going to the rink. Each van holds ${per} kids. How many vans are needed?`,
        answer: String(vans),
        hint: 'Everyone needs a seat, even the leftover kids.',
        explain: `${n} ÷ ${per} = ${Math.floor(n / per)} remainder ${n % per}. The leftover kids need one more van: ${vans}.`,
        wrongTags: { [String(Math.floor(n / per))]: 'ignored-remainder' },
      };
    }
    const per = randInt(3, 9), n = randInt(20, 200);
    const bags = Math.floor(n / per), rem = n % per;
    if (rem === 0) return LEVELS[6]();
    const k = pick(KIDS);
    return {
      prompt: `${k} puts ${n} ${it[1]} into bags of ${per}. How many ${it[1]} are left over after filling as many bags as possible?`,
      answer: String(rem),
      hint: 'Find the remainder.',
      explain: `${n} ÷ ${per} = ${bags} bags with ${rem} left over.`,
      wrongTags: { [String(bags)]: 'answered-quotient' },
    };
  },

  7() {
    const t = randInt(0, 3);
    const k = pick(KIDS);
    if (t === 0) {
      const d = pick([3, 4, 5, 6, 8]), n = randInt(1, d - 1), unit = randInt(3, 12), whole = d * unit;
      const came = randInt(2, 15);
      const left = n * unit;
      return {
        prompt: `There were ${whole} kids at the rink. ${n}/${d} of them went home, then ${came} more kids came. How many kids are at the rink now?`,
        answer: String(whole - left + came),
        visual: { type: 'fractionbar', parts: d, shaded: n },
        hint: `First find ${n}/${d} of ${whole}.`,
        explain: `${n}/${d} of ${whole} = ${left} went home. ${whole} − ${left} = ${whole - left}. Then + ${came} = ${whole - left + came}.`,
        wrongTags: { [String(left + came)]: 'fraction-of-wrong-whole', [String(whole - left)]: 'solved-only-first-step' },
      };
    }
    if (t === 1) {
      const km = randInt(1, 5), m = pick([200, 250, 400, 500, 600, 750]);
      const kind = randInt(0, 1);
      if (kind === 0) {
        return {
          prompt: `${k} bikes ${km} km to the park and then ${m} m more to the store. How many metres is that in all?`,
          answer: String(km * 1000 + m),
          hint: '1 km = 1000 m.',
          explain: `${km} km = ${km * 1000} m. ${km * 1000} + ${m} = ${km * 1000 + m} m.`,
          wrongTags: { [String(km + m)]: 'mixed-units' },
        };
      }
      const laps = randInt(2, 5);
      return {
        prompt: `A track is ${m} m around. ${k} runs ${laps} laps. How far is that in km?`,
        answer: num((m * laps) / 1000),
        hint: 'Find metres first, then divide by 1000.',
        explain: `${laps} × ${m} = ${m * laps} m = ${num((m * laps) / 1000)} km.`,
      };
    }
    if (t === 2) {
      const h = randInt(1, 3), m = pick([10, 15, 20, 30, 45]), used = pick([25, 35, 40, 50, 55, 70]);
      const total = h * 60 + m;
      if (used >= total) return LEVELS[7]();
      return {
        prompt: `${k} has ${h} hour${h > 1 ? 's' : ''} and ${m} minutes of screen time. ${k} uses ${used} minutes on a game. How many minutes are left?`,
        answer: String(total - used),
        hint: 'Change the hours to minutes first.',
        explain: `${h} h ${m} min = ${total} min. ${total} − ${used} = ${total - used} min.`,
      };
    }
    const d = pick([2, 3, 4, 5]), n = randInt(1, d - 1), unit = randInt(2, 10), total = d * unit;
    const each = pick([2, 3, 4, 5]);
    const kept = total - n * unit;
    const friend = pick(KIDS.filter((x) => x !== k));
    return {
      prompt: `${k} has ${total} hockey cards and gives ${n}/${d} of them to ${friend}. ${k} puts the rest into pages that hold ${each} cards. How many full pages?`,
      answer: String(Math.floor(kept / each)),
      hint: 'How many cards are left? Then divide.',
      explain: `${n}/${d} of ${total} = ${n * unit} given away, ${kept} kept. ${kept} ÷ ${each} = ${Math.floor(kept / each)} full pages.`,
    };
  },

  8() {
    const t = randInt(0, 3);
    const k = pick(KIDS);
    if (t === 0) {
      const price = pick([20, 25, 30, 40, 45, 50, 60, 80]), off = pick([10, 20, 25, 50]);
      const disc = (price * off) / 100;
      return {
        prompt: `A LEGO set costs ${price} dollars. It is on sale for ${off}% off. What is the sale price, in dollars?`,
        answer: money(price - disc),
        hint: `Find ${off}% of ${price}, then subtract it.`,
        explain: `${off}% of ${price} = ${money(disc)}. ${price} − ${money(disc)} = ${money(price - disc)} dollars.`,
        wrongTags: { [money(disc)]: 'answered-the-discount' },
      };
    }
    if (t === 1) {
      const [a, b] = pick([[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [5, 6]]);
      const unit = randInt(2, 8);
      const [x, y] = pick([['flour', 'sugar'], ['red paint', 'blue paint'], ['apples', 'oranges'], ['boys', 'girls']]);
      return {
        prompt: `A recipe uses ${x} and ${y} in the ratio ${a}:${b}. ${k} uses ${b * unit} cups of ${y}. How many cups of ${x}?`,
        answer: String(a * unit),
        hint: `${b} parts of ${y} is ${b * unit} cups. How big is 1 part?`,
        explain: `1 part = ${b * unit} ÷ ${b} = ${unit}. ${x}: ${a} × ${unit} = ${a * unit} cups.`,
        wrongTags: { [String(Math.round((b * unit * b) / a))]: 'ratio-applied-to-wrong-quantity' },
      };
    }
    if (t === 2) {
      const n = randInt(3, 8), each = pick([1.25, 1.5, 1.75, 2.25, 2.5, 3.75]);
      const paid = pick([20, 25, 50]);
      const total = each * n;
      if (total >= paid) return LEVELS[8]();
      return {
        prompt: `Timbits packs cost ${money(each)} dollars each. ${k} buys ${n} packs and pays with ${paid} dollars. How much change, in dollars?`,
        answer: money(paid - total),
        hint: 'Multiply to find the cost, then subtract from what was paid.',
        explain: `${n} × ${money(each)} = ${money(total)}. ${paid} − ${money(total)} = ${money(paid - total)} dollars.`,
        wrongTags: { [money(total)]: 'solved-only-first-step' },
      };
    }
    const rate = pick([4, 5, 6, 8, 10, 12]), hours = randInt(2, 6), target = randInt(1, 5);
    const kind = randInt(0, 1);
    if (kind === 0) {
      return {
        prompt: `${k} earns ${rate} dollars an hour shovelling snow. ${k} works ${hours} hours and spends ${money(rate * hours * 0.25)} dollars on hot chocolate. How many dollars are left?`,
        answer: money(rate * hours * 0.75),
        hint: 'Earnings first, then subtract the spending.',
        explain: `${rate} × ${hours} = ${rate * hours} dollars. ${rate * hours} − ${money(rate * hours * 0.25)} = ${money(rate * hours * 0.75)}.`,
      };
    }
    const dist = rate * hours;
    return {
      prompt: `${k} skates ${dist} km in ${hours} hours at a steady speed. How many km would ${k} skate in ${hours + target} hours?`,
      answer: String(rate * (hours + target)),
      hint: 'Find the km per hour first.',
      explain: `${dist} ÷ ${hours} = ${rate} km per hour. ${rate} × ${hours + target} = ${rate * (hours + target)} km.`,
      wrongTags: { [String(dist + target)]: 'added-time-to-distance' },
    };
  },

  9() {
    const t = randInt(0, 3);
    const k = pick(KIDS);
    if (t === 0) {
      const start = randInt(4, 30), mult = pick([2, 3]), sub = randInt(3, 15);
      const end = start * mult - sub;
      return {
        prompt: `${k} thinks of a number, ${mult === 2 ? 'doubles' : 'triples'} it, then subtracts ${sub}. The answer is ${end}. What was the number?`,
        answer: String(start),
        hint: `Work backwards: add ${sub}, then divide by ${mult}.`,
        explain: `${end} + ${sub} = ${start * mult}. ${start * mult} ÷ ${mult} = ${start}.`,
        wrongTags: { [String(Math.round((end - sub) / mult))]: 'not-reversing-operations' },
      };
    }
    if (t === 1) {
      const it = item();
      const start = randInt(20, 80), gave = randInt(5, 15), half = Math.floor((start - gave) / 2) * 2;
      const s = half + gave; // ensure (s - gave) even
      const left = (s - gave) / 2;
      const bought = randInt(2, 10);
      return {
        prompt: `${k} had some ${it[1]}. ${k} gave ${gave} to Luke, then lost half of the rest, then bought ${bought} more. Now ${k} has ${left + bought}. How many at the start?`,
        answer: String(s),
        hint: 'Undo each step from the end: subtract, double, add.',
        explain: `${left + bought} − ${bought} = ${left}. Double it: ${left * 2}. Add back ${gave}: ${s}.`,
      };
    }
    if (t === 2) {
      const n = randInt(3, 15), m = pick([3, 4, 5, 6]), add = randInt(1, 12);
      const r = m * n + add;
      return {
        prompt: `${add} more than ${m} times a number is ${r}. What is the number?`,
        answer: String(n),
        hint: `Write it as ${m} × n + ${add} = ${r}.`,
        explain: `${r} − ${add} = ${m * n}. ${m * n} ÷ ${m} = ${n}.`,
        wrongTags: { [String(Math.round((r + add) / m))]: 'not-reversing-operations' },
      };
    }
    const [p, q] = two();
    const price = pick([2, 3, 4, 5, 6]), nq = randInt(3, 8), extra = randInt(2, 6);
    const np = nq + extra;
    const total = price * (np + nq);
    return {
      prompt: `${p} and ${q} buy books at ${price} dollars each. ${p} buys ${extra} more books than ${q}. Together they spend ${total} dollars. How many books does ${q} buy?`,
      answer: String(nq),
      hint: 'How many books in total? Then split them.',
      explain: `${total} ÷ ${price} = ${np + nq} books. Take away the extra ${extra}: ${np + nq - extra}, then halve: ${nq}.`,
      wrongTags: { [String(np)]: 'answered-other-person' },
    };
  },

  10() {
    const t = randInt(0, 4);
    const k = pick(KIDS);
    if (t === 0) {
      const v1 = pick([40, 50, 60, 70, 80]), v2 = pick([60, 80, 90, 100, 120]), hrs = randInt(2, 5);
      const gap = (v1 + v2) * hrs;
      return {
        prompt: `Two trains are ${gap} km apart and drive toward each other. One goes ${v1} km/h and the other ${v2} km/h. In how many hours do they meet?`,
        answer: String(hrs),
        hint: 'How fast is the gap closing each hour?',
        explain: `The gap closes at ${v1} + ${v2} = ${v1 + v2} km/h. ${gap} ÷ ${v1 + v2} = ${hrs} hours.`,
        wrongTags: { [num(gap / v1)]: 'used-one-speed', [num(gap / (v2 - v1))]: 'subtracted-speeds' },
      };
    }
    if (t === 1) {
      const was = pick([20, 25, 40, 50, 60, 80]), pct = pick([10, 20, 25, 50]);
      const up = randInt(0, 1) === 0;
      const now = up ? was + (was * pct) / 100 : was - (was * pct) / 100;
      return {
        prompt: `Last year a pack of hockey cards cost ${was} dollars. This year it costs ${num(now)} dollars. By what percent did the price ${up ? 'go up' : 'go down'}?`,
        answer: String(pct),
        hint: 'Change divided by the original price, times 100.',
        explain: `Change = ${num(Math.abs(now - was))}. ${num(Math.abs(now - was))} ÷ ${was} = ${pct / 100}, so ${pct}%.`,
        wrongTags: { [num(Math.round((Math.abs(now - was) / now) * 1000) / 10)]: 'percent-of-new-value' },
      };
    }
    if (t === 2) {
      const n1 = randInt(3, 6), unit = pick([1.25, 1.5, 1.75, 2.25, 2.5]), n2 = n1 + randInt(2, 6);
      return {
        prompt: `${n1} packs of Pokemon cards cost ${money(n1 * unit)} dollars. At the same price per pack, what do ${n2} packs cost, in dollars?`,
        answer: money(n2 * unit),
        hint: 'Find the price of one pack first.',
        explain: `${money(n1 * unit)} ÷ ${n1} = ${money(unit)} per pack. ${n2} × ${money(unit)} = ${money(n2 * unit)} dollars.`,
      };
    }
    if (t === 3) {
      const r1 = pick([4, 5, 6, 8]), t1 = randInt(2, 5), r2 = r1 + pick([-2, -1, 1, 2]), t2 = randInt(2, 5);
      const [p, q] = two();
      const diff = Math.abs(r1 - r2);
      if (diff === 0) return LEVELS[10]();
      return {
        prompt: `${p} reads ${r1 * t1} pages in ${t1} hours. ${q} reads ${r2 * t2} pages in ${t2} hours. How many more pages per hour does the faster reader read?`,
        answer: String(diff),
        hint: 'Find each unit rate (pages per hour), then compare.',
        explain: `${p}: ${r1 * t1} ÷ ${t1} = ${r1} per hour. ${q}: ${r2 * t2} ÷ ${t2} = ${r2} per hour. Difference: ${diff}.`,
        wrongTags: { [String(Math.abs(r1 * t1 - r2 * t2))]: 'compared-totals-not-rates' },
      };
    }
    const young = randInt(5, 12), diff = randInt(2, 8), years = randInt(2, 10);
    const old = young + diff;
    const sumLater = young + old + 2 * years;
    return {
      prompt: `${k} is ${diff} years older than a cousin. In ${years} years their ages will add to ${sumLater}. How old is the cousin now?`,
      answer: String(young),
      hint: `Their ages now add to ${sumLater} − ${2 * years}.`,
      explain: `Now the ages add to ${sumLater} − ${2 * years} = ${young + old}. Take away the ${diff} difference and halve: (${young + old} − ${diff}) ÷ 2 = ${young}.`,
      wrongTags: { [String(old)]: 'answered-other-person', [String(sumLater - years - diff)]: 'subtracted-years-once' },
    };
  },
};

export default {
  id: 'word',
  name: 'Word Problems',
  emoji: '📖',
  group: 'apply',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const l = Math.min(10, Math.max(1, level));
    return LEVELS[l]();
  },
};
