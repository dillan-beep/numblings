import { esc, toast } from '../ui.js';
import { ITEMS, CATEGORIES, CONSUMABLE, itemById } from '../pets.js';
import { accessoryImg } from '../pixel/pet.js';
import { ACCESSORIES } from '../pixel/sprites.js';
import { buyItem } from '../game.js';
import { sfx } from '../audio.js';

export function itemArt(item, scale = 4) {
  if (ACCESSORIES[item.id]) return accessoryImg(item.id, scale);
  if (item.cat === 'bg') return `<div style="width:64px;height:48px;border:3px solid var(--ink);background:${item.css}"></div>`;
  return `<span class="emoji">${item.emoji}</span>`;
}

const EFFECT_ICON = { hunger: '🍎', happiness: '🎈', energy: '⚡' };

export function render(app) {
  const p = app.p; const pet = p.pet;
  const items = ITEMS.filter((i) => i.cat === app.shopTab);
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>🛒 Shop</h2></div><span class="pill coin">🪙 ${p.coins}</span></div>
    <div class="tabs">${CATEGORIES.map((c) => `<button class="${c.id === app.shopTab ? 'active' : ''}" data-action="shop-tab" data-id="${c.id}">${c.emoji} ${esc(c.name)}</button>`).join('')}</div>
    <div class="grid">
      ${items.map((i) => {
        const owned = !CONSUMABLE.has(i.cat) && (pet.inventory[i.id] || 0) > 0;
        const can = p.coins >= i.price;
        return `<div class="panel item ${owned ? 'owned' : ''}">
          <div class="art">${itemArt(i)}</div><div class="name">${esc(i.name)}</div>
          ${i.effect ? `<div class="muted tiny">${Object.entries(i.effect).map(([k, v]) => `${EFFECT_ICON[k]}${v > 0 ? '+' : ''}${v}`).join(' ')}</div>` : ''}
          ${i.cat === 'weapon' ? `<div class="muted tiny">💥 power</div>` : ''}
          ${owned ? `<div class="muted tiny">Owned ✓</div><button data-action="closet">Equip</button>` : `<div class="price">🪙 ${i.price}</div><button class="${can ? 'good' : ''} silent" data-action="buy" data-id="${i.id}" ${can ? '' : 'disabled'}>${can ? 'Buy' : 'Need more coins'}</button>`}
        </div>`;
      }).join('')}
    </div>`;
}

export const actions = {
  'shop-tab': (app, el) => { app.shopTab = el.dataset.id; app.render(); },
  buy: (app, el) => {
    const r = buyItem(app.state, app.p, el.dataset.id);
    if (!r.ok) { sfx('wrong'); return toast('Not enough coins! Do some math 🧠'); }
    app.save(); sfx(CONSUMABLE.has(r.item.cat) ? 'eat' : 'buy');
    toast(CONSUMABLE.has(r.item.cat) ? `${app.p.pet.name} loved the ${r.item.name}!` : `Equipped ${r.item.name}!`);
    app.render();
  },
};
