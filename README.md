# Pet Math 🐾

A digital-pet math game for Jack (grade 1), Luke (grade 3), and Madeline (grade 4).
Kids answer math questions to earn **coins** (for their pet) and **tokens** (for real-life rewards you approve).

## Quick start

Easiest: open `dist/index.html` in Chrome or Edge and bookmark it. That one file is the whole game.

```bash
start dist/index.html
```

Or run the dev server:

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Rebuild the single file after any code change:

```bash
npm run build
```

Run the tests:

```bash
npm test
```

## How it works

**Profiles.** The launch screen shows the three kids. Each kid taps their name, picks a pet species, names it, and plays. No login. All progress saves in the browser on that computer, so always use the same browser.

**Training.** "Train" starts a round of 10 questions. The game picks skills adaptively and leans toward ones the kid has practiced less or missed recently. Each skill has 10 levels:

- Get **5 in a row** right → the skill levels up.
- Miss **3 of the last 6** → the skill levels down (never below 1).
- Starting levels depend on grade. Levels run far past grade level: addition goes to 4-digit sums and decimals, "missing number" turns into real algebra (3x + 2 = x + 10), fractions reach dividing fractions.
- Some skills unlock as prerequisites rise: multiplication needs Addition Lv 3, division needs Multiplication Lv 3, fractions need Division Lv 2, order of operations needs Multiplication Lv 4.

Skills: Addition, Subtraction, Multiplication, Division, Comparing, Place Value, Fractions, Missing Number (algebra), Patterns, Money, Order of Operations, Word Problems, Time.

**Coins (in-game).** Each correct answer earns coins. Harder levels pay more. If the pet is well cared for (Thriving) coins are ×1.5, Happy is ×1.2. Coins buy food, toys, hats, weapons, wings, worlds (backgrounds), and buddies in the Shop.

**Pet.** Food, Fun, and Energy drain slowly over real time (a few points per hour). Feeding and playing restore them. Correct answers give the pet XP. Pets evolve at level 5 and level 12 (for example Hatchling → Drake → Elder Dragon).

**Tokens (real life).** Tokens are earned only by finishing rounds:

| Event | Tokens |
|---|---|
| Finish a 10-question round | 1 |
| Perfect 10/10 | +1 |
| A skill levels up | +1 each |
| First round of the day | +1 |

So a kid earns 1 to 4 tokens per round. All of these rates are editable in Parent Mode.

**Rewards.** The Rewards screen lists real-life prizes with token costs. A kid taps "Get it!", tokens are deducted, and the request shows as pending until a parent approves or denies it (deny refunds the tokens).

## Parent Mode

Tap "Parent Mode" on the launch screen. **Default PIN is 1234. Change it right away** in Settings at the bottom of the dashboard.

From the dashboard you can:

- See each kid's rounds, accuracy, coins, tokens, and per-skill levels.
- Approve or deny pending reward requests.
- Edit the reward list: change costs, delete, or add your own.
- Adjust token and coin rules.
- Add or remove tokens by hand (for example, a bonus for good behaviour).
- Back up the save to a file and restore it later. Do this occasionally. If browser data is ever cleared the save is gone.
- Reset a kid's profile.

## Default reward list

| Tokens | Reward |
|---|---|
| 5 | A piece of candy |
| 5 | A sticker |
| 10 | Pick tonight's dessert |
| 10 | 15 extra minutes of screen time |
| 10 | Extra bedtime story |
| 15 | Stay up 15 minutes later |
| 15 | Pick the music in the car |
| 20 | Pick the family movie |
| 20 | Skip one chore |
| 25 | Breakfast of your choice on Saturday |
| 25 | 30 minutes of a game with Mom or Dad |
| 30 | Pick what's for dinner |
| 35 | Trip to the park or playground |
| 40 | Invite a friend over |
| 50 | Ice cream outing |
| 50 | Stay up 30 minutes late on a weekend |
| 60 | $5 spending money |
| 75 | Pick the restaurant for dinner out |
| 100 | Small toy or LEGO set (about $15) |
| 100 | New book of your choice |
| 110 | $10 spending money |
| 150 | Day out: zoo, trampoline park, or museum |
| 175 | Sleepover with a friend |
| 250 | New video game |
| 400 | Big toy of your choice (about $50) |
| 500 | Something new for your room |
| 750 | A whole special day planned by you |

## Project layout

- `src/math/skills.js` — question generators, 13 skills × 10 levels
- `src/math/engine.js` — adaptive skill picking and level up/down rules
- `src/economy.js` — coin, token, and pet XP rules
- `src/pets.js` — species, evolution, shop items, stat decay
- `src/rewards.js` — default real-life reward list
- `src/state.js` — save/load (localStorage), kid profiles
- `src/main.js` — all screens and UI logic
- `tests/core.test.js` — tests for generators, engine, economy, pets
