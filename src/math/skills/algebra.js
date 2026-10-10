// Patterns and algebra ladder (curriculum A10). Levels 1-10.
import { randInt, pick, shuffle } from '../rng.js';

const num = (x) => String(Math.round(x * 1e6) / 1e6);
const neg = (s) => String(s).replace(/^-/, '−');
const choices = (answer, distractors, n = 4) => {
  const out = [String(answer)];
  for (const d of distractors) { const s = String(d); if (!out.includes(s) && out.length < n) out.push(s); }
  while (out.length < 2) out.push(out[0] + '0');
  return shuffle(out);
};
const co = (k, v) => (k === 1 ? v : `${k}${v}`); // coefficient 1 prints as the bare variable
const balance = (left, right) => ({ type: 'balance', left: left.map(String), right: right.map(String) });

const L = {};

// 1. Repeating patterns: what comes next.
const COLOURS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];
L[1] = () => {
  const pool = pick([COLOURS, SHAPES]);
  const kind = pick(['AB', 'AB', 'ABB', 'ABC', 'AAB']);
  const picked = shuffle(pool).slice(0, 3);
  const unit = kind.split('').map((c) => picked['ABC'.indexOf(c)]);
  const reps = kind === 'AB' ? 3 : 2;
  const seq = [];
  for (let r = 0; r < reps; r++) seq.push(...unit);
  const mode = pick(['next', 'next', 'missing']);
  if (mode === 'next') {
    const ans = unit[0];
    const wrong = seq[seq.length - 1];
    return {
      prompt: `What comes next? ${seq.join(' ')} ?`,
      answer: ans, choices: choices(ans, [wrong, ...picked, pick(pool)], 3),
      hint: `The pattern repeats: ${unit.join(' ')}.`,
      explain: `The pattern unit is "${unit.join(' ')}", so after ${seq[seq.length - 1]} comes ${ans}.`,
      wrongTags: wrong !== ans ? { [wrong]: 'repeats-last-item' } : {},
    };
  }
  const i = randInt(1, seq.length - 2);
  const ans = seq[i];
  const shown = seq.map((s, j) => (j === i ? '?' : s)).join(' ');
  return {
    prompt: `What is missing? ${shown}`,
    answer: ans, choices: choices(ans, [...picked, pick(pool)], 3),
    explain: `The pattern unit is "${unit.join(' ')}", so the missing one is ${ans}.`,
  };
};

// 2. Growing number patterns; missing addend to 10.
L[2] = () => pick([
  () => {
    const step = pick([1, 2, 5, 10]), start = step === 10 ? pick([0, 10]) : randInt(0, 5);
    const seq = [0, 1, 2].map((i) => start + i * step);
    return {
      prompt: `What comes next? ${seq.join(', ')}, ?`, answer: String(start + 3 * step),
      visual: { type: 'numberline', min: 0, max: Math.max(20, Math.ceil((start + 4 * step) / step) * step), step, marks: seq },
      hint: `The numbers go up by ${step} each time.`,
      explain: `Each number is ${step} more than the one before. ${seq[2]} + ${step} = ${start + 3 * step}.`,
    };
  },
  () => {
    const total = pick([5, 6, 7, 8, 9, 10, 10]), a = randInt(1, total - 1);
    return {
      prompt: `${a} + ? = ${total}`, answer: String(total - a),
      visual: { type: 'tenframe', count: a },
      hint: `Count up from ${a} to ${total}.`,
      explain: `${a} and ${total - a} make ${total}, so the missing number is ${total - a}.`,
    };
  },
  () => {
    const total = randInt(5, 10), a = randInt(1, total - 1);
    const ans = total - a;
    return {
      prompt: `${a} + ? = ${total}`, answer: String(ans),
      choices: choices(ans, [total, a + total, a]),
      visual: balance([a, '?'], [total]),
      explain: `Both sides must balance. ${a} + ${ans} = ${total}, so the missing number is ${ans}.`,
      wrongTags: { [String(total)]: 'equals-means-answer', [String(a + total)]: 'added-instead' },
    };
  },
  () => {
    const total = randInt(4, 10), b = randInt(1, total - 1);
    return {
      prompt: `? + ${b} = ${total}`, answer: String(total - b),
      visual: balance(['?', b], [total]),
      explain: `${total - b} + ${b} = ${total}, so the missing number is ${total - b}.`,
    };
  },
  () => {
    const step = pick([2, 5, 10]), start = randInt(0, 3) * step;
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    const i = randInt(1, 2);
    return {
      prompt: `What is missing? ${seq.map((v, j) => (j === i ? '?' : v)).join(', ')}`,
      answer: String(seq[i]),
      explain: `The pattern counts by ${step}s, so the missing number is ${seq[i]}.`,
    };
  },
])();

// 3. Equal sign as balance; missing number to 20; true/false.
L[3] = () => pick([
  () => {
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(1, a + b - 1);
    const ans = a + b - c;
    return {
      prompt: `${a} + ${b} = ? + ${c}`, answer: String(ans),
      visual: balance([a, b], ['?', c]),
      hint: `Both sides must be equal. ${a} + ${b} is ${a + b}.`,
      explain: `${a} + ${b} = ${a + b}. The other side must also be ${a + b}, so ? = ${a + b} − ${c} = ${ans}.`,
    };
  },
  () => {
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(1, a + b - 1);
    const ans = a + b - c;
    return {
      prompt: `${a} + ${b} = ? + ${c}`, answer: String(ans),
      choices: choices(ans, [a + b, a + b + c, c]),
      visual: balance([a, b], ['?', c]),
      explain: `The = sign means both sides balance. ${a} + ${b} = ${a + b}, and ${ans} + ${c} = ${a + b} too.`,
      wrongTags: { [String(a + b)]: 'equals-means-answer', [String(a + b + c)]: 'added-everything' },
    };
  },
  () => {
    const a = randInt(2, 12), b = randInt(1, 9);
    const t = Math.random() < 0.5;
    const shown = t ? a + b : a + b + pick([-1, 1, 2]);
    return {
      prompt: `True or false: ${a} + ${b} = ${shown}`, answer: t ? 'true' : 'false', choices: ['true', 'false'],
      visual: balance([a, b], [shown]),
      explain: `${a} + ${b} = ${a + b}, so the equation is ${t ? 'true' : 'false'}.`,
    };
  },
  () => {
    const a = randInt(3, 10), b = randInt(1, 5), c = randInt(1, 5);
    const t = Math.random() < 0.5;
    const d = t ? a + b + c : a + b + c + pick([-1, 1]);
    return {
      prompt: `True or false: ${a} + ${b} = ${d} − ${c}`, answer: t ? 'true' : 'false', choices: ['true', 'false'],
      visual: balance([a, b], [d, `−${c}`]),
      explain: `Left side: ${a + b}. Right side: ${d} − ${c} = ${d - c}. ${t ? 'They match, so true.' : 'They do not match, so false.'}`,
    };
  },
  () => {
    const b = randInt(2, 9), c = randInt(2, 11), a = b + c;
    return {
      prompt: `? − ${b} = ${c}`, answer: String(a),
      visual: balance(['?', `−${b}`], [c]),
      hint: 'Work backwards: add instead of subtract.',
      explain: `${c} + ${b} = ${a}, and ${a} − ${b} = ${c}. The missing number is ${a}.`,
    };
  },
  () => {
    const a = randInt(10, 20), c = randInt(1, a - 1);
    return {
      prompt: `${a} − ? = ${c}`, answer: String(a - c),
      explain: `${a} − ${a - c} = ${c}, so the missing number is ${a - c}.`,
    };
  },
  () => {
    const total = randInt(11, 20), a = randInt(2, total - 2);
    return {
      prompt: `${a} + ? = ${total}`, answer: String(total - a),
      visual: balance([a, '?'], [total]),
      explain: `${total} − ${a} = ${total - a}, so ${a} + ${total - a} = ${total}.`,
    };
  },
])();

// 4. Pattern rules; missing number to 100; input/output tables.
L[4] = () => pick([
  () => {
    const r = randInt(3, 12), add = Math.random() < 0.6;
    const x = add ? randInt(5, 60) : randInt(r + 1, 60); // no negative outputs at this level
    const ans = add ? x + r : x - r;
    return {
      prompt: `Rule: ${add ? '+' : '−'}${r}. Input ${x}, what is the output?`, answer: String(ans),
      explain: `Apply the rule: ${x} ${add ? '+' : '−'} ${r} = ${ans}.`,
    };
  },
  () => {
    const step = randInt(3, 12), start = randInt(1, 20);
    const seq = [0, 1, 2, 3].map((i) => start + i * step);
    return {
      prompt: `What comes next? ${seq.join(', ')}, ?`, answer: String(start + 4 * step),
      hint: 'How much does it grow each time?',
      explain: `The pattern grows by ${step} each time. ${seq[3]} + ${step} = ${start + 4 * step}.`,
    };
  },
  () => {
    const step = randInt(3, 12), start = randInt(60, 100);
    const seq = [0, 1, 2, 3].map((i) => start - i * step);
    return {
      prompt: `What comes next? ${seq.join(', ')}, ?`, answer: String(start - 4 * step),
      explain: `The pattern shrinks by ${step} each time. ${seq[3]} − ${step} = ${start - 4 * step}.`,
    };
  },
  () => {
    const b = randInt(11, 45), c = randInt(11, 50), a = b + c;
    const ans = a;
    return {
      prompt: `? − ${b} = ${c}`, answer: String(ans), choices: choices(ans, [c - b, Math.abs(c - b), b + c + b]),
      visual: balance(['?', `−${b}`], [c]),
      hint: 'The ? is the starting number. Undo the subtraction by adding.',
      explain: `Undo the subtraction: ${c} + ${b} = ${ans}. Check: ${ans} − ${b} = ${c}.`,
      wrongTags: { [String(c - b)]: 'guessed-operation-from-position', [String(Math.abs(c - b))]: 'guessed-operation-from-position' },
    };
  },
  () => {
    const a = randInt(11, 60), total = randInt(a + 5, 100);
    return {
      prompt: `${a} + ? = ${total}`, answer: String(total - a),
      visual: balance([a, '?'], [total]),
      explain: `${total} − ${a} = ${total - a}, so the missing number is ${total - a}.`,
    };
  },
  () => {
    const a = randInt(40, 99), c = randInt(5, a - 5);
    return {
      prompt: `${a} − ? = ${c}`, answer: String(a - c),
      explain: `${a} − ${c} = ${a - c}, so the missing number is ${a - c}.`,
    };
  },
  () => {
    const r = randInt(2, 12), add = Math.random() < 0.6;
    const ins = [randInt(2, 9), randInt(10, 20)];
    const outs = ins.map((x) => (add ? x + r : x * 2));
    const rule = add ? `+${r}` : '×2';
    const sub = `−${r}`;
    return {
      prompt: `In: ${ins[0]} → Out: ${outs[0]}. In: ${ins[1]} → Out: ${outs[1]}. What is the rule?`,
      answer: rule, choices: choices(rule, [add ? '×2' : `+${outs[0] - ins[0]}`, sub, `+${r + 1}`]),
      explain: `${ins[0]} becomes ${outs[0]} and ${ins[1]} becomes ${outs[1]}. Both fit the rule ${rule}.`,
    };
  },
])();

// 5. Missing factor/divisor; pattern rules in words; fact families.
L[5] = () => pick([
  () => {
    const a = randInt(2, 12), b = randInt(2, 12);
    return {
      prompt: `${a} × ? = ${a * b}`, answer: String(b),
      visual: { type: 'array', rows: a, cols: b },
      hint: `How many groups of ${a} make ${a * b}?`,
      explain: `${a * b} ÷ ${a} = ${b}, so ${a} × ${b} = ${a * b}.`,
    };
  },
  () => {
    const a = randInt(2, 12), b = randInt(2, 12);
    const ans = b;
    return {
      prompt: `${a} × ? = ${a * b}`, answer: String(ans), choices: choices(ans, [a * b - a, a * b + a, a + b]),
      explain: `Think division: ${a * b} ÷ ${a} = ${ans}.`,
      wrongTags: { [String(a * b - a)]: 'added-instead-of-multiplied', [String(a * b + a)]: 'added-instead-of-multiplied' },
    };
  },
  () => {
    const d = randInt(2, 12), q = randInt(2, 12);
    return {
      prompt: `? ÷ ${d} = ${q}`, answer: String(d * q),
      visual: { type: 'array', rows: d, cols: q },
      hint: 'Undo the division by multiplying.',
      explain: `${q} × ${d} = ${d * q}, so ${d * q} ÷ ${d} = ${q}.`,
    };
  },
  () => {
    const d = randInt(2, 12), q = randInt(2, 12);
    return {
      prompt: `${d * q} ÷ ? = ${q}`, answer: String(d),
      explain: `${d * q} ÷ ${d} = ${q}, so the missing number is ${d}.`,
    };
  },
  () => {
    const kind = pick(['x2', 'x3', '+n']);
    const start = randInt(1, 6);
    let seq, rule, wrongs;
    if (kind === 'x2') { seq = [start, start * 2, start * 4, start * 8]; rule = '×2'; wrongs = [`+${start}`, '×3', '+2']; }
    else if (kind === 'x3') { seq = [start, start * 3, start * 9, start * 27]; rule = '×3'; wrongs = [`+${start * 2}`, '×2', '+3']; }
    else { const n = randInt(3, 9); seq = [start, start + n, start + 2 * n, start + 3 * n]; rule = `+${n}`; wrongs = ['×2', `+${n + 1}`, `×${n}`]; }
    return {
      prompt: `Pattern: ${seq.join(', ')}. What is the rule?`, answer: rule, choices: choices(rule, wrongs),
      hint: 'Check what happens between every pair, not just the first.',
      explain: `${seq[0]} to ${seq[1]} and ${seq[1]} to ${seq[2]} both use ${rule}, so the rule is ${rule}.`,
    };
  },
  () => {
    const start = randInt(1, 5), seq = [start, start * 2, start * 4, start * 8];
    return {
      prompt: `What comes next? ${seq.join(', ')}, ?`, answer: String(start * 16),
      hint: 'Each number doubles.',
      explain: `Each number is double the one before. ${seq[3]} × 2 = ${start * 16}.`,
    };
  },
  () => {
    // a ≠ b, otherwise the "a × a" decoy would also be a member of the family.
    const a = randInt(2, 9);
    let b; do { b = randInt(2, 9); } while (b === a);
    const p = a * b;
    const ans = pick([`${p} ÷ ${a} = ${b}`, `${p} ÷ ${b} = ${a}`, `${b} × ${a} = ${p}`]);
    return {
      prompt: `Which fact is in the same fact family as ${a} × ${b} = ${p}?`,
      answer: ans, choices: choices(ans, [`${a} + ${b} = ${a + b}`, `${p} − ${a} = ${p - a}`, `${a} × ${a} = ${a * a}`]),
      explain: `A fact family uses the same three numbers with × and ÷: ${a}, ${b} and ${p}. So ${ans} belongs.`,
    };
  },
])();

// 6. Variables as unknowns; one-step equations; expressions from words.
const VARS = ['n', 'x', 'y', 'm', 'k'];
L[6] = () => pick([
  () => {
    const v = pick(VARS), b = randInt(5, 60), ans = randInt(5, 90);
    return {
      prompt: `${v} + ${b} = ${ans + b}. What is ${v}?`, answer: String(ans),
      visual: balance([v, b], [ans + b]),
      hint: `Take ${b} off both sides.`,
      explain: `${ans + b} − ${b} = ${ans}, so ${v} = ${ans}.`,
    };
  },
  () => {
    const v = pick(VARS), b = randInt(5, 60), ans = randInt(5, 90);
    return {
      prompt: `${v} + ${b} = ${ans + b}. What is ${v}?`, answer: String(ans),
      choices: choices(ans, [ans + 2 * b, ans + b, b]),
      visual: balance([v, b], [ans + b]),
      explain: `Undo the + ${b} by subtracting: ${ans + b} − ${b} = ${ans}.`,
      wrongTags: { [String(ans + 2 * b)]: 'wrong-inverse', [String(ans + b)]: 'equals-means-answer' },
    };
  },
  () => {
    const v = pick(VARS), b = randInt(5, 80), ans = randInt(b + 1, 200);
    return {
      prompt: `${v} − ${b} = ${ans - b}. What is ${v}?`, answer: String(ans),
      choices: choices(ans, [ans - 2 * b, Math.abs(ans - 2 * b), ans - b]),
      hint: `Undo the − ${b} by adding ${b}.`,
      explain: `${ans - b} + ${b} = ${ans}, so ${v} = ${ans}.`,
      wrongTags: { [String(ans - 2 * b)]: 'wrong-inverse' },
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 12), ans = randInt(2, 12);
    return {
      prompt: `${a}${v} = ${a * ans}. What is ${v}?`, answer: String(ans),
      visual: balance([v, v, v].slice(0, Math.min(3, a)).concat(a > 3 ? [`...×${a}`] : []), [a * ans]),
      hint: `${a}${v} means ${a} × ${v}.`,
      explain: `${a} × ${v} = ${a * ans}, so ${v} = ${a * ans} ÷ ${a} = ${ans}.`,
    };
  },
  () => {
    const v = pick(VARS), d = randInt(2, 9), ans = randInt(2, 12);
    return {
      prompt: `${v} ÷ ${d} = ${ans}. What is ${v}?`, answer: String(ans * d),
      explain: `${ans} × ${d} = ${ans * d}, so ${v} = ${ans * d}.`,
    };
  },
  () => {
    const v = pick(VARS), k = randInt(2, 12);
    const forms = [
      [`${k} more than a number`, `${v} + ${k}`, [`${v} − ${k}`, `${k}${v}`, `${k} − ${v}`]],
      [`${k} less than a number`, `${v} − ${k}`, [`${k} − ${v}`, `${v} + ${k}`, `${v} ÷ ${k}`]],
      [`a number times ${k}`, `${k}${v}`, [`${v} + ${k}`, `${v} ÷ ${k}`, `${k} − ${v}`]],
      [`a number divided by ${k}`, `${v} ÷ ${k}`, [`${k} ÷ ${v}`, `${k}${v}`, `${v} − ${k}`]],
      ['a number doubled', `2${v}`, [`${v} + 2`, `${v} ÷ 2`, `${v}2`]],
      [`${k} minus a number`, `${k} − ${v}`, [`${v} − ${k}`, `${v} + ${k}`, `${k}${v}`]],
    ];
    const [words, ans, wrongs] = pick(forms);
    return {
      prompt: `Write "${words}" as an expression. Use ${v} for the number.`,
      answer: ans, choices: choices(ans, wrongs),
      explain: `"${words}" is written ${ans}.`,
      wrongTags: { [wrongs[0]]: 'order-reversed' },
    };
  },
])();

// 7. Order of operations; substitution; pattern rule as expression.
L[7] = () => pick([
  () => {
    const a = randInt(2, 12), b = randInt(2, 9), c = randInt(2, 9);
    const ans = a + b * c, wrong = (a + b) * c;
    return {
      prompt: `${a} + ${b} × ${c} = ?`, answer: String(ans), choices: choices(ans, [wrong, a * b + c, a + b + c]),
      hint: 'Multiply before you add.',
      explain: `Do ${b} × ${c} = ${b * c} first, then ${a} + ${b * c} = ${ans}.`,
      wrongTags: { [String(wrong)]: 'left-to-right-always' },
    };
  },
  () => {
    const b = randInt(2, 9), c = randInt(2, 9), a = b * c + randInt(1, 20);
    const ans = a - b * c;
    return {
      prompt: `${a} − ${b} × ${c} = ?`, answer: String(ans),
      hint: 'Multiply first, then subtract.',
      explain: `${b} × ${c} = ${b * c}, then ${a} − ${b * c} = ${ans}.`,
    };
  },
  () => {
    const q = randInt(2, 9), d = randInt(2, 6), b = q * d, a = randInt(10, 40);
    const ans = a - q;
    return {
      prompt: `${a} − ${b} ÷ ${d} = ?`, answer: String(ans), choices: choices(ans, [Math.round(((a - b) / d) * 100) / 100, a - b - d, a + q]),
      hint: 'Divide before you subtract.',
      explain: `${b} ÷ ${d} = ${q}, then ${a} − ${q} = ${ans}.`,
      wrongTags: { [String(Math.round(((a - b) / d) * 100) / 100)]: 'left-to-right-always' },
    };
  },
  () => {
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
    const ans = (a + b) * c;
    return {
      prompt: `(${a} + ${b}) × ${c} = ?`, answer: String(ans),
      hint: 'Brackets first.',
      explain: `Brackets first: ${a} + ${b} = ${a + b}. Then ${a + b} × ${c} = ${ans}.`,
    };
  },
  () => {
    const d = randInt(2, 6), q = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
    const ans = q + b * c;
    return {
      prompt: `${d * q} ÷ ${d} + ${b} × ${c} = ?`, answer: String(ans),
      explain: `${d * q} ÷ ${d} = ${q} and ${b} × ${c} = ${b * c}. Then ${q} + ${b * c} = ${ans}.`,
    };
  },
  () => {
    const v = pick(VARS), n = randInt(2, 12), a = randInt(2, 9), b = randInt(1, 20);
    const plus = Math.random() < 0.6;
    const ans = plus ? a * n + b : a * n - b;
    if (ans < 0) return L[7]();
    return {
      prompt: `If ${v} = ${n}, what is ${a}${v} ${plus ? '+' : '−'} ${b}?`, answer: String(ans),
      hint: `${a}${v} means ${a} × ${v}.`,
      explain: `Put in ${n}: ${a} × ${n} = ${a * n}, then ${a * n} ${plus ? '+' : '−'} ${b} = ${ans}.`,
    };
  },
  () => {
    const v = pick(VARS), n = randInt(2, 12), a = randInt(2, 9), b = randInt(1, 20);
    const ans = a * n + b;
    return {
      prompt: `If ${v} = ${n}, what is ${a}${v} + ${b}?`, answer: String(ans),
      choices: choices(ans, [Number(`${a}${n}`) + b, a * (n + b), a + n + b]),
      explain: `${a}${v} means ${a} × ${v}: ${a} × ${n} + ${b} = ${ans}.`,
      wrongTags: { [String(Number(`${a}${n}`) + b)]: 'concatenate-coefficient', [String(a + n + b)]: 'coefficient-as-addition' },
    };
  },
  () => {
    const a = randInt(2, 5), b = randInt(-3, 5);
    const terms = [1, 2, 3, 4].map((n) => a * n + b);
    if (terms[0] < 1) return L[7]();
    const ex = (k, c) => (c === 0 ? `${k}n` : c > 0 ? `${k}n + ${c}` : `${k}n − ${-c}`);
    const ans = ex(a, b);
    return {
      prompt: `Pattern: ${terms.join(', ')}... Which expression gives term n?`,
      answer: ans, choices: choices(ans, [ex(a, b + a), `n + ${a}`, ex(a + 1, b), ex(a, terms[0])]),
      hint: `The pattern goes up by ${a}, so start with ${a}n.`,
      explain: `It grows by ${a} each time, so it is ${a}n plus a fixed amount. Term 1 is ${terms[0]} = ${a} × 1 ${b >= 0 ? '+' : '−'} ${Math.abs(b)}, so ${ans}.`,
      wrongTags: { [ex(a, terms[0])]: 'uses-first-term-as-constant' },
    };
  },
])();

// 8. Two-step equations; inverse operations; inequalities.
L[8] = () => pick([
  () => {
    const v = pick(VARS), a = randInt(2, 9), b = randInt(1, 20), x = randInt(2, 15);
    const r = a * x + b;
    return {
      prompt: `${a}${v} + ${b} = ${r}. What is ${v}?`, answer: String(x),
      choices: choices(x, [r - b, num(Math.round((r / a - b) * 10) / 10), x + b]),
      visual: balance([...Array(Math.min(a, 3)).fill(v), ...(a > 3 ? [`...×${a}`] : []), b], [r]),
      hint: `First take away ${b} from both sides, then divide by ${a}.`,
      explain: `${r} − ${b} = ${a * x}, then ${a * x} ÷ ${a} = ${x}.`,
      wrongTags: { [String(r - b)]: 'forgot-to-divide', [num(Math.round((r / a - b) * 10) / 10)]: 'undo-in-wrong-order' },
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 9), b = randInt(1, 20), x = randInt(3, 15);
    const r = a * x - b;
    return {
      prompt: `${a}${v} − ${b} = ${r}. What is ${v}?`, answer: String(x),
      hint: `Add ${b} to both sides first.`,
      explain: `${r} + ${b} = ${a * x}, then ${a * x} ÷ ${a} = ${x}.`,
    };
  },
  () => {
    const v = pick(VARS), d = randInt(2, 6), b = randInt(1, 12), x = d * randInt(2, 12);
    const r = x / d + b;
    return {
      prompt: `${v} ÷ ${d} + ${b} = ${r}. What is ${v}?`, answer: String(x),
      hint: `Subtract ${b} first, then multiply by ${d}.`,
      explain: `${r} − ${b} = ${x / d}, then ${x / d} × ${d} = ${x}.`,
    };
  },
  () => {
    const v = pick(VARS), b = randInt(1, 12), c = randInt(1, 12);
    const bound = b + c;
    const sol = `${v} > ${bound}`;
    return {
      prompt: `Solve: ${v} − ${b} > ${c}`, answer: sol,
      choices: choices(sol, [`${v} > ${c}`, `${v} < ${bound}`, `${v} > ${Math.abs(c - b)}`]),
      visual: { type: 'numberline', min: 0, max: bound + 10, highlight: bound },
      hint: 'Treat it like an equation: add the same thing to both sides.',
      explain: `Add ${b} to both sides: ${v} > ${c} + ${b}, so ${sol}.`,
      wrongTags: { [`${v} < ${bound}`]: 'flipped-inequality', [`${v} > ${c}`]: 'ignored-constant' },
    };
  },
  () => {
    const v = pick(VARS), b = randInt(1, 12), c = randInt(b + 2, 25);
    const bound = c - b;
    const sol = `${v} < ${bound}`;
    return {
      prompt: `Solve: ${v} + ${b} < ${c}`, answer: sol,
      choices: choices(sol, [`${v} < ${c + b}`, `${v} > ${bound}`, `${v} < ${c}`]),
      visual: { type: 'numberline', min: 0, max: c, highlight: bound },
      explain: `Subtract ${b} from both sides: ${v} < ${c} − ${b}, so ${sol}.`,
      wrongTags: { [`${v} > ${bound}`]: 'flipped-inequality' },
    };
  },
  () => {
    const v = pick(VARS), b = randInt(1, 10), c = randInt(1, 10), bound = b + c;
    // Exactly one value above the bound; the rest are at or below it (and never negative).
    const below = []; while (below.length < 2) { const n = randInt(Math.max(0, bound - 9), bound - 1); if (!below.includes(n)) below.push(n); }
    const vals = shuffle([bound + randInt(1, 5), bound, ...below]);
    const ans = Math.max(...vals);
    return {
      prompt: `Which value of ${v} makes ${v} − ${b} > ${c} true?`, answer: String(ans), choices: [...new Set(vals.map(String))],
      explain: `${v} must be more than ${bound}. Only ${ans} is bigger than ${bound}: ${ans} − ${b} = ${ans - b}, which is more than ${c}.`,
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 9), b = randInt(1, 20), x = randInt(2, 15);
    const r = a * x + b;
    return {
      prompt: `${a}${v} + ${b} = ${r}. What is ${v}?`, answer: String(x),
      visual: balance([...Array(Math.min(a, 3)).fill(v), ...(a > 3 ? [`...×${a}`] : []), b], [r]),
      explain: `Subtract ${b}: ${a}${v} = ${a * x}. Divide by ${a}: ${v} = ${x}.`,
    };
  },
])();

// 9. Variables on both sides; distributive property; proportional relationships.
L[9] = () => pick([
  () => {
    const v = pick(VARS), x = randInt(2, 12), c = randInt(1, 5), a = c + randInt(1, 5);
    const b = randInt(1, 15), d = (a - c) * x + b;
    return {
      prompt: `${co(a, v)} + ${b} = ${co(c, v)} + ${d}. What is ${v}?`, answer: String(x),
      visual: balance([...Array(Math.min(a, 3)).fill(v), ...(a > 3 ? [`...×${a}`] : []), b], [...Array(Math.min(c, 3)).fill(v), ...(c > 3 ? [`...×${c}`] : []), d]),
      hint: `Take ${co(c, v)} off both sides first.`,
      explain: `Subtract ${co(c, v)} from both sides: ${co(a - c, v)} + ${b} = ${d}. Then ${co(a - c, v)} = ${d - b}${a - c === 1 ? '' : `, so ${v} = ${d - b} ÷ ${a - c} = ${x}`}.`,
    };
  },
  () => {
    const v = pick(VARS), x = randInt(2, 12), c = randInt(1, 4), a = c + randInt(1, 4);
    const b = randInt(1, 15), d = (a - c) * x + b;
    return {
      prompt: `${co(a, v)} + ${b} = ${co(c, v)} + ${d}. What is ${v}?`, answer: String(x),
      choices: choices(x, [num((d - b) / (a + c)), d - b, num((d + b) / (a - c))]),
      explain: `Move the ${v} terms together: ${co(a - c, v)} = ${d - b}, so ${v} = ${x}.`,
      wrongTags: { [num((d - b) / (a + c))]: 'added-variable-terms', [String(d - b)]: 'forgot-to-divide' },
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 9), b = randInt(1, 12), x = randInt(1, 12);
    const r = a * (x + b);
    return {
      prompt: `${a}(${v} + ${b}) = ${r}. What is ${v}?`, answer: String(x),
      hint: `Divide both sides by ${a} first.`,
      explain: `${r} ÷ ${a} = ${x + b}, so ${v} + ${b} = ${x + b} and ${v} = ${x}.`,
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 9), b = randInt(1, 12);
    const ans = `${a}${v} + ${a * b}`;
    return {
      prompt: `Expand: ${a}(${v} + ${b})`, answer: ans,
      choices: choices(ans, [`${a}${v} + ${b}`, `${v} + ${a * b}`, `${a + b}${v}`]),
      visual: { type: 'area', w: b + 1, h: a },
      hint: `Multiply ${a} by BOTH things inside the brackets.`,
      explain: `${a} × ${v} = ${a}${v} and ${a} × ${b} = ${a * b}, so ${ans}.`,
      wrongTags: { [`${a}${v} + ${b}`]: 'partial-distribute', [`${a + b}${v}`]: 'added-instead-of-multiplied' },
    };
  },
  () => {
    const k = randInt(2, 12), x = randInt(2, 12);
    return {
      prompt: `y = ${k}x. When x = ${x}, what is y?`, answer: String(k * x),
      explain: `y = ${k} × ${x} = ${k * x}.`,
    };
  },
  () => {
    const k = randInt(2, 12), x = randInt(2, 9);
    return {
      prompt: `y = kx. When x = ${x}, y = ${k * x}. What is k?`, answer: String(k),
      hint: 'k is what you multiply x by.',
      explain: `${k * x} ÷ ${x} = ${k}, so k = ${k}.`,
    };
  },
  () => {
    const item = pick(['pencils', 'tickets', 'apples', 'stickers']), k = randInt(2, 9), n = randInt(3, 12);
    return {
      prompt: `${item} cost $${k} each. Which equation gives the cost y of x ${item}?`,
      answer: `y = ${k}x`, choices: choices(`y = ${k}x`, [`y = x + ${k}`, `y = x ÷ ${k}`, `x = ${k}y`]),
      explain: `Each one costs ${k}, so x of them cost ${k} × x: y = ${k}x. For example ${n} ${item} cost $${k * n}.`,
    };
  },
])();

// 10. px + q = r and p(x + q) = r with rationals; linear graphs; simple systems.
L[10] = () => pick([
  () => {
    const v = pick(VARS), p = pick([0.5, 0.25, 0.2, 1.5, 2.5]), x = randInt(2, 20) * (p === 0.25 ? 4 : p === 0.2 ? 5 : 2), q = randInt(1, 12);
    const r = neg(num(p * x - q));
    return {
      prompt: `${p}${v} − ${q} = ${r}. What is ${v}?`, answer: String(x),
      hint: `Add ${q} first, then divide by ${p}.`,
      explain: `${r} + ${q} = ${num(p * x)}, then ${num(p * x)} ÷ ${p} = ${x}.`,
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 6), x = randInt(1, 10), q = pick([0.5, 1.5, 2.5, 3.5]);
    const r = num(a * (x + q));
    return {
      prompt: `${a}(${v} + ${q}) = ${r}. What is ${v}?`, answer: String(x),
      explain: `${r} ÷ ${a} = ${num(x + q)}, so ${v} = ${num(x + q)} − ${q} = ${x}.`,
    };
  },
  () => {
    // Equation is (−a)·v + q = r with solution v = x (negative), so r = −a·x + q.
    const v = pick(VARS), a = randInt(2, 6), x = -randInt(1, 9), q = randInt(1, 15);
    const r = -a * x + q;
    const wrong = String(-x);
    return {
      prompt: `${neg(-a)}${v} + ${q} = ${neg(r)}. What is ${v}?`, answer: neg(x),
      choices: choices(neg(x), [wrong, neg(x - 1), neg(x + 1)]),
      hint: `Subtract ${q}, then divide by −${a}. Watch the signs.`,
      explain: `${neg(r)} − ${q} = ${neg(r - q)}. Then ${neg(r - q)} ÷ (−${a}) = ${neg(x)}.`,
      wrongTags: { [wrong]: 'sign-error' },
    };
  },
  () => {
    const v = pick(VARS), a = randInt(2, 9), x = randInt(1, 12), q = randInt(1, 20);
    const r = a * x + q;
    const h = pick([2, 4]);
    const x2 = x + 0.5;
    const r2 = num(a * x2 + q);
    const useHalf = Math.random() < 0.5;
    return {
      prompt: `${a}${v} + ${q} = ${useHalf ? r2 : r}. What is ${v}?`, answer: useHalf ? num(x2) : String(x),
      explain: useHalf ? `${r2} − ${q} = ${num(a * x2)}, then ${num(a * x2)} ÷ ${a} = ${num(x2)}.` : `${r} − ${q} = ${a * x}, then ${a * x} ÷ ${a} = ${x}.`,
      hint: h ? 'Undo the + first, then the ×.' : undefined,
    };
  },
  () => {
    const m = randInt(1, 3), b = randInt(0, 3), x = randInt(1, 4);
    const y = m * x + b;
    if (y > 10) return L[10]();
    const eq = b === 0 ? `y = ${co(m, 'x')}` : `y = ${co(m, 'x')} + ${b}`;
    return {
      prompt: `Tap the point on the line ${eq} where x = ${x}.`, answer: `${x},${y}`, input: 'visual',
      visual: { type: 'grid', w: 10, h: 10, question: 'point' },
      hint: `Put x = ${x} into the rule to find y.`,
      explain: `y = ${m} × ${x}${b ? ' + ' + b : ''} = ${y}, so the point is (${x}, ${y}).`,
    };
  },
  () => {
    const m = randInt(1, 3), b = randInt(0, 3), x = randInt(1, 4);
    const y = m * x + b;
    if (y > 10) return L[10]();
    const eq = b === 0 ? `y = ${co(m, 'x')}` : `y = ${co(m, 'x')} + ${b}`;
    const ans = `(${x}, ${y})`;
    // On y = x the swapped point (y, x) is the same point, so use a different decoy there.
    const swapped = y === x ? [x + 1, y] : [y, x];
    return {
      prompt: `Which point is on the line ${eq}?`,
      answer: ans, choices: choices(ans, [`(${x}, ${y + 1})`, `(${swapped[0]}, ${swapped[1]})`, `(${x}, ${m * x + b + m})`, `(${x + 1}, ${y})`]),
      visual: { type: 'grid', w: 10, h: 10, points: [[x, y, 'A'], [x, y + 1, 'B'], [swapped[0], swapped[1], 'C']] },
      explain: `When x = ${x}, y = ${m} × ${x}${b ? ' + ' + b : ''} = ${y}. So (${x}, ${y}) is on the line.`,
      wrongTags: { [`(${y}, ${x})`]: 'swapped-coordinates' },
    };
  },
  () => {
    const s = randInt(5, 15), d = randInt(1, 4), x = (s + d) % 2 === 0 ? (s + d) / 2 : (s + d + 1) / 2;
    const y = s - x, diff = x - y;
    const askX = Math.random() < 0.5;
    return {
      prompt: `x + y = ${s} and x − y = ${diff}. What is ${askX ? 'x' : 'y'}?`, answer: String(askX ? x : y),
      hint: 'Try pairs that add to the first total.',
      explain: `${x} + ${y} = ${s} and ${x} − ${y} = ${diff}, so x = ${x} and y = ${y}.`,
    };
  },
  () => {
    const a = randInt(2, 9), b = randInt(a + 1, 12);
    return {
      prompt: `Two numbers add to ${a + b} and multiply to ${a * b}. What is the bigger one?`, answer: String(b),
      explain: `${a} + ${b} = ${a + b} and ${a} × ${b} = ${a * b}. The bigger number is ${b}.`,
    };
  },
])();

export default {
  id: 'algebra', name: 'Patterns and Algebra', emoji: '🧩', group: 'number',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const q = L[Math.min(10, Math.max(1, level))]();
    if (q.wrongTags) delete q.wrongTags[String(q.answer)];
    return q;
  },
};
