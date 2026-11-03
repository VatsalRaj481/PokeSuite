import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import TypeBadge from "./TypeBadge";
import NatureChartModal from "./NatureChartModal";
import { calculateDamage } from "../utils/damageCalc.js";
import {
  NATURES,
  COMPETITIVE_ITEMS,
  COMPETITIVE_ABILITIES,
  EV_PRESETS,
  getGmaxMoveForPokemon,
  GENERIC_MAX_MOVES,
} from "../utils/calcData.js";

const POPULAR_ATTACKERS = [
  { id: 987, name: "flutter-mane", displayName: "Flutter Mane", types: ["ghost", "fairy"], baseStats: { hp: 55, attack: 55, defense: 55, "special-attack": 135, "special-defense": 135, speed: 135 } },
  { id: 6, name: "charizard", displayName: "Charizard", types: ["fire", "flying"], baseStats: { hp: 78, attack: 84, defense: 78, "special-attack": 109, "special-defense": 85, speed: 100 } },
  { id: 892, name: "urshifu", displayName: "Urshifu", types: ["fighting", "dark"], baseStats: { hp: 100, attack: 130, defense: 100, "special-attack": 63, "special-defense": 60, speed: 97 } },
  { id: 815, name: "cinderace", displayName: "Cinderace", types: ["fire"], baseStats: { hp: 80, attack: 116, defense: 75, "special-attack": 65, "special-defense": 75, speed: 119 } },
  { id: 94, name: "gengar", displayName: "Gengar", types: ["ghost", "poison"], baseStats: { hp: 60, attack: 65, defense: 60, "special-attack": 130, "special-defense": 75, speed: 110 } },
  { id: 1004, name: "chi-yu", displayName: "Chi-Yu", types: ["dark", "fire"], baseStats: { hp: 55, attack: 80, defense: 80, "special-attack": 135, "special-defense": 120, speed: 100 } },
  { id: 149, name: "dragonite", displayName: "Dragonite", types: ["dragon", "flying"], baseStats: { hp: 91, attack: 134, defense: 95, "special-attack": 100, "special-defense": 100, speed: 80 } },
  { id: 382, name: "kyogre", displayName: "Kyogre", types: ["water"], baseStats: { hp: 100, attack: 100, defense: 90, "special-attack": 150, "special-defense": 140, speed: 90 } },
  { id: 1008, name: "miraidon", displayName: "Miraidon", types: ["electric", "dragon"], baseStats: { hp: 100, attack: 85, defense: 100, "special-attack": 135, "special-defense": 115, speed: 135 } },
  { id: 445, name: "garchomp", displayName: "Garchomp", types: ["dragon", "ground"], baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 } },
];

const POPULAR_DEFENDERS = [
  { id: 1003, name: "ting-lu", displayName: "Ting-Lu", types: ["dark", "ground"], baseStats: { hp: 155, attack: 110, defense: 125, "special-attack": 55, "special-defense": 80, speed: 45 } },
  { id: 823, name: "corviknight", displayName: "Corviknight", types: ["flying", "steel"], baseStats: { hp: 98, attack: 87, defense: 105, "special-attack": 53, "special-defense": 85, speed: 67 } },
  { id: 131, name: "lapras", displayName: "Lapras", types: ["water", "ice"], baseStats: { hp: 130, attack: 85, defense: 80, "special-attack": 85, "special-defense": 95, speed: 60 } },
  { id: 143, name: "snorlax", displayName: "Snorlax", types: ["normal"], baseStats: { hp: 160, attack: 110, defense: 65, "special-attack": 65, "special-defense": 110, speed: 30 } },
  { id: 977, name: "dondozo", displayName: "Dondozo", types: ["water"], baseStats: { hp: 150, attack: 100, defense: 115, "special-attack": 65, "special-defense": 65, speed: 35 } },
  { id: 727, name: "incineroar", displayName: "Incineroar", types: ["fire", "dark"], baseStats: { hp: 95, attack: 115, defense: 90, "special-attack": 80, "special-defense": 90, speed: 60 } },
  { id: 1000, name: "gholdengo", displayName: "Gholdengo", types: ["steel", "ghost"], baseStats: { hp: 87, attack: 60, defense: 95, "special-attack": 133, "special-defense": 91, speed: 84 } },
  { id: 598, name: "ferrothorn", displayName: "Ferrothorn", types: ["grass", "steel"], baseStats: { hp: 74, attack: 94, defense: 131, "special-attack": 54, "special-defense": 116, speed: 20 } },
  { id: 645, name: "landorus-therian", displayName: "Landorus-T", types: ["ground", "flying"], baseStats: { hp: 89, attack: 145, defense: 90, "special-attack": 105, "special-defense": 80, speed: 91 } },
  { id: 242, name: "blissey", displayName: "Blissey", types: ["normal"], baseStats: { hp: 255, attack: 10, defense: 10, "special-attack": 75, "special-defense": 135, speed: 55 } },
];

const COMMON_MOVES = [
  { name: "Moonblast", type: "fairy", power: 95, category: "special", isContact: false },
  { name: "Shadow Ball", type: "ghost", power: 80, category: "special", isContact: false },
  { name: "Close Combat", type: "fighting", power: 120, category: "physical", isContact: true },
  { name: "Earthquake", type: "ground", power: 100, category: "physical", isContact: false, isSpread: true },
  { name: "Overheat", type: "fire", power: 130, category: "special", isContact: false },
  { name: "Flamethrower", type: "fire", power: 90, category: "special", isContact: false },
  { name: "Water Spout", type: "water", power: 150, category: "special", isContact: false, isSpread: true },
  { name: "Hydro Pump", type: "water", power: 110, category: "special", isContact: false },
  { name: "Surging Strikes", type: "water", power: 25, category: "physical", isContact: true },
  { name: "Electro Drift", type: "electric", power: 100, category: "special", isContact: false },
  { name: "Thunderbolt", type: "electric", power: 90, category: "special", isContact: false },
  { name: "Ice Beam", type: "ice", power: 90, category: "special", isContact: false },
  { name: "Extreme Speed", type: "normal", power: 80, category: "physical", isContact: true },
  { name: "Make It Rain", type: "steel", power: 120, category: "special", isContact: false, isSpread: true },
  { name: "Outrage", type: "dragon", power: 120, category: "physical", isContact: true },
  { name: "Draco Meteor", type: "dragon", power: 130, category: "special", isContact: false },
  { name: "U-turn", type: "bug", power: 70, category: "physical", isContact: true },
  { name: "Knock Off", type: "dark", power: 65, category: "physical", isContact: true },
  { name: "Tera Blast", type: "normal", power: 80, category: "special", isContact: false },
];

export function getStatusImmunities(types = [], isTera = false, teraType = "") {
  const effectiveTypes = (isTera && teraType)
    ? [teraType.toLowerCase()]
    : types.map((t) => (typeof t === "string" ? t : t?.type?.name || "").toLowerCase()).filter(Boolean);

  return {
    isBurnImmune: effectiveTypes.includes("fire"),
    isElectricImmune: effectiveTypes.includes("electric"),
    isPoisonImmune: effectiveTypes.includes("steel") || effectiveTypes.includes("poison"),
  };
}

export default function DamageCalculator({ pokemonList = [] }) {
  // Attacker State
  const [attackerPokemon, setAttackerPokemon] = useState(POPULAR_ATTACKERS[0]);
  const [attackerLevel, setAttackerLevel] = useState(50);
  const [attackerNature, setAttackerNature] = useState("Modest");
  const [attackerAbility, setAttackerAbility] = useState("Protosynthesis");
  const [attackerItem, setAttackerItem] = useState("Choice Specs");
  const [attackerStatus, setAttackerStatus] = useState("healthy");
  const [attackerIsTera, setAttackerIsTera] = useState(false);
  const [attackerTeraType, setAttackerTeraType] = useState("fairy");
  const [attackerIsDynamax, setAttackerIsDynamax] = useState(false);
  const [attackerUseGmaxMove, setAttackerUseGmaxMove] = useState(true);
  const [attackerStages, setAttackerStages] = useState({ attack: 0, "special-attack": 0, speed: 0 });
  const [attackerEvs, setAttackerEvs] = useState({ hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 });

  // Move State
  const [selectedMove, setSelectedMove] = useState(COMMON_MOVES[0]);
  const [customMovePower, setCustomMovePower] = useState(95);
  const [customMoveType, setCustomMoveType] = useState("fairy");
  const [customMoveCategory, setCustomMoveCategory] = useState("special");
  const [isCrit, setIsCrit] = useState(false);

  // Defender State
  const [defenderPokemon, setDefenderPokemon] = useState(POPULAR_DEFENDERS[0]);
  const [defenderLevel, setDefenderLevel] = useState(50);
  const [defenderNature, setDefenderNature] = useState("Careful");
  const [defenderAbility, setDefenderAbility] = useState("Vessel of Ruin");
  const [defenderItem, setDefenderItem] = useState("Assault Vest");
  const [defenderStatus, setDefenderStatus] = useState("healthy");
  const [defenderIsTera, setDefenderIsTera] = useState(false);
  const [defenderTeraType, setDefenderTeraType] = useState("poison");
  const [defenderIsDynamax, setDefenderIsDynamax] = useState(false);
  const [defenderStages, setDefenderStages] = useState({ defense: 0, "special-defense": 0 });
  const [defenderEvs, setDefenderEvs] = useState({ hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 });
  const [defenderHpPercent, setDefenderHpPercent] = useState(100);

  // Gigantamax (G-Max) form metadata
  const attackerGmaxData = useMemo(
    () => getGmaxMoveForPokemon(attackerPokemon?.name),
    [attackerPokemon]
  );
  const defenderGmaxData = useMemo(
    () => getGmaxMoveForPokemon(defenderPokemon?.name),
    [defenderPokemon]
  );

  // Field State
  const [field, setField] = useState({
    weather: "none", // none, sun, rain, sandstorm, snow
    terrain: "none", // none, electric, grassy, psychic, misty
    isDoubles: false,
    reflect: false,
    lightScreen: false,
    auroraVeil: false,
  });

  // Status condition immunities based on typing and Terastallization
  const attackerImmunities = useMemo(() => {
    return getStatusImmunities(attackerPokemon?.types, attackerIsTera, attackerTeraType);
  }, [attackerPokemon, attackerIsTera, attackerTeraType]);

  const defenderImmunities = useMemo(() => {
    return getStatusImmunities(defenderPokemon?.types, defenderIsTera, defenderTeraType);
  }, [defenderPokemon, defenderIsTera, defenderTeraType]);

  // Auto-clear impossible status conditions when typing changes
  useEffect(() => {
    if (attackerStatus === "burn" && attackerImmunities.isBurnImmune) {
      setAttackerStatus("healthy");
    } else if (attackerStatus === "poison" && attackerImmunities.isPoisonImmune) {
      setAttackerStatus("healthy");
    } else if (attackerStatus === "paralysis" && attackerImmunities.isElectricImmune) {
      setAttackerStatus("healthy");
    }
  }, [attackerImmunities, attackerStatus]);

  useEffect(() => {
    if (defenderStatus === "burn" && defenderImmunities.isBurnImmune) {
      setDefenderStatus("healthy");
    } else if (defenderStatus === "poison" && defenderImmunities.isPoisonImmune) {
      setDefenderStatus("healthy");
    } else if (defenderStatus === "paralysis" && defenderImmunities.isElectricImmune) {
      setDefenderStatus("healthy");
    }
  }, [defenderImmunities, defenderStatus]);

  // Search filter states
  const [attackerSearch, setAttackerSearch] = useState("");
  const [defenderSearch, setDefenderSearch] = useState("");
  const [isSearchingAttacker, setIsSearchingAttacker] = useState(false);
  const [isSearchingDefender, setIsSearchingDefender] = useState(false);
  const [showNatureModal, setShowNatureModal] = useState(false);
  const [natureModalTarget, setNatureModalTarget] = useState("attacker");

  // Quick helper to map pokemon object
  const mapPokemonToFighter = (p) => {
    const statsObj = {};
    if (p.stats && Array.isArray(p.stats)) {
      p.stats.forEach((s) => {
        statsObj[s.stat.name] = s.base_stat;
      });
    } else {
      statsObj.hp = p.baseStats?.hp || 80;
      statsObj.attack = p.baseStats?.attack || 80;
      statsObj.defense = p.baseStats?.defense || 80;
      statsObj["special-attack"] = p.baseStats?.["special-attack"] || 80;
      statsObj["special-defense"] = p.baseStats?.["special-defense"] || 80;
      statsObj.speed = p.baseStats?.speed || 80;
    }
    const typesList = p.types ? p.types.map((t) => (typeof t === "string" ? t : t.type.name)) : ["normal"];
    return {
      id: p.id,
      name: p.name,
      displayName: p.displayName || p.name.replace(/-/g, " "),
      types: typesList,
      baseStats: statsObj,
    };
  };

  // Filtered Pokémon list for attacker/defender searches
  const filteredAttackerList = useMemo(() => {
    if (!attackerSearch.trim()) return POPULAR_ATTACKERS;
    const q = attackerSearch.toLowerCase();
    const source = pokemonList.length > 0 ? pokemonList : POPULAR_ATTACKERS;
    return source.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8).map(mapPokemonToFighter);
  }, [attackerSearch, pokemonList]);

  const filteredDefenderList = useMemo(() => {
    if (!defenderSearch.trim()) return POPULAR_DEFENDERS;
    const q = defenderSearch.toLowerCase();
    const source = pokemonList.length > 0 ? pokemonList : POPULAR_DEFENDERS;
    return source.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8).map(mapPokemonToFighter);
  }, [defenderSearch, pokemonList]);

  // Run calculation
  const calcResult = useMemo(() => {
    let activeMove = {
      name: selectedMove.name,
      type: customMoveType,
      power: Number(customMovePower),
      category: customMoveCategory,
      isContact: selectedMove.isContact || false,
      isSpread: selectedMove.isSpread || false,
    };

    if (attackerIsDynamax) {
      if (attackerGmaxData && attackerUseGmaxMove) {
        activeMove = {
          name: attackerGmaxData.move,
          type: attackerGmaxData.type,
          power: attackerGmaxData.power,
          category: customMoveCategory,
          isContact: false,
          isGmax: true,
          effect: attackerGmaxData.effect,
        };
      } else {
        const moveTyping = (customMoveType || selectedMove.type || "normal").toLowerCase();
        activeMove = {
          name: GENERIC_MAX_MOVES[moveTyping] || `Max ${moveTyping.toUpperCase()}`,
          type: moveTyping,
          power: Number(customMovePower),
          category: customMoveCategory,
          isContact: false,
          isGmax: false,
        };
      }
    }

    return calculateDamage({
      attacker: {
        name: attackerPokemon.displayName,
        types: attackerPokemon.types,
        baseStats: attackerPokemon.baseStats,
        level: attackerLevel,
        nature: attackerNature,
        ability: attackerAbility,
        item: attackerItem,
        status: attackerStatus,
        isTera: attackerIsTera,
        teraType: attackerTeraType,
        isDynamax: attackerIsDynamax,
        isGmax: attackerIsDynamax && Boolean(attackerGmaxData),
        stages: attackerStages,
        evs: attackerEvs,
      },
      defender: {
        name: defenderPokemon.displayName,
        types: defenderPokemon.types,
        baseStats: defenderPokemon.baseStats,
        level: defenderLevel,
        nature: defenderNature,
        ability: defenderAbility,
        item: defenderItem,
        status: defenderStatus,
        isTera: defenderIsTera,
        teraType: defenderTeraType,
        isDynamax: defenderIsDynamax,
        isGmax: defenderIsDynamax && Boolean(defenderGmaxData),
        stages: defenderStages,
        evs: defenderEvs,
        currentHpPercent: defenderHpPercent,
      },
      move: activeMove,
      field,
      isCrit,
    });
  }, [
    attackerPokemon, attackerLevel, attackerNature, attackerAbility, attackerItem, attackerStatus,
    attackerIsTera, attackerTeraType, attackerIsDynamax, attackerUseGmaxMove, attackerGmaxData, attackerStages, attackerEvs,
    defenderPokemon, defenderLevel, defenderNature, defenderAbility, defenderItem, defenderStatus,
    defenderIsTera, defenderTeraType, defenderIsDynamax, defenderGmaxData, defenderStages, defenderEvs, defenderHpPercent,
    selectedMove, customMovePower, customMoveType, customMoveCategory, isCrit, field,
  ]);

  const handleSelectMove = (m) => {
    setSelectedMove(m);
    setCustomMovePower(m.power);
    setCustomMoveType(m.type);
    setCustomMoveCategory(m.category);
  };

  const getSpriteUrl = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 flex flex-col gap-6">
      {/* Top Banner / Output HUD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-surface border border-theme rounded-2xl p-4 sm:p-6 shadow-md"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Attacker vs Defender mini preview */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 w-full lg:w-auto">
            <div className="flex flex-col items-center text-center min-w-0 max-w-[110px] sm:max-w-none">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center relative transition-transform duration-300 ${
                attackerIsDynamax ? "scale-105" : ""
              }`}>
                {attackerIsDynamax && (
                  <div className="absolute -inset-1 rounded-full bg-red-600/25 blur-sm animate-pulse" />
                )}
                <img
                  src={getSpriteUrl(attackerPokemon.id)}
                  alt={attackerPokemon.displayName}
                  className={`max-h-full max-w-full object-contain filter drop-shadow relative z-10 transition-all ${
                    attackerIsDynamax ? "drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]" : ""
                  }`}
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${attackerPokemon.id}.png`;
                  }}
                />
                {attackerIsDynamax && (
                  <span className="absolute -top-1 -right-1 z-20 px-1.5 py-0.5 rounded-full text-[9px] font-mono-tech font-black uppercase tracking-wider bg-red-600 text-white shadow-md border border-red-400">
                    {attackerGmaxData ? "G-MAX" : "D-MAX"}
                  </span>
                )}
              </div>
              <span className="font-display font-extrabold text-xs sm:text-sm text-theme-primary capitalize truncate max-w-full">
                {attackerPokemon.displayName}
              </span>
              <div className="flex flex-wrap justify-center gap-1 mt-0.5 max-w-[100px] sm:max-w-none">
                {attackerPokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center px-1">
              <span className="text-lg sm:text-2xl font-black font-display text-theme-accent animate-pulse">
                VS
              </span>
              <span className={`text-[10px] font-mono-tech uppercase mt-0.5 text-center truncate max-w-[90px] sm:max-w-[140px] font-bold ${
                calcResult.effectiveMoveName?.startsWith("G-Max")
                  ? "text-red-400"
                  : calcResult.effectiveMoveName?.startsWith("Max ")
                  ? "text-amber-400"
                  : "text-theme-secondary"
              }`}>
                {calcResult.effectiveMoveName || selectedMove.name}
              </span>
            </div>

            <div className="flex flex-col items-center text-center min-w-0 max-w-[110px] sm:max-w-none">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center relative transition-transform duration-300 ${
                defenderIsDynamax ? "scale-105" : ""
              }`}>
                {defenderIsDynamax && (
                  <div className="absolute -inset-1 rounded-full bg-red-600/25 blur-sm animate-pulse" />
                )}
                <img
                  src={getSpriteUrl(defenderPokemon.id)}
                  alt={defenderPokemon.displayName}
                  className={`max-h-full max-w-full object-contain filter drop-shadow relative z-10 transition-all ${
                    defenderIsDynamax ? "drop-shadow-[0_0_12px_rgba(239,68,68,0.85)]" : ""
                  }`}
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${defenderPokemon.id}.png`;
                  }}
                />
                {defenderIsDynamax && (
                  <span className="absolute -top-1 -right-1 z-20 px-1.5 py-0.5 rounded-full text-[9px] font-mono-tech font-black uppercase tracking-wider bg-red-600 text-white shadow-md border border-red-400">
                    {defenderGmaxData ? "G-MAX" : "D-MAX"}
                  </span>
                )}
              </div>
              <span className="font-display font-extrabold text-xs sm:text-sm text-theme-primary capitalize truncate max-w-full">
                {defenderPokemon.displayName}
              </span>
              <div className="flex flex-wrap justify-center gap-1 mt-0.5 max-w-[100px] sm:max-w-none">
                {defenderPokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Damage Hero Display */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-end text-center lg:text-right">
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-end">
              <span className="text-2xl sm:text-3xl font-mono-tech font-extrabold text-rose-500">
                {calcResult.minDamage} - {calcResult.maxDamage}
              </span>
              <span className="text-xl sm:text-2xl font-mono-tech font-bold text-theme-primary">
                ({calcResult.minPercent}% - {calcResult.maxPercent}%)
              </span>
            </div>

            <p className="text-sm sm:text-base font-display font-bold text-emerald-400 mt-1">
              {calcResult.koVerdict}
            </p>

            {/* Defender HP Bar visualization */}
            <div className="w-full max-w-md mt-3 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-mono-tech text-theme-secondary">
                <span>
                  Defender HP: {calcResult.hpMax} max
                  {defenderIsDynamax && <span className="ml-1 text-red-400 font-bold">(Dynamax 2×)</span>}
                </span>
                <span>
                  Remaining:{" "}
                  {Math.max(0, calcResult.hpMax - calcResult.maxDamage)} -{" "}
                  {Math.max(0, calcResult.hpMax - calcResult.minDamage)} HP
                </span>
              </div>
              <div className="w-full h-3.5 bg-theme-input/70 rounded-full overflow-hidden p-0.5 border border-theme flex">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500"
                  style={{
                    width: `${Math.max(0, 100 - calcResult.maxPercent)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 16 Rolls Pills */}
        <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-theme-secondary font-mono-tech uppercase text-[10px] font-bold">
            16 Damage Rolls (85% → 100%):
          </span>
          <div className="flex flex-wrap gap-1">
            {calcResult.damageRolls.map((roll, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-theme-bg text-[10px] font-mono-tech text-theme-primary border border-theme"
              >
                {roll}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main 3-Column Interface: Attacker | Field | Defender */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attacker (5 cols) */}
        <div className="lg:col-span-5 bg-theme-surface border border-theme rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-theme pb-3">
            <h3 className="font-display font-extrabold text-sm sm:text-base text-theme-primary uppercase tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Attacker Configuration
            </h3>
            <button
              type="button"
              onClick={() => setIsSearchingAttacker(!isSearchingAttacker)}
              className="text-xs font-display font-bold text-theme-accent hover:underline cursor-pointer"
            >
              {isSearchingAttacker ? "Close Search" : "Change Pokémon"}
            </button>
          </div>

          {/* Attacker Search Modal/Dropdown */}
          {isSearchingAttacker && (
            <div className="bg-theme-bg border border-theme rounded-xl p-3 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Search attacker by name..."
                value={attackerSearch}
                onChange={(e) => setAttackerSearch(e.target.value)}
                className="w-full px-3 py-1.5 bg-theme-surface border border-theme rounded-lg text-xs font-display text-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-accent"
              />
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                {filteredAttackerList.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setAttackerPokemon(p);
                      setIsSearchingAttacker(false);
                      setAttackerSearch("");
                    }}
                    className="p-1.5 bg-theme-surface hover:bg-theme-surface-hover rounded-lg text-left text-xs font-display text-theme-primary flex items-center gap-2 cursor-pointer capitalize"
                  >
                    <span>{p.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Level, Nature & Ability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Level
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={attackerLevel}
                onChange={(e) => setAttackerLevel(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-mono-tech text-theme-primary text-center"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
                  Nature
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNatureModalTarget("attacker");
                    setShowNatureModal(true);
                  }}
                  className="text-[9px] font-mono-tech text-indigo-400 hover:text-indigo-300 font-bold uppercase cursor-pointer"
                  title="Open 5×5 Nature Stat Matrix"
                >
                  5×5 Chart
                </button>
              </div>
              <select
                value={attackerNature}
                onChange={(e) => setAttackerNature(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {NATURES.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Ability
              </label>
              <select
                value={attackerAbility}
                onChange={(e) => setAttackerAbility(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {COMPETITIVE_ABILITIES.map((ab) => (
                  <option key={ab} value={ab}>
                    {ab}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Held Item
              </label>
              <select
                value={attackerItem}
                onChange={(e) => setAttackerItem(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {COMPETITIVE_ITEMS.map((it) => (
                  <option key={it.name} value={it.name}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Status Condition
              </label>
              <select
                value={attackerStatus}
                onChange={(e) => setAttackerStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer capitalize"
              >
                <option value="healthy">Healthy</option>
                <option value="burn" disabled={attackerImmunities.isBurnImmune}>
                  {attackerImmunities.isBurnImmune ? "Burned (Immune: Fire-type)" : "Burned (Atk halved)"}
                </option>
                <option value="paralysis" disabled={attackerImmunities.isElectricImmune}>
                  {attackerImmunities.isElectricImmune ? "Paralyzed (Immune: Electric)" : "Paralyzed"}
                </option>
                <option value="poison" disabled={attackerImmunities.isPoisonImmune}>
                  {attackerImmunities.isPoisonImmune ? "Poisoned (Immune: Steel/Poison)" : "Poisoned"}
                </option>
              </select>
            </div>
          </div>

          {/* Terastallize */}
          <div className="flex items-center justify-between p-2.5 bg-theme-bg border border-theme rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-display font-bold text-theme-primary">
              <input
                type="checkbox"
                checked={attackerIsTera}
                onChange={(e) => {
                  setAttackerIsTera(e.target.checked);
                  if (e.target.checked) setAttackerIsDynamax(false);
                }}
                className="rounded text-theme-accent cursor-pointer"
              />
              <span>Terastallize</span>
            </label>
            {attackerIsTera && (
              <select
                value={attackerTeraType}
                onChange={(e) => setAttackerTeraType(e.target.value)}
                className="px-2 py-1 bg-theme-surface border border-theme rounded text-xs font-display text-theme-primary cursor-pointer capitalize"
              >
                {[
                  "normal", "fire", "water", "grass", "electric", "ice",
                  "fighting", "poison", "ground", "flying", "psychic", "bug",
                  "rock", "ghost", "dragon", "steel", "dark", "fairy", "stellar"
                ].map((t) => (
                  <option key={t} value={t}>
                    Tera {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dynamax / Gigantamax Form */}
          <div className="flex flex-col gap-2 p-2.5 bg-theme-bg border border-theme rounded-xl">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-display font-bold text-theme-primary">
                <input
                  type="checkbox"
                  checked={attackerIsDynamax}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAttackerIsDynamax(checked);
                    if (checked) {
                      setAttackerIsTera(false);
                      if (attackerGmaxData) setAttackerUseGmaxMove(true);
                    }
                  }}
                  className="rounded text-red-500 cursor-pointer accent-red-500"
                />
                <span>Dynamax / Gigantamax</span>
              </label>
              {attackerGmaxData ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-extrabold uppercase bg-red-600/20 text-red-400 border border-red-500/40">
                  G-MAX Available
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-theme-surface text-theme-secondary border border-theme">
                  D-MAX Form
                </span>
              )}
            </div>

            {attackerIsDynamax && (
              <div className="pt-2 border-t border-theme/60 flex flex-col gap-2 text-xs">
                {attackerGmaxData ? (
                  <div className="flex flex-col gap-1.5 bg-red-950/20 border border-red-500/30 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-extrabold text-xs text-red-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        Signature G-Max Move
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono-tech text-theme-primary font-bold">
                        <input
                          type="checkbox"
                          checked={attackerUseGmaxMove}
                          onChange={(e) => setAttackerUseGmaxMove(e.target.checked)}
                          className="accent-red-500 rounded"
                        />
                        <span>Use {attackerGmaxData.move}</span>
                      </label>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono-tech text-theme-secondary">
                      <span>
                        Base Power: <strong className="text-theme-primary font-bold">{attackerGmaxData.power} BP</strong> ({attackerGmaxData.type.toUpperCase()})
                      </span>
                      <span className="px-1.5 py-0.5 bg-red-500/10 text-red-300 rounded text-[9px] font-mono-tech">
                        Non-contact
                      </span>
                    </div>
                    <p className="text-[10px] text-red-300/90 italic font-display leading-tight">
                      Effect: {attackerGmaxData.effect}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-[11px] font-mono-tech text-theme-secondary bg-theme-surface p-2 rounded-lg border border-theme">
                    <div className="flex justify-between items-center">
                      <span>Converts move to:</span>
                      <strong className="text-amber-400 uppercase font-bold">{calcResult.effectiveMoveName}</strong>
                    </div>
                    <span className="text-[10px] text-theme-secondary/80">
                      • Base power scales up to 130–150 BP • Choice items suppressed
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stat Boost Stages */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
              Stat Boost Stages:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {["attack", "special-attack", "speed"].map((st) => (
                <div key={st} className="bg-theme-bg border border-theme rounded-lg p-1.5 flex flex-col items-center">
                  <span className="text-[10px] font-mono-tech uppercase text-theme-secondary">
                    {st === "attack" ? "Atk" : st === "special-attack" ? "SpA" : "Spe"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setAttackerStages((prev) => ({ ...prev, [st]: Math.max(-6, (prev[st] || 0) - 1) }))}
                      className="w-5 h-5 bg-theme-surface hover:bg-theme-surface-hover rounded font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-tech font-bold text-theme-primary w-4">
                      {attackerStages[st] > 0 ? `+${attackerStages[st]}` : attackerStages[st] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttackerStages((prev) => ({ ...prev, [st]: Math.min(6, (prev[st] || 0) + 1) }))}
                      className="w-5 h-5 bg-theme-surface hover:bg-theme-surface-hover rounded font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick EV Presets */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-theme">
            <span className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
              Attacker EV Presets:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {EV_PRESETS.slice(0, 3).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAttackerEvs(preset.evs)}
                  className="px-1.5 py-1 bg-theme-bg hover:bg-theme-surface border border-theme rounded text-[9px] font-mono-tech text-theme-primary truncate cursor-pointer text-center"
                >
                  {preset.label.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Move Selection & Config */}
          <div className="border-t border-theme pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold text-theme-primary uppercase">
                Attack Move
              </span>
              <label className="flex items-center gap-1.5 text-[11px] font-display text-rose-500 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCrit}
                  onChange={(e) => setIsCrit(e.target.checked)}
                  className="rounded cursor-pointer"
                />
                <span>Critical Hit (1.5x)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedMove.name}
                onChange={(e) => {
                  const m = COMMON_MOVES.find((cm) => cm.name === e.target.value);
                  if (m) handleSelectMove(m);
                }}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {COMMON_MOVES.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.power} BP - {m.type})
                  </option>
                ))}
              </select>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="1"
                  max="250"
                  value={customMovePower}
                  onChange={(e) => setCustomMovePower(Number(e.target.value))}
                  placeholder="BP"
                  className="w-16 px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-mono-tech text-theme-primary text-center"
                  title="Base Power"
                />
                <select
                  value={customMoveCategory}
                  onChange={(e) => setCustomMoveCategory(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer capitalize"
                >
                  <option value="physical">Physical</option>
                  <option value="special">Special</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Field & Environment (2 cols) */}
        <div className="lg:col-span-2 bg-theme-surface border border-theme rounded-2xl p-4 flex flex-col gap-4 text-xs font-display">
          <div className="border-b border-theme pb-2 text-center">
            <h3 className="font-extrabold uppercase text-theme-primary tracking-wide text-xs">
              Field & Weather
            </h3>
          </div>

          {/* Battle Format */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono-tech uppercase text-theme-secondary font-bold">Format</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setField((prev) => ({ ...prev, isDoubles: false }))}
                className={`py-1 text-center rounded-lg font-bold border transition-colors cursor-pointer ${
                  !field.isDoubles
                    ? "bg-theme-accent text-white border-theme-accent"
                    : "bg-theme-bg text-theme-secondary border-theme"
                }`}
              >
                Singles
              </button>
              <button
                type="button"
                onClick={() => setField((prev) => ({ ...prev, isDoubles: true }))}
                className={`py-1 text-center rounded-lg font-bold border transition-colors cursor-pointer ${
                  field.isDoubles
                    ? "bg-theme-accent text-white border-theme-accent"
                    : "bg-theme-bg text-theme-secondary border-theme"
                }`}
              >
                Doubles
              </button>
            </div>
          </div>

          {/* Weather */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono-tech uppercase text-theme-secondary font-bold">Weather</span>
            <select
              value={field.weather}
              onChange={(e) => setField((prev) => ({ ...prev, weather: e.target.value }))}
              className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg capitalize text-theme-primary cursor-pointer"
            >
              <option value="none">Clear Skies</option>
              <option value="sun">Harsh Sunlight (Fire 1.5x)</option>
              <option value="rain">Heavy Rain (Water 1.5x)</option>
              <option value="sandstorm">Sandstorm (Rock SpD 1.5x)</option>
              <option value="snow">Snow (Ice Def 1.5x)</option>
            </select>
          </div>

          {/* Terrain */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono-tech uppercase text-theme-secondary font-bold">Terrain</span>
            <select
              value={field.terrain}
              onChange={(e) => setField((prev) => ({ ...prev, terrain: e.target.value }))}
              className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg capitalize text-theme-primary cursor-pointer"
            >
              <option value="none">No Terrain</option>
              <option value="electric">Electric (Elec 1.3x)</option>
              <option value="grassy">Grassy (Grass 1.3x, EQ 0.5x)</option>
              <option value="psychic">Psychic (Psychic 1.3x)</option>
              <option value="misty">Misty (Dragon 0.5x)</option>
            </select>
          </div>

          {/* Screens */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-theme">
            <span className="text-[10px] font-mono-tech uppercase text-theme-secondary font-bold">Screens</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.reflect}
                onChange={(e) => setField((prev) => ({ ...prev, reflect: e.target.checked }))}
                className="rounded"
              />
              <span>Reflect (Phys)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.lightScreen}
                onChange={(e) => setField((prev) => ({ ...prev, lightScreen: e.target.checked }))}
                className="rounded"
              />
              <span>Light Screen (Spec)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.auroraVeil}
                onChange={(e) => setField((prev) => ({ ...prev, auroraVeil: e.target.checked }))}
                className="rounded"
              />
              <span>Aurora Veil</span>
            </label>
          </div>
        </div>

        {/* Right Column: Defender (5 cols) */}
        <div className="lg:col-span-5 bg-theme-surface border border-theme rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-theme pb-3">
            <h3 className="font-display font-extrabold text-sm sm:text-base text-theme-primary uppercase tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              Defender Configuration
            </h3>
            <button
              type="button"
              onClick={() => setIsSearchingDefender(!isSearchingDefender)}
              className="text-xs font-display font-bold text-theme-accent hover:underline cursor-pointer"
            >
              {isSearchingDefender ? "Close Search" : "Change Pokémon"}
            </button>
          </div>

          {/* Defender Search */}
          {isSearchingDefender && (
            <div className="bg-theme-bg border border-theme rounded-xl p-3 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Search defender by name..."
                value={defenderSearch}
                onChange={(e) => setDefenderSearch(e.target.value)}
                className="w-full px-3 py-1.5 bg-theme-surface border border-theme rounded-lg text-xs font-display text-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-accent"
              />
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                {filteredDefenderList.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setDefenderPokemon(p);
                      setIsSearchingDefender(false);
                      setDefenderSearch("");
                    }}
                    className="p-1.5 bg-theme-surface hover:bg-theme-surface-hover rounded-lg text-left text-xs font-display text-theme-primary flex items-center gap-2 cursor-pointer capitalize"
                  >
                    <span>{p.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Level, Nature & Ability */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Level
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={defenderLevel}
                onChange={(e) => setDefenderLevel(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-mono-tech text-theme-primary text-center"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
                  Nature
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNatureModalTarget("defender");
                    setShowNatureModal(true);
                  }}
                  className="text-[9px] font-mono-tech text-indigo-400 hover:text-indigo-300 font-bold uppercase cursor-pointer"
                  title="Open 5×5 Nature Stat Matrix"
                >
                  5×5 Chart
                </button>
              </div>
              <select
                value={defenderNature}
                onChange={(e) => setDefenderNature(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {NATURES.map((n) => (
                  <option key={n.name} value={n.name}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Ability
              </label>
              <select
                value={defenderAbility}
                onChange={(e) => setDefenderAbility(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {COMPETITIVE_ABILITIES.map((ab) => (
                  <option key={ab} value={ab}>
                    {ab}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Held Item
              </label>
              <select
                value={defenderItem}
                onChange={(e) => setDefenderItem(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer"
              >
                {COMPETITIVE_ITEMS.map((it) => (
                  <option key={it.name} value={it.name}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono-tech text-theme-secondary uppercase block mb-1">
                Status Condition
              </label>
              <select
                value={defenderStatus}
                onChange={(e) => setDefenderStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-theme-bg border border-theme rounded-lg text-xs font-display text-theme-primary cursor-pointer capitalize"
              >
                <option value="healthy">Healthy</option>
                <option value="burn" disabled={defenderImmunities.isBurnImmune}>
                  {defenderImmunities.isBurnImmune ? "Burned (Immune: Fire-type)" : "Burned"}
                </option>
                <option value="paralysis" disabled={defenderImmunities.isElectricImmune}>
                  {defenderImmunities.isElectricImmune ? "Paralyzed (Immune: Electric)" : "Paralyzed"}
                </option>
                <option value="poison" disabled={defenderImmunities.isPoisonImmune}>
                  {defenderImmunities.isPoisonImmune ? "Poisoned (Immune: Steel/Poison)" : "Poisoned"}
                </option>
              </select>
            </div>
          </div>

          {/* Current Defender HP % Slider */}
          <div className="flex flex-col gap-1 p-2 bg-theme-bg border border-theme rounded-xl">
            <div className="flex justify-between items-center text-[10px] font-mono-tech text-theme-secondary">
              <span className="uppercase font-bold">Current HP %</span>
              <span className="text-theme-primary font-bold">{defenderHpPercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={defenderHpPercent}
              onChange={(e) => setDefenderHpPercent(Number(e.target.value))}
              className="w-full accent-theme-accent cursor-pointer"
            />
          </div>

          {/* Terastallize */}
          <div className="flex items-center justify-between p-2.5 bg-theme-bg border border-theme rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-display font-bold text-theme-primary">
              <input
                type="checkbox"
                checked={defenderIsTera}
                onChange={(e) => {
                  setDefenderIsTera(e.target.checked);
                  if (e.target.checked) setDefenderIsDynamax(false);
                }}
                className="rounded text-theme-accent cursor-pointer"
              />
              <span>Terastallize</span>
            </label>
            {defenderIsTera && (
              <select
                value={defenderTeraType}
                onChange={(e) => setDefenderTeraType(e.target.value)}
                className="px-2 py-1 bg-theme-surface border border-theme rounded text-xs font-display text-theme-primary cursor-pointer capitalize"
              >
                {[
                  "normal", "fire", "water", "grass", "electric", "ice",
                  "fighting", "poison", "ground", "flying", "psychic", "bug",
                  "rock", "ghost", "dragon", "steel", "dark", "fairy", "stellar"
                ].map((t) => (
                  <option key={t} value={t}>
                    Tera {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dynamax / Gigantamax Form */}
          <div className="flex items-center justify-between p-2.5 bg-theme-bg border border-theme rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-display font-bold text-theme-primary">
              <input
                type="checkbox"
                checked={defenderIsDynamax}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDefenderIsDynamax(checked);
                  if (checked) setDefenderIsTera(false);
                }}
                className="rounded text-red-500 cursor-pointer accent-red-500"
              />
              <span>Dynamax Form</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-extrabold uppercase bg-red-600/20 text-red-400 border border-red-500/40">
                {defenderGmaxData ? "G-MAX HP ×2" : "D-MAX HP ×2"}
              </span>
            </div>
          </div>

          {/* Stat Boost Stages */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
              Defensive Stat Stages:
            </span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {["defense", "special-defense"].map((st) => (
                <div key={st} className="bg-theme-bg border border-theme rounded-lg p-1.5 flex flex-col items-center">
                  <span className="text-[10px] font-mono-tech uppercase text-theme-secondary">
                    {st === "defense" ? "Def" : "SpD"}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setDefenderStages((prev) => ({ ...prev, [st]: Math.max(-6, (prev[st] || 0) - 1) }))}
                      className="w-5 h-5 bg-theme-surface hover:bg-theme-surface-hover rounded font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono-tech font-bold text-theme-primary w-4">
                      {defenderStages[st] > 0 ? `+${defenderStages[st]}` : defenderStages[st] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDefenderStages((prev) => ({ ...prev, [st]: Math.min(6, (prev[st] || 0) + 1) }))}
                      className="w-5 h-5 bg-theme-surface hover:bg-theme-surface-hover rounded font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick EV Presets */}
          <div className="border-t border-theme pt-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
              Quick EV Presets:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {EV_PRESETS.slice(2, 6).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDefenderEvs(preset.evs)}
                  className="px-2 py-1 bg-theme-bg hover:bg-theme-surface border border-theme rounded text-[10px] font-mono-tech text-theme-primary truncate cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nature 5x5 Matrix Modal */}
      <NatureChartModal
        isOpen={showNatureModal}
        onClose={() => setShowNatureModal(false)}
        onSelectNature={(nat) => {
          if (natureModalTarget === "attacker") {
            setAttackerNature(nat);
          } else {
            setDefenderNature(nat);
          }
        }}
        selectedNature={natureModalTarget === "attacker" ? attackerNature : defenderNature}
      />
    </div>
  );
}
