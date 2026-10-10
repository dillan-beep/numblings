// Training rounds + the shared question UI (also used by battles) + the Pip tutor panel.
import { esc, floatText, confetti, toast } from '../ui.js';
import { SKILLS } from '../math/skills.js';
import { ROUND_SIZE, newRound, drawQuestion, answer, finishRound } from '../game.js';
import { renderVisual, mountVisual, isInteractive } from '../visuals/index.js';
import { sfx } from '../audio.js';
import { askTutor, listen, stopListening, speak, stopSpeaking, speechSupported, TutorError } from '../tutor/tutor.js';
import { petImg } from '../pixel/pet.js';
import { PETS } from '../pixel/sprites.js';
import { petLevelFromXp } from '../economy.js';

let visualHandle = null;

export function startRound(app, opts) {
  app.round = newRound(app.state, app.p, opts);
  drawQuestion(app.state, app.p, app.round);
}

/* ---------- shared question area ---------- */

export function questionArea(app, round, { showProgress = true } = {}) {
  const p = app.p; const q = round.q; const skill = SKILLS[q.skillId]; const fb = round.feedback;
  let inputArea;
  if (fb) {
    inputArea = `<div class="feedback ${fb.ok ? 'ok' : 'no'}">
        ${fb.ok ? `✅ Correct! +${fb.coins} 🪙 +${fb.xp} ⭐` : `❌ The answer was <b>${esc(q.answer)}</b>`}
        ${!fb.ok && q.explain ? `<span class="explain">💡 ${esc(q.explain)}</span>` : ''}
        ${fb.levelUp ? `<span class="explain">🚀 ${esc(skill.name)} leveled up to ${p.skills[q.skillId].level}! +${app.state.rules.tokensPerLevelUp} token</span>` : ''}
        ${fb.levelDown ? `<span class="explain">Let's practise ${esc(skill.name)} level ${p.skills[q.skillId].level} a bit more.</span>` : ''}
        ${fb.questsDone.map((d) => `<span class="explain">📜 Quest done: ${esc(d.text)} +${d.reward} 🎟️</span>`).join('')}
      </div>
      <button class="primary" style="width:100%;margin-top:12px" data-action="${round.mode === 'battle' ? 'b-next' : 'q-next'}">${round.mode === 'train' && round.n >= ROUND_SIZE ? 'See results 🏁' : round.mode === 'battle' && round.battleOver ? 'See what happened' : 'Next →'}</button>`;
  } else if (q.input === 'visual') {
    inputArea = `<p class="muted center tiny">Tap the picture to answer, then press ✓</p>
      <div class="row" style="justify-content:center"><button class="good big" data-action="q-submit-visual">✓ Done</button></div>`;
  } else if (q.choices) {
    inputArea = `<div class="choices">${q.choices.map((c, i) => `<button class="silent" data-action="q-choice" data-val="${esc(c)}" title="Press ${i + 1}">${esc(c)}</button>`).join('')}</div>`;
  } else {
    inputArea = `
      <div class="answer-box">${esc(round.input)}<span class="caret"></span></div>
      <div class="pad">
        ${['7', '8', '9'].map((d) => `<button class="silent" data-action="q-key" data-val="${d}">${d}</button>`).join('')}<button class="silent" data-action="q-key" data-val="⌫">⌫</button>
        ${['4', '5', '6'].map((d) => `<button class="silent" data-action="q-key" data-val="${d}">${d}</button>`).join('')}<button class="silent" data-action="q-key" data-val="-">−</button>
        ${['1', '2', '3'].map((d) => `<button class="silent" data-action="q-key" data-val="${d}">${d}</button>`).join('')}<button class="enter silent" data-action="q-submit">✓</button>
        <button class="silent" data-action="q-key" data-val=".">.</button><button class="silent" data-action="q-key" data-val="0">0</button><button class="silent" data-action="q-key" data-val="/">/</button>
      </div>
      <div class="row" style="justify-content:center;margin-top:8px"><button class="silent tiny" data-action="q-key" data-val=":">: (time)</button></div>`;
  }
  const len = q.prompt.length;
  return `
    ${showProgress ? `<div class="progress">${Array.from({ length: ROUND_SIZE }, (_, i) => `<i class="${round.results[i] ? (round.results[i].ok ? 'ok' : 'no') : i === round.n ? 'cur' : ''}"></i>`).join('')}</div>` : ''}
    <div class="row spread tiny muted">
      <span>${skill.emoji} ${esc(skill.name)} · Lv ${q.level}${q.review ? ' (review)' : ''}</span>
      <span>${round.mode === 'train' ? `Question ${Math.min(round.n + 1, ROUND_SIZE)} of ${ROUND_SIZE}` : `Round ${round.n + 1}`} · 🔥 ${p.stats.answerStreak}</span>
    </div>
    <div class="panel question ${len > 60 ? 'tiny' : len > 30 ? 'small' : ''}">${esc(q.prompt)}</div>
    ${q.visual ? `<div class="visual" data-visual>${renderVisual(q.visual)}</div>` : ''}
    ${q.hint && !fb ? `<p class="muted center tiny">💡 ${esc(q.hint)}</p>` : ''}
    ${inputArea}
    ${!fb ? `<button class="help-btn" data-action="tutor-open">💬 Ask Pip for help</button>` : ''}
    ${round.tutor ? tutorPanel(app, round) : ''}`;
}

export function mountQuestion(app, root) {
  const round = app.round; const q = round?.q;
  visualHandle = null;
  if (q?.visual && isInteractive(q.visual) && !round.feedback) {
    const el = root.querySelector('[data-visual]');
    if (el) visualHandle = mountVisual(q.visual, el, { onAnswer: (v) => { round.input = v; sfx('pop'); } });
  }
  const inp = root.querySelector('#tutor-input'); if (inp) inp.focus();
}

export function submit(app, val, onAnswered) {
  const round = app.round; if (!round || round.feedback || round.done) return;
  if (String(val).trim() === '') return;
  const fb = answer(app.state, app.p, round, val);
  stopSpeaking(); stopListening();
  app.save();
  if (fb.ok) { sfx('correct'); setTimeout(() => sfx('coin'), 180); } else sfx('wrong');
  if (fb.levelUp) setTimeout(() => sfx('levelup'), 400);
  if (fb.questsDone.length) setTimeout(() => sfx('quest'), 600);
  if (onAnswered) onAnswered(fb);
  if (round.onAnswered) round.onAnswered(fb);
  app.render();
  if (fb.ok) floatText(`+${fb.coins} 🪙`, window.innerWidth / 2 - 30, window.innerHeight / 2);
  for (const b of round.badges.splice(0)) toast(`🏅 Badge: ${b.name}!`, 2500);
}

/* ---------- training screen ---------- */

export function render(app) {
  if (!app.round || app.round.mode !== 'train') startRound(app, { mode: 'train' });
  const round = app.round;
  if (round.done) return summary(app, round);
  return `
    <div class="quiz">
      <div class="topbar"><button class="ghost" data-action="q-quit">✕ Quit</button><span class="pill coin">🪙 +${round.coins}</span></div>
      ${questionArea(app, round)}
    </div>`;
}

export function mount(app, root) { mountQuestion(app, root); return () => { stopListening(); stopSpeaking(); }; }

function summary(app, round) {
  const p = app.p;
  const perfect = round.correct === ROUND_SIZE;
  const wrong = round.results.filter((r) => !r.ok);
  return `
    <div class="quiz">
      <div class="panel center">
        <div style="font-size:4rem">${perfect ? '🏆' : round.correct >= 7 ? '🌟' : '💪'}</div>
        <h1>${perfect ? 'PERFECT!' : round.correct >= 7 ? 'Great job!' : 'Nice try!'}</h1>
        <p style="font-size:1.4rem">${round.correct} / ${ROUND_SIZE} correct</p>
        <div class="row" style="justify-content:center;margin:12px 0">
          <span class="pill coin">🪙 +${round.coins}</span>
          <span class="pill token">🎟️ +${round.tokens + round.levelUps.length * app.state.rules.tokensPerLevelUp + round.questsDone.reduce((a, d) => a + d.reward, 0)}</span>
          <span class="pill">⭐ +${round.xp}</span>
        </div>
        ${round.firstToday ? `<p class="muted">🌞 First round today! Day streak: ${p.stats.dayStreak}</p>` : ''}
        ${round.levelUps.length ? `<p>🚀 Leveled up: ${round.levelUps.map((s) => esc(SKILLS[s].name)).join(', ')}</p>` : ''}
        ${round.questsDone.length ? `<p>📜 Quests done: ${round.questsDone.map((d) => esc(d.text)).join(', ')}</p>` : ''}
        ${round.evolved ? `<p style="font-size:1.3rem">✨ ${esc(p.pet.name)} EVOLVED into a ${esc(PETS[p.pet.species].stageNames[Math.min(2, round.petLevelUp >= 12 ? 2 : 1)])}!</p><div>${petImg(p.pet.species, petLevelFromXp(p.pet.xp), 6)}</div>` : round.petLevelUp ? `<p>🎉 ${esc(p.pet.name)} reached level ${round.petLevelUp}!</p>` : ''}
        <div class="row" style="justify-content:center;margin-top:16px">
          <button class="primary" data-action="q-again">Play again 🔁</button>
          <button class="bad" data-action="arena">Battle ⚔️</button>
          <button data-action="home">Home 🏠</button>
        </div>
      </div>
      ${wrong.length ? `<div class="panel" style="margin-top:14px"><h3>Ones to practise</h3>${wrong.map((r) => `<p>${esc(r.prompt)} → <b>${esc(r.answer)}</b> <span class="muted tiny">(you said ${esc(r.given)})</span><br><span class="tiny muted">${esc(r.explain || '')}</span></p>`).join('')}</div>` : ''}
    </div>`;
}

/* ---------- tutor ---------- */

function tutorPanel(app, round) {
  const t = round.tutor;
  const last = t.history.filter((h) => h.role === 'assistant').at(-1);
  const mine = t.history.filter((h) => h.role === 'user').at(-1);
  return `
    <div class="panel tutor">
      <div class="pip">
        <div style="font-size:3rem;line-height:1">🧙</div>
        <div class="bubble ${t.busy ? 'thinking' : ''}">${t.error ? `<span style="color:var(--bad)">${esc(t.error)}</span>` : esc(t.streaming || last?.content || `Hi ${esc(app.p.name)}! What part is tricky? You can type or press the mic and talk.`)}</div>
      </div>
      ${mine ? `<div class="mine">You: ${esc(mine.content)}</div>` : ''}
      <div class="controls">
        ${speechSupported() ? `<button class="mic ${t.listening ? 'listening' : ''} silent" data-action="tutor-mic" title="Talk">${t.listening ? '👂' : '🎤'}</button>` : ''}
        <input id="tutor-input" placeholder="${t.listening ? 'Listening…' : 'Type a question for Pip'}" value="${esc(t.draft || '')}" />
        <button class="purple silent" data-action="tutor-send">Send</button>
        <button class="ghost silent" data-action="tutor-close">✕</button>
      </div>
    </div>`;
}

async function sendToTutor(app, text) {
  const round = app.round; const t = round.tutor; if (!t || t.busy || !text.trim()) return;
  const q = round.q; const p = app.p;
  t.history.push({ role: 'user', content: text.trim() });
  t.busy = true; t.error = null; t.streaming = ''; t.draft = '';
  p.stats.tutorAsks = (p.stats.tutorAsks || 0) + 1;
  app.render();
  const bubble = () => document.querySelector('.tutor .bubble');
  try {
    const reply = await askTutor({
      settings: app.state.tutor,
      kid: { name: p.name, age: p.age, grade: p.grade },
      question: { prompt: q.prompt, answer: q.answer, skillName: SKILLS[q.skillId].name, level: q.level, hint: q.hint },
      history: t.history.slice(0, -1),
      message: text.trim(),
      onText: (sofar) => { t.streaming = sofar; const b = bubble(); if (b) { b.textContent = sofar; b.classList.remove('thinking'); } },
    });
    t.history.push({ role: 'assistant', content: reply });
    t.streaming = '';
    if (app.state.tutor.voice) speak(reply);
  } catch (err) {
    t.error = err instanceof TutorError ? err.message : 'Pip had a hiccup. Try again!';
    t.history.pop();
  } finally {
    t.busy = false;
    if (app.round === round && !round.feedback) app.render();
  }
}

export function onKey(app, e) {
  const round = app.round; if (!round || round.done) return;
  const inTutor = document.activeElement?.id === 'tutor-input';
  if (inTutor) { if (e.key === 'Enter') { e.preventDefault(); actions['tutor-send'](app); } return; }
  if (round.feedback) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); actions['q-next'](app); } return; }
  const q = round.q;
  if (q.input === 'visual') { if (e.key === 'Enter') actions['q-submit-visual'](app); return; }
  if (q.choices) { const n = Number(e.key); if (n >= 1 && n <= q.choices.length) submit(app, q.choices[n - 1]); return; }
  if (/^[0-9.\-/:]$/.test(e.key)) { if (round.input.length < 12) round.input += e.key; app.render(); }
  else if (e.key === 'Backspace') { round.input = round.input.slice(0, -1); app.render(); }
  else if (e.key === 'Enter') submit(app, round.input);
}

export const actions = {
  'q-key': (app, el) => { const r = app.round; if (!r || r.feedback) return; const v = el.dataset.val; sfx('pop'); if (v === '⌫') r.input = r.input.slice(0, -1); else if (r.input.length < 12) r.input += v; app.render(); },
  'q-submit': (app) => submit(app, app.round.input),
  'q-submit-visual': (app) => { const v = visualHandle?.getAnswer?.() ?? app.round.input; if (!v) return toast('Tap the picture first!'); submit(app, v); },
  'q-choice': (app, el) => submit(app, el.dataset.val),
  'q-next': (app) => {
    const r = app.round; if (!r) return;
    if (r.mode === 'battle') { actions['b-next']?.(app); return; }
    if (r.n >= ROUND_SIZE) { finishRound(app.state, app.p, r); app.save(); sfx(r.correct === ROUND_SIZE ? 'win' : 'token'); app.render(); confetti(r.correct === ROUND_SIZE ? 90 : 30); for (const b of r.badges.splice(0)) toast(`🏅 Badge: ${b.name}!`, 2500); }
    else { drawQuestion(app.state, app.p, r); app.render(); }
  },
  'q-quit': (app) => { app.round = null; app.go('home'); },
  'q-again': (app) => { startRound(app, { mode: 'train' }); app.render(); },
  'tutor-open': (app) => {
    const r = app.round; if (!r) return;
    if (!app.state.tutor.enabled || !app.state.tutor.apiKey) { toast('Pip is asleep. Ask a grown-up to wake him in Parent Mode.', 3000); return; }
    r.tutor = { history: [], busy: false, error: null, streaming: '', listening: false, draft: '' };
    app.render();
  },
  'tutor-close': (app) => { if (app.round) app.round.tutor = null; stopSpeaking(); stopListening(); app.render(); },
  'tutor-send': (app) => { const v = document.getElementById('tutor-input')?.value || ''; sendToTutor(app, v); },
  'tutor-mic': async (app) => {
    const t = app.round?.tutor; if (!t) return;
    if (t.listening) { stopListening(); return; }
    t.listening = true; app.render(); stopSpeaking();
    try {
      const text = await listen({ onInterim: (s) => { const i = document.getElementById('tutor-input'); if (i) i.value = s; } });
      t.listening = false;
      await sendToTutor(app, text);
    } catch (err) {
      t.listening = false;
      if (app.round?.tutor === t) { t.error = err.message === 'no-speech' ? "I didn't hear anything. Try again!" : err.message === 'not-allowed' ? 'The microphone is blocked. Ask a grown-up to allow it.' : 'Mic trouble. You can type instead!'; app.render(); }
    }
  },
};
