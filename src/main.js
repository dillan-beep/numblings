import { load, save, KIDS, todayKey, logEvent, defaultState, newProfile } from './state.js';
import { SKILLS, SKILL_IDS, MAX_LEVEL, isCorrect } from './math/skills.js';
import { nextQuestion, recordResult, isUnlocked } from './math/engine.js';
import { ROUND_SIZE, coinsForAnswer, roundTokens, petLevelFromXp, xpForLevel } from './economy.js';
import { SPECIES, ITEMS, CATEGORIES, CONSUMABLE, EQUIP_SLOTS, itemById, newPet, tickPet, applyEffect, mood, stageIndex } from './pets.js';

const state = load();
let view = { screen: 'profiles' };
let activeId = null;
let quiz = null;
let shopTab = 'food';
let parentUnlocked = false;

const $app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const profile = () => state.profiles[activeId];
const commit = () => save(state);

function go(screen, extra = {}) { view = { screen, ...extra }; render(); }

function toast(msg, ms = 1800) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
}

function floatText(text, x, y, color = 'var(--coin)') {
  const el = document.createElement('div');
  el.className = 'float'; el.textContent = text; el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
}

function confetti(n = 40) {
  const emojis = ['🎉', '⭐', '✨', '🪙', '💎', '🎈'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti'; el.textContent = emojis[i % emojis.length];
    el.style.left = `${Math.random() * 100}vw`; el.style.animationDuration = `${1.5 + Math.random() * 2}s`; el.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 4000);
  }
}

/* ---------------- Screens ---------------- */

function renderProfiles() {
  return `
    <div class="center" style="padding-top:40px">
      <h1>🐾 Pet Math</h1>
      <p class="muted">Who's playing today?</p>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:24px">
      ${KIDS.map((k) => {
        const p = state.profiles[k.id];
        const petEmoji = p.pet ? SPECIES[p.pet.species].stages[stageIndex(petLevelFromXp(p.pet.xp))] : '🥚';
        return `<div class="panel kid-card" data-action="pick" data-id="${k.id}" style="border-color:${k.color}">
          <div class="avatar">${petEmoji}</div>
          <h2>${esc(k.name)}</h2>
          <div class="muted">Grade ${k.grade} · ${p.pet ? esc(p.pet.name) : 'No pet yet'}</div>
          <div class="row" style="justify-content:center;margin-top:10px"><span class="pill coin">🪙 ${p.coins}</span><span class="pill token">🎟️ ${p.tokens}</span></div>
        </div>`;
      }).join('')}
    </div>
    <div class="center" style="margin-top:30px"><button class="ghost" data-action="parent">🔒 Parent Mode</button></div>`;
}

function renderNewPet() {
  const p = profile();
  return `
    <div class="topbar"><h1>Hi ${esc(p.name)}! Pick your pet</h1><button class="ghost" data-action="home-profiles">← Back</button></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
      ${Object.entries(SPECIES).map(([id, s]) => `
        <div class="panel item ${view.species === id ? 'equipped' : ''}" data-action="species" data-id="${id}" style="cursor:pointer">
          <div class="emoji">${s.stages[0]}</div><div class="name">${s.name}</div>
          <div class="muted" style="font-size:0.8rem">${s.stages.join(' → ')}</div>
        </div>`).join('')}
    </div>
    <div class="panel" style="margin-top:16px;max-width:460px">
      <label>Name your pet</label>
      <input id="petname" maxlength="16" placeholder="e.g. Sparky" value="${esc(view.name || '')}" />
      <button class="primary" style="margin-top:14px;width:100%" data-action="create-pet" ${view.species ? '' : 'disabled'}>Hatch my pet! 🎉</button>
    </div>`;
}

function petStage(p, speech) {
  const pet = p.pet; const lvl = petLevelFromXp(pet.xp); const sp = SPECIES[pet.species]; const m = mood(pet);
  const eq = pet.equipped; const bg = eq.bg ? itemById(eq.bg) : null;
  const acc = (slot, cls) => (eq[slot] ? `<div class="acc ${cls}">${itemById(eq[slot]).emoji}</div>` : '');
  return `
    <div class="stage" style="${bg ? `background:${bg.css}` : ''}">
      <div class="ground"></div>
      <div class="pet-name">${esc(pet.name)} · Lv ${lvl} ${sp.stageNames[stageIndex(lvl)]}</div>
      <div class="pet-mood">${m.emoji} ${m.label}${m.bonus > 1 ? ` · ×${m.bonus} coins` : ''}</div>
      ${speech ? `<div class="speech">${esc(speech)}</div>` : ''}
      <div class="pet-wrap">
        ${acc('wings', 'wings')}
        <div class="pet ${m.label === 'Sad' || m.label === 'Starving' ? 'sad' : ''}">${sp.stages[stageIndex(lvl)]}</div>
        ${acc('hat', 'hat')}${acc('weapon', 'weapon')}${acc('buddy', 'buddy')}
      </div>
    </div>`;
}

function bar(label, emoji, v, color) {
  return `<div class="bar"><div class="row spread"><span>${emoji} ${label}</span><span class="muted">${Math.round(v)}%</span></div><div class="track"><div class="fill" style="width:${v}%;background:${color}"></div></div></div>`;
}

function renderHome() {
  const p = profile(); tickPet(p.pet); commit();
  const pet = p.pet; const lvl = petLevelFromXp(pet.xp); const cur = pet.xp - xpForLevel(lvl); const need = xpForLevel(lvl + 1) - xpForLevel(lvl);
  const nextEvolve = lvl < 5 ? 5 : lvl < 12 ? 12 : null;
  const hints = [];
  if (pet.hunger < 40) hints.push(`${pet.name} is hungry! Visit the shop for food.`);
  else if (pet.happiness < 40) hints.push(`${pet.name} wants to play!`);
  else if (pet.energy < 30) hints.push(`${pet.name} is sleepy. A nap would help.`);
  else hints.push(`Let's do some math, ${p.name}!`);
  return `
    <div class="topbar">
      <div class="row"><button class="ghost" data-action="home-profiles">← Switch</button><h2>${esc(p.name)}</h2></div>
      <div class="row"><span class="pill coin">🪙 ${p.coins}</span><span class="pill token">🎟️ ${p.tokens} tokens</span></div>
    </div>
    ${petStage(p, view.speech || hints[0])}
    <div class="bars">
      ${bar('Food', '🍎', pet.hunger, '#ff9f43')}${bar('Fun', '🎈', pet.happiness, '#c77dff')}${bar('Energy', '⚡', pet.energy, '#4f9cff')}
    </div>
    <div class="panel xp">
      <div class="row spread"><span>⭐ Pet XP: ${cur} / ${need}</span><span class="muted">${nextEvolve ? `Evolves at Lv ${nextEvolve}` : 'Fully evolved!'}</span></div>
      <div class="track" style="margin-top:6px"><div class="fill" style="width:${(cur / need) * 100}%"></div></div>
    </div>
    <div class="actions">
      <button class="primary" data-action="train"><span class="emoji">🧠</span>Train (Math!)</button>
      <button data-action="shop"><span class="emoji">🛒</span>Shop</button>
      <button data-action="closet"><span class="emoji">🎒</span>My Stuff</button>
      <button data-action="rewards"><span class="emoji">🎟️</span>Rewards</button>
      <button data-action="progress"><span class="emoji">📈</span>Progress</button>
    </div>`;
}

/* ---------------- Quiz ---------------- */

function startQuiz() {
  const p = profile();
  quiz = { n: 0, correct: 0, coins: 0, xp: 0, levelUps: [], results: [], q: null, input: '', feedback: null, lastSkill: null, done: false };
  nextQ();
  go('quiz');
}
function nextQ() {
  const p = profile();
  quiz.q = nextQuestion(p.skills, quiz.lastSkill);
  quiz.lastSkill = quiz.q.skillId;
  quiz.input = ''; quiz.feedback = null;
}

function renderQuiz() {
  const p = profile(); const q = quiz.q;
  if (quiz.done) return renderRoundSummary();
  const skill = SKILLS[q.skillId];
  const pct = (quiz.n / ROUND_SIZE) * 100;
  const fb = quiz.feedback;
  let inputArea;
  if (fb) {
    inputArea = `<div class="feedback ${fb.ok ? 'ok' : 'no'}">${fb.ok ? `✅ Correct! +${fb.coins} 🪙` : `❌ The answer was <b>${esc(q.answer)}</b>`}${fb.levelUp ? `<br>🚀 ${skill.name} leveled up to ${p.skills[q.skillId].level}! +${state.rules.tokensPerLevelUp} token` : ''}</div>
      <button class="primary" style="width:100%;margin-top:12px" data-action="next">${quiz.n >= ROUND_SIZE ? 'See results 🏁' : 'Next →'}</button>`;
  } else if (q.choices) {
    inputArea = `<div class="choices">${q.choices.map((c) => `<button data-action="choice" data-val="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
  } else {
    inputArea = `
      <div class="answer-box">${esc(quiz.input)}<span class="caret"></span></div>
      <div class="pad">
        ${['7', '8', '9'].map((d) => `<button data-action="key" data-val="${d}">${d}</button>`).join('')}<button data-action="key" data-val="⌫">⌫</button>
        ${['4', '5', '6'].map((d) => `<button data-action="key" data-val="${d}">${d}</button>`).join('')}<button data-action="key" data-val="-">−</button>
        ${['1', '2', '3'].map((d) => `<button data-action="key" data-val="${d}">${d}</button>`).join('')}<button class="enter" data-action="submit">✓</button>
        <button data-action="key" data-val=".">.</button><button data-action="key" data-val="0">0</button><button data-action="key" data-val="/">/ :</button>
      </div>`;
  }
  return `
    <div class="quiz">
      <div class="topbar"><button class="ghost" data-action="quit">✕ Quit</button><span class="pill">${skill.emoji} ${skill.name} · Lv ${q.level}</span><span class="pill coin">🪙 +${quiz.coins}</span></div>
      <div class="progress"><div class="fill" style="width:${pct}%"></div></div>
      <div class="muted center">Question ${Math.min(quiz.n + 1, ROUND_SIZE)} of ${ROUND_SIZE} · streak ${p.skills[q.skillId].streak}/5</div>
      <div class="panel question ${q.prompt.length > 28 ? 'small' : ''}">${esc(q.prompt)}</div>
      ${q.hint && !fb ? `<p class="muted center">💡 ${esc(q.hint)}</p>` : ''}
      ${inputArea}
    </div>`;
}

function submitAnswer(val) {
  if (quiz.feedback || quiz.done) return;
  if (String(val).trim() === '') return;
  const p = profile(); const q = quiz.q;
  const ok = isCorrect(q, val);
  const r = recordResult(p.skills, q.skillId, ok);
  p.stats.answered++;
  quiz.n++;
  let coins = 0;
  if (ok) {
    const m = mood(p.pet);
    coins = Math.round(coinsForAnswer(state.rules, q.level) * m.bonus);
    p.coins += coins; quiz.coins += coins; quiz.correct++; p.stats.correct++;
    p.pet.xp += state.rules.xpPerCorrect; quiz.xp += state.rules.xpPerCorrect;
  }
  if (r.leveledUp) { quiz.levelUps.push(q.skillId); p.tokens += state.rules.tokensPerLevelUp; p.tokensEarned += state.rules.tokensPerLevelUp; logEvent(p, `Leveled up ${SKILLS[q.skillId].name} to ${p.skills[q.skillId].level}`); }
  quiz.results.push({ skillId: q.skillId, ok, prompt: q.prompt, answer: q.answer, given: val });
  quiz.feedback = { ok, coins, levelUp: r.leveledUp };
  commit();
  render();
  if (ok) { floatText(`+${coins} 🪙`, window.innerWidth / 2 - 30, window.innerHeight / 2); }
}

function finishRound() {
  const p = profile();
  const today = todayKey();
  const firstToday = p.stats.lastRoundDay !== today;
  if (firstToday) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    p.stats.dayStreak = p.stats.lastRoundDay === todayKey(y) ? p.stats.dayStreak + 1 : 1;
    p.stats.bestStreak = Math.max(p.stats.bestStreak, p.stats.dayStreak);
    p.stats.lastRoundDay = today;
  }
  const t = roundTokens(state.rules, quiz.correct, 0, firstToday);
  p.tokens += t; p.tokensEarned += t; p.stats.rounds++;
  quiz.tokens = t; quiz.firstToday = firstToday; quiz.done = true;
  const oldLvl = petLevelFromXp(p.pet.xp - quiz.xp), newLvl = petLevelFromXp(p.pet.xp);
  quiz.petLevelUp = newLvl > oldLvl ? newLvl : null;
  quiz.evolved = quiz.petLevelUp && stageIndex(newLvl) > stageIndex(oldLvl);
  logEvent(p, `Round: ${quiz.correct}/${ROUND_SIZE} correct, +${quiz.coins} coins, +${t} tokens`);
  commit(); render();
  confetti(quiz.correct === ROUND_SIZE ? 80 : 30);
}

function renderRoundSummary() {
  const p = profile();
  const perfect = quiz.correct === ROUND_SIZE;
  return `
    <div class="quiz">
      <div class="panel center">
        <div style="font-size:4rem">${perfect ? '🏆' : quiz.correct >= 7 ? '🌟' : '💪'}</div>
        <h1>${perfect ? 'PERFECT ROUND!' : quiz.correct >= 7 ? 'Great job!' : 'Nice try!'}</h1>
        <p style="font-size:1.4rem">${quiz.correct} / ${ROUND_SIZE} correct</p>
        <div class="row" style="justify-content:center;margin:12px 0">
          <span class="pill coin">🪙 +${quiz.coins}</span>
          <span class="pill token">🎟️ +${quiz.tokens + quiz.levelUps.length * state.rules.tokensPerLevelUp} tokens</span>
          <span class="pill">⭐ +${quiz.xp} XP</span>
        </div>
        ${quiz.firstToday ? `<p class="muted">🌞 First round today bonus! Day streak: ${p.stats.dayStreak}</p>` : ''}
        ${quiz.levelUps.length ? `<p>🚀 Leveled up: ${quiz.levelUps.map((s) => SKILLS[s].name).join(', ')}</p>` : ''}
        ${quiz.evolved ? `<p style="font-size:1.3rem">✨ ${esc(p.pet.name)} EVOLVED into a ${SPECIES[p.pet.species].stageNames[stageIndex(quiz.petLevelUp)]}!</p>` : quiz.petLevelUp ? `<p>🎉 ${esc(p.pet.name)} reached level ${quiz.petLevelUp}!</p>` : ''}
        <div class="row" style="justify-content:center;margin-top:16px">
          <button class="primary" data-action="train">Play again 🔁</button>
          <button data-action="home">Back to ${esc(p.pet.name)} 🏠</button>
        </div>
      </div>
      ${quiz.results.some((r) => !r.ok) ? `<div class="panel" style="margin-top:14px"><h3>Ones to practice</h3>${quiz.results.filter((r) => !r.ok).map((r) => `<p>${esc(r.prompt)} → <b>${esc(r.answer)}</b> <span class="muted">(you said ${esc(r.given)})</span></p>`).join('')}</div>` : ''}
    </div>`;
}

/* ---------------- Shop & closet ---------------- */

function renderShop() {
  const p = profile(); const pet = p.pet;
  const items = ITEMS.filter((i) => i.cat === shopTab);
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>🛒 Shop</h2></div><span class="pill coin">🪙 ${p.coins}</span></div>
    <div class="tabs">${CATEGORIES.map((c) => `<button class="${c.id === shopTab ? 'active' : ''}" data-action="tab" data-id="${c.id}">${c.emoji} ${c.name}</button>`).join('')}</div>
    <div class="grid">
      ${items.map((i) => {
        const owned = !CONSUMABLE.has(i.cat) && (pet.inventory[i.id] || 0) > 0;
        const can = p.coins >= i.price;
        return `<div class="panel item ${owned ? 'owned' : ''}">
          <div class="emoji">${i.emoji}</div><div class="name">${esc(i.name)}</div>
          ${i.effect ? `<div class="muted" style="font-size:0.8rem">${Object.entries(i.effect).map(([k, v]) => `${{ hunger: '🍎', happiness: '🎈', energy: '⚡' }[k]}${v > 0 ? '+' : ''}${v}`).join(' ')}</div>` : ''}
          ${owned ? `<div class="muted">Owned ✓</div><button data-action="closet">Equip</button>` : `<div class="price">🪙 ${i.price}</div><button class="${can ? 'good' : ''}" data-action="buy" data-id="${i.id}" ${can ? '' : 'disabled'}>${can ? 'Buy' : 'Need more coins'}</button>`}
        </div>`;
      }).join('')}
    </div>`;
}

function buy(id) {
  const p = profile(); const item = itemById(id);
  if (p.coins < item.price) return toast('Not enough coins! Do some math 🧠');
  p.coins -= item.price;
  p.pet.inventory[id] = (p.pet.inventory[id] || 0) + 1;
  logEvent(p, `Bought ${item.name} for ${item.price} coins`);
  if (CONSUMABLE.has(item.cat)) { useItem(id); toast(`${p.pet.name} loved the ${item.name}! ${item.emoji}`); }
  else { p.pet.equipped[item.cat] = id; toast(`Equipped ${item.name}! ${item.emoji}`); }
  commit(); render();
}

function useItem(id) {
  const p = profile(); const item = itemById(id);
  if (!(p.pet.inventory[id] > 0)) return;
  p.pet.inventory[id]--; if (p.pet.inventory[id] === 0) delete p.pet.inventory[id];
  applyEffect(p.pet, item.effect);
  commit();
}

function renderCloset() {
  const p = profile(); const pet = p.pet;
  const owned = ITEMS.filter((i) => (pet.inventory[i.id] || 0) > 0);
  const gear = owned.filter((i) => !CONSUMABLE.has(i.cat)); const food = owned.filter((i) => CONSUMABLE.has(i.cat));
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>🎒 My Stuff</h2></div><span class="pill coin">🪙 ${p.coins}</span></div>
    ${petStage(p)}
    <h3 style="margin-top:16px">Gear</h3>
    ${gear.length ? `<div class="grid">${gear.map((i) => {
      const eq = pet.equipped[i.cat] === i.id;
      return `<div class="panel item ${eq ? 'equipped' : ''}"><div class="emoji">${i.emoji}</div><div class="name">${esc(i.name)}</div>
        <button data-action="${eq ? 'unequip' : 'equip'}" data-id="${i.id}">${eq ? 'Take off' : 'Put on'}</button></div>`;
    }).join('')}</div>` : '<p class="muted">No gear yet. Earn coins and visit the shop!</p>'}
    <h3 style="margin-top:16px">Snacks & toys</h3>
    ${food.length ? `<div class="grid">${food.map((i) => `<div class="panel item"><div class="emoji">${i.emoji}</div><div class="name">${esc(i.name)} ×${pet.inventory[i.id]}</div><button class="good" data-action="use" data-id="${i.id}">Use</button></div>`).join('')}</div>` : '<p class="muted">Nothing saved up. Food and toys from the shop are used right away.</p>'}`;
}

/* ---------------- Rewards ---------------- */

function renderRewards() {
  const p = profile();
  const pending = p.redemptions.filter((r) => r.status === 'pending');
  const recent = p.redemptions.filter((r) => r.status !== 'pending').slice(0, 8);
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>🎟️ Real-Life Rewards</h2></div><span class="pill token">🎟️ ${p.tokens} tokens</span></div>
    <p class="muted">Earn tokens by finishing math rounds. Pick a reward and a grown-up will approve it!</p>
    <div class="list">
      ${state.rewards.slice().sort((a, b) => a.cost - b.cost).map((r) => {
        const can = p.tokens >= r.cost;
        return `<div class="panel reward"><span class="emoji">${r.emoji}</span><span class="name">${esc(r.name)}</span><span class="cost">🎟️ ${r.cost}</span>
          <button class="${can ? 'good' : ''}" data-action="redeem" data-id="${r.id}" ${can ? '' : 'disabled'}>${can ? 'Get it!' : `${r.cost - p.tokens} more`}</button></div>`;
      }).join('')}
    </div>
    ${pending.length ? `<h3 style="margin-top:20px">Waiting for a grown-up ⏳</h3><div class="list">${pending.map((r) => `<div class="panel reward"><span class="emoji">${r.emoji}</span><span class="name">${esc(r.name)}</span><span class="status pending">pending</span></div>`).join('')}</div>` : ''}
    ${recent.length ? `<h3 style="margin-top:20px">History</h3><div class="list">${recent.map((r) => `<div class="panel reward"><span class="emoji">${r.emoji}</span><span class="name">${esc(r.name)}</span><span class="status ${r.status}">${r.status}</span></div>`).join('')}</div>` : ''}`;
}

function redeem(id) {
  const p = profile(); const r = state.rewards.find((x) => x.id === id);
  if (!r || p.tokens < r.cost) return;
  p.tokens -= r.cost;
  p.redemptions.unshift({ id: `${Date.now()}`, rewardId: r.id, name: r.name, emoji: r.emoji, cost: r.cost, status: 'pending', at: Date.now() });
  logEvent(p, `Asked for reward: ${r.name} (${r.cost} tokens)`);
  commit(); render(); toast(`Asked for ${r.name}! Tell a grown-up 🎉`, 3000); confetti(30);
}

/* ---------------- Progress ---------------- */

function renderProgress(p = profile(), back = 'home') {
  const acc = p.stats.answered ? Math.round((p.stats.correct / p.stats.answered) * 100) : 0;
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="${back}">← Back</button><h2>📈 ${esc(p.name)}'s Progress</h2></div></div>
    <div class="row" style="margin-bottom:14px">
      <span class="pill">🏁 ${p.stats.rounds} rounds</span><span class="pill">✅ ${p.stats.correct}/${p.stats.answered} (${acc}%)</span>
      <span class="pill">🔥 ${p.stats.dayStreak} day streak (best ${p.stats.bestStreak})</span><span class="pill token">🎟️ ${p.tokensEarned} tokens earned</span>
    </div>
    <div class="panel">
      ${SKILL_IDS.map((id) => {
        const s = p.skills[id]; const def = SKILLS[id]; const unlocked = isUnlocked(p.skills, id);
        return `<div class="skill-row ${unlocked ? '' : 'locked'}"><span>${def.emoji}</span>
          <div><b>${def.name}</b>${unlocked ? '' : ` <span class="muted" style="font-size:0.8rem">🔒 unlocks when ${SKILLS[def.unlock.skill].name} hits Lv ${def.unlock.level}</span>`}</div>
          <div class="lvl">${Array.from({ length: MAX_LEVEL }, (_, i) => `<i class="${i < s.level ? 'on' : ''}"></i>`).join('')}</div>
          <span class="muted">Lv ${s.level}</span></div>`;
      }).join('')}
    </div>
    <p class="muted" style="margin-top:10px">Get 5 in a row right to level up a skill. Levels go to ${MAX_LEVEL}, way past grade ${p.grade}!</p>`;
}

/* ---------------- Parent ---------------- */

function renderParent() {
  if (!parentUnlocked) {
    return `<div class="topbar"><h2>🔒 Parent Mode</h2><button class="ghost" data-action="home-profiles">← Back</button></div>
      <div class="panel" style="max-width:380px"><label>PIN</label><input id="pin" type="password" inputmode="numeric" placeholder="Default is 1234" />
      <button class="primary" style="margin-top:12px;width:100%" data-action="pin-submit">Unlock</button></div>`;
  }
  const pendingAll = KIDS.flatMap((k) => state.profiles[k.id].redemptions.filter((r) => r.status === 'pending').map((r) => ({ ...r, kid: k })));
  const r = state.rules;
  return `
    <div class="topbar"><h2>👨‍👩‍👧‍👦 Parent Dashboard</h2><button class="ghost" data-action="parent-exit">Lock & exit</button></div>

    <div class="panel"><h3>Kids</h3>
      <table><tr><th>Kid</th><th>Pet</th><th>Rounds</th><th>Accuracy</th><th>Coins</th><th>Tokens</th><th>Earned</th><th></th></tr>
      ${KIDS.map((k) => { const p = state.profiles[k.id]; const acc = p.stats.answered ? Math.round((p.stats.correct / p.stats.answered) * 100) : 0;
        return `<tr><td><b>${k.name}</b><br><span class="muted">Gr ${k.grade}</span></td><td>${p.pet ? `${SPECIES[p.pet.species].stages[stageIndex(petLevelFromXp(p.pet.xp))]} ${esc(p.pet.name)} Lv${petLevelFromXp(p.pet.xp)}` : '—'}</td>
        <td>${p.stats.rounds}</td><td>${acc}% <span class="muted">(${p.stats.answered})</span></td><td>${p.coins}</td><td>${p.tokens}</td><td>${p.tokensEarned}</td>
        <td class="row"><button data-action="p-progress" data-id="${k.id}">Skills</button><button data-action="p-tokens" data-id="${k.id}" data-n="5">+5 🎟️</button><button data-action="p-tokens" data-id="${k.id}" data-n="-5">−5 🎟️</button></td></tr>`; }).join('')}
      </table></div>

    <div class="panel" style="margin-top:14px"><h3>Pending redemptions ${pendingAll.length ? `(${pendingAll.length})` : ''}</h3>
      ${pendingAll.length ? `<div class="list">${pendingAll.map((x) => `<div class="reward"><span class="emoji">${x.emoji}</span><span class="name"><b>${x.kid.name}</b> wants: ${esc(x.name)} <span class="muted">(${x.cost} tokens, ${new Date(x.at).toLocaleDateString()})</span></span>
        <button class="good" data-action="p-approve" data-kid="${x.kid.id}" data-id="${x.id}">Approve ✓</button><button class="bad" data-action="p-deny" data-kid="${x.kid.id}" data-id="${x.id}">Deny & refund</button></div>`).join('')}</div>` : '<p class="muted">Nothing waiting.</p>'}
    </div>

    <div class="panel" style="margin-top:14px"><h3>Reward list</h3>
      <div class="list">${state.rewards.slice().sort((a, b) => a.cost - b.cost).map((rw) => `<div class="reward"><span class="emoji">${rw.emoji}</span><span class="name">${esc(rw.name)}</span>
        <input type="number" min="1" value="${rw.cost}" data-action="p-cost" data-id="${rw.id}" style="width:90px" /> <button class="ghost" data-action="p-del-reward" data-id="${rw.id}">🗑️</button></div>`).join('')}</div>
      <div class="row" style="margin-top:12px"><input id="nr-emoji" placeholder="🎁" style="width:70px" /><input id="nr-name" placeholder="New reward name" style="flex:1" /><input id="nr-cost" type="number" placeholder="Tokens" style="width:110px" /><button data-action="p-add-reward">Add</button></div>
    </div>

    <div class="panel" style="margin-top:14px"><h3>Token rules</h3>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        ${[['tokensPerRound', 'Tokens per finished round'], ['perfectRoundBonus', 'Bonus for a perfect 10/10'], ['tokensPerLevelUp', 'Bonus when a skill levels up'], ['dailyFirstRoundBonus', 'Bonus for first round of the day'], ['coinsPerCorrect', 'Coins per correct answer'], ['coinsLevelBonus', 'Extra coins per skill level'], ['xpPerCorrect', 'Pet XP per correct answer']]
          .map(([k, label]) => `<div><label>${label}</label><input type="number" min="0" value="${r[k]}" data-action="p-rule" data-id="${k}" /></div>`).join('')}
      </div>
      <p class="muted" style="margin-top:8px">A round is ${ROUND_SIZE} questions. With defaults a kid earns 1–4 tokens per round, so a $15 toy (100 tokens) is roughly 30–50 rounds of math.</p>
    </div>

    <div class="panel" style="margin-top:14px"><h3>Recent activity</h3>
      ${KIDS.map((k) => { const p = state.profiles[k.id]; return p.log.length ? `<b>${k.name}</b><ul class="muted" style="margin:4px 0 10px">${p.log.slice(0, 5).map((e) => `<li>${new Date(e.at).toLocaleString()} — ${esc(e.text)}</li>`).join('')}</ul>` : ''; }).join('') || '<p class="muted">No activity yet.</p>'}
    </div>

    <div class="panel" style="margin-top:14px"><h3>Settings</h3>
      <div class="row"><input id="newpin" type="password" placeholder="New PIN" style="width:160px" /><button data-action="p-pin">Change PIN</button></div>
      <div class="row" style="margin-top:12px"><button data-action="p-export">💾 Back up save file</button><button data-action="p-import">📂 Restore from backup</button><input id="importfile" type="file" accept=".json" style="display:none" /></div>
      <div class="row" style="margin-top:12px">${KIDS.map((k) => `<button class="bad" data-action="p-reset" data-id="${k.id}">Reset ${k.name}</button>`).join('')}</div>
      <p class="muted" style="margin-top:8px">Saves live in this browser on this computer. Back up now and then, and restore if the browser data is ever cleared.</p>
    </div>`;
}

/* ---------------- Render + events ---------------- */

function render() {
  const s = view.screen;
  let html;
  if (s === 'profiles') html = renderProfiles();
  else if (s === 'newpet') html = renderNewPet();
  else if (s === 'home') html = renderHome();
  else if (s === 'quiz') html = renderQuiz();
  else if (s === 'shop') html = renderShop();
  else if (s === 'closet') html = renderCloset();
  else if (s === 'rewards') html = renderRewards();
  else if (s === 'progress') html = renderProgress();
  else if (s === 'parent') html = renderParent();
  else if (s === 'parent-progress') html = renderProgress(state.profiles[view.kid], 'parent');
  $app.innerHTML = html;
  const f = $app.querySelector('#petname, #pin'); if (f) f.focus();
}

$app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT') return;
  const a = el.dataset.action, id = el.dataset.id;
  const p = activeId ? profile() : null;
  switch (a) {
    case 'pick': activeId = id; view = {}; go(profile().pet ? 'home' : 'newpet'); break;
    case 'home-profiles': activeId = null; quiz = null; go('profiles'); break;
    case 'home': go('home'); break;
    case 'species': view.species = id; view.name = document.getElementById('petname').value; render(); break;
    case 'create-pet': {
      const name = document.getElementById('petname').value.trim() || SPECIES[view.species].name;
      p.pet = newPet(view.species, name); logEvent(p, `Hatched ${name} the ${SPECIES[view.species].name}`); commit();
      confetti(60); go('home', { speech: `Hi ${p.name}! I'm ${name}!` }); break;
    }
    case 'train': startQuiz(); break;
    case 'quit': quiz = null; go('home'); break;
    case 'key': if (el.dataset.val === '⌫') quiz.input = quiz.input.slice(0, -1); else if (quiz.input.length < 10) quiz.input += el.dataset.val; render(); break;
    case 'submit': submitAnswer(quiz.input); break;
    case 'choice': submitAnswer(el.dataset.val); break;
    case 'next': if (quiz.n >= ROUND_SIZE) finishRound(); else { nextQ(); render(); } break;
    case 'shop': go('shop'); break;
    case 'tab': shopTab = id; render(); break;
    case 'buy': buy(id); break;
    case 'closet': go('closet'); break;
    case 'equip': p.pet.equipped[itemById(id).cat] = id; commit(); render(); break;
    case 'unequip': p.pet.equipped[itemById(id).cat] = null; commit(); render(); break;
    case 'use': useItem(id); toast(`${p.pet.name} says thanks! ${itemById(id).emoji}`); render(); break;
    case 'rewards': go('rewards'); break;
    case 'redeem': redeem(id); break;
    case 'progress': go('progress'); break;
    case 'parent': go('parent'); break;
    case 'parent-exit': parentUnlocked = false; go('profiles'); break;
    case 'pin-submit': { const v = document.getElementById('pin').value; if (v === state.parentPin) { parentUnlocked = true; render(); } else toast('Wrong PIN'); break; }
    case 'p-progress': go('parent-progress', { kid: id }); break;
    case 'p-tokens': { const k = state.profiles[id]; const n = Number(el.dataset.n); k.tokens = Math.max(0, k.tokens + n); if (n > 0) k.tokensEarned += n; logEvent(k, `Parent adjusted tokens by ${n}`); commit(); render(); break; }
    case 'p-approve': case 'p-deny': {
      const k = state.profiles[el.dataset.kid]; const rd = k.redemptions.find((x) => x.id === id); if (!rd) break;
      rd.status = a === 'p-approve' ? 'approved' : 'denied';
      if (a === 'p-deny') k.tokens += rd.cost;
      logEvent(k, `${rd.status}: ${rd.name}`); commit(); render(); break;
    }
    case 'p-del-reward': state.rewards = state.rewards.filter((x) => x.id !== id); commit(); render(); break;
    case 'p-add-reward': {
      const name = document.getElementById('nr-name').value.trim(); const cost = Number(document.getElementById('nr-cost').value); const emoji = document.getElementById('nr-emoji').value.trim() || '🎁';
      if (!name || !(cost > 0)) return toast('Need a name and a token cost');
      state.rewards.push({ id: `r${Date.now()}`, name, emoji, cost }); commit(); render(); break;
    }
    case 'p-pin': { const v = document.getElementById('newpin').value.trim(); if (v.length < 3) return toast('PIN needs at least 3 characters'); state.parentPin = v; commit(); toast('PIN changed'); break; }
    case 'p-export': {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `petmath-backup-${todayKey()}.json`; link.click(); URL.revokeObjectURL(url); break;
    }
    case 'p-import': document.getElementById('importfile').click(); break;
    case 'p-reset': if (confirm(`Reset ${state.profiles[id].name}'s pet, coins, tokens and progress? This cannot be undone.`)) { state.profiles[id] = newProfile(KIDS.find((k) => k.id === id)); commit(); render(); } break;
  }
});

$app.addEventListener('change', (e) => {
  const el = e.target; const a = el.dataset.action;
  if (a === 'p-cost') { const rw = state.rewards.find((x) => x.id === el.dataset.id); if (rw) { rw.cost = Math.max(1, Number(el.value) || 1); commit(); } }
  else if (a === 'p-rule') { state.rules[el.dataset.id] = Math.max(0, Number(el.value) || 0); commit(); }
  else if (el.id === 'importfile' && el.files[0]) {
    const reader = new FileReader();
    reader.onload = () => { try { const data = JSON.parse(reader.result); if (!data.profiles) throw 0; localStorage.setItem('petmath.save.v1', JSON.stringify(data)); location.reload(); } catch { toast('That file is not a Pet Math backup'); } };
    reader.readAsText(el.files[0]);
  }
});

document.addEventListener('keydown', (e) => {
  if (view.screen === 'quiz' && quiz && !quiz.done) {
    if (quiz.feedback) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (quiz.n >= ROUND_SIZE) finishRound(); else { nextQ(); render(); } } return; }
    if (quiz.q.choices) { const n = Number(e.key); if (n >= 1 && n <= quiz.q.choices.length) submitAnswer(quiz.q.choices[n - 1]); return; }
    if (/^[0-9.\-/:]$/.test(e.key)) { if (quiz.input.length < 10) quiz.input += e.key; render(); }
    else if (e.key === 'Backspace') { quiz.input = quiz.input.slice(0, -1); render(); }
    else if (e.key === 'Enter') submitAnswer(quiz.input);
  } else if (e.key === 'Enter') {
    if (view.screen === 'parent' && !parentUnlocked) document.querySelector('[data-action=pin-submit]')?.click();
    if (view.screen === 'newpet') document.querySelector('[data-action=create-pet]')?.click();
  }
});

render();
