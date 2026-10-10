// Monster battle rules (pure logic; UI lives in the battle screen).
// Each correct answer = an attack. Wrong answer = the monster strikes back.
import { itemById } from './pets.js';

export const MONSTER_LADDER = [
  { id: 'slime', name: 'Slime', hp: 30, attack: 6, coins: 40, boss: false, minLevel: 1 },
  { id: 'bat', name: 'Cave Bat', hp: 40, attack: 8, coins: 60, boss: false, minLevel: 1 },
  { id: 'mushroom', name: 'Angry Mushroom', hp: 50, attack: 9, coins: 80, boss: false, minLevel: 2 },
  { id: 'skeleton', name: 'Skeleton', hp: 60, attack: 11, coins: 110, boss: false, minLevel: 3 },
  { id: 'ghostking', name: 'Ghost King', hp: 90, attack: 13, coins: 180, boss: true, minLevel: 4 },
  { id: 'robotboss', name: 'Mega Robot', hp: 120, attack: 15, coins: 260, boss: true, minLevel: 6 },
  { id: 'dragonboss', name: 'Shadow Dragon', hp: 150, attack: 18, coins: 360, boss: true, minLevel: 8 },
  { id: 'mathwizard', name: 'The Math Wizard', hp: 200, attack: 22, coins: 500, boss: true, minLevel: 10 },
];

export const WEAPON_POWER = { stick: 2, shield: 0, sword: 5, axe: 6, bow: 6, trident: 8, lightsaber: 12 };

export function availableMonsters(petLevel) {
  return MONSTER_LADDER.filter((m) => m.minLevel <= petLevel);
}

// Pet HP = 50 + 5 per pet level, boosted by energy.
export function petMaxHp(petLevel, energy) {
  return Math.round((50 + petLevel * 5) * (0.6 + 0.4 * (energy / 100)));
}

// Damage from one correct answer. Harder questions hit harder; weapons add power; streaks add a combo.
export function attackDamage({ questionLevel, weaponId, combo }) {
  const base = 8 + questionLevel * 2;
  const weapon = WEAPON_POWER[weaponId] || 0;
  const comboBonus = Math.min(combo, 5) * 2;
  const variance = Math.floor(Math.random() * 5) - 2; // -2..+2
  return Math.max(1, base + weapon + comboBonus + variance);
}

// Damage the monster deals on a wrong answer. Shield halves it.
export function monsterDamage(monster, weaponId) {
  const d = monster.attack + Math.floor(Math.random() * 4);
  return weaponId === 'shield' ? Math.ceil(d / 2) : d;
}

export function newBattle(monster, petLevel, pet) {
  return {
    monsterId: monster.id,
    monsterHp: monster.hp, monsterMax: monster.hp,
    petHp: petMaxHp(petLevel, pet.energy), petMax: petMaxHp(petLevel, pet.energy),
    combo: 0, turns: 0, correct: 0, log: [], over: false, won: false,
  };
}

export function applyAnswer(battle, monster, { ok, questionLevel, weaponId }) {
  battle.turns++;
  if (ok) {
    battle.correct++; battle.combo++;
    const dmg = attackDamage({ questionLevel, weaponId, combo: battle.combo });
    battle.monsterHp = Math.max(0, battle.monsterHp - dmg);
    battle.log.push({ who: 'pet', dmg, combo: battle.combo });
    if (battle.monsterHp === 0) { battle.over = true; battle.won = true; }
    return { dmg, by: 'pet' };
  }
  battle.combo = 0;
  const dmg = monsterDamage(monster, weaponId);
  battle.petHp = Math.max(0, battle.petHp - dmg);
  battle.log.push({ who: 'monster', dmg });
  if (battle.petHp === 0) { battle.over = true; battle.won = false; }
  return { dmg, by: 'monster' };
}

// Loot on a win: coins plus a chance of a random item the pet doesn't own.
export function rollLoot(monster, ownedIds, allItems) {
  const coins = monster.coins;
  const candidates = allItems.filter((i) => !['food', 'toy', 'bg'].includes(i.cat) && !ownedIds.has(i.id) && i.price <= monster.coins * 3);
  const chance = monster.boss ? 0.8 : 0.25;
  const item = candidates.length && Math.random() < chance ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  return { coins, item };
}

export const weaponName = (id) => (id ? itemById(id)?.name : null);
