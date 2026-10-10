// Monster arena: pick a monster, then answer questions to attack.
import { esc, confetti, toast, overlay } from '../ui.js';
import { petLevelFromXp } from '../economy.js';
import { MONSTER_LADDER, availableMonsters, newBattle, applyAnswer, rollLoot, WEAPON_POWER } from '../battle.js';
import { ITEMS, itemById } from '../pets.js';
import { petCanvas, monsterCanvas, monsterImg, accessoryImg } from '../pixel/pet.js';
import { MONSTERS } from '../pixel/sprites.js';
import { newRound, drawQuestion, battleOutcome } from '../game.js';
import { questionArea, mountQuestion, submit } from './quiz.js';
import { sfx } from '../audio.js';

export function render(app) {
  const p = app.p;
  if (app.battle && app.round?.mode === 'battle') return arena(app);
  const lvl = petLevelFromXp(p.pet.xp);
  const avail = new Set(availableMonsters(lvl).map((m) => m.id));
  const weapon = p.pet.equipped.weapon;
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>⚔️ Monster Arena</h2></div>
      <span class="pill">${weapon ? `${accessoryImg(weapon, 2)} ${esc(itemById(weapon).name)} +${WEAPON_POWER[weapon] || 0}` : 'No weapon equipped'}</span></div>
    <p class="muted">Every right answer is an attack. Wrong answers let the monster hit ${esc(p.pet.name)}. Harder questions hit harder, and weapons add power!</p>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
      ${MONSTER_LADDER.map((m) => {
        const ok = avail.has(m.id);
        return `<div class="panel monster-card ${m.boss ? 'boss' : ''} ${ok ? '' : 'locked'}" ${ok ? `data-action="b-start" data-id="${m.id}"` : ''}>
          <div>${MONSTERS[m.id] ? monsterImg(m.id, m.boss ? 4 : 5) : '👾'}</div>
          <div class="name">${esc(m.name)}${m.boss ? ' 👑' : ''}</div>
          <div class="tiny muted">❤️ ${m.hp} · 💥 ${m.attack} · 🪙 ${m.coins}</div>
          ${ok ? '' : `<div class="tiny">🔒 Pet Lv ${m.minLevel}</div>`}
        </div>`;
      }).join('')}
    </div>`;
}

function arena(app) {
  const p = app.p; const b = app.battle; const m = MONSTER_LADDER.find((x) => x.id === b.monsterId); const round = app.round;
  const petPct = (b.petHp / b.petMax) * 100, monPct = (b.monsterHp / b.monsterMax) * 100;
  if (round.done) return result(app, b, m);
  return `
    <div class="topbar"><button class="ghost" data-action="b-quit">✕ Run away</button><span class="pill coin">🪙 +${round.coins}</span></div>
    <div class="arena" data-arena>
      <div class="ground"></div>
      <div class="hpbar left"><div class="name">${esc(p.pet.name)}</div><div class="track"><div class="fill ${petPct < 30 ? 'low' : ''}" style="width:${petPct}%"></div></div><div class="tiny">${b.petHp}/${b.petMax}</div></div>
      <div class="hpbar right"><div class="name">${esc(m.name)}</div><div class="track"><div class="fill ${monPct < 30 ? 'low' : ''}" style="width:${monPct}%"></div></div><div class="tiny" style="text-align:right">${b.monsterHp}/${b.monsterMax}</div></div>
      ${b.combo >= 2 ? `<div class="combo">${b.combo}x COMBO!</div>` : ''}
      <div class="fighter pet" data-fighter="pet"></div>
      <div class="fighter monster" data-fighter="monster"></div>
    </div>
    <div class="quiz" style="margin-top:14px">${questionArea(app, round, { showProgress: false })}</div>`;
}

function result(app, b, m) {
  const p = app.p; const loot = b.loot || {};
  return `
    <div class="quiz"><div class="panel center">
      <div>${b.won ? monsterImg(m.id, 5) : ''}</div>
      <div style="font-size:3rem">${b.won ? '🏆' : '💀'}</div>
      <h1>${b.won ? `${esc(m.name)} defeated!` : `${esc(m.name)} wins…`}</h1>
      <p>${b.correct} hits in ${b.turns} turns${b.won ? '' : `. ${esc(p.pet.name)} needs a rest and a snack.`}</p>
      ${b.won ? `<div class="row" style="justify-content:center"><span class="pill coin">🪙 +${loot.coins}</span>${loot.item ? `<span class="pill">🎁 Found: ${accessoryImg(loot.item.id, 2)} ${esc(loot.item.name)}</span>` : ''}</div>` : ''}
      ${app.round.questsDone.length ? `<p>📜 Quests done: ${app.round.questsDone.map((d) => esc(d.text)).join(', ')}</p>` : ''}
      ${app.round.evolved ? `<p style="font-size:1.3rem">✨ ${esc(p.pet.name)} EVOLVED!</p>` : app.round.petLevelUp ? `<p>🎉 ${esc(p.pet.name)} reached level ${app.round.petLevelUp}!</p>` : ''}
      <div class="row" style="justify-content:center;margin-top:16px">
        <button class="primary" data-action="b-again">Fight again ⚔️</button>
        <button data-action="b-pick">Pick a monster</button>
        <button data-action="home">Home 🏠</button>
      </div>
    </div></div>`;
}

export function mount(app, root) {
  if (!app.battle || app.round?.mode !== 'battle' || app.round.done) return;
  mountQuestion(app, root);
  const p = app.p; const lvl = petLevelFromXp(p.pet.xp); let frame = 0;
  const petEl = root.querySelector('[data-fighter=pet]'), monEl = root.querySelector('[data-fighter=monster]');
  const draw = () => {
    if (petEl) { petEl.innerHTML = ''; petEl.appendChild(petCanvas(p.pet.species, lvl, { size: 130, equipped: p.pet.equipped, frame })); }
    if (monEl) { monEl.innerHTML = ''; monEl.appendChild(monsterCanvas(app.battle.monsterId, { size: app.battle.monsterMax >= 90 ? 160 : 120, frame })); }
  };
  draw();
  const t = setInterval(() => { frame = 1 - frame; draw(); }, 600);
  return () => clearInterval(t);
}

function animate(app, who, dmg) {
  const arena = document.querySelector('[data-arena]'); if (!arena) return;
  const attacker = arena.querySelector(`[data-fighter=${who}]`), victim = arena.querySelector(`[data-fighter=${who === 'pet' ? 'monster' : 'pet'}]`);
  attacker?.classList.add('attack'); setTimeout(() => victim?.classList.add('hurt'), 200);
  setTimeout(() => { attacker?.classList.remove('attack'); victim?.classList.remove('hurt'); }, 900);
  const r = victim?.getBoundingClientRect();
  if (r) { const el = document.createElement('div'); el.className = 'dmg'; el.textContent = `-${dmg}`; el.style.left = `${r.left + r.width / 2 - 20}px`; el.style.top = `${r.top + 20}px`; el.style.position = 'fixed'; document.body.appendChild(el); setTimeout(() => el.remove(), 1000); }
}

export function onKey(app, e) {
  if (app.round?.mode === 'battle') { import('./quiz.js').then((q) => q.onKey(app, e)); }
}

export const actions = {
  'b-start': (app, el) => {
    const p = app.p; const m = MONSTER_LADDER.find((x) => x.id === el.dataset.id); if (!m) return;
    app.battle = newBattle(m, petLevelFromXp(p.pet.xp), p.pet);
    app.round = newRound(app.state, p, { mode: 'battle', monster: m.id });
    app.round.onAnswered = (fb) => { onAnswered(app, fb); app.round.battleOver = app.battle.over; };
    drawQuestion(app.state, p, app.round);
    sfx('hit'); app.render();
  },
  'b-next': (app) => {
    const r = app.round, b = app.battle; if (!r || !b) return;
    if (b.over) {
      const m = MONSTER_LADDER.find((x) => x.id === b.monsterId);
      const owned = new Set(Object.keys(app.p.pet.inventory));
      b.loot = b.won ? rollLoot(m, owned, ITEMS) : { coins: 0, item: null };
      battleOutcome(app.state, app.p, r, b, m, b.loot);
      if (!b.won) { app.p.pet.energy = Math.max(10, app.p.pet.energy - 20); }
      app.save(); sfx(b.won ? 'win' : 'lose'); app.render();
      if (b.won) confetti(m.boss ? 100 : 40);
      for (const x of r.badges.splice(0)) toast(`🏅 Badge: ${x.name}!`, 2500);
      return;
    }
    drawQuestion(app.state, app.p, r); app.render();
  },
  'b-quit': (app) => { app.battle = null; app.round = null; app.go('home'); },
  'b-again': (app) => { const id = app.battle.monsterId; actions['b-start'](app, { dataset: { id } }); },
  'b-pick': (app) => { app.battle = null; app.round = null; app.render(); },
};

// Hook: the quiz's submit() calls onAnswered; we wire the battle damage here.
export function onAnswered(app, fb) {
  const b = app.battle, r = app.round; if (!b || !r) return;
  const m = MONSTER_LADDER.find((x) => x.id === b.monsterId);
  const res = applyAnswer(b, m, { ok: fb.ok, questionLevel: r.q.level, weaponId: app.p.pet.equipped.weapon });
  setTimeout(() => { animate(app, res.by, res.dmg); sfx(res.by === 'pet' ? 'hit' : 'hurt'); }, 50);
}
