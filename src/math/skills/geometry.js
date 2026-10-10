// Geometry: shapes, solids, symmetry, angles, coordinates, area, transformations. Ladder: docs/curriculum.md A14.
import { randInt, pick, shuffle } from '../rng.js';

const num = (x) => String(Math.round(x * 1000) / 1000);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function mc(answer, wrong, n = 4) {
  const out = [String(answer)];
  for (const w of wrong) { const s = String(w); if (!out.includes(s) && out.length < n) out.push(s); }
  return shuffle(out);
}
const SIDES = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6, rhombus: 4, trapezoid: 4, heptagon: 7, octagon: 8 };
const pt = (x, y) => `(${x}, ${y})`;
// "a 11 × 6" reads as "an eleven"; pick the article by sound.
const artNum = (n) => (n === 8 || n === 11 || n === 18 ? 'an' : 'a');
const others = (list, a, n = 3) => shuffle(list.filter((x) => x !== a)).slice(0, n);

// ---------- Level 1: name 2D shapes, count sides ----------
const BASIC = ['circle', 'triangle', 'square', 'rectangle', 'hexagon'];
const L1 = [
  () => { const k = pick(BASIC); return { prompt: 'What is this shape called?', answer: k, choices: mc(k, others(BASIC, k)), visual: { type: 'shape', kind: k }, explain: k === 'circle' ? 'A circle is round with no corners.' : `A ${k} has ${SIDES[k]} sides${k === 'square' ? ', all the same length' : ''}.` }; },
  () => { const k = pick(['triangle', 'square', 'pentagon', 'hexagon']); const n = SIDES[k]; const list = ['circle', 'triangle', 'square', 'pentagon', 'hexagon'].filter((x) => SIDES[x] !== n); return { prompt: `Which shape has ${n} sides?`, answer: k, choices: mc(k, shuffle(list)), explain: `A ${k} has ${n} sides.` }; },
  () => { const k = pick(['triangle', 'square', 'rectangle', 'pentagon', 'hexagon']); return { prompt: `How many sides does a ${k} have?`, answer: String(SIDES[k]), visual: { type: 'shape', kind: k }, explain: `Count the straight edges: a ${k} has ${SIDES[k]}.` }; },
  () => { const k = pick(['triangle', 'square', 'rectangle', 'hexagon']); return { prompt: `How many corners does a ${k} have?`, answer: String(SIDES[k]), explain: `A shape has as many corners as sides: ${SIDES[k]}.` }; },
  () => ({ prompt: 'Which shape has no corners?', answer: 'circle', choices: mc('circle', ['square', 'triangle', 'rectangle']), explain: 'A circle is one curved line with no corners.' }),
  // No visual: the shape renderer has no rotated square, and its 'rhombus' is a real (non-square) rhombus, which would contradict the answer.
  () => ({ prompt: 'A square is turned to stand on one corner. What shape is it now?', answer: 'still a square', choices: shuffle(['still a square', 'a diamond', 'a triangle']), wrongTags: { 'a diamond': 'rotation-changes-shape' }, explain: 'Turning a shape does not change it. It still has 4 equal sides and 4 square corners.' }),
];

// ---------- Level 2: 3D solids ----------
const SOLIDS = ['cube', 'sphere', 'cone', 'cylinder', 'rectangular prism', 'pyramid'];
const SOLID_Q = [['Which solid is shaped like a ball?', 'sphere'], ['Which solid has 6 square faces?', 'cube'], ['Which solid has a point on top and a circle at the bottom?', 'cone'], ['Which solid is shaped like a can?', 'cylinder'], ['Which solid is shaped like a cereal box?', 'rectangular prism'], ['Which solid has a square bottom and 4 triangle faces?', 'pyramid'], ['Which solid rolls but has no flat faces?', 'sphere']];
const FEV = [['cube', 'faces', 6], ['cube', 'edges', 12], ['cube', 'vertices (corners)', 8], ['rectangular prism', 'faces', 6], ['rectangular prism', 'edges', 12], ['square pyramid', 'faces', 5], ['square pyramid', 'vertices (corners)', 5], ['cylinder', 'flat faces', 2], ['cone', 'flat faces', 1]];
const L2 = [
  () => { const [q, a] = pick(SOLID_Q); return { prompt: q, answer: a, choices: mc(a, others(SOLIDS, a)), explain: `The ${a} fits that description.` }; },
  () => { const [s, part, n] = pick(FEV); return { prompt: `How many ${part} does a ${s} have?`, answer: String(n), explain: `A ${s} has ${n} ${part}.` }; },
  () => ({ prompt: 'A dice is which kind of shape?', answer: 'a cube', choices: shuffle(['a cube', 'a square', 'a rectangle']), wrongTags: { 'a square': 'cube-called-square' }, explain: 'A square is flat. A dice is solid with 6 square faces, so it is a cube.' }),
  () => { const can = pick([['sphere', 'can roll'], ['cylinder', 'can roll'], ['cube', 'can be stacked'], ['rectangular prism', 'can be stacked']]); const noList = can[1] === 'can roll' ? ['cube', 'rectangular prism', 'pyramid'] : ['sphere', 'cone']; return { prompt: `Which of these ${can[1]}?`, answer: can[0], choices: mc(can[0], noList), explain: `A ${can[0]} ${can[1]} because of its ${can[1] === 'can roll' ? 'curved surface' : 'flat faces'}.` }; },
  () => { const [a, b] = shuffle([['cube', 6], ['square pyramid', 5], ['triangular prism', 5], ['rectangular prism', 6], ['cone', 1], ['cylinder', 2]]).slice(0, 2); if (a[1] === b[1]) return L2[1](); const ans = a[1] > b[1] ? a[0] : b[0]; return { prompt: `Which has more flat faces: a ${a[0]} or a ${b[0]}?`, answer: ans, choices: shuffle([a[0], b[0]]), explain: `A ${a[0]} has ${a[1]} and a ${b[0]} has ${b[1]}.` }; },
];

// ---------- Level 3: symmetry (one line), compose shapes, position ----------
const SYM = ['A', 'H', 'M', 'T', 'U', 'V', 'W', 'X', 'O'], NOSYM = ['F', 'G', 'J', 'L', 'P', 'Q', 'R', 'S', 'Z'];
const L3 = [
  () => { const a = pick(SYM); return { prompt: 'Which letter has a line of symmetry?', answer: a, choices: mc(a, shuffle(NOSYM)), explain: `${a} can be folded so both halves match. The others cannot.` }; },
  () => { const [k, yes] = pick([['square', 'Yes'], ['circle', 'Yes'], ['rectangle', 'Yes'], ['hexagon', 'Yes'], ['trapezoid', 'Yes'], ['triangle', 'Yes']]); return { prompt: `Does this ${k} have a line of symmetry?`, answer: yes, choices: ['Yes', 'No'], visual: { type: 'shape', kind: k }, explain: `Yes. A ${k} can be folded in half so both sides match.` }; },
  () => pick([{ prompt: 'Two squares side by side make which shape?', answer: 'rectangle', choices: mc('rectangle', ['triangle', 'hexagon', 'circle']), explain: 'Two squares in a row make a longer rectangle.' }, { prompt: 'A square cut along one diagonal makes 2 of which shape?', answer: 'triangles', choices: mc('triangles', ['rectangles', 'squares', 'circles']), explain: 'Cutting corner to corner makes two triangles.' }, { prompt: 'How many small squares fit in a 2 by 2 square?', answer: '4', explain: '2 rows of 2 is 4 squares.' }, { prompt: 'Six equal triangles can be put together to make which shape?', answer: 'hexagon', choices: mc('hexagon', ['square', 'pentagon', 'circle']), explain: 'Six triangles around a point make a hexagon.' }, { prompt: 'How many triangles make a rectangle cut along one diagonal?', answer: '2', explain: 'One diagonal cut makes 2 triangles.' }]),
  () => { const xa = randInt(0, 6), xb = randInt(0, 6), y = randInt(1, 5); if (xa === xb) return L3[0](); const ans = xa < xb ? 'left' : 'right'; return { prompt: 'Is point A to the left or right of point B?', answer: ans, choices: ['left', 'right'], visual: { type: 'grid', w: 7, h: 6, points: [[xa, y, 'A'], [xb, y, 'B']] }, explain: `A is at ${xa} across and B is at ${xb} across, so A is to the ${ans}.` }; },
  () => { const ya = randInt(0, 5), yb = randInt(0, 5), x = randInt(1, 5); if (ya === yb) return L3[0](); const ans = ya > yb ? 'above' : 'below'; return { prompt: 'Is point A above or below point B?', answer: ans, choices: ['above', 'below'], visual: { type: 'grid', w: 7, h: 6, points: [[x, ya, 'A'], [x, yb, 'B']] }, explain: `A is ${ya} up and B is ${yb} up, so A is ${ans} B.` }; },
  () => ({ prompt: 'How many lines of symmetry does a square have?', answer: '4', choices: mc('4', ['2', '1', '8']), visual: { type: 'shape', kind: 'square' }, wrongTags: { 2: 'diagonal-symmetry-missed' }, explain: 'Two lines through the middles of the sides and two through the corners: 4.' }),
];

// ---------- Level 4: polygons by sides, quadrilateral types, right angles ----------
const POLYS = ['triangle', 'quadrilateral', 'pentagon', 'hexagon', 'heptagon', 'octagon'];
const POLY_SIDES = { triangle: 3, quadrilateral: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8 };
const QUADS = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid'];
const QUAD_Q = [['Which quadrilateral has 4 equal sides but no right angles?', 'rhombus', ['square', 'rectangle', 'trapezoid']], ['Which quadrilateral has 4 equal sides and 4 right angles?', 'square', ['rhombus', 'rectangle', 'parallelogram']], ['Which quadrilateral has 4 right angles but sides that are not all equal?', 'rectangle', ['square', 'rhombus', 'trapezoid']], ['Which quadrilateral has exactly one pair of parallel sides?', 'trapezoid', ['square', 'rectangle', 'parallelogram']], ['Which quadrilateral has two pairs of parallel sides but no right angles and sides not all equal?', 'parallelogram', ['rectangle', 'square', 'trapezoid']]];
const L4 = [
  () => { const p = pick(POLYS); return { prompt: `A polygon with ${POLY_SIDES[p]} sides is called a ___`, answer: p, choices: mc(p, others(POLYS, p)), explain: `${cap(p)} means ${POLY_SIDES[p]} sides.` }; },
  () => { const p = pick(POLYS); const art = p === 'octagon' ? 'an' : 'a'; return { prompt: `How many sides does ${art} ${p} have?`, answer: String(POLY_SIDES[p]), explain: `${cap(art)} ${p} has ${POLY_SIDES[p]} sides.` }; },
  () => { const [q, a, w] = pick(QUAD_Q); return { prompt: q, answer: a, choices: mc(a, w), explain: `That describes a ${a}.` }; },
  () => ({ prompt: 'Is a square also a rectangle?', answer: 'Yes', choices: ['Yes', 'No'], wrongTags: { No: 'square-not-rectangle' }, explain: 'A rectangle has 4 right angles. A square has them too, so a square is a special rectangle.' }),
  () => { const [s, n] = pick([['rectangle', 4], ['square', 4], ['right triangle', 1], ['trapezoid with two square corners', 2]]); return { prompt: `How many right angles does a ${s} have?`, answer: String(n), explain: `A ${s} has ${n} right ${n === 1 ? 'angle' : 'angles'}.` }; },
  () => { const k = pick(['rhombus', 'trapezoid', 'pentagon', 'hexagon', 'rectangle']); const list = ['rhombus', 'trapezoid', 'pentagon', 'hexagon', 'rectangle', 'square']; return { prompt: 'Name this shape.', answer: k, choices: mc(k, others(list, k)), visual: { type: 'shape', kind: k }, explain: k === 'rhombus' ? 'Four equal sides, slanted: a rhombus.' : k === 'trapezoid' ? 'One pair of parallel sides: a trapezoid.' : `${SIDES[k]} sides: a ${k}.` }; },
  () => { const p = pick(POLYS), k = randInt(2, 4); return { prompt: `How many sides do ${k} ${p}s have in total?`, answer: String(k * POLY_SIDES[p]), explain: `${k} × ${POLY_SIDES[p]} = ${k * POLY_SIDES[p]} sides.` }; },
];

// ---------- Level 5: angle types, first-quadrant coordinates ----------
const ANGLE_TYPES = ['acute', 'right', 'obtuse', 'straight'];
const classify = (d) => d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : 'straight';
const randAngle = () => pick([randInt(2, 16) * 5, 90, randInt(20, 34) * 5, 180]);
const L5 = [
  () => { const d = randAngle(); const a = classify(d); return { prompt: 'What kind of angle is this?', answer: a, choices: ANGLE_TYPES, visual: { type: 'angle', degrees: d }, explain: `This angle is ${d}°. ${a === 'acute' ? 'Less than 90° is acute.' : a === 'right' ? 'Exactly 90° is a right angle.' : a === 'obtuse' ? 'Between 90° and 180° is obtuse.' : '180° is a straight angle.'}` }; },
  () => { const d = randAngle(); const a = classify(d); return { prompt: `An angle of ${d}° is ___`, answer: a, choices: ANGLE_TYPES, explain: `${d}° is ${a === 'acute' ? 'less than 90°, so acute' : a === 'right' ? 'exactly 90°, so right' : a === 'obtuse' ? 'between 90° and 180°, so obtuse' : 'a straight line, so straight'}.` }; },
  () => { let x = randInt(0, 9), y = randInt(0, 9); if (x === y) y = (y + 3) % 10; return { prompt: 'What are the coordinates of point A?', answer: pt(x, y), choices: mc(pt(x, y), [pt(y, x), pt(x + 1, y), pt(x, y + 1)]), visual: { type: 'grid', w: 10, h: 10, points: [[x, y, 'A']] }, wrongTags: { [pt(y, x)]: 'xy-swapped' }, hint: 'Across first, then up.', explain: `Go ${x} across and ${y} up: ${pt(x, y)}.` }; },
  () => { const x = randInt(0, 9), y = randInt(0, 9); return { prompt: `Plot the point ${pt(x, y)}.`, answer: `${x},${y}`, input: 'visual', visual: { type: 'grid', w: 10, h: 10, question: 'point' }, hint: 'Across first, then up.', explain: `Start at 0, go ${x} across, then ${y} up.` }; },
  () => pick([{ prompt: 'A right angle is how many degrees?', answer: '90', explain: 'A right angle, like the corner of a square, is 90°.' }, { prompt: 'A straight angle is how many degrees?', answer: '180', explain: 'A straight line is 180°.' }, { prompt: 'A full turn is how many degrees?', answer: '360', explain: 'All the way around is 360°.' }, { prompt: 'Half of a right angle is how many degrees?', answer: '45', explain: '90 ÷ 2 = 45°.' }]),
  () => { const a = randInt(2, 16) * 5, b = randInt(19, 34) * 5; const ans = `${b}°`; return { prompt: `Which angle is larger: ${a}° or ${b}°?`, answer: ans, choices: shuffle([`${a}°`, `${b}°`]), explain: `${b} is more than ${a}, so ${b}° opens wider.` }; },
];

// ---------- Level 6: angles in triangles, classify triangles, protractor ----------
const TRI = [['equilateral', 'all 3 sides equal'], ['isosceles', '2 sides equal'], ['scalene', 'no sides equal'], ['right', 'one 90° angle']];
const L6 = [
  () => { const a = randInt(4, 18) * 5, b = randInt(4, (160 - a) / 5) * 5; return { prompt: `Two angles of a triangle are ${a}° and ${b}°. What is the third angle?`, answer: String(180 - a - b), hint: 'The three angles add to 180°.', explain: `180 − ${a} − ${b} = ${180 - a - b}°.` }; },
  () => { const s = randInt(3, 9); const kind = pick(['equilateral', 'isosceles', 'scalene']); const sides = kind === 'equilateral' ? [s, s, s] : kind === 'isosceles' ? [s, s, s + randInt(1, Math.min(3, s - 1))] /* third side < 2s keeps the triangle real */ : [s, s + 1, s + 3]; const ans = kind; return { prompt: `A triangle has sides ${sides.join(', ')}. What kind of triangle is it?`, answer: ans, choices: ['equilateral', 'isosceles', 'scalene'], explain: `${kind === 'equilateral' ? 'All three sides are equal' : kind === 'isosceles' ? 'Two sides are equal' : 'No sides are equal'}: ${kind}.` }; },
  () => { const [name, desc] = pick(TRI); return { prompt: `A triangle with ${desc} is called ___`, answer: name, choices: TRI.map((t) => t[0]), explain: `${cap(name)} means ${desc}.` }; },
  () => { const d = pick([30, 45, 60, 120, 135, 150, 20, 160, 70, 110]); return { prompt: 'About how many degrees is this angle?', answer: String(d), choices: mc(d, [180 - d, d + 30 > 180 ? d - 30 : d + 30, d < 90 ? 90 : 60]), visual: { type: 'angle', degrees: d }, wrongTags: { [180 - d]: 'wrong-protractor-scale' }, explain: `It is ${d < 90 ? 'smaller' : 'larger'} than a right angle, so use the scale that gives ${d}°.` }; },
  () => { const apex = randInt(10, 70) * 2; return { prompt: `An isosceles triangle has a top angle of ${apex}°. What is each base angle?`, answer: String((180 - apex) / 2), explain: `The two base angles are equal: (180 − ${apex}) ÷ 2 = ${(180 - apex) / 2}°.` }; },
  () => pick([{ prompt: 'The angles in any triangle add up to how many degrees?', answer: '180', explain: 'Every triangle: 180°.' }, { prompt: 'Each angle in an equilateral triangle is how many degrees?', answer: '60', explain: '180 ÷ 3 = 60°.' }, { prompt: 'A right triangle has a 90° angle and a 35° angle. What is the third angle?', answer: '55', explain: '180 − 90 − 35 = 55°.' }]),
  () => { const a = randInt(5, 16) * 5; return { prompt: `A right triangle has one angle of ${a}°. What is the other non-right angle?`, answer: String(90 - a), explain: `The two small angles add to 90: 90 − ${a} = ${90 - a}°.` }; },
];

// ---------- Level 7: perimeter/area of rectilinear shapes, symmetry counts, nets ----------
const REG = [['equilateral triangle', 3], ['square', 4], ['regular pentagon', 5], ['regular hexagon', 6], ['regular octagon', 8], ['rectangle (not square)', 2]];
const L7 = [
  () => { const w = randInt(3, 9), h = randInt(2, 9); const area = Math.random() < 0.5; return { prompt: `What is the ${area ? 'area' : 'perimeter'} of this ${w} × ${h} rectangle?`, answer: String(area ? w * h : 2 * (w + h)), visual: { type: 'area', w, h }, explain: area ? `${w} × ${h} = ${w * h} square units.` : `2 × (${w} + ${h}) = ${2 * (w + h)} units.` }; },
  () => { const W = randInt(6, 12), H = randInt(5, 10), w = randInt(2, W - 2), h = randInt(2, H - 2); const ans = W * H - w * h; return { prompt: `An L-shape is ${artNum(W)} ${W} × ${H} rectangle with ${artNum(w)} ${w} × ${h} corner removed. What is its area?`, answer: String(ans), choices: mc(ans, [W * H, W * H + w * h, (W - w) * (H - h)]), wrongTags: { [W * H]: 'multiplied-outer-dimensions' }, explain: `${W} × ${H} = ${W * H}, minus the ${w} × ${h} = ${w * h} piece: ${ans}.` }; },
  () => { const [name, n] = pick(REG); return { prompt: `How many lines of symmetry does a ${name} have?`, answer: String(n), explain: n === 2 ? 'A rectangle has 2: through the middles of the long sides and the short sides (not the diagonals).' : `A regular shape has as many lines of symmetry as sides: ${n}.` }; },
  () => ({ prompt: 'How many lines of symmetry does a circle have?', answer: 'infinitely many', choices: mc('infinitely many', ['1', '2', '4']), explain: 'Every line through the centre is a line of symmetry.' }),
  () => { const [q, a, e] = pick([['A net of a cube is made of how many squares?', 6, 'A cube has 6 faces, so its net has 6 squares.'], ['A net of a triangular prism has how many rectangles?', 3, 'The 3 side faces are rectangles; the 2 ends are triangles.'], ['A net of a square pyramid has how many triangles?', 4, 'One square base and 4 triangle sides.'], ['A net of a cylinder has how many circles?', 2, 'Two circle ends and one rectangle wrapped around.'], ['A net of a rectangular prism has how many faces in total?', 6, 'A rectangular prism has 6 rectangular faces.']]); return { prompt: q, answer: String(a), explain: e }; },
  () => { const a = randInt(6, 12), b = randInt(3, 5), c = randInt(3, 6); return { prompt: `${cap(artNum(a))} ${a} × ${b} rectangle is joined to a ${c} × ${c} square along a side. Total area?`, answer: String(a * b + c * c), explain: `${a * b} + ${c * c} = ${a * b + c * c}.` }; },
  () => { const W = randInt(6, 12), H = randInt(4, 8), w = randInt(2, W - 2), h = randInt(1, H - 2); return { prompt: `An L-shape is ${artNum(W)} ${W} × ${H} rectangle with ${artNum(w)} ${w} × ${h} corner removed. What is its perimeter?`, answer: String(2 * (W + H)), hint: 'Slide the two inner edges outward; the perimeter is the same as the full rectangle.', explain: `The cut-out edges add up to the same as the missing outer edges, so the perimeter is 2 × (${W} + ${H}) = ${2 * (W + H)}.` }; },
];

// ---------- Level 8: transformations, four quadrants ----------
const nz = () => { const v = randInt(-9, 9); return v === 0 ? 3 : v; };
const quadrant = (x, y) => x > 0 && y > 0 ? 'Quadrant I' : x < 0 && y > 0 ? 'Quadrant II' : x < 0 && y < 0 ? 'Quadrant III' : 'Quadrant IV';
const L8 = [
  () => { const x = nz(), y = nz(); const ans = pt(-x, y); return { prompt: `Reflect ${pt(x, y)} in the y-axis. Where does it land?`, answer: ans, choices: mc(ans, [pt(x, -y), pt(-x, -y), pt(y, x)]), wrongTags: { [pt(x, -y)]: 'reflected-wrong-axis' }, explain: `Reflecting in the y-axis flips the x sign: ${ans}.` }; },
  () => { const x = nz(), y = nz(); const ans = pt(x, -y); return { prompt: `Reflect ${pt(x, y)} in the x-axis. Where does it land?`, answer: ans, choices: mc(ans, [pt(-x, y), pt(-x, -y), pt(y, x)]), wrongTags: { [pt(-x, y)]: 'reflected-wrong-axis' }, explain: `Reflecting in the x-axis flips the y sign: ${ans}.` }; },
  () => { const x = randInt(-5, 5), y = randInt(-5, 5), dx = randInt(1, 5), dy = randInt(1, 5); const right = Math.random() < 0.5, up = Math.random() < 0.5; const nx = x + (right ? dx : -dx), ny = y + (up ? dy : -dy); const ans = pt(nx, ny); return { prompt: `Translate ${pt(x, y)} ${dx} ${right ? 'right' : 'left'} and ${dy} ${up ? 'up' : 'down'}.`, answer: ans, choices: mc(ans, [pt(x + (right ? -dx : dx), ny), pt(nx, y + (up ? -dy : dy)), pt(ny, nx)]), wrongTags: { [pt(x + (right ? -dx : dx), ny)]: 'sign-error-x', [pt(nx, y + (up ? -dy : dy))]: 'sign-error-y' }, explain: `x: ${x} ${right ? '+' : '−'} ${dx} = ${nx}; y: ${y} ${up ? '+' : '−'} ${dy} = ${ny}. ${ans}.` }; },
  () => { const x = nz(), y = nz(); const cw = Math.random() < 0.5; const ans = cw ? pt(y, -x) : pt(-y, x); return { prompt: `Rotate ${pt(x, y)} 90° ${cw ? 'clockwise' : 'counterclockwise'} about the origin.`, answer: ans, choices: mc(ans, [cw ? pt(-y, x) : pt(y, -x), pt(-x, -y), pt(x, y)]), wrongTags: { [cw ? pt(-y, x) : pt(y, -x)]: 'rotated-wrong-direction' }, explain: `A 90° ${cw ? 'clockwise' : 'counterclockwise'} turn sends (x, y) to ${cw ? '(y, −x)' : '(−y, x)'}: ${ans}.` }; },
  () => { const x = nz(), y = nz(); return { prompt: `Rotate ${pt(x, y)} 180° about the origin.`, answer: pt(-x, -y), choices: mc(pt(-x, -y), [pt(x, -y), pt(-x, y), pt(y, x)]), explain: `A half turn flips both signs: ${pt(-x, -y)}.` }; },
  () => { const x = nz(), y = nz(); const ans = quadrant(x, y); return { prompt: `Which quadrant is ${pt(x, y)} in?`, answer: ans, choices: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], explain: `x is ${x < 0 ? 'negative' : 'positive'} and y is ${y < 0 ? 'negative' : 'positive'}: ${ans}.` }; },
  () => { const x = randInt(0, 5), y = randInt(0, 5), dx = randInt(1, 4), dy = randInt(1, 4); const ans = pt(x + dx, y + dy); return { prompt: `Translate point A ${dx} right and ${dy} up. What are its new coordinates?`, answer: ans, choices: mc(ans, [pt(x + dy, y + dx), pt(x - dx, y + dy), pt(x, y)]), visual: { type: 'grid', w: 10, h: 10, points: [[x, y, 'A']] }, explain: `A is at ${pt(x, y)}. Add ${dx} to x and ${dy} to y: ${ans}.` }; },
];

// ---------- Level 9: area of triangles/parallelograms/trapezoids, volume, angle relationships ----------
const L9 = [
  () => { const b = randInt(4, 14), h = randInt(3, 10); return { prompt: `A triangle has base ${b} and height ${h}. What is its area?`, answer: num(b * h / 2), explain: `${b} × ${h} ÷ 2 = ${num(b * h / 2)}.` }; },
  () => { const b = randInt(4, 12), h = randInt(2, b - 1), s = h + randInt(1, 3); return { prompt: `A parallelogram has base ${b}, height ${h} and slanted side ${s}. Area?`, answer: String(b * h), choices: mc(b * h, [b * s, b * h / 2, 2 * (b + s)]), wrongTags: { [b * s]: 'slant-as-height' }, explain: `Area = base × height = ${b} × ${h} = ${b * h}. The slanted side is not the height.` }; },
  () => { const a = randInt(2, 8), b = a + randInt(2, 8), h = randInt(1, 5) * 2; const ans = (a + b) * h / 2; return { prompt: `A trapezoid has parallel sides ${a} and ${b} and height ${h}. Area?`, answer: num(ans), hint: 'Area = (a + b) × h ÷ 2.', explain: `(${a} + ${b}) × ${h} ÷ 2 = ${num(ans)}.` }; },
  () => { const l = randInt(2, 10), w = randInt(2, 10), h = randInt(2, 10); return { prompt: `A rectangular prism is ${l} × ${w} × ${h}. What is its volume?`, answer: String(l * w * h), explain: `${l} × ${w} × ${h} = ${l * w * h} cubic units.` }; },
  () => { const b = randInt(2, 8) * 2, h = randInt(2, 8), L = randInt(3, 12); const ans = b * h / 2 * L; return { prompt: `A triangular prism has a triangle base ${b}, height ${h}, and length ${L}. Volume?`, answer: String(ans), hint: 'Area of the triangle × length.', explain: `Triangle area ${b * h / 2}, times length ${L} = ${ans}.` }; },
  () => { const a = randInt(2, 17) * 5; return { prompt: `Two angles are supplementary. One is ${a}°. What is the other?`, answer: String(180 - a), choices: mc(180 - a, [90 - a > 0 ? 90 - a : 90 + a, 360 - a, a]), wrongTags: { [90 - a > 0 ? 90 - a : 90 + a]: 'complementary-confusion' }, explain: `Supplementary angles add to 180: 180 − ${a} = ${180 - a}°.` }; },
  () => { const a = randInt(2, 16) * 5; return { prompt: `Two angles are complementary. One is ${a}°. What is the other?`, answer: String(90 - a), choices: mc(90 - a, [180 - a, 90 + a, a]), wrongTags: { [180 - a]: 'supplementary-confusion' }, explain: `Complementary angles add to 90: 90 − ${a} = ${90 - a}°.` }; },
  () => { const a = randInt(4, 32) * 5; return { prompt: `Two straight lines cross. One angle is ${a}°. What is the angle vertically opposite it?`, answer: String(a), choices: mc(a, [180 - a, 90 - a > 0 ? 90 - a : 90 + a, 360 - a]), wrongTags: { [180 - a]: 'opposite-vs-adjacent' }, explain: `Vertically opposite angles are equal: ${a}°.` }; },
  () => { const a = randInt(4, 32) * 5; return { prompt: `Two angles sit together on a straight line. One is ${a}°. What is the other?`, answer: String(180 - a), explain: `Angles on a straight line add to 180: 180 − ${a} = ${180 - a}°.` }; },
];

// ---------- Level 10: circles, Pythagorean triples, scale, surface area ----------
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]];
const L10 = [
  () => { const d = randInt(2, 20); return { prompt: `A circle has diameter ${d} cm. Use π ≈ 3.14. What is its circumference?`, answer: num(3.14 * d), choices: mc(num(3.14 * d), [num(2 * 3.14 * d), num(3.14 * d * d), num(3.14 * d / 2)]), wrongTags: { [num(2 * 3.14 * d)]: 'used-diameter-as-radius' }, explain: `C = π × d = 3.14 × ${d} = ${num(3.14 * d)} cm.` }; },
  () => { const r = randInt(1, 10); return { prompt: `A circle has radius ${r} cm. Use π ≈ 3.14. What is its circumference?`, answer: num(6.28 * r), explain: `C = 2 × π × r = 6.28 × ${r} = ${num(6.28 * r)} cm.` }; },
  () => { const r = randInt(1, 10); return { prompt: `A circle has radius ${r} cm. Use π ≈ 3.14. What is its area?`, answer: num(3.14 * r * r), choices: mc(num(3.14 * r * r), [num(3.14 * 4 * r * r), num(6.28 * r), num(3.14 * r)]), wrongTags: { [num(3.14 * 4 * r * r)]: 'used-diameter-in-r2', [num(6.28 * r)]: 'circumference-for-area' }, explain: `A = π × r² = 3.14 × ${r * r} = ${num(3.14 * r * r)} cm².` }; },
  () => { const d = randInt(2, 10) * 2; return { prompt: `A circle has diameter ${d} cm. Use π ≈ 3.14. What is its area?`, answer: num(3.14 * (d / 2) ** 2), hint: 'Radius is half the diameter.', explain: `r = ${d / 2}. A = 3.14 × ${(d / 2) ** 2} = ${num(3.14 * (d / 2) ** 2)} cm².` }; },
  () => { const [a, b, c] = pick(TRIPLES); return { prompt: `A right triangle has legs ${a} and ${b}. How long is the hypotenuse?`, answer: String(c), hint: 'a² + b² = c².', explain: `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, and the square root of ${c * c} is ${c}.` }; },
  () => { const [a, b, c] = pick(TRIPLES); const askA = Math.random() < 0.5; return { prompt: `A right triangle has hypotenuse ${c} and one leg ${askA ? b : a}. How long is the other leg?`, answer: String(askA ? a : b), explain: `${c}² − ${askA ? b : a}² = ${c * c} − ${askA ? b * b : a * a} = ${askA ? a * a : b * b}, so the leg is ${askA ? a : b}.` }; },
  () => { const scale = pick([50, 100, 200]), cm = randInt(1, 10) * 2; const m = cm * scale / 100; return { prompt: `A drawing has scale 1:${scale}. A wall is ${cm} cm on the drawing. Real length in metres?`, answer: String(m), explain: `${cm} × ${scale} = ${cm * scale} cm = ${m} m.` }; },
  () => { const k = randInt(2, 5); const [a, b, c] = pick(TRIPLES.slice(0, 3)); return { prompt: `A triangle with sides ${a}, ${b}, ${c} is enlarged by a scale factor of ${k}. What is its longest side?`, answer: String(c * k), explain: `Every side is multiplied by ${k}: ${c} × ${k} = ${c * k}.` }; },
  () => { const w = randInt(2, 5), h = randInt(2, 5), k = randInt(2, 4); return { prompt: `A ${w} × ${h} rectangle is enlarged by a scale factor of ${k}. What is the new area?`, answer: String(w * h * k * k), choices: mc(w * h * k * k, [w * h * k, w * h, (w + k) * (h + k)]), wrongTags: { [w * h * k]: 'area-scales-linearly' }, explain: `New sides ${w * k} and ${h * k}: ${w * k} × ${h * k} = ${w * h * k * k}. Area grows by k² = ${k * k}.` }; },
  () => { const s = randInt(2, 10); return { prompt: `A cube has edges of ${s} cm. What is its surface area?`, answer: String(6 * s * s), explain: `6 faces × ${s * s} cm² = ${6 * s * s} cm².` }; },
];

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'geometry', name: 'Geometry', emoji: '🔷', group: 'world',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return pick(LEVELS[lvl])();
  },
};
