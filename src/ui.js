// Shared UI helpers: escaping, toasts, floating text, confetti, overlay cards.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function toast(msg, ms = 1800) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
}

export function floatText(text, x, y, color = 'var(--coin)') {
  const el = document.createElement('div');
  el.className = 'float'; el.textContent = text;
  el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
}

const CONFETTI_COLORS = ['#ffcc4d', '#4fd38a', '#4f9cff', '#ff6b6b', '#c77dff', '#ff9f43', '#ffffff'];
export function confetti(n = 40) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.animationDuration = `${1.4 + Math.random() * 2}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    el.style.width = el.style.height = `${8 + Math.random() * 8}px`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 4000);
  }
}

/** Show a modal card. html is trusted markup. Resolves when dismissed. */
export function overlay(html, { button = 'OK!', cls = '' } = {}) {
  return new Promise((resolve) => {
    const root = document.getElementById('overlay');
    root.innerHTML = `<div class="celebrate ${cls}"><div class="card">${html}<div style="margin-top:16px"><button class="primary" data-overlay-close>${esc(button)}</button></div></div></div>`;
    const close = () => { root.innerHTML = ''; resolve(); };
    root.querySelector('[data-overlay-close]').addEventListener('click', close);
  });
}
export function closeOverlay() { const root = document.getElementById('overlay'); if (root) root.innerHTML = ''; }

export const fmtTime = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms / 1000) % 60)).padStart(2, '0')}`;
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
