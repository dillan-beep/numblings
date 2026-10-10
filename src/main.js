import { load, save, KIDS } from './state.js';
import { prepareProfile } from './game.js';
import { sfx, unlockAudio } from './audio.js';
import { toast } from './ui.js';
import * as title from './screens/title.js';
import * as newpet from './screens/newpet.js';
import * as home from './screens/home.js';
import * as quiz from './screens/quiz.js';
import * as battle from './screens/battle.js';
import * as shop from './screens/shop.js';
import * as closet from './screens/closet.js';
import * as rewards from './screens/rewards.js';
import * as progress from './screens/progress.js';
import * as parent from './screens/parent.js';

const SCREENS = { title, newpet, home, quiz, battle, shop, closet, rewards, progress, parent };

export const app = {
  state: load(),
  view: { screen: 'title' },
  activeId: null,
  round: null,
  battle: null,
  parentUnlocked: false,
  shopTab: 'food',
  cleanup: null,
  get p() { return this.activeId ? this.state.profiles[this.activeId] : null; },
  save() { save(this.state); },
  go(screen, extra = {}) { this.view = { screen, ...extra }; this.render(); },
  render() {
    if (this.cleanup) { try { this.cleanup(); } catch { /* ignore */ } this.cleanup = null; }
    const scr = SCREENS[this.view.screen] || title;
    if (this.p) prepareProfile(this.state, this.p);
    const root = document.getElementById('app');
    root.innerHTML = scr.render(this);
    if (scr.mount) this.cleanup = scr.mount(this, root) || null;
    window.scrollTo({ top: 0 });
  },
  pick(id) { this.activeId = id; this.round = null; this.go(this.p.pet ? 'home' : 'newpet'); },
  leave() { this.activeId = null; this.round = null; this.battle = null; this.go('title'); },
};

const actions = {};
for (const scr of Object.values(SCREENS)) Object.assign(actions, scr.actions || {});

document.getElementById('app').addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
  unlockAudio();
  const fn = actions[el.dataset.action];
  if (!fn) return;
  if (!el.classList.contains('silent')) sfx('click');
  try { fn(app, el, e); } catch (err) { console.error(err); toast('Oops, something went wrong.'); }
});

document.getElementById('app').addEventListener('change', (e) => {
  const el = e.target; const a = el.dataset.change;
  if (!a) return;
  const fn = actions[a];
  if (fn) { try { fn(app, el, e); } catch (err) { console.error(err); } }
});

document.addEventListener('keydown', (e) => {
  const scr = SCREENS[app.view.screen];
  if (scr?.onKey) scr.onKey(app, e);
});

// Persist on tab close just in case.
window.addEventListener('beforeunload', () => app.save());

app.render();
export { KIDS };
