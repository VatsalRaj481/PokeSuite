import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";
import { ICONIC_POKEMON_POOL } from "../../utils/calcData.js";
import { formatPokemonName } from "../../utils/loreData.js";

// Curated instant-load mystery entries for immediate offline play and rapid testing
const CURATED_DEX_ENTRIES = [
  {
    id: 648,
    name: "meloetta",
    displayName: "Meloetta",
    version: "White 2",
    text: "The melodies sung by Meloetta have the power to make Pokémon that hear them happy or sad.",
  },
  {
    id: 1,
    name: "bulbasaur",
    displayName: "Bulbasaur",
    version: "FireRed",
    text: "There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.",
  },
  {
    id: 4,
    name: "charmander",
    displayName: "Charmander",
    version: "Red / Blue",
    text: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
  },
  {
    id: 7,
    name: "squirtle",
    displayName: "Squirtle",
    version: "Yellow",
    text: "Shoots water at prey while in the water. Withdraws into its shell when in danger.",
  },
  {
    id: 25,
    name: "pikachu",
    displayName: "Pikachu",
    version: "Emerald",
    text: "It stores electricity in the electric sacs on its cheeks. When it releases pent-up energy in a burst, the electric power is equal to a lightning bolt.",
  },
  {
    id: 94,
    name: "gengar",
    displayName: "Gengar",
    version: "SoulSilver",
    text: "To steal the life of its target, it slips into the prey's shadow and silently waits for an opportunity.",
  },
  {
    id: 130,
    name: "gyarados",
    displayName: "Gyarados",
    version: "Platinum",
    text: "Once it appears, it goes on a rampage. It remains enraged until it demolishes everything around it.",
  },
  {
    id: 131,
    name: "lapras",
    displayName: "Lapras",
    version: "Crystal",
    text: "This gentle Pokémon loves to ferry people across bodies of water. It has an exceptional ability to understand human speech.",
  },
  {
    id: 133,
    name: "eevee",
    displayName: "Eevee",
    version: "Sword",
    text: "It has the ability to alter the composition of its body to suit its surrounding environment.",
  },
  {
    id: 143,
    name: "snorlax",
    displayName: "Snorlax",
    version: "HeartGold",
    text: "Its stomach's digestive juices can dissolve any kind of poison. Eating bad food doesn't affect it at all.",
  },
  {
    id: 149,
    name: "dragonite",
    displayName: "Dragonite",
    version: "Black 2",
    text: "It is said to make its home somewhere in the sea. It guides crews of shipwrecked ships to shore safely.",
  },
  {
    id: 150,
    name: "mewtwo",
    displayName: "Mewtwo",
    version: "FireRed",
    text: "A Pokémon that was created by genetic manipulation. However, even though the scientific power of humans made its body, they failed to endow it with a compassionate heart.",
  },
  {
    id: 248,
    name: "tyranitar",
    displayName: "Tyranitar",
    version: "Ruby",
    text: "It is so staggeringly strong, it can bring down a whole mountain to make its nest. This Pokémon wanders about in mountains to find new opponents.",
  },
  {
    id: 282,
    name: "gardevoir",
    displayName: "Gardevoir",
    version: "Sapphire",
    text: "It has the psychokinetic power to distort the dimensions and create a small black hole. This Pokémon will try to protect its Trainer even at the risk of its own life.",
  },
  {
    id: 384,
    name: "rayquaza",
    displayName: "Rayquaza",
    version: "Emerald",
    text: "A Pokémon that flies endlessly through the ozone layer. It is said that would descend to the ground only if Kyogre and Groudon were to fight.",
  },
  {
    id: 448,
    name: "lucario",
    displayName: "Lucario",
    version: "Diamond",
    text: "It has the ability to sense the auras of all things. It understands human speech.",
  },
  {
    id: 445,
    name: "garchomp",
    displayName: "Garchomp",
    version: "Platinum",
    text: "When it folds up its body and extends its wings, it looks like a jet plane. It flies at sonic speed.",
  },
  {
    id: 658,
    name: "greninja",
    displayName: "Greninja",
    version: "X",
    text: "It creates throwing stars out of compressed water. When it spins them and throws them at high speed, these stars can split metal in two.",
  },
  {
    id: 700,
    name: "sylveon",
    displayName: "Sylveon",
    version: "Y",
    text: "It sends a soothing aura from its ribbonlike feelers to calm fights. It wraps its feelers around its beloved Trainer's arm.",
  },
  {
    id: 778,
    name: "mimikyu",
    displayName: "Mimikyu",
    version: "Sun",
    text: "Its actual appearance is unknown. A scholar who saw what was under its rag was overwhelmed by terror and died from the shock.",
  },
  {
    id: 1007,
    name: "koraidon",
    displayName: "Koraidon",
    version: "Scarlet",
    text: "This Pokémon was named the Winged King by an ancient text. It is said to have split the land with its bare fists.",
  },
  {
    id: 1008,
    name: "miraidon",
    displayName: "Miraidon",
    version: "Violet",
    text: "Much remains unknown about this creature. It was named Iron Serpent in a mysterious expedition journal.",
  },
];

export default function DexDetectiveGame({ pokemonList = [], onSelectPokemon }) {
  const [currentCase, setCurrentCase] = useState(null);
  const [rawEntry, setRawEntry] = useState("");
  const [redactedEntry, setRedactedEntry] = useState("");
  const [gameVersion, setGameVersion] = useState("Unknown Archive");
  const [isLoadingCase, setIsLoadingCase] = useState(false);

  // Clues & Attempts
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [revealedClues, setRevealedClues] = useState({
    gen: false,
    types: false,
    silhouette: false,
  });

  // User Guess Input & Autocomplete
  const [guessInput, setGuessInput] = useState("");
  const [guessHistory, setGuessHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  // Streaks & High Scores
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("pokedex_dex_detective_best") || "0", 10);
    } catch (e) {
      return 0;
    }
  });

  const candidatePool = useMemo(() => {
    return pokemonList && pokemonList.length > 0 ? pokemonList : ICONIC_POKEMON_POOL;
  }, [pokemonList]);

  // Autocomplete suggestions based on input
  const suggestions = useMemo(() => {
    const q = guessInput.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return candidatePool
      .filter((p) => {
        const pName = p.name ? p.name.toLowerCase() : "";
        const pDisplay = p.displayName ? p.displayName.toLowerCase() : "";
        return pName.includes(q) || pDisplay.includes(q);
      })
      .slice(0, 6);
  }, [guessInput, candidatePool]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Thorough redaction helper:
   * Strips all instances of the target Pokémon's name, display name, species name,
   * base name (before hyphen), and constituent name tokens (>= 3 chars).
   * Handles possessives ("Meloetta's" -> "[POKÉMON]’s") and standard word boundaries.
   */
  const redactFlavorText = (text, target, extraSpeciesName = "") => {
    if (!text || !target) return "";
    let cleaned = text
      .replace(/[\f\n\r\t\v]/g, " ")
      .replace(/\u00ad/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const nameTokens = new Set();

    const addToken = (str) => {
      if (!str) return;
      const s = str.trim().toLowerCase();
      if (!s) return;
      nameTokens.add(s);
      // Split tokens on hyphens and spaces (e.g. "meloetta-aria" -> "meloetta", "aria")
      s.split(/[\s-]+/).forEach((part) => {
        if (part && part.length >= 3) {
          nameTokens.add(part);
        }
      });
    };

    addToken(target.name);
    addToken(target.displayName);
    addToken(target.speciesName);
    if (target.species?.name) addToken(target.species.name);
    addToken(extraSpeciesName);

    // Filter out common English stop words or very generic words just in case
    const ignoreList = new Set(["the", "and", "for", "with", "this", "that", "from", "into"]);

    // Sort tokens by descending length so longer composite phrases match first
    const sortedTokens = Array.from(nameTokens)
      .filter((tok) => tok.length >= 3 && !ignoreList.has(tok))
      .sort((a, b) => b.length - a.length);

    sortedTokens.forEach((token) => {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Match possessive with apostrophe ('s or ’s)
      const possessiveRegex = new RegExp(`\\b${escaped}['’]s\\b`, "gi");
      cleaned = cleaned.replace(possessiveRegex, "[POKÉMON]’s");

      // Match standalone word
      const wordRegex = new RegExp(`\\b${escaped}\\b`, "gi");
      cleaned = cleaned.replace(wordRegex, "[POKÉMON]");
    });

    // Collapse multiple consecutive [POKÉMON] tags into one
    cleaned = cleaned.replace(/\[POKÉMON\](?:\s*\[POKÉMON\])+/g, "[POKÉMON]");

    return cleaned;
  };

  /**
   * Unsealed text renderer:
   * When the case is solved or failed, highlights where the Pokémon's name appeared
   * in the original text in an emerald/accent badge.
   */
  const renderUnsealedText = (text, target) => {
    if (!text || !target) return text;
    const cleaned = text
      .replace(/[\f\n\r\t\v]/g, " ")
      .replace(/\u00ad/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const nameTokens = new Set();
    const addToken = (str) => {
      if (!str) return;
      const s = str.trim().toLowerCase();
      if (!s) return;
      nameTokens.add(s);
      s.split(/[\s-]+/).forEach((part) => {
        if (part && part.length >= 3) nameTokens.add(part);
      });
    };

    addToken(target.name);
    addToken(target.displayName);
    addToken(target.speciesName);
    if (target.species?.name) addToken(target.species.name);

    const sortedTokens = Array.from(nameTokens)
      .filter((tok) => tok.length >= 3)
      .sort((a, b) => b.length - a.length);

    if (sortedTokens.length === 0) return cleaned;

    const pattern = sortedTokens
      .map((tok) => tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const regex = new RegExp(`(\\b(?:${pattern})(?:['’]s)?\\b)`, "gi");

    const parts = cleaned.split(regex);
    return parts.map((part, idx) => {
      if (new RegExp(`^(?:${pattern})(?:['’]s)?$`, "i").test(part)) {
        return (
          <span
            key={idx}
            className="inline-block mx-0.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-tech font-bold not-italic shadow-xs"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Load a new mystery case
  const loadNextCase = useCallback(async () => {
    setIsLoadingCase(true);
    setIsSolved(false);
    setIsFailed(false);
    setAttemptsLeft(3);
    setGuessInput("");
    setGuessHistory([]);
    setFeedback(null);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setRevealedClues({ gen: false, types: false, silhouette: false });

    // Decide whether to use curated or fetch live
    const useCurated = Math.random() < 0.4 || candidatePool.length === 0;

    if (useCurated) {
      const sample = CURATED_DEX_ENTRIES[Math.floor(Math.random() * CURATED_DEX_ENTRIES.length)];
      const targetObj = candidatePool.find((p) => p.id === sample.id) || {
        id: sample.id,
        name: sample.name,
        displayName: sample.displayName || formatPokemonName(sample.name),
        types: ["normal"],
      };

      const resolvedCase = {
        ...targetObj,
        speciesName: sample.name,
      };

      setCurrentCase(resolvedCase);
      setRawEntry(sample.text);
      setRedactedEntry(redactFlavorText(sample.text, resolvedCase, sample.name));
      setGameVersion(`Pokémon ${sample.version}`);
      setIsLoadingCase(false);
      return;
    }

    // Pick a random Pokémon from pool
    const randomPokemon = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    const targetId = randomPokemon.id;

    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${targetId}/`);
      const species = res.data;
      const englishEntries = (species.flavor_text_entries || []).filter(
        (f) => f.language.name === "en"
      );

      if (englishEntries.length === 0) {
        throw new Error("No English entries found");
      }

      // Pick a random entry among available versions
      const pickedEntry = englishEntries[Math.floor(Math.random() * englishEntries.length)];
      const rawText = pickedEntry.flavor_text;
      const versionName = pickedEntry.version?.name
        ? formatPokemonName(pickedEntry.version.name)
        : "Classic Version";

      const resolvedCase = {
        ...randomPokemon,
        speciesName: species.name,
      };

      setCurrentCase(resolvedCase);
      setRawEntry(rawText);
      setRedactedEntry(redactFlavorText(rawText, resolvedCase, species.name));
      setGameVersion(`Pokémon ${versionName}`);
    } catch (err) {
      // Fallback to curated entry on network failure or rate limit
      const fallback = CURATED_DEX_ENTRIES[Math.floor(Math.random() * CURATED_DEX_ENTRIES.length)];
      const targetObj = candidatePool.find((p) => p.id === fallback.id) || {
        id: fallback.id,
        name: fallback.name,
        displayName: fallback.displayName || formatPokemonName(fallback.name),
        types: ["normal"],
      };
      const resolvedCase = {
        ...targetObj,
        speciesName: fallback.name,
      };
      setCurrentCase(resolvedCase);
      setRawEntry(fallback.text);
      setRedactedEntry(redactFlavorText(fallback.text, resolvedCase, fallback.name));
      setGameVersion(`Pokémon ${fallback.version}`);
    } finally {
      setIsLoadingCase(false);
    }
  }, [candidatePool]);

  // Initial load
  useEffect(() => {
    loadNextCase();
  }, [loadNextCase]);

  // Handle a guess submission
  const submitGuess = (pokemonGuess) => {
    if (isSolved || isFailed || !currentCase) return;

    const guessName = typeof pokemonGuess === "string" ? pokemonGuess.trim().toLowerCase() : pokemonGuess?.name?.toLowerCase();
    if (!guessName) return;

    const targetName = currentCase.name.toLowerCase();
    const targetBaseName = targetName.split("-")[0];
    const targetDisplayName = (currentCase.displayName || "").toLowerCase();
    const targetSpeciesName = (currentCase.speciesName || "").toLowerCase();

    // Check match against exact name, base name (before hyphen), display name, species name, or numeric ID
    const isMatch =
      guessName === targetName ||
      guessName === targetBaseName ||
      guessName === targetDisplayName ||
      guessName === targetSpeciesName ||
      (typeof pokemonGuess === "object" && pokemonGuess?.id === currentCase.id);

    setGuessInput("");
    setShowDropdown(false);
    setSelectedIndex(-1);

    if (isMatch) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        try {
          localStorage.setItem("pokedex_dex_detective_best", String(nextStreak));
        } catch (e) {}
      }

      setIsSolved(true);
      setFeedback({
        type: "success",
        text: `Correct Guess! It was indeed ${formatPokemonName(currentCase.displayName || currentCase.name)}!`,
      });
      confetti({ particleCount: 85, spread: 80, origin: { y: 0.6 } });
    } else {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      const formattedGuess = formatPokemonName(guessName);
      setGuessHistory((prev) => [...prev, formattedGuess]);

      if (nextAttempts <= 0) {
        setIsFailed(true);
        setStreak(0);
        setFeedback({
          type: "error",
          text: `Out of Leads! The mystery Pokémon was ${formatPokemonName(currentCase.displayName || currentCase.name)}.`,
        });
      } else {
        setFeedback({
          type: "warning",
          text: `Incorrect lead: "${formattedGuess}". ${nextAttempts} ${nextAttempts === 1 ? "lead" : "leads"} remaining.`,
        });
      }
    }
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      submitGuess(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      submitGuess(suggestions[selectedIndex]);
    } else if (guessInput.trim()) {
      submitGuess(guessInput.trim());
    }
  };

  // Generation descriptor
  const generationText = useMemo(() => {
    if (!currentCase?.id) return "Unknown";
    const id = currentCase.id;
    if (id <= 151) return "Gen 1 (Kanto)";
    if (id <= 251) return "Gen 2 (Johto)";
    if (id <= 386) return "Gen 3 (Hoenn)";
    if (id <= 493) return "Gen 4 (Sinnoh)";
    if (id <= 649) return "Gen 5 (Unova)";
    if (id <= 721) return "Gen 6 (Kalos)";
    if (id <= 809) return "Gen 7 (Alola)";
    if (id <= 898) return "Gen 8 (Galar)";
    return "Gen 9 (Paldea)";
  }, [currentCase]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-2">
      {/* Header Deck: Controls & Streaks */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-theme-surface border border-theme rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <path d="M11 8a3 3 0 0 0-3 3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-display font-black text-theme-primary flex items-center gap-2">
              <span>Dex Detective</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono-tech font-bold uppercase">
                Lore Mystery
              </span>
            </h2>
            <p className="text-xs font-display text-theme-secondary">
              Deduce the mystery Pokémon from redacted in-game field entries.
            </p>
          </div>
        </div>

        {/* Streaks Counter */}
        <div className="flex items-center gap-2.5 font-mono-tech text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-theme-bg border border-theme text-theme-primary font-bold flex items-center gap-1.5">
            <span className="text-theme-secondary text-[11px] uppercase tracking-wider">Solved:</span>
            <span className="text-sm font-black text-amber-400">{streak}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-theme-bg border border-theme text-theme-secondary font-bold">
            Best: <span className="text-theme-primary font-black">{bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Case File Card - overflow is visible so autocomplete dropdown floats without clipping */}
      <div className="relative bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col gap-6">
        {/* Status Deck: Redacted origin during play, unsealed version once solved/failed */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/60 pb-4">
          <div className="flex items-center gap-2">
            {!isSolved && !isFailed ? (
              <>
                <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Classified Archive
                </span>
                <span className="text-xs font-display text-theme-secondary hidden sm:inline">
                  Origin Game Redacted
                </span>
              </>
            ) : (
              <>
                <span
                  className={`px-3 py-1 rounded-xl font-mono-tech text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isSolved
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                      : "bg-indigo-500/15 border border-indigo-500/30 text-indigo-400"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                  Archived in {gameVersion}
                </span>
                <span className="text-xs font-display text-theme-secondary hidden sm:inline">
                  Archival Record Unsealed
                </span>
              </>
            )}
          </div>

          {/* Remaining Leads (Attempts) */}
          <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-theme-secondary">
            <span className="uppercase text-[10px] tracking-wider">Leads:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((slot) => {
                const isActive = slot <= attemptsLeft;
                return (
                  <span
                    key={slot}
                    className={`inline-block w-3 h-3 rounded-full transition-all ${
                      isActive
                        ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] border border-amber-300"
                        : "bg-theme-bg border border-theme opacity-35"
                    }`}
                    title={`${attemptsLeft} lead${attemptsLeft === 1 ? "" : "s"} remaining`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Pokédex Entry Quote Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-theme-bg/80 border border-theme/80 shadow-inner flex flex-col justify-center min-h-[140px] relative">
          {isLoadingCase ? (
            <div className="flex items-center justify-center gap-2 text-theme-secondary text-sm font-display animate-pulse">
              <span>Opening archival case file...</span>
            </div>
          ) : (
            <blockquote className="text-base sm:text-lg md:text-xl font-display font-medium text-theme-primary leading-relaxed text-center italic">
              “
              {isSolved || isFailed
                ? renderUnsealedText(rawEntry, currentCase)
                : redactedEntry.split("[POKÉMON]").map((part, index, array) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <span className="inline-block mx-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono-tech text-xs sm:text-sm font-black not-italic shadow-xs">
                          [POKÉMON]
                        </span>
                      )}
                    </React.Fragment>
                  ))}
              ”
            </blockquote>
          )}
        </div>

        {/* Solved / Failed Unified Case Report Card */}
        <AnimatePresence>
          {(isSolved || isFailed) && currentCase && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`p-6 sm:p-7 rounded-2xl border flex flex-col md:flex-row items-center gap-6 ${
                isSolved
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}
            >
              {/* Left: Official Artwork with soft ambient glow */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full blur-2xl opacity-20 pointer-events-none ${
                    isSolved ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                <div className="w-36 h-36 sm:w-44 sm:h-44 relative flex items-center justify-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentCase.id}.png`}
                    alt={currentCase.name}
                    className="w-full h-full object-contain drop-shadow-xl"
                    onError={(e) => {
                      e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentCase.id}.png`;
                    }}
                  />
                </div>
              </div>

              {/* Right: Solved details and next action */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase tracking-wider border ${
                      isSolved
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {isSolved ? "Correct Guess (+1 Streak)" : "Out of Leads — Suspect Identified"}
                  </span>
                  <span className="font-mono-tech text-xs text-theme-secondary font-bold">
                    #{String(currentCase.id).padStart(4, "0")}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-display font-black text-theme-primary capitalize tracking-tight">
                  {formatPokemonName(currentCase.displayName || currentCase.name)}
                </h3>

                {/* Metadata Row: Typings, Region, Game Origin */}
                <div className="flex items-center flex-wrap gap-2 justify-center md:justify-start">
                  <div className="flex items-center gap-1.5">
                    {Array.isArray(currentCase.types) &&
                      currentCase.types.map((t) => {
                        const tName = typeof t === "string" ? t : t?.type?.name;
                        return <TypeBadge key={tName} type={tName} size="sm" />;
                      })}
                  </div>
                  <span className="text-theme-secondary/40 text-xs hidden sm:inline">•</span>
                  <span className="font-display text-xs text-theme-secondary font-medium">
                    {generationText}
                  </span>
                  <span className="text-theme-secondary/40 text-xs hidden sm:inline">•</span>
                  <span className="font-mono-tech text-xs text-indigo-400 font-bold">
                    {gameVersion}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={loadNextCase}
                    className="px-6 py-2.5 bg-theme-accent hover:bg-theme-accent/90 text-white font-display font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Next Case</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>

                  {onSelectPokemon && (
                    <button
                      type="button"
                      onClick={() => onSelectPokemon(currentCase)}
                      className="px-4 py-2.5 bg-theme-bg hover:bg-theme-surface border border-theme text-theme-primary font-display font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>View in National Dex</span>
                      <svg className="w-3.5 h-3.5 text-theme-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forensic Clues Section (Only visible during active gameplay) */}
        {!isSolved && !isFailed && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-theme-secondary tracking-wider">
                Forensic Clues:
              </span>
              <span className="text-[11px] font-display text-theme-secondary/70 hidden sm:inline">
                Unlock confidential field intel if you are stuck
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Clue 1: Region / Gen */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, gen: true }))}
                disabled={revealedClues.gen}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-bold border transition-all flex items-center justify-between cursor-pointer ${
                  revealedClues.gen
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                    : "bg-theme-bg hover:bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                  <span>{revealedClues.gen ? generationText : "Clue 1: Region / Gen"}</span>
                </span>
                {revealedClues.gen && <span className="text-[10px] uppercase font-mono-tech">Unlocked</span>}
              </button>

              {/* Clue 2: Typings */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, types: true }))}
                disabled={revealedClues.types}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-bold border transition-all flex items-center justify-between cursor-pointer ${
                  revealedClues.types
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-theme-bg hover:bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {revealedClues.types && currentCase?.types ? (
                    <span className="flex items-center gap-1">
                      {currentCase.types.map((t) => {
                        const tName = typeof t === "string" ? t : t?.type?.name;
                        return <TypeBadge key={tName} type={tName} size="xs" />;
                      })}
                    </span>
                  ) : (
                    <span>Clue 2: Typings</span>
                  )}
                </span>
                {revealedClues.types && <span className="text-[10px] uppercase font-mono-tech">Unlocked</span>}
              </button>

              {/* Clue 3: Silhouette */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, silhouette: true }))}
                disabled={revealedClues.silhouette}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-display font-bold border transition-all flex items-center justify-between cursor-pointer ${
                  revealedClues.silhouette
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-theme-bg hover:bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span>{revealedClues.silhouette ? "Silhouette Profile" : "Clue 3: Silhouette"}</span>
                </span>
                {revealedClues.silhouette && <span className="text-[10px] uppercase font-mono-tech">Unlocked</span>}
              </button>
            </div>

            {/* Silhouette reveal box */}
            {revealedClues.silhouette && currentCase && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-theme-bg/60 border border-theme/80"
              >
                <div className="w-24 h-24 relative flex items-center justify-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentCase.id}.png`}
                    alt="Mystery Silhouette"
                    className="w-full h-full object-contain brightness-0 contrast-200 opacity-60 filter"
                  />
                </div>
                <span className="text-[10px] font-mono-tech uppercase text-theme-secondary/80 mt-1">
                  Classified Silhouette
                </span>
              </motion.div>
            )}
          </div>
        )}

        {/* Guess Input & Floating Autocomplete Search */}
        {!isSolved && !isFailed && (
          <div className="relative flex flex-col gap-2 pt-1" ref={searchContainerRef}>
            {/* Inline Feedback Banner when a wrong guess is submitted */}
            {feedback && (
              <div
                className={`px-4 py-2.5 rounded-xl border text-center text-xs font-display font-bold shadow-xs ${
                  feedback.type === "warning"
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : feedback.type === "error"
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex items-center gap-2 relative">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-secondary">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => {
                    setGuessInput(e.target.value);
                    setShowDropdown(true);
                    setSelectedIndex(-1);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Identify this Pokémon (e.g. Meloetta, Lucario, Gengar)..."
                  className="w-full pl-10 pr-10 py-3 bg-theme-bg border border-theme rounded-2xl text-sm font-display text-theme-primary placeholder:text-theme-secondary/60 focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500/80 transition-all shadow-inner"
                />

                {guessInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setGuessInput("");
                      setShowDropdown(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-theme-secondary hover:text-theme-primary cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}

                {/* Floating Autocomplete Dropdown: z-50, shadow-2xl, smoothly overlays content */}
                {showDropdown && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-theme-surface border border-theme rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y divide-theme/40">
                    {suggestions.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          submitGuess(p);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-display font-bold transition-colors flex items-center justify-between cursor-pointer group ${
                          idx === selectedIndex
                            ? "bg-amber-500/20 text-amber-300"
                            : "text-theme-primary hover:bg-theme-surface-hover"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                            alt=""
                            className="w-6 h-6 object-contain"
                            loading="lazy"
                          />
                          <span>{formatPokemonName(p.displayName || p.name)}</span>
                        </div>
                        <span className="font-mono-tech text-[10px] text-theme-secondary">
                          #{String(p.id).padStart(4, "0")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-display font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Investigate</span>
              </button>
            </form>

            {/* Eliminated Leads History */}
            {guessHistory.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono-tech uppercase text-theme-secondary font-bold">
                  Eliminated Suspects:
                </span>
                {guessHistory.map((g, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-display font-bold line-through"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
