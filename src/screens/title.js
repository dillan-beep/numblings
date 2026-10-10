import { KIDS } from '../state.js';
import { esc } from '../ui.js';
import { petLevelFromXp } from '../economy.js';
import { petCanvas } from '../pixel/pet.js';
import { PETS } from '../pixel/sprites.js';
import { isMuted, setMuted } from '../audio.js';

export function render(app) {
  return `
    <div class="title-screen">
      <div class="logo">NUMBLINGS</div>
      <div class="tagline">Raise a creature. Grow your brain.</div>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr));margin-top:26px">
      ${KIDS.map((k) => {
        const p = app.state.profiles[k.id];
        return `<div class="panel kid-card" data-action="pick" data-id="${k.id}">
          <div class="band" style="background:${k.color}"></div>
          <div class="avatar" data-avatar="${k.id}"></div>
          <h2>${esc(k.name)}</h2>
          <div class="muted">Grade ${k.grade} · ${p.pet ? esc(p.pet.name) : 'No creature yet'}</div>
          <div class="row" style="justify-content:center;margin-top:10px"><span class="pill coin">🪙 ${p.coins}</span><span class="pill token">🎟️ ${p.tokens}</span></div>
          ${p.stats.dayStreak > 1 ? `<div class="tiny" style="margin-top:6px">🔥 ${p.stats.dayStreak} day streak</div>` : ''}
        </div>`;
      }).join('')}
    </div>
    <div class="center" style="margin-top:30px">
      <button class="ghost" data-action="parent">🔒 Parent Mode</button>
      <button class="ghost" data-action="mute">${isMuted() ? '🔇 Sound off' : '🔊 Sound on'}</button>
    </div>`;
}

export function mount(app, root) {
  let frame = 0;
  const draw = () => {
    for (const k of KIDS) {
      const p = app.state.profiles[k.id];
      const el = root.querySelector(`[data-avatar="${k.id}"]`);
      if (!el) continue;
      el.innerHTML = '';
      if (p.pet && PETS[p.pet.species]) el.appendChild(petCanvas(p.pet.species, petLevelFromXp(p.pet.xp), { size: 80, equipped: p.pet.equipped, frame }));
      else el.innerHTML = '<div style="font-size:4rem">🥚</div>';
    }
  };
  draw();
  const t = setInterval(() => { frame = 1 - frame; draw(); }, 700);
  return () => clearInterval(t);
}

export const actions = {
  pick: (app, el) => app.pick(el.dataset.id),
  parent: (app) => app.go('parent'),
  mute: (app) => { setMuted(!isMuted()); app.render(); },
};
