import { esc } from '../ui.js';
import { petLevelFromXp, xpForLevel } from '../economy.js';
import { tickPet, mood, stageIndex, itemById } from '../pets.js';
import { PETS } from '../pixel/sprites.js';
import { petCanvas } from '../pixel/pet.js';
import { ensureQuests } from '../quests.js';
import { todayKey } from '../state.js';
import { isMuted, setMuted } from '../audio.js';

export function petStage(app, speech, { cls = '' } = {}) {
  const p = app.p; const pet = p.pet; const lvl = petLevelFromXp(pet.xp); const sp = PETS[pet.species]; const m = mood(pet);
  const bg = pet.equipped.bg ? itemById(pet.equipped.bg) : null;
  const sad = m.label === 'Sad' || m.label === 'Starving';
  return `
    <div class="stage ${cls}" style="${bg ? `background:${bg.css}` : ''}">
      <div class="sky-deco">${skyDeco(pet.equipped.bg)}</div>
      <div class="ground"></div>
      <div class="badge-pill left">${esc(pet.name)} · Lv ${lvl} ${esc(sp?.stageNames[stageIndex(lvl)] || '')}</div>
      <div class="badge-pill right">${m.emoji} ${m.label}${m.bonus > 1 ? ` · ×${m.bonus} coins` : ''}</div>
      ${speech ? `<div class="speech">${esc(speech)}</div>` : ''}
      <div class="pet-wrap" data-pet-wrap data-sad="${sad ? 1 : 0}"></div>
    </div>`;
}

function skyDeco(bg) {
  if (bg === 'space') return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges">' + Array.from({ length: 40 }, (_, i) => `<rect x="${(i * 97) % 400}" y="${(i * 53) % 150}" width="3" height="3" fill="#fff" opacity="${0.4 + (i % 3) * 0.2}"/>`).join('') + '</svg>';
  if (bg === 'volcano') return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges"><polygon points="60,200 160,60 260,200" fill="#3a1a1a"/><rect x="150" y="60" width="20" height="8" fill="#ff6b6b"/></svg>';
  if (bg === 'castle') return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges"><rect x="40" y="90" width="80" height="110" fill="#6f5fa8"/><rect x="40" y="80" width="16" height="12" fill="#6f5fa8"/><rect x="72" y="80" width="16" height="12" fill="#6f5fa8"/><rect x="104" y="80" width="16" height="12" fill="#6f5fa8"/><rect x="290" y="110" width="60" height="90" fill="#6f5fa8"/><rect x="300" y="100" width="12" height="10" fill="#6f5fa8"/><rect x="330" y="100" width="12" height="10" fill="#6f5fa8"/></svg>';
  if (bg === 'beach') return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges"><rect x="320" y="30" width="28" height="28" fill="#ffe36b"/><rect x="0" y="120" width="400" height="30" fill="#4fb3ff" opacity="0.6"/></svg>';
  if (bg === 'candy') return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges">' + Array.from({ length: 12 }, (_, i) => `<rect x="${(i * 67) % 400}" y="${(i * 41) % 120}" width="10" height="10" fill="${['#ff8fd8', '#ffcc4d', '#4fd38a'][i % 3]}"/>`).join('') + '</svg>';
  if (bg === 'meadow') return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges"><rect x="40" y="30" width="60" height="18" fill="#fff" opacity="0.9"/><rect x="60" y="20" width="30" height="12" fill="#fff" opacity="0.9"/><rect x="280" y="50" width="70" height="18" fill="#fff" opacity="0.9"/><rect x="300" y="40" width="30" height="12" fill="#fff" opacity="0.9"/></svg>';
  return '<svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges"><rect x="330" y="26" width="30" height="30" fill="#ffe36b"/><rect x="50" y="40" width="60" height="16" fill="#fff" opacity="0.85"/><rect x="70" y="30" width="26" height="12" fill="#fff" opacity="0.85"/><rect x="220" y="70" width="70" height="16" fill="#fff" opacity="0.85"/></svg>';
}

export function mountPet(app, root, size = 150) {
  const p = app.p; const wrap = root.querySelector('[data-pet-wrap]'); if (!wrap) return () => {};
  const lvl = petLevelFromXp(p.pet.xp);
  let frame = 0;
  const draw = () => {
    wrap.innerHTML = '';
    const c = petCanvas(p.pet.species, lvl, { size, equipped: p.pet.equipped, frame });
    c.classList.add('pet-canvas'); if (wrap.dataset.sad === '1') c.classList.add('sad');
    if (wrap.dataset.anim) c.classList.add(wrap.dataset.anim);
    wrap.appendChild(c);
  };
  draw();
  const t = setInterval(() => { frame = 1 - frame; draw(); }, 650);
  return () => clearInterval(t);
}

function bar(label, emoji, v, color) {
  return `<div class="panel bar"><div class="row spread"><span>${emoji} ${label}</span><span class="muted">${Math.round(v)}%</span></div><div class="track"><div class="fill" style="width:${v}%;background:${color}"></div></div></div>`;
}

export function render(app) {
  const p = app.p; tickPet(p.pet); app.save();
  const pet = p.pet; const lvl = petLevelFromXp(pet.xp); const cur = pet.xp - xpForLevel(lvl); const need = xpForLevel(lvl + 1) - xpForLevel(lvl);
  const nextEvolve = lvl < 5 ? 5 : lvl < 12 ? 12 : null;
  const quests = ensureQuests(p, todayKey());
  const openQuests = quests.items.filter((q) => !q.done).length;
  const pendingRewards = p.redemptions.filter((r) => r.status === 'pending').length;
  let hint;
  if (pet.hunger < 40) hint = `${pet.name} is hungry! Visit the shop for food.`;
  else if (pet.happiness < 40) hint = `${pet.name} wants to play!`;
  else if (pet.energy < 30) hint = `${pet.name} is sleepy. A nap would help.`;
  else hint = [`Let's do some math, ${p.name}!`, `Ready to train, ${p.name}?`, `A monster is waiting in the arena!`, `${openQuests ? `${openQuests} quests left today!` : 'All quests done. Legend!'}`][Math.floor(Math.random() * 4)];
  return `
    <div class="topbar">
      <div class="row"><button class="ghost" data-action="leave">← Switch</button><h2>${esc(p.name)}</h2></div>
      <div class="row"><span class="pill coin">🪙 ${p.coins}</span><span class="pill token">🎟️ ${p.tokens}</span><button class="ghost" data-action="mute">${isMuted() ? '🔇' : '🔊'}</button></div>
    </div>
    ${petStage(app, app.view.speech || hint)}
    <div class="bars">
      ${bar('Food', '🍎', pet.hunger, '#ff9f43')}${bar('Fun', '🎈', pet.happiness, '#c77dff')}${bar('Energy', '⚡', pet.energy, '#4f9cff')}
    </div>
    <div class="panel xp">
      <div class="row spread"><span>⭐ XP ${cur} / ${need}</span><span class="muted">${nextEvolve ? `Evolves at Lv ${nextEvolve}` : 'Final form!'}</span></div>
      <div class="track" style="margin-top:6px"><div class="fill" style="width:${(cur / need) * 100}%"></div></div>
    </div>
    <div class="actions">
      <button class="primary" data-action="train"><span class="emoji">🧠</span>Train</button>
      <button class="bad" data-action="arena"><span class="emoji">⚔️</span>Battle</button>
      <button data-action="quests"><span class="emoji">📜</span>Quests${openQuests ? `<span class="badge-count">${openQuests}</span>` : ''}</button>
      <button data-action="shop"><span class="emoji">🛒</span>Shop</button>
      <button data-action="closet"><span class="emoji">🎒</span>My Stuff</button>
      <button class="purple" data-action="rewards"><span class="emoji">🎟️</span>Rewards${pendingRewards ? `<span class="badge-count">${pendingRewards}</span>` : ''}</button>
      <button data-action="progress"><span class="emoji">📈</span>Progress</button>
    </div>`;
}

export function mount(app, root) { return mountPet(app, root); }

export const actions = {
  leave: (app) => app.leave(),
  home: (app) => app.go('home'),
  train: (app) => app.go('quiz', { mode: 'train' }),
  arena: (app) => app.go('battle'),
  quests: (app) => app.go('progress', { tab: 'quests' }),
  shop: (app) => app.go('shop'),
  closet: (app) => app.go('closet'),
  rewards: (app) => app.go('rewards'),
  progress: (app) => app.go('progress'),
  mute: (app) => { setMuted(!isMuted()); app.render(); },
};
