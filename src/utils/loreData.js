/**
 * Comprehensive Pokémon Lore & Archetype Registry
 * Classifies Starters, Legendaries, Mythicals, Paradox, Ultra Beasts,
 * Pseudo-Legendaries, Fossils, Babies, and canonical Signature Moves & Abilities.
 */

// 1. STARTER POKÉMON (All 3-stage starter families Gen 1-9)
export const STARTER_IDS = new Set([
  // Gen 1: Bulbasaur, Charmander, Squirtle families
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  // Gen 2: Chikorita, Cyndaquil, Totodile families
  152, 153, 154, 155, 156, 157, 158, 159, 160,
  // Gen 3: Treecko, Torchic, Mudkip families
  252, 253, 254, 255, 256, 257, 258, 259, 260,
  // Gen 4: Turtwig, Chimchar, Piplup families
  387, 388, 389, 390, 391, 392, 393, 394, 395,
  // Gen 5: Snivy, Tepig, Oshawott families
  495, 496, 497, 498, 499, 500, 501, 502, 503,
  // Gen 6: Chespin, Fennekin, Froakie families
  650, 651, 652, 653, 654, 655, 656, 657, 658,
  // Gen 7: Rowlet, Litten, Popplio families
  722, 723, 724, 725, 726, 727, 728, 729, 730,
  // Gen 8: Grookey, Scorbunny, Sobble families
  810, 811, 812, 813, 814, 815, 816, 817, 818,
  // Gen 9: Sprigatito, Fuecoco, Quaxly families
  906, 907, 908, 909, 910, 911, 912, 913, 914,
]);

// 2. MYTHICAL POKÉMON
export const MYTHICAL_IDS = new Set([
  151, // Mew
  251, // Celebi
  385, // Jirachi
  386, // Deoxys
  489, 490, // Phione, Manaphy
  491, // Darkrai
  492, // Shaymin
  493, // Arceus
  494, // Victini
  647, // Keldeo
  648, // Meloetta
  649, // Genesect
  719, // Diancie
  720, // Hoopa
  721, // Volcanion
  801, // Magearna
  802, // Marshadow
  807, // Zeraora
  808, 809, // Meltan, Melmetal
  893, // Zarude
  1025, // Pecharunt
]);

// 3. ULTRA BEASTS
export const ULTRA_BEAST_IDS = new Set([
  793, // Nihilego
  794, // Buzzwole
  795, // Pheromosa
  796, // Xurkitree
  797, // Celesteela
  798, // Kartana
  799, // Guzzlord
  803, 804, // Poipole, Naganadel
  805, // Stakataka
  806, // Blacephalon
]);

// 4. PARADOX POKÉMON (Past & Future)
export const PARADOX_IDS = new Set([
  984, // Great Tusk
  985, // Scream Tail
  986, // Brute Bonnet
  987, // Flutter Mane
  988, // Slither Wing
  989, // Sandy Shocks
  990, // Iron Treads
  991, // Iron Bundle
  992, // Iron Hands
  993, // Iron Jugulis
  994, // Iron Moth
  995, // Iron Thorns
  1005, // Roaring Moon
  1006, // Iron Valiant
  1007, // Koraidon (also box legend)
  1008, // Miraidon (also box legend)
  1009, // Walking Wake
  1010, // Iron Leaves
  1020, // Gouging Fire
  1021, // Raging Bolt
  1022, // Iron Boulder
  1023, // Iron Crown
]);

// 5. LEGENDARY POKÉMON (Sub-legendaries, Box Mascots, Trio Masters)
export const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, // Birds + Mewtwo
  243, 244, 245, 249, 250, // Beasts + Tower Duo
  377, 378, 379, 380, 381, 382, 383, 384, // Regies, Eon Duo, Weather Trio
  480, 481, 482, 483, 484, 485, 486, 487, 488, // Lake Trio, Creation Trio, Heatran, Regigigas, Cresselia
  638, 639, 640, 641, 642, 643, 644, 645, 646, // Swords of Justice, Forces of Nature, Tao Trio
  716, 717, 718, // Aura Trio
  772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, // Silvally line, Tapus, Light Trio
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905, // Hero Duo, Eternatus, Kubfu line, Regieleki/drago, Horses, Calyrex, Enamorus
  1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, // Ruinous Quartet, Box Box, Loyal Three, Ogerpon, Terapagos
]);

// 6. PSEUDO-LEGENDARIES (600 BST 3-stage lines)
export const PSEUDO_LEGENDARY_IDS = new Set([
  147, 148, 149, // Dragonite family
  246, 247, 248, // Tyranitar family
  371, 372, 373, // Salamence family
  374, 375, 376, // Metagross family
  443, 444, 445, // Garchomp family
  633, 634, 635, // Hydreigon family
  704, 705, 706, // Goodra family
  782, 783, 784, // Kommo-o family
  885, 886, 887, // Dragapult family
  996, 997, 998, // Baxcalibur family
]);

// 7. FOSSIL POKÉMON
export const FOSSIL_IDS = new Set([
  138, 139, 140, 141, 142, // Omanyte, Kabuto lines, Aerodactyl
  345, 346, 347, 348, // Lileep, Anorith lines
  408, 409, 410, 411, // Cranidos, Shieldon lines
  564, 565, 566, 567, // Tirtouga, Archen lines
  696, 697, 698, 699, // Tyrunt, Amaura lines
  880, 881, 882, 883, // Galar Fossil chimeras
]);

// 8. BABY POKÉMON
export const BABY_IDS = new Set([
  172, 173, 174, 175, 236, 238, 239, 240, // Pichu, Cleffa, Igglybuff, Togepi, Tyrogue, Smoochum, Elekid, Magby
  298, 360, // Azurill, Wynaut
  406, 433, 438, 439, 440, 446, 447, 458, // Budew, Chingling, Bonsly, Mime Jr., Happiny, Munchlax, Riolu, Mantyke
  848, // Toxel
]);

/**
 * Returns archetype classification info for a given Pokémon
 */
export function getPokemonArchetype(pokemon) {
  if (!pokemon) return null;
  const id = Number(pokemon.id || (pokemon.species?.url?.match(/\/pokemon-species\/(\d+)\//)?.[1]));
  const name = (pokemon.name || "").toLowerCase();

  if (MYTHICAL_IDS.has(id)) {
    return { key: "mythical", label: "Mythical", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" };
  }
  if (PARADOX_IDS.has(id) || name.startsWith("iron-") || ["great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing", "sandy-shocks", "roaring-moon", "walking-wake", "gouging-fire", "raging-bolt"].includes(name)) {
    return { key: "paradox", label: "Paradox", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" };
  }
  if (ULTRA_BEAST_IDS.has(id)) {
    return { key: "ultrabeast", label: "Ultra Beast", color: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40" };
  }
  if (LEGENDARY_IDS.has(id)) {
    return { key: "legendary", label: "Legendary", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" };
  }
  if (PSEUDO_LEGENDARY_IDS.has(id)) {
    return { key: "pseudolegendary", label: "Pseudo-Legendary", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" };
  }
  if (STARTER_IDS.has(id)) {
    return { key: "starter", label: "Starter", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" };
  }
  if (FOSSIL_IDS.has(id)) {
    return { key: "fossil", label: "Fossil", color: "bg-amber-700/20 text-amber-500 border-amber-700/40" };
  }
  if (BABY_IDS.has(id)) {
    return { key: "baby", label: "Baby", color: "bg-pink-500/20 text-pink-400 border-pink-500/40" };
  }

  return null;
}

// ==========================================
// CANONICAL SIGNATURE MOVES REGISTRY
// ==========================================
export const SIGNATURE_MOVES = {
  // Gen 9
  tinkaton: ["Gigaton Hammer"],
  ceruledge: ["Bitter Blade"],
  armarouge: ["Armor Cannon"],
  meowscarada: ["Flower Trick"],
  skeledirge: ["Torch Song"],
  quaquaval: ["Aqua Step"],
  gholdengo: ["Make It Rain"],
  annihilape: ["Rage Fist"],
  kingambit: ["Kowtow Cleave"],
  ogerpon: ["Ivy Cudgel"],
  terapagos: ["Tera Starstorm"],
  pecharunt: ["Malignant Chain"],
  palafin: ["Jet Punch"],
  baxcalibur: ["Glaive Rush"],
  bellibolt: ["Parabolic Charge"],
  miraidon: ["Electro Drift"],
  koraidon: ["Collision Course"],
  glimmora: ["Mortal Spin"],
  dondozo: ["Order Up"],
  maushold: ["Population Bomb"],
  houndstone: ["Last Respects"],
  scovillain: ["Spicy Extract"],
  espathra: ["Lumina Crash"],
  tatsugiri: ["Order Up"],

  // Gen 8
  zacian: ["Behemoth Blade"],
  zamazenta: ["Behemoth Bash"],
  eternatus: ["Dynamax Cannon", "Eternabeam"],
  urshifu: ["Wicked Blow", "Surging Strikes"],
  dragapult: ["Dragon Darts"],
  toxtricity: ["Overdrive"],
  sirfetchd: ["Meteor Assault"],
  calyrex: ["Astral Barrage", "Glacial Lance"],
  zarude: ["Jungle Healing"],
  polteageist: ["Teatime"],
  cramorant: ["Gulp Missile"],
  appletun: ["Apple Acid"],
  flapple: ["Grav Apple"],
  spectrier: ["Astral Barrage"],
  glastrier: ["Glacial Lance"],

  // Gen 7
  decidueye: ["Spirit Shackle", "Triple Arrows"],
  incineroar: ["Darkest Lariat"],
  primarina: ["Sparkling Aria"],
  marshadow: ["Spectral Thief"],
  zeraora: ["Plasma Fists"],
  mimikyu: ["Let's Snuggle Forever"],
  solgaleo: ["Sunsteel Strike"],
  lunala: ["Moongeist Beam"],
  necrozma: ["Prismatic Laser", "Photon Geyser"],
  kommo_o: ["Clanging Scales", "Clangorous Soul"],
  lycanroc: ["Accelerock"],
  toucannon: ["Beak Blast"],
  salazzle: ["Fire Lash"],

  // Gen 6
  greninja: ["Water Shuriken"],
  zygarde: ["Thousand Arrows", "Thousand Waves", "Core Enforcer", "Land's Wrath"],
  xerneas: ["Geomancy"],
  yveltal: ["Oblivion Wing"],
  diancie: ["Diamond Storm"],
  volcanion: ["Steam Eruption"],
  hoopa: ["Hyperspace Hole", "Hyperspace Fury"],
  aegislash: ["King's Shield"],
  chesnaught: ["Spiky Shield"],
  delphox: ["Mystical Fire"],
  hawlucha: ["Flying Press"],

  // Gen 5
  volcarona: ["Fiery Dance"],
  victini: ["V-create", "Searing Shot"],
  reshiram: ["Blue Flare", "Fusion Flare"],
  zekrom: ["Bolt Strike", "Fusion Bolt"],
  kyurem: ["Glaciate", "Freeze Shock", "Ice Burn"],
  keldeo: ["Secret Sword"],
  genesect: ["Techno Blast"],
  meloetta: ["Relic Song"],
  landorus: ["Sandsear Storm"],
  thundurus: ["Wildbolt Storm"],
  tornadus: ["Bleakwind Storm"],
  enamorus: ["Springtide Storm"],
  zoroark: ["Night Daze"],

  // Gen 4
  dialga: ["Roar of Time"],
  palkia: ["Spacial Rend"],
  giratina: ["Shadow Force"],
  arceus: ["Judgment"],
  darkrai: ["Dark Void"],
  shaymin: ["Seed Flare"],
  heatran: ["Magma Storm"],
  cresselia: ["Lunar Dance", "Lunar Blessing"],
  regigigas: ["Crush Grip"],
  lucario: ["Aura Sphere"],
  cherrim: ["Sunny Day"],

  // Gen 3
  rayquaza: ["Dragon Ascent"],
  kyogre: ["Origin Pulse", "Water Spout"],
  groudon: ["Precipice Blades"],
  deoxys: ["Psycho Boost"],
  jirachi: ["Doom Desire"],
  latios: ["Luster Purge"],
  latias: ["Mist Ball"],
  blaziken: ["Blaze Kick"],
  swampert: ["Muddy Water"],
  sceptile: ["Leaf Blade"],

  // Gen 2
  lugia: ["Aeroblast"],
  ho_oh: ["Sacred Fire"],
  miltank: ["Milk Drink"],
  smeargle: ["Sketch"],

  // Gen 1
  mewtwo: ["Psystrike"],
  mew: ["Genesis Supernova"],
  ditto: ["Transform"],
};

// ==========================================
// CANONICAL SIGNATURE ABILITIES REGISTRY
// ==========================================
export const SIGNATURE_ABILITIES = {
  // Gen 9
  gholdengo: ["Good as Gold"],
  palafin: ["Zero to Hero"],
  kingambit: ["Supreme Overlord"],
  ting_lu: ["Vessel of Ruin"],
  chien_pao: ["Sword of Ruin"],
  wo_chien: ["Tablets of Ruin"],
  chi_yu: ["Beads of Ruin"],
  ogerpon: ["Embody Aspect"],
  terapagos: ["Tera Shift", "Tera Shell", "Teraform Zero"],
  pecharunt: ["Poison Puppeteer"],
  koraidon: ["Orichalcum Pulse"],
  miraidon: ["Hadron Engine"],
  dondozo: ["Commander", "Unaware"],
  tatsugiri: ["Commander"],
  garganacl: ["Purifying Salt"],
  glimmora: ["Toxic Debris"],
  bellibolt: ["Electromorphosis"],
  revavroom: ["Filter"],
  bramblin: ["Wind Rider"],
  orthworm: ["Earth Eater"],
  scovillain: ["Moody"],
  dachsbun: ["Well-Baked Body"],

  // Gen 8
  calyrex: ["As One", "Grim Neigh", "Chilling Neigh"],
  zacian: ["Intrepid Sword"],
  zamazenta: ["Dauntless Shield"],
  eternatus: ["Pressure"],
  cramorant: ["Gulp Missile"],
  eiscue: ["Ice Face"],
  morpeko: ["Hunger Switch"],
  toxtricity: ["Punk Rock"],
  mr_rime: ["Screen Cleaner"],
  galarian_darmanitan: ["Gorilla Tactics", "Zen Mode"],
  polteageist: ["Weak Armor"],

  // Gen 7
  mimikyu: ["Disguise"],
  wishiwashi: ["Schooling"],
  minior: ["Shields Down"],
  komala: ["Comatose"],
  golisopod: ["Emergency Exit"],
  salazzle: ["Corrosion"],
  marowak_alola: ["Lightning Rod"],
  raichu_alola: ["Surge Surfer"],
  toxapex: ["Merciless"],
  solgaleo: ["Full Metal Body"],
  lunala: ["Shadow Shield"],
  necrozma: ["Prism Armor", "Neuroforce"],

  // Gen 6
  greninja: ["Battle Bond"],
  aegislash: ["Stance Change"],
  zygarde: ["Power Construct", "Aura Break"],
  xerneas: ["Fairy Aura"],
  yveltal: ["Dark Aura"],
  furfrou: ["Fur Coat"],
  malamar: ["Contrary"],
  pyroar: ["Rivalry"],

  // Gen 5
  darmanitan: ["Zen Mode"],
  zoroark: ["Illusion"],
  reshiram: ["Turboblaze"],
  zekrom: ["Teravolt"],
  archeops: ["Defeatist"],

  // Gen 4
  arceus: ["Multitype"],
  darkrai: ["Bad Dreams"],
  regigigas: ["Slow Start"],
  cherrim: ["Flower Gift"],

  // Gen 3
  shedinja: ["Wonder Guard"],
  slaking: ["Truant"],
  castform: ["Forecast"],
  kecleon: ["Color Change"],
};

const cleanKey = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function getLookupKeys(name) {
  if (!name) return [];
  const raw = name.toLowerCase().trim();
  const normalized = cleanKey(raw);
  const underscored = raw.replace(/[- ]/g, "_");
  const base = raw.split("-")[0];
  return Array.from(new Set([underscored, raw, normalized, base]));
}

/**
 * Checks if a move is a signature move for a given Pokémon name
 */
export function isPokemonSignatureMove(moveName, pokemonName) {
  if (!moveName || !pokemonName) return false;
  const targetClean = cleanKey(moveName);
  const keys = getLookupKeys(pokemonName);
  
  for (const k of keys) {
    const list = SIGNATURE_MOVES[k];
    if (list && list.some((m) => cleanKey(m) === targetClean)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if an ability is a signature ability for a given Pokémon name
 */
export function isPokemonSignatureAbility(abilityName, pokemonName) {
  if (!abilityName || !pokemonName) return false;
  const targetClean = cleanKey(abilityName);
  const keys = getLookupKeys(pokemonName);

  for (const k of keys) {
    const list = SIGNATURE_ABILITIES[k];
    if (list && list.some((a) => cleanKey(a) === targetClean)) {
      return true;
    }
  }
  return false;
}

/**
 * Gets all signature moves for a Pokémon
 */
export function getPokemonSignatureMoves(pokemonName) {
  if (!pokemonName) return [];
  const keys = getLookupKeys(pokemonName);
  for (const k of keys) {
    if (SIGNATURE_MOVES[k] && SIGNATURE_MOVES[k].length > 0) {
      return SIGNATURE_MOVES[k];
    }
  }
  return [];
}

/**
 * Gets all signature abilities for a Pokémon
 */
export function getPokemonSignatureAbilities(pokemonName) {
  if (!pokemonName) return [];
  const keys = getLookupKeys(pokemonName);
  for (const k of keys) {
    if (SIGNATURE_ABILITIES[k] && SIGNATURE_ABILITIES[k].length > 0) {
      return SIGNATURE_ABILITIES[k];
    }
  }
  return [];
}

/**
 * Canonical default variety mapping for species where PokéAPI has no bare /pokemon/{species} endpoint.
 * In PokéAPI, these species only exist under /pokemon-species/{name}, and their playable varieties
 * are keyed with variety suffixes (e.g., basculin-red-striped, basculegion-male, etc.).
 */
export const SPECIES_DEFAULT_VARIETY_MAP = {
  basculin: "basculin-red-striped",
  basculegion: "basculegion-male",
  meowstic: "meowstic-male",
  indeedee: "indeedee-male",
  oinkologne: "oinkologne-male",
  zygarde: "zygarde-50",
  pumpkaboo: "pumpkaboo-average",
  gourgeist: "gourgeist-average",
  giratina: "giratina-altered",
  deoxys: "deoxys-normal",
  wormadam: "wormadam-plant",
  shaymin: "shaymin-land",
  aegislash: "aegislash-shield",
  mimikyu: "mimikyu-disguised",
  enamorus: "enamorus-incarnate",
  urshifu: "urshifu-single-strike",
  toxtricity: "toxtricity-amped",
  eiscue: "eiscue-ice",
  morpeko: "morpeko-full-belly",
  keldeo: "keldeo-ordinary",
  meloetta: "meloetta-aria",
  darmanitan: "darmanitan-standard",
  tornadus: "tornadus-incarnate",
  thundurus: "thundurus-incarnate",
  landorus: "landorus-incarnate",
  lycanroc: "lycanroc-midday",
  wishiwashi: "wishiwashi-solo",
  minior: "minior-red-meteor",
};

/**
 * Resolves a query string to its canonical /pokemon/ endpoint target slug.
 */
export function resolvePokemonEndpointTarget(query) {
  if (!query) return "";
  const clean = String(query).trim().toLowerCase();
  return SPECIES_DEFAULT_VARIETY_MAP[clean] || clean;
}

