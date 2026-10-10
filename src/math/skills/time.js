// Time: days and months, reading/setting clocks, elapsed time, rates. Ladder: docs/curriculum.md A12.
import { randInt, pick, shuffle } from '../rng.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (m) => String(m).padStart(2, '0');
const fmt = (h, m) => `${h}:${pad(m)}`;
const num = (x) => String(Math.round(x * 1000) / 1000);
function mc(answer, wrong, n = 4) {
  const out = [String(answer)];
  for (const w of wrong) { const s = String(w); if (!out.includes(s) && out.length < n) out.push(s); }
  return shuffle(out);
}
// 12-hour arithmetic. Returns [hour (1..12), minute].
function addMin(h, m, delta) {
  let t = ((h % 12) * 60 + m + delta) % 720; if (t < 0) t += 720;
  const hh = Math.floor(t / 60); return [hh === 0 ? 12 : hh, t % 60];
}
// Minutes from (h1:m1) forward to (h2:m2) on a 12-hour clock (assumes under 12 h).
function elapsed(h1, m1, h2, m2) { let d = ((h2 % 12) * 60 + m2) - ((h1 % 12) * 60 + m1); if (d <= 0) d += 720; return d; }
const h12 = (h24) => { const h = h24 % 12 === 0 ? 12 : h24 % 12; return `${h} ${h24 < 12 ? 'a.m.' : 'p.m.'}`; };
const hm = (mins) => { const h = Math.floor(mins / 60), m = mins % 60; return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`; };
const otherDays = (d) => shuffle(DAYS.filter((x) => x !== d)).slice(0, 3);
const otherMonths = (m) => shuffle(MONTHS.filter((x) => x !== m)).slice(0, 3);

const readClock = (h, m, withChoices) => {
  const q = { prompt: 'What time does the clock show?', answer: fmt(h, m), visual: { type: 'clock', hour: h, minute: m }, hint: 'The short hand shows the hour, the long hand shows the minutes.',
    explain: `The short hand is ${m === 0 ? 'on' : 'past'} ${h} and the long hand shows ${m} minutes: ${fmt(h, m)}.` };
  if (withChoices) {
    const prev = h === 1 ? 12 : h - 1, next = h === 12 ? 1 : h + 1;
    q.choices = mc(fmt(h, m), [fmt(prev, m), fmt(next, m), fmt(h, m === 0 ? 30 : 0)]);
    q.wrongTags = { [fmt(prev, m)]: 'hour-hand-read-low', [fmt(next, m)]: 'hour-hand-read-high' };
  }
  return q;
};
const setClock = (h, m) => ({ prompt: `Set the clock to ${fmt(h, m)}.`, answer: fmt(h, m), input: 'visual', visual: { type: 'clock', hour: h, minute: m, set: true },
  hint: 'Tap where the hour hand goes, then where the minute hand goes.', explain: `For ${fmt(h, m)} the short hand points ${m === 0 ? 'at' : 'just past'} ${h} and the long hand points at the ${m === 0 ? '12' : String(m / 5)}.` });

// ---------- Level 1: days, months, sequencing ----------
const L1 = [
  () => { const i = randInt(0, 6); const a = DAYS[(i + 1) % 7]; return { prompt: `What day comes after ${DAYS[i]}?`, answer: a, choices: mc(a, otherDays(a)), explain: `The days go ${DAYS[i]}, then ${a}.` }; },
  () => { const i = randInt(0, 6); const a = DAYS[(i + 6) % 7]; return { prompt: `What day comes before ${DAYS[i]}?`, answer: a, choices: mc(a, otherDays(a)), explain: `${a} comes right before ${DAYS[i]}.` }; },
  () => { const i = randInt(0, 11); const a = MONTHS[(i + 1) % 12]; return { prompt: `What month comes after ${MONTHS[i]}?`, answer: a, choices: mc(a, otherMonths(a)), explain: `After ${MONTHS[i]} comes ${a}.` }; },
  () => { const i = randInt(0, 6); const tomorrow = Math.random() < 0.5; const a = DAYS[(i + (tomorrow ? 1 : 6)) % 7];
    return { prompt: `Today is ${DAYS[i]}. What day ${tomorrow ? 'is tomorrow' : 'was yesterday'}?`, answer: a, choices: mc(a, otherDays(a)), explain: `${tomorrow ? 'Tomorrow is the day after' : 'Yesterday was the day before'} ${DAYS[i]}: ${a}.` }; },
  () => { const parts = ['morning', 'afternoon', 'evening', 'night']; const first = Math.random() < 0.5;
    return { prompt: `Which part of the day comes ${first ? 'first' : 'last'}?`, answer: first ? 'morning' : 'night', choices: shuffle(parts), explain: 'A day goes morning, afternoon, evening, then night.' }; },
  () => pick([{ prompt: 'How many days are in a week?', answer: '7', explain: 'A week has 7 days.' }, { prompt: 'How many months are in a year?', answer: '12', explain: 'A year has 12 months.' }, { prompt: 'What is the first month of the year?', answer: 'January', choices: mc('January', ['December', 'March', 'Monday']), explain: 'The year starts with January.' }]),
];

// ---------- Level 2: time to the hour ----------
const L2 = [
  () => readClock(randInt(1, 12), 0, false),
  () => readClock(randInt(1, 12), 0, true),
  () => setClock(randInt(1, 12), 0),
  () => { const h = randInt(1, 12); return { prompt: `The short hand points to ${h} and the long hand points to 12. What time is it?`, answer: fmt(h, 0), explain: `Long hand on 12 means o'clock, so it is ${h}:00.` }; },
  () => ({ prompt: 'On a clock, which hand shows the hour?', answer: 'the short hand', choices: ['the short hand', 'the long hand'], wrongTags: { 'the long hand': 'long-hand-as-hour' }, explain: 'The short hand shows the hour; the long hand shows the minutes.' }),
  () => { const h = randInt(1, 12); return { prompt: `It is ${h} o'clock. Write the time as it looks on a digital clock.`, answer: fmt(h, 0), explain: `${h} o'clock is written ${h}:00.` }; },
];

// ---------- Level 3: half hours, calendar ----------
const L3 = [
  () => readClock(randInt(1, 12), pick([0, 30]), false),
  () => readClock(randInt(1, 12), 30, true),
  () => setClock(randInt(1, 12), 30),
  () => { const h = randInt(1, 12); return { prompt: `Half past ${h} is what time?`, answer: fmt(h, 30), explain: `Half past ${h} means 30 minutes after ${h}:00, so ${h}:30.` }; },
  () => { const i = randInt(0, 6), d = randInt(1, 20); return { prompt: `${DAYS[i]} is the ${d}th. What day of the week is the ${d + 7}th?`, answer: DAYS[i], choices: mc(DAYS[i], otherDays(DAYS[i])), explain: `7 days later is the same day of the week: ${DAYS[i]}.` }; },
  () => { const i = randInt(0, 6), n = randInt(2, 5); const a = DAYS[(i + n) % 7]; return { prompt: `What day is ${n} days after ${DAYS[i]}?`, answer: a, choices: mc(a, otherDays(a)), explain: `Count ${n} days on from ${DAYS[i]}: ${a}.` }; },
  () => pick([{ prompt: 'How many minutes are in half an hour?', answer: '30', explain: 'An hour is 60 minutes, so half an hour is 30 minutes.' }, { prompt: 'How many days are in two weeks?', answer: '14', explain: '2 × 7 = 14 days.' }, { prompt: 'How many days does a week have?', answer: '7', explain: 'Sunday to Saturday is 7 days.' }]),
  () => { const h = randInt(1, 12); const next = h === 12 ? 1 : h + 1; return { prompt: `The short hand is halfway between ${h} and ${next}, and the long hand points to 6. What time is it?`, answer: fmt(h, 30), choices: mc(fmt(h, 30), [fmt(next, 30), fmt(h, 6), fmt(next, 0)]), wrongTags: { [fmt(next, 30)]: 'hour-hand-read-high', [fmt(h, 6)]: 'ticks-not-times-5' }, explain: `The hour hand has not reached ${next} yet, so the hour is ${h}. Long hand on 6 is 30 minutes: ${fmt(h, 30)}.` }; },
];

// ---------- Level 4: quarter hours, 5-minute intervals, a.m./p.m. ----------
const AMPM = [['eat breakfast', '7:30', 'a.m.'], ['go to bed', '8:00', 'p.m.'], ['eat lunch', '12:15', 'p.m.'], ['start school', '8:45', 'a.m.'], ['eat dinner', '6:00', 'p.m.'], ['watch the sunrise', '6:30', 'a.m.'], ['see the stars come out', '9:30', 'p.m.']];
const L4 = [
  () => readClock(randInt(1, 12), randInt(0, 11) * 5, false),
  () => readClock(randInt(1, 12), pick([15, 45]), true),
  () => setClock(randInt(1, 12), randInt(0, 11) * 5),
  () => { const h = randInt(1, 12); return { prompt: `Quarter past ${h} is what time?`, answer: fmt(h, 15), choices: mc(fmt(h, 15), [fmt(h, 25), fmt(h, 45), fmt(h, 4)]), wrongTags: { [fmt(h, 25)]: 'quarter-is-25-minutes', [fmt(h, 45)]: 'quarter-past-vs-to' }, explain: `A quarter of an hour is 15 minutes, so quarter past ${h} is ${fmt(h, 15)}.` }; },
  () => { const h = randInt(1, 12); const prev = h === 1 ? 12 : h - 1; return { prompt: `Quarter to ${h} is what time?`, answer: fmt(prev, 45), choices: mc(fmt(prev, 45), [fmt(h, 45), fmt(h, 15), fmt(prev, 35)]), wrongTags: { [fmt(h, 45)]: 'quarter-to-wrong-hour', [fmt(prev, 35)]: 'quarter-is-25-minutes' }, explain: `Quarter to ${h} is 15 minutes before ${h}:00, which is ${fmt(prev, 45)}.` }; },
  () => { const [act, t, ap] = pick(AMPM); return { prompt: `You ${act} at ${t}. Is that a.m. or p.m.?`, answer: ap, choices: ['a.m.', 'p.m.'], explain: `a.m. is from midnight to noon, p.m. is noon to midnight. You ${act} in the ${ap === 'a.m.' ? 'morning' : 'afternoon or evening'}.` }; },
  () => { const k = randInt(1, 11); return { prompt: `The long hand points to the ${k}. How many minutes past the hour is it?`, answer: String(k * 5), choices: mc(k * 5, [k, k * 5 + 5, k * 10]), wrongTags: { [k]: 'ticks-not-times-5' }, explain: `Each number is 5 minutes: ${k} × 5 = ${k * 5} minutes.` }; },
];

// ---------- Level 5: to the minute, elapsed within the hour ----------
const L5 = [
  () => readClock(randInt(1, 12), randInt(1, 59), false),
  () => readClock(randInt(1, 12), randInt(1, 59), false),
  () => setClock(randInt(1, 12), randInt(0, 11) * 5),
  () => { const h = randInt(1, 12), m1 = randInt(0, 40), m2 = randInt(m1 + 5, 59); return { prompt: `From ${fmt(h, m1)} to ${fmt(h, m2)} is how many minutes?`, answer: String(m2 - m1), explain: `${m2} − ${m1} = ${m2 - m1} minutes.` }; },
  () => pick([{ prompt: 'How many minutes are in an hour?', answer: '60', explain: 'One hour is 60 minutes.' }, { prompt: 'How many hours are in a day?', answer: '24', explain: 'One day is 24 hours.' }, { prompt: 'How many seconds are in a minute?', answer: '60', explain: 'One minute is 60 seconds.' }, { prompt: 'How many minutes are in 3 hours?', answer: '180', explain: '3 × 60 = 180 minutes.' }, { prompt: 'How many minutes are in a quarter of an hour?', answer: '15', explain: '60 ÷ 4 = 15 minutes.' }]),
  () => { const h = randInt(1, 12), k = randInt(1, 11); const next = h === 12 ? 1 : h + 1; return { prompt: `The long hand points to the ${k} and the short hand is between ${h} and ${next}. What time is it?`, answer: fmt(h, k * 5), explain: `Hour ${h} (not yet ${next}), minutes ${k} × 5 = ${k * 5}: ${fmt(h, k * 5)}.` }; },
  () => { const h = randInt(1, 12), m = randInt(1, 59), d = randInt(5, 59 - m > 5 ? 59 - m : 5); const [h2, m2] = addMin(h, m, d); return { prompt: `It is ${fmt(h, m)}. What time will it be in ${d} minutes?`, answer: fmt(h2, m2), explain: `${fmt(h, m)} + ${d} min = ${fmt(h2, m2)}.` }; },
];

// ---------- Level 6: elapsed across hours, 24-hour clock ----------
const L6 = [
  () => { const h1 = randInt(1, 12), m1 = randInt(0, 11) * 5, d = randInt(65, 300); const [h2, m2] = addMin(h1, m1, d);
    const toNext = (60 - m1) % 60; return { prompt: `A train leaves at ${fmt(h1, m1)} and arrives at ${fmt(h2, m2)}. How many minutes is the trip?`, answer: String(d), hint: 'Jump to the next hour, then count hours, then minutes.',
      explain: `${fmt(h1, m1)} to the next hour is ${toNext} min, then on to ${fmt(h2, m2)}: total ${d} min (${hm(d)}).` }; },
  () => { const h1 = randInt(1, 12), m1 = randInt(0, 11) * 5, d = pick([45, 60, 75, 90, 105, 120, 135, 150]); const [h2, m2] = addMin(h1, m1, d);
    return { prompt: `A movie starts at ${fmt(h1, m1)} and lasts ${hm(d)}. What time does it end?`, answer: fmt(h2, m2), explain: `${fmt(h1, m1)} + ${hm(d)} = ${fmt(h2, m2)}.` }; },
  () => { const h2 = randInt(1, 12), m2 = randInt(0, 11) * 5, d = pick([40, 50, 70, 80, 90, 110]); const [h1, m1] = addMin(h2, m2, -d);
    return { prompt: `A game ends at ${fmt(h2, m2)} after lasting ${hm(d)}. What time did it start?`, answer: fmt(h1, m1), explain: `Count back ${hm(d)} from ${fmt(h2, m2)}: ${fmt(h1, m1)}.` }; },
  () => { const h24 = randInt(13, 23), m = randInt(0, 11) * 5; const ans = `${h24 - 12}:${pad(m)} p.m.`; return { prompt: `${h24}:${pad(m)} on a 24-hour clock is what time?`, answer: ans, choices: mc(ans, [`${h24 - 10}:${pad(m)} p.m.`, `${h24 - 12}:${pad(m)} a.m.`, `${Math.max(1, h24 - 13)}:${pad(m)} p.m.`]), wrongTags: { [`${h24 - 10}:${pad(m)} p.m.`]: 'subtracted-10-not-12', [`${h24 - 12}:${pad(m)} a.m.`]: 'am-pm-swapped' }, explain: `Subtract 12 from the hour: ${h24} − 12 = ${h24 - 12}, so ${ans}.` }; },
  () => { const h = randInt(1, 11); return { prompt: `${h} p.m. in 24-hour time is __:00`, answer: `${h + 12}:00`, explain: `Add 12 to the hour for p.m.: ${h} + 12 = ${h + 12}, so ${h + 12}:00.` }; },
  () => { const h1 = randInt(1, 11), m1 = randInt(0, 11) * 5, d = randInt(70, 240); const [h2, m2] = addMin(h1, m1, d);
    return { prompt: `From ${fmt(h1, m1)} to ${fmt(h2, m2)}, how long is that in minutes?`, answer: String(d), choices: mc(d, [Math.abs((h2 - h1) * 100 + (m2 - m1)), d - 60, d + 60]), wrongTags: { [Math.abs((h2 - h1) * 100 + (m2 - m1))]: 'subtracted-times-as-decimals' }, explain: `Jump to the hour, then count: ${hm(d)} = ${d} minutes.` }; },
];

// ---------- Level 7: across days, timetables, seconds ----------
const L7 = [
  () => { const bedM = pick([0, 30]), bedH = randInt(8, 10), wakeH = randInt(6, 7), wakeM = pick([0, 15, 30, 45]); const d = (24 * 60 - (bedH + 12) * 60 - bedM) + wakeH * 60 + wakeM;
    return { prompt: `Bed at ${fmt(bedH, bedM)} p.m., wake at ${fmt(wakeH, wakeM)} a.m. How many minutes of sleep?`, answer: String(d), hint: 'Count to midnight first, then from midnight.', explain: `${fmt(bedH, bedM)} to midnight is ${hm(12 * 60 - bedH * 60 - bedM)}, plus ${hm(wakeH * 60 + wakeM)} after midnight: ${d} min.` }; },
  () => { const h = randInt(7, 11), m1 = randInt(0, 59), d = randInt(20, 55); const [h2, m2] = addMin(h, m1, d);
    return { prompt: `A bus leaves at ${fmt(h, m1)} and arrives at ${fmt(h2, m2)}. How many minutes is the ride?`, answer: String(d), explain: `From ${fmt(h, m1)} to ${fmt(h2, m2)} is ${d} minutes.` }; },
  () => { const hrs = pick([1.5, 2.5, 3.5, 0.5, 4.5]); const ans = hrs * 60; const wrong = Math.floor(hrs) * 100 + 50;
    return { prompt: `${num(hrs)} h = __ min`, answer: String(ans), choices: mc(ans, [wrong, ans - 30, ans + 30]), wrongTags: { [wrong]: 'half-hour-is-50' }, explain: `${Math.floor(hrs)} h = ${Math.floor(hrs) * 60} min and 0.5 h = 30 min, so ${ans} min.` }; },
  () => pick([() => { const m = randInt(2, 9); return { prompt: `${m} min = __ s`, answer: String(m * 60), explain: `${m} × 60 = ${m * 60} seconds.` }; },
    () => { const m = randInt(2, 9); return { prompt: `${m * 60} s = __ min`, answer: String(m), explain: `${m * 60} ÷ 60 = ${m} minutes.` }; },
    () => { const m = randInt(1, 4); return { prompt: `${m}.5 min = __ s`, answer: String(m * 60 + 30), explain: `${m} min = ${m * 60} s, plus half a minute (30 s) = ${m * 60 + 30} s.` }; }])(),
  () => { const h = randInt(8, 10), a = randInt(0, 5) * 5, d1 = pick([40, 45, 50, 55]), d2 = pick([30, 35, 40, 45, 50]); const [h2, m2] = addMin(h, a, d1); const [h3, m3] = addMin(h2, m2, d2);
    return { prompt: `Timetable: Math ${fmt(h, a)} to ${fmt(h2, m2)}, Reading ${fmt(h2, m2)} to ${fmt(h3, m3)}. How many minutes is Reading?`, answer: String(d2), explain: `Reading runs ${fmt(h2, m2)} to ${fmt(h3, m3)}: ${d2} minutes.` }; },
  () => { const start = randInt(1, 5), days = randInt(2, 6); return { prompt: `A trip starts on ${DAYS[start]} and lasts ${days} days. On what day does it end?`, answer: DAYS[(start + days) % 7], choices: mc(DAYS[(start + days) % 7], otherDays(DAYS[(start + days) % 7])), explain: `Count ${days} days on from ${DAYS[start]}: ${DAYS[(start + days) % 7]}.` }; },
  () => { const h = randInt(1, 6), m = randInt(1, 11) * 5; return { prompt: `${h} h ${m} min = __ min`, answer: String(h * 60 + m), explain: `${h} × 60 + ${m} = ${h * 60 + m} minutes.` }; },
];

// ---------- Level 8: time zones, unit conversion, fractions of an hour ----------
const ZONES = [['Vancouver', -3, '3 hours behind'], ['Calgary', -2, '2 hours behind'], ['Winnipeg', -1, '1 hour behind'], ['Halifax', 1, '1 hour ahead']];
const FRACS = [[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [1, 5], [1, 6], [5, 6], [1, 10], [1, 12]];
const L8 = [
  () => { const [city, off, desc] = pick(ZONES); const h = randInt(8, 20); const ans = h12(h + off); const wrong = h12(h - off);
    return { prompt: `It is ${h12(h)} in Toronto. What time is it in ${city} (${desc})?`, answer: ans, choices: mc(ans, [wrong, h12(h), h12(h + off + 12)]), wrongTags: { [wrong]: 'time-zone-wrong-direction', [h12(h + off + 12)]: 'am-pm-swapped' }, explain: `${desc} means ${off > 0 ? 'add' : 'subtract'} ${Math.abs(off)}: ${ans}.` }; },
  () => pick([() => { const w = randInt(2, 8); return { prompt: `${w} weeks = __ days`, answer: String(w * 7), explain: `${w} × 7 = ${w * 7} days.` }; },
    () => { const d = randInt(2, 7); return { prompt: `${d} days = __ hours`, answer: String(d * 24), explain: `${d} × 24 = ${d * 24} hours.` }; },
    () => { const h = randInt(2, 9); return { prompt: `${h} hours = __ minutes`, answer: String(h * 60), explain: `${h} × 60 = ${h * 60} minutes.` }; },
    () => { const d = randInt(2, 6); return { prompt: `${d * 24} hours = __ days`, answer: String(d), explain: `${d * 24} ÷ 24 = ${d} days.` }; },
    () => { const w = randInt(3, 9); return { prompt: `${w * 7} days = __ weeks`, answer: String(w), explain: `${w * 7} ÷ 7 = ${w} weeks.` }; }])(),
  () => { const [n, d] = pick(FRACS); const ans = 60 * n / d; const wrong = d === 3 ? n * 33 : ans + 10;
    return { prompt: `${n}/${d} of an hour = __ min`, answer: String(ans), choices: mc(ans, [wrong, ans - 5, n * 10 + d]), wrongTags: { [wrong]: d === 3 ? 'third-of-hour-is-33' : 'fraction-of-hour-guess' }, explain: `60 ÷ ${d} = ${60 / d}, times ${n} = ${ans} minutes.` }; },
  () => { const [n, d] = pick([[1, 2], [1, 4], [3, 4], [1, 3], [1, 6], [1, 8]]); return { prompt: `${n}/${d} of a day = __ hours`, answer: String(24 * n / d), explain: `24 ÷ ${d} = ${24 / d}, times ${n} = ${24 * n / d} hours.` }; },
  () => { const m = pick([15, 20, 30, 45, 90, 150, 75]); const ans = num(m / 60); return { prompt: `${m} minutes = __ hours (as a decimal)`, answer: ans, explain: `${m} ÷ 60 = ${ans} hours.` }; },
  () => { const [city, off, desc] = pick(ZONES); const h = randInt(8, 20); const local = h12(h); return { prompt: `It is ${h12(h + off)} in ${city}, which is ${desc} Toronto. What time is it in Toronto?`, answer: local, choices: mc(local, [h12(h + 2 * off), h12(h + off), h12(h + 12)]), explain: `Go the other way: ${off > 0 ? 'subtract' : 'add'} ${Math.abs(off)} to get ${local}.` }; },
];

// ---------- Level 9: speed, pace, average speed ----------
const L9 = [
  () => { const t = pick([1.5, 2, 2.5, 3, 4, 0.5]), s = pick([40, 50, 60, 80, 100]); return { prompt: `A car travels ${num(s * t)} km in ${num(t)} h. What is its speed in km/h?`, answer: String(s), hint: 'Speed = distance ÷ time. 1.5 h is one and a half hours, not 1 h 50 min.', explain: `${num(s * t)} ÷ ${num(t)} = ${s} km/h.` }; },
  () => { const t = pick([1.5, 2, 2.5, 3, 0.5, 0.25]), s = pick([40, 60, 80, 100, 120]); return { prompt: `A train goes ${s} km/h for ${num(t)} h. How far does it go, in km?`, answer: num(s * t), explain: `${s} × ${num(t)} = ${num(s * t)} km.` }; },
  () => { const t = pick([1.5, 2, 2.5, 3, 4]), s = pick([40, 60, 80]); return { prompt: `How many hours to go ${num(s * t)} km at ${s} km/h?`, answer: num(t), explain: `${num(s * t)} ÷ ${s} = ${num(t)} h.` }; },
  () => { const km = randInt(2, 10), pace = randInt(4, 8); return { prompt: `Maya ran ${km} km in ${km * pace} minutes. What was her pace in minutes per km?`, answer: String(pace), explain: `${km * pace} ÷ ${km} = ${pace} min per km.` }; },
  () => { const km = randInt(3, 12), pace = randInt(4, 8); return { prompt: `At a pace of ${pace} min per km, how many minutes does ${km} km take?`, answer: String(km * pace), explain: `${pace} × ${km} = ${km * pace} minutes.` }; },
  () => { const t1 = randInt(1, 3), t2 = randInt(1, 3), avg = pick([40, 50, 60, 70]); const d1 = avg * t1 + pick([-10, 10]) * t1, d2 = avg * (t1 + t2) - d1;
    return { prompt: `A car goes ${d1} km in ${t1} h, then ${d2} km in ${t2} h. Average speed for the whole trip in km/h?`, answer: String(avg), hint: 'Total distance ÷ total time.', explain: `Total ${d1 + d2} km in ${t1 + t2} h: ${d1 + d2} ÷ ${t1 + t2} = ${avg} km/h.` }; },
  () => { const s = pick([60, 90, 120]), m = pick([20, 30, 40, 45]); return { prompt: `A bus travels at ${s} km/h. How far does it go in ${m} minutes?`, answer: num(s * m / 60), explain: `${m} min = ${num(m / 60)} h, and ${s} × ${num(m / 60)} = ${num(s * m / 60)} km.` }; },
];

// ---------- Level 10: multi-step scheduling, leap years, mixed units ----------
const DUR = [25, 30, 35, 40, 45, 50, 75, 80, 90, 100];
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const L10 = [
  () => { const h = randInt(8, 11), m = randInt(0, 11) * 5; const ds = [pick(DUR), pick(DUR), pick(DUR)]; const total = ds[0] + ds[1] + ds[2]; const [h2, m2] = addMin(h, m, total);
    return { prompt: `Starting at ${fmt(h, m)}, you do 3 tasks: ${hm(ds[0])}, ${hm(ds[1])}, ${hm(ds[2])}. When do you finish?`, answer: fmt(h2, m2), hint: 'Add the three durations first.', explain: `Total time is ${total} min (${hm(total)}). ${fmt(h, m)} + ${hm(total)} = ${fmt(h2, m2)}.` }; },
  () => { const y = pick([1900, 2000, 2024, 2023, 2100, 1996, 2012, 2030, 2026, 1998, 2040]); const ans = isLeap(y) ? 'Yes' : 'No';
    return { prompt: `Is ${y} a leap year?`, answer: ans, choices: ['Yes', 'No'], hint: 'Divisible by 4, except century years must be divisible by 400.', explain: isLeap(y) ? `${y} is divisible by 4${y % 100 === 0 ? ' and by 400' : ''}, so it is a leap year.` : `${y} ${y % 4 === 0 ? 'is a century year not divisible by 400' : 'is not divisible by 4'}, so it is not a leap year.` }; },
  () => { const y = pick([2024, 2025, 2026, 2028, 2000, 2100]); return { prompt: `How many days are in the year ${y}?`, answer: isLeap(y) ? '366' : '365', explain: isLeap(y) ? `${y} is a leap year, so February has 29 days: 366 days.` : `${y} is not a leap year: 365 days.` }; },
  () => { const h = randInt(1, 3), m = randInt(1, 11) * 5, dec = pick([0.5, 1.5, 2.5, 0.25, 0.75]); const ans = h * 60 + m + dec * 60;
    return { prompt: `${h} h ${m} min + ${num(dec)} h = __ min`, answer: String(ans), explain: `${h * 60 + m} min + ${dec * 60} min = ${ans} min.` }; },
  () => { const h1 = randInt(21, 23), m1 = randInt(0, 11) * 5; const toMid = 1440 - (h1 * 60 + m1); const d = toMid + randInt(3, 36) * 5; const end = (h1 * 60 + m1 + d) % 1440;
    return { prompt: `A flight leaves at ${h1}:${pad(m1)} and lands at ${Math.floor(end / 60)}:${pad(end % 60)} the next morning (24-hour time). How many minutes is the flight?`, answer: String(d), explain: `To midnight: ${1440 - h1 * 60 - m1} min, then ${end} min more: ${d} minutes.` }; },
  () => { const [n1, d1] = pick([[3, 4], [1, 2], [2, 3], [1, 4]]), [n2, d2] = pick([[1, 3], [1, 6], [5, 6], [1, 2]]); const ans = 60 * n1 / d1 + 60 * n2 / d2;
    return { prompt: `${n1}/${d1} h + ${n2}/${d2} h = __ min`, answer: String(ans), explain: `${60 * n1 / d1} min + ${60 * n2 / d2} min = ${ans} min.` }; },
  () => { const budget = pick([120, 150, 180]); const ds = [pick(DUR), pick(DUR), pick(DUR)]; const total = ds[0] + ds[1] + ds[2]; const over = total - budget;
    return { prompt: `You have ${hm(budget)}. Tasks take ${hm(ds[0])}, ${hm(ds[1])} and ${hm(ds[2])}. How many minutes ${over >= 0 ? 'over' : 'under'} are you?`, answer: String(Math.abs(over)), explain: `Tasks total ${total} min. ${total} − ${budget} = ${over}, so ${Math.abs(over)} min ${over >= 0 ? 'over' : 'under'}.` }; },
  () => { const h = randInt(1, 12), m = randInt(0, 11) * 5, ds = [randInt(2, 6) * 15, randInt(2, 6) * 15]; const [h2, m2] = addMin(h, m, ds[0] + ds[1]);
    return { prompt: `Two shows run back to back from ${fmt(h, m)}: ${hm(ds[0])} then ${hm(ds[1])}. What time do they end?`, answer: fmt(h2, m2), choices: mc(fmt(h2, m2), [fmt(...addMin(h, m, ds[0] + ds[1] + 40)), fmt(...addMin(h, m, ds[0])), fmt(...addMin(h, m, ds[0] + ds[1] - 60))]), wrongTags: { [fmt(...addMin(h, m, ds[0] + ds[1] + 40))]: 'carried-100-not-60' }, explain: `${ds[0]} + ${ds[1]} = ${ds[0] + ds[1]} min. ${fmt(h, m)} + ${hm(ds[0] + ds[1])} = ${fmt(h2, m2)}.` }; },
];

const LEVELS = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5, 6: L6, 7: L7, 8: L8, 9: L9, 10: L10 };

export default {
  id: 'time', name: 'Time', emoji: '⏰', group: 'world',
  start: { 1: 1, 3: 3, 4: 4 },
  unlock: undefined,
  gen(level) {
    const lvl = Math.min(10, Math.max(1, level));
    return pick(LEVELS[lvl])();
  },
};
