// Money: Canadian coins first (no pennies, cash rounds to 5¢), US parallel. Ladder: docs/curriculum.md A13.
import { randInt, pick, shuffle } from '../rng.js';

const COIN = { nickel: 5, dime: 10, quarter: 25, loonie: 100, toonie: 200 };
const PLURAL = { nickel: 'nickels', dime: 'dimes', quarter: 'quarters', loonie: 'loonies', toonie: 'toonies', penny: 'pennies' };
const NAMES = Object.keys(COIN);
const dollars = (cents) => (cents / 100).toFixed(2);
const money = (cents) => `$${dollars(cents)}`;
const num = (x) => String(Math.round(x * 1000) / 1000);
function mc(answer, wrong, n = 4) {
  const out = [String(answer)];
  for (const w of wrong) { const s = String(w); if (!out.includes(s) && out.length < n) out.push(s); }
  return shuffle(out);
}
const total = (c) => (c.toonies || 0) * 200 + (c.loonies || 0) * 100 + (c.quarters || 0) * 25 + (c.dimes || 0) * 10 + (c.nickels || 0) * 5 + (c.pennies || 0);
const coinsVisual = (c, us = false) => ({ type: 'coins', quarters: c.quarters || 0, dimes: c.dimes || 0, nickels: c.nickels || 0, ...(us ? { pennies: c.pennies || 0, us: true } : { loonies: c.loonies || 0, toonies: c.toonies || 0 }) });
const SINGULAR = { nickels: 'nickel', dimes: 'dime', quarters: 'quarter', loonies: 'loonie', toonies: 'toonie', pennies: 'penny' };
const VALUE = { ...COIN, penny: 1 };
const describe = (c) => Object.entries(c).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${v === 1 ? SINGULAR[k] : k}`).join(' + ');
const countParts = (c) => Object.entries(c).filter(([, v]) => v > 0).map(([k, v]) => `${v} × ${VALUE[SINGULAR[k]]}¢ = ${v * VALUE[SINGULAR[k]]}¢`).join(', ');
// Round to nearest 5¢ (Canadian cash rounding).
const round5 = (cents) => Math.round(cents / 5) * 5;

// ---------- Level 1: identify coins ----------
const L1 = [
  () => { const n = pick(NAMES); return { prompt: `How much is a ${n} worth in cents?`, answer: String(COIN[n]), explain: `A ${n} is worth ${COIN[n]}¢.` }; },
  () => { const n = pick(NAMES); return { prompt: `Which coin is worth ${COIN[n]}¢?`, answer: n, choices: mc(n, shuffle(NAMES.filter((x) => x !== n))), explain: `The ${n} is worth ${COIN[n]}¢.` }; },
  () => { const n = pick(['nickel', 'dime', 'quarter', 'loonie', 'toonie']); const c = {}; c[PLURAL[n]] = 1;
    return { prompt: 'How many cents is this coin worth?', answer: String(COIN[n]), visual: coinsVisual(c), explain: `This is a ${n}. It is worth ${COIN[n]}¢.` }; },
  () => ({ prompt: 'Which is worth more: a nickel or a dime?', answer: 'dime', choices: shuffle(['dime', 'nickel']), wrongTags: { nickel: 'size-equals-value' }, explain: 'The dime is smaller but worth 10¢; the nickel is only 5¢.' }),
  () => { const [a, b] = shuffle(NAMES).slice(0, 2); const ans = COIN[a] > COIN[b] ? a : b; return { prompt: `Which is worth more: a ${a} or a ${b}?`, answer: ans, choices: shuffle([a, b]), wrongTags: { [ans === a ? b : a]: 'size-equals-value' }, explain: `A ${a} is ${COIN[a]}¢ and a ${b} is ${COIN[b]}¢, so the ${ans} is worth more.` }; },
  () => { const n = pick(['loonie', 'toonie']); return { prompt: `How many dollars is a ${n} worth?`, answer: String(COIN[n] / 100), explain: `A ${n} is worth $${COIN[n] / 100}.` }; },
];

// ---------- Level 2: count one coin type ----------
const L2 = [
  () => { const n = pick(['nickel', 'dime', 'quarter']); const k = n === 'quarter' ? randInt(1, 4) : randInt(2, 10); const c = {}; c[PLURAL[n]] = k;
    return { prompt: 'How many cents in all?', answer: String(k * COIN[n]), visual: coinsVisual(c), hint: `Count by ${COIN[n]}s.`, explain: `${k} ${PLURAL[n]}: ${k} × ${COIN[n]}¢ = ${k * COIN[n]}¢.` }; },
  () => { const n = pick(['nickel', 'dime']); const k = randInt(2, 10); return { prompt: `${k} ${PLURAL[n]} = __¢`, answer: String(k * COIN[n]), explain: `${k} × ${COIN[n]} = ${k * COIN[n]}¢.` }; },
  () => { const n = pick(['nickel', 'dime']); const k = randInt(3, 9); return { prompt: `${k} ${PLURAL[n]} = __¢`, answer: String(k * COIN[n]), choices: mc(k * COIN[n], [k, k * COIN[n] + COIN[n], k * COIN[n] - COIN[n]]), wrongTags: { [k]: 'counting-coins-as-one' }, explain: `Each ${n} is ${COIN[n]}¢, so ${k} × ${COIN[n]} = ${k * COIN[n]}¢.` }; },
  () => { const n = pick(['nickel', 'dime']); const k = randInt(2, 10); return { prompt: `How many ${PLURAL[n]} make ${k * COIN[n]}¢?`, answer: String(k), explain: `${k * COIN[n]} ÷ ${COIN[n]} = ${k} ${PLURAL[n]}.` }; },
  () => { const k = randInt(1, 4); return { prompt: `${k} ${k === 1 ? 'quarter' : 'quarters'} = __¢`, answer: String(k * 25), explain: `${k} × 25 = ${k * 25}¢.` }; },
];

// ---------- Level 3: mixed coins to 100¢, equivalents ----------
const FIFTY = { 50: [['2 quarters', '5 dimes', '10 nickels', '1 quarter + 2 dimes + 1 nickel'], ['4 dimes + 1 nickel', '3 dimes', '1 quarter + 1 dime', '2 quarters + 1 nickel']],
  25: [['2 dimes + 1 nickel', '5 nickels', '1 dime + 3 nickels'], ['2 dimes', '3 dimes', '1 dime + 1 nickel', '1 quarter + 1 nickel']],
  100: [['4 quarters', '10 dimes', '2 quarters + 5 dimes', '1 loonie'], ['3 quarters + 2 dimes', '9 dimes + 1 nickel', '2 quarters + 4 dimes']] };
const randMix = (max) => { for (;;) { const c = { quarters: randInt(0, 3), dimes: randInt(0, 4), nickels: randInt(0, 3) }; const t = total(c); const n = c.quarters + c.dimes + c.nickels; if (t <= max && n >= 2) return c; } };
const L3 = [
  () => { const c = randMix(100); return { prompt: 'How many cents in all?', answer: String(total(c)), visual: coinsVisual(c), hint: 'Start with the biggest coins.', explain: `${countParts(c)}. Total ${total(c)}¢.` }; },
  () => { const c = randMix(100); return { prompt: `${describe(c)} = __¢`, answer: String(total(c)), explain: `${countParts(c)}. Total ${total(c)}¢.` }; },
  () => pick([{ prompt: 'How many nickels make a quarter?', answer: '5', explain: '5 × 5¢ = 25¢.' }, { prompt: 'How many dimes make a loonie?', answer: '10', explain: '10 × 10¢ = 100¢ = $1.' }, { prompt: 'How many quarters make a loonie?', answer: '4', explain: '4 × 25¢ = 100¢.' }, { prompt: 'How many nickels make a dime?', answer: '2', explain: '2 × 5¢ = 10¢.' }, { prompt: 'How many nickels make a loonie?', answer: '20', explain: '20 × 5¢ = 100¢.' }]),
  () => { const t = pick([25, 50, 100]); const [good, bad] = FIFTY[t]; const ans = pick(good); return { prompt: `Which group of coins makes ${t}¢?`, answer: ans, choices: mc(ans, shuffle(bad)), explain: `${ans} adds up to exactly ${t}¢.` }; },
  () => { const a = { quarters: randInt(1, 3) }, b = { dimes: randInt(2, 7) }; if (total(a) === total(b)) return L3[0](); const A = describe(a), B = describe(b); const ans = total(a) > total(b) ? A : B;
    return { prompt: `Which is worth more: ${A} or ${B}?`, answer: ans, choices: [A, B], wrongTags: { [ans === A ? B : A]: 'more-coins-means-more-money' }, explain: `${A} = ${total(a)}¢ and ${B} = ${total(b)}¢.` }; },
  () => { const c = randMix(95); const need = 100 - total(c); return { prompt: `You have ${describe(c)}. How many more cents to make $1?`, answer: String(need), explain: `${describe(c)} = ${total(c)}¢. 100 − ${total(c)} = ${need}¢.` }; },
];

// ---------- Level 4: to $2 with loonies/toonies; US pennies ----------
const randMix4 = () => { for (;;) { const c = { toonies: randInt(0, 1), loonies: randInt(0, 1), quarters: randInt(0, 3), dimes: randInt(0, 2), nickels: randInt(0, 1) }; const t = total(c); if (t <= 200 && t >= 100) return c; } };
const randUS = (max) => { for (;;) { const c = { quarters: randInt(0, 2), dimes: randInt(0, 2), nickels: randInt(0, 2), pennies: randInt(1, 4) }; const n = c.quarters + c.dimes + c.nickels + c.pennies; if (total(c) <= max && n >= 2) return c; } };
const L4 = [
  () => { const c = randMix4(); return { prompt: 'How many cents in all?', answer: String(total(c)), visual: coinsVisual(c), explain: `${countParts(c)}. Total ${total(c)}¢.` }; },
  () => { const c = randMix4(); return { prompt: `${describe(c)}. How much is that in dollars?`, answer: dollars(total(c)), visual: coinsVisual(c), hint: '100¢ = $1.00', explain: `${total(c)}¢ = ${money(total(c))}.` }; },
  () => { const c = { toonies: 1, quarters: randInt(1, 3), dimes: randInt(0, 2) }; const t = total(c); return { prompt: `A toonie + ${describe({ quarters: c.quarters, dimes: c.dimes })} = $__`, answer: dollars(t), choices: mc(dollars(t), [`${t / 100}¢`, dollars(t - 100), String(t)]), wrongTags: { [`${t / 100}¢`]: 'dollars-written-as-cents', [String(t)]: 'cents-for-dollars' }, explain: `200¢ + ${t - 200}¢ = ${t}¢ = ${money(t)}.` }; },
  () => { const c = randUS(100); return { prompt: 'US coins. How many cents in all?', answer: String(total(c)), visual: coinsVisual(c, true), explain: `${countParts(c)}. Total ${total(c)}¢.` }; },
  () => pick([{ prompt: 'How many loonies make a toonie?', answer: '2', explain: '2 × $1 = $2.' }, { prompt: 'How many quarters make a toonie?', answer: '8', explain: '8 × 25¢ = 200¢ = $2.' }, { prompt: 'How many dimes make a toonie?', answer: '20', explain: '20 × 10¢ = 200¢.' }]),
  () => { const t = randInt(101, 199); return Math.random() < 0.5 ? { prompt: `${money(t)} is the same as __ cents.`, answer: String(t), explain: `$1 = 100¢, so ${money(t)} = ${t}¢.` } : { prompt: `${t}¢ written in dollars is $__`, answer: dollars(t), explain: `${t}¢ = ${money(t)}.` }; },
];

// ---------- Level 5: dollar-and-cent notation to $50 ----------
const randBills = () => { for (;;) { const bills = { 20: randInt(0, 1), 10: randInt(0, 2), 5: randInt(0, 2) }; const c = { toonies: randInt(0, 2), loonies: randInt(0, 3), quarters: randInt(0, 3), dimes: randInt(0, 2), nickels: randInt(0, 1) }; const bc = bills[20] * 2000 + bills[10] * 1000 + bills[5] * 500; const t = bc + total(c); if (t <= 5000 && bc > 0 && total(c) > 0) return { bills, c, t, bc }; } };
const billText = (bills) => Object.entries(bills).filter(([, v]) => v > 0).map(([k, v]) => `${v} $${k} ${v === 1 ? 'bill' : 'bills'}`).join(' + ');
const L5 = [
  () => { const { bills, c, t, bc } = randBills(); return { prompt: `${billText(bills)} + ${describe(c)}. How much in dollars?`, answer: dollars(t), visual: coinsVisual(c), explain: `Bills: ${money(bc)}. Coins: ${money(total(c))}. Total ${money(t)}.` }; },
  () => { const d = randInt(2, 40), c = randInt(1, 9); const a = money(d * 100 + c * 10), b = money(d * 100 + c); const ans = a; return { prompt: `Which is more: ${a} or ${b}?`, answer: ans, choices: shuffle([a, b]), wrongTags: { [b]: 'cents-digit-confusion' }, explain: `${a} is ${d} dollars and ${c * 10} cents; ${b} is only ${d} dollars and ${c} cents.` }; },
  () => { const t = randInt(101, 4999); return Math.random() < 0.5 ? { prompt: `${money(t)} = __ cents`, answer: String(t), explain: `Multiply dollars by 100: ${money(t)} = ${t}¢.` } : { prompt: `${t} cents = $__`, answer: dollars(t), explain: `${t}¢ = ${money(t)}.` }; },
  () => { const d = randInt(2, 30), c = randInt(1, 9); const ans = money(d * 100 + c); return { prompt: `Which shows ${d} dollars and ${c} cents?`, answer: ans, choices: mc(ans, [money(d * 100 + c * 10), `$${d}.${c}`, money(d * 100 * 10 + c)]), wrongTags: { [money(d * 100 + c * 10)]: 'cents-digit-confusion', [`$${d}.${c}`]: 'single-cents-digit' }, explain: `Cents always use two digits: ${ans}.` }; },
  () => { const c = { toonies: randInt(1, 3), loonies: randInt(0, 2), quarters: randInt(0, 3), dimes: randInt(0, 3), nickels: randInt(0, 1) }; return { prompt: `${describe(c)}. Write the total in dollars.`, answer: dollars(total(c)), explain: `${countParts(c)}. Total ${total(c)}¢ = ${money(total(c))}.` }; },
  () => { const a = randInt(100, 4900), b = randInt(100, 4900); if (a === b) return L5[2](); const ans = money(Math.max(a, b)); return { prompt: `Which amount is larger: ${money(a)} or ${money(b)}?`, answer: ans, choices: shuffle([money(a), money(b)]), explain: `Compare the dollars first, then the cents: ${ans} is larger.` }; },
];

// ---------- Level 6: making change (prices in 5¢ steps) ----------
const CHANGE_SETS = { 35: ['1 quarter + 1 dime', ['3 dimes', '1 quarter + 1 nickel', '2 dimes + 1 nickel']], 15: ['1 dime + 1 nickel', ['3 nickels + 1 dime', '1 quarter', '2 dimes']], 45: ['1 quarter + 2 dimes', ['4 dimes', '1 quarter + 1 dime', '2 quarters']], 75: ['3 quarters', ['2 quarters + 1 dime', '7 dimes', '2 quarters + 2 nickels']], 60: ['2 quarters + 1 dime', ['2 quarters', '5 dimes + 1 nickel', '1 quarter + 2 dimes']] };
const L6 = [
  () => { const pay = pick([500, 1000, 2000]); const price = randInt(1, pay / 5 - 1) * 5; return { prompt: `You pay ${money(pay)} for an item that costs ${money(price)}. How much change, in dollars?`, answer: dollars(pay - price), hint: 'Count up from the price to what you paid.', explain: `${money(pay)} − ${money(price)} = ${money(pay - price)}.` }; },
  () => { const price = randInt(2, 19) * 5; return { prompt: `An item costs ${price}¢. You pay with a loonie. How many cents change?`, answer: String(100 - price), explain: `100 − ${price} = ${100 - price}¢.` }; },
  () => { const price = randInt(21, 99) * 5; const pay = price < 500 ? 500 : 1000; const ans = money(pay - price); return { prompt: `A toy costs ${money(price)}. You pay ${money(pay)}. How much change?`, answer: ans, choices: mc(ans, [money(price), money(pay - price + 100), money(pay + price)]), wrongTags: { [money(price)]: 'subtract-price-from-itself', [money(pay + price)]: 'added-instead-of-subtracted' }, explain: `Count up from ${money(price)} to ${money(pay)}: ${ans}.` }; },
  () => { const t = pick(Object.keys(CHANGE_SETS).map(Number)); const [good, bad] = CHANGE_SETS[t]; return { prompt: `Which coins make ${t}¢ in change?`, answer: good, choices: mc(good, bad), explain: `${good} adds up to ${t}¢.` }; },
  () => { const price = randInt(1, 39) * 5; const pay = 200; return { prompt: `You pay with a toonie for something that costs ${money(price)}. Change in dollars?`, answer: dollars(pay - price), explain: `$2.00 − ${money(price)} = ${money(pay - price)}.` }; },
  () => { const price = randInt(41, 199) * 5; const pay = 1000; const ch = pay - price; const toonies = Math.floor(ch / 200); return { prompt: `An item costs ${money(price)}. You pay $10. How many toonies can you get in your change?`, answer: String(toonies), explain: `Change is ${money(ch)}. That holds ${toonies} toonies (${money(toonies * 200)}) with ${money(ch - toonies * 200)} left.` }; },
];

// ---------- Level 7: add/subtract money, cash rounding ----------
const L7 = [
  () => { const a = randInt(100, 4999), b = randInt(100, 4999); return { prompt: `${money(a)} + ${money(b)} = $__`, answer: dollars(a + b), hint: 'Line up the decimal points.', explain: `${a}¢ + ${b}¢ = ${a + b}¢ = ${money(a + b)}.` }; },
  () => { const a = randInt(1000, 9999), b = randInt(100, a - 100); return { prompt: `${money(a)} − ${money(b)} = $__`, answer: dollars(a - b), explain: `${a}¢ − ${b}¢ = ${a - b}¢ = ${money(a - b)}.` }; },
  () => { const c = randInt(100, 4999); const r = round5(c); if (r === c) return L7[0](); return { prompt: `A cash total is ${money(c)}. Rounded to the nearest 5¢ it becomes $__`, answer: dollars(r), hint: 'Cash rounds to the nearest 5 cents: 1, 2 go down; 3, 4 go up to 5; 6, 7 go down to 5; 8, 9 go up.', explain: `${c % 10}¢ in the ones place rounds to ${r % 10 === 0 ? '0' : '5'}, so ${money(c)} becomes ${money(r)}.` }; },
  () => { const a = randInt(100, 1999), b = randInt(100, 1999), c = randInt(100, 1999); return { prompt: `Three items cost ${money(a)}, ${money(b)} and ${money(c)}. What is the total?`, answer: dollars(a + b + c), explain: `${money(a)} + ${money(b)} + ${money(c)} = ${money(a + b + c)}.` }; },
  () => { const a = randInt(1000, 4999), b = randInt(100, 999); const wrong = a + b * 10; return { prompt: `${money(a)} + ${money(b)} = ?`, answer: money(a + b), choices: mc(money(a + b), [money(wrong), money(a + b + 100), money(a - b)]), wrongTags: { [money(wrong)]: 'decimal-alignment' }, explain: `Line up the decimals: ${money(a)} + ${money(b)} = ${money(a + b)}.` }; },
  () => { const have = randInt(2000, 9999), spend = randInt(500, have - 100); return { prompt: `You have ${money(have)} and spend ${money(spend)}. How much is left?`, answer: dollars(have - spend), explain: `${money(have)} − ${money(spend)} = ${money(have - spend)}.` }; },
];

// ---------- Level 8: multiply/divide money, unit price, budgets ----------
const L8 = [
  () => { const n = randInt(2, 8), p = randInt(8, 100) * 25; return { prompt: `${n} tickets at ${money(p)} each. Total in dollars?`, answer: dollars(n * p), explain: `${n} × ${money(p)} = ${money(n * p)}.` }; },
  () => { const n = randInt(2, 8), each = pick([125, 150, 175, 200, 250, 325, 450, 75]); return { prompt: `${n} items cost ${money(n * each)} in total. How much is each, in dollars?`, answer: dollars(each), explain: `${money(n * each)} ÷ ${n} = ${money(each)}.` }; },
  () => { const n1 = randInt(2, 6), u1 = randInt(10, 40) * 5, n2 = randInt(2, 6), u2 = randInt(10, 40) * 5; if (u1 === u2) return L8[0](); const A = `${n1} for ${money(n1 * u1)}`, B = `${n2} for ${money(n2 * u2)}`; const ans = u1 < u2 ? A : B;
    return { prompt: `Which is the better deal per item: ${A} or ${B}?`, answer: ans, choices: [A, B], hint: 'Find the cost of one item in each deal.', explain: `${A} is ${money(u1)} each; ${B} is ${money(u2)} each. ${ans} is cheaper.` }; },
  () => { const budget = pick([2000, 5000, 10000]); const a = randInt(100, budget / 3), b = randInt(100, budget / 3); return { prompt: `Your budget is ${money(budget)}. You spend ${money(a)} and ${money(b)}. How much is left?`, answer: dollars(budget - a - b), explain: `${money(budget)} − ${money(a)} − ${money(b)} = ${money(budget - a - b)}.` }; },
  () => { const p = randInt(20, 80) * 25, b = pick([2000, 5000, 10000]); const n = Math.floor(b / p); return { prompt: `Books cost ${money(p)} each. How many can you buy with ${money(b)}?`, answer: String(n), explain: `${n} × ${money(p)} = ${money(n * p)}, and one more would be more than ${money(b)}.` }; },
  () => { const rate = pick([850, 1000, 1250, 1550, 1800]), h = randInt(3, 12); return { prompt: `You earn ${money(rate)} per hour. How much for ${h} hours, in dollars?`, answer: dollars(rate * h), explain: `${money(rate)} × ${h} = ${money(rate * h)}.` }; },
  () => { const n = randInt(3, 9), p = randInt(3, 40) * 25; const wrong = n * Math.round(p / 100) * 100; return { prompt: `${n} packs at ${money(p)} each. Total?`, answer: money(n * p), choices: mc(money(n * p), [money(wrong), money(n * p + p), money(n * p - 100)]), wrongTags: { [money(wrong)]: 'rounded-each-then-multiplied' }, explain: `Multiply the exact price: ${n} × ${money(p)} = ${money(n * p)}.` }; },
];

// ---------- Level 9: discounts, HST 13%, tips, US tax, US pennies ----------
const L9 = [
  () => { const price = randInt(2, 10) * 20, pct = pick([10, 20, 25, 50]); const off = price * pct / 100; return { prompt: `A $${price} item is ${pct}% off. What is the sale price in dollars?`, answer: String(price - off), choices: mc(price - off, [off, price + off, Math.abs(price - pct)]), wrongTags: { [off]: 'discount-not-sale-price', [Math.abs(price - pct)]: 'percent-as-dollars' }, explain: `${pct}% of $${price} is $${off}. $${price} − $${off} = $${price - off}.` }; },
  () => { const price = randInt(5, 60) * 2; return { prompt: `A $${price} item plus 13% HST. What is the total in dollars?`, answer: dollars(price * 113), hint: 'Total = price × 1.13.', explain: `13% of $${price} is ${money(price * 13)}. $${price} + ${money(price * 13)} = ${money(price * 113)}.` }; },
  () => { const price = randInt(2, 10) * 20, pct = pick([10, 20, 25, 50]); const sale = price - price * pct / 100; return { prompt: `A $${price} item is ${pct}% off, then 13% HST is added. Total in dollars?`, answer: dollars(sale * 113), explain: `Sale price $${sale}. Tax: ${money(sale * 13)}. Total ${money(sale * 113)}.` }; },
  () => { const bill = randInt(1, 8) * 20, pct = pick([10, 15, 20]); return { prompt: `A restaurant bill is $${bill}. What is a ${pct}% tip in dollars?`, answer: String(bill * pct / 100), explain: `${pct}% of $${bill} = $${bill * pct / 100}.` }; },
  () => { const price = randInt(1, 10) * 25, pct = pick([4, 6, 8]); return { prompt: `In the US, a $${price} item has ${pct}% sales tax. Total in dollars?`, answer: dollars(price * (100 + pct)), explain: `${pct}% of $${price} is ${money(price * pct)}. Total ${money(price * (100 + pct))}.` }; },
  () => { const c = { quarters: randInt(0, 3), dimes: randInt(0, 3), nickels: randInt(0, 2), pennies: randInt(1, 9) }; return { prompt: 'US coins (with pennies). How many cents in all?', answer: String(total(c)), visual: coinsVisual(c, true), explain: `${countParts(c)}. Total ${total(c)}¢.` }; },
  () => { const price = randInt(1, 20) * 5; return { prompt: `What is the 13% HST on a $${price} item, in dollars?`, answer: dollars(price * 13), explain: `$${price} × 0.13 = ${money(price * 13)}.` }; },
  () => { const price = randInt(2, 9) * 20, pct = pick([10, 20, 25]); const sale = price - price * pct / 100; return { prompt: `$${price} item, ${pct}% off the price, then 13% HST on the sale price. Total?`, answer: money(sale * 113), choices: mc(money(sale * 113), [money(price * 113 - price * pct), money(sale * 100), money(price * 113)]), wrongTags: { [money(price * 113 - price * pct)]: 'discount-after-tax-on-full', [money(sale * 100)]: 'forgot-tax' }, explain: `Sale price $${sale}, then × 1.13 = ${money(sale * 113)}.` }; },
];

// ---------- Level 10: simple interest, saving plans, exchange rates ----------
const L10 = [
  () => { const P = pick([200, 500, 1000, 1500, 2000]), r = pick([2, 3, 4, 5]), t = randInt(1, 3); const I = P * r * t / 100; return { prompt: `$${P} is saved at ${r}% simple interest per year for ${t} ${t === 1 ? 'year' : 'years'}. How much interest, in dollars?`, answer: String(I), hint: 'Interest = principal × rate × years.', explain: `${P} × ${r}% = $${P * r / 100} per year, × ${t} = $${I}.` }; },
  () => { const P = pick([200, 500, 1000, 2000]), r = pick([2, 4, 5]), t = randInt(2, 3); const I = P * r * t / 100; return { prompt: `$${P} at ${r}% simple interest for ${t} years. What is the total interest?`, answer: String(I), choices: mc(I, [P * r / 100, P + I, P * r]), wrongTags: { [P * r / 100]: 'interest-one-year-only', [P + I]: 'total-not-interest' }, explain: `$${P * r / 100} each year for ${t} years = $${I}.` }; },
  () => { const P = pick([200, 500, 1000]), r = pick([2, 3, 4, 5]), t = randInt(1, 3); const I = P * r * t / 100; return { prompt: `$${P} at ${r}% simple interest for ${t} years. How much is in the account at the end?`, answer: String(P + I), explain: `Interest is $${I}. ${P} + ${I} = $${P + I}.` }; },
  () => { const usd = pick([10, 20, 40, 50, 100]), rate = pick([125, 130, 135, 140]); return { prompt: `US$${usd} at a rate of ${(rate / 100).toFixed(2)} CAD per USD. How much in CAD?`, answer: dollars(usd * rate), explain: `${usd} × ${(rate / 100).toFixed(2)} = ${money(usd * rate)}.` }; },
  () => { const usd = pick([10, 20, 40, 50, 100, 200]), rate = pick([125, 130, 135, 140]); return { prompt: `CAD$${dollars(usd * rate)} at ${(rate / 100).toFixed(2)} CAD per USD. How much in USD?`, answer: String(usd), explain: `${dollars(usd * rate)} ÷ ${(rate / 100).toFixed(2)} = US$${usd}.` }; },
  () => { const week = pick([5, 10, 15, 20, 25]), weeks = randInt(6, 20); return { prompt: `You save $${week} a week. How many weeks to reach $${week * weeks}?`, answer: String(weeks), explain: `${week * weeks} ÷ ${week} = ${weeks} weeks.` }; },
  () => { const start = pick([20, 25, 50]), week = pick([5, 10, 15]), weeks = randInt(4, 12); return { prompt: `You start with $${start} and save $${week} every week. How much after ${weeks} weeks?`, answer: String(start + week * weeks), explain: `${start} + ${week} × ${weeks} = $${start + week * weeks}.` }; },
  () => { const goal = pick([300, 480, 600, 900]), weeks = pick([12, 20, 24, 30]); if (goal % weeks !== 0) return L10[5](); return { prompt: `You want $${goal} in ${weeks} weeks. How much must you save each week?`, answer: String(goal / weeks), explain: `${goal} ÷ ${weeks} = $${goal / weeks} per week.` }; },
];

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'money', name: 'Money', emoji: '💵', group: 'world',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return pick(LEVELS[lvl])();
  },
};
