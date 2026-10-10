import { esc, confetti } from '../ui.js';
import { newPet } from '../pets.js';
import { PETS } from '../pixel/sprites.js';
import { petImg } from '../pixel/pet.js';
import { logEvent } from '../state.js';
import { sfx } from '../audio.js';

export function render(app) {
  const p = app.p; const v = app.view;
  return `
    <div class="topbar"><h1>Hi ${esc(p.name)}! Pick your creature</h1><button class="ghost" data-action="leave">← Back</button></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
      ${Object.entries(PETS).map(([id, s]) => `
        <div class="panel item ${v.species === id ? 'equipped' : ''}" data-action="species" data-id="${id}" style="cursor:pointer">
          <div class="art">${petImg(id, 1, 4)}</div>
          <div class="name">${esc(s.name)}</div>
          <div class="muted tiny">${esc(s.stageNames.join(' → '))}</div>
        </div>`).join('')}
    </div>
    <div class="panel" style="margin-top:16px;max-width:480px">
      <label>Name your creature</label>
      <input id="petname" maxlength="16" placeholder="e.g. Sparky" value="${esc(v.name || '')}" />
      <button class="primary" style="margin-top:14px;width:100%" data-action="create-pet" ${v.species ? '' : 'disabled'}>Hatch! 🥚</button>
    </div>`;
}

export function mount(app, root) { root.querySelector('#petname')?.focus(); }

export function onKey(app, e) {
  if (e.key === 'Enter') document.querySelector('[data-action=create-pet]')?.click();
}

export const actions = {
  species: (app, el) => { app.view.species = el.dataset.id; app.view.name = document.getElementById('petname')?.value || ''; app.render(); },
  'create-pet': (app) => {
    const p = app.p; const species = app.view.species; if (!species) return;
    const name = (document.getElementById('petname')?.value || '').trim() || PETS[species].name;
    p.pet = newPet(species, name);
    logEvent(p, `Hatched ${name} the ${PETS[species].name}`);
    app.save(); sfx('evolve'); confetti(60);
    app.go('home', { speech: `Hi ${p.name}! I'm ${name}!` });
  },
};
