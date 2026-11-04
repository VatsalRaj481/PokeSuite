import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { KNOWN_MOVE_META } from "../utils/moveMeta";
import TypeBadge from "./TypeBadge";
import { TYPE_NAMES } from "../utils/typeIcons";
import {
  getPokemonArchetype,
  isPokemonSignatureMove,
  isPokemonSignatureAbility,
  getPokemonSignatureMoves,
  getPokemonSignatureAbilities,
  resolvePokemonEndpointTarget,
  formatPokemonName,
} from "../utils/loreData.js";

// Defines brand-accurate flat type colors with subtle 1px border for definition
const typeColors = {
  normal: "bg-[#A8A77A] text-slate-900 border-[#96956D]",
  fire: "bg-[#EE8130] text-white border-[#D67026]",
  water: "bg-[#6390F0] text-white border-[#537DCF]",
  grass: "bg-[#7AC74C] text-white border-[#68A93E]",
  electric: "bg-[#F7D02C] text-slate-900 border-[#DEC025]",
  ice: "bg-[#96D9D6] text-slate-900 border-[#83C1BF]",
  fighting: "bg-[#C22E28] text-white border-[#A52520]",
  poison: "bg-[#A33EA1] text-white border-[#8B3489]",
  ground: "bg-[#E2BF65] text-slate-900 border-[#CDB059]",
  flying: "bg-[#A98FF3] text-white border-[#947CE2]",
  psychic: "bg-[#F95587] text-white border-[#DF4876]",
  bug: "bg-[#A6B91A] text-slate-900 border-[#90A114]",
  rock: "bg-[#B6A136] text-white border-[#9C8A2C]",
  ghost: "bg-[#735797] text-white border-[#624A81]",
  dragon: "bg-[#6F35FC] text-white border-[#5B2BD8]",
  steel: "bg-[#B7B7CE] text-slate-900 border-[#9E9EAF]",
  dark: "bg-[#705746] text-white border-[#5C4739]",
  fairy: "bg-[#D685AD] text-slate-950 border-[#BD7298]",
};

// Stat configurations with Game-specific colors & crisp gradients
const statMeta = {
  hp: {
    label: "HP",
    color: "bg-rose-500",
    gradient: "from-rose-500 to-red-400",
    max: 255,
  },
  attack: {
    label: "ATK",
    color: "bg-orange-500",
    gradient: "from-orange-500 to-amber-400",
    max: 190,
  },
  defense: {
    label: "DEF",
    color: "bg-yellow-500",
    gradient: "from-amber-500 to-yellow-300",
    max: 230,
  },
  "special-attack": {
    label: "SPA",
    color: "bg-blue-500",
    gradient: "from-sky-500 to-cyan-300",
    max: 194,
  },
  "special-defense": {
    label: "SPD",
    color: "bg-green-500",
    gradient: "from-emerald-500 to-teal-300",
    max: 230,
  },
  speed: {
    label: "SPE",
    color: "bg-pink-500",
    gradient: "from-pink-500 to-fuchsia-400",
    max: 180,
  },
};

// Global in-memory caches to prevent PokeAPI redundant calls
const abilityCache = {};
const typeRelationsCache = {};
const evolutionChainCache = {};
const moveDetailsCache = {};
const speciesDetailsCache = {};
const encountersCache = {};

// Glistening 4-point star SVG component for authentic Pokémon shiny effect
function ShinyStar({ style, size = 18, color = "#FDE047" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: size, height: size, color, ...style }}
      className="absolute pointer-events-none drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]"
    >
      <path d="M12 0C12 7.5 10.5 10.5 0 12C10.5 13.5 12 16.5 12 24C12 16.5 13.5 13.5 24 12C13.5 10.5 12 7.5 12 0Z" />
    </svg>
  );
}

// Sparkle Burst Container that triggers whenever switching to Shiny
function ShinySparkles({ triggerKey }) {
  const particles = [
    { tx: "0px", ty: "-90px", rot: 90, delay: "0ms", size: 22, color: "#FDE047" },
    { tx: "48px", ty: "-78px", rot: 135, delay: "35ms", size: 16, color: "#FFFFFF" },
    { tx: "84px", ty: "-44px", rot: 180, delay: "70ms", size: 20, color: "#38BDF8" },
    { tx: "92px", ty: "0px", rot: 225, delay: "20ms", size: 24, color: "#FDE047" },
    { tx: "78px", ty: "48px", rot: 270, delay: "95ms", size: 16, color: "#FDE047" },
    { tx: "44px", ty: "84px", rot: 315, delay: "50ms", size: 18, color: "#FFFFFF" },
    { tx: "0px", ty: "92px", rot: 360, delay: "110ms", size: 22, color: "#38BDF8" },
    { tx: "-48px", ty: "78px", rot: 45, delay: "30ms", size: 16, color: "#FDE047" },
    { tx: "-84px", ty: "44px", rot: 90, delay: "85ms", size: 20, color: "#FFFFFF" },
    { tx: "-92px", ty: "0px", rot: 135, delay: "10ms", size: 24, color: "#FDE047" },
    { tx: "-78px", ty: "-48px", rot: 180, delay: "65ms", size: 18, color: "#38BDF8" },
    { tx: "-44px", ty: "-84px", rot: 225, delay: "105ms", size: 16, color: "#FDE047" },
  ];

  return (
    <div key={triggerKey} className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible">
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-amber-400/35 via-yellow-200/40 to-sky-300/35 filter blur-xl animate-shiny-flash pointer-events-none" />
      {particles.map((p, i) => (
        <div
          key={i}
          className="animate-shiny-sparkle absolute"
          style={{
            "--tx": p.tx,
            "--ty": p.ty,
            "--rot": `${p.rot}deg`,
            animationDelay: p.delay,
          }}
        >
          <ShinyStar size={p.size} color={p.color} />
        </div>
      ))}
    </div>
  );
}

const toSentenceCase = (text) => {
  if (!text) return "";
  return (
    text.charAt(0).toUpperCase() +
    text
      .slice(1)
      .toLowerCase()
      .replace(/([.?!]\s*)([a-z])/g, (match, prefix, letter) => {
        return prefix + letter.toUpperCase();
      })
  );
};

// Evolution details human-readable condition parser
const parseEvolutionDetails = (details) => {
  if (!details || details.length === 0) return null;
  const d = details[0];
  if (d.trigger?.name === "recoil-damage") {
    if (d.min_damage_taken) {
      if (d.gender === 2) return `${d.min_damage_taken}+ Recoil (♂ Male)`;
      if (d.gender === 1) return `${d.min_damage_taken}+ Recoil (♀ Female)`;
      return `${d.min_damage_taken}+ Recoil Dmg`;
    }
    return "Recoil Damage";
  }
  if (d.trigger?.name === "three-critical-hits") return "3 Critical Hits";
  if (d.trigger?.name === "strong-style-move") return "Strong Style Move";
  if (d.min_steps) return `Walk ${d.min_steps} Steps`;
  if (d.item) return d.item.name.replace(/-/g, " ");
  if (d.held_item) return `Hold ${d.held_item.name.replace(/-/g, " ")}`;
  if (d.min_happiness) {
    return d.time_of_day ? `Friendship (${d.time_of_day})` : "High Friendship";
  }
  if (d.min_affection) return "High Affection";
  if (d.known_move) return `Learn ${d.known_move.name.replace(/-/g, " ")}`;
  if (d.min_level) return `Lv. ${d.min_level}`;
  if (d.location) return `At ${d.location.name.replace(/-/g, " ")}`;
  if (d.trigger?.name === "trade") {
    return d.held_item
      ? `Trade holding ${d.held_item.name.replace(/-/g, " ")}`
      : "Trade";
  }
  if (d.trigger?.name === "use-item") return "Use Item";
  return d.trigger?.name ? d.trigger.name.replace(/-/g, " ") : "Special";
};

// Recursive evolution tree builder
const parseEvolutionTree = (chainNode) => {
  if (!chainNode) return null;
  const getId = (url) => {
    const m = url?.match(/\/pokemon-species\/(\d+)\//);
    return m ? m[1] : null;
  };

  const buildNode = (node, incomingTrigger = null) => {
    const speciesId = getId(node.species?.url);
    const speciesName = node.species?.name?.toLowerCase();

    // Canonical handling for Basculin -> Basculegion
    // In Pokémon canon: Only White-Striped Basculin (Hisui) evolves into Basculegion Male or Female
    if (speciesName === "basculin") {
      const hasBasculegion = (node.evolves_to || []).some(
        (child) => child.species?.name?.toLowerCase() === "basculegion"
      );

      if (hasBasculegion) {
        return {
          id: "10247",
          spriteId: "10247",
          speciesId: speciesId || "550",
          speciesName: "basculin",
          dexNumber: "550",
          name: "basculin-white-striped",
          displayName: "Basculin (White-Striped)",
          formBadge: "Hisuian Form",
          isHisuianWhiteStriped: true,
          trigger: incomingTrigger,
          evolvesTo: [
            {
              id: "902",
              spriteId: "902",
              speciesId: "902",
              speciesName: "basculegion",
              dexNumber: "902",
              name: "basculegion-male",
              displayName: "Basculegion (Male)",
              formBadge: "♂ Male",
              trigger: "294+ Recoil (♂ Male)",
              evolvesTo: [],
            },
            {
              id: "10248",
              spriteId: "10248",
              speciesId: "902",
              speciesName: "basculegion",
              dexNumber: "902",
              name: "basculegion-female",
              displayName: "Basculegion (Female)",
              formBadge: "♀ Female",
              trigger: "294+ Recoil (♀ Female)",
              evolvesTo: [],
            },
          ],
        };
      }
    }

    return {
      id: speciesId,
      speciesId,
      speciesName,
      dexNumber: speciesId,
      name: speciesName,
      displayName: formatPokemonName(speciesName),
      trigger: incomingTrigger,
      evolvesTo: (node.evolves_to || []).map((child) =>
        buildNode(child, parseEvolutionDetails(child.evolution_details))
      ),
    };
  };

  return buildNode(chainNode);
};

// Stage card component for rendering a single evolution node
function EvolutionStageCard({ node, currentPokemonId, currentPokemonName, onSelectPokemon }) {
  if (!node) return null;
  const isCurrent =
    (node.name && currentPokemonName && node.name.toLowerCase() === currentPokemonName.toLowerCase()) ||
    (String(node.id) === String(currentPokemonId)) ||
    (node.speciesId && String(node.speciesId) === String(currentPokemonId) && node.isDefault);

  const spriteId = node.spriteId || node.id;
  const homeSpriteUrl = node.spriteUrl || (spriteId
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${spriteId}.png`
    : null);

  const displayName = node.displayName || formatPokemonName(node.name);
  const displayId = node.dexNumber || node.speciesId || node.id;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelectPokemon && onSelectPokemon(node.name || node.id)}
      className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-200 cursor-pointer select-none group relative flex-shrink-0 w-28 sm:w-32 md:w-36 ${
        isCurrent
          ? "ring-2 ring-theme-accent/60 bg-theme-surface/80 shadow-md"
          : "hover:bg-theme-surface/40"
      }`}
      title={`View ${displayName}`}
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center p-1 flex-shrink-0">
        {/* Subtle Ambient Halo on active / hover */}
        <div
          className={`absolute inset-0 rounded-full filter blur-xl transition-opacity duration-300 pointer-events-none ${
            isCurrent
              ? "bg-theme-accent/25 opacity-100 scale-110"
              : "bg-theme-accent/15 opacity-0 group-hover:opacity-100 scale-105"
          }`}
        />
        {homeSpriteUrl ? (
          <img
            src={homeSpriteUrl}
            alt={displayName}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-200 z-10"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spriteId}.png`;
            }}
          />
        ) : (
          <div className="text-sm text-theme-secondary font-mono-tech">?</div>
        )}
      </div>
      <span
        className={`text-xs sm:text-[13px] font-sans font-bold capitalize text-center mt-1 transition-colors leading-tight px-1 w-full line-clamp-2 ${
          isCurrent
            ? "text-theme-accent"
            : "text-theme-primary group-hover:text-theme-accent"
        }`}
      >
        {displayName}
      </span>
      <span className="text-[10px] sm:text-xs font-mono-tech text-theme-secondary font-semibold">
        #{String(displayId).padStart(4, "0")}
      </span>
      {node.formBadge && (
        <span className="mt-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono-tech font-bold bg-theme-surface border border-theme text-theme-secondary shadow-2xs">
          {node.formBadge}
        </span>
      )}
      {isCurrent && (
        <span className="mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono-tech font-bold bg-theme-accent text-white uppercase tracking-wider shadow-xs">
          Current
        </span>
      )}
    </motion.div>
  );
}

// Fixed-width, beautifully aligned conduit connector between evolution stages
function EvolutionConnector({ trigger }) {
  return (
    <div className="flex flex-col items-center justify-center px-1 sm:px-2 flex-shrink-0 min-w-[100px] sm:min-w-[120px] md:min-w-[136px] max-w-[170px] select-none my-auto">
      <span
        className="px-2.5 py-0.5 rounded-full bg-theme-surface border border-theme text-[9px] sm:text-[9.5px] font-mono-tech font-bold text-theme-primary text-center tracking-tight capitalize max-w-full shadow-2xs mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis"
        title={trigger || "Evolves"}
      >
        {trigger || "Evolves"}
      </span>
      <div className="flex items-center w-full">
        <div
          className="h-[2px] flex-1 rounded-l-full"
          style={{ backgroundColor: "var(--color-accent-red)" }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 flex-shrink-0 -ml-1"
          style={{ color: "var(--color-accent-red)" }}
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// Unified, recursive evolution tree branch component with consistent spacing
function EvolutionBranch({ node, currentPokemonId, currentPokemonName, onSelectPokemon }) {
  if (!node) return null;
  const hasChildren = node.evolvesTo && node.evolvesTo.length > 0;

  return (
    <div className="flex items-center flex-shrink-0">
      <EvolutionStageCard
        node={node}
        currentPokemonId={currentPokemonId}
        currentPokemonName={currentPokemonName}
        onSelectPokemon={onSelectPokemon}
      />

      {hasChildren && (
        <div className="flex flex-col gap-4 sm:gap-6 justify-center flex-shrink-0">
          {node.evolvesTo.map((child) => (
            <div key={child.name} className="flex items-center flex-shrink-0">
              <EvolutionConnector trigger={child.trigger} />
              <EvolutionBranch
                node={child}
                currentPokemonId={currentPokemonId}
                currentPokemonName={currentPokemonName}
                onSelectPokemon={onSelectPokemon}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Vertical conduit connector for mobile layout
function EvolutionConnectorVertical({ trigger }) {
  return (
    <div className="flex flex-col items-center justify-center py-2 select-none w-full">
      <div
        className="w-[2px] h-3.5 rounded-full"
        style={{ backgroundColor: "var(--color-accent-red)" }}
      />
      <span
        className="px-2.5 py-1 my-1 rounded-full bg-theme-surface border border-theme text-[9.5px] font-mono-tech font-bold text-theme-primary text-center tracking-tight capitalize shadow-2xs max-w-[220px] truncate"
        title={trigger || "Evolves"}
      >
        {trigger || "Evolves"}
      </span>
      <div className="flex flex-col items-center">
        <div
          className="w-[2px] h-3.5 rounded-full"
          style={{ backgroundColor: "var(--color-accent-red)" }}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 -mt-1"
          style={{ color: "var(--color-accent-red)" }}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

// Mobile-optimized vertical evolution tree component (prevents horizontal scrolling)
function MobileEvolutionTree({ node, currentPokemonId, currentPokemonName, onSelectPokemon }) {
  if (!node) return null;
  const hasChildren = node.evolvesTo && node.evolvesTo.length > 0;
  const isBranching = hasChildren && node.evolvesTo.length > 1;

  return (
    <div className="flex flex-col items-center w-full">
      <EvolutionStageCard
        node={node}
        currentPokemonId={currentPokemonId}
        currentPokemonName={currentPokemonName}
        onSelectPokemon={onSelectPokemon}
      />

      {hasChildren && !isBranching && (
        <div className="flex flex-col items-center w-full">
          <EvolutionConnectorVertical trigger={node.evolvesTo[0].trigger} />
          <MobileEvolutionTree
            node={node.evolvesTo[0]}
            currentPokemonId={currentPokemonId}
            currentPokemonName={currentPokemonName}
            onSelectPokemon={onSelectPokemon}
          />
        </div>
      )}

      {isBranching && (
        <div className="w-full flex flex-col items-center mt-2">
          <div
            className="w-[2px] h-3 rounded-full mb-1"
            style={{ backgroundColor: "var(--color-accent-red)" }}
          />
          <span className="px-2.5 py-0.5 rounded-full bg-theme-surface/90 border border-theme text-[9px] font-mono-tech text-theme-secondary uppercase tracking-wider mb-2.5 shadow-2xs">
            {node.evolvesTo.length} Evolutionary Branches
          </span>
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs sm:max-w-sm">
            {node.evolvesTo.map((child) => (
              <div
                key={child.name}
                className="flex flex-col items-center bg-theme-surface/35 border border-theme/60 rounded-2xl p-2.5"
              >
                <span
                  className="px-2 py-0.5 rounded-full bg-theme-surface border border-theme text-[9px] font-mono-tech font-bold text-theme-primary text-center truncate max-w-full shadow-2xs mb-1"
                  title={child.trigger || "Evolves"}
                >
                  {child.trigger || "Evolves"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5 mb-1"
                  style={{ color: "var(--color-accent-red)" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
                <EvolutionStageCard
                  node={child}
                  currentPokemonId={currentPokemonId}
                  currentPokemonName={currentPokemonName}
                  onSelectPokemon={onSelectPokemon}
                />
                {/* Check if branch evolves again, e.g. Wurmple -> Silcoon -> Beautifly or Applin -> Dipplin -> Hydrapple */}
                {child.evolvesTo && child.evolvesTo.length > 0 && (
                  <div className="flex flex-col items-center w-full">
                    <EvolutionConnectorVertical trigger={child.evolvesTo[0].trigger} />
                    <EvolutionStageCard
                      node={child.evolvesTo[0]}
                      currentPokemonId={currentPokemonId}
                      currentPokemonName={currentPokemonName}
                      onSelectPokemon={onSelectPokemon}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PokemonCard({
  pokemon,
  layout = "vertical",
  pokemonToRegionMap = {},
  description = "",
  speciesData = null,
  onSelectPokemon,
  onToggleCompare,
  isCompared = false,
}) {
  const [abilityDetails, setAbilityDetails] = useState({});
  const [expandedAbility, setExpandedAbility] = useState(null);
  const [loadingAbilityName, setLoadingAbilityName] = useState(null);
  const [typeEffectiveness, setTypeEffectiveness] = useState({
    weak: [],
    resistant: [],
    immune: [],
  });
  const [loadingEffects, setLoadingEffects] = useState(false);

  // Enthusiast Features State
  const [activeCryPlaying, setActiveCryPlaying] = useState(null); // 'latest' | 'legacy' | null
  const [isShiny, setIsShiny] = useState(false);
  const [selectedGender, setSelectedGender] = useState("male");
  const [shinySparkleKey, setShinySparkleKey] = useState(0);
  const [internalSpeciesData, setInternalSpeciesData] = useState(speciesData);
  const [selectedLoreVersion, setSelectedLoreVersion] = useState(null);
  const [evolutionTree, setEvolutionTree] = useState(null);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [activeMoveTab, setActiveMoveTab] = useState("level-up");
  const [moveSearchQuery, setMoveSearchQuery] = useState("");
  const [selectedMoveType, setSelectedMoveType] = useState("all");
  const [selectedMoveCategory, setSelectedMoveCategory] = useState("all");
  const [expandedMove, setExpandedMove] = useState(null);
  const [moveDetails, setMoveDetails] = useState({});
  const [loadingMoveName, setLoadingMoveName] = useState(null);
  const [baseMoves, setBaseMoves] = useState(null);
  const [loadingBaseMoves, setLoadingBaseMoves] = useState(false);
  const [preEvoEggMoves, setPreEvoEggMoves] = useState([]);

  // Time Capsule & Generational Sprite Archive state
  const [selectedCustomSprite, setSelectedCustomSprite] = useState(null);
  const [showTimeCapsule, setShowTimeCapsule] = useState(false);

  // Wild Location Encounters state
  const [encounters, setEncounters] = useState(null);
  const [loadingEncounters, setLoadingEncounters] = useState(false);
  const [selectedEncounterVersion, setSelectedEncounterVersion] = useState("all");

  // Living Dex Trainer Collection Status
  const [collectionStatus, setCollectionStatus] = useState(() => {
    try {
      const raw = localStorage.getItem("pokedex_trainer_collection_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed[pokemon?.id] || null;
      }
    } catch (e) {}
    return null;
  });

  // Re-sync collectionStatus when pokemon changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pokedex_trainer_collection_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setCollectionStatus(parsed[pokemon?.id] || null);
        return;
      }
    } catch (e) {}
    setCollectionStatus(null);
  }, [pokemon?.id]);

  const handleToggleCollection = (e) => {
    if (e) e.stopPropagation();
    if (!pokemon?.id) return;
    try {
      const raw = localStorage.getItem("pokedex_trainer_collection_v1");
      const coll = raw ? JSON.parse(raw) : {};

      let nextStatus = null;
      if (!collectionStatus) {
        nextStatus = "caught";
      } else if (collectionStatus === "caught") {
        nextStatus = "shiny";
      } else if (collectionStatus === "shiny") {
        nextStatus = "wishlist";
      } else {
        nextStatus = null;
      }

      if (!nextStatus) {
        delete coll[pokemon.id];
      } else {
        coll[pokemon.id] = nextStatus;
      }

      localStorage.setItem("pokedex_trainer_collection_v1", JSON.stringify(coll));
      setCollectionStatus(nextStatus);
      window.dispatchEvent(new Event("pokedex_collection_updated"));
    } catch (err) {
      console.error("Collection write error:", err);
    }
  };

  // Auto-reset state and preload HOME sprites when viewing another Pokémon
  useEffect(() => {
    setActiveMoveTab("level-up");
    setMoveSearchQuery("");
    setSelectedMoveType("all");
    setSelectedMoveCategory("all");
    setIsShiny(false);
    setSelectedGender("male");
    setSelectedCustomSprite(null);
    setShowTimeCapsule(false);
    setEncounters(null);
    setSelectedEncounterVersion("all");

    // Preload HOME sprites for smooth, instant transitions
    if (pokemon?.sprites?.other?.home) {
      const home = pokemon.sprites.other.home;
      [
        home.front_default,
        home.front_shiny,
        home.front_female,
        home.front_shiny_female,
      ]
        .filter(Boolean)
        .forEach((url) => {
          const img = new Image();
          img.src = url;
        });
    }
  }, [pokemon?.id, pokemon?.name, pokemon?.sprites?.other?.home]);

  const mainType = pokemon?.types?.[0]?.type?.name || "normal";
  const baseSpeciesName = pokemon?.species?.name || pokemon?.name?.split("-")[0];
  const isInheritedMoves =
    (!pokemon?.moves || pokemon.moves.length === 0) &&
    baseMoves &&
    baseMoves.length > 0;

  // Determine form badge info
  const getFormBadge = () => {
    if (!pokemon) return null;
    const name = pokemon.name.toLowerCase();
    if (name.includes("-mega")) return "Mega Evolution";
    if (name.includes("-alola")) return "Alolan Form";
    if (name.includes("-galar")) return "Galarian Form";
    if (name.includes("-hisui")) return "Hisuian Form";
    if (name.includes("-paldea")) return "Paldean Form";
    if (name.includes("-gmax")) return "Gigantamax";
    if (!pokemon.is_default && !name.includes("-mega") && !name.includes("-gmax"))
      return "Special Form";
    return null;
  };

  const formBadge = getFormBadge();

  // Load type effectiveness on layout=horizontal
  useEffect(() => {
    if (!pokemon || layout !== "horizontal") return;

    const fetchMatchups = async () => {
      setLoadingEffects(true);
      try {
        const typePromises = pokemon.types.map(async (t) => {
          const typeName = t.type.name;
          if (typeRelationsCache[typeName]) {
            return typeRelationsCache[typeName];
          } else {
            const res = await axios.get(`https://pokeapi.co/api/v2/type/${typeName}`);
            typeRelationsCache[typeName] = res.data;
            return res.data;
          }
        });

        const typeDetails = await Promise.all(typePromises);

        const typeNames = Object.keys(typeColors);
        const multipliers = {};
        typeNames.forEach((t) => (multipliers[t] = 1));

        typeDetails.forEach((details) => {
          const rels = details.damage_relations;
          rels.double_damage_from.forEach((t) => {
            if (multipliers[t.name] !== undefined) multipliers[t.name] *= 2;
          });
          rels.half_damage_from.forEach((t) => {
            if (multipliers[t.name] !== undefined) multipliers[t.name] *= 0.5;
          });
          rels.no_damage_from.forEach((t) => {
            if (multipliers[t.name] !== undefined) multipliers[t.name] *= 0;
          });
        });

        const weak = [];
        const resistant = [];
        const immune = [];

        Object.keys(multipliers).forEach((tName) => {
          const mult = multipliers[tName];
          if (mult > 1) {
            weak.push({ name: tName, multiplier: mult });
          } else if (mult === 0) {
            immune.push({ name: tName, multiplier: 0 });
          } else if (mult < 1) {
            resistant.push({ name: tName, multiplier: mult });
          }
        });

        setTypeEffectiveness({ weak, resistant, immune });
      } catch (error) {
        console.error("Error loading card matchups details:", error);
      } finally {
        setLoadingEffects(false);
      }
    };

    fetchMatchups();
  }, [pokemon, layout]);

  // Sync / self-fetch species data if needed
  useEffect(() => {
    if (speciesData) {
      setInternalSpeciesData(speciesData);
      return;
    }
    if (!pokemon || layout !== "horizontal") return;

    let isMounted = true;
    const fetchSpecies = async () => {
      const cleanName = pokemon.name.toLowerCase();
      const baseName = pokemon.species?.name || cleanName.split("-")[0];

      if (speciesDetailsCache[cleanName]) {
        setInternalSpeciesData(speciesDetailsCache[cleanName]);
        return;
      }
      if (speciesDetailsCache[baseName]) {
        setInternalSpeciesData(speciesDetailsCache[baseName]);
        return;
      }

      try {
        let res;
        try {
          res = await axios.get(
            `https://pokeapi.co/api/v2/pokemon-species/${cleanName}/`
          );
        } catch (e1) {
          res = await axios.get(
            `https://pokeapi.co/api/v2/pokemon-species/${baseName}/`
          );
        }
        if (isMounted && res?.data) {
          speciesDetailsCache[cleanName] = res.data;
          speciesDetailsCache[baseName] = res.data;
          setInternalSpeciesData(res.data);
        }
      } catch (err) {
        console.error("Error loading species data for card:", err);
      }
    };

    fetchSpecies();
    return () => {
      isMounted = false;
    };
  }, [pokemon, layout, speciesData]);

  // Fetch evolution chain when species data is loaded
  useEffect(() => {
    if (layout !== "horizontal" || !internalSpeciesData?.evolution_chain?.url) {
      return;
    }

    const evoUrl = internalSpeciesData.evolution_chain.url.replace(/^http:/, "https:");

    if (evolutionChainCache[evoUrl]) {
      setEvolutionTree(evolutionChainCache[evoUrl]);
      return;
    }

    let isMounted = true;
    const fetchEvolution = async () => {
      setLoadingEvolution(true);
      try {
        const res = await axios.get(evoUrl);
        const parsed = parseEvolutionTree(res.data.chain);
        evolutionChainCache[evoUrl] = parsed;
        if (isMounted) {
          setEvolutionTree(parsed);
        }
      } catch (err) {
        console.error("Failed to load evolution chain:", err);
      } finally {
        if (isMounted) setLoadingEvolution(false);
      }
    };

    fetchEvolution();
    return () => {
      isMounted = false;
    };
  }, [internalSpeciesData, layout]);

  // Always ensure battle learnset moves are loaded (fall back to direct PokeAPI fetch or base species if missing or empty)
  useEffect(() => {
    if (pokemon?.moves && pokemon.moves.length > 0) {
      setBaseMoves(null);
      setLoadingBaseMoves(false);
      return;
    }

    if (!pokemon || layout !== "horizontal") return;

    let isMounted = true;
    const fetchFullPokemonMoves = async () => {
      setLoadingBaseMoves(true);
      try {
        const target = pokemon.name ? pokemon.name.toLowerCase() : pokemon.id;
        // First fetch target directly
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${target}`);
        if (isMounted && res.data?.moves && res.data.moves.length > 0) {
          setBaseMoves(res.data.moves);
          return;
        }

        // If target had empty moves (e.g. lucario-mega-z, special varieties), fetch base species
        const baseName = pokemon.species?.name || pokemon.name?.split("-")[0];
        if (baseName && baseName.toLowerCase() !== target) {
          const resolvedBase = resolvePokemonEndpointTarget(baseName.toLowerCase());
          const baseRes = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${resolvedBase}`
          );
          if (isMounted && baseRes.data?.moves) {
            setBaseMoves(baseRes.data.moves);
          }
        }
      } catch (err) {
        console.warn("Could not fetch moves fallback:", err);
      } finally {
        if (isMounted) setLoadingBaseMoves(false);
      }
    };

    fetchFullPokemonMoves();
    return () => {
      isMounted = false;
    };
  }, [pokemon, layout]);

  // Inherit Egg Moves from baby/pre-evolution stage if evolved form has none (e.g. Lucario from Riolu, Snorlax from Munchlax)
  useEffect(() => {
    if (!evolutionTree?.name || layout !== "horizontal") return;
    const rootName = evolutionTree.name.toLowerCase();
    const currentBaseName = (
      pokemon.species?.name || pokemon.name.split("-")[0]
    ).toLowerCase();

    if (rootName === currentBaseName || evolutionTree.speciesName === currentBaseName) {
      setPreEvoEggMoves([]);
      return;
    }

    let isMounted = true;
    const fetchPreEvoEggMoves = async () => {
      try {
        const resolvedRoot = resolvePokemonEndpointTarget(rootName);
        const res = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${resolvedRoot}`
        );
        if (isMounted && res.data?.moves) {
          const eggMoves = [];
          res.data.moves.forEach((m) => {
            const hasEgg = m.version_group_details?.some(
              (v) => v.move_learn_method?.name === "egg"
            );
            if (hasEgg) {
              eggMoves.push({
                name: m.move.name,
                url: m.move.url,
                level: 0,
                method: "egg",
                fromPreEvo: rootName,
              });
            }
          });
          eggMoves.sort((a, b) => a.name.localeCompare(b.name));
          setPreEvoEggMoves(eggMoves);
        }
      } catch (err) {
        console.warn("Could not fetch pre-evo egg moves:", err);
      }
    };

    fetchPreEvoEggMoves();
    return () => {
      isMounted = false;
    };
  }, [evolutionTree, pokemon, layout]);

  // Handles smooth collapsible on-demand ability description fetching
  const handleAbilityClick = async (abName, abUrl) => {
    const isExpanded = expandedAbility === abName;
    if (isExpanded) {
      setExpandedAbility(null);
      return;
    }

    setExpandedAbility(abName);

    if (abilityDetails[abName] || abilityCache[abName]) {
      if (!abilityDetails[abName]) {
        setAbilityDetails((prev) => ({
          ...prev,
          [abName]: abilityCache[abName],
        }));
      }
      return;
    }

    setLoadingAbilityName(abName);
    try {
      const secureUrl = abUrl.replace(/^http:/, "https:");
      const res = await axios.get(secureUrl);
      const englishEntry = res.data.effect_entries?.find(
        (eff) => eff.language.name === "en"
      );
      const effectText = englishEntry
        ? englishEntry.short_effect
        : "No details available in database.";

      abilityCache[abName] = effectText;
      setAbilityDetails((prev) => ({
        ...prev,
        [abName]: effectText,
      }));
    } catch (err) {
      console.error("Failed to load ability:", err);
      setAbilityDetails((prev) => ({
        ...prev,
        [abName]: "Failed to load description from the Dex servers.",
      }));
    } finally {
      setLoadingAbilityName(null);
    }
  };

  // Handles smooth collapsible on-demand move detail fetching
  const handleMoveClick = async (moveName, moveUrl) => {
    if (expandedMove === moveName) {
      setExpandedMove(null);
      return;
    }
    setExpandedMove(moveName);

    if (moveDetails[moveName] || moveDetailsCache[moveName]) {
      if (!moveDetails[moveName]) {
        setMoveDetails((prev) => ({
          ...prev,
          [moveName]: moveDetailsCache[moveName],
        }));
      }
      return;
    }

    setLoadingMoveName(moveName);
    try {
      const secureUrl = moveUrl.replace(/^http:/, "https:");
      const res = await axios.get(secureUrl);
      const enEntry = res.data.effect_entries?.find((e) => e.language.name === "en");
      const shortEffect = enEntry ? enEntry.short_effect : "No move description recorded.";
      const detailObj = {
        power: res.data.power ?? "—",
        accuracy: res.data.accuracy ? `${res.data.accuracy}%` : "—",
        pp: res.data.pp ?? "—",
        type: res.data.type?.name || "normal",
        damageClass: res.data.damage_class?.name || "status",
        effect: shortEffect.replace(/\$effect_chance%/, `${res.data.effect_chance}%`),
      };
      moveDetailsCache[moveName] = detailObj;
      setMoveDetails((prev) => ({
        ...prev,
        [moveName]: detailObj,
      }));
    } catch (err) {
      console.error("Failed to load move details:", err);
    } finally {
      setLoadingMoveName(null);
    }
  };

  // Audio Cry Player Handler (supports Modern Remaster and 8-Bit Retro Synthesizer Cry)
  const hasLegacyCry = Boolean(pokemon?.cries?.legacy);
  const hasLatestCry = Boolean(pokemon?.cries?.latest);
  const handlePlayCry = (type = "latest") => {
    const cryUrl =
      type === "legacy" && hasLegacyCry
        ? pokemon?.cries?.legacy
        : pokemon?.cries?.latest || pokemon?.cries?.legacy;
    if (!cryUrl || activeCryPlaying) return;
    setActiveCryPlaying(type);
    const audio = new Audio(cryUrl);
    audio.onended = () => {
      setActiveCryPlaying(null);
    };
    audio.onerror = () => {
      setActiveCryPlaying(null);
    };
    audio.play().catch((e) => {
      console.warn("Audio playback prevented:", e);
      setActiveCryPlaying(null);
    });
  };

  // Official Genus Category (e.g., "The Flame Pokémon", "The Mouse Pokémon")
  const officialGenus = useMemo(() => {
    if (!internalSpeciesData?.genera) return "";
    const en = internalSpeciesData.genera.find((g) => g.language?.name === "en");
    return en ? en.genus : "";
  }, [internalSpeciesData]);

  // Multilingual & Japanese Name Information
  const speciesNames = useMemo(() => {
    if (!internalSpeciesData?.names) return null;
    const jaKana = internalSpeciesData.names.find((n) => n.language?.name === "ja-Hrkt")?.name;
    const roomaji = internalSpeciesData.names.find((n) => n.language?.name === "roomaji")?.name;
    const french = internalSpeciesData.names.find((n) => n.language?.name === "fr")?.name;
    const german = internalSpeciesData.names.find((n) => n.language?.name === "de")?.name;
    return { jaKana, roomaji, french, german };
  }, [internalSpeciesData]);

  // Historical Sprites across Pokémon Generations (1996 - Present)
  const timeCapsuleSprites = useMemo(() => {
    if (!pokemon?.sprites) return [];
    const s = pokemon.sprites;
    const v = s.versions || {};
    const o = s.other || {};

    const list = [];

    // Gen 1 (Red / Blue / Yellow)
    const g1 = v["generation-i"]?.["red-blue"]?.front_default || v["generation-i"]?.yellow?.front_default;
    if (g1) list.push({ era: "Gen 1 (1996)", label: "Red / Blue", regular: g1, shiny: null, isPixel: true });

    // Gen 2 (Crystal / Gold / Silver)
    const g2 = v["generation-ii"]?.crystal?.front_default || v["generation-ii"]?.gold?.front_default;
    const g2s = v["generation-ii"]?.crystal?.front_shiny || v["generation-ii"]?.gold?.front_shiny;
    if (g2) list.push({ era: "Gen 2 (1999)", label: "Crystal", regular: g2, shiny: g2s, isPixel: true });

    // Gen 3 (Emerald / Ruby)
    const g3 = v["generation-iii"]?.emerald?.front_default || v["generation-iii"]?.["ruby-sapphire"]?.front_default;
    const g3s = v["generation-iii"]?.emerald?.front_shiny || v["generation-iii"]?.["ruby-sapphire"]?.front_shiny;
    if (g3) list.push({ era: "Gen 3 (2002)", label: "Emerald", regular: g3, shiny: g3s, isPixel: true });

    // Gen 4 (Platinum / Diamond / Pearl)
    const g4 = v["generation-iv"]?.platinum?.front_default || v["generation-iv"]?.["diamond-pearl"]?.front_default;
    const g4s = v["generation-iv"]?.platinum?.front_shiny || v["generation-iv"]?.["diamond-pearl"]?.front_shiny;
    if (g4) list.push({ era: "Gen 4 (2006)", label: "Platinum", regular: g4, shiny: g4s, isPixel: true });

    // Gen 5 (Black & White Animated)
    const g5Anim = v["generation-v"]?.["black-white"]?.animated?.front_default;
    const g5AnimShiny = v["generation-v"]?.["black-white"]?.animated?.front_shiny;
    const g5Static = v["generation-v"]?.["black-white"]?.front_default;
    const g5StaticShiny = v["generation-v"]?.["black-white"]?.front_shiny;
    if (g5Anim || g5Static) {
      list.push({
        era: "Gen 5 (2010)",
        label: "B&W Animated",
        regular: g5Anim || g5Static,
        shiny: g5AnimShiny || g5StaticShiny,
        isAnimated: Boolean(g5Anim),
        isPixel: true,
      });
    }

    // Showdown Battle Gif
    if (o.showdown?.front_default && o.showdown.front_default !== g5Anim) {
      list.push({
        era: "Showdown",
        label: "Battle GIF",
        regular: o.showdown.front_default,
        shiny: o.showdown.front_shiny,
        isAnimated: true,
      });
    }

    // Ken Sugimori Official Artwork
    if (o["official-artwork"]?.front_default) {
      list.push({
        era: "Official Art",
        label: "Sugimori Art",
        regular: o["official-artwork"].front_default,
        shiny: o["official-artwork"].front_shiny,
      });
    }

    // Dream World Art
    if (o.dream_world?.front_default) {
      list.push({
        era: "Dream World",
        label: "Vector Art",
        regular: o.dream_world.front_default,
        shiny: null,
      });
    }

    return list;
  }, [pokemon?.sprites]);

  // Load wild location encounters when layout is horizontal
  useEffect(() => {
    if (layout !== "horizontal" || !pokemon?.id) return;
    if (encountersCache[pokemon.id]) {
      setEncounters(encountersCache[pokemon.id]);
      return;
    }

    let isMounted = true;
    const fetchEncounters = async () => {
      setLoadingEncounters(true);
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`);
        encountersCache[pokemon.id] = res.data || [];
        if (isMounted) setEncounters(res.data || []);
      } catch (err) {
        console.warn("Could not load encounters for species:", err);
        if (isMounted) setEncounters([]);
      } finally {
        if (isMounted) setLoadingEncounters(false);
      }
    };

    fetchEncounters();
    return () => {
      isMounted = false;
    };
  }, [pokemon?.id, layout]);

  // Process wild encounters grouped by Game Version
  const processedEncounters = useMemo(() => {
    if (!encounters || encounters.length === 0) return { versions: [], byVersion: {} };
    const byVersion = {};

    encounters.forEach((item) => {
      const locName = item.location_area?.name || "";
      const cleanLoc = locName
        .replace(/^([a-z]+)-/, "")
        .replace(/-/g, " ")
        .replace(/\barea\b/gi, "")
        .trim()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      (item.version_details || []).forEach((vd) => {
        const vName = vd.version?.name;
        if (!vName) return;
        if (!byVersion[vName]) byVersion[vName] = [];

        (vd.encounter_details || []).forEach((ed) => {
          byVersion[vName].push({
            location: cleanLoc || "Wild Area",
            method: ed.method?.name ? ed.method.name.replace(/-/g, " ") : "wild encounter",
            chance: ed.chance,
            minLevel: ed.min_level,
            maxLevel: ed.max_level,
          });
        });
      });
    });

    const versions = Object.keys(byVersion).sort();
    return { versions, byVersion };
  }, [encounters]);

  // Sequential keyboard arrow navigation (Left = Prev #, Right = Next #)
  useEffect(() => {
    if (layout !== "horizontal") return;
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === "ArrowLeft" && pokemon?.id > 1) {
        onSelectPokemon && onSelectPokemon(String(pokemon.id - 1));
      } else if (e.key === "ArrowRight" && pokemon?.id < 1025) {
        onSelectPokemon && onSelectPokemon(String(pokemon.id + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [layout, pokemon?.id, onSelectPokemon]);

  // Multi-Game Lore Entries
  const loreEntries = useMemo(() => {
    if (!internalSpeciesData?.flavor_text_entries) return [];
    const english = internalSpeciesData.flavor_text_entries.filter(
      (e) => e.language?.name === "en"
    );
    const seenVersions = new Set();
    const result = [];
    english.forEach((entry) => {
      const vName = entry.version?.name;
      if (vName && !seenVersions.has(vName)) {
        seenVersions.add(vName);
        const cleaned = toSentenceCase(entry.flavor_text.replace(/[\f\n\r]/g, " "));
        result.push({
          version: vName,
          text: cleaned,
        });
      }
    });
    return result;
  }, [internalSpeciesData]);

  // Sync selected lore version
  useEffect(() => {
    if (loreEntries.length > 0) {
      setSelectedLoreVersion(loreEntries[loreEntries.length - 1].version);
    } else {
      setSelectedLoreVersion(null);
    }
  }, [loreEntries]);

  const activeLoreText = useMemo(() => {
    if (!selectedLoreVersion || loreEntries.length === 0) {
      return description || "No Pokédex entry recorded for this form.";
    }
    const found = loreEntries.find((e) => e.version === selectedLoreVersion);
    return found ? found.text : description || "No Pokédex entry recorded for this form.";
  }, [selectedLoreVersion, loreEntries, description]);

  // Available HOME Sprites & Gender Differences
  const hasFemaleHomeSprite = Boolean(pokemon?.sprites?.other?.home?.front_female);
  const hasShinyVariant = selectedCustomSprite ? Boolean(selectedCustomSprite.shiny) : true;
  const effectiveIsShiny = isShiny && hasShinyVariant;

  const currentDisplayImage = useMemo(() => {
    if (selectedCustomSprite) {
      if (effectiveIsShiny && selectedCustomSprite.shiny) {
        return selectedCustomSprite.shiny;
      }
      return selectedCustomSprite.regular || selectedCustomSprite.src;
    }

    const home = pokemon?.sprites?.other?.home;
    const sprites = pokemon?.sprites;

    if (selectedGender === "female" && hasFemaleHomeSprite) {
      if (effectiveIsShiny) {
        return (
          home?.front_shiny_female ||
          home?.front_shiny ||
          sprites?.front_shiny_female ||
          sprites?.front_shiny
        );
      }
      return (
        home?.front_female ||
        sprites?.front_female ||
        home?.front_default ||
        sprites?.front_default
      );
    }

    // Default / Male
    if (effectiveIsShiny) {
      return home?.front_shiny || sprites?.front_shiny;
    }
    return home?.front_default || sprites?.front_default;
  }, [pokemon, selectedGender, effectiveIsShiny, hasFemaleHomeSprite, selectedCustomSprite]);

  // Categorize Moves by Learning Method (with fallback to base form for special forms)
  const categorizedMoves = useMemo(() => {
    const rawMoves =
      pokemon?.moves && pokemon.moves.length > 0
        ? pokemon.moves
        : baseMoves || [];

    if (!rawMoves || rawMoves.length === 0) {
      return { "level-up": [], machine: [], egg: [], tutor: [] };
    }

    const levelUp = [];
    const machine = [];
    const egg = [];
    const tutor = [];

    rawMoves.forEach((m) => {
      const details = m.version_group_details || [];

      // Level-up moves
      const lvDetail = details
        .slice()
        .reverse()
        .find((d) => d.move_learn_method?.name === "level-up");
      if (lvDetail) {
        levelUp.push({
          name: m.move.name,
          url: m.move.url,
          level: lvDetail.level_learned_at,
          method: "level-up",
        });
      }

      // Machine (TM/HM) moves
      const tmDetail = details.find(
        (d) => d.move_learn_method?.name === "machine"
      );
      if (tmDetail) {
        machine.push({
          name: m.move.name,
          url: m.move.url,
          level: 0,
          method: "machine",
        });
      }

      // Egg moves
      const eggDetail = details.find(
        (d) => d.move_learn_method?.name === "egg"
      );
      if (eggDetail) {
        egg.push({
          name: m.move.name,
          url: m.move.url,
          level: 0,
          method: "egg",
        });
      }

      // Tutor moves
      const tutorDetail = details.find(
        (d) => d.move_learn_method?.name === "tutor"
      );
      if (tutorDetail) {
        tutor.push({
          name: m.move.name,
          url: m.move.url,
          level: 0,
          method: "tutor",
        });
      }
    });

    levelUp.sort((a, b) => a.level - b.level);
    machine.sort((a, b) => a.name.localeCompare(b.name));
    const effectiveEgg = egg.length > 0 ? egg : preEvoEggMoves;
    effectiveEgg.sort((a, b) => a.name.localeCompare(b.name));
    tutor.sort((a, b) => a.name.localeCompare(b.name));

    // Build unified all-moves pool with combined methods
    const allMovesMap = new Map();
    const addAll = (list, defaultMethod) => {
      list.forEach((m) => {
        const mLabel =
          m.method === "level-up"
            ? m.level > 0
              ? `Lv. ${m.level}`
              : "Lv. 1"
            : defaultMethod;
        if (!allMovesMap.has(m.name)) {
          allMovesMap.set(m.name, {
            name: m.name,
            url: m.url,
            level: m.level || 0,
            fromPreEvo: m.fromPreEvo,
            methods: [mLabel],
          });
        } else {
          const item = allMovesMap.get(m.name);
          if (!item.methods.includes(mLabel)) {
            item.methods.push(mLabel);
          }
          if (m.level > 0 && (!item.level || item.level === 0)) {
            item.level = m.level;
          }
        }
      });
    };

    addAll(levelUp, "Level-Up");
    addAll(machine, "TM");
    addAll(effectiveEgg, "Egg");
    addAll(tutor, "Tutor");

    const all = Array.from(allMovesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return { "level-up": levelUp, machine, egg: effectiveEgg, tutor, all };
  }, [pokemon?.moves, baseMoves, preEvoEggMoves]);

  // Available move types and category counts for active pool
  const moveFilterCounts = useMemo(() => {
    // When searching, pool across all moves; otherwise count within activeMoveTab
    const rawList = moveSearchQuery.trim()
      ? categorizedMoves.all || []
      : activeMoveTab === "all"
      ? categorizedMoves.all || []
      : categorizedMoves[activeMoveTab] || [];

    const categoryCounts = { all: rawList.length, physical: 0, special: 0, status: 0 };
    const typeCounts = { all: rawList.length };

    TYPE_NAMES.forEach((t) => {
      typeCounts[t] = 0;
    });

    rawList.forEach((m) => {
      const details = moveDetails[m.name] || moveDetailsCache[m.name];
      const meta = details || KNOWN_MOVE_META[m.name];
      if (meta) {
        if (meta.damageClass && categoryCounts[meta.damageClass] !== undefined) {
          categoryCounts[meta.damageClass]++;
        }
        if (meta.type) {
          typeCounts[meta.type] = (typeCounts[meta.type] || 0) + 1;
        }
      }
    });

    return { categoryCounts, typeCounts };
  }, [categorizedMoves, activeMoveTab, moveSearchQuery, moveDetails]);

  // Filtered active moves list (searches across all moves: level-up, TM, egg, tutor)
  const currentMoveList = useMemo(() => {
    // When searching with a query, search across all moves regardless of active tab
    let list = moveSearchQuery.trim()
      ? categorizedMoves.all || []
      : activeMoveTab === "all"
      ? categorizedMoves.all || []
      : categorizedMoves[activeMoveTab] || [];

    // Search query filter (matches across all learnsets)
    if (moveSearchQuery.trim()) {
      const q = moveSearchQuery.toLowerCase().trim();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Category filter (physical, special, status)
    if (selectedMoveCategory !== "all") {
      list = list.filter((m) => {
        const details = moveDetails[m.name] || moveDetailsCache[m.name];
        const meta = details || KNOWN_MOVE_META[m.name];
        return meta && meta.damageClass === selectedMoveCategory;
      });
    }

    // Type filter (normal, fire, etc.)
    if (selectedMoveType !== "all") {
      list = list.filter((m) => {
        const details = moveDetails[m.name] || moveDetailsCache[m.name];
        const meta = details || KNOWN_MOVE_META[m.name];
        return meta && meta.type === selectedMoveType;
      });
    }

    return list;
  }, [categorizedMoves, activeMoveTab, moveSearchQuery, selectedMoveCategory, selectedMoveType, moveDetails]);

  // Background prefetch move metadata for any moves in currentMoveList not in KNOWN_MOVE_META
  useEffect(() => {
    if (layout !== "horizontal" || !currentMoveList || currentMoveList.length === 0) return;

    let isMounted = true;
    const missing = currentMoveList
      .filter((m) => !KNOWN_MOVE_META[m.name] && !moveDetailsCache[m.name])
      .slice(0, 15);

    if (missing.length === 0) return;

    (async () => {
      for (const m of missing) {
        if (!isMounted) break;
        try {
          const res = await axios.get(m.url.replace(/^http:/, "https:"));
          if (!isMounted) break;
          const enEntry = res.data.effect_entries?.find((e) => e.language.name === "en");
          const shortEffect = enEntry ? enEntry.short_effect : "No move description recorded.";
          const detailObj = {
            power: res.data.power ?? "—",
            accuracy: res.data.accuracy ? `${res.data.accuracy}%` : "—",
            pp: res.data.pp ?? "—",
            type: res.data.type?.name || "normal",
            damageClass: res.data.damage_class?.name || "status",
            effect: shortEffect.replace(/\$effect_chance%/, `${res.data.effect_chance}%`),
          };
          moveDetailsCache[m.name] = detailObj;
          setMoveDetails((prev) => ({ ...prev, [m.name]: detailObj }));
        } catch (e) {
          // ignore background errors
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentMoveList, layout]);

  // Background prefetch details for signature moves & signature abilities
  useEffect(() => {
    if (!pokemon?.name) return;
    const sigMoves = getPokemonSignatureMoves(pokemon.name);
    const sigAbilities = getPokemonSignatureAbilities(pokemon.name);
    if (sigMoves.length === 0 && sigAbilities.length === 0) return;

    let isMounted = true;
    (async () => {
      for (const mName of sigMoves) {
        if (!isMounted) break;
        const slug = mName.toLowerCase().replace(/[\s']/g, "-");
        if (moveDetails[slug] || moveDetailsCache[slug]) continue;
        try {
          const matched = pokemon.moves?.find((m) => m.move.name === slug);
          const url = matched?.move?.url || `https://pokeapi.co/api/v2/move/${slug}`;
          const res = await axios.get(url.replace(/^http:/, "https:"));
          if (!isMounted) break;
          const enEntry = res.data.effect_entries?.find((e) => e.language.name === "en");
          const shortEffect = enEntry
            ? enEntry.short_effect
            : res.data.flavor_text_entries?.find((f) => f.language.name === "en")?.flavor_text || "Signature attack.";
          const detailObj = {
            power: res.data.power ?? "—",
            accuracy: res.data.accuracy ? `${res.data.accuracy}%` : "—",
            pp: res.data.pp ?? "—",
            type: res.data.type?.name || "normal",
            damageClass: res.data.damage_class?.name || "status",
            effect: shortEffect.replace(/\$effect_chance%/, `${res.data.effect_chance}%`),
          };
          moveDetailsCache[slug] = detailObj;
          setMoveDetails((prev) => ({ ...prev, [slug]: detailObj }));
        } catch (e) {
          // ignore
        }
      }

      for (const aName of sigAbilities) {
        if (!isMounted) break;
        const slug = aName.toLowerCase().replace(/[\s']/g, "-");
        if (abilityDetails[slug] || abilityCache[slug]) continue;
        try {
          const matched = pokemon.abilities?.find((a) => a.ability.name === slug);
          const url = matched?.ability?.url || `https://pokeapi.co/api/v2/ability/${slug}`;
          const res = await axios.get(url.replace(/^http:/, "https:"));
          if (!isMounted) break;
          const enEntry = res.data.effect_entries?.find((e) => e.language.name === "en");
          const effectText = enEntry
            ? enEntry.short_effect
            : res.data.flavor_text_entries?.find((f) => f.language.name === "en")?.flavor_text || "Signature ability.";
          abilityCache[slug] = effectText;
          setAbilityDetails((prev) => ({ ...prev, [slug]: effectText }));
        } catch (e) {
          // ignore
        }
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon?.name, pokemon?.moves, pokemon?.abilities]);

  // Alternate Forms / Varieties
  const varieties = useMemo(() => {
    if (!internalSpeciesData?.varieties || internalSpeciesData.varieties.length <= 1) {
      return [];
    }
    return internalSpeciesData.varieties.map((v) => ({
      name: v.pokemon.name,
      isDefault: v.is_default,
      displayName: formatPokemonName(v.pokemon.name),
    }));
  }, [internalSpeciesData]);

  // Training & Breeding Specs
  const evYieldList = useMemo(() => {
    if (!pokemon?.stats) return [];
    return pokemon.stats
      .filter((s) => s.effort > 0)
      .map((s) => {
        const meta = statMeta[s.stat.name];
        return `+${s.effort} ${meta?.label || s.stat.name.toUpperCase()}`;
      });
  }, [pokemon?.stats]);

  const genderInfo = useMemo(() => {
    const rate = internalSpeciesData?.gender_rate;
    if (rate === undefined || rate === null) return null;
    if (rate === -1) return { genderless: true };
    const femalePct = (rate / 8) * 100;
    const malePct = 100 - femalePct;
    return { genderless: false, malePct, femalePct };
  }, [internalSpeciesData?.gender_rate]);

  const catchRate = internalSpeciesData?.capture_rate;
  const hatchSteps = internalSpeciesData?.hatch_counter
    ? `${(internalSpeciesData.hatch_counter * 256).toLocaleString()} steps (${internalSpeciesData.hatch_counter} cycles)`
    : null;

  const eggGroups = internalSpeciesData?.egg_groups?.map((g) => g.name) || [];
  const growthRate = internalSpeciesData?.growth_rate?.name
    ? internalSpeciesData.growth_rate.name.replace(/-/g, " ")
    : null;
  const baseHappiness = internalSpeciesData?.base_happiness;

  const wildHeldItems = useMemo(() => {
    if (!pokemon?.held_items || pokemon.held_items.length === 0) return [];
    return (pokemon.held_items || []).map((item) => {
      const rarity = item.version_details?.[0]?.rarity || 5;
      return {
        name: item.item.name.replace(/-/g, " "),
        rarity: `${rarity}%`,
      };
    });
  }, [pokemon?.held_items]);

  const totalBaseStat = pokemon?.stats
    ? pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)
    : 0;

  // Official Pokémon Classification
  const officialClassification = useMemo(() => {
    if (!pokemon) return null;
    const name = pokemon.name.toLowerCase();
    const baseName = (pokemon.species?.name || name.split("-")[0]).toLowerCase();

    // 1. Mega Evolution & Battle Modes
    if (name.includes("-mega")) {
      return {
        label: "Mega Evolution",
        badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      };
    }
    if (name.includes("-gmax")) {
      return {
        label: "Gigantamax",
        badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      };
    }

    // 2. Mythical & Legendary Status (from official PokéAPI species flags)
    if (internalSpeciesData?.is_mythical) {
      return {
        label: "Mythical Pokémon",
        badge: "bg-pink-500/15 text-pink-400 border-pink-500/30",
      };
    }
    if (internalSpeciesData?.is_legendary) {
      return {
        label: "Legendary Pokémon",
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    }

    // 3. Ultra Beasts (Gen VII Extradimensional Species)
    const ULTRA_BEASTS = new Set([
      "nihilego", "buzzwole", "pheromosa", "xurkitree", "celesteela",
      "kartana", "guzzlord", "poipole", "naganadel", "stakataka", "blacephalon",
    ]);
    if (ULTRA_BEASTS.has(baseName)) {
      return {
        label: "Ultra Beast",
        badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      };
    }

    // 4. Paradox Pokémon (Gen IX Ancient & Future Species)
    const PARADOX_POKEMON = new Set([
      "great-tusk", "scream-tail", "brute-bonnet", "flutter-mane", "slither-wing",
      "sandy-shocks", "roaring-moon", "koraidon", "walking-wake", "gouging-fire", "raging-bolt",
      "iron-treads", "iron-bundle", "iron-hands", "iron-jugulis", "iron-moth",
      "iron-thorns", "iron-valiant", "miraidon", "iron-leaves", "iron-crown", "iron-boulder",
    ]);
    if (PARADOX_POKEMON.has(baseName) || PARADOX_POKEMON.has(name)) {
      return {
        label: "Paradox Pokémon",
        badge: "bg-teal-500/15 text-teal-400 border-teal-500/30",
      };
    }

    // 5. Baby Pokémon (official pre-evolution classification)
    if (internalSpeciesData?.is_baby) {
      return {
        label: "Baby Pokémon",
        badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      };
    }

    // 6. Evolution Hierarchy (Basic, Stage 1, Final Evolution, Single Stage)
    if (evolutionTree) {
      const rootName = evolutionTree.name?.toLowerCase();
      const rootSpecies = evolutionTree.speciesName?.toLowerCase() || rootName;
      const firstBranch = evolutionTree.evolvesTo || [];

      // Does not evolve and has no pre-evolution
      if ((rootName === baseName || rootSpecies === baseName) && firstBranch.length === 0) {
        return {
          label: "Single Stage",
          badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        };
      }

      // Root of chain with evolution(s)
      if ((rootName === baseName || rootSpecies === baseName) && firstBranch.length > 0) {
        return {
          label: "Basic Pokémon",
          badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      }

      // Second stage in chain
      const stage1Node = firstBranch.find(
        (n) => n.name?.toLowerCase() === baseName || n.speciesName?.toLowerCase() === baseName
      );
      if (stage1Node) {
        if (!stage1Node.evolvesTo || stage1Node.evolvesTo.length === 0) {
          return {
            label: "Final Evolution",
            badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
          };
        }
        return {
          label: "Stage 1 Evolution",
          badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        };
      }

      // Third stage in chain
      for (const s1 of firstBranch) {
        const stage2Node = (s1.evolvesTo || []).find(
          (n) => n.name?.toLowerCase() === baseName || n.speciesName?.toLowerCase() === baseName
        );
        if (stage2Node) {
          return {
            label: "Final Evolution",
            badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
          };
        }
      }
    }

    return {
      label: "Standard Pokémon",
      badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    };
  }, [pokemon, internalSpeciesData, evolutionTree]);

  const isBasculinEvolution = useMemo(() => {
    const name = pokemon?.name?.toLowerCase() || "";
    const rootName = evolutionTree?.name?.toLowerCase() || "";
    return (
      name.includes("basculin") ||
      name.includes("basculegion") ||
      rootName.includes("basculin") ||
      rootName.includes("basculegion") ||
      Boolean(evolutionTree?.isHisuianWhiteStriped)
    );
  }, [pokemon?.name, evolutionTree]);

  if (!pokemon) return null;

  const heightInMeters = (pokemon.height / 10).toFixed(1);
  const weightInKilograms = (pokemon.weight / 10).toFixed(1);

  const getBaseName = (name) => {
    if (!name) return "";
    let lower = name.toLowerCase();
    lower = lower.replace("-mega-x", "");
    lower = lower.replace("-mega-y", "");
    lower = lower.replace("-mega", "");
    lower = lower.replace("-gmax", "");
    lower = lower.replace("-alola", "");
    lower = lower.replace("-galar", "");
    lower = lower.replace("-hisui", "");
    lower = lower.replace("-paldea", "");
    return lower;
  };

  const getDebutRegion = (poke) => {
    let id = poke?.id;
    if (poke?.species?.url) {
      const match = poke.species.url.match(/\/pokemon-species\/(\d+)\//);
      if (match) id = parseInt(match[1], 10);
    }
    if (!id || id > 1025) return null;
    if (id >= 1 && id <= 151) return "kanto";
    if (id >= 152 && id <= 251) return "johto";
    if (id >= 252 && id <= 386) return "hoenn";
    if (id >= 387 && id <= 493) return "sinnoh";
    if (id >= 494 && id <= 649) return "unova";
    if (id >= 650 && id <= 721) return "kalos";
    if (id >= 722 && id <= 809) return "alola";
    if (id >= 810 && id <= 898) return "galar";
    if (id >= 899 && id <= 905) return "hisui";
    if (id >= 906 && id <= 1025) return "paldea";
    return null;
  };

  const nameLower = pokemon.name.toLowerCase();
  const baseName = pokemon.species?.name || getBaseName(pokemon.name);
  const regionOrder = [
    "kanto",
    "johto",
    "hoenn",
    "sinnoh",
    "unova",
    "kalos",
    "alola",
    "galar",
    "hisui",
    "paldea",
  ];

  let pokemonRegions = [];

  if (nameLower.includes("-galar")) {
    pokemonRegions = ["galar"];
  } else if (nameLower.includes("-paldea")) {
    pokemonRegions = ["paldea"];
  } else if (nameLower.includes("-alola")) {
    pokemonRegions = ["alola"];
  } else if (
    nameLower.includes("-hisui") ||
    nameLower.includes("basculegion") ||
    nameLower.includes("sneasler") ||
    nameLower.includes("overqwil") ||
    nameLower.includes("enamorus") ||
    nameLower.includes("dialga-origin") ||
    nameLower.includes("palkia-origin")
  ) {
    pokemonRegions = ["hisui"];
  } else {
    const fromMap =
      pokemonToRegionMap[pokemon.name] ||
      pokemonToRegionMap[pokemon.species?.name] ||
      pokemonToRegionMap[baseName] ||
      pokemonToRegionMap[pokemon.name.split("-")[0]] ||
      [];

    const regionSet = new Set(fromMap.map((r) => r.toLowerCase()));
    const debut = getDebutRegion(pokemon);
    if (debut) {
      regionSet.add(debut);
    }
    if (nameLower.includes("-gmax")) {
      regionSet.add("galar");
    }
    pokemonRegions = regionOrder.filter((r) => regionSet.has(r));
  }

  // Compact layout (vertical result cards in search/browse grids)
  if (layout === "vertical") {
    const defaultSprite =
      pokemon.sprites?.other?.home?.front_default ||
      pokemon.sprites?.front_default;

    const totalBaseStat = pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);

    return (
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="bg-theme-surface hover:bg-theme-surface-hover border border-theme hover:border-theme-accent/60 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center relative group overflow-hidden shadow-sm hover:shadow-xl select-none cursor-pointer h-full transition-all duration-200"
        style={{
          borderColor: isCompared
            ? "var(--color-accent-red)"
            : undefined,
          borderWidth: isCompared ? "2px" : "1px",
        }}
      >
        {/* Living Dex Quick-Status Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleToggleCollection}
          className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
            collectionStatus === "caught"
              ? "bg-rose-500/20 border border-rose-500 text-rose-400 shadow-xs"
              : collectionStatus === "shiny"
              ? "bg-amber-500/20 border border-amber-500 text-amber-400 shadow-xs"
              : collectionStatus === "wishlist"
              ? "bg-sky-500/20 border border-sky-500 text-sky-400 shadow-xs"
              : "bg-theme-bg/60 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface border border-theme/40"
          }`}
          title={`Dex Status: ${
            collectionStatus === "caught"
              ? "Caught (Click to toggle)"
              : collectionStatus === "shiny"
              ? "Caught Shiny"
              : collectionStatus === "wishlist"
              ? "Shiny Wishlist"
              : "Unregistered (Click to mark)"
          }`}
          aria-label="Toggle Living Dex Status"
        >
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full overflow-hidden flex-shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="95" fill={collectionStatus === "shiny" ? "#fef08a" : "#f8fafc"} stroke="#0f172a" strokeWidth="16" />
              <path d="M5,100 a95,95 0 0,1 190,0" fill={collectionStatus === "caught" ? "#e11d48" : collectionStatus === "shiny" ? "#f59e0b" : collectionStatus === "wishlist" ? "#0284c7" : "#64748b"} stroke="#0f172a" strokeWidth="16" />
              <rect x="5" y="92" width="190" height="16" fill="#0f172a" />
              <circle cx="100" cy="100" r="32" fill="#f8fafc" stroke="#0f172a" strokeWidth="16" />
              <circle cx="100" cy="100" r="14" fill={collectionStatus ? "#0f172a" : "#94a3b8"} />
            </svg>
          </div>
        </motion.button>

        {onToggleCompare && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(pokemon);
            }}
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
              isCompared
                ? "bg-theme-accent text-white shadow-md ring-2 ring-theme-accent/50"
                : "bg-theme-bg/60 text-theme-secondary hover:text-theme-primary hover:bg-theme-surface"
            }`}
            title="Toggle Comparison"
            aria-label="Toggle Comparison"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            >
              <path d="M9 2a1 1 0 0 0-2 0v8H3a1 1 0 1 0 0 2h4v6a1 1 0 1 0 2 0v-6h4a1 1 0 1 0 0-2H9V2Z" />
            </svg>
          </motion.button>
        )}

        {/* Clean floating HOME sprite stage with ambient halo */}
        <div className="relative w-full aspect-square max-w-[8rem] sm:max-w-[11rem] flex items-center justify-center p-1 sm:p-2 mb-1.5 sm:mb-2 transition-all duration-200">
          <div className="absolute inset-2 rounded-full bg-theme-accent/5 filter blur-xl group-hover:bg-theme-accent/15 transition-colors duration-300 pointer-events-none" />
          <img
            src={defaultSprite}
            alt={pokemon.name}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-200 z-10"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/256x256/1e293b/ffffff?text=No+Image`;
            }}
          />
        </div>

        {/* Typography & Identification */}
        <div className="flex flex-col items-center justify-center mb-2 w-full px-1">
          <span className="text-[10px] sm:text-[11px] font-mono-tech text-theme-secondary/80 font-bold tracking-wider mb-0.5">
            #{String(pokemon.id).padStart(4, "0")}
          </span>
          <h2 className="text-sm sm:text-lg font-display font-extrabold text-theme-primary text-center tracking-tight leading-snug truncate w-full">
            {formatPokemonName(pokemon.name)}
          </h2>
          <div className="flex items-center gap-1 mt-1 flex-wrap justify-center">
            {formBadge && (
              <span className="px-1.5 py-0.5 rounded-md bg-theme-gold-bg text-theme-gold text-[8px] font-display font-bold uppercase">
                {formBadge}
              </span>
            )}
            {(() => {
              const archetype = getPokemonArchetype(pokemon);
              if (!archetype) return null;
              return (
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-mono-tech font-bold uppercase border ${archetype.color}`}>
                  {archetype.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Champions Type Badges */}
        <div className="flex gap-1 sm:gap-1.5 mb-2.5 sm:mb-3 justify-center flex-wrap">
          {pokemon.types.map((t) => (
            <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
          ))}
        </div>

        {/* Sleek Stats Footer without harsh border box */}
        <div className="w-full pt-2 flex flex-col gap-1 sm:gap-1.5 mt-auto border-t border-theme/30">
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono-tech text-theme-secondary px-0.5">
            <span className="uppercase tracking-wider">Base Stats</span>
            <span className="font-bold text-theme-primary">
              BST {totalBaseStat}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-0.5 sm:gap-1 w-full">
            {pokemon.stats.map((s) => {
              const meta = statMeta[s.stat.name];
              if (!meta) return null;
              const pct = Math.min((s.base_stat / meta.max) * 100, 100);
              return (
                <div
                  key={s.stat.name}
                  className="flex flex-col items-center gap-0.5 sm:gap-1"
                  title={`${meta.label}: ${s.base_stat}`}
                >
                  <div className="w-full h-1 bg-theme-input/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[7px] sm:text-[9px] font-mono-tech text-theme-secondary/80 font-semibold">
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // Full Details Layout (horizontal layout / main selected card)
  return (
    <div className="pokedex-chassis bg-theme-surface border border-theme rounded-2xl p-3.5 sm:p-7 md:p-8 flex flex-col gap-6 sm:gap-8 shadow-xl relative animate-card-in overflow-hidden w-full">
      {/* Card Top Header */}
      <div className="flex items-center justify-between border-b border-theme pb-4 w-full flex-wrap gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-2xl sm:text-3xl font-display font-black text-theme-accent tracking-tight">
            #{String(pokemon.id).padStart(4, "0")}
          </span>

          {/* Sequential Prev / Next Buttons */}
          <div className="flex items-center gap-1">
            {pokemon.id > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onSelectPokemon && onSelectPokemon(String(pokemon.id - 1))}
                className="px-2 py-1 bg-theme-surface hover:bg-theme-surface-hover border border-theme hover:border-theme-accent rounded-lg text-xs font-display font-bold text-theme-secondary hover:text-theme-primary flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="Previous Pokémon (ArrowLeft)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">#{String(pokemon.id - 1).padStart(4, "0")}</span>
              </motion.button>
            )}
            {pokemon.id < 1025 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onSelectPokemon && onSelectPokemon(String(pokemon.id + 1))}
                className="px-2 py-1 bg-theme-surface hover:bg-theme-surface-hover border border-theme hover:border-theme-accent rounded-lg text-xs font-display font-bold text-theme-secondary hover:text-theme-primary flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                title="Next Pokémon (ArrowRight)"
              >
                <span className="hidden sm:inline">#{String(pokemon.id + 1).padStart(4, "0")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
          </div>

          {formBadge &&
            (!officialClassification ||
              officialClassification.label.trim().toLowerCase() !==
                formBadge.trim().toLowerCase()) && (
              <span className="px-2.5 py-0.5 rounded-md bg-theme-accent/10 text-theme-accent border border-theme-accent/30 text-[10px] font-display font-bold uppercase tracking-wider">
                {formBadge}
              </span>
            )}

          {/* Dual Cry Player: Modern & 8-Bit Retro */}
          <div className="flex items-center bg-theme-surface border border-theme rounded-xl p-0.5 shadow-xs">
            {hasLatestCry && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handlePlayCry("latest")}
                disabled={Boolean(activeCryPlaying)}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-display text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  activeCryPlaying === "latest"
                    ? "bg-theme-accent text-white border-theme-accent animate-pulse shadow-xs"
                    : "bg-transparent hover:bg-theme-surface-hover text-theme-primary border-transparent"
                }`}
                title="Play remastered modern cry"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-theme-accent">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                </svg>
                <span>{activeCryPlaying === "latest" ? "Playing..." : "Cry"}</span>
              </motion.button>
            )}

            {hasLegacyCry && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handlePlayCry("legacy")}
                disabled={Boolean(activeCryPlaying)}
                className={`px-2 py-1 rounded-lg border flex items-center gap-1 font-display text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  activeCryPlaying === "legacy"
                    ? "bg-amber-500 text-slate-950 font-bold border-amber-500 animate-pulse shadow-xs"
                    : "bg-transparent hover:bg-theme-surface-hover text-amber-400 border-transparent"
                }`}
                title="Play authentic 8-bit Game Boy synthesizer chiptune cry"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect width="18" height="12" x="3" y="6" rx="2" />
                  <path d="M7 12h2m-1-1v2m6-1h.01m3 0h.01" />
                </svg>
                <span className="hidden sm:inline">8-Bit</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Right side of header: Living Dex Catch status & Classification */}
        <div className="flex items-center gap-2">
          {/* Living Dex Catch Tracker Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleToggleCollection}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-display font-bold cursor-pointer transition-all shadow-xs ${
              collectionStatus === "caught"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/40 ring-1 ring-rose-500/30"
                : collectionStatus === "shiny"
                ? "bg-amber-500/15 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30"
                : collectionStatus === "wishlist"
                ? "bg-sky-500/15 text-sky-400 border-sky-500/40 ring-1 ring-sky-500/30"
                : "bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary border-theme"
            }`}
            title="Click to cycle Living Dex status (Unregistered -> Caught -> Shiny -> Wishlist)"
          >
            <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="95" fill={collectionStatus === "shiny" ? "#fef08a" : "#f8fafc"} stroke="#0f172a" strokeWidth="16" />
                <path d="M5,100 a95,95 0 0,1 190,0" fill={collectionStatus === "caught" ? "#e11d48" : collectionStatus === "shiny" ? "#f59e0b" : collectionStatus === "wishlist" ? "#0284c7" : "#64748b"} stroke="#0f172a" strokeWidth="16" />
                <rect x="5" y="92" width="190" height="16" fill="#0f172a" />
                <circle cx="100" cy="100" r="32" fill="#f8fafc" stroke="#0f172a" strokeWidth="16" />
                <circle cx="100" cy="100" r="14" fill={collectionStatus ? "#0f172a" : "#94a3b8"} />
              </svg>
            </div>
            <span>
              {collectionStatus === "caught"
                ? "Caught"
                : collectionStatus === "shiny"
                ? "Caught Shiny"
                : collectionStatus === "wishlist"
                ? "Shiny Wishlist"
                : "Catch in Dex"}
            </span>
          </motion.button>

          {officialClassification && (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold border uppercase tracking-wider ${officialClassification.badge}`}>
              {officialClassification.label}
            </span>
          )}
        </div>
      </div>

      {/* Top Deck: 2-Column Responsive Deck (Biology & Identity on Left, Combat & Training on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full items-start">
        {/* Left Column (Desktop: 5 cols / ~42%): Identity, Sprite Showcase, Dex Entry & Characteristics */}
        <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5 w-full">
          {/* Pokémon Title & Types */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-theme-primary tracking-[-0.02em] flex items-center gap-2.5 flex-wrap">
                {formatPokemonName(pokemon.name)}
              </h2>
            </div>

            {/* Genus Category & Multilingual Japanese Kana */}
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {officialGenus && (
                <span className="text-xs sm:text-sm font-display font-medium text-theme-secondary italic">
                  The {officialGenus}
                </span>
              )}
              {speciesNames?.jaKana && (
                <span
                  className="px-2 py-0.5 rounded-md bg-theme-bg/80 border border-theme text-[11px] font-display text-theme-secondary hover:text-theme-primary flex items-center gap-1 shadow-2xs select-none"
                  title={`Japanese: ${speciesNames.roomaji || speciesNames.jaKana} | French: ${speciesNames.french || "—"} | German: ${speciesNames.german || "—"}`}
                >
                  <span className="font-bold text-theme-primary">{speciesNames.jaKana}</span>
                  {speciesNames.roomaji && (
                    <span className="text-[10px] font-mono-tech opacity-75">
                      ({speciesNames.roomaji})
                    </span>
                  )}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} size="md" />
              ))}
            </div>
          </div>

          {/* Sprite Showcase Stage */}
          <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 min-h-[260px] sm:min-h-[300px] lg:min-h-[320px] select-none group">
            {/* Dynamic Ambient Glow with smooth color shift */}
            <div
              className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full filter blur-3xl pointer-events-none -z-10 transition-colors duration-500"
              style={{
                backgroundColor: effectiveIsShiny
                  ? "rgba(245, 158, 11, 0.28)"
                  : mainType === "fire"
                  ? "rgba(239, 68, 68, 0.22)"
                  : mainType === "water"
                  ? "rgba(59, 130, 246, 0.22)"
                  : mainType === "grass"
                  ? "rgba(16, 185, 129, 0.22)"
                  : mainType === "electric"
                  ? "rgba(245, 158, 11, 0.22)"
                  : mainType === "fighting"
                  ? "rgba(220, 38, 38, 0.22)"
                  : mainType === "steel"
                  ? "rgba(148, 163, 184, 0.22)"
                  : mainType === "psychic"
                  ? "rgba(236, 72, 153, 0.22)"
                  : "rgba(100, 116, 139, 0.22)",
              }}
            />

            {/* Shiny Sparkle Burst */}
            {effectiveIsShiny && (
              <ShinySparkles triggerKey={shinySparkleKey} />
            )}

            {/* Smooth Spring Transition between Normal and Shiny / Genders */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={`${currentDisplayImage}-${effectiveIsShiny ? "shiny" : "regular"}-${selectedGender}`}
                initial={{
                  opacity: 0,
                  scale: effectiveIsShiny ? 0.93 : 1.05,
                  filter: effectiveIsShiny ? "brightness(1.25) saturate(1.15)" : "brightness(0.9)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "brightness(1) saturate(1)",
                }}
                exit={{
                  opacity: 0,
                  scale: effectiveIsShiny ? 1.05 : 0.93,
                  filter: effectiveIsShiny ? "brightness(0.9)" : "brightness(1.2)",
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                src={currentDisplayImage}
                alt={pokemon.name}
                className="w-full h-full max-h-[240px] sm:max-h-[280px] lg:max-h-[310px] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] transform group-hover:scale-105 transition-transform duration-200 z-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/512x512/1e293b/ffffff?text=No+Image`;
                }}
              />
            </AnimatePresence>
          </div>

          {/* Sprite Controls: Regular / Shiny & Gender Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 self-center">
            {/* Shiny Switcher (Only if the active sprite has a shiny variant) */}
            {hasShinyVariant && (
              <div className="inline-flex items-center bg-theme-surface p-1 rounded-xl border border-theme shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsShiny(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 cursor-pointer ${
                    !effectiveIsShiny
                      ? "bg-theme-bg text-theme-primary border border-theme shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  Regular
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsShiny(true);
                    setShinySparkleKey((prev) => prev + 1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    effectiveIsShiny
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                  title="Toggle Shiny color variation"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
                  </svg>
                  <span>Shiny</span>
                </button>
              </div>
            )}

            {/* Gender Switcher (Only if female HOME sprite is available) */}
            {hasFemaleHomeSprite && (
              <div className="inline-flex items-center bg-theme-surface p-1 rounded-xl border border-theme shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedGender("male")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                    selectedGender === "male"
                      ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                  title="Male appearance"
                >
                  <span className="text-sm font-bold">♂</span>
                  <span>Male</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender("female")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                    selectedGender === "female"
                      ? "bg-pink-500/15 text-pink-400 border border-pink-500/30 shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary"
                  }`}
                  title="Female appearance"
                >
                  <span className="text-sm font-bold">♀</span>
                  <span>Female</span>
                </button>
              </div>
            )}

            {/* Time Capsule Historical Sprites Button */}
            {timeCapsuleSprites.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTimeCapsule((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  showTimeCapsule || selectedCustomSprite
                    ? "bg-purple-500/15 text-purple-400 border-purple-500/40 ring-1 ring-purple-500/30"
                    : "bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary border-theme"
                }`}
                title="View historical sprites across Pokémon generations (1996 - Present)"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                </svg>
                <span>Time Capsule</span>
                {selectedCustomSprite && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                )}
              </button>
            )}
          </div>

          {/* Active Custom Sprite notice */}
          {selectedCustomSprite && (
            <div className="flex items-center justify-center gap-2 text-xs font-display text-theme-secondary mt-0.5">
              <span>
                Viewing: <strong className="text-theme-primary">{selectedCustomSprite.era} - {selectedCustomSprite.label}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomSprite(null)}
                className="text-[11px] font-bold text-theme-accent hover:underline cursor-pointer"
              >
                Reset to HOME ✕
              </button>
            </div>
          )}

          {/* Time Capsule Expandable Sprite Tray */}
          <AnimatePresence>
            {showTimeCapsule && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-theme-bg border border-theme rounded-2xl p-3 sm:p-4 mt-2 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono-tech font-bold text-theme-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                    </svg>
                    <span>Generational Sprite Archive</span>
                  </span>
                  <span className="text-[10px] font-display text-theme-secondary">
                    Click any sprite to preview
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1">
                  {timeCapsuleSprites.map((item) => {
                    const isSelected = selectedCustomSprite?.era === item.era;
                    const imgSrc = isShiny && item.shiny ? item.shiny : item.regular;

                    return (
                      <button
                        key={item.era}
                        type="button"
                        onClick={() => {
                          setSelectedCustomSprite(item);
                          if (!item.shiny && isShiny) {
                            setIsShiny(false);
                          }
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl border flex-shrink-0 transition-all cursor-pointer select-none min-w-[76px] ${
                          isSelected
                            ? "bg-purple-500/15 border-purple-500/60 ring-2 ring-purple-500/40"
                            : "bg-theme-surface hover:bg-theme-surface-hover border-theme"
                        }`}
                        title={`${item.era} (${item.label}) - Click to preview`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-1">
                          <img
                            src={imgSrc}
                            alt={item.label}
                            className={`max-w-full max-h-full object-contain ${
                              item.isPixel ? "rendering-pixelated" : ""
                            }`}
                            style={item.isPixel ? { imageRendering: "pixelated" } : {}}
                          />
                        </div>
                        <span className="text-[9px] font-mono-tech font-bold text-theme-primary text-center truncate w-full">
                          {item.label}
                        </span>
                        <span className="text-[8px] font-mono-tech text-theme-secondary text-center truncate w-full">
                          {item.era}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alternate Forms */}
          {varieties.length > 1 && (
            <div className="flex flex-col items-center gap-1.5 pt-1 w-full">
              <span className="text-[10px] font-mono-tech font-bold text-theme-secondary uppercase tracking-wider">
                Alternate Forms ({varieties.length})
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center max-h-28 overflow-y-auto">
                {varieties.map((v) => {
                  const isActive = v.name.toLowerCase() === pokemon.name.toLowerCase();
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => onSelectPokemon && onSelectPokemon(v.name)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-display font-bold transition-all duration-150 capitalize cursor-pointer border ${
                        isActive
                          ? "bg-theme-accent text-white border-theme-accent shadow-xs"
                          : "bg-theme-surface hover:bg-theme-surface-hover border-theme text-theme-secondary hover:text-theme-primary"
                      }`}
                    >
                      {v.displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Multi-Game Lore Entry with Game Version Selector */}
          <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5 relative border-l-4 border-l-theme-accent">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-xs font-display font-bold text-theme-accent uppercase tracking-wider">
                DEX ENTRY
              </span>

              {loreEntries.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-display text-theme-secondary hidden sm:inline">
                    Game Version:
                  </span>
                  <select
                    value={selectedLoreVersion || ""}
                    onChange={(e) => setSelectedLoreVersion(e.target.value)}
                    className="bg-theme-surface border border-theme text-theme-primary text-xs font-display rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-theme-accent cursor-pointer capitalize"
                  >
                    {loreEntries.map((entry) => (
                      <option key={entry.version} value={entry.version}>
                        {entry.version.replace(/-/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <p className="text-sm font-display text-theme-primary/90 leading-relaxed mt-1">
              {activeLoreText}
            </p>
          </div>

          {/* Characteristics: Biometric & Regional Habitats */}
          <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-display font-bold text-theme-secondary uppercase tracking-wider mb-3">
                Characteristics
              </h3>
              <div className="grid grid-cols-2 gap-3 border-b border-theme pb-3 mb-3">
                <div className="flex flex-col">
                  <span className="text-theme-secondary font-display uppercase text-[10px]">Height</span>
                  <span className="text-theme-primary font-display font-bold text-sm">
                    {heightInMeters} m <span className="text-theme-secondary font-normal text-xs">({(Number(heightInMeters) * 3.28084).toFixed(1)} ft)</span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-theme-secondary font-display uppercase text-[10px]">Weight</span>
                  <span className="text-theme-primary font-display font-bold text-sm">
                    {weightInKilograms} kg <span className="text-theme-secondary font-normal text-xs">({(Number(weightInKilograms) * 2.20462).toFixed(1)} lbs)</span>
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-display font-bold text-theme-secondary uppercase tracking-wider mb-2">
                Regional Habitats
              </h4>
              <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1.5">
                {pokemonRegions.length > 0 ? (
                  pokemonRegions.map((regionName) => (
                    <span
                      key={regionName}
                      className="px-2.5 py-1 bg-theme-surface hover:bg-theme-surface-hover text-theme-primary text-[10px] font-mono-tech uppercase rounded-md border border-theme shadow-xs"
                    >
                      {regionName}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-display text-theme-secondary italic">
                    Undocumented habitat
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop: 7 cols / ~58%): Battle Stats, Matchups, Training/Breeding & Abilities */}
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 w-full">
          {/* Animated Base Stats Graph */}
          <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-display font-bold text-theme-secondary uppercase tracking-wider">
                  Base Stats
                </h3>
              </div>
              <span className="text-theme-accent font-display font-bold text-sm">
                BST: {totalBaseStat}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {pokemon.stats.map((s) => {
                const meta = statMeta[s.stat.name];
                if (!meta) return null;
                const pct = Math.min((s.base_stat / meta.max) * 100, 100);
                return (
                  <div
                    key={s.stat.name}
                    className="flex flex-col sm:flex-row sm:items-center text-xs font-display gap-1 sm:gap-4"
                  >
                    <span className="w-16 font-display text-theme-secondary font-bold uppercase text-[11px]">
                      {meta.label}
                    </span>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 h-2.5 sm:h-3 bg-theme-input/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} animate-stat-grow`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-theme-primary font-display font-bold text-xs">
                        {s.base_stat}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compound Type Effectiveness Matchups */}
          <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-display font-bold text-theme-secondary uppercase tracking-wider mb-3">
              Type Matchups & Defenses
            </h3>
            {loadingEffects ? (
              <div className="flex items-center gap-2 text-theme-secondary text-xs font-display">
                <svg
                  className="animate-spin h-4 w-4 text-theme-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Calculating compound elements...
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-xs font-display">
                {typeEffectiveness.weak.length > 0 && (
                  <div>
                    <span className="text-red-500 font-bold block mb-1.5 text-[11px]">
                      WEAK TO
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.weak.map((wt) => (
                        <div key={wt.name} className="inline-flex items-center gap-1">
                          <TypeBadge type={wt.name} size="sm" />
                          <span className="text-[10px] font-mono-tech font-bold text-red-400">
                            {wt.multiplier}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {typeEffectiveness.resistant.length > 0 && (
                  <div>
                    <span className="text-green-500 font-bold block mb-1.5 text-[11px]">
                      RESISTANT TO
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.resistant.map((rt) => (
                        <div key={rt.name} className="inline-flex items-center gap-1">
                          <TypeBadge type={rt.name} size="sm" />
                          <span className="text-[10px] font-mono-tech font-bold text-emerald-400">
                            {rt.multiplier}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {typeEffectiveness.immune.length > 0 && (
                  <div>
                    <span className="text-blue-500 font-bold block mb-1.5 text-[11px]">
                      IMMUNE TO
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {typeEffectiveness.immune.map((it) => (
                        <div key={it.name} className="inline-flex items-center gap-1">
                          <TypeBadge type={it.name} size="sm" />
                          <span className="text-[10px] font-mono-tech font-bold text-sky-400">
                            0x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Training & Breeding Profile */}
          <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-display font-bold text-theme-secondary uppercase tracking-wider mb-3">
              TRAINING & BREEDING
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs font-display">
              {/* Sub-column 1 */}
              <div className="flex flex-col gap-2.5">
                {/* EV Yield */}
                <div className="flex justify-between items-center border-b border-theme pb-2">
                  <span className="text-theme-secondary font-mono-tech uppercase">EV YIELD</span>
                  <span className="text-rose-500 font-mono-tech font-bold">
                    {evYieldList.length > 0 ? evYieldList.join(", ") : "None"}
                  </span>
                </div>

                {/* Catch Rate with Meter */}
                {catchRate !== undefined && catchRate !== null && (
                  <div className="flex flex-col gap-1 border-b border-theme pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-theme-secondary font-mono-tech uppercase">CATCH RATE</span>
                      <span className="text-theme-primary font-mono-tech font-bold">
                        {catchRate} <span className="text-theme-secondary font-normal text-[10px]">/ 255</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-theme-input/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.min((catchRate / 255) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Gender Ratio with dual-color split bar */}
                {genderInfo && (
                  <div className="flex flex-col gap-1 border-b border-theme pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-theme-secondary font-mono-tech uppercase">GENDER RATIO</span>
                      {genderInfo.genderless ? (
                        <span className="text-theme-secondary italic text-[11px]">
                          Genderless
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 font-mono-tech text-[11px] font-bold">
                          <span className="text-sky-400">♂ {genderInfo.malePct}%</span>
                          <span className="text-pink-400">♀ {genderInfo.femalePct}%</span>
                        </div>
                      )}
                    </div>
                    {!genderInfo.genderless && (
                      <div className="w-full h-1.5 bg-theme-input/60 rounded-full overflow-hidden flex">
                        <div className="h-full bg-sky-400" style={{ width: `${genderInfo.malePct}%` }} />
                        <div className="h-full bg-pink-400" style={{ width: `${genderInfo.femalePct}%` }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-column 2 */}
              <div className="flex flex-col gap-2.5">
                {/* Egg Groups */}
                <div className="flex justify-between items-center border-b border-theme pb-2">
                  <span className="text-theme-secondary font-mono-tech uppercase">EGG GROUPS</span>
                  <span className="text-theme-primary font-display font-semibold capitalize truncate max-w-[150px]">
                    {eggGroups.length > 0 ? eggGroups.join(", ") : "Undiscovered"}
                  </span>
                </div>

                {/* Growth Rate */}
                {growthRate && (
                  <div className="flex justify-between items-center border-b border-theme pb-2">
                    <span className="text-theme-secondary font-mono-tech uppercase">GROWTH RATE</span>
                    <span className="text-theme-primary font-display font-semibold capitalize">
                      {growthRate}
                    </span>
                  </div>
                )}

                {/* Base Friendship with meter */}
                {baseHappiness !== undefined && baseHappiness !== null && (
                  <div className="flex flex-col gap-1 border-b border-theme pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-theme-secondary font-mono-tech uppercase">BASE FRIENDSHIP</span>
                      <span className="text-theme-primary font-mono-tech font-bold">
                        {baseHappiness} <span className="text-theme-secondary font-normal text-[10px]">/ 255</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-theme-input/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min((baseHappiness / 255) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Hatch Cycles */}
                {hatchSteps && (
                  <div className="flex justify-between items-center border-b border-theme pb-2">
                    <span className="text-theme-secondary font-mono-tech uppercase">HATCH CYCLES</span>
                    <span className="text-theme-primary font-mono-tech font-semibold">
                      {hatchSteps}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Wild Held Items */}
            {wildHeldItems.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-theme">
                <span className="text-[10px] font-mono-tech font-bold text-theme-secondary uppercase tracking-wider block mb-1.5">
                  WILD HELD ITEMS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {wildHeldItems.map((item) => (
                    <span
                      key={item.name}
                      className="px-2 py-0.5 rounded bg-theme-surface text-[10px] font-mono-tech capitalize text-theme-primary border border-theme"
                    >
                      {item.name} ({item.rarity})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exclusive Signature Traits (Signature Moves & Abilities) */}
          {(() => {
            const sigMoves = getPokemonSignatureMoves(pokemon.name);
            const sigAbilities = getPokemonSignatureAbilities(pokemon.name);
            if (sigMoves.length === 0 && sigAbilities.length === 0) return null;

            return (
              <div className="bg-theme-bg border border-purple-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    <h3 className="text-xs font-display font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      ★ Exclusive Signature Traits
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold uppercase">
                    Canon Exclusive
                  </span>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  {/* Signature Moves */}
                  {sigMoves.map((mName) => {
                    const slug = mName.toLowerCase().replace(/[\s']/g, "-");
                    const details = moveDetails[slug] || moveDetailsCache[slug];
                    const meta = details || KNOWN_MOVE_META[slug] || {};
                    const moveType = meta.type || "normal";
                    const damageClass = meta.damageClass || "status";

                    return (
                      <div
                        key={mName}
                        className="p-3 rounded-xl bg-theme-surface/90 border border-theme hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono-tech font-bold text-purple-400">
                              ⚔ SIGNATURE MOVE:
                            </span>
                            <span className="font-display font-bold text-theme-primary text-sm">
                              {mName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TypeBadge type={moveType} size="sm" />
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-mono-tech font-bold uppercase ${
                                damageClass === "physical"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : damageClass === "special"
                                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                  : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                              }`}
                            >
                              {damageClass}
                            </span>
                          </div>
                        </div>

                        {/* Power, Acc, PP stats */}
                        <div className="flex items-center gap-4 text-[11px] font-mono-tech text-theme-secondary py-1 border-t border-theme/40 mb-1">
                          <span>
                            Power: <strong className="text-theme-primary">{details?.power ?? "—"}</strong>
                          </span>
                          <span>
                            Accuracy: <strong className="text-theme-primary">{details?.accuracy ?? "—"}</strong>
                          </span>
                          <span>
                            PP: <strong className="text-theme-primary">{details?.pp ?? "—"}</strong>
                          </span>
                        </div>

                        {/* Move description */}
                        <p className="text-xs font-display text-theme-secondary leading-relaxed">
                          {details?.effect || "Signature attack exclusively mastered by this species."}
                        </p>
                      </div>
                    );
                  })}

                  {/* Signature Abilities */}
                  {sigAbilities.map((aName) => {
                    const slug = aName.toLowerCase().replace(/[\s']/g, "-");
                    const desc = abilityDetails[slug] || abilityCache[slug];

                    return (
                      <div
                        key={aName}
                        className="p-3 rounded-xl bg-theme-surface/90 border border-theme hover:border-purple-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono-tech font-bold text-purple-400">
                              ✦ SIGNATURE ABILITY:
                            </span>
                            <span className="font-display font-bold text-theme-primary text-sm">
                              {aName}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono-tech font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Unique Trait
                          </span>
                        </div>

                        <p className="text-xs font-display text-theme-secondary leading-relaxed pt-1 border-t border-theme/40">
                          {desc || "Signature ability innate to this species."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Abilities Accordion */}
          <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-display font-bold text-theme-secondary uppercase tracking-wider mb-3">
              ABILITIES
            </h3>
            <div className="flex flex-col gap-2">
              {pokemon.abilities.map((a) => {
                const abName = a.ability.name;
                const isExpanded = expandedAbility === abName;
                const desc = abilityDetails[abName] || abilityCache[abName];

                return (
                  <div
                    key={abName}
                    className="bg-theme-surface hover:bg-theme-surface-hover border border-theme rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleAbilityClick(abName, a.ability.url)}
                      className="w-full px-4 py-3 flex justify-between items-center text-left text-theme-primary transition-colors duration-200 focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-semibold text-theme-primary capitalize text-sm">
                          {abName.replace("-", " ")}
                        </span>
                        {a.is_hidden && (
                          <span className="px-2.5 py-0.5 rounded-md text-[8px] font-display font-bold bg-theme-gold-bg text-theme-gold border border-theme-gold shadow-sm">
                            HIDDEN ABILITY
                          </span>
                        )}
                        {isPokemonSignatureAbility(abName, pokemon.name) && (
                          <span className="px-2.5 py-0.5 rounded-md text-[8px] font-display font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-sm">
                            SIGNATURE ABILITY
                          </span>
                        )}
                      </div>

                      <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 text-theme-secondary"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          damping: 20,
                        }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    </button>

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 22,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3.5 text-xs font-display text-theme-secondary leading-relaxed border-t border-theme pt-2.5">
                        {loadingAbilityName === abName ? (
                          <span className="italic animate-pulse text-theme-accent">
                            Loading ability details...
                          </span>
                        ) : (
                          desc || "No description available."
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Lower Deck: Evolution Chain & Move Learnset */}
      <div className="flex flex-col gap-6 sm:gap-8 w-full border-t border-theme pt-6 sm:pt-8">
        {/* Evolution Chain Section */}
        <div className="bg-theme-bg border border-theme rounded-2xl p-3 sm:p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-display font-bold text-theme-secondary flex items-center gap-2 uppercase tracking-wider">
              <span>Evolution Chain</span>
            </h3>
            {loadingEvolution && (
              <span className="text-[10px] font-display text-theme-accent animate-pulse">
                Loading evolution chain...
              </span>
            )}
          </div>

          {/* Lore & Evolution Notice for White-Striped Basculin -> Basculegion */}
          {isBasculinEvolution && (
            <div className="flex items-start sm:items-center gap-2.5 px-3.5 py-2.5 mb-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-sans shadow-xs">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 sm:mt-0 ring-4 ring-cyan-400/20 flex-shrink-0 animate-pulse" />
              <div className="leading-relaxed">
                <span className="font-bold text-cyan-300 mr-1.5 font-mono-tech tracking-wide uppercase text-[10.5px]">
                  Evolutionary Requirement:
                </span>
                <span className="text-slate-200 text-xs">
                  Only <strong>White-Striped Basculin (Hisuian Form)</strong> evolves into <strong>Basculegion</strong> (by taking 294+ recoil damage in battle without fainting). Red-Striped and Blue-Striped Basculin do not evolve.
                </span>
              </div>
            </div>
          )}

          <div className="w-full py-2 sm:py-4 flex items-center justify-center">
            {loadingEvolution ? (
              <div className="p-4 text-xs font-sans text-theme-secondary italic text-center animate-pulse">
                Loading evolution chain...
              </div>
            ) : (
              <div className="w-full">
                {/* Desktop layout: Horizontal Tree View with overflow scroll */}
                <div className="hidden md:flex items-center justify-center min-w-max mx-auto py-2 px-2 sm:px-4 overflow-x-auto">
                  <EvolutionBranch
                    node={
                      evolutionTree || {
                        id: pokemon.id,
                        name: pokemon.name,
                        evolvesTo: [],
                      }
                    }
                    currentPokemonId={pokemon.id}
                    currentPokemonName={pokemon.name}
                    onSelectPokemon={onSelectPokemon}
                  />
                </div>

                {/* Mobile layout: Vertical Pipeline View (avoids horizontal scrolling) */}
                <div className="flex md:hidden flex-col items-center justify-center w-full py-2 px-1">
                  <MobileEvolutionTree
                    node={
                      evolutionTree || {
                        id: pokemon.id,
                        name: pokemon.name,
                        evolvesTo: [],
                      }
                    }
                    currentPokemonId={pokemon.id}
                    currentPokemonName={pokemon.name}
                    onSelectPokemon={onSelectPokemon}
                  />
                </div>

                {/* Single stage indicator if Pokémon has no evolutions */}
                {evolutionTree &&
                  (!evolutionTree.evolvesTo || evolutionTree.evolvesTo.length === 0) &&
                  !evolutionTree.trigger && (
                    <p className="text-xs font-sans text-theme-secondary italic text-center mt-2 select-none">
                      This Pokémon does not evolve.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Move Learnset Section */}
        <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col gap-3.5 mb-4">
            {/* Header + Search and Move Type Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-display font-bold text-theme-secondary flex items-center gap-2 uppercase tracking-wider">
                  <span>Move Learnset</span>
                  {loadingBaseMoves && (
                    <span className="text-[10px] text-theme-accent animate-pulse font-normal">
                      (Loading battle moves...)
                    </span>
                  )}
                </h3>
                {isInheritedMoves && (
                  <p className="text-[10px] font-display text-theme-accent mt-0.5">
                    Moves inherited from base species ({formatPokemonName(baseSpeciesName)})
                  </p>
                )}
              </div>

              {/* Top toolbar: Search + Type Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {/* Search moves input */}
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Search all moves..."
                    value={moveSearchQuery}
                    onChange={(e) => setMoveSearchQuery(e.target.value)}
                    className="w-full sm:w-44 px-3 py-1.5 bg-theme-surface border border-theme text-theme-primary text-xs font-display rounded-lg focus:outline-none focus:ring-1 focus:ring-theme-accent shadow-xs"
                  />
                  {moveSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMoveSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary text-xs cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Move Type Filter Dropdown */}
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    value={selectedMoveType}
                    onChange={(e) => setSelectedMoveType(e.target.value)}
                    className={`w-full appearance-none pl-3 pr-8 py-1.5 bg-theme-surface border text-xs font-display font-semibold rounded-lg focus:outline-none focus:ring-1 focus:ring-theme-accent cursor-pointer transition-all shadow-xs ${
                      selectedMoveType !== "all"
                        ? "border-theme-accent text-theme-accent"
                        : "border-theme text-theme-secondary hover:text-theme-primary"
                    }`}
                  >
                    <option value="all">
                      All Types ({moveFilterCounts.typeCounts.all})
                    </option>
                    {TYPE_NAMES.map((typeName) => {
                      const count = moveFilterCounts.typeCounts[typeName] || 0;
                      return (
                        <option
                          key={typeName}
                          value={typeName}
                          className="bg-theme-bg text-theme-primary"
                        >
                          {typeName.toUpperCase()} {count > 0 ? `(${count})` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary text-[10px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-bar: Category Pills (Physical, Special, Status) & Active Filters Reset */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-theme/50">
              <div className="flex items-center gap-1 bg-theme-surface/70 p-1 rounded-xl border border-theme overflow-x-auto max-w-full scrollbar-none">
                <span className="text-[10px] font-sans font-bold text-theme-secondary uppercase tracking-wider px-1.5 hidden sm:inline">
                  Category:
                </span>
                {[
                  { key: "all", label: "All", count: moveFilterCounts.categoryCounts.all },
                  {
                    key: "physical",
                    label: "Physical",
                    count: moveFilterCounts.categoryCounts.physical,
                    activeColor: "bg-amber-500 text-slate-950 font-bold shadow-xs",
                  },
                  {
                    key: "special",
                    label: "Special",
                    count: moveFilterCounts.categoryCounts.special,
                    activeColor: "bg-sky-500 text-slate-950 font-bold shadow-xs",
                  },
                  {
                    key: "status",
                    label: "Status",
                    count: moveFilterCounts.categoryCounts.status,
                    activeColor: "bg-slate-600 text-white font-bold shadow-xs",
                  },
                ].map((cat) => {
                  const isActive = selectedMoveCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedMoveCategory(cat.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? cat.activeColor || "bg-theme-accent text-white shadow-xs"
                          : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[10px] font-mono-tech opacity-80">
                        ({cat.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Filter feedback / reset */}
              {(selectedMoveType !== "all" || selectedMoveCategory !== "all" || moveSearchQuery.trim()) && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-sans text-theme-secondary font-medium">
                    Showing <strong className="text-theme-primary font-mono-tech">{currentMoveList.length}</strong> matching {moveSearchQuery.trim() ? "across all learnsets" : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMoveType("all");
                      setSelectedMoveCategory("all");
                      setMoveSearchQuery("");
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-sans font-bold text-theme-accent hover:bg-theme-accent/10 transition-colors cursor-pointer"
                  >
                    Reset Filters ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Learn Method Sub-Tabs */}
          <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 mb-3 border-b border-theme pb-3 overflow-x-auto scrollbar-none">
            {[
              { key: "level-up", label: "Level-Up Moves", count: categorizedMoves["level-up"].length },
              { key: "machine", label: "TM / Machine", count: categorizedMoves.machine.length },
              { key: "egg", label: "Egg Moves", count: categorizedMoves.egg.length },
              { key: "tutor", label: "Tutor Moves", count: categorizedMoves.tutor.length },
              { key: "all", label: "All Moves", count: categorizedMoves.all?.length || 0 },
            ].map((tab) => {
              const isActive = (!moveSearchQuery.trim() && activeMoveTab === tab.key) || (moveSearchQuery.trim() && tab.key === "all");
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveMoveTab(tab.key);
                    setExpandedMove(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-theme-accent text-white shadow-xs"
                      : "bg-theme-surface hover:bg-theme-surface-hover border border-theme text-theme-secondary hover:text-theme-primary"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono-tech opacity-80">
                    ({loadingBaseMoves ? "..." : tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Structured High-Readability Moves Data Table */}
          {currentMoveList.length > 0 ? (
            <div className="border border-theme rounded-xl overflow-hidden bg-theme-surface/35 shadow-xs">
              {/* Table Column Header: Mobile (< sm) */}
              <div className="flex sm:hidden items-center justify-between px-2.5 py-1.5 bg-theme-surface border-b border-theme text-[9px] font-mono-tech uppercase tracking-wider text-theme-secondary font-bold select-none">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-left">Level</span>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-2 pr-4">
                  <span>Type</span>
                </div>
              </div>

              {/* Table Column Header: Desktop (sm:) */}
              <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-theme-surface border-b border-theme text-[10px] font-mono-tech uppercase tracking-wider text-theme-secondary font-bold select-none items-center">
                <div className="col-span-2 md:col-span-1">Level</div>
                <div className="col-span-4 md:col-span-5">Move</div>
                <div className="col-span-3 md:col-span-3 text-left">Category</div>
                <div className="col-span-3 md:col-span-3 text-left">Type</div>
              </div>

              {/* Scrollable Move Rows */}
              <div className="max-h-96 overflow-y-auto divide-y divide-theme/30">
                {currentMoveList.map((m) => {
                  const isExpanded = expandedMove === m.name;
                  const details = moveDetails[m.name] || moveDetailsCache[m.name];
                  const meta = details || KNOWN_MOVE_META[m.name];
                  const isSearching = Boolean(moveSearchQuery.trim());

                  return (
                    <div
                      key={m.name}
                      className={`transition-colors duration-150 ${
                        isExpanded
                          ? "bg-theme-surface/90 border-l-2 border-l-theme-accent"
                          : "hover:bg-theme-surface/65"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleMoveClick(m.name, m.url)}
                        className="w-full px-2.5 sm:px-4 py-2 text-left transition-colors cursor-pointer group"
                      >
                        {/* Mobile Row (< sm): Flex with guaranteed fixed-width slots (no overlapping) */}
                        <div className="flex sm:hidden items-center gap-2 w-full">
                          {/* Col 1: Level / Method Badge */}
                          <div className="w-10 flex-shrink-0 flex items-center justify-start">
                            <span className="w-full py-0.5 px-0.5 rounded text-[9px] font-mono-tech font-bold bg-theme-input/80 border border-theme/60 text-theme-secondary text-center truncate">
                              {isSearching || activeMoveTab === "all"
                                ? (m.level ? `Lv.${m.level}` : (m.method?.slice(0, 4).toUpperCase() || "MOVE"))
                                : activeMoveTab === "level-up"
                                ? (m.level !== undefined ? `Lv.${m.level}` : "—")
                                : activeMoveTab === "machine"
                                ? "TM"
                                : activeMoveTab === "egg"
                                ? "Egg"
                                : "Tutor"}
                            </span>
                          </div>

                          {/* Col 2: Move Name & Category Subtitle - flex-1 min-w-0 */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-xs font-sans font-bold capitalize text-theme-primary group-hover:text-theme-accent transition-colors truncate block">
                                {m.name.replace(/-/g, " ")}
                              </span>
                              {isPokemonSignatureMove(m.name, pokemon.name) && (
                                <span className="px-1 py-0.2 rounded text-[7.5px] font-mono-tech font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40 flex-shrink-0">
                                  Sig
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 min-w-0">
                              {meta?.damageClass && (
                                <span
                                  className={`px-1 py-0.2 rounded text-[8px] font-mono-tech font-bold uppercase tracking-tight border flex-shrink-0 ${
                                    meta.damageClass === "physical"
                                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                      : meta.damageClass === "special"
                                      ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                                      : "bg-slate-500/15 text-slate-300 border-slate-500/30"
                                  }`}
                                >
                                  {meta.damageClass}
                                </span>
                              )}
                              {m.fromPreEvo && !isSearching && activeMoveTab !== "all" && (
                                <span className="text-[8px] font-mono-tech text-theme-secondary/80 truncate">
                                  via {formatPokemonName(m.fromPreEvo)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Col 3: Type Badge - flex-shrink-0 */}
                          <div className="flex-shrink-0">
                            {meta?.type ? (
                              <TypeBadge type={meta.type} size="xs" />
                            ) : (
                              <span className="text-[10px] font-mono-tech text-theme-secondary/60">
                                —
                              </span>
                            )}
                          </div>

                          {/* Col 4: Chevron indicator - flex-shrink-0 */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-3.5 h-3.5 text-theme-secondary/70 transform transition-transform duration-200 flex-shrink-0 ${
                              isExpanded ? "rotate-180 text-theme-accent" : "rotate-0"
                            }`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>

                        {/* Desktop Row (sm:): Structured 12-column grid */}
                        <div className="hidden sm:grid grid-cols-12 gap-2 items-center w-full">
                          {/* Col 1: Level / Method */}
                          <div className="col-span-2 md:col-span-1 flex items-center">
                            {isSearching || activeMoveTab === "all" ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-theme-input/80 border border-theme/60 text-theme-secondary text-center truncate">
                                {m.level ? `Lv. ${m.level}` : (m.method?.toUpperCase() || "MOVE")}
                              </span>
                            ) : activeMoveTab === "level-up" ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-theme-input/80 border border-theme/60 text-theme-secondary text-center min-w-[42px]">
                                {m.level !== undefined ? `Lv. ${m.level}` : "—"}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-semibold bg-theme-input/60 border border-theme/40 text-theme-secondary text-center">
                                {activeMoveTab === "machine" ? "TM" : activeMoveTab === "egg" ? "Egg" : "Tutor"}
                              </span>
                            )}
                          </div>

                          {/* Col 2: Move Name & Pre-Evo inheritance note */}
                          <div className="col-span-4 md:col-span-5 flex items-center gap-1.5 min-w-0 pr-2">
                            <span className="text-xs sm:text-sm font-sans font-semibold capitalize text-theme-primary group-hover:text-theme-accent transition-colors truncate">
                              {m.name.replace(/-/g, " ")}
                            </span>
                            {isPokemonSignatureMove(m.name, pokemon.name) && (
                              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono-tech font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40 flex-shrink-0">
                                Signature
                              </span>
                            )}
                            {m.fromPreEvo && !isSearching && activeMoveTab !== "all" && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-tech text-theme-secondary/80 bg-theme-input/60 border border-theme/40 hidden md:inline flex-shrink-0">
                                via {formatPokemonName(m.fromPreEvo)}
                              </span>
                            )}
                          </div>

                          {/* Col 3: Category Badge */}
                          <div className="col-span-3 md:col-span-3 flex items-center justify-start">
                            {meta?.damageClass ? (
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase border tracking-tight ${
                                  meta.damageClass === "physical"
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                    : meta.damageClass === "special"
                                    ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                                    : "bg-slate-500/15 text-slate-300 border-slate-500/30"
                                }`}
                              >
                                {meta.damageClass}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono-tech text-theme-secondary/60">
                                —
                              </span>
                            )}
                          </div>

                          {/* Col 4: Type Badge + Chevron */}
                          <div className="col-span-3 md:col-span-3 flex items-center justify-between gap-1.5">
                            {meta?.type ? (
                              <TypeBadge type={meta.type} size="sm" />
                            ) : (
                              <span className="text-[10px] font-mono-tech text-theme-secondary/60">
                                —
                              </span>
                            )}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className={`w-4 h-4 text-theme-secondary/70 transform transition-transform duration-200 flex-shrink-0 ${
                                isExpanded ? "rotate-180 text-theme-accent" : "rotate-0"
                              }`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Move Expanded Details Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-theme/40 px-3.5 sm:px-5 py-3 bg-theme-bg/80"
                          >
                            {loadingMoveName === m.name ? (
                              <span className="text-[11px] font-sans text-theme-accent italic animate-pulse">
                                Accessing move specs...
                              </span>
                            ) : details ? (
                              <div className="flex flex-col gap-2.5 text-xs font-sans">
                                <div className="flex flex-wrap gap-2 sm:gap-3 text-[11px]">
                                  <div className="px-2 py-1 rounded bg-theme-surface border border-theme flex items-center gap-1.5 font-mono-tech shadow-2xs">
                                    <span className="text-theme-secondary">PWR:</span>
                                    <span className="font-bold text-theme-primary">
                                      {details.power}
                                    </span>
                                  </div>
                                  <div className="px-2 py-1 rounded bg-theme-surface border border-theme flex items-center gap-1.5 font-mono-tech shadow-2xs">
                                    <span className="text-theme-secondary">ACC:</span>
                                    <span className="font-bold text-theme-primary">
                                      {details.accuracy}
                                    </span>
                                  </div>
                                  <div className="px-2 py-1 rounded bg-theme-surface border border-theme flex items-center gap-1.5 font-mono-tech shadow-2xs">
                                    <span className="text-theme-secondary">PP:</span>
                                    <span className="font-bold text-theme-primary">
                                      {details.pp}
                                    </span>
                                  </div>
                                  <div className="px-2 py-1 rounded bg-theme-surface border border-theme flex items-center gap-1.5 font-mono-tech shadow-2xs">
                                    <span className="text-theme-secondary">CLASS:</span>
                                    <span className="font-bold text-theme-primary capitalize">
                                      {details.damageClass}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-theme-secondary leading-relaxed pt-1">
                                  {details.effect}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] font-sans text-theme-secondary">
                                No additional move specs recorded.
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
              <div className="py-8 px-4 text-center text-xs font-display text-theme-secondary bg-theme-surface/50 border border-theme/60 rounded-xl flex flex-col items-center justify-center gap-2">
                {loadingBaseMoves ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-theme-accent animate-pulse">
                      Retrieving battle learnset archives...
                    </span>
                  </div>
                ) : selectedMoveType !== "all" || selectedMoveCategory !== "all" || moveSearchQuery.trim() ? (
                  <>
                    <p className="font-semibold text-theme-primary">
                      No moves matching the selected filters.
                    </p>
                    <p className="text-[11px] text-theme-secondary">
                      Try selecting another category or clearing active filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMoveType("all");
                        setSelectedMoveCategory("all");
                        setMoveSearchQuery("");
                      }}
                      className="mt-1 px-3 py-1 bg-theme-accent text-white font-bold text-xs rounded-lg shadow-xs hover:bg-theme-accent/90 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </>
                ) : activeMoveTab === "egg" ? (
                  `No direct egg moves recorded for this form (in the Pokémon games, egg moves are inherited from the unevolved baby stage).`
                ) : (
                  "No moves recorded under this category."
                )}
              </div>
            )}
          </div>

        {/* Wild Encounters & Game Locations Section */}
        <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs font-display font-bold text-theme-secondary flex items-center gap-2 uppercase tracking-wider">
                <span>Wild Encounters & Game Locations</span>
                {loadingEncounters && (
                  <span className="text-[10px] text-theme-accent animate-pulse font-normal">
                    (Searching route tables...)
                  </span>
                )}
              </h3>
              <p className="text-[10px] font-display text-theme-secondary mt-0.5">
                Authentic routes, encounter methods, and wild catch rates from mainline games
              </p>
            </div>

            {/* Version Filter Dropdown */}
            {processedEncounters.versions.length > 0 && (
              <div className="relative">
                <select
                  value={selectedEncounterVersion}
                  onChange={(e) => setSelectedEncounterVersion(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 bg-theme-surface border border-theme text-xs font-display font-semibold text-theme-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-theme-accent cursor-pointer capitalize shadow-xs"
                >
                  <option value="all">All Game Versions ({processedEncounters.versions.length})</option>
                  {processedEncounters.versions.map((v) => (
                    <option key={v} value={v} className="bg-theme-bg text-theme-primary capitalize">
                      {v.replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary text-[10px]">
                  ▼
                </div>
              </div>
            )}
          </div>

          {/* Encounters Content */}
          {loadingEncounters ? (
            <div className="py-8 px-4 text-center text-xs font-display text-theme-secondary flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-theme-accent animate-pulse">
                Accessing regional encounter databases...
              </span>
            </div>
          ) : processedEncounters.versions.length > 0 ? (
            <div className="max-h-72 overflow-y-auto flex flex-col gap-2.5 pr-1">
              {(selectedEncounterVersion === "all"
                ? processedEncounters.versions
                : [selectedEncounterVersion]
              ).map((ver) => {
                const list = processedEncounters.byVersion[ver] || [];
                return (
                  <div key={ver} className="bg-theme-surface border border-theme rounded-xl p-3">
                    <span className="text-[11px] font-display font-bold text-theme-accent uppercase tracking-wide block mb-2 capitalize">
                      {ver.replace(/-/g, " ")}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {list.map((enc, idx) => (
                        <div
                          key={idx}
                          className="bg-theme-bg/60 border border-theme/60 rounded-lg p-2 flex flex-col justify-between text-xs font-display"
                        >
                          <span className="font-bold text-theme-primary truncate" title={enc.location}>
                            {enc.location}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-theme-secondary mt-1">
                            <span className="capitalize">{enc.method}</span>
                            <span className="font-mono-tech text-emerald-400 font-bold">{enc.chance}%</span>
                          </div>
                          <span className="text-[9px] font-mono-tech text-theme-secondary/80 mt-0.5">
                            Lv. {enc.minLevel}{enc.maxLevel !== enc.minLevel ? ` - ${enc.maxLevel}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 px-4 text-center text-xs font-display text-theme-secondary bg-theme-surface/50 border border-theme/60 rounded-xl flex flex-col items-center justify-center gap-1.5">
              <svg className="w-5 h-5 text-theme-secondary mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="font-semibold text-theme-primary">
                No standard wild table encounters recorded.
              </p>
              <p className="text-[11px] text-theme-secondary max-w-md leading-relaxed">
                In the mainline games, this Pokémon is typically obtained as a Starter, Static Legendary encounter, In-Game Gift, Fossil resurrection, or by Evolution.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PokemonCard;
