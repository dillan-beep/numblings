import { esc, toast, confetti } from '../ui.js';
import { logEvent } from '../state.js';
import { sfx } from '../audio.js';

export function render(app) {
  const p = app.p;
  const pending = p.redemptions.filter((r) => r.status === 'pending');
  const recent = p.redemptions.filter((r) => r.status !== 'pending').slice(0, 8);
  const sorted = app.state.rewards.slice().sort((a, b) => a.cost - b.cost);
  const next = sorted.find((r) => r.cost > p.tokens);
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="home">← Back</button><h2>🎟️ Real-Life Rewards</h2></div><span class="pill token">🎟️ ${p.tokens} tokens</span></div>
    <p class="muted">Earn tokens by finishing rounds, quests, and level-ups. Pick a reward and a grown-up will approve it!${next ? ` <b>${next.cost - p.tokens} more</b> for ${esc(next.name)}.` : ''}</p>
    <div class="list">
      ${sorted.map((r) => {
        const can = p.tokens >= r.cost;
        return `<div class="panel reward"><span class="emoji">${r.emoji}</span><span class="name">${esc(r.name)}</span><span class="cost">🎟️ ${r.cost}</span>
          <button class="${can ? 'good' : ''}" data-action="redeem" data-id="${r.id}" ${can ? '' : 'disabled'}>${can ? 'Get it!' : `${r.cost - p.tokens} more`}</button></div>`;
      }).join('')}
    </div>
    ${pending.length ? `<h3 style="margin-top:20px">Waiting for a grown-up ⏳</h3><div class="list">${pending.map((r) => `<div class="panel reward"><span class="emoji">${r.emoji}</span><span class="name">${esc(r.name)}</span><span class="status pending">pending</span></div>`).join('')}</div>` : ''}
    ${recent.length ? `<h3 style="margin-top:20px">History</h3><div class="list">${recent.map((r) => `<div class="panel reward"><span class="emoji">${r.emoji}</span><span class="name">${esc(r.name)}</span><span class="status ${r.status}">${r.status}</span></div>`).join('')}</div>` : ''}`;
}

export const actions = {
  redeem: (app, el) => {
    const p = app.p; const r = app.state.rewards.find((x) => x.id === el.dataset.id);
    if (!r || p.tokens < r.cost) return;
    p.tokens -= r.cost;
    p.redemptions.unshift({ id: `${Date.now()}`, rewardId: r.id, name: r.name, emoji: r.emoji, cost: r.cost, status: 'pending', at: Date.now() });
    logEvent(p, `Asked for reward: ${r.name} (${r.cost} tokens)`);
    app.save(); sfx('token'); confetti(30); toast(`Asked for ${r.name}! Tell a grown-up 🎉`, 3000); app.render();
  },
};
