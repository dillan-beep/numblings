// Tiny helper for interactive visuals. Uses event delegation on the
// container so re-rendering innerHTML never loses the listener.
//
// makeMount(render, reduce, answerOf) builds a mount(spec, el, { onAnswer }).
//   render(spec, state)       -> markup string (elements carry data-act / data-value)
//   reduce(spec, state, act, value) -> new state (or same state to ignore)
//   answerOf(spec, state)     -> string | null   (null = not ready, no onAnswer)
//   initial(spec)             -> initial state

export const HIT = 'cursor:pointer;';

export function makeMount({ initial, render, reduce, answerOf }) {
  return function mount(spec, el, { onAnswer } = {}) {
    if (!el || typeof el !== 'object') {
      console.warn('[visuals] mountVisual: no container element');
      return null;
    }
    let state = initial(spec);
    const paint = () => { el.innerHTML = render(spec, state); };
    const handler = (e) => {
      let node = e && e.target;
      // Walk up to the nearest element with data-act (closest() may be absent in stubs).
      while (node && node !== el && !(node.getAttribute && node.getAttribute('data-act'))) {
        node = node.parentNode;
      }
      if (!node || node === el) return;
      const act = node.getAttribute('data-act');
      const value = node.getAttribute('data-value');
      const next = reduce(spec, state, act, value);
      if (next === state) return;
      state = next;
      paint();
      const ans = answerOf(spec, state);
      if (ans != null && typeof onAnswer === 'function') onAnswer(ans);
    };
    paint();
    if (typeof el.addEventListener === 'function') el.addEventListener('click', handler);
    return {
      getState: () => state,
      getAnswer: () => answerOf(spec, state),
      destroy() {
        if (typeof el.removeEventListener === 'function') el.removeEventListener('click', handler);
      },
    };
  };
}
