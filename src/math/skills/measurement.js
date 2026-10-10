// Measurement: length, mass, capacity (metric first). Ladder: docs/curriculum.md A11.
import { randInt, pick, shuffle } from '../rng.js';

const num = (x) => String(Math.round(x * 1000) / 1000);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const an = (s) => (/^[aeiou]/i.test(s) ? `an ${s}` : `a ${s}`);
// "a 11 × 6" reads as "an eleven"; pick the article by sound.
const artNum = (n) => (n === 8 || n === 11 || n === 18 || (n >= 80 && n <= 89) ? 'an' : 'a');
function mc(answer, wrong, n = 4) {
  const out = [String(answer)];
  for (const w of wrong) { const s = String(w); if (!out.includes(s) && out.length < n) out.push(s); }
  return shuffle(out);
}

// ---------- Level 1: direct comparison ----------
const LONGER = [['bus', 'bike'], ['train', 'car'], ['snake', 'worm'], ['ladder', 'spoon'], ['river', 'puddle'], ['giraffe', 'dog'], ['rope', 'shoelace']];
const HEAVIER = [['elephant', 'mouse'], ['rock', 'feather'], ['car', 'apple'], ['book', 'leaf'], ['horse', 'cat'], ['bowling ball', 'balloon']];
const HOLDS = [['bathtub', 'cup'], ['swimming pool', 'bucket'], ['jug', 'spoon'], ['bucket', 'glass'], ['barrel', 'bottle']];
const L1 = [
  () => { const [a, b] = pick(LONGER); const shorter = Math.random() < 0.4; const ans = shorter ? b : a;
    return { prompt: `Which is ${shorter ? 'shorter' : 'longer'}: ${an(a)} or ${an(b)}?`, answer: ans, choices: shuffle([a, b]), explain: `${cap(an(a))} is much longer than ${an(b)}, so the ${ans} is ${shorter ? 'shorter' : 'longer'}.` }; },
  () => { const [a, b] = pick(HEAVIER); const lighter = Math.random() < 0.4; const ans = lighter ? b : a;
    return { prompt: `Which is ${lighter ? 'lighter' : 'heavier'}: ${an(a)} or ${an(b)}?`, answer: ans, choices: shuffle([a, b]), explain: `${cap(an(a))} weighs much more than ${an(b)}, so the ${ans} is ${lighter ? 'lighter' : 'heavier'}.` }; },
  () => { const [a, b] = pick(HOLDS); const less = Math.random() < 0.4; const ans = less ? b : a;
    return { prompt: `Which holds ${less ? 'less' : 'more'} water: ${an(a)} or ${an(b)}?`, answer: ans, choices: shuffle([a, b]), explain: `${cap(an(a))} is much bigger inside than ${an(b)}, so the ${ans} holds ${less ? 'less' : 'more'}.` }; },
  () => { const big = randInt(3, 6), small = randInt(1, big - 1); const leftBig = Math.random() < 0.5;
    // One numeric block per unit so the balance visual actually tilts toward the heavier pan.
    const left = Array(leftBig ? big : small).fill('1'), right = Array(leftBig ? small : big).fill('1');
    return { prompt: 'Each block weighs the same. Which side of the scale is heavier?', answer: leftBig ? 'Left' : 'Right', choices: ['Left', 'Right'], visual: { type: 'balance', left, right },
      hint: 'The heavier side goes down.', explain: `${big} blocks weigh more than ${small} ${small === 1 ? 'block' : 'blocks'}, so the ${leftBig ? 'left' : 'right'} side is heavier.` }; },
  () => { const a = randInt(3, 9), b = randInt(3, 9); if (a === b) return L1[0]();
    return { prompt: `A red ribbon is ${a} hands long. A blue ribbon is ${b} hands long. Which is longer?`, answer: a > b ? 'red' : 'blue', choices: shuffle(['red', 'blue']),
      explain: `${Math.max(a, b)} hands is more than ${Math.min(a, b)} hands, so the ${a > b ? 'red' : 'blue'} ribbon is longer.` }; },
];

// ---------- Level 2: non-standard units ----------
const ESTIMATES = [['a pencil', 5, 'paperclips'], ['a book', 8, 'paperclips'], ['a bed', 60, 'paperclips'], ['a door', 70, 'paperclips'], ['a spoon', 3, 'cubes'], ['a table', 40, 'cubes']];
const L2 = [
  () => { const n = randInt(2, 12);
    return { prompt: 'Each space on the ruler is 1 cube. How many cubes long is the pencil?', answer: String(n), visual: { type: 'ruler', length: n, unit: 'cm', max: 12 },
      hint: 'Count the spaces, not the lines.', explain: `Count the spaces from 0 to the end of the pencil: ${n} cubes.` }; },
  () => { const a = randInt(5, 12), b = randInt(2, a - 1);
    return { prompt: `A pencil is ${a} cubes long. A crayon is ${b} cubes long. How many cubes longer is the pencil?`, answer: String(a - b), explain: `${a} − ${b} = ${a - b} ${a - b === 1 ? 'cube' : 'cubes'} longer.` }; },
  () => { const [item, n, unit] = pick(ESTIMATES);
    return { prompt: `About how many ${unit} long is ${item}?`, answer: String(n), choices: mc(n, [n * 10, n * 100, Math.max(1, Math.round(n / 10))], 3),
      explain: `${cap(item)} is about ${n} ${unit} long. ${n * 10} would be far too many.` }; },
  () => { const gaps = Math.random() < 0.5;
    return { prompt: `Sam measured a book with cubes but left ${gaps ? 'gaps between' : 'the cubes overlapping'} the cubes. Will his count be too high or too low?`,
      answer: gaps ? 'too low' : 'too high', choices: shuffle(['too low', 'too high']),
      wrongTags: { [gaps ? 'too high' : 'too low']: gaps ? 'gaps-between-units' : 'overlapping-units' },
      explain: gaps ? 'Gaps leave space with no cube, so fewer cubes fit and the count is too low.' : 'Overlapping cubes squeeze extra cubes in, so the count is too high.' }; },
  () => { const a = randInt(3, 9), b = randInt(2, 6);
    return { prompt: `A string is ${a} cubes long. A ribbon is ${b} cubes longer. How many cubes long is the ribbon?`, answer: String(a + b), explain: `${a} + ${b} = ${a + b} cubes.` }; },
];

// ---------- Level 3: centimetres and metres, read a ruler ----------
const UNIT_CHOICE = [['a car', 'm'], ['a pencil', 'cm'], ['a classroom', 'm'], ['your finger', 'cm'], ['a soccer field', 'm'], ['a book', 'cm'], ['a tall tree', 'm'], ['an eraser', 'cm'], ['a swimming pool', 'm'], ['a phone', 'cm']];
const BENCH = [['About how wide is your finger?', '1 cm', ['10 cm', '1 m']], ['About how tall is a door?', '2 m', ['20 cm', '20 m']], ['About how long is a new pencil?', '15 cm', ['15 m', '1 cm']], ['About how tall is a grade 3 child?', '130 cm', ['13 cm', '13 m']], ['About how long is a bed?', '2 m', ['2 cm', '20 m']]];
const L3 = [
  () => { const n = randInt(1, 15);
    return { prompt: 'How long is the pencil in centimetres?', answer: String(n), visual: { type: 'ruler', length: n, unit: 'cm', max: 15 }, hint: 'Start reading from 0.', explain: `Read from 0 to the end of the pencil: ${n} cm.` }; },
  () => { const [item, u] = pick(UNIT_CHOICE);
    return { prompt: `Would you measure ${item} in cm or m?`, answer: u, choices: ['cm', 'm'], explain: u === 'm' ? `${cap(item)} is big, so metres fit best.` : `${cap(item)} is small, so centimetres fit best.` }; },
  () => { const [q, a, w] = pick(BENCH); return { prompt: q, answer: a, choices: mc(a, w, 3), explain: `${a} is the sensible estimate.` }; },
  () => { const m = randInt(1, 5); return { prompt: `${m} m = __ cm`, answer: String(m * 100), hint: '1 metre is 100 centimetres.', explain: `${m} × 100 = ${m * 100} cm.` }; },
  () => { const s = randInt(1, 6), len = randInt(3, 9), e = s + len;
    return { prompt: `A bar starts at the ${s} cm mark of a ruler and ends at the ${e} cm mark. How long is it?`, answer: String(len), choices: mc(len, [e, e + s, len + 1]),
      wrongTags: { [e]: 'read-end-mark-only', [e + s]: 'added-marks' }, explain: `${e} − ${s} = ${len} cm. The bar did not start at 0.` }; },
  () => { const n = randInt(2, 15); return { prompt: `A line is ${n} cm long. How many spaces between centimetre marks does it cover?`, answer: String(n), explain: `Each centimetre is one space, so ${n} cm covers ${n} spaces (${n + 1} marks).` }; },
];

// ---------- Level 4: grams/kilograms, millilitres/litres ----------
const MASS = [['a banana', 120, 'g'], ['an apple', 150, 'g'], ['a bag of potatoes', 5, 'kg'], ['a cat', 4, 'kg'], ['a paperclip', 1, 'g'], ['a bike', 12, 'kg'], ['a loaf of bread', 500, 'g'], ['a grade 4 child', 30, 'kg']];
const CAP = [['a spoon', 5, 'mL'], ['a bathtub', 150, 'L'], ['a juice box', 200, 'mL'], ['a bucket', 10, 'L'], ['a can of pop', 355, 'mL'], ['a car fuel tank', 50, 'L']];
const WEIGHTS = [500, 200, 100, 50, 20, 10];
const L4 = [
  () => { const [item, n, u] = pick(MASS); return { prompt: `${cap(item)} has a mass of about ${n} __`, answer: u, choices: ['g', 'kg'], explain: `${cap(item)} is about ${n} ${u}. (1 kg = 1000 g.)` }; },
  () => { const [item, n, u] = pick(CAP); return { prompt: `${cap(item)} holds about ${n} __`, answer: u, choices: ['mL', 'L'], explain: `${cap(item)} holds about ${n} ${u}. (1 L = 1000 mL.)` }; },
  () => { const [a, b] = shuffle(WEIGHTS).slice(0, 2);
    return { prompt: 'The scale is balanced. What is the mass of the box in grams?', answer: String(a + b), visual: { type: 'balance', left: ['box'], right: [`${a} g`, `${b} g`] }, explain: `${a} + ${b} = ${a + b} g.` }; },
  () => { const v = randInt(-5, 35); return { prompt: 'What temperature does the thermometer show in °C?', answer: String(v), visual: { type: 'thermometer', value: v, min: -10, max: 40 }, explain: `The liquid reaches the ${v} mark: ${v} °C.` }; },
  () => pick([{ prompt: '1 kg = __ g', answer: '1000', explain: 'One kilogram is 1000 grams.' }, { prompt: '1 L = __ mL', answer: '1000', explain: 'One litre is 1000 millilitres.' }, { prompt: '2 kg = __ g', answer: '2000', explain: '2 × 1000 = 2000 g.' }, { prompt: '3 L = __ mL', answer: '3000', explain: '3 × 1000 = 3000 mL.' }]),
  () => ({ prompt: 'Which is heavier: 1 kg of feathers or 1 kg of rocks?', answer: 'They are the same', choices: shuffle(['They are the same', 'The rocks', 'The feathers']),
    wrongTags: { 'The rocks': 'kg-depends-on-material' }, explain: '1 kg is 1 kg no matter what it is made of.' }),
  () => { const a = randInt(1, 9) * 100, b = randInt(1, 9) * 100; return { prompt: `A jug has ${a} mL of juice. You pour in ${b} mL more. How many mL now?`, answer: String(a + b), explain: `${a} + ${b} = ${a + b} mL.` }; },
];

// ---------- Level 5: metric conversions ----------
const L5 = [
  () => { const n = randInt(1, 9) * 50; return { prompt: `${n} cm = __ m`, answer: num(n / 100), hint: 'Divide by 100.', explain: `${n} ÷ 100 = ${num(n / 100)} m.` }; },
  () => { const n = randInt(1, 9); return { prompt: `${n} m = __ cm`, answer: String(n * 100), explain: `${n} × 100 = ${n * 100} cm.` }; },
  () => { const n = randInt(1, 9) * 5; return { prompt: `${n} mm = __ cm`, answer: num(n / 10), hint: '10 mm = 1 cm.', explain: `${n} ÷ 10 = ${num(n / 10)} cm.` }; },
  () => { const n = randInt(1, 20); return { prompt: `${n} cm = __ mm`, answer: String(n * 10), explain: `${n} × 10 = ${n * 10} mm.` }; },
  () => { const n = randInt(1, 9) * 500; return { prompt: `${n} g = __ kg`, answer: num(n / 1000), explain: `${n} ÷ 1000 = ${num(n / 1000)} kg.` }; },
  () => { const n = randInt(1, 9); return { prompt: `${n} kg = __ g`, answer: String(n * 1000), explain: `${n} × 1000 = ${n * 1000} g.` }; },
  () => { const n = randInt(1, 9) * 500; return { prompt: `${n} mL = __ L`, answer: num(n / 1000), explain: `${n} ÷ 1000 = ${num(n / 1000)} L.` }; },
  () => { const h = randInt(1, 9); const l = h / 2; return { prompt: `${num(l)} L = __ mL`, answer: String(h * 500), explain: `${num(l)} × 1000 = ${h * 500} mL.` }; },
  () => { const n = randInt(1, 9); return Math.random() < 0.5 ? { prompt: `${n} km = __ m`, answer: String(n * 1000), explain: `${n} × 1000 = ${n * 1000} m.` } : { prompt: `${n * 1000} m = __ km`, answer: String(n), explain: `${n * 1000} ÷ 1000 = ${n} km.` }; },
  () => { const toSmall = Math.random() < 0.5; const pair = pick([['metres', 'centimetres', 100], ['kilograms', 'grams', 1000], ['litres', 'millilitres', 1000], ['centimetres', 'millimetres', 10]]);
    const from = toSmall ? pair[0] : pair[1], to = toSmall ? pair[1] : pair[0]; const ans = toSmall ? 'multiply' : 'divide';
    return { prompt: `To change ${from} to ${to}, do you multiply or divide by ${pair[2]}?`, answer: ans, choices: ['multiply', 'divide'], wrongTags: { [toSmall ? 'divide' : 'multiply']: 'multiply-divide-swapped' },
      explain: toSmall ? `Smaller units mean more of them, so multiply by ${pair[2]}.` : `Bigger units mean fewer of them, so divide by ${pair[2]}.` }; },
];

// ---------- Level 6: perimeter ----------
const POLY = [['triangle', 3], ['square', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8]];
const L6 = [
  () => { const w = randInt(2, 9), h = randInt(2, 9); return { prompt: `What is the perimeter of this ${w} cm × ${h} cm rectangle?`, answer: String(2 * (w + h)), visual: { type: 'area', w, h }, hint: 'Add all four sides.', explain: `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.` }; },
  () => { const s = randInt(3, 12); return { prompt: `A square has sides of ${s} cm. What is its perimeter?`, answer: String(4 * s), explain: `4 × ${s} = ${4 * s} cm.` }; },
  () => { const [name, n] = pick(POLY); const s = randInt(3, 12); const reg = name === 'square' ? '' : 'regular '; return { prompt: `A ${reg}${name} has sides of ${s} cm. What is its perimeter?`, answer: String(n * s), explain: `A ${reg}${name} has ${n} equal sides: ${n} × ${s} = ${n * s} cm.` }; },
  () => { const a = randInt(1, 4), b = randInt(1, 11) * 5, c = randInt(1, 4), d = randInt(1, 11) * 5; const t = (a + c) * 100 + b + d;
    return { prompt: `${a} m ${b} cm + ${c} m ${d} cm = __ cm`, answer: String(t), explain: `${a} m ${b} cm = ${a * 100 + b} cm and ${c} m ${d} cm = ${c * 100 + d} cm. ${a * 100 + b} + ${c * 100 + d} = ${t} cm.` }; },
  () => { const w = randInt(2, 8), l = randInt(w + 1, 15); const p = 2 * (w + l);
    return { prompt: `A rectangle has a perimeter of ${p} cm and a width of ${w} cm. What is its length?`, answer: String(l), explain: `Two widths are ${2 * w}. ${p} − ${2 * w} = ${2 * l}, and half of that is ${l} cm.` }; },
  () => { const w = randInt(20, 120), h = randInt(20, 120); return { prompt: `A field is ${w} m by ${h} m. What is its perimeter in metres?`, answer: String(2 * (w + h)), explain: `2 × (${w} + ${h}) = ${2 * (w + h)} m.` }; },
  () => { const w = randInt(3, 9), h = randInt(2, 8); const wrong = w + h;
    return { prompt: `A rectangle is ${w} cm by ${h} cm. What is its perimeter?`, answer: String(2 * (w + h)), choices: mc(2 * (w + h), [wrong, w * h, 2 * (w + h) + 2]), wrongTags: { [wrong]: 'added-only-two-sides', [w * h]: 'area-for-perimeter' },
      explain: `All four sides: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.` }; },
];

// ---------- Level 7: area of rectangles, area vs perimeter, decimals ----------
const L7 = [
  () => { const w = randInt(2, 9), h = randInt(2, 9); return { prompt: `What is the area of this ${w} × ${h} rectangle in square units?`, answer: String(w * h), visual: { type: 'area', w, h }, hint: 'Count rows × columns.', explain: `${w} × ${h} = ${w * h} square units.` }; },
  () => { const w = randInt(6, 15), h = randInt(6, 15); return { prompt: `A rectangle is ${w} cm by ${h} cm. What is its area in cm²?`, answer: String(w * h), explain: `${w} × ${h} = ${w * h} cm².` }; },
  () => { const a = randInt(2, 6), b = randInt(a + 1, 9); return { prompt: `A rectangle has perimeter ${2 * (a + b)} and area ${a * b}. What is its shorter side?`, answer: String(a), hint: 'Which two numbers add to half the perimeter and multiply to the area?', explain: `${a} + ${b} = ${a + b} (half of ${2 * (a + b)}) and ${a} × ${b} = ${a * b}. Shorter side: ${a}.` }; },
  () => { const a = randInt(3, 9), b = randInt(3, 12); return { prompt: `A rectangle has area ${a * b} cm² and one side of ${a} cm. How long is the other side?`, answer: String(b), explain: `${a * b} ÷ ${a} = ${b} cm.` }; },
  () => { const a = randInt(4, 40) / 4, b = randInt(4, 40) / 4; const u = pick(['kg', 'L']); return { prompt: `${num(a)} ${u} + ${num(b)} ${u} = __ ${u}`, answer: num(a + b), explain: `${num(a)} + ${num(b)} = ${num(a + b)} ${u}.` }; },
  () => { const s = pick([3, 5, 6, 7, 8]); const area = s * s, per = 4 * s; const askArea = Math.random() < 0.5;
    return { prompt: `A square has sides of ${s} cm. What is its ${askArea ? 'area in cm²' : 'perimeter in cm'}?`, answer: String(askArea ? area : per), choices: mc(askArea ? area : per, [askArea ? per : area, s * 2, s * s * 2]),
      wrongTags: { [askArea ? per : area]: 'area-perimeter-confused' }, explain: askArea ? `Area = ${s} × ${s} = ${area} cm².` : `Perimeter = 4 × ${s} = ${per} cm.` }; },
  () => { const w1 = randInt(2, 6), h1 = randInt(5, 9), w2 = randInt(3, 7), h2 = randInt(3, 7); if (w1 * h1 === w2 * h2) return L7[0]();
    const A = `${w1} × ${h1}`, B = `${w2} × ${h2}`; const ans = w1 * h1 > w2 * h2 ? A : B;
    return { prompt: `Which rectangle has the larger area: ${A} or ${B}?`, answer: ans, choices: [A, B], explain: `${A} = ${w1 * h1} and ${B} = ${w2 * h2}. ${ans} is larger.` }; },
  () => { const a = randInt(1, 9) + randInt(0, 3) * 0.25 + 0.25, b = randInt(1, 5) + 0.5; if (a <= b) return L7[4]();
    return { prompt: `A bag of flour has ${num(a)} kg. You use ${num(b)} kg. How many kg are left?`, answer: num(a - b), explain: `${num(a)} − ${num(b)} = ${num(a - b)} kg.` }; },
];

// ---------- Level 8: triangles, parallelograms, composite, US customary ----------
const US = [['12 inches = 1 __', 'foot', ['yard', 'mile', 'pound']], ['3 feet = 1 __', 'yard', ['foot', 'mile', 'inch']], ['16 ounces = 1 __', 'pound', ['cup', 'foot', 'gallon']], ['4 quarts = 1 __', 'gallon', ['cup', 'pint', 'pound']]];
const L8 = [
  () => { const b = randInt(2, 12), h = randInt(2, 10); return { prompt: `A triangle has base ${b} cm and height ${h} cm. What is its area in cm²?`, answer: num(b * h / 2), hint: 'Area of a triangle = base × height ÷ 2.', explain: `${b} × ${h} ÷ 2 = ${num(b * h / 2)} cm².` }; },
  () => { const b = randInt(4, 12), h = randInt(2, b - 1), s = h + randInt(1, 3); const ans = b * h / 2;
    return { prompt: `A triangle has base ${b}, height ${h}, and a slanted side of ${s}. Area?`, answer: num(ans), choices: mc(num(ans), [num(b * s / 2), b * h, num(b * s)]), wrongTags: { [num(b * s / 2)]: 'slant-as-height', [b * h]: 'forgot-half' },
      explain: `Use the height, not the slanted side: ${b} × ${h} ÷ 2 = ${num(ans)}.` }; },
  () => { const b = randInt(3, 12), h = randInt(2, 9), s = h + randInt(1, 3);
    return { prompt: `A parallelogram has base ${b} cm, height ${h} cm, and side ${s} cm. Area in cm²?`, answer: String(b * h), choices: mc(b * h, [b * s, 2 * (b + s), b * h / 2]), wrongTags: { [b * s]: 'slant-as-height' }, explain: `Area = base × height = ${b} × ${h} = ${b * h} cm².` }; },
  () => { const W = randInt(6, 12), H = randInt(5, 10), w = randInt(2, W - 2), h = randInt(2, H - 2);
    return { prompt: `An L-shape is ${artNum(W)} ${W} × ${H} rectangle with ${artNum(w)} ${w} × ${h} corner cut out. What is its area?`, answer: String(W * H - w * h), hint: 'Big rectangle minus the missing piece.', explain: `${W} × ${H} = ${W * H}, minus ${w} × ${h} = ${w * h}, gives ${W * H - w * h}.` }; },
  () => { const a = randInt(2, 8), b = randInt(3, 9), c = randInt(2, 5), d = randInt(2, 6); return { prompt: `A shape is made of ${artNum(a)} ${a} × ${b} rectangle joined to ${artNum(c)} ${c} × ${d} rectangle. Total area?`, answer: String(a * b + c * d), explain: `${a * b} + ${c * d} = ${a * b + c * d} square units.` }; },
  () => { const [q, a, w] = pick(US); return { prompt: q, answer: a, choices: mc(a, w), explain: `In US units, ${q.replace(' __', ` ${a}`)}.` }; },
  () => pick([() => { const f = randInt(2, 6); return { prompt: `${f} feet = __ inches`, answer: String(f * 12), explain: `${f} × 12 = ${f * 12} inches.` }; },
    () => { const p = randInt(2, 5); return { prompt: `${p} pounds = __ ounces`, answer: String(p * 16), explain: `${p} × 16 = ${p * 16} ounces.` }; },
    () => { const y = randInt(2, 6); return { prompt: `${y} yards = __ feet`, answer: String(y * 3), explain: `${y} × 3 = ${y * 3} feet.` }; }])(),
  () => { const b = randInt(2, 8) * 2, h = randInt(3, 9); return { prompt: `A rectangle ${b} × ${h} is cut in half along a diagonal. Area of each triangle?`, answer: String(b * h / 2), explain: `The rectangle is ${b * h}; each triangle is half: ${b * h / 2}.` }; },
];

// ---------- Level 9: volume, surface area, decimal conversions ----------
const L9 = [
  () => { const l = randInt(2, 9), w = randInt(2, 9), h = randInt(2, 9); return { prompt: `A box is ${l} cm by ${w} cm by ${h} cm. What is its volume in cm³?`, answer: String(l * w * h), explain: `${l} × ${w} × ${h} = ${l * w * h} cm³.` }; },
  () => { const l = randInt(2, 7), w = randInt(2, 7), h = randInt(2, 7); const sa = 2 * (l * w + l * h + w * h);
    return { prompt: `A box is ${l} × ${w} × ${h}. What is its surface area?`, answer: String(sa), hint: 'Six faces: 2 × (lw + lh + wh).', explain: `2 × (${l * w} + ${l * h} + ${w * h}) = ${sa}.` }; },
  () => { const n = randInt(2, 9); const vol = Math.random() < 0.5; return { prompt: `A cube has edges of ${n} cm. What is its ${vol ? 'volume in cm³' : 'surface area in cm²'}?`, answer: String(vol ? n ** 3 : 6 * n * n), explain: vol ? `${n} × ${n} × ${n} = ${n ** 3} cm³.` : `6 faces × ${n * n} = ${6 * n * n} cm².` }; },
  () => { const k = randInt(5, 95) / 100; return { prompt: `${num(k)} km = __ m`, answer: String(Math.round(k * 1000)), explain: `${num(k)} × 1000 = ${Math.round(k * 1000)} m.` }; },
  () => { const n = randInt(5, 39) * 50; return { prompt: `${n} mL = __ L`, answer: num(n / 1000), explain: `${n} ÷ 1000 = ${num(n / 1000)} L.` }; },
  () => { const k = randInt(11, 99) / 10; return { prompt: `${num(k)} kg = __ g`, answer: String(Math.round(k * 1000)), explain: `${num(k)} × 1000 = ${Math.round(k * 1000)} g.` }; },
  () => { const c = randInt(11, 99) / 10; return { prompt: `${num(c)} cm = __ mm`, answer: String(Math.round(c * 10)), explain: `${num(c)} × 10 = ${Math.round(c * 10)} mm.` }; },
  () => { const l = randInt(2, 6), w = randInt(2, 6), h = randInt(2, 6); const v = l * w * h;
    return { prompt: `A box is ${l} × ${w} × ${h}. What is its volume?`, answer: String(v), choices: mc(v, [l * w, 2 * (l * w + l * h + w * h), l + w + h]), wrongTags: { [l * w]: 'volume-equals-face-area' }, explain: `Volume = ${l} × ${w} × ${h} = ${v}, not just one face.` }; },
  () => { const l = randInt(2, 9), w = randInt(2, 9), h = randInt(2, 9); return { prompt: `A prism has volume ${l * w * h} cm³ and a base of ${l} cm by ${w} cm. What is its height?`, answer: String(h), explain: `${l * w * h} ÷ (${l} × ${w}) = ${h} cm.` }; },
];

// ---------- Level 10: circles, scale, rates ----------
const L10 = [
  () => { const r = randInt(1, 10); return { prompt: `A circle has radius ${r} cm. Use π ≈ 3.14. What is its circumference?`, answer: num(2 * 3.14 * r), hint: 'C = 2 × π × r.', explain: `2 × 3.14 × ${r} = ${num(2 * 3.14 * r)} cm.` }; },
  () => { const d = randInt(2, 20); return { prompt: `A circle has diameter ${d} cm. Use π ≈ 3.14. What is its circumference?`, answer: num(3.14 * d), choices: mc(num(3.14 * d), [num(2 * 3.14 * d), num(3.14 * d / 2), num(3.14 * d * d)]), wrongTags: { [num(2 * 3.14 * d)]: 'used-diameter-as-radius' }, explain: `C = π × d = 3.14 × ${d} = ${num(3.14 * d)} cm.` }; },
  () => { const r = randInt(1, 10); return { prompt: `A circle has radius ${r} cm. Use π ≈ 3.14. What is its area?`, answer: num(3.14 * r * r), choices: mc(num(3.14 * r * r), [num(3.14 * 4 * r * r), num(2 * 3.14 * r), num(3.14 * r)]), wrongTags: { [num(3.14 * 4 * r * r)]: 'used-diameter-in-r2' }, explain: `A = π × r² = 3.14 × ${r * r} = ${num(3.14 * r * r)} cm².` }; },
  () => { const d = randInt(2, 10); return { prompt: `A circle has circumference ${num(3.14 * d)} cm. Use π ≈ 3.14. What is its diameter?`, answer: String(d), explain: `${num(3.14 * d)} ÷ 3.14 = ${d} cm.` }; },
  () => { const scale = pick([100, 1000, 5000, 10000]); const cm = randInt(2, 9); const m = cm * scale / 100;
    return { prompt: `A map has scale 1:${scale}. A path is ${cm} cm on the map. How long is it really, in metres?`, answer: String(m), explain: `${cm} cm × ${scale} = ${cm * scale} cm = ${m} m.` }; },
  () => { const t = pick([1.5, 2, 2.5, 3, 4]), s = pick([40, 60, 80, 100, 120]); return { prompt: `A car travels ${num(s * t)} km in ${num(t)} h. What is its speed in km/h?`, answer: String(s), hint: 'Speed = distance ÷ time.', explain: `${num(s * t)} ÷ ${num(t)} = ${s} km/h.` }; },
  () => { const t = pick([1.5, 2, 2.5, 3, 0.5]), s = pick([40, 60, 80, 100]); return { prompt: `A train goes ${s} km/h for ${num(t)} h. How far does it travel in km?`, answer: num(s * t), explain: `${s} × ${num(t)} = ${num(s * t)} km.` }; },
  () => { const t = pick([1.5, 2, 2.5, 3, 4]), s = pick([40, 60, 80]); return { prompt: `How many hours does it take to go ${num(s * t)} km at ${s} km/h?`, answer: num(t), explain: `${num(s * t)} ÷ ${s} = ${num(t)} h.` }; },
  () => { const scale = pick([20, 50, 100]); const real = randInt(1, 8) * 100; return { prompt: `A drawing uses scale 1:${scale}. A wall is ${real} cm long. How long is it on the drawing, in cm?`, answer: String(real / scale), explain: `${real} ÷ ${scale} = ${real / scale} cm.` }; },
];

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'measurement', name: 'Measurement', emoji: '📏', group: 'world',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return pick(LEVELS[lvl])();
  },
};
