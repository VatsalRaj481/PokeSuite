/**
 * Competitive Pokemon Metagame Data & Quiz Scenario Generator
 * Supports Damage Calculator & "Is the Calc Right?" Minigame
 */

export const NATURES = [
  { name: "Hardy", plus: null, minus: null },
  { name: "Lonely", plus: "attack", minus: "defense" },
  { name: "Brave", plus: "attack", minus: "speed" },
  { name: "Adamant", plus: "attack", minus: "special-attack" },
  { name: "Naughty", plus: "attack", minus: "special-defense" },
  { name: "Bold", plus: "defense", minus: "attack" },
  { name: "Docile", plus: null, minus: null },
  { name: "Relaxed", plus: "defense", minus: "speed" },
  { name: "Impish", plus: "defense", minus: "special-attack" },
  { name: "Lax", plus: "defense", minus: "special-defense" },
  { name: "Timid", plus: "speed", minus: "attack" },
  { name: "Hasty", plus: "speed", minus: "defense" },
  { name: "Serious", plus: null, minus: null },
  { name: "Jolly", plus: "speed", minus: "special-attack" },
  { name: "Naive", plus: "speed", minus: "special-defense" },
  { name: "Modest", plus: "special-attack", minus: "attack" },
  { name: "Mild", plus: "special-attack", minus: "defense" },
  { name: "Quiet", plus: "special-attack", minus: "speed" },
  { name: "Bashful", plus: null, minus: null },
  { name: "Rash", plus: "special-attack", minus: "special-defense" },
  { name: "Calm", plus: "special-defense", minus: "attack" },
  { name: "Gentle", plus: "special-defense", minus: "defense" },
  { name: "Sassy", plus: "special-defense", minus: "speed" },
  { name: "Careful", plus: "special-defense", minus: "special-attack" },
  { name: "Quirky", plus: null, minus: null },
];

export const NATURE_STATS = [
  { key: "attack", short: "Atk", label: "Attack", flavor: "Spicy" },
  { key: "defense", short: "Def", label: "Defense", flavor: "Sour" },
  { key: "special-attack", short: "SpA", label: "Sp. Atk", flavor: "Dry" },
  { key: "special-defense", short: "SpD", label: "Sp. Def", flavor: "Bitter" },
  { key: "speed", short: "Spe", label: "Speed", flavor: "Sweet" },
];

/**
 * 5x5 Nature Matrix where:
 * Rows = Increased Stat (+10%)
 * Columns = Decreased Stat (-10%)
 * Diagonals = 5 Neutral Natures
 */
export const NATURE_MATRIX = [
  // Row 0: +Attack (Likes Spicy)
  [
    { name: "Hardy", isNeutral: true, plusKey: "attack", minusKey: "attack", plusShort: "Atk", minusShort: "Atk", plusLabel: "Attack", minusLabel: "Attack", flavorPlus: "Spicy", flavorMinus: "Spicy" },
    { name: "Lonely", isNeutral: false, plusKey: "attack", minusKey: "defense", plusShort: "Atk", minusShort: "Def", plusLabel: "Attack", minusLabel: "Defense", flavorPlus: "Spicy", flavorMinus: "Sour" },
    { name: "Adamant", isNeutral: false, plusKey: "attack", minusKey: "special-attack", plusShort: "Atk", minusShort: "SpA", plusLabel: "Attack", minusLabel: "Sp. Atk", flavorPlus: "Spicy", flavorMinus: "Dry" },
    { name: "Naughty", isNeutral: false, plusKey: "attack", minusKey: "special-defense", plusShort: "Atk", minusShort: "SpD", plusLabel: "Attack", minusLabel: "Sp. Def", flavorPlus: "Spicy", flavorMinus: "Bitter" },
    { name: "Brave", isNeutral: false, plusKey: "attack", minusKey: "speed", plusShort: "Atk", minusShort: "Spe", plusLabel: "Attack", minusLabel: "Speed", flavorPlus: "Spicy", flavorMinus: "Sweet" },
  ],
  // Row 1: +Defense (Likes Sour)
  [
    { name: "Bold", isNeutral: false, plusKey: "defense", minusKey: "attack", plusShort: "Def", minusShort: "Atk", plusLabel: "Defense", minusLabel: "Attack", flavorPlus: "Sour", flavorMinus: "Spicy" },
    { name: "Docile", isNeutral: true, plusKey: "defense", minusKey: "defense", plusShort: "Def", minusShort: "Def", plusLabel: "Defense", minusLabel: "Defense", flavorPlus: "Sour", flavorMinus: "Sour" },
    { name: "Impish", isNeutral: false, plusKey: "defense", minusKey: "special-attack", plusShort: "Def", minusShort: "SpA", plusLabel: "Defense", minusLabel: "Sp. Atk", flavorPlus: "Sour", flavorMinus: "Dry" },
    { name: "Lax", isNeutral: false, plusKey: "defense", minusKey: "special-defense", plusShort: "Def", minusShort: "SpD", plusLabel: "Defense", minusLabel: "Sp. Def", flavorPlus: "Sour", flavorMinus: "Bitter" },
    { name: "Relaxed", isNeutral: false, plusKey: "defense", minusKey: "speed", plusShort: "Def", minusShort: "Spe", plusLabel: "Defense", minusLabel: "Speed", flavorPlus: "Sour", flavorMinus: "Sweet" },
  ],
  // Row 2: +Special Attack (Likes Dry)
  [
    { name: "Modest", isNeutral: false, plusKey: "special-attack", minusKey: "attack", plusShort: "SpA", minusShort: "Atk", plusLabel: "Sp. Atk", minusLabel: "Attack", flavorPlus: "Dry", flavorMinus: "Spicy" },
    { name: "Mild", isNeutral: false, plusKey: "special-attack", minusKey: "defense", plusShort: "SpA", minusShort: "Def", plusLabel: "Sp. Atk", minusLabel: "Defense", flavorPlus: "Dry", flavorMinus: "Sour" },
    { name: "Bashful", isNeutral: true, plusKey: "special-attack", minusKey: "special-attack", plusShort: "SpA", minusShort: "SpA", plusLabel: "Sp. Atk", minusLabel: "Sp. Atk", flavorPlus: "Dry", flavorMinus: "Dry" },
    { name: "Rash", isNeutral: false, plusKey: "special-attack", minusKey: "special-defense", plusShort: "SpA", minusShort: "SpD", plusLabel: "Sp. Atk", minusLabel: "Sp. Def", flavorPlus: "Dry", flavorMinus: "Bitter" },
    { name: "Quiet", isNeutral: false, plusKey: "special-attack", minusKey: "speed", plusShort: "SpA", minusShort: "Spe", plusLabel: "Sp. Atk", minusLabel: "Speed", flavorPlus: "Dry", flavorMinus: "Sweet" },
  ],
  // Row 3: +Special Defense (Likes Bitter)
  [
    { name: "Calm", isNeutral: false, plusKey: "special-defense", minusKey: "attack", plusShort: "SpD", minusShort: "Atk", plusLabel: "Sp. Def", minusLabel: "Attack", flavorPlus: "Bitter", flavorMinus: "Spicy" },
    { name: "Gentle", isNeutral: false, plusKey: "special-defense", minusKey: "defense", plusShort: "SpD", minusShort: "Def", plusLabel: "Sp. Def", minusLabel: "Defense", flavorPlus: "Bitter", flavorMinus: "Sour" },
    { name: "Careful", isNeutral: false, plusKey: "special-defense", minusKey: "special-attack", plusShort: "SpD", minusShort: "SpA", plusLabel: "Sp. Def", minusLabel: "Sp. Atk", flavorPlus: "Bitter", flavorMinus: "Dry" },
    { name: "Quirky", isNeutral: true, plusKey: "special-defense", minusKey: "special-defense", plusShort: "SpD", minusShort: "SpD", plusLabel: "Sp. Def", minusLabel: "Sp. Def", flavorPlus: "Bitter", flavorMinus: "Bitter" },
    { name: "Sassy", isNeutral: false, plusKey: "special-defense", minusKey: "speed", plusShort: "SpD", minusShort: "Spe", plusLabel: "Sp. Def", minusLabel: "Speed", flavorPlus: "Bitter", flavorMinus: "Sweet" },
  ],
  // Row 4: +Speed (Likes Sweet)
  [
    { name: "Timid", isNeutral: false, plusKey: "speed", minusKey: "attack", plusShort: "Spe", minusShort: "Atk", plusLabel: "Speed", minusLabel: "Attack", flavorPlus: "Sweet", flavorMinus: "Spicy" },
    { name: "Hasty", isNeutral: false, plusKey: "speed", minusKey: "defense", plusShort: "Spe", minusShort: "Def", plusLabel: "Speed", minusLabel: "Defense", flavorPlus: "Sweet", flavorMinus: "Sour" },
    { name: "Jolly", isNeutral: false, plusKey: "speed", minusKey: "special-attack", plusShort: "Spe", minusShort: "SpA", plusLabel: "Speed", minusLabel: "Sp. Atk", flavorPlus: "Sweet", flavorMinus: "Dry" },
    { name: "Naive", isNeutral: false, plusKey: "speed", minusKey: "special-defense", plusShort: "Spe", minusShort: "SpD", plusLabel: "Speed", minusLabel: "Sp. Def", flavorPlus: "Sweet", flavorMinus: "Bitter" },
    { name: "Serious", isNeutral: true, plusKey: "speed", minusKey: "speed", plusShort: "Spe", minusShort: "Spe", plusLabel: "Speed", minusLabel: "Speed", flavorPlus: "Sweet", flavorMinus: "Sweet" },
  ],
];

export const COMPETITIVE_ITEMS = [
  { name: "None", description: "No item held" },
  { name: "Life Orb", description: "Boosts move damage by 30% at the cost of 10% HP" },
  { name: "Choice Band", description: "Boosts physical Attack by 50% but locks move" },
  { name: "Choice Specs", description: "Boosts Special Attack by 50% but locks move" },
  { name: "Choice Scarf", description: "Boosts Speed by 50% but locks move" },
  { name: "Assault Vest", description: "Boosts Special Defense by 50% but prevents status moves" },
  { name: "Eviolite", description: "Boosts Defense & Sp. Def by 50% for unevolved Pokémon" },
  { name: "Focus Sash", description: "Survives any single hit from full HP with 1 HP" },
  { name: "Leftovers", description: "Restores 1/16th of maximum HP at end of turn" },
  { name: "Expert Belt", description: "Boosts super-effective damage by 20%" },
  { name: "Booster Energy", description: "Activates Protosynthesis / Quark Drive" },
  { name: "Heavy-Duty Boots", description: "Prevents hazard damage upon switching in" },
  { name: "Sitrus Berry", description: "Restores 25% max HP when falling below 50% HP" },
  { name: "Weakness Policy", description: "+2 Attack & +2 Sp. Atk when hit by a super-effective move" },
];

export const COMPETITIVE_ABILITIES = [
  "None",
  "Huge Power",
  "Pure Power",
  "Multiscale",
  "Shadow Shield",
  "Unaware",
  "Fluffy",
  "Fur Coat",
  "Thick Fat",
  "Guts",
  "Adaptability",
  "Protosynthesis",
  "Quark Drive",
  "Tablets of Ruin",
  "Sword of Ruin",
  "Vessel of Ruin",
  "Beads of Ruin",
  "Supreme Overlord",
  "Flash Fire",
  "Water Absorb",
  "Volt Absorb",
  "Levitate",
  "Earth Eater",
];

export const EV_PRESETS = [
  { label: "Max Atk / Max Spe (252 / 252)", evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 } },
  { label: "Max SpA / Max Spe (252 / 252)", evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 } },
  { label: "Bulky Physical (252 HP / 252 Def)", evs: { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 } },
  { label: "Bulky Special (252 HP / 252 SpD)", evs: { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 } },
  { label: "Bulky Attacker (252 HP / 252 Atk)", evs: { hp: 252, attack: 252, defense: 4, "special-attack": 0, "special-defense": 0, speed: 0 } },
  { label: "Blank (All 0)", evs: { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 } },
];

/**
 * Curated authentic competitive battle scenarios for the "Is the Calc Right?" minigame.
 * Each scenario tests deep mechanics: weather, terrain, items, status, abilities, or stat spreads.
 */
export const BATTLE_QUIZ_SCENARIOS = [
  {
    id: "kyogre-ferrothorn",
    title: "The Rain Titan vs The Steel Thorn",
    attacker: {
      name: "Kyogre",
      id: 382,
      types: ["water"],
      level: 50,
      nature: "Modest",
      ability: "Drizzle",
      item: "Choice Specs",
      status: "healthy",
      isTera: false,
      teraType: "water",
      evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
      baseStats: { hp: 100, attack: 100, defense: 90, "special-attack": 150, "special-defense": 140, speed: 90 },
    },
    defender: {
      name: "Ferrothorn",
      id: 598,
      types: ["grass", "steel"],
      level: 50,
      nature: "Careful",
      ability: "Iron Barbs",
      item: "Leftovers",
      status: "healthy",
      isTera: false,
      teraType: "grass",
      evs: { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
      baseStats: { hp: 74, attack: 94, defense: 131, "special-attack": 54, "special-defense": 116, speed: 20 },
    },
    move: { name: "Water Spout", type: "water", power: 150, category: "special", isContact: false },
    field: { weather: "rain", terrain: "none", isDoubles: false },
    explanation: "Even resisted 4x by Grass/Steel, 252+ SpA Choice Specs Rain-boosted 150 BP Water Spout deals devastating raw neutral damage! However, Ferrothorn's immense Sp. Def investment allows it to survive a single hit.",
  },
  {
    id: "urshifu-corviknight",
    title: "Close Combat into the Iron Bird",
    attacker: {
      name: "Urshifu",
      id: 892,
      types: ["fighting", "dark"],
      level: 50,
      nature: "Adamant",
      ability: "Unseen Fist",
      item: "Choice Band",
      status: "healthy",
      isTera: false,
      teraType: "fighting",
      evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
      baseStats: { hp: 100, attack: 130, defense: 100, "special-attack": 63, "special-defense": 60, speed: 97 },
    },
    defender: {
      name: "Corviknight",
      id: 823,
      types: ["flying", "steel"],
      level: 50,
      nature: "Impish",
      ability: "Mirror Armor",
      item: "Leftovers",
      status: "healthy",
      isTera: false,
      teraType: "flying",
      evs: { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
      baseStats: { hp: 98, attack: 87, defense: 105, "special-attack": 53, "special-defense": 85, speed: 67 },
    },
    move: { name: "Close Combat", type: "fighting", power: 120, category: "physical", isContact: true },
    field: { weather: "none", terrain: "none", isDoubles: false },
    explanation: "Close Combat hits Corviknight for neutral damage (Fighting is super effective vs Steel, but resisted by Flying). With 252+ Def Impish and max HP, Corviknight reliably survives and avoids a 2HKO with Leftovers recovery.",
  },
  {
    id: "chiyu-dondozo",
    title: "The Goldfish Melting the Titan in Sun",
    attacker: {
      name: "Chi-Yu",
      id: 1004,
      types: ["dark", "fire"],
      level: 50,
      nature: "Modest",
      ability: "Beads of Ruin",
      item: "Choice Specs",
      status: "healthy",
      isTera: true,
      teraType: "fire",
      evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
      baseStats: { hp: 55, attack: 80, defense: 80, "special-attack": 135, "special-defense": 120, speed: 100 },
    },
    defender: {
      name: "Dondozo",
      id: 977,
      types: ["water"],
      level: 50,
      nature: "Careful",
      ability: "Unaware",
      item: "Leftovers",
      status: "healthy",
      isTera: false,
      teraType: "water",
      evs: { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
      baseStats: { hp: 150, attack: 100, defense: 115, "special-attack": 65, "special-defense": 65, speed: 35 },
    },
    move: { name: "Overheat", type: "fire", power: 130, category: "special", isContact: false },
    field: { weather: "sun", terrain: "none", isDoubles: false },
    explanation: "Even though Water resists Fire, Tera Fire Choice Specs Chi-Yu in Harhs Sunlight with Beads of Ruin (-25% SpD) outputs so much astronomical damage that even Dondozo's 150 base HP can be clean OHKO'd!",
  },
  {
    id: "garchomp-multiscale-dragonite",
    title: "Outrage into Multiscale Dragonite",
    attacker: {
      name: "Garchomp",
      id: 445,
      types: ["dragon", "ground"],
      level: 50,
      nature: "Jolly",
      ability: "Rough Skin",
      item: "Life Orb",
      status: "healthy",
      isTera: false,
      teraType: "dragon",
      evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
      baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
    },
    defender: {
      name: "Dragonite",
      id: 149,
      types: ["dragon", "flying"],
      level: 50,
      nature: "Adamant",
      ability: "Multiscale",
      item: "Heavy-Duty Boots",
      status: "healthy",
      isTera: false,
      teraType: "normal",
      currentHpPercent: 100,
      evs: { hp: 252, attack: 252, defense: 4, "special-attack": 0, "special-defense": 0, speed: 0 },
      baseStats: { hp: 91, attack: 134, defense: 95, "special-attack": 100, "special-defense": 100, speed: 80 },
    },
    move: { name: "Outrage", type: "dragon", power: 120, category: "physical", isContact: true },
    field: { weather: "none", terrain: "none", isDoubles: false },
    explanation: "Dragon is super effective against Dragonite, but Multiscale halves all damage taken at 100% HP. Dragonite comfortably tanks Garchomp's Life Orb Outrage!",
  },
  {
    id: "garchomp-corviknight-sun",
    title: "Burned Fire Fang into Corviknight in Sun",
    attacker: {
      name: "Garchomp",
      id: 445,
      types: ["dragon", "ground"],
      level: 50,
      nature: "Jolly",
      ability: "Rough Skin",
      item: "None",
      status: "burn",
      isTera: false,
      teraType: "dragon",
      evs: { hp: 0, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
      baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
    },
    defender: {
      name: "Corviknight",
      id: 823,
      types: ["flying", "steel"],
      level: 50,
      nature: "Impish",
      ability: "Pressure",
      item: "Leftovers",
      status: "healthy",
      isTera: false,
      teraType: "flying",
      evs: { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
      baseStats: { hp: 98, attack: 87, defense: 105, "special-attack": 53, "special-defense": 85, speed: 67 },
    },
    move: { name: "Fire Fang", type: "fire", power: 65, category: "physical", isContact: true },
    field: { weather: "sun", terrain: "none", isDoubles: false },
    explanation: "Although Harsh Sunlight boosts Fire by 1.5x and Fire Fang is super effective against Corviknight's Steel typing, the 50% physical Attack reduction from Burn (which Garchomp is susceptible to, unlike Fire-types) combined with Corviknight's massive physical Defense means Corviknight easily survives and takes under 25% damage!",
  },
  {
    id: "flutter-mane-ting-lu",
    title: "Moonblast vs The Vessel of Ruin",
    attacker: {
      name: "Flutter Mane",
      id: 987,
      types: ["ghost", "fairy"],
      level: 50,
      nature: "Timid",
      ability: "Protosynthesis",
      item: "Choice Specs",
      status: "healthy",
      isTera: true,
      teraType: "fairy",
      evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
      baseStats: { hp: 55, attack: 55, defense: 55, "special-attack": 135, "special-defense": 135, speed: 135 },
    },
    defender: {
      name: "Ting-Lu",
      id: 1003,
      types: ["dark", "ground"],
      level: 50,
      nature: "Careful",
      ability: "Vessel of Ruin",
      item: "Assault Vest",
      status: "healthy",
      isTera: false,
      teraType: "poison",
      evs: { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
      baseStats: { hp: 155, attack: 110, defense: 125, "special-attack": 55, "special-defense": 80, speed: 45 },
    },
    move: { name: "Moonblast", type: "fairy", power: 95, category: "special", isContact: false },
    field: { weather: "none", terrain: "none", isDoubles: false },
    explanation: "Fairy is super effective against Dark, but Ting-Lu is the tankiest special sponge in the entire game: 155 HP, Assault Vest (+50% SpD), and Vessel of Ruin (-25% opponent SpA) easily absorbs even Choice Specs Tera Fairy Moonblast!",
  },
];

/**
 * Competitive Gen 9 Metagame Threats Pool for Infinite Procedural Scenario Generation
 */
export const COMPETITIVE_THREATS = [
  {
    name: "Flutter Mane",
    id: 987,
    types: ["ghost", "fairy"],
    nature: "Timid",
    ability: "Protosynthesis",
    items: ["Choice Specs", "Booster Energy", "Life Orb", "Focus Sash"],
    teraTypes: ["fairy", "ghost"],
    evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
    baseStats: { hp: 55, attack: 55, defense: 55, "special-attack": 135, "special-defense": 135, speed: 135 },
    moves: [
      { name: "Moonblast", type: "fairy", power: 95, category: "special", isContact: false },
      { name: "Shadow Ball", type: "ghost", power: 80, category: "special", isContact: false },
      { name: "Power Gem", type: "rock", power: 80, category: "special", isContact: false },
    ],
  },
  {
    name: "Chi-Yu",
    id: 1004,
    types: ["dark", "fire"],
    nature: "Modest",
    ability: "Beads of Ruin",
    items: ["Choice Specs", "Life Orb", "Choice Scarf"],
    teraTypes: ["fire", "dark"],
    evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
    baseStats: { hp: 55, attack: 80, defense: 80, "special-attack": 135, "special-defense": 120, speed: 100 },
    moves: [
      { name: "Overheat", type: "fire", power: 130, category: "special", isContact: false },
      { name: "Flamethrower", type: "fire", power: 90, category: "special", isContact: false },
      { name: "Dark Pulse", type: "dark", power: 80, category: "special", isContact: false },
    ],
  },
  {
    name: "Urshifu",
    id: 892,
    types: ["fighting", "water"],
    nature: "Adamant",
    ability: "Unseen Fist",
    items: ["Choice Band", "Life Orb", "Focus Sash"],
    teraTypes: ["water", "fighting"],
    evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    baseStats: { hp: 100, attack: 130, defense: 100, "special-attack": 63, "special-defense": 60, speed: 97 },
    moves: [
      { name: "Surging Strikes", type: "water", power: 75, category: "physical", isContact: true },
      { name: "Close Combat", type: "fighting", power: 120, category: "physical", isContact: true },
      { name: "Aqua Jet", type: "water", power: 40, category: "physical", isContact: true },
    ],
  },
  {
    name: "Chien-Pao",
    id: 1002,
    types: ["dark", "ice"],
    nature: "Jolly",
    ability: "Sword of Ruin",
    items: ["Focus Sash", "Life Orb", "Choice Band"],
    teraTypes: ["ice", "dark", "ghost"],
    evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    baseStats: { hp: 80, attack: 120, defense: 80, "special-attack": 90, "special-defense": 65, speed: 135 },
    moves: [
      { name: "Icicle Crash", type: "ice", power: 85, category: "physical", isContact: true },
      { name: "Sacred Sword", type: "fighting", power: 90, category: "physical", isContact: true },
      { name: "Sucker Punch", type: "dark", power: 70, category: "physical", isContact: true },
    ],
  },
  {
    name: "Great Tusk",
    id: 984,
    types: ["ground", "fighting"],
    nature: "Adamant",
    ability: "Protosynthesis",
    items: ["Booster Energy", "Choice Band", "Leftovers"],
    teraTypes: ["ground", "fighting", "ice"],
    evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    baseStats: { hp: 115, attack: 131, defense: 131, "special-attack": 53, "special-defense": 53, speed: 87 },
    moves: [
      { name: "Headlong Rush", type: "ground", power: 120, category: "physical", isContact: true },
      { name: "Close Combat", type: "fighting", power: 120, category: "physical", isContact: true },
      { name: "Knock Off", type: "dark", power: 65, category: "physical", isContact: true },
      { name: "Earthquake", type: "ground", power: 100, category: "physical", isContact: false },
    ],
  },
  {
    name: "Kingambit",
    id: 983,
    types: ["dark", "steel"],
    nature: "Adamant",
    ability: "Supreme Overlord",
    items: ["Leftovers", "Life Orb", "Assault Vest"],
    teraTypes: ["dark", "flying", "fairy"],
    evs: { hp: 252, attack: 252, defense: 4, "special-attack": 0, "special-defense": 0, speed: 0 },
    baseStats: { hp: 100, attack: 135, defense: 120, "special-attack": 60, "special-defense": 85, speed: 50 },
    moves: [
      { name: "Kowtow Cleave", type: "dark", power: 85, category: "physical", isContact: true },
      { name: "Iron Head", type: "steel", power: 80, category: "physical", isContact: true },
      { name: "Sucker Punch", type: "dark", power: 70, category: "physical", isContact: true },
    ],
  },
  {
    name: "Garchomp",
    id: 445,
    types: ["dragon", "ground"],
    nature: "Jolly",
    ability: "Rough Skin",
    items: ["Life Orb", "Choice Band", "Leftovers"],
    teraTypes: ["ground", "dragon", "fire"],
    evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
    moves: [
      { name: "Earthquake", type: "ground", power: 100, category: "physical", isContact: false },
      { name: "Outrage", type: "dragon", power: 120, category: "physical", isContact: true },
      { name: "Dragon Claw", type: "dragon", power: 80, category: "physical", isContact: true },
      { name: "Fire Fang", type: "fire", power: 65, category: "physical", isContact: true },
    ],
  },
  {
    name: "Miraidon",
    id: 1008,
    types: ["electric", "dragon"],
    nature: "Modest",
    ability: "Hadron Engine",
    items: ["Choice Specs", "Life Orb", "Choice Scarf"],
    teraTypes: ["electric", "dragon", "fairy"],
    evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
    baseStats: { hp: 100, attack: 85, defense: 100, "special-attack": 135, "special-defense": 115, speed: 135 },
    moves: [
      { name: "Electro Drift", type: "electric", power: 100, category: "special", isContact: false },
      { name: "Draco Meteor", type: "dragon", power: 130, category: "special", isContact: false },
      { name: "Volt Switch", type: "electric", power: 70, category: "special", isContact: false },
      { name: "Dazzling Gleam", type: "fairy", power: 80, category: "special", isContact: false },
    ],
  },
  {
    name: "Koraidon",
    id: 1007,
    types: ["fighting", "dragon"],
    nature: "Adamant",
    ability: "Orichalcum Pulse",
    items: ["Choice Band", "Life Orb", "Clear Amulet"],
    teraTypes: ["fighting", "fire", "dragon"],
    evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    baseStats: { hp: 100, attack: 135, defense: 115, "special-attack": 85, "special-defense": 100, speed: 135 },
    moves: [
      { name: "Collision Course", type: "fighting", power: 100, category: "physical", isContact: true },
      { name: "Flare Blitz", type: "fire", power: 120, category: "physical", isContact: true },
      { name: "Outrage", type: "dragon", power: 120, category: "physical", isContact: true },
      { name: "Low Kick", type: "fighting", power: 100, category: "physical", isContact: true },
    ],
  },
  {
    name: "Kyogre",
    id: 382,
    types: ["water"],
    nature: "Modest",
    ability: "Drizzle",
    items: ["Choice Specs", "Leftovers", "Life Orb"],
    teraTypes: ["water", "grass"],
    evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
    baseStats: { hp: 100, attack: 100, defense: 90, "special-attack": 150, "special-defense": 140, speed: 90 },
    moves: [
      { name: "Water Spout", type: "water", power: 150, category: "special", isContact: false },
      { name: "Origin Pulse", type: "water", power: 110, category: "special", isContact: false },
      { name: "Ice Beam", type: "ice", power: 90, category: "special", isContact: false },
      { name: "Thunder", type: "electric", power: 110, category: "special", isContact: false },
    ],
  },
  {
    name: "Gholdengo",
    id: 1000,
    types: ["steel", "ghost"],
    nature: "Modest",
    ability: "Good as Gold",
    items: ["Choice Specs", "Life Orb", "Air Balloon"],
    teraTypes: ["steel", "ghost", "fighting"],
    evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
    baseStats: { hp: 87, attack: 60, defense: 95, "special-attack": 133, "special-defense": 91, speed: 84 },
    moves: [
      { name: "Make It Rain", type: "steel", power: 120, category: "special", isContact: false },
      { name: "Shadow Ball", type: "ghost", power: 80, category: "special", isContact: false },
      { name: "Thunderbolt", type: "electric", power: 90, category: "special", isContact: false },
      { name: "Focus Blast", type: "fighting", power: 120, category: "special", isContact: false },
    ],
  },
  {
    name: "Iron Bundle",
    id: 991,
    types: ["ice", "water"],
    nature: "Timid",
    ability: "Quark Drive",
    items: ["Booster Energy", "Choice Specs", "Focus Sash"],
    teraTypes: ["ice", "water"],
    evs: { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 },
    baseStats: { hp: 56, attack: 80, defense: 114, "special-attack": 124, "special-defense": 60, speed: 136 },
    moves: [
      { name: "Freeze-Dry", type: "ice", power: 70, category: "special", isContact: false },
      { name: "Hydro Pump", type: "water", power: 110, category: "special", isContact: false },
      { name: "Ice Beam", type: "ice", power: 90, category: "special", isContact: false },
    ],
  },
  {
    name: "Rillaboom",
    id: 812,
    types: ["grass"],
    nature: "Adamant",
    ability: "Grassy Surge",
    items: ["Choice Band", "Assault Vest", "Life Orb"],
    teraTypes: ["grass", "fire"],
    evs: { hp: 252, attack: 252, defense: 0, "special-attack": 0, "special-defense": 4, speed: 0 },
    baseStats: { hp: 100, attack: 125, defense: 90, "special-attack": 60, "special-defense": 70, speed: 85 },
    moves: [
      { name: "Wood Hammer", type: "grass", power: 120, category: "physical", isContact: true },
      { name: "Grassy Glide", type: "grass", power: 60, category: "physical", isContact: true },
      { name: "High Horsepower", type: "ground", power: 95, category: "physical", isContact: true },
    ],
  },
  {
    name: "Incineroar",
    id: 727,
    types: ["fire", "dark"],
    nature: "Adamant",
    ability: "Intimidate",
    items: ["Sitrus Berry", "Assault Vest", "Safety Goggles"],
    teraTypes: ["grass", "ghost", "water"],
    evs: { hp: 252, attack: 156, defense: 0, "special-attack": 0, "special-defense": 100, speed: 0 },
    baseStats: { hp: 95, attack: 115, defense: 90, "special-attack": 80, "special-defense": 90, speed: 60 },
    moves: [
      { name: "Flare Blitz", type: "fire", power: 120, category: "physical", isContact: true },
      { name: "Knock Off", type: "dark", power: 65, category: "physical", isContact: true },
      { name: "Close Combat", type: "fighting", power: 120, category: "physical", isContact: true },
    ],
  },
];

/**
 * Competitive Gen 9 Metagame Defensive Walls Pool
 */
export const COMPETITIVE_WALLS = [
  {
    name: "Corviknight",
    id: 823,
    types: ["flying", "steel"],
    nature: "Impish",
    ability: "Mirror Armor",
    items: ["Leftovers", "Rocky Helmet"],
    teraTypes: ["flying", "dragon", "water"],
    baseStats: { hp: 98, attack: 87, defense: 105, "special-attack": 53, "special-defense": 85, speed: 67 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
      { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
    ],
  },
  {
    name: "Ting-Lu",
    id: 1003,
    types: ["dark", "ground"],
    nature: "Careful",
    ability: "Vessel of Ruin",
    items: ["Leftovers", "Assault Vest"],
    teraTypes: ["poison", "steel", "water"],
    baseStats: { hp: 155, attack: 110, defense: 125, "special-attack": 55, "special-defense": 80, speed: 45 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
    ],
  },
  {
    name: "Dondozo",
    id: 977,
    types: ["water"],
    nature: "Careful",
    ability: "Unaware",
    items: ["Leftovers", "Sitrus Berry"],
    teraTypes: ["grass", "dragon", "steel"],
    baseStats: { hp: 150, attack: 100, defense: 115, "special-attack": 65, "special-defense": 65, speed: 35 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
    ],
  },
  {
    name: "Ferrothorn",
    id: 598,
    types: ["grass", "steel"],
    nature: "Careful",
    ability: "Iron Barbs",
    items: ["Leftovers", "Rocky Helmet"],
    teraTypes: ["water", "fire"],
    baseStats: { hp: 74, attack: 94, defense: 131, "special-attack": 54, "special-defense": 116, speed: 20 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 88, "special-attack": 0, "special-defense": 168, speed: 0 },
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
    ],
  },
  {
    name: "Garganacl",
    id: 981,
    types: ["rock"],
    nature: "Careful",
    ability: "Purifying Salt",
    items: ["Leftovers", "Covert Cloak"],
    teraTypes: ["water", "ghost", "fairy"],
    baseStats: { hp: 100, attack: 100, defense: 130, "special-attack": 45, "special-defense": 90, speed: 35 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 156, "special-attack": 0, "special-defense": 100, speed: 0 },
    ],
  },
  {
    name: "Clodsire",
    id: 980,
    types: ["poison", "ground"],
    nature: "Careful",
    ability: "Unaware",
    items: ["Leftovers", "Black Sludge"],
    teraTypes: ["dark", "steel", "water"],
    baseStats: { hp: 130, attack: 75, defense: 60, "special-attack": 45, "special-defense": 100, speed: 20 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
    ],
  },
  {
    name: "Toxapex",
    id: 748,
    types: ["poison", "water"],
    nature: "Bold",
    ability: "Regenerator",
    items: ["Black Sludge", "Leftovers", "Rocky Helmet"],
    teraTypes: ["grass", "steel", "fairy"],
    baseStats: { hp: 50, attack: 63, defense: 152, "special-attack": 53, "special-defense": 142, speed: 35 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
      { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 },
    ],
  },
  {
    name: "Blissey",
    id: 242,
    types: ["normal"],
    nature: "Bold",
    ability: "Natural Cure",
    items: ["Heavy-Duty Boots", "Leftovers"],
    teraTypes: ["ghost", "steel", "fairy"],
    baseStats: { hp: 255, attack: 10, defense: 10, "special-attack": 75, "special-defense": 135, speed: 55 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
    ],
  },
  {
    name: "Dragonite",
    id: 149,
    types: ["dragon", "flying"],
    nature: "Adamant",
    ability: "Multiscale",
    items: ["Heavy-Duty Boots", "Lum Berry"],
    teraTypes: ["normal", "steel", "flying"],
    baseStats: { hp: 91, attack: 134, defense: 95, "special-attack": 100, "special-defense": 100, speed: 80 },
    evsOptions: [
      { hp: 252, attack: 4, defense: 252, "special-attack": 0, "special-defense": 0, speed: 0 },
    ],
  },
  {
    name: "Skeledirge",
    id: 911,
    types: ["fire", "ghost"],
    nature: "Bold",
    ability: "Unaware",
    items: ["Heavy-Duty Boots", "Leftovers"],
    teraTypes: ["fairy", "water", "normal"],
    baseStats: { hp: 104, attack: 75, defense: 100, "special-attack": 110, "special-defense": 75, speed: 66 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
    ],
  },
  {
    name: "Landorus-Therian",
    id: 645,
    types: ["ground", "flying"],
    nature: "Impish",
    ability: "Intimidate",
    items: ["Leftovers", "Rocky Helmet"],
    teraTypes: ["water", "steel", "flying"],
    baseStats: { hp: 89, attack: 145, defense: 90, "special-attack": 105, "special-defense": 80, speed: 91 },
    evsOptions: [
      { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 },
    ],
  },
  {
    name: "Gliscor",
    id: 472,
    types: ["ground", "flying"],
    nature: "Impish",
    ability: "Poison Heal",
    items: ["Toxic Orb"],
    teraTypes: ["water", "normal", "steel"],
    baseStats: { hp: 75, attack: 95, defense: 125, "special-attack": 45, "special-defense": 75, speed: 95 },
    evsOptions: [
      { hp: 244, attack: 0, defense: 244, "special-attack": 0, "special-defense": 0, speed: 20 },
    ],
  },
];

/**
 * Procedurally generates an infinite, authentic Gen 9 competitive scenario
 * Computes deep mechanics (Tera, Weather, Terrain, Items, Immunities, EVs) dynamically.
 *
 * @param {Function} [calculateDamageFn] Optional calculateDamage reference to dynamically build analysis
 * @returns {Object} Scenario object matching BATTLE_QUIZ_SCENARIOS schema
 */
export function generateProceduralScenario(calculateDamageFn) {
  // 1. Pick Attacker
  const attackerTemplate = COMPETITIVE_THREATS[Math.floor(Math.random() * COMPETITIVE_THREATS.length)];

  // 2. Pick Defender (different species)
  let defenderTemplate;
  do {
    defenderTemplate = COMPETITIVE_WALLS[Math.floor(Math.random() * COMPETITIVE_WALLS.length)];
  } while (defenderTemplate.name === attackerTemplate.name);

  // 3. Pick Move
  const move = attackerTemplate.moves[Math.floor(Math.random() * attackerTemplate.moves.length)];

  // 4. Attacker setup
  const attackerItem = attackerTemplate.items[Math.floor(Math.random() * attackerTemplate.items.length)];
  const isAttackerTera = Math.random() < 0.25;
  const attackerTera = attackerTemplate.teraTypes[Math.floor(Math.random() * attackerTemplate.teraTypes.length)];

  // Attacker status respecting immunities (Fire can't be burned!)
  let attackerStatus = "healthy";
  if (
    Math.random() < 0.15 &&
    move.category === "physical" &&
    !attackerTemplate.types.includes("fire") &&
    (!isAttackerTera || attackerTera !== "fire")
  ) {
    attackerStatus = "burn";
  }

  // 5. Defender setup
  const defenderItem = defenderTemplate.items[Math.floor(Math.random() * defenderTemplate.items.length)];
  const isDefenderTera = Math.random() < 0.20;
  const defenderTera = defenderTemplate.teraTypes[Math.floor(Math.random() * defenderTemplate.teraTypes.length)];
  const defenderEvs = defenderTemplate.evsOptions[Math.floor(Math.random() * defenderTemplate.evsOptions.length)];

  // 6. Field Environment
  let weather = "none";
  let terrain = "none";

  if (attackerTemplate.ability === "Drizzle") weather = "rain";
  else if (attackerTemplate.ability === "Orichalcum Pulse") weather = "sun";
  else if (attackerTemplate.ability === "Hadron Engine") terrain = "electric";
  else if (attackerTemplate.ability === "Grassy Surge") terrain = "grassy";
  else {
    const fieldRoll = Math.random();
    if (fieldRoll < 0.15 && move.type === "water") weather = "rain";
    else if (fieldRoll < 0.30 && move.type === "fire") weather = "sun";
    else if (fieldRoll < 0.40 && move.type === "electric") terrain = "electric";
    else if (fieldRoll < 0.50 && move.type === "grass") terrain = "grassy";
    else if (fieldRoll < 0.58 && move.type === "psychic") terrain = "psychic";
    else if (fieldRoll < 0.65 && (move.type === "ice" || defenderTemplate.types.includes("ice"))) weather = "snow";
    else if (fieldRoll < 0.72 && (defenderTemplate.types.includes("rock") || defenderTemplate.types.includes("ground"))) weather = "sand";
  }

  const attacker = {
    name: attackerTemplate.name,
    id: attackerTemplate.id,
    types: attackerTemplate.types,
    level: 50,
    nature: attackerTemplate.nature,
    ability: attackerTemplate.ability,
    item: attackerItem,
    status: attackerStatus,
    isTera: isAttackerTera,
    teraType: attackerTera,
    evs: attackerTemplate.evs,
    baseStats: attackerTemplate.baseStats,
  };

  const defender = {
    name: defenderTemplate.name,
    id: defenderTemplate.id,
    types: defenderTemplate.types,
    level: 50,
    nature: defenderTemplate.nature,
    ability: defenderTemplate.ability,
    item: defenderItem,
    status: "healthy",
    isTera: isDefenderTera,
    teraType: defenderTera,
    evs: defenderEvs,
    baseStats: defenderTemplate.baseStats,
  };

  const field = { weather, terrain, isDoubles: false };

  // Calculate damage analysis if function provided
  let explanation = `${attacker.name} strikes ${defender.name} with ${move.name} (${move.power} BP ${move.category}). `;
  if (typeof calculateDamageFn === "function") {
    const calc = calculateDamageFn({ attacker, defender, move, field, isCrit: false });
    if (calc.effectiveness > 1) {
      explanation += `Hits super effectively (${calc.effectiveness}x)! `;
    } else if (calc.effectiveness === 0) {
      explanation += `Has zero effect due to type/ability immunity! `;
    } else if (calc.effectiveness < 1) {
      explanation += `Hits resisted (${calc.effectiveness}x). `;
    }

    if (attacker.item && attacker.item !== "None") {
      if (attacker.item === "Choice Specs") explanation += "Choice Specs amplifies SpA by 1.5x. ";
      else if (attacker.item === "Choice Band") explanation += "Choice Band amplifies Atk by 1.5x. ";
      else if (attacker.item === "Life Orb") explanation += "Life Orb boosts power by 1.3x. ";
      else if (attacker.item === "Booster Energy") explanation += `${attacker.ability} activated by Booster Energy (+30%). `;
    }

    if (attacker.status === "burn") {
      explanation += "Burn cuts physical damage output in half (50%)! ";
    }

    if (attacker.isTera) {
      explanation += `Attacker Terastallized into ${attacker.teraType.toUpperCase()}! `;
    }

    if (defender.isTera) {
      explanation += `Defender Terastallized into defensive ${defender.teraType.toUpperCase()}! `;
    }

    if (weather !== "none") {
      if (weather === "sun" && move.type === "fire") explanation += "Sun boosts Fire by 1.5x. ";
      else if (weather === "rain" && move.type === "water") explanation += "Rain boosts Water by 1.5x. ";
      else if (weather === "rain" && move.type === "fire") explanation += "Rain weakens Fire by 50%. ";
      else if (weather === "sun" && move.type === "water") explanation += "Sun weakens Water by 50%. ";
    }

    if (terrain !== "none") {
      if (terrain === "electric" && move.type === "electric") explanation += "Electric Terrain amplifies Electric by 1.3x. ";
      else if (terrain === "grassy" && move.type === "grass") explanation += "Grassy Terrain amplifies Grass by 1.3x. ";
    }

    if (defender.item === "Assault Vest") {
      explanation += "Defender's Assault Vest raises SpD by 50%. ";
    }

    if (defender.ability === "Multiscale") {
      explanation += "Multiscale halves damage at full HP! ";
    } else if (defender.ability === "Unaware") {
      explanation += "Unaware ignores stat stages! ";
    } else if (defender.ability === "Vessel of Ruin") {
      explanation += "Vessel of Ruin dampens SpA by 25%! ";
    } else if (attacker.ability === "Beads of Ruin") {
      explanation += "Beads of Ruin drops target SpD by 25%! ";
    } else if (attacker.ability === "Sword of Ruin") {
      explanation += "Sword of Ruin drops target Def by 25%! ";
    }

    explanation += `Outcome: ${calc.minDamage} - ${calc.maxDamage} HP (${calc.minPercent}% - ${calc.maxPercent}%) -> ${calc.koVerdict}.`;
  }

  const title = `${attacker.name} vs ${defender.name}`;

  return {
    id: `proc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title,
    attacker,
    defender,
    move,
    field,
    explanation,
  };
}

/**
 * Curated iconic Pokémon pool across Gen 1-9 for instant minigame play
 * Provides immediate offline/instant loading before the full 1,025 list finishes streaming.
 */
export const ICONIC_POKEMON_POOL = [
  // Gen 1
  { id: 1, name: "bulbasaur", displayName: "Bulbasaur", types: ["grass", "poison"], height: 7, weight: 69, baseStats: { hp: 45, attack: 49, defense: 49, "special-attack": 65, "special-defense": 65, speed: 45 } },
  { id: 6, name: "charizard", displayName: "Charizard", types: ["fire", "flying"], height: 17, weight: 905, baseStats: { hp: 78, attack: 84, defense: 78, "special-attack": 109, "special-defense": 85, speed: 100 } },
  { id: 9, name: "blastoise", displayName: "Blastoise", types: ["water"], height: 16, weight: 855, baseStats: { hp: 79, attack: 83, defense: 100, "special-attack": 85, "special-defense": 105, speed: 78 } },
  { id: 25, name: "pikachu", displayName: "Pikachu", types: ["electric"], height: 4, weight: 60, baseStats: { hp: 35, attack: 55, defense: 40, "special-attack": 50, "special-defense": 50, speed: 90 } },
  { id: 94, name: "gengar", displayName: "Gengar", types: ["ghost", "poison"], height: 15, weight: 405, baseStats: { hp: 60, attack: 65, defense: 60, "special-attack": 130, "special-defense": 75, speed: 110 } },
  { id: 150, name: "mewtwo", displayName: "Mewtwo", types: ["psychic"], height: 20, weight: 1220, baseStats: { hp: 106, attack: 110, defense: 90, "special-attack": 154, "special-defense": 90, speed: 130 } },

  // Gen 2
  { id: 157, name: "typhlosion", displayName: "Typhlosion", types: ["fire"], height: 17, weight: 795, baseStats: { hp: 78, attack: 84, defense: 78, "special-attack": 109, "special-defense": 85, speed: 100 } },
  { id: 160, name: "feraligatr", displayName: "Feraligatr", types: ["water"], height: 23, weight: 888, baseStats: { hp: 85, attack: 105, defense: 100, "special-attack": 79, "special-defense": 83, speed: 78 } },
  { id: 196, name: "espeon", displayName: "Espeon", types: ["psychic"], height: 9, weight: 265, baseStats: { hp: 65, attack: 65, defense: 60, "special-attack": 130, "special-defense": 95, speed: 110 } },
  { id: 197, name: "umbreon", displayName: "Umbreon", types: ["dark"], height: 10, weight: 270, baseStats: { hp: 95, attack: 65, defense: 110, "special-attack": 60, "special-defense": 130, speed: 65 } },
  { id: 212, name: "scizor", displayName: "Scizor", types: ["bug", "steel"], height: 18, weight: 1180, baseStats: { hp: 70, attack: 130, defense: 100, "special-attack": 55, "special-defense": 80, speed: 65 } },
  { id: 248, name: "tyranitar", displayName: "Tyranitar", types: ["rock", "dark"], height: 20, weight: 2020, baseStats: { hp: 100, attack: 134, defense: 110, "special-attack": 95, "special-defense": 100, speed: 61 } },

  // Gen 3
  { id: 254, name: "sceptile", displayName: "Sceptile", types: ["grass"], height: 17, weight: 522, baseStats: { hp: 70, attack: 85, defense: 65, "special-attack": 105, "special-defense": 85, speed: 120 } },
  { id: 257, name: "blaziken", displayName: "Blaziken", types: ["fire", "fighting"], height: 19, weight: 520, baseStats: { hp: 80, attack: 120, defense: 70, "special-attack": 110, "special-defense": 70, speed: 80 } },
  { id: 260, name: "swampert", displayName: "Swampert", types: ["water", "ground"], height: 15, weight: 819, baseStats: { hp: 100, attack: 110, defense: 90, "special-attack": 85, "special-defense": 90, speed: 60 } },
  { id: 282, name: "gardevoir", displayName: "Gardevoir", types: ["psychic", "fairy"], height: 16, weight: 484, baseStats: { hp: 68, attack: 65, defense: 65, "special-attack": 125, "special-defense": 115, speed: 80 } },
  { id: 373, name: "salamence", displayName: "Salamence", types: ["dragon", "flying"], height: 15, weight: 1026, baseStats: { hp: 95, attack: 135, defense: 80, "special-attack": 110, "special-defense": 80, speed: 100 } },
  { id: 384, name: "rayquaza", displayName: "Rayquaza", types: ["dragon", "flying"], height: 70, weight: 2065, baseStats: { hp: 105, attack: 150, defense: 90, "special-attack": 150, "special-defense": 90, speed: 95 } },

  // Gen 4
  { id: 389, name: "torterra", displayName: "Torterra", types: ["grass", "ground"], height: 22, weight: 3100, baseStats: { hp: 95, attack: 109, defense: 105, "special-attack": 75, "special-defense": 85, speed: 56 } },
  { id: 392, name: "infernape", displayName: "Infernape", types: ["fire", "fighting"], height: 12, weight: 350, baseStats: { hp: 76, attack: 104, defense: 71, "special-attack": 104, "special-defense": 71, speed: 108 } },
  { id: 395, name: "empoleon", displayName: "Empoleon", types: ["water", "steel"], height: 17, weight: 845, baseStats: { hp: 84, attack: 86, defense: 88, "special-attack": 111, "special-defense": 101, speed: 60 } },
  { id: 445, name: "garchomp", displayName: "Garchomp", types: ["dragon", "ground"], height: 19, weight: 950, baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 } },
  { id: 448, name: "lucario", displayName: "Lucario", types: ["fighting", "steel"], height: 12, weight: 540, baseStats: { hp: 70, attack: 110, defense: 70, "special-attack": 115, "special-defense": 70, speed: 90 } },
  { id: 483, name: "dialga", displayName: "Dialga", types: ["steel", "dragon"], height: 54, weight: 6830, baseStats: { hp: 100, attack: 120, defense: 120, "special-attack": 150, "special-defense": 100, speed: 90 } },

  // Gen 5
  { id: 497, name: "serperior", displayName: "Serperior", types: ["grass"], height: 33, weight: 630, baseStats: { hp: 75, attack: 75, defense: 95, "special-attack": 75, "special-defense": 95, speed: 113 } },
  { id: 530, name: "excadrill", displayName: "Excadrill", types: ["ground", "steel"], height: 7, weight: 404, baseStats: { hp: 110, attack: 135, defense: 60, "special-attack": 50, "special-defense": 65, speed: 88 } },
  { id: 571, name: "zoroark", displayName: "Zoroark", types: ["dark"], height: 16, weight: 811, baseStats: { hp: 60, attack: 105, defense: 60, "special-attack": 120, "special-defense": 60, speed: 105 } },
  { id: 609, name: "chandelure", displayName: "Chandelure", types: ["ghost", "fire"], height: 10, weight: 343, baseStats: { hp: 60, attack: 55, defense: 90, "special-attack": 145, "special-defense": 90, speed: 80 } },
  { id: 612, name: "haxorus", displayName: "Haxorus", types: ["dragon"], height: 18, weight: 1055, baseStats: { hp: 76, attack: 147, defense: 90, "special-attack": 60, "special-defense": 70, speed: 97 } },
  { id: 637, name: "volcarona", displayName: "Volcarona", types: ["bug", "fire"], height: 16, weight: 460, baseStats: { hp: 85, attack: 60, defense: 65, "special-attack": 135, "special-defense": 105, speed: 100 } },

  // Gen 6
  { id: 658, name: "greninja", displayName: "Greninja", types: ["water", "dark"], height: 15, weight: 400, baseStats: { hp: 72, attack: 95, defense: 67, "special-attack": 103, "special-defense": 71, speed: 122 } },
  { id: 663, name: "talonflame", displayName: "Talonflame", types: ["fire", "flying"], height: 12, weight: 245, baseStats: { hp: 78, attack: 81, defense: 71, "special-attack": 74, "special-defense": 69, speed: 126 } },
  { id: 681, name: "aegislash", displayName: "Aegislash", types: ["steel", "ghost"], height: 17, weight: 530, baseStats: { hp: 60, attack: 50, defense: 140, "special-attack": 50, "special-defense": 140, speed: 60 } },
  { id: 700, name: "sylveon", displayName: "Sylveon", types: ["fairy"], height: 10, weight: 235, baseStats: { hp: 95, attack: 65, defense: 65, "special-attack": 110, "special-defense": 130, speed: 60 } },
  { id: 701, name: "hawlucha", displayName: "Hawlucha", types: ["fighting", "flying"], height: 8, weight: 215, baseStats: { hp: 78, attack: 92, defense: 75, "special-attack": 74, "special-defense": 63, speed: 118 } },
  { id: 716, name: "xerneas", displayName: "Xerneas", types: ["fairy"], height: 30, weight: 2150, baseStats: { hp: 126, attack: 131, defense: 95, "special-attack": 131, "special-defense": 98, speed: 99 } },

  // Gen 7
  { id: 724, name: "decidueye", displayName: "Decidueye", types: ["grass", "ghost"], height: 16, weight: 366, baseStats: { hp: 78, attack: 107, defense: 75, "special-attack": 100, "special-defense": 100, speed: 70 } },
  { id: 727, name: "incineroar", displayName: "Incineroar", types: ["fire", "dark"], height: 18, weight: 830, baseStats: { hp: 95, attack: 115, defense: 90, "special-attack": 80, "special-defense": 90, speed: 60 } },
  { id: 745, name: "lycanroc", displayName: "Lycanroc", types: ["rock"], height: 8, weight: 250, baseStats: { hp: 75, attack: 115, defense: 65, "special-attack": 55, "special-defense": 65, speed: 112 } },
  { id: 748, name: "toxapex", displayName: "Toxapex", types: ["poison", "water"], height: 7, weight: 145, baseStats: { hp: 50, attack: 63, defense: 152, "special-attack": 53, "special-defense": 142, speed: 35 } },
  { id: 778, name: "mimikyu", displayName: "Mimikyu", types: ["ghost", "fairy"], height: 2, weight: 7, baseStats: { hp: 55, attack: 90, defense: 80, "special-attack": 50, "special-defense": 105, speed: 96 } },
  { id: 784, name: "kommo-o", displayName: "Kommo-o", types: ["dragon", "fighting"], height: 16, weight: 782, baseStats: { hp: 75, attack: 110, defense: 125, "special-attack": 100, "special-defense": 105, speed: 85 } },

  // Gen 8
  { id: 812, name: "rillaboom", displayName: "Rillaboom", types: ["grass"], height: 21, weight: 900, baseStats: { hp: 100, attack: 125, defense: 90, "special-attack": 60, "special-defense": 70, speed: 85 } },
  { id: 815, name: "cinderace", displayName: "Cinderace", types: ["fire"], height: 14, weight: 330, baseStats: { hp: 80, attack: 116, defense: 75, "special-attack": 65, "special-defense": 75, speed: 119 } },
  { id: 823, name: "corviknight", displayName: "Corviknight", types: ["flying", "steel"], height: 22, weight: 750, baseStats: { hp: 98, attack: 87, defense: 105, "special-attack": 53, "special-defense": 85, speed: 67 } },
  { id: 849, name: "toxtricity", displayName: "Toxtricity", types: ["electric", "poison"], height: 16, weight: 400, baseStats: { hp: 75, attack: 98, defense: 70, "special-attack": 114, "special-defense": 70, speed: 75 } },
  { id: 887, name: "dragapult", displayName: "Dragapult", types: ["dragon", "ghost"], height: 30, weight: 500, baseStats: { hp: 88, attack: 120, defense: 75, "special-attack": 100, "special-defense": 75, speed: 142 } },
  { id: 888, name: "zacian", displayName: "Zacian", types: ["fairy", "steel"], height: 28, weight: 1100, baseStats: { hp: 92, attack: 130, defense: 115, "special-attack": 80, "special-defense": 115, speed: 138 } },

  // Gen 9
  { id: 908, name: "meowscarada", displayName: "Meowscarada", types: ["grass", "dark"], height: 15, weight: 312, baseStats: { hp: 76, attack: 110, defense: 70, "special-attack": 81, "special-defense": 70, speed: 123 } },
  { id: 911, name: "skeledirge", displayName: "Skeledirge", types: ["fire", "ghost"], height: 16, weight: 3265, baseStats: { hp: 104, attack: 75, defense: 100, "special-attack": 110, "special-defense": 75, speed: 66 } },
  { id: 959, name: "tinkaton", displayName: "Tinkaton", types: ["fairy", "steel"], height: 7, weight: 1128, baseStats: { hp: 85, attack: 75, defense: 77, "special-attack": 70, "special-defense": 105, speed: 94 } },
  { id: 987, name: "flutter-mane", displayName: "Flutter Mane", types: ["ghost", "fairy"], height: 14, weight: 40, baseStats: { hp: 55, attack: 55, defense: 55, "special-attack": 135, "special-defense": 135, speed: 135 } },
  { id: 1000, name: "gholdengo", displayName: "Gholdengo", types: ["steel", "ghost"], height: 12, weight: 300, baseStats: { hp: 87, attack: 60, defense: 95, "special-attack": 133, "special-defense": 91, speed: 84 } },
  { id: 1007, name: "koraidon", displayName: "Koraidon", types: ["fighting", "dragon"], height: 25, weight: 3030, baseStats: { hp: 100, attack: 135, defense: 115, "special-attack": 85, "special-defense": 100, speed: 135 } },
];

export const GENERIC_MAX_MOVES = {
  normal: "Max Strike",
  fire: "Max Flare",
  water: "Max Geyser",
  grass: "Max Overgrowth",
  electric: "Max Lightning",
  ice: "Max Hailstorm",
  fighting: "Max Knuckle",
  poison: "Max Ooze",
  ground: "Max Quake",
  flying: "Max Airstream",
  psychic: "Max Mindstorm",
  bug: "Max Flutterby",
  rock: "Max Rockfall",
  ghost: "Max Phantasm",
  dragon: "Max Wyrmwind",
  steel: "Max Steelspike",
  dark: "Max Darkness",
  fairy: "Max Starfall",
};

/**
 * Calculates standard Max Move Base Power from base attack power and type in Gen 8
 */
export function getMaxMovePower(basePower, moveType) {
  const bp = Number(basePower) || 0;
  if (bp <= 0) return 0;
  const type = (moveType || "normal").toLowerCase();

  // Max Knuckle & Max Ooze (Fighting & Poison) have reduced BP because they boost Atk / SpA
  if (type === "fighting" || type === "poison") {
    if (bp <= 40) return 70;
    if (bp <= 50) return 75;
    if (bp <= 60) return 80;
    if (bp <= 70) return 85;
    if (bp <= 100) return 90;
    if (bp <= 140) return 95;
    return 100;
  }

  // All other standard Max Moves
  if (bp <= 40) return 90;
  if (bp <= 50) return 100;
  if (bp <= 60) return 110;
  if (bp <= 70) return 120;
  if (bp <= 100) return 130;
  if (bp <= 140) return 140;
  return 150;
}

/**
 * All 32 Canonical Gigantamax (G-Max) Pokémon species with their signature G-Max moves
 */
export const GMAX_POKEMON_MAP = {
  "venusaur": { move: "G-Max Vine Lash", type: "grass", power: 160, effect: "Deals 1/6 max HP damage each turn for 4 turns to non-Grass foes" },
  "charizard": { move: "G-Max Wildfire", type: "fire", power: 150, effect: "Deals 1/6 max HP damage each turn for 4 turns to non-Fire foes" },
  "blastoise": { move: "G-Max Cannonade", type: "water", power: 150, effect: "Deals 1/6 max HP damage each turn for 4 turns to non-Water foes" },
  "butterfree": { move: "G-Max Befuddle", type: "bug", power: 130, effect: "Inflicts poison, paralysis, or sleep on all foes" },
  "pikachu": { move: "G-Max Volt Crash", type: "electric", power: 140, effect: "Paralyzes all foes" },
  "meowth": { move: "G-Max Gold Rush", type: "normal", power: 130, effect: "Confuses all foes and scatters coins across the field" },
  "machamp": { move: "G-Max Chi Strike", type: "fighting", power: 130, effect: "Boosts user and allies' critical hit ratio by 1 stage" },
  "gengar": { move: "G-Max Terror", type: "ghost", power: 130, effect: "Traps all foes, preventing them from fleeing or switching" },
  "kingler": { move: "G-Max Foam Burst", type: "water", power: 140, effect: "Harshly lowers all foes' Speed by 2 stages" },
  "lapras": { move: "G-Max Resonance", type: "ice", power: 140, effect: "Sets up Aurora Veil for 5 turns, reducing damage taken" },
  "eevee": { move: "G-Max Cuddle", type: "normal", power: 130, effect: "Infatuates all foes of the opposite gender" },
  "snorlax": { move: "G-Max Replenish", type: "normal", power: 130, effect: "50% chance to restore user or allies' consumed Berries" },
  "garbodor": { move: "G-Max Malodor", type: "poison", power: 130, effect: "Poisons all opposing Pokémon" },
  "melmetal": { move: "G-Max Meltdown", type: "steel", power: 140, effect: "Torments all opposing Pokémon, preventing repeated moves" },
  "rillaboom": { move: "G-Max Drum Solo", type: "grass", power: 160, effect: "Ignores target's ability (Mold Breaker effect)" },
  "cinderace": { move: "G-Max Fireball", type: "fire", power: 160, effect: "Ignores target's ability (Mold Breaker effect)" },
  "inteleon": { move: "G-Max Hydrosnipe", type: "water", power: 160, effect: "Ignores target's ability (Mold Breaker effect)" },
  "corviknight": { move: "G-Max Wind Rage", type: "flying", power: 140, effect: "Clears entry hazards, terrains, screens, and reflectors" },
  "orbeetle": { move: "G-Max Gravitas", type: "psychic", power: 130, effect: "Intensifies gravity for 5 turns" },
  "drednaw": { move: "G-Max Stonesurge", type: "water", power: 140, effect: "Scatters sharp stealth rocks across the opponent's field" },
  "coalossal": { move: "G-Max Volcalith", type: "rock", power: 130, effect: "Deals 1/6 max HP damage each turn for 4 turns to non-Rock foes" },
  "flapple": { move: "G-Max Tartness", type: "grass", power: 130, effect: "Lowers all opposing Pokémon's evasiveness by 1 stage" },
  "appletun": { move: "G-Max Sweetness", type: "grass", power: 130, effect: "Cures all status conditions of the user and allies" },
  "sandaconda": { move: "G-Max Sandblast", type: "ground", power: 130, effect: "Traps opposing Pokémon in a sand tomb for 4-5 turns" },
  "toxtricity": { move: "G-Max Stun Shock", type: "electric", power: 140, effect: "Poisons or paralyzes all opposing Pokémon" },
  "centiskorch": { move: "G-Max Centiferno", type: "fire", power: 140, effect: "Traps opposing Pokémon in a blazing fire spin for 4-5 turns" },
  "hatterene": { move: "G-Max Smite", type: "fairy", power: 130, effect: "Confuses all opposing Pokémon" },
  "grimmsnarl": { move: "G-Max Snooze", type: "dark", power: 130, effect: "Causes opposing Pokémon to fall asleep on the next turn" },
  "alcremie": { move: "G-Max Finale", type: "fairy", power: 130, effect: "Heals 1/6 max HP for the user and all allies" },
  "copperajah": { move: "G-Max Steelsurge", type: "steel", power: 130, effect: "Scatters sharp steel spikes across the opponent's field" },
  "duraludon": { move: "G-Max Depletion", type: "dragon", power: 140, effect: "Reduces 2 PP from the last move used by opposing Pokémon" },
  "urshifu": { move: "G-Max One Blow", type: "dark", power: 130, effect: "Bypasses Protect, Detect, and Max Guard" },
  "urshifu-single-strike": { move: "G-Max One Blow", type: "dark", power: 130, effect: "Bypasses Protect, Detect, and Max Guard" },
  "urshifu-rapid-strike": { move: "G-Max Rapid Flow", type: "water", power: 130, effect: "Bypasses Protect, Detect, and Max Guard" },
};

/**
 * Returns G-Max move metadata if Pokémon has a Gigantamax form
 */
export function getGmaxMoveForPokemon(pokemonName) {
  if (!pokemonName) return null;
  const key = pokemonName.toLowerCase().trim().replace(/\s+/g, "-");
  if (key.includes("rapid")) return GMAX_POKEMON_MAP["urshifu-rapid-strike"];
  if (GMAX_POKEMON_MAP[key]) return GMAX_POKEMON_MAP[key];
  const baseKey = key.split("-")[0];
  if (GMAX_POKEMON_MAP[baseKey]) return GMAX_POKEMON_MAP[baseKey];
  return null;
}
