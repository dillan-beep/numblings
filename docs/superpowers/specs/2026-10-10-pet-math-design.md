# Pet Math — Design

**Date:** 2026-10-10
**Status:** Built (v1)

## Goal

A browser game that gets Jack (6, grade 1), Luke (8, grade 3), and Madelyn (9, grade 4) doing math well above grade level, by tying all pet care and upgrades to answering questions. Kids earn in-game coins for the pet and real-life tokens that parents redeem.

## Decisions

- **No backend, no login.** Vite + vanilla JS, saves in localStorage. Build is a single `dist/index.html` the family can bookmark. Google login was judged not worth the setup for a home computer; a profile picker does the job.
- **Two currencies.** Coins are plentiful and spent on the pet. Tokens are scarce, earned only by finishing rounds, and spent on a parent-approved reward list. Keeping them separate stops the pet from competing with real rewards.
- **Adaptive levels per skill.** 13 skills, 10 levels each. Five correct in a row levels up; three misses in the last six levels down. Starting level depends on grade. Prerequisite unlocks gate multiplication, division, fractions, and order of operations.
- **Pet care gives a bonus, not a penalty.** A well-fed pet multiplies coins (×1.2 / ×1.5). A neglected pet looks sad but never blocks play.
- **Parent mode behind a PIN.** Approves redemptions, edits rewards and token rules, adjusts tokens, backs up and restores the save.

## Components

| Module | Responsibility |
|---|---|
| `src/math/skills.js` | Pure question generators. `makeQuestion(skillId, level)` → `{prompt, answer, choices?, hint?}` |
| `src/math/engine.js` | Weighted skill selection and level movement on results |
| `src/economy.js` | Coin/token/XP rules and the pet level curve |
| `src/pets.js` | Species, evolution stages, shop catalog, stat decay, mood |
| `src/rewards.js` | Default real-life reward list |
| `src/state.js` | Save/load/migrate; kid profiles |
| `src/main.js` | Screens (profiles, new pet, home, quiz, shop, closet, rewards, progress, parent) and events |

## Data flow

Profile picked → `home` ticks pet stats by elapsed time → `Train` builds a round of 10 via `engine.nextQuestion` → each answer goes through `isCorrect` → `recordResult` mutates skill level/streak → coins and XP added → round end awards tokens → everything persisted on each change.

## Testing

Vitest covers: every skill at every level 150 times (valid prompt, non-NaN answer, choices unique and containing the answer, answer self-validates), answer normalization, level up/down rules, unlock gating, economy math, pet decay and mood.

## Out of scope for v1

Sound effects, multi-device sync, per-kid custom reward lists, timed modes, printable reports.
