import { esc, toast } from '../ui.js';
import { ITEMS, CONSUMABLE, itemById } from '../pets.js';
import { petStage, mountPet } from './home.js';
import { itemArt } from './shop.js';
import { useItem } from '../game.js';
import { sfx } from '../audio.js';

export function render(app) {
  const p = app.p; const pet = p.pet;
  const owned = ITEMS.filter((i) => (pet.inventory[i.id] || 0) > 0);
  const gear = owned.filter((i) => !CONSUMABLE.has(i.cat)); const food = owned.filter((i) => CONSUMABLE.has(i.cat));
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>🎒 My Stuff</h2></div><span class="pill coin">🪙 ${p.coins}</span></div>
    ${petStage(app, app.view.speech)}
    <h3 style="margin-top:16px">Gear</h3>
    ${gear.length ? `<div class="grid">${gear.map((i) => {
      const eq = pet.equipped[i.cat] === i.id;
      return `<div class="panel item ${eq ? 'equipped' : ''}"><div class="art">${itemArt(i)}</div><div class="name">${esc(i.name)}</div>
        <button data-action="${eq ? 'unequip' : 'equip'}" data-id="${i.id}">${eq ? 'Take off' : 'Put on'}</button></div>`;
    }).join('')}</div>` : '<p class="muted">No gear yet. Earn coins and visit the shop, or win loot in battles!</p>'}
    <h3 style="margin-top:16px">Snacks & toys</h3>
    ${food.length ? `<div class="grid">${food.map((i) => `<div class="panel item"><div class="art">${itemArt(i)}</div><div class="name">${esc(i.name)} ×${pet.inventory[i.id]}</div><button class="good" data-action="use" data-id="${i.id}">Use</button></div>`).join('')}</div>` : '<p class="muted">Nothing saved up. Food and toys from the shop are used right away.</p>'}`;
}

export function mount(app, root) { return mountPet(app, root); }

export const actions = {
  equip: (app, el) => { const it = itemById(el.dataset.id); app.p.pet.equipped[it.cat] = it.id; app.save(); sfx('buy'); app.view.speech = `Looking good!`; app.render(); },
  unequip: (app, el) => { const it = itemById(el.dataset.id); app.p.pet.equipped[it.cat] = null; app.save(); app.view.speech = null; app.render(); },
  use: (app, el) => { if (useItem(app.state, app.p, el.dataset.id)) { app.save(); sfx('eat'); app.view.speech = `Yum! Thanks ${app.p.name}!`; toast(`${app.p.pet.name} says thanks!`); app.render(); } },
};
