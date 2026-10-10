// Species evolve at pet level 5 and 12.
export const EVOLVE_LEVELS = [1, 5, 12];

export const SPECIES = {
  dragon: { name: 'Dragon', stages: ['🐣', '🐲', '🐉'], stageNames: ['Hatchling', 'Drake', 'Elder Dragon'] },
  cat: { name: 'Cat', stages: ['🐱', '🐈', '🐯'], stageNames: ['Kitten', 'Cat', 'Tiger'] },
  dog: { name: 'Dog', stages: ['🐶', '🐕', '🐺'], stageNames: ['Puppy', 'Dog', 'Wolf'] },
  dino: { name: 'Dinosaur', stages: ['🥚', '🦖', '🦕'], stageNames: ['Egg', 'Raptor', 'Titan'] },
  robot: { name: 'Robot', stages: ['🔋', '🤖', '🚀'], stageNames: ['Battery Bot', 'Robo', 'Mega Mech'] },
  unicorn: { name: 'Unicorn', stages: ['🐴', '🦄', '🌈'], stageNames: ['Pony', 'Unicorn', 'Rainbow Unicorn'] },
  fox: { name: 'Fox', stages: ['🦊', '🦊', '🦁'], stageNames: ['Kit', 'Fox', 'King Fox'] },
  owl: { name: 'Owl', stages: ['🐥', '🦉', '🦅'], stageNames: ['Owlet', 'Owl', 'Sky Eagle'] },
};

export function stageIndex(level) {
  if (level >= EVOLVE_LEVELS[2]) return 2;
  if (level >= EVOLVE_LEVELS[1]) return 1;
  return 0;
}

// cat: food | toy | hat | weapon | wings | bg | buddy
export const ITEMS = [
  // food (consumable) -> hunger
  { id: 'apple', name: 'Apple', emoji: '🍎', cat: 'food', price: 10, effect: { hunger: 20 } },
  { id: 'pizza', name: 'Pizza Slice', emoji: '🍕', cat: 'food', price: 25, effect: { hunger: 45 } },
  { id: 'cake', name: 'Birthday Cake', emoji: '🎂', cat: 'food', price: 50, effect: { hunger: 70, happiness: 15 } },
  { id: 'feast', name: 'Royal Feast', emoji: '🍗', cat: 'food', price: 90, effect: { hunger: 100, happiness: 25 } },
  // toys (consumable) -> happiness, costs energy
  { id: 'ball', name: 'Bouncy Ball', emoji: '⚽', cat: 'toy', price: 15, effect: { happiness: 25, energy: -10 } },
  { id: 'kite', name: 'Kite', emoji: '🪁', cat: 'toy', price: 30, effect: { happiness: 45, energy: -15 } },
  { id: 'game', name: 'Video Game', emoji: '🎮', cat: 'toy', price: 60, effect: { happiness: 70, energy: -5 } },
  { id: 'nap', name: 'Cozy Nap', emoji: '🛏️', cat: 'toy', price: 20, effect: { energy: 60 } },
  // hats
  { id: 'cap', name: 'Baseball Cap', emoji: '🧢', cat: 'hat', price: 80 },
  { id: 'tophat', name: 'Top Hat', emoji: '🎩', cat: 'hat', price: 150 },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', cat: 'hat', price: 400 },
  { id: 'wizard', name: 'Wizard Hat', emoji: '🪄', cat: 'hat', price: 300 },
  { id: 'halo', name: 'Halo', emoji: '😇', cat: 'hat', price: 500 },
  { id: 'party', name: 'Party Hat', emoji: '🥳', cat: 'hat', price: 120 },
  // weapons
  { id: 'stick', name: 'Stick', emoji: '🥢', cat: 'weapon', price: 40 },
  { id: 'sword', name: 'Steel Sword', emoji: '🗡️', cat: 'weapon', price: 200 },
  { id: 'axe', name: 'Battle Axe', emoji: '🪓', cat: 'weapon', price: 260 },
  { id: 'bow', name: 'Longbow', emoji: '🏹', cat: 'weapon', price: 300 },
  { id: 'trident', name: 'Trident', emoji: '🔱', cat: 'weapon', price: 450 },
  { id: 'lightsaber', name: 'Laser Sword', emoji: '⚡', cat: 'weapon', price: 700 },
  { id: 'shield', name: 'Shield', emoji: '🛡️', cat: 'weapon', price: 180 },
  // wings / capes
  { id: 'cape', name: 'Hero Cape', emoji: '🦸', cat: 'wings', price: 250 },
  { id: 'feather', name: 'Feather Wings', emoji: '🪶', cat: 'wings', price: 400 },
  { id: 'butterfly', name: 'Butterfly Wings', emoji: '🦋', cat: 'wings', price: 350 },
  { id: 'jet', name: 'Jetpack', emoji: '🚀', cat: 'wings', price: 600 },
  { id: 'fire', name: 'Flame Aura', emoji: '🔥', cat: 'wings', price: 800 },
  // backgrounds
  { id: 'meadow', name: 'Meadow', emoji: '🌳', cat: 'bg', price: 100, css: 'linear-gradient(#8fd3ff, #b8f0a0)' },
  { id: 'beach', name: 'Beach', emoji: '🏖️', cat: 'bg', price: 150, css: 'linear-gradient(#7fd0ff, #ffe9a8)' },
  { id: 'space', name: 'Outer Space', emoji: '🌌', cat: 'bg', price: 300, css: 'linear-gradient(#0b1033, #3a1d6e)' },
  { id: 'castle', name: 'Castle', emoji: '🏰', cat: 'bg', price: 350, css: 'linear-gradient(#c9b7ff, #8e7cc3)' },
  { id: 'volcano', name: 'Volcano', emoji: '🌋', cat: 'bg', price: 450, css: 'linear-gradient(#ff8c42, #5a1a1a)' },
  { id: 'candy', name: 'Candy Land', emoji: '🍭', cat: 'bg', price: 500, css: 'linear-gradient(#ffb3e6, #fff3b0)' },
  // buddies (a little friend that sits next to the pet)
  { id: 'duck', name: 'Rubber Duck', emoji: '🦆', cat: 'buddy', price: 120 },
  { id: 'frog', name: 'Frog Friend', emoji: '🐸', cat: 'buddy', price: 200 },
  { id: 'ghost', name: 'Pet Ghost', emoji: '👻', cat: 'buddy', price: 350 },
  { id: 'alien', name: 'Alien Pal', emoji: '👽', cat: 'buddy', price: 650 },
];

export const CATEGORIES = [
  { id: 'food', name: 'Food', emoji: '🍎' },
  { id: 'toy', name: 'Play & Rest', emoji: '⚽' },
  { id: 'hat', name: 'Hats', emoji: '🎩' },
  { id: 'weapon', name: 'Weapons', emoji: '🗡️' },
  { id: 'wings', name: 'Wings', emoji: '🪶' },
  { id: 'bg', name: 'Worlds', emoji: '🌌' },
  { id: 'buddy', name: 'Buddies', emoji: '🐸' },
];

export const CONSUMABLE = new Set(['food', 'toy']);
export const EQUIP_SLOTS = ['hat', 'weapon', 'wings', 'bg', 'buddy'];

export const itemById = (id) => ITEMS.find((i) => i.id === id);

// Stat decay per hour.
export const DECAY = { hunger: 4, happiness: 3, energy: -3 }; // energy recovers over time

export function newPet(species, name) {
  return {
    species, name, xp: 0,
    hunger: 80, happiness: 80, energy: 80,
    lastTick: Date.now(),
    equipped: { hat: null, weapon: null, wings: null, bg: null, buddy: null },
    inventory: {},
  };
}

const clamp = (v) => Math.max(0, Math.min(100, v));

export function tickPet(pet, now = Date.now()) {
  const hours = (now - (pet.lastTick || now)) / 3_600_000;
  if (hours <= 0) return pet;
  pet.hunger = clamp(pet.hunger - DECAY.hunger * hours);
  pet.happiness = clamp(pet.happiness - DECAY.happiness * hours);
  pet.energy = clamp(pet.energy - DECAY.energy * hours);
  pet.lastTick = now;
  return pet;
}

export function applyEffect(pet, effect) {
  for (const k of ['hunger', 'happiness', 'energy']) {
    if (effect[k]) pet[k] = clamp(pet[k] + effect[k]);
  }
}

export function mood(pet) {
  const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
  if (pet.hunger < 20) return { label: 'Starving', emoji: '😫', bonus: 1 };
  if (avg >= 70) return { label: 'Thriving', emoji: '🤩', bonus: 1.5 };
  if (avg >= 45) return { label: 'Happy', emoji: '😊', bonus: 1.2 };
  if (avg >= 25) return { label: 'Meh', emoji: '😐', bonus: 1 };
  return { label: 'Sad', emoji: '😢', bonus: 1 };
}
