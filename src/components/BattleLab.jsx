import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import TypeBadge from "./TypeBadge";
import NatureChartModal from "./NatureChartModal";
import { formatPokemonName } from "../utils/loreData.js";

const formatStatShort = (stat) => {
  if (!stat) return "";
  const map = {
    hp: "HP",
    attack: "Atk",
    defense: "Def",
    "special-attack": "SpA",
    "special-defense": "SpD",
    speed: "Spe",
  };
  return map[stat] || stat;
};

// 25 Canonical Pokémon Natures
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

export const POPULAR_ITEMS = [
  "Leftovers",
  "Life Orb",
  "Choice Band",
  "Choice Specs",
  "Choice Scarf",
  "Focus Sash",
  "Heavy-Duty Boots",
  "Assault Vest",
  "Rocky Helmet",
  "Eviolite",
  "Booster Energy",
  "Covert Cloak",
  "Loaded Dice",
  "Clear Amulet",
  "Weakness Policy",
  "Sitrus Berry",
  "Lum Berry",
  "Air Balloon",
  "White Herb",
  "Power Herb",
];

export const ALL_TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "steel", "dark", "fairy"
];

// Type effectiveness matrix lookup for defense evaluation
const TYPE_DEFENSE_CHART = {
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
};

// Calculate dual type effectiveness multiplier
function getDualTypeMultiplier(types, attackType) {
  let multiplier = 1.0;
  types.forEach((type) => {
    const chart = TYPE_DEFENSE_CHART[type];
    if (!chart) return;
    if (chart.immune.includes(attackType)) {
      multiplier *= 0;
    } else if (chart.weak.includes(attackType)) {
      multiplier *= 2;
    } else if (chart.resist.includes(attackType)) {
      multiplier *= 0.5;
    }
  });
  return multiplier;
}

// Canonical formula to compute real in-game stats
export function computeRealStat(statName, baseStat, iv, ev, level, nature) {
  if (baseStat === undefined || baseStat === null) return 0;
  if (statName === "hp") {
    // Shedinja exception
    if (baseStat === 1) return 1;
    return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }
  const raw = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  const natureObj = NATURES.find((n) => n.name.toLowerCase() === nature.toLowerCase());
  let mult = 1.0;
  if (natureObj) {
    if (natureObj.plus === statName) mult = 1.1;
    if (natureObj.minus === statName) mult = 0.9;
  }
  return Math.floor(raw * mult);
}

// Sample competitive VGC starter roster
const SAMPLE_TEAM = [
  {
    id: 445,
    name: "garchomp",
    displayName: "Garchomp",
    types: ["dragon", "ground"],
    item: "Life Orb",
    ability: "Rough Skin",
    nature: "Jolly",
    teraType: "Steel",
    moves: ["Earthquake", "Outrage", "Swords Dance", "Protect"],
    ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
    evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/445.png"
  },
  {
    id: 987,
    name: "flutter-mane",
    displayName: "Flutter Mane",
    types: ["ghost", "fairy"],
    item: "Booster Energy",
    ability: "Protosynthesis",
    nature: "Timid",
    teraType: "Fairy",
    moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Protect"],
    ivs: { hp: 31, attack: 0, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
    evs: { hp: 116, attack: 0, defense: 76, "special-attack": 140, "special-defense": 4, speed: 172 },
    baseStats: { hp: 55, attack: 55, defense: 55, "special-attack": 135, "special-defense": 135, speed: 135 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/987.png"
  },
  {
    id: 727,
    name: "incineroar",
    displayName: "Incineroar",
    types: ["fire", "dark"],
    item: "Sitrus Berry",
    ability: "Intimidate",
    nature: "Careful",
    teraType: "Ghost",
    moves: ["Fake Out", "Knock Off", "Flare Blitz", "Parting Shot"],
    ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
    evs: { hp: 252, attack: 4, defense: 140, "special-attack": 0, "special-defense": 108, speed: 4 },
    baseStats: { hp: 95, attack: 115, defense: 90, "special-attack": 80, "special-defense": 90, speed: 60 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/727.png"
  },
  {
    id: 812,
    name: "rillaboom",
    displayName: "Rillaboom",
    types: ["grass"],
    item: "Assault Vest",
    ability: "Grassy Surge",
    nature: "Adamant",
    teraType: "Fire",
    moves: ["Grassy Glide", "Wood Hammer", "High Horsepower", "U-turn"],
    ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
    evs: { hp: 252, attack: 196, defense: 4, "special-attack": 0, "special-defense": 44, speed: 12 },
    baseStats: { hp: 100, attack: 125, defense: 90, "special-attack": 60, "special-defense": 70, speed: 85 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/812.png"
  },
  {
    id: 983,
    name: "kingambit",
    displayName: "Kingambit",
    types: ["dark", "steel"],
    item: "Black Glasses",
    ability: "Supreme Overlord",
    nature: "Adamant",
    teraType: "Flying",
    moves: ["Sucker Punch", "Kowtow Cleave", "Iron Head", "Swords Dance"],
    ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
    evs: { hp: 236, attack: 252, defense: 4, "special-attack": 0, "special-defense": 12, speed: 4 },
    baseStats: { hp: 100, attack: 135, defense: 120, "special-attack": 60, "special-defense": 85, speed: 50 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/983.png"
  },
  {
    id: 992,
    name: "iron-hands",
    displayName: "Iron Hands",
    types: ["fighting", "electric"],
    item: "Heavy-Duty Boots",
    ability: "Quark Drive",
    nature: "Adamant",
    teraType: "Water",
    moves: ["Drain Punch", "Wild Charge", "Fake Out", "Volt Switch"],
    ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
    evs: { hp: 44, attack: 156, defense: 76, "special-attack": 0, "special-defense": 228, speed: 4 },
    baseStats: { hp: 154, attack: 140, defense: 108, "special-attack": 50, "special-defense": 68, speed: 50 },
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/992.png"
  }
];

export default function BattleLab({ pokemonList = [] }) {
  const [team, setTeam] = useState(SAMPLE_TEAM);
  const [activeSlot, setActiveSlot] = useState(0);
  const [battleLevel, setBattleLevel] = useState(50); // 50 (VGC standard) or 100 (Smogon standard)
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInputText, setPasteInputText] = useState("");
  const [showNatureModal, setShowNatureModal] = useState(false);

  const currentMember = team[activeSlot] || null;

  // Calculate sum of EVs for current Pokémon
  const currentTotalEVs = useMemo(() => {
    if (!currentMember?.evs) return 0;
    return Object.values(currentMember.evs).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [currentMember]);

  // Update a field on the current active member
  const handleUpdateCurrent = (field, value) => {
    setTeam((prev) => {
      const copy = [...prev];
      if (!copy[activeSlot]) return prev;
      copy[activeSlot] = {
        ...copy[activeSlot],
        [field]: value,
      };
      return copy;
    });
  };

  // Update a specific EV (strictly capped at 252 individual and 508 total)
  const handleUpdateEV = (statKey, rawVal) => {
    setTeam((prev) => {
      const copy = [...prev];
      if (!copy[activeSlot]) return prev;
      const currentEVs = { ...copy[activeSlot].evs };
      const otherEVsTotal = Object.entries(currentEVs)
        .filter(([k]) => k !== statKey)
        .reduce((sum, [, v]) => sum + (Number(v) || 0), 0);
      const remainingBudget = Math.max(0, 508 - otherEVsTotal);
      const requested = Number(rawVal) || 0;
      const val = Math.max(0, Math.min(252, remainingBudget, requested));
      currentEVs[statKey] = val;
      copy[activeSlot] = {
        ...copy[activeSlot],
        evs: currentEVs,
      };
      return copy;
    });
  };

  // Update a specific IV (0 to 31)
  const handleUpdateIV = (statKey, rawVal) => {
    const val = Math.max(0, Math.min(31, Number(rawVal) || 0));
    setTeam((prev) => {
      const copy = [...prev];
      if (!copy[activeSlot]) return prev;
      const currentIVs = { ...(copy[activeSlot].ivs || {}) };
      currentIVs[statKey] = val;
      copy[activeSlot] = {
        ...copy[activeSlot],
        ivs: currentIVs,
      };
      return copy;
    });
  };

  // Quick EV Presets
  const applyEVPreset = (preset) => {
    let evs = { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
    if (preset === "physical-sweeper") {
      evs = { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 };
    } else if (preset === "special-sweeper") {
      evs = { hp: 4, attack: 0, defense: 0, "special-attack": 252, "special-defense": 0, speed: 252 };
    } else if (preset === "bulky-physical") {
      evs = { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 4, speed: 0 };
    } else if (preset === "bulky-special") {
      evs = { hp: 252, attack: 0, defense: 4, "special-attack": 0, "special-defense": 252, speed: 0 };
    }
    handleUpdateCurrent("evs", evs);
    toast.success(`Applied ${preset.replace("-", " ")} spread.`);
  };

  // Pick Pokémon from the master list
  const handleSelectSpecies = (pkmn) => {
    const baseStats = {
      hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100
    };
    if (pkmn.stats) {
      pkmn.stats.forEach((s) => {
        baseStats[s.stat.name] = s.base_stat;
      });
    }

    const types = pkmn.types ? pkmn.types.map((t) => t.type.name) : ["normal"];
    const abilityName = pkmn.abilities && pkmn.abilities[0] ? pkmn.abilities[0].ability.name : "Overgrow";

    const updated = {
      id: pkmn.id,
      name: pkmn.name,
      displayName: formatPokemonName(pkmn.displayName || pkmn.name),
      types,
      item: "Leftovers",
      ability: abilityName.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" "),
      nature: "Jolly",
      teraType: types[0].charAt(0).toUpperCase() + types[0].slice(1),
      moves: ["Move 1", "Move 2", "Move 3", "Move 4"],
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 4, attack: 252, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
      baseStats,
      sprite: pkmn.sprites?.other?.home?.front_default || pkmn.sprites?.front_default
    };

    setTeam((prev) => {
      const copy = [...prev];
      copy[activeSlot] = updated;
      return copy;
    });

    setShowPickerModal(false);
    toast.success(`Loaded ${updated.displayName} into Slot ${activeSlot + 1}`);
  };

  // Team Defensive Synergy Analysis
  const teamDefensiveReport = useMemo(() => {
    const report = {};
    ALL_TYPES.forEach((t) => {
      report[t] = { weak: 0, resist: 0, immune: 0 };
    });

    team.forEach((member) => {
      if (!member?.types) return;
      ALL_TYPES.forEach((attackType) => {
        const mult = getDualTypeMultiplier(member.types, attackType);
        if (mult > 1) {
          report[attackType].weak += 1;
        } else if (mult === 0) {
          report[attackType].immune += 1;
        } else if (mult < 1) {
          report[attackType].resist += 1;
        }
      });
    });

    return report;
  }, [team]);

  // Export to Poképaste Showdown text
  const handleExportPokepaste = () => {
    let paste = "";
    team.forEach((member) => {
      if (!member) return;
      paste += `${member.displayName} @ ${member.item || "Leftovers"}\n`;
      paste += `Ability: ${member.ability || "None"}\n`;
      paste += `Level: ${battleLevel}\n`;
      if (member.teraType) paste += `Tera Type: ${member.teraType}\n`;

      const evParts = [];
      if (member.evs.hp) evParts.push(`${member.evs.hp} HP`);
      if (member.evs.attack) evParts.push(`${member.evs.attack} Atk`);
      if (member.evs.defense) evParts.push(`${member.evs.defense} Def`);
      if (member.evs["special-attack"]) evParts.push(`${member.evs["special-attack"]} SpA`);
      if (member.evs["special-defense"]) evParts.push(`${member.evs["special-defense"]} SpD`);
      if (member.evs.speed) evParts.push(`${member.evs.speed} Spe`);
      if (evParts.length > 0) {
        paste += `EVs: ${evParts.join(" / ")}\n`;
      }

      paste += `${member.nature || "Hardy"} Nature\n`;

      if (member.moves && member.moves.length > 0) {
        member.moves.forEach((m) => {
          if (m) paste += `- ${m}\n`;
        });
      }
      paste += "\n";
    });

    navigator.clipboard.writeText(paste.trim()).then(() => {
      toast.success("Showdown team sheet copied to clipboard.");
    });
  };

  // Import Showdown Poképaste text
  const handleImportPokepaste = () => {
    if (!pasteInputText.trim()) return;
    try {
      const blocks = pasteInputText.trim().split(/\n\s*\n/);
      const newTeam = [];

      for (let i = 0; i < Math.min(blocks.length, 6); i++) {
        const lines = blocks[i].split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const firstLine = lines[0];
        let speciesName = "";
        let item = "Leftovers";

        if (firstLine.includes("@")) {
          const [speciesPart, itemPart] = firstLine.split("@");
          item = itemPart.trim();
          speciesName = speciesPart.trim();
        } else {
          speciesName = firstLine.trim();
        }

        const parenMatch = speciesName.match(/\((.*?)\)/);
        if (parenMatch) {
          speciesName = parenMatch[1].trim();
        }
        speciesName = speciesName.replace(/\s*\([MF]\)\s*$/, "").trim();

        let ability = "Overgrow";
        let nature = "Hardy";
        let teraType = "Normal";
        const evs = { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
        const moves = [];

        for (let j = 1; j < lines.length; j++) {
          const line = lines[j];
          if (line.startsWith("Ability:")) {
            ability = line.replace("Ability:", "").trim();
          } else if (line.startsWith("Tera Type:")) {
            teraType = line.replace("Tera Type:", "").trim();
          } else if (line.endsWith("Nature")) {
            nature = line.replace("Nature", "").trim();
          } else if (line.startsWith("EVs:")) {
            const evString = line.replace("EVs:", "").trim();
            const parts = evString.split("/");
            parts.forEach((p) => {
              const [val, statKey] = p.trim().split(" ");
              const num = parseInt(val, 10) || 0;
              const k = statKey?.toLowerCase();
              if (k === "hp") evs.hp = num;
              else if (k === "atk") evs.attack = num;
              else if (k === "def") evs.defense = num;
              else if (k === "spa") evs["special-attack"] = num;
              else if (k === "spd") evs["special-defense"] = num;
              else if (k === "spe") evs.speed = num;
            });
          } else if (line.startsWith("-")) {
            moves.push(line.replace(/^[-\s]+/, "").trim());
          }
        }

        const cleanSlug = speciesName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const found = pokemonList.find(
          (p) =>
            p.name.toLowerCase() === cleanSlug ||
            formatPokemonName(p.displayName || p.name).toLowerCase() === speciesName.toLowerCase() ||
            p.name.toLowerCase().includes(cleanSlug)
        );

        const id = found ? found.id : i + 1;
        const types = found?.types ? found.types.map((t) => t.type.name) : ["normal"];
        const baseStats = { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 };
        if (found?.stats) {
          found.stats.forEach((s) => {
            baseStats[s.stat.name] = s.base_stat;
          });
        }

        newTeam.push({
          id,
          name: cleanSlug,
          displayName: found ? formatPokemonName(found.displayName || found.name) : formatPokemonName(speciesName),
          types,
          item,
          ability,
          nature,
          teraType,
          moves: moves.slice(0, 4),
          ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
          evs,
          baseStats,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`
        });
      }

      if (newTeam.length > 0) {
        setTeam(newTeam);
        setShowPasteModal(false);
        setPasteInputText("");
        toast.success(`Imported ${newTeam.length} Pokémon from Showdown team sheet.`);
      }
    } catch (e) {
      toast.error("Failed to parse Showdown team sheet.");
    }
  };

  // Filtered Pokémon list for species picker
  const filteredPickerList = useMemo(() => {
    if (!pickerSearch.trim()) return pokemonList.slice(0, 48);
    const q = pickerSearch.toLowerCase().trim();
    return pokemonList
      .filter((p) => {
        const raw = p.name.toLowerCase();
        const formatted = formatPokemonName(p.displayName || p.name).toLowerCase();
        return raw.includes(q) || formatted.includes(q) || String(p.id).includes(q);
      })
      .slice(0, 48);
  }, [pokemonList, pickerSearch]);

  return (
    <div className="w-full max-w-7xl flex flex-col items-center select-none animate-fadeIn pb-16 px-2 sm:px-4">
      {/* Top Banner & Control Deck - Themed in Championship Indigo */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-theme-surface border border-indigo-500/20 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
                <path d="m13 19 6 2 2-6-2-2-6 6Z" />
                <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
                <path d="m11 19-6 2-2-6 2-2 6 6Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-theme-primary">
                Battle Lab & Competitive Teambuilder
              </h2>
              <p className="text-xs font-display text-theme-secondary mt-0.5">
                VGC & Smogon team roster compiler, real-time EV/IV stat calculators, and weakness radar.
              </p>
            </div>
          </div>
        </div>

        {/* Format Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Toggle Pill */}
          <div className="bg-theme-input p-1 rounded-xl flex items-center border border-theme">
            <button
              onClick={() => setBattleLevel(50)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display cursor-pointer transition-all ${
                battleLevel === 50
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-theme-secondary hover:text-theme-primary font-medium"
              }`}
            >
              Lv. 50 (VGC)
            </button>
            <button
              onClick={() => setBattleLevel(100)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display cursor-pointer transition-all ${
                battleLevel === 100
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-theme-secondary hover:text-theme-primary font-medium"
              }`}
            >
              Lv. 100 (OU)
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-2 bg-theme-surface hover:bg-theme-surface-hover border border-theme hover:border-indigo-500/50 text-theme-primary rounded-xl font-display font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import Showdown</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPokepaste}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-display font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect width="14" height="14" x="8" y="8" rx="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span>Export Showdown</span>
          </motion.button>
        </div>
      </div>

      {/* 6-Slot Roster Strip */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
        {team.map((member, idx) => {
          const isActive = activeSlot === idx;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              onClick={() => setActiveSlot(idx)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center min-h-[120px] ${
                isActive
                  ? "bg-indigo-950/20 border-indigo-500 shadow-md ring-2 ring-indigo-500/25"
                  : "bg-theme-surface/70 hover:bg-theme-surface border-theme hover:border-indigo-500/40"
              }`}
            >
              <div className="w-full flex items-center justify-between text-[10px] font-mono-tech text-theme-secondary mb-1">
                <span>Slot {idx + 1}</span>
                {member && <span className="text-indigo-400 font-bold">#{String(member.id).padStart(3, "0")}</span>}
              </div>

              {member ? (
                <>
                  <div className="w-14 h-14 bg-theme-input rounded-xl p-1 flex items-center justify-center my-1">
                    <img
                      src={member.sprite}
                      alt={member.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-full">
                    <div className="font-display font-extrabold text-xs text-theme-primary truncate">
                      {member.displayName}
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center items-center mt-1 w-full max-w-full">
                      {member.types.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow text-theme-secondary/50">
                  <span className="text-2xl font-light">+</span>
                  <span className="text-[10px] font-display">Empty Slot</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Main Active Slot Editor */}
      {currentMember && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Column: Pokémon Identity & Loadout (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-theme-surface border border-theme rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-theme-input rounded-2xl p-2 flex items-center justify-center border border-theme shadow-inner flex-shrink-0">
                    <img
                      src={currentMember.sprite}
                      alt={currentMember.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-extrabold text-theme-primary">
                      {currentMember.displayName}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {currentMember.types.map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowPickerModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-400/30 rounded-xl font-display text-xs font-bold cursor-pointer transition-all self-start sm:self-auto flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                  </svg>
                  <span>Change Pokémon</span>
                </motion.button>
              </div>

              {/* Loadout Fields: Item, Ability, Nature, Tera */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* Held Item */}
                <div>
                  <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold block mb-1">
                    Held Item
                  </label>
                  <select
                    value={currentMember.item}
                    onChange={(e) => handleUpdateCurrent("item", e.target.value)}
                    className="w-full py-2 px-2.5 bg-theme-input border border-theme rounded-xl text-xs font-display text-theme-primary focus:outline-none focus:border-indigo-500"
                  >
                    {POPULAR_ITEMS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nature */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold">
                      Nature ({currentMember.nature})
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNatureModal(true)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 font-display text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                      title="Open Interactive Nature Chart"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                      </svg>
                      <span>Nature Chart</span>
                    </button>
                  </div>
                  <select
                    value={currentMember.nature}
                    onChange={(e) => handleUpdateCurrent("nature", e.target.value)}
                    className="w-full py-2 px-2.5 bg-theme-input border border-theme rounded-xl text-xs font-display text-theme-primary focus:outline-none focus:border-indigo-500"
                  >
                    {NATURES.map((nat) => {
                      let tag = "Neutral";
                      if (nat.plus) tag = `+${formatStatShort(nat.plus)} / -${formatStatShort(nat.minus)}`;
                      return (
                        <option key={nat.name} value={nat.name}>
                          {nat.name} ({tag})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Ability */}
                <div>
                  <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold block mb-1">
                    Ability
                  </label>
                  <input
                    type="text"
                    value={currentMember.ability}
                    onChange={(e) => handleUpdateCurrent("ability", e.target.value)}
                    className="w-full py-2 px-2.5 bg-theme-input border border-theme rounded-xl text-xs font-display text-theme-primary focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Tera Type */}
                <div>
                  <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold block mb-1">
                    Tera Type
                  </label>
                  <select
                    value={currentMember.teraType || "Normal"}
                    onChange={(e) => handleUpdateCurrent("teraType", e.target.value)}
                    className="w-full py-2 px-2.5 bg-theme-input border border-theme rounded-xl text-xs font-display text-theme-primary capitalize focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_TYPES.map((t) => (
                      <option key={t} value={t.charAt(0).toUpperCase() + t.slice(1)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                    <option value="Stellar">Stellar</option>
                  </select>
                </div>
              </div>

              {/* 4 Moves Input */}
              <div>
                <label className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold block mb-1.5">
                  Movepool (4 Slots)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((moveIdx) => (
                    <input
                      key={moveIdx}
                      type="text"
                      value={currentMember.moves[moveIdx] || ""}
                      onChange={(e) => {
                        const movesCopy = [...currentMember.moves];
                        movesCopy[moveIdx] = e.target.value;
                        handleUpdateCurrent("moves", movesCopy);
                      }}
                      placeholder={`Move ${moveIdx + 1}`}
                      className="py-2 px-2.5 bg-theme-input border border-theme rounded-xl text-xs font-display text-theme-primary focus:outline-none focus:border-indigo-500"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick EV Presets */}
            <div className="bg-theme-surface border border-theme rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-mono-tech text-theme-secondary uppercase font-bold mb-2">
                Quick EV Optimization Presets
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyEVPreset("physical-sweeper")}
                  className="px-2.5 py-2 bg-theme-input hover:bg-theme-surface-hover border border-theme hover:border-indigo-500/40 rounded-xl text-xs font-display text-theme-primary cursor-pointer text-left flex items-center gap-2 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                  <span>Physical Sweeper</span>
                </button>
                <button
                  onClick={() => applyEVPreset("special-sweeper")}
                  className="px-2.5 py-2 bg-theme-input hover:bg-theme-surface-hover border border-theme hover:border-indigo-500/40 rounded-xl text-xs font-display text-theme-primary cursor-pointer text-left flex items-center gap-2 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span>Special Sweeper</span>
                </button>
                <button
                  onClick={() => applyEVPreset("bulky-physical")}
                  className="px-2.5 py-2 bg-theme-input hover:bg-theme-surface-hover border border-theme hover:border-indigo-500/40 rounded-xl text-xs font-display text-theme-primary cursor-pointer text-left flex items-center gap-2 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span>Bulky Physical</span>
                </button>
                <button
                  onClick={() => applyEVPreset("bulky-special")}
                  className="px-2.5 py-2 bg-theme-input hover:bg-theme-surface-hover border border-theme hover:border-indigo-500/40 rounded-xl text-xs font-display text-theme-primary cursor-pointer text-left flex items-center gap-2 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>Bulky Special</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive EV / IV Stat Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-theme-surface border border-theme rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header with 508 EV Cap Gauge */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-display font-extrabold text-theme-primary">
                    Stat Matrix & EV/IV Tuning
                  </h4>
                  <div className="text-[11px] font-mono-tech text-theme-secondary">
                    Calculated for Level {battleLevel} Tournament Standard
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono-tech font-bold flex items-center gap-1.5 justify-end">
                    <span className={currentTotalEVs >= 508 ? "text-amber-400 font-extrabold" : "text-indigo-400 font-extrabold"}>
                      {currentTotalEVs}
                    </span>
                    <span className="text-theme-secondary"> / 508 EVs</span>
                    {currentTotalEVs >= 508 ? (
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded font-bold uppercase">
                        Max
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded font-bold">
                        {508 - currentTotalEVs} left
                      </span>
                    )}
                  </div>
                  <div className="w-32 h-1.5 bg-theme-input rounded-full overflow-hidden mt-1 ml-auto">
                    <div
                      className={`h-full rounded-full transition-all ${
                        currentTotalEVs >= 508 ? "bg-amber-400" : "bg-indigo-500"
                      }`}
                      style={{ width: `${Math.min((currentTotalEVs / 508) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Sliders Table */}
              <div className="space-y-3.5">
                {[
                  { key: "hp", label: "HP", color: "bg-red-500" },
                  { key: "attack", label: "Atk", color: "bg-orange-500" },
                  { key: "defense", label: "Def", color: "bg-yellow-500" },
                  { key: "special-attack", label: "SpA", color: "bg-blue-500" },
                  { key: "special-defense", label: "SpD", color: "bg-green-500" },
                  { key: "speed", label: "Spe", color: "bg-pink-500" },
                ].map((stat) => {
                  const base = currentMember.baseStats[stat.key] || 50;
                  const iv = currentMember.ivs?.[stat.key] ?? 31;
                  const ev = currentMember.evs?.[stat.key] ?? 0;
                  const finalStat = computeRealStat(stat.key, base, iv, ev, battleLevel, currentMember.nature);

                  const otherEVsTotal = Object.entries(currentMember.evs || {})
                    .filter(([k]) => k !== stat.key)
                    .reduce((sum, [, v]) => sum + (Number(v) || 0), 0);
                  const maxAllowed = Math.min(252, Math.max(0, 508 - otherEVsTotal));
                  const sliderMax = Math.max(ev, maxAllowed);

                  return (
                    <div key={stat.key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs font-display">
                        <div className="flex items-center gap-2 w-28">
                          <span className={`w-2.5 h-2.5 rounded-full ${stat.color}`} />
                          <span className="font-bold text-theme-primary">{stat.label}</span>
                          <span className="text-[10px] font-mono-tech text-theme-secondary">({base})</span>
                        </div>

                        {/* EV Slider */}
                        <div className="flex-grow mx-3 flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max={sliderMax}
                            step="4"
                            value={ev}
                            onChange={(e) => handleUpdateEV(stat.key, e.target.value)}
                            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-theme-input rounded-lg"
                          />
                        </div>

                        {/* EV Numeric Input & IV Toggle */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max={sliderMax}
                            step="4"
                            value={ev}
                            onChange={(e) => handleUpdateEV(stat.key, e.target.value)}
                            className="w-14 py-1 px-1.5 bg-theme-input border border-theme rounded-lg text-center text-xs font-mono-tech text-theme-primary font-bold focus:outline-none focus:border-indigo-500"
                            title={`EV (Max remaining allowed: ${sliderMax})`}
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateIV(stat.key, iv === 31 ? 0 : 31)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-bold border transition-colors cursor-pointer ${
                              iv === 31
                                ? "bg-theme-input text-theme-secondary hover:text-indigo-400 border-theme"
                                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            }`}
                            title={`IV value: ${iv}. Click to toggle between 31 and 0`}
                          >
                            {iv} IV
                          </button>
                          <span className="w-12 text-right font-mono-tech font-extrabold text-sm text-indigo-400">
                            {finalStat}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* In-Game Stat Formula Note */}
            <div className="mt-6 pt-4 border-t border-theme/70 text-[10px] font-mono-tech text-theme-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span>Formula: Math.floor(((2*Base + IV + EV/4) * Lv)/100 + 5) * Nature</span>
              <span className="text-indigo-400 font-semibold">100% Cartridge Formula</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Defensive Weakness Radar / Heatmap */}
      <div className="w-full bg-theme-surface border border-theme rounded-2xl p-5 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-base font-display font-extrabold text-theme-primary flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Team Defensive Synergy & Weakness Radar</span>
            </h4>
            <p className="text-xs font-display text-theme-secondary mt-0.5">
              Cumulative defensive profiles across all 18 elemental types for your active 6-Pokémon roster.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mt-4">
          {ALL_TYPES.map((type) => {
            const data = teamDefensiveReport[type];
            const hasCriticalWeakness = data.weak >= 3 && data.resist === 0;

            return (
              <div
                key={type}
                className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  hasCriticalWeakness
                    ? "bg-rose-500/10 border-rose-500/40"
                    : "bg-theme-input/50 border-theme"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <TypeBadge type={type} size="sm" />
                  {hasCriticalWeakness && (
                    <span className="text-[9px] font-mono-tech text-rose-400 font-bold px-1.5 py-0.5 rounded bg-rose-500/15" title="3+ Weak without resistance">
                      Hazard
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-tech">
                  <span className="text-rose-400 font-bold" title="Weaknesses">
                    {data.weak > 0 ? `-${data.weak}` : "0"}
                  </span>
                  <span className="text-emerald-400 font-bold" title="Resistances">
                    {data.resist > 0 ? `+${data.resist}` : "0"}
                  </span>
                  <span className="text-amber-400 font-bold" title="Immunities">
                    {data.immune > 0 ? `*${data.immune}` : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Speed Tier Radar */}
      <div className="w-full bg-theme-surface border border-theme rounded-2xl p-5 shadow-sm">
        <h4 className="text-base font-display font-extrabold text-theme-primary flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="m16 12-4-4v8z" />
          </svg>
          <span>Metagame Speed Tier Benchmarks (Lv. 50)</span>
        </h4>
        <p className="text-xs font-display text-theme-secondary mb-4">
          Benchmark where your roster acts in turn order against premier competitive threats.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { name: "Regieleki", speed: 277, tag: "Tier 0" },
            { name: "Dragapult", speed: 213, tag: "Top Sweeper" },
            { name: "Flutter Mane", speed: 205, tag: "Meta Staple" },
            { name: "Garchomp", speed: 169, tag: "Base 102" },
            { name: "Landorus-T", speed: 157, tag: "Base 91" },
            { name: "Incineroar", speed: 112, tag: "Bulky Pivot" },
          ].map((bench) => (
            <div key={bench.name} className="bg-theme-input rounded-xl p-2.5 border border-theme text-center">
              <div className="text-[10px] font-mono-tech text-theme-secondary uppercase">{bench.tag}</div>
              <div className="text-xs font-display font-extrabold text-theme-primary mt-0.5">{bench.name}</div>
              <div className="text-sm font-mono-tech font-bold text-indigo-400 mt-0.5">{bench.speed} Spe</div>
            </div>
          ))}
        </div>
      </div>

      {/* Species Picker Modal */}
      <AnimatePresence>
        {showPickerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-surface border border-theme rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-bold text-theme-primary">
                  Select Pokémon for Slot {activeSlot + 1}
                </h3>
                <button
                  onClick={() => setShowPickerModal(false)}
                  className="w-7 h-7 rounded-full bg-theme-surface-hover text-theme-secondary hover:text-theme-primary flex items-center justify-center border border-theme cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search Pokémon species by name or #id..."
                className="w-full py-2.5 px-3.5 bg-theme-input border border-theme rounded-xl text-xs font-display text-theme-primary mb-4 focus:outline-none focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[50vh] pr-1">
                {filteredPickerList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectSpecies(p)}
                    className="p-2 bg-theme-input hover:bg-theme-surface-hover border border-theme hover:border-indigo-500/50 rounded-xl flex items-center gap-2 cursor-pointer transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-theme-surface rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                      <img
                        src={p.sprites?.other?.home?.front_default || p.sprites?.front_default}
                        alt={formatPokemonName(p.displayName || p.name)}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono-tech text-indigo-400 font-bold">#{String(p.id).padStart(3, "0")}</div>
                      <div className="text-xs font-display font-bold text-theme-primary truncate">
                        {formatPokemonName(p.displayName || p.name)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Import Poképaste Modal */}
        {showPasteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-theme-surface border border-theme rounded-2xl w-full max-w-xl flex flex-col p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-display font-extrabold text-theme-primary">
                  Import Pokémon Showdown Team Sheet
                </h3>
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="w-7 h-7 rounded-full bg-theme-surface-hover text-theme-secondary hover:text-theme-primary flex items-center justify-center border border-theme cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-xs font-display text-theme-secondary mb-3">
                Paste your export from Pokémon Showdown or Smogon. Up to 6 Pokémon will be parsed with EVs, natures, and items.
              </p>

              <textarea
                rows={9}
                value={pasteInputText}
                onChange={(e) => setPasteInputText(e.target.value)}
                placeholder={`Garchomp @ Life Orb\nAbility: Rough Skin\nLevel: 50\nEVs: 4 HP / 252 Atk / 252 Spe\nJolly Nature\n- Earthquake\n- Outrage\n- Swords Dance\n- Protect`}
                className="w-full p-3 bg-theme-input border border-theme rounded-xl text-xs font-mono-tech text-theme-primary focus:outline-none focus:border-indigo-500 resize-none mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 bg-theme-surface-hover border border-theme text-theme-secondary hover:text-theme-primary rounded-xl font-display text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportPokepaste}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-display font-bold text-xs cursor-pointer shadow-xs transition-all"
                >
                  Import Team
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Nature 5x5 Matrix Modal */}
        <NatureChartModal
          isOpen={showNatureModal}
          onClose={() => setShowNatureModal(false)}
          onSelectNature={(nat) => handleUpdateCurrent("nature", nat)}
          selectedNature={currentMember?.nature}
        />
      </AnimatePresence>
    </div>
  );
}
