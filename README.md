# Numblings 🐉

A pixel-art creature-raising math game for Jack (grade 1), Luke (grade 3), and Madeline (grade 4).
Every bit of pet care, gear, and monster fighting is paid for with math. Kids earn **coins** (for their creature) and **tokens** (for real-life rewards you approve).

## Quick start

The whole game is one file: `dist/index.html`. Copy it to the home computer, open it in Chrome or Edge, and bookmark it.

```bash
start dist/index.html
```

Development:

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run build      # rebuilds dist/index.html
```

Handy pages on the dev server: `/scripts/sprite-sheet.html` (every sprite) and `/scripts/visuals-gallery.html` (every math picture).

## What the kids see

1. **Pick your name**, hatch a creature (dragon, cat, dog, dino, robot, unicorn, fox, owl), name it.
2. **Train**: 10-question rounds. Correct answers earn coins and XP. Wrong answers show a one-line worked explanation. Finishing a round earns tokens.
3. **Battle**: pick a monster. Every correct answer is an attack (harder questions and better weapons hit harder; streaks combo). Wrong answers let the monster hit back. Winning drops coins and sometimes gear. Bosses unlock as the creature levels up.
4. **Quests**: three new quests every day for bonus tokens.
5. **Shop / My Stuff**: food, toys, hats, weapons, wings, worlds, buddies. Gear shows on the creature.
6. **Rewards**: real-life prizes bought with tokens; requests wait for a parent to approve.
7. **Progress**: skill ladders, badges, daily stats chart.
8. **Ask Pip**: on any question, a help button opens the AI tutor. Kids can type or tap the mic and talk. Pip asks guiding questions and gives hints but never the answer, and reads replies out loud.

## How the math works

18 skills, each a 10-level ladder from late kindergarten (level 1) to grade 6–7 (level 10), built from the Ontario 2020 curriculum and US Common Core. See [docs/curriculum.md](docs/curriculum.md) for the full ladders.

Counting, Addition, Subtraction, Mental Math, Multiplication, Division, Factors & Primes, Place Value, Fractions, Decimals & Percent, Comparing, Patterns & Algebra, Measurement, Time, Money (Canadian coins), Geometry, Data & Probability, Word Problems.

Mastery rules (from how Khan Academy, IXL, and the research on interleaving and worked examples handle it):

- **Level up** when 9 of the last 10 answers at a level are right and the last 5 are all right.
- **One miss** is treated as a slip: a similar question comes back soon.
- **Two misses in five** (or three in ten) is a gap: the level drops by one and the explanation uses the level's visual model.
- About 30% of questions are review from one or two levels below, worth half coins.
- Skills that are behind the kid's June target, rarely practised, or recently missed get picked more often.
- Some skills unlock as prerequisites rise (multiplication after Addition Lv 3, division after Multiplication Lv 3, and so on).

Starting levels and June targets per kid are in the curriculum doc, section B. "Above grade" on the dashboard means at least two levels past where their grade starts.

Many questions come with pictures: ten frames, counters, number lines, base-ten blocks, arrays, fraction bars and circles, analog clocks (some you set by tapping), Canadian coins, rulers, thermometers, shapes, angles, coordinate grids, bar graphs, pictographs, balance scales.

## Economy

| Event | Reward |
|---|---|
| Correct answer | 5 coins + 2 per skill level, ×1.2 or ×1.5 if the creature is happy or thriving; 10 XP |
| Finish a 10-question round | 1 token (+1 if perfect, +1 first round of the day) |
| A skill levels up | +1 token |
| Daily quest | 1–3 tokens each |
| Win a battle | 40–500 coins, chance of gear |

All rates are editable in Parent Mode. Creature stats (food, fun, energy) drain slowly in real time; a neglected creature just looks sad and stops giving the coin bonus. It never blocks play.

## Parent Mode

Launch screen → Parent Mode. **Default PIN is 1234. Change it.**

- Per-kid rounds, accuracy, skills above grade, day streak, coins, tokens; a Details view with the full skill ladder, quests, badges, and a 14-day chart.
- Approve or deny reward requests (deny refunds tokens). Edit the reward list. Adjust token and coin rules. Add or remove tokens by hand.
- **Pip settings**: paste an Anthropic API key, pick a model, toggle voice. The key is stored only in that browser and is left out of backups. Cost is well under a cent per question asked.
- Back up and restore the save file. Reset a kid.

Saves live in the browser's local storage on that computer. Back up occasionally.

## Project layout

- `src/math/skills/*.js` — one file per skill, 10 levels each
- `src/math/skills.js` — registry and answer checking; `src/math/engine.js` — adaptive rules
- `src/visuals/` — SVG math pictures; `src/pixel/` — sprites and canvas rendering
- `src/game.js` — answering, rewards, quests, badges; `src/battle.js`, `src/quests.js`, `src/achievements.js`, `src/economy.js`, `src/pets.js`
- `src/screens/*.js` — one file per screen; `src/main.js` — router
- `src/tutor/tutor.js` — Claude-powered Socratic helper with speech in/out; `src/audio.js` — chiptune sound
- `tests/` — 160+ tests covering every skill at every level, engine rules, sprites, visuals, quests, badges, battle
- `docs/curriculum.md` — research and ladders; `docs/contracts.md` — module interfaces
