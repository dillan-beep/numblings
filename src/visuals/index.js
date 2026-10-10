// Visual-model library: renderVisual(spec) -> markup string,
// mountVisual(spec, el, { onAnswer }) for interactive specs.
// See docs/contracts.md "Visuals" for the type/prop contract.

import * as tenframe from './tenframe.js';
import * as counters from './counters.js';
import * as numberline from './numberline.js';
import * as base10 from './base10.js';
import * as array from './array.js';
import * as fractionbar from './fractionbar.js';
import * as fractioncircle from './fractioncircle.js';
import * as clock from './clock.js';
import * as coins from './coins.js';
import * as shape from './shape.js';
import * as angle from './angle.js';
import * as grid from './grid.js';
import * as bargraph from './bargraph.js';
import * as pictograph from './pictograph.js';
import * as balance from './balance.js';
import * as ruler from './ruler.js';
import * as thermometer from './thermometer.js';
import * as area from './area.js';

const REGISTRY = {
  tenframe, counters, numberline, base10, array, fractionbar, fractioncircle,
  clock, coins, shape, angle, grid, bargraph, pictograph, balance, ruler,
  thermometer, area,
};

export const VISUAL_TYPES = Object.keys(REGISTRY);

function lookup(spec) {
  if (!spec || typeof spec !== 'object' || !spec.type) {
    console.warn('[visuals] missing spec or spec.type', spec);
    return null;
  }
  const mod = REGISTRY[spec.type];
  if (!mod) {
    console.warn(`[visuals] unknown visual type "${spec.type}"`);
    return null;
  }
  return mod;
}

// Is this spec one that accepts child input?
export function isInteractive(spec) {
  if (!spec) return false;
  switch (spec.type) {
    case 'numberline':
    case 'grid':
      return spec.question === 'point';
    case 'fractionbar':
      return !!spec.select;
    case 'clock':
      return !!spec.set;
    default:
      return false;
  }
}

export function renderVisual(spec) {
  const mod = lookup(spec);
  if (!mod) return '';
  try {
    return mod.render(spec) || '';
  } catch (err) {
    console.error(`[visuals] render failed for "${spec.type}"`, err);
    return '';
  }
}

// Replaces the container's content with a live version of the visual and
// wires clicks. Returns a handle { getState, getAnswer, destroy } or null.
export function mountVisual(spec, containerEl, { onAnswer } = {}) {
  const mod = lookup(spec);
  if (!mod) return null;
  if (!containerEl) {
    console.warn('[visuals] mountVisual called without a container');
    return null;
  }
  if (!isInteractive(spec) || typeof mod.mount !== 'function') {
    // Nothing to wire; make sure the static picture is present.
    containerEl.innerHTML = renderVisual(spec);
    return null;
  }
  try {
    return mod.mount(spec, containerEl, { onAnswer });
  } catch (err) {
    console.error(`[visuals] mount failed for "${spec.type}"`, err);
    return null;
  }
}

export default { renderVisual, mountVisual, isInteractive, VISUAL_TYPES };
