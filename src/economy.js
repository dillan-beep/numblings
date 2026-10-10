// Coins = in-game money for the pet. Tokens = real-life rewards (parent redeems).
export const ROUND_SIZE = 10;

export const DEFAULT_RULES = {
  coinsPerCorrect: 5,          // base coins per right answer
  coinsLevelBonus: 2,          // extra coins per skill level above 1
  xpPerCorrect: 10,
  tokensPerRound: 1,           // finishing a 10-question round
  perfectRoundBonus: 1,        // all 10 right
  tokensPerLevelUp: 1,         // a skill levels up
  dailyFirstRoundBonus: 1,     // first round of the day
};

export function coinsForAnswer(rules, level) {
  return rules.coinsPerCorrect + rules.coinsLevelBonus * (level - 1);
}

export function roundTokens(rules, correctCount, levelUps, firstToday) {
  let t = rules.tokensPerRound;
  if (correctCount === ROUND_SIZE) t += rules.perfectRoundBonus;
  t += levelUps * rules.tokensPerLevelUp;
  if (firstToday) t += rules.dailyFirstRoundBonus;
  return t;
}

export function petLevelFromXp(xp) {
  // Level n needs 100 * n * (n+1) / 2 total xp -> gently rising curve.
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}
export function xpForLevel(level) {
  return (100 * (level - 1) * level) / 2;
}
