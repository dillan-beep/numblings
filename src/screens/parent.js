import { esc, toast, pct } from '../ui.js';
import { KIDS, newProfile, logEvent, STORAGE_KEY, todayKey } from '../state.js';
import { petLevelFromXp } from '../economy.js';
import { PETS } from '../pixel/sprites.js';
import { petImg } from '../pixel/pet.js';
import { ROUND_SIZE } from '../economy.js';
import { TUTOR_MODELS } from '../tutor/tutor.js';
import { SKILL_IDS, SKILLS } from '../math/skills.js';
import { GRADE_NOW, GRADE_TARGET, aboveGradeCount } from '../math/engine.js';
import * as progress from './progress.js';

export function render(app) {
  if (!app.parentUnlocked) {
    return `<div class="topbar"><h2>🔒 Parent Mode</h2><button class="ghost" data-action="leave">← Back</button></div>
      <div class="panel" style="max-width:400px"><label>PIN</label><input id="pin" type="password" inputmode="numeric" placeholder="Default is 1234" />
      <button class="primary" style="margin-top:12px;width:100%" data-action="pin-submit">Unlock</button></div>`;
  }
  if (app.view.kid) return progress.render(app, app.state.profiles[app.view.kid], 'parent-back');
  const s = app.state;
  const pendingAll = KIDS.flatMap((k) => s.profiles[k.id].redemptions.filter((r) => r.status === 'pending').map((r) => ({ ...r, kid: k })));
  const r = s.rules; const t = s.tutor;
  return `
    <div class="topbar"><h2>👨‍👩‍👧‍👦 Parent Dashboard</h2><button class="ghost" data-action="parent-exit">Lock & exit</button></div>

    <div class="panel"><h3>Kids</h3>
      <table><tr><th>Kid</th><th>Creature</th><th>Rounds</th><th>Accuracy</th><th>Above grade</th><th>Streak</th><th>Coins</th><th>Tokens</th><th></th></tr>
      ${KIDS.map((k) => { const p = s.profiles[k.id]; const acc = pct(p.stats.correct, p.stats.answered); const above = aboveGradeCount(p.skills, k.grade);
        return `<tr><td><b>${k.name}</b><br><span class="muted tiny">Gr ${k.grade}</span></td>
        <td>${p.pet ? `${PETS[p.pet.species] ? petImg(p.pet.species, petLevelFromXp(p.pet.xp), 2) : ''} ${esc(p.pet.name)} Lv${petLevelFromXp(p.pet.xp)}` : '—'}</td>
        <td>${p.stats.rounds}</td><td>${acc}% <span class="muted tiny">(${p.stats.answered})</span></td><td>${above}/${SKILL_IDS.length}</td><td>🔥 ${p.stats.dayStreak}</td><td>${p.coins}</td><td>${p.tokens} <span class="muted tiny">(${p.tokensEarned} earned)</span></td>
        <td class="row"><button data-action="p-progress" data-id="${k.id}">Details</button><button data-action="p-tokens" data-id="${k.id}" data-n="5">+5 🎟️</button><button data-action="p-tokens" data-id="${k.id}" data-n="-5">−5 🎟️</button></td></tr>`; }).join('')}
      </table>
      <p class="muted tiny" style="margin-top:8px">"Above grade" counts skills at least two levels past where that grade starts in October (one level up is about the end of the current grade). June targets: Jack Lv${GRADE_TARGET[1]}, Luke Lv${GRADE_TARGET[3]}, Madeline Lv${GRADE_TARGET[4]}.</p>
    </div>

    <div class="panel" style="margin-top:14px"><h3>Pending redemptions ${pendingAll.length ? `(${pendingAll.length})` : ''}</h3>
      ${pendingAll.length ? `<div class="list">${pendingAll.map((x) => `<div class="reward"><span class="emoji">${x.emoji}</span><span class="name"><b>${x.kid.name}</b> wants: ${esc(x.name)} <span class="muted tiny">(${x.cost} tokens, ${new Date(x.at).toLocaleDateString()})</span></span>
        <button class="good" data-action="p-approve" data-kid="${x.kid.id}" data-id="${x.id}">Approve ✓</button><button class="bad" data-action="p-deny" data-kid="${x.kid.id}" data-id="${x.id}">Deny & refund</button></div>`).join('')}</div>` : '<p class="muted">Nothing waiting.</p>'}
    </div>

    <div class="panel" style="margin-top:14px"><h3>🧙 Pip, the AI math helper</h3>
      <p class="muted tiny">Pip guides kids with hints and questions and never gives the answer. It runs on Claude using your own API key, stored only in this browser. Typical cost is well under a cent per question asked.</p>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div><label>Anthropic API key</label><input id="tutor-key" type="password" value="${esc(t.apiKey || '')}" placeholder="sk-ant-..." /></div>
        <div><label>Model</label><select id="tutor-model">${TUTOR_MODELS.map((m) => `<option value="${m.id}" ${t.model === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></div>
      </div>
      <div class="row" style="margin-top:10px">
        <label style="margin:0"><input type="checkbox" id="tutor-enabled" ${t.enabled ? 'checked' : ''} style="width:auto"/> Enabled</label>
        <label style="margin:0"><input type="checkbox" id="tutor-voice" ${t.voice ? 'checked' : ''} style="width:auto"/> Read replies out loud</label>
        <button data-action="p-tutor-save">Save helper settings</button>
      </div>
    </div>

    <div class="panel" style="margin-top:14px"><h3>Reward list</h3>
      <div class="list">${s.rewards.slice().sort((a, b) => a.cost - b.cost).map((rw) => `<div class="reward"><span class="emoji">${rw.emoji}</span><span class="name">${esc(rw.name)}</span>
        <input type="number" min="1" value="${rw.cost}" data-change="p-cost" data-id="${rw.id}" style="width:90px" /> <button class="ghost" data-action="p-del-reward" data-id="${rw.id}">🗑️</button></div>`).join('')}</div>
      <div class="row" style="margin-top:12px"><input id="nr-emoji" placeholder="🎁" style="width:70px" /><input id="nr-name" placeholder="New reward name" style="flex:1" /><input id="nr-cost" type="number" placeholder="Tokens" style="width:110px" /><button data-action="p-add-reward">Add</button></div>
    </div>

    <div class="panel" style="margin-top:14px"><h3>Token & coin rules</h3>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        ${[['tokensPerRound', 'Tokens per finished round'], ['perfectRoundBonus', 'Bonus for a perfect 10/10'], ['tokensPerLevelUp', 'Bonus when a skill levels up'], ['dailyFirstRoundBonus', 'Bonus for first round of the day'], ['coinsPerCorrect', 'Coins per correct answer'], ['coinsLevelBonus', 'Extra coins per skill level'], ['xpPerCorrect', 'Pet XP per correct answer']]
          .map(([k, label]) => `<div><label>${label}</label><input type="number" min="0" value="${r[k]}" data-change="p-rule" data-id="${k}" /></div>`).join('')}
      </div>
      <p class="muted tiny" style="margin-top:8px">A round is ${ROUND_SIZE} questions. Quests add 1–3 tokens each (three per day). With defaults a kid earns about 2–8 tokens on a good day, so a $15 toy (100 tokens) is a few weeks of steady practice.</p>
    </div>

    <div class="panel" style="margin-top:14px"><h3>Recent activity</h3>
      ${KIDS.map((k) => { const p = s.profiles[k.id]; return p.log.length ? `<b>${k.name}</b><ul class="muted tiny" style="margin:4px 0 10px">${p.log.slice(0, 6).map((e) => `<li>${new Date(e.at).toLocaleString()} — ${esc(e.text)}</li>`).join('')}</ul>` : ''; }).join('') || '<p class="muted">No activity yet.</p>'}
    </div>

    <div class="panel" style="margin-top:14px"><h3>Settings</h3>
      <div class="row"><input id="newpin" type="password" placeholder="New PIN" style="width:160px" /><button data-action="p-pin">Change PIN</button></div>
      <div class="row" style="margin-top:12px"><button data-action="p-export">💾 Back up save file</button><button data-action="p-import">📂 Restore from backup</button><input id="importfile" type="file" accept=".json" style="display:none" data-change="p-import-file" /></div>
      <div class="row" style="margin-top:12px">${KIDS.map((k) => `<button class="bad" data-action="p-reset" data-id="${k.id}">Reset ${k.name}</button>`).join('')}</div>
      <p class="muted tiny" style="margin-top:8px">Saves live in this browser on this computer. Back up now and then, and restore if the browser data is ever cleared.</p>
    </div>`;
}

export function mount(app, root) { root.querySelector('#pin')?.focus(); }

export function onKey(app, e) {
  if (e.key === 'Enter' && !app.parentUnlocked) document.querySelector('[data-action=pin-submit]')?.click();
}

export const actions = {
  'pin-submit': (app) => { const v = document.getElementById('pin')?.value; if (v === app.state.parentPin) { app.parentUnlocked = true; app.render(); } else toast('Wrong PIN'); },
  'parent-exit': (app) => { app.parentUnlocked = false; app.go('title'); },
  'parent-back': (app) => { app.view.kid = null; app.view.tab = null; app.render(); },
  'p-progress': (app, el) => { app.view.kid = el.dataset.id; app.view.tab = 'skills'; app.render(); },
  'p-tokens': (app, el) => { const k = app.state.profiles[el.dataset.id]; const n = Number(el.dataset.n); k.tokens = Math.max(0, k.tokens + n); if (n > 0) k.tokensEarned += n; logEvent(k, `Parent adjusted tokens by ${n}`); app.save(); app.render(); },
  'p-approve': (app, el) => decide(app, el, 'approved'),
  'p-deny': (app, el) => decide(app, el, 'denied'),
  'p-del-reward': (app, el) => { app.state.rewards = app.state.rewards.filter((x) => x.id !== el.dataset.id); app.save(); app.render(); },
  'p-add-reward': (app) => {
    const name = document.getElementById('nr-name').value.trim(); const cost = Number(document.getElementById('nr-cost').value); const emoji = document.getElementById('nr-emoji').value.trim() || '🎁';
    if (!name || !(cost > 0)) return toast('Need a name and a token cost');
    app.state.rewards.push({ id: `r${Date.now()}`, name, emoji, cost }); app.save(); app.render();
  },
  'p-cost': (app, el) => { const rw = app.state.rewards.find((x) => x.id === el.dataset.id); if (rw) { rw.cost = Math.max(1, Number(el.value) || 1); app.save(); } },
  'p-rule': (app, el) => { app.state.rules[el.dataset.id] = Math.max(0, Number(el.value) || 0); app.save(); },
  'p-tutor-save': (app) => {
    const t = app.state.tutor;
    t.apiKey = document.getElementById('tutor-key').value.trim();
    t.model = document.getElementById('tutor-model').value;
    t.enabled = document.getElementById('tutor-enabled').checked;
    t.voice = document.getElementById('tutor-voice').checked;
    app.save(); toast(t.apiKey ? 'Pip is ready to help!' : 'Saved (Pip stays asleep without a key)');
  },
  'p-pin': (app) => { const v = document.getElementById('newpin').value.trim(); if (v.length < 3) return toast('PIN needs at least 3 characters'); app.state.parentPin = v; app.save(); toast('PIN changed'); },
  'p-export': (app) => {
    const copy = JSON.parse(JSON.stringify(app.state)); // keep the key out of backups
    if (copy.tutor) copy.tutor.apiKey = '';
    const blob = new Blob([JSON.stringify(copy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `numblings-backup-${todayKey()}.json`; link.click(); URL.revokeObjectURL(url);
  },
  'p-import': () => document.getElementById('importfile').click(),
  'p-import-file': (app, el) => {
    const f = el.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { try { const data = JSON.parse(reader.result); if (!data.profiles) throw 0; if (data.tutor && !data.tutor.apiKey) data.tutor.apiKey = app.state.tutor.apiKey; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); location.reload(); } catch { toast('That file is not a Numblings backup'); } };
    reader.readAsText(f);
  },
  'p-reset': (app, el) => { const k = KIDS.find((x) => x.id === el.dataset.id); if (confirm(`Reset ${k.name}'s creature, coins, tokens and progress? This cannot be undone.`)) { app.state.profiles[k.id] = newProfile(k); app.save(); app.render(); } },
};

function decide(app, el, status) {
  const k = app.state.profiles[el.dataset.kid]; const rd = k.redemptions.find((x) => x.id === el.dataset.id); if (!rd) return;
  rd.status = status; if (status === 'denied') k.tokens += rd.cost;
  logEvent(k, `${status}: ${rd.name}`); app.save(); app.render();
}
