/**
 * Competitive Gen 9 Pokémon Damage Calculation Engine
 * Implements the standard Pokémon damage formula with 16 rolls,
 * stat stage modifiers, items, abilities, weather, terrain, and Tera mechanics.
 */

import { NATURES } from "./calcData.js";

// Type chart defense lookup (from BattleLab / canon)
export const TYPE_CHART = {
  normal: { weak: ["fighting"], immune: ["ghost"], resist: [] },
  fire: { weak: ["water", "ground", "rock"], immune: [], resist: ["fire", "grass", "ice", "bug", "steel", "fairy"] },
  water: { weak: ["electric", "grass"], immune: [], resist: ["fire", "water", "ice", "steel"] },
  grass: { weak: ["fire", "ice", "poison", "flying", "bug"], immune: [], resist: ["water", "electric", "grass", "ground"] },
  electric: { weak: ["ground"], immune: [], resist: ["electric", "flying", "steel"] },
  ice: { weak: ["fire", "fighting", "rock", "steel"], immune: [], resist: ["ice"] },
  fighting: { weak: ["flying", "psychic", "fairy"], immune: [], resist: ["bug", "rock", "dark"] },
  poison: { weak: ["ground", "psychic"], immune: [], resist: ["grass", "fighting", "poison", "bug", "fairy"] },
  ground: { weak: ["water", "grass", "ice"], immune: ["electric"], resist: ["poison", "rock"] },
  flying: { weak: ["electric", "ice", "rock"], immune: ["ground"], resist: ["grass", "fighting", "bug"] },
  psychic: { weak: ["bug", "ghost", "dark"], immune: [], resist: ["fighting", "psychic"] },
  bug: { weak: ["fire", "flying", "rock"], immune: [], resist: ["grass", "fighting", "ground"] },
  rock: { weak: ["water", "grass", "fighting", "ground", "steel"], immune: [], resist: ["normal", "fire", "poison", "flying"] },
  ghost: { weak: ["ghost", "dark"], immune: ["normal", "fighting"], resist: ["poison", "bug"] },
  dragon: { weak: ["ice", "dragon", "fairy"], immune: [], resist: ["fire", "water", "grass", "electric"] },
  steel: { weak: ["fire", "fighting", "ground"], immune: ["poison"], resist: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"] },
  dark: { weak: ["fighting", "bug", "fairy"], immune: ["psychic"], resist: ["ghost", "dark"] },
  fairy: { weak: ["poison", "steel"], immune: ["dragon"], resist: ["fighting", "bug", "dark"] },
  stellar: { weak: [], immune: [], resist: [] },
};

/**
 * Calculates raw in-game stat from base, IV, EV, level, and nature.
 */
export function calculateStat(statName, baseStat, iv = 31, ev = 0, level = 50, nature = "Hardy") {
  if (baseStat === undefined || baseStat === null) return 0;
  if (statName === "hp") {
    if (baseStat === 1) return 1; // Shedinja
    return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const raw = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  const natureObj = NATURES.find((n) => n.name.toLowerCase() === (nature || "hardy").toLowerCase());
  let mult = 1.0;
  if (natureObj) {
    if (natureObj.plus === statName) mult = 1.1;
    if (natureObj.minus === statName) mult = 0.9;
  }
  return Math.floor(raw * mult);
}

/**
 * Converts stat stages (-6 to +6) into standard multiplier
 */
export function getStageMultiplier(stage) {
  const s = Math.max(-6, Math.min(6, stage || 0));
  if (s >= 0) {
    return (2 + s) / 2;
  }
  return 2 / (2 - s);
}

/**
 * Computes defensive type effectiveness multiplier against attacking move type
 */
export function getTypeMultiplier(moveType, defenderTypes) {
  if (!moveType || !defenderTypes || defenderTypes.length === 0) return 1.0;
  let mult = 1.0;
  defenderTypes.forEach((defType) => {
    const chart = TYPE_CHART[defType?.toLowerCase()];
    if (!chart) return;
    if (chart.immune.includes(moveType.toLowerCase())) {
      mult *= 0;
    } else if (chart.weak.includes(moveType.toLowerCase())) {
      mult *= 2;
    } else if (chart.resist.includes(moveType.toLowerCase())) {
      mult *= 0.5;
    }
  });
  return mult;
}

/**
 * Main damage calculation entry point
 * 
 * @param {Object} options
 * @param {Object} options.attacker - Attacker config { name, types, stats, baseStats, evs, ivs, nature, level, ability, item, status, teraType, isTera, stages }
 * @param {Object} options.defender - Defender config { name, types, stats, baseStats, evs, ivs, nature, level, ability, item, status, teraType, isTera, stages, currentHpPercent }
 * @param {Object} options.move - Move config { name, type, power, category ('physical'|'special'|'status'), isContact, isSpread }
 * @param {Object} options.field - Field config { weather, terrain, isDoubles, reflect, lightScreen, auroraVeil, stealthRock, spikes }
 * @param {Boolean} options.isCrit - Critical hit flag
 * @returns {Object} { damageRolls, minDamage, maxDamage, minPercent, maxPercent, hpMax, koVerdict, description, effectiveness }
 */
export function calculateDamage({
  attacker,
  defender,
  move,
  field = {},
  isCrit = false,
}) {
  // If status move or 0 base power
  if (!move || move.category === "status" || !move.power || move.power <= 0) {
    return {
      damageRolls: new Array(16).fill(0),
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      hpMax: defender?.stats?.hp || 100,
      koVerdict: "No damage dealt (Status move)",
      description: "0% damage",
      effectiveness: 1,
    };
  }

  const level = attacker.level || 50;
  const isPhysical = move.category === "physical";

  // Defender effective types (if Tera is active, defender is purely that single type)
  const defTypes = defender.isTera && defender.teraType
    ? [defender.teraType.toLowerCase()]
    : (defender.types || ["normal"]).map((t) => t.toLowerCase());

  // Move typing (e.g. Tera Blast changes type if Terastallized)
  let moveType = (move.type || "normal").toLowerCase();
  let basePower = move.power;

  if (move.name?.toLowerCase() === "facade" && attacker.status && attacker.status !== "healthy") {
    basePower *= 2;
  }

  if (move.name?.toLowerCase() === "tera blast" && attacker.isTera && attacker.teraType) {
    moveType = attacker.teraType.toLowerCase();
    // Tera Blast becomes physical if Attack > Sp. Attack
    const atkVal = attacker.stats?.attack || 100;
    const spaVal = attacker.stats?.["special-attack"] || 100;
    if (atkVal > spaVal && move.category === "special") {
      // Switches to physical
    }
  }

  // Type effectiveness
  let typeMult = getTypeMultiplier(moveType, defTypes);

  // Ability immunities
  const atkAbility = (attacker.ability || "").toLowerCase();
  const defAbility = (defender.ability || "").toLowerCase();
  if (
    (moveType === "fire" && (defAbility === "flash fire" || defAbility === "well-baked body")) ||
    (moveType === "water" && (defAbility === "water absorb" || defAbility === "storm drain" || defAbility === "dry skin")) ||
    (moveType === "electric" && (defAbility === "volt absorb" || defAbility === "motor drive" || defAbility === "lightning rod")) ||
    (moveType === "ground" && (defAbility === "levitate" || defAbility === "earth eater")) ||
    (moveType === "grass" && defAbility === "sap sipper")
  ) {
    typeMult = 0;
  }

  if (typeMult === 0) {
    return {
      damageRolls: new Array(16).fill(0),
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      hpMax: defender?.stats?.hp || 100,
      koVerdict: `Does not affect ${defender.name || "the target"} (Immune)`,
      description: "0% (Immune)",
      effectiveness: 0,
    };
  }

  // Tinted Lens: doubles damage of not very effective moves (below 1x effectiveness)
  if (atkAbility === "tinted lens" && typeMult < 1) {
    typeMult *= 2.0;
  }

  // Calculate Base Stats
  const rawAttackerStat = isPhysical
    ? (attacker.stats?.attack || calculateStat("attack", attacker.baseStats?.attack, attacker.ivs?.attack, attacker.evs?.attack, level, attacker.nature))
    : (attacker.stats?.["special-attack"] || calculateStat("special-attack", attacker.baseStats?.["special-attack"], attacker.ivs?.["special-attack"], attacker.evs?.["special-attack"], level, attacker.nature));

  const rawDefenderStat = isPhysical
    ? (defender.stats?.defense || calculateStat("defense", defender.baseStats?.defense, defender.ivs?.defense, defender.evs?.defense, defender.level || level, defender.nature))
    : (defender.stats?.["special-defense"] || calculateStat("special-defense", defender.baseStats?.["special-defense"], defender.ivs?.["special-defense"], defender.evs?.["special-defense"], defender.level || level, defender.nature));

  const defenderMaxHp = defender.stats?.hp || calculateStat("hp", defender.baseStats?.hp, defender.ivs?.hp, defender.evs?.hp, defender.level || level, defender.nature);

  // Apply Stat Stages (Crit ignores defender positive boosts & attacker negative drops)
  let atkStage = (isPhysical ? attacker.stages?.attack : attacker.stages?.["special-attack"]) || 0;
  let defStage = (isPhysical ? defender.stages?.defense : defender.stages?.["special-defense"]) || 0;

  // Unaware checks
  if (defAbility === "unaware") atkStage = 0;
  if (atkAbility === "unaware") defStage = 0;

  if (isCrit) {
    if (atkStage < 0) atkStage = 0;
    if (defStage > 0) defStage = 0;
  }

  let finalAtk = rawAttackerStat * getStageMultiplier(atkStage);
  let finalDef = rawDefenderStat * getStageMultiplier(defStage);

  // Attacker Ability modifiers on Attack Stat
  if (isPhysical && (atkAbility === "huge power" || atkAbility === "pure power")) {
    finalAtk *= 2.0;
  }
  if (isPhysical && atkAbility === "guts" && attacker.status && attacker.status !== "healthy") {
    finalAtk *= 1.5;
  }
  const atkItem = (attacker.item || "").toLowerCase();
  const defItem = (defender.item || "").toLowerCase();

  if (
    (atkAbility === "protosynthesis" && (field.weather === "sun" || atkItem === "booster energy")) ||
    (atkAbility === "quark drive" && (field.terrain === "electric" || atkItem === "booster energy"))
  ) {
    finalAtk *= 1.3;
  }
  if (atkAbility === "sword of ruin" && isPhysical) {
    finalDef *= 0.75;
  }
  if (atkAbility === "beads of ruin" && !isPhysical) {
    finalDef *= 0.75;
  }
  if (defAbility === "tablets of ruin" && isPhysical) {
    finalAtk *= 0.75;
  }
  if (defAbility === "vessel of ruin" && !isPhysical) {
    finalAtk *= 0.75;
  }

  // Defender Ability modifiers on Defense Stat
  if (isPhysical && defAbility === "fur coat") {
    finalDef *= 2.0;
  }
  if (isPhysical && defAbility === "fluffy" && move.isContact) {
    // Fluffy halves contact
  }

  // Item modifiers on Stat
  if (isPhysical && atkItem === "choice band") finalAtk *= 1.5;
  if (!isPhysical && atkItem === "choice specs") finalAtk *= 1.5;
  if (!isPhysical && defItem === "assault vest") finalDef *= 1.5;
  if (defItem === "eviolite") finalDef *= 1.5;

  // Weather boosts to Defense:
  // Sandstorm boosts Rock-type Sp. Def by 1.5x
  if (field.weather === "sandstorm" && !isPhysical && defTypes.includes("rock")) {
    finalDef *= 1.5;
  }
  // Snow boosts Ice-type Defense by 1.5x
  if (field.weather === "snow" && isPhysical && defTypes.includes("ice")) {
    finalDef *= 1.5;
  }

  // Base Damage core formula:
  // ((((2 * Level) / 5) + 2) * BasePower * A / D) / 50 + 2
  const levelPart = Math.floor((2 * level) / 5) + 2;
  let baseDamage = Math.floor(Math.floor((levelPart * basePower * finalAtk) / finalDef) / 50) + 2;

  // Field Target (Doubles spread move)
  if (field.isDoubles && move.isSpread) {
    baseDamage = Math.floor(baseDamage * 0.75);
  }

  // Weather modifiers on move
  if (field.weather === "sun") {
    if (moveType === "fire") baseDamage = Math.floor(baseDamage * 1.5);
    else if (moveType === "water" && move.name?.toLowerCase() !== "hydro steam") {
      baseDamage = Math.floor(baseDamage * 0.5);
    } else if (moveType === "water" && move.name?.toLowerCase() === "hydro steam") {
      baseDamage = Math.floor(baseDamage * 1.5);
    }
  } else if (field.weather === "rain") {
    if (moveType === "water") baseDamage = Math.floor(baseDamage * 1.5);
    else if (moveType === "fire") baseDamage = Math.floor(baseDamage * 0.5);
  }

  // Critical hit multiplier (Gen 6+ is 1.5x, Sniper boosts to 2.25x)
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * (atkAbility === "sniper" ? 2.25 : 1.5));
  }

  // Water Bubble attacker bonus
  if (atkAbility === "water bubble" && moveType === "water") {
    baseDamage = Math.floor(baseDamage * 2.0);
  }

  // Terrain modifiers
  if (field.terrain === "electric" && moveType === "electric") {
    baseDamage = Math.floor(baseDamage * 1.3);
  } else if (field.terrain === "grassy") {
    if (moveType === "grass") baseDamage = Math.floor(baseDamage * 1.3);
    if (["earthquake", "bulldoze", "magnitude"].includes(move.name?.toLowerCase())) {
      baseDamage = Math.floor(baseDamage * 0.5);
    }
  } else if (field.terrain === "psychic" && moveType === "psychic") {
    baseDamage = Math.floor(baseDamage * 1.3);
  } else if (field.terrain === "misty" && moveType === "dragon") {
    baseDamage = Math.floor(baseDamage * 0.5);
  }

  // STAB calculation
  const originalTypes = (attacker.types || []).map((t) => t.toLowerCase());
  const isOriginalType = originalTypes.includes(moveType);
  let stab = 1.0;

  if (attacker.isTera && attacker.teraType) {
    const isTeraType = attacker.teraType.toLowerCase() === moveType;
    if (isOriginalType && isTeraType) {
      stab = atkAbility === "adaptability" ? 2.25 : 2.0;
    } else if (isTeraType) {
      stab = atkAbility === "adaptability" ? 2.0 : 1.5;
    } else if (isOriginalType) {
      stab = atkAbility === "adaptability" ? 2.0 : 1.5;
    }
  } else if (isOriginalType) {
    stab = atkAbility === "adaptability" ? 2.0 : 1.5;
  }

  // Other item & ability multipliers
  let itemMult = 1.0;
  if (atkItem === "life orb") itemMult *= 1.3;
  if (atkItem === "expert belt" && typeMult > 1) itemMult *= 1.2;

  let otherAbilityMult = 1.0;
  if (defAbility === "multiscale" || defAbility === "shadow shield") {
    if ((defender.currentHpPercent || 100) >= 100) {
      otherAbilityMult *= 0.5;
    }
  }
  if (defAbility === "fluffy") {
    if (move.isContact) otherAbilityMult *= 0.5;
    if (moveType === "fire") otherAbilityMult *= 2.0;
  }
  if (defAbility === "thick fat" && (moveType === "fire" || moveType === "ice")) {
    otherAbilityMult *= 0.5;
  }

  // Burn modifier (halves physical move damage unless Guts or Facade)
  // Note: Fire-type Pokémon are completely immune to burn unless Terastallized into a non-Fire type
  let burnMult = 1.0;
  const atkEffectiveTypes = (attacker.isTera && attacker.teraType)
    ? [attacker.teraType.toLowerCase()]
    : (attacker.types || []).map((t) => (typeof t === "string" ? t : t?.type?.name || "").toLowerCase());
  const isAttackerFireType = atkEffectiveTypes.includes("fire");

  if (
    isPhysical &&
    attacker.status === "burn" &&
    !isAttackerFireType &&
    atkAbility !== "guts" &&
    move.name?.toLowerCase() !== "facade"
  ) {
    burnMult = 0.5;
  }

  // Screens (Reflect / Light Screen / Aurora Veil)
  let screenMult = 1.0;
  if (!isCrit) {
    if (field.auroraVeil) {
      screenMult *= field.isDoubles ? 0.66 : 0.5;
    } else if (isPhysical && field.reflect) {
      screenMult *= field.isDoubles ? 0.66 : 0.5;
    } else if (!isPhysical && field.lightScreen) {
      screenMult *= field.isDoubles ? 0.66 : 0.5;
    }
  }

  // Compute 16 discrete damage rolls (from 85% to 100%)
  const damageRolls = [];
  for (let roll = 85; roll <= 100; roll++) {
    let d = Math.floor((baseDamage * roll) / 100);
    d = Math.floor(d * stab);
    d = Math.floor(d * typeMult);
    d = Math.floor(d * burnMult);
    d = Math.floor(d * itemMult);
    d = Math.floor(d * otherAbilityMult);
    d = Math.floor(d * screenMult);
    damageRolls.push(Math.max(1, d));
  }

  const minDamage = damageRolls[0];
  const maxDamage = damageRolls[damageRolls.length - 1];

  const minPercent = Number(((minDamage / defenderMaxHp) * 100).toFixed(1));
  const maxPercent = Number(((maxDamage / defenderMaxHp) * 100).toFixed(1));

  // Determine KO Probability
  const kills = damageRolls.filter((d) => d >= defenderMaxHp).length;
  let koVerdict = "";

  if (kills === 16) {
    koVerdict = "Guaranteed OHKO (100% chance to KO)";
  } else if (kills > 0) {
    const pct = ((kills / 16) * 100).toFixed(1);
    koVerdict = `${pct}% chance to OHKO`;
  } else {
    // 2HKO check
    const min2Hit = minDamage * 2;
    const max2Hit = maxDamage * 2;
    if (min2Hit >= defenderMaxHp) {
      koVerdict = "Guaranteed 2HKO";
    } else if (max2Hit >= defenderMaxHp) {
      koVerdict = "Possible 2HKO";
    } else {
      koVerdict = "Does not 2HKO (3+ hits needed)";
    }
  }

  const description = `${minDamage} - ${maxDamage} (${minPercent}% - ${maxPercent}%) — ${koVerdict}`;

  return {
    damageRolls,
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    hpMax: defenderMaxHp,
    koVerdict,
    description,
    effectiveness: typeMult,
    stab,
  };
}
