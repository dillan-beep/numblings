// Progress: skills ladder, daily quests, badges. Used by kids and (read-only) by parents.
import { esc, pct } from '../ui.js';
import { SKILLS, SKILL_IDS, MAX_LEVEL } from '../math/skills.js';
import { isUnlocked, levelProgress, GRADE_TARGET, GRADE_NOW, aboveGradeCount, isAboveGrade } from '../math/engine.js';
import { ensureQuests } from '../quests.js';
import { BADGES } from '../achievements.js';
import { todayKey } from '../state.js';

export function render(app, p = app.p, back = 'home') {
  const tab = app.view.tab || 'skills';
  return `
    <div class="topbar"><div class="row"><button class="ghost" data-action="${back}">← Back</button><h2>📈 ${esc(p.name)}</h2></div></div>
    <div class="tabs">
      <button class="${tab === 'skills' ? 'active' : ''}" data-action="prog-tab" data-id="skills">🧠 Skills</button>
      <button class="${tab === 'quests' ? 'active' : ''}" data-action="prog-tab" data-id="quests">📜 Quests</button>
      <button class="${tab === 'badges' ? 'active' : ''}" data-action="prog-tab" data-id="badges">🏅 Badges</button>
      <button class="${tab === 'stats' ? 'active' : ''}" data-action="prog-tab" data-id="stats">📊 Stats</button>
    </div>
    ${tab === 'skills' ? skillsTab(p) : tab === 'quests' ? questsTab(p) : tab === 'badges' ? badgesTab(p) : statsTab(p)}`;
}

export function skillsTab(p) {
  const now = GRADE_NOW[p.grade] ?? 1, target = GRADE_TARGET[p.grade] ?? 5;
  const above = aboveGradeCount(p.skills, p.grade);
  return `
    <div class="row" style="margin-bottom:12px">
      <span class="pill">🚀 ${above} of ${SKILL_IDS.length} skills above grade ${p.grade}</span>
      <span class="pill muted">⭐ = June target (Lv ${target})</span>
    </div>
    <div class="panel">
      ${SKILL_IDS.map((id) => {
        const s = p.skills[id]; const def = SKILLS[id]; const unlocked = isUnlocked(p.skills, id);
        const prog = levelProgress(s);
        return `<div class="skill-row ${unlocked ? '' : 'locked'}"><span>${def.emoji}</span>
          <div><b>${esc(def.name)}</b>${unlocked ? (isAboveGrade(id, s.level, p.grade) ? ` <span class="above">▲ above grade</span>` : '') : ` <span class="muted tiny">🔒 unlocks when ${esc(SKILLS[def.unlock.skill].name)} hits Lv ${def.unlock.level}</span>`}
            ${unlocked && s.level < MAX_LEVEL ? `<div class="track" style="height:6px;background:var(--ink);margin-top:4px;width:140px"><div style="height:100%;width:${prog * 100}%;background:var(--accent)"></div></div>` : ''}</div>
          <div class="lvl">${Array.from({ length: MAX_LEVEL }, (_, i) => `<i class="${i < s.level ? 'on' : ''} ${i + 1 === target ? 'target' : ''}"></i>`).join('')}</div>
          <span class="muted">Lv ${s.level}</span></div>`;
      }).join('')}
    </div>
    <p class="muted tiny" style="margin-top:10px">Level up a skill by getting 9 of the last 10 right, with the last 5 all correct. Levels go to ${MAX_LEVEL} (grade 6–7 work).</p>`;
}

export function questsTab(p) {
  const q = ensureQuests(p, todayKey());
  return `
    <p class="muted">New quests every day. Finish them for bonus tokens! 🎟️</p>
    <div class="list">
      ${q.items.map((it) => `<div class="panel quest ${it.done ? 'done' : ''}"><span class="emoji">${it.emoji}</span>
        <div class="body"><b>${esc(it.text)}</b> <span class="token tiny" style="color:var(--token)">+${it.reward} 🎟️</span>
          <div class="track"><div class="fill" style="width:${(it.progress / it.goal) * 100}%;${it.done ? 'background:var(--good)' : ''}"></div></div>
          <div class="tiny muted">${it.done ? '✅ Done!' : `${it.progress} / ${it.goal}`}</div></div></div>`).join('')}
    </div>`;
}

export function badgesTab(p) {
  const earned = BADGES.filter((b) => p.badges[b.id]).length;
  return `
    <p class="muted">${earned} of ${BADGES.length} badges earned</p>
    <div class="badges">${BADGES.map((b) => `<div class="panel badge ${p.badges[b.id] ? '' : 'locked'}"><div class="emoji">${b.emoji}</div><div class="name">${esc(b.name)}</div><div class="desc">${esc(b.desc)}</div></div>`).join('')}</div>`;
}

export function statsTab(p) {
  const acc = pct(p.stats.correct, p.stats.answered);
  const days = p.history.slice(-14);
  const maxA = Math.max(10, ...days.map((d) => d.answered));
  return `
    <div class="row" style="margin-bottom:14px">
      <span class="pill">🏁 ${p.stats.rounds} rounds</span><span class="pill">✅ ${p.stats.correct}/${p.stats.answered} (${acc}%)</span>
      <span class="pill">🔥 ${p.stats.dayStreak} day streak (best ${p.stats.bestStreak})</span><span class="pill">⚡ best run ${p.stats.bestAnswerStreak || 0}</span>
      <span class="pill">⚔️ ${p.stats.battlesWon || 0} wins</span><span class="pill token">🎟️ ${p.tokensEarned} earned</span><span class="pill">⏱️ ${Math.round(p.stats.minutes || 0)} min</span>
    </div>
    <div class="panel"><h3>Last 14 days</h3>
      ${days.length ? `<svg viewBox="0 0 ${days.length * 30} 110" width="100%" style="max-height:160px" shape-rendering="crispEdges">
        ${days.map((d, i) => { const h = (d.answered / maxA) * 80, hc = (d.correct / maxA) * 80; return `<rect x="${i * 30 + 4}" y="${90 - h}" width="22" height="${h}" fill="#34346e"/><rect x="${i * 30 + 4}" y="${90 - hc}" width="22" height="${hc}" fill="var(--good)"/><text x="${i * 30 + 15}" y="104" font-size="9" text-anchor="middle" fill="#a9adde">${d.day.slice(8)}</text>`; }).join('')}
      </svg><p class="tiny muted">Green = correct, grey = total answered per day</p>` : '<p class="muted">Play a round to start the chart.</p>'}
    </div>`;
}

export const actions = {
  'prog-tab': (app, el) => { app.view.tab = el.dataset.id; app.render(); },
};
