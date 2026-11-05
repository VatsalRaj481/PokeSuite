import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";
import { ICONIC_POKEMON_POOL } from "../../utils/calcData.js";
import { formatPokemonName } from "../../utils/loreData.js";

// Curated instant-load mystery entries for immediate offline play and rapid testing
const CURATED_DEX_ENTRIES = [
  {
    id: 1,
    name: "bulbasaur",
    version: "FireRed",
    text: "There is a plant seed on its back right from the day this Pokémon is born. The seed slowly grows larger.",
  },
  {
    id: 4,
    name: "charmander",
    version: "Red / Blue",
    text: "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
  },
  {
    id: 7,
    name: "squirtle",
    version: "Yellow",
    text: "Shoots water at prey while in the water. Withdraws into its shell when in danger.",
  },
  {
    id: 25,
    name: "pikachu",
    version: "Emerald",
    text: "It stores electricity in the electric sacs on its cheeks. When it releases pent-up energy in a burst, the electric power is equal to a lightning bolt.",
  },
  {
    id: 94,
    name: "gengar",
    version: "SoulSilver",
    text: "To steal the life of its target, it slips into the prey's shadow and silently waits for an opportunity.",
  },
  {
    id: 130,
    name: "gyarados",
    version: "Platinum",
    text: "Once it appears, it goes on a rampage. It remains enraged until it demolishes everything around it.",
  },
  {
    id: 131,
    name: "lapras",
    version: "Crystal",
    text: "This gentle Pokémon loves to ferry people across bodies of water. It has an exceptional ability to understand human speech.",
  },
  {
    id: 133,
    name: "eevee",
    version: "Sword",
    text: "It has the ability to alter the composition of its body to suit its surrounding environment.",
  },
  {
    id: 143,
    name: "snorlax",
    version: "HeartGold",
    text: "Its stomach's digestive juices can dissolve any kind of poison. Eating bad food doesn't affect it at all.",
  },
  {
    id: 149,
    name: "dragonite",
    version: "Black 2",
    text: "It is said to make its home somewhere in the sea. It guides crews of shipwrecked ships to shore safely.",
  },
  {
    id: 150,
    name: "mewtwo",
    version: "FireRed",
    text: "A Pokémon that was created by genetic manipulation. However, even though the scientific power of humans made its body, they failed to endow it with a compassionate heart.",
  },
  {
    id: 248,
    name: "tyranitar",
    version: "Ruby",
    text: "It is so staggeringly strong, it can bring down a whole mountain to make its nest. This Pokémon wanders about in mountains to find new opponents.",
  },
  {
    id: 282,
    name: "gardevoir",
    version: "Sapphire",
    text: "It has the psychokinetic power to distort the dimensions and create a small black hole. This Pokémon will try to protect its Trainer even at the risk of its own life.",
  },
  {
    id: 384,
    name: "rayquaza",
    version: "Emerald",
    text: "A Pokémon that flies endlessly through the ozone layer. It is said that would descend to the ground only if Kyogre and Groudon were to fight.",
  },
  {
    id: 448,
    name: "lucario",
    version: "Diamond",
    text: "It has the ability to sense the auras of all things. It understands human speech.",
  },
  {
    id: 445,
    name: "garchomp",
    version: "Platinum",
    text: "When it folds up its body and extends its wings, it looks like a jet plane. It flies at sonic speed.",
  },
  {
    id: 658,
    name: "greninja",
    version: "X",
    text: "It creates throwing stars out of compressed water. When it spins them and throws them at high speed, these stars can split metal in two.",
  },
  {
    id: 778,
    name: "mimikyu",
    version: "Sun",
    text: "Its actual appearance is unknown. A scholar who saw what was under its rag was overwhelmed by terror and died from the shock.",
  },
  {
    id: 1007,
    name: "koraidon",
    version: "Scarlet",
    text: "This Pokémon was named the Winged King by an ancient text. It is said to have split the land with its bare fists.",
  },
  {
    id: 1008,
    name: "miraidon",
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
      .filter((p) => p.name.toLowerCase().includes(q) || (p.displayName && p.displayName.toLowerCase().includes(q)))
      .slice(0, 5);
  }, [guessInput, candidatePool]);

  // Redaction helper that replaces the target name and close variations
  const redactFlavorText = (text, target) => {
    if (!text || !target) return "";
    let cleaned = text.replace(/[\f\n\r\t]/g, " ").replace(/\s+/g, " ").trim();

    const targetNames = [
      target.name.toLowerCase(),
      (target.displayName || "").toLowerCase(),
      target.name.split("-")[0].toLowerCase(),
    ].filter(Boolean);

    // Escape regex characters
    targetNames.forEach((n) => {
      if (n.length >= 3) {
        const regex = new RegExp(`\\b${n}['’]s?\\b`, "gi");
        cleaned = cleaned.replace(regex, "[POKÉMON]");
      }
    });

    return cleaned;
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
    setRevealedClues({ gen: false, types: false, silhouette: false });

    // Decide whether to use curated or fetch live
    const useCurated = Math.random() < 0.4 || candidatePool.length === 0;

    if (useCurated) {
      const sample = CURATED_DEX_ENTRIES[Math.floor(Math.random() * CURATED_DEX_ENTRIES.length)];
      const targetObj = candidatePool.find((p) => p.id === sample.id) || {
        id: sample.id,
        name: sample.name,
        displayName: formatPokemonName(sample.name),
        types: ["normal"],
      };

      setCurrentCase(targetObj);
      setRawEntry(sample.text);
      setRedactedEntry(redactFlavorText(sample.text, targetObj));
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

      setCurrentCase(randomPokemon);
      setRawEntry(rawText);
      setRedactedEntry(redactFlavorText(rawText, randomPokemon));
      setGameVersion(`Pokémon ${versionName}`);
    } catch (err) {
      // Fallback to curated entry on network failure or rate limit
      const fallback = CURATED_DEX_ENTRIES[Math.floor(Math.random() * CURATED_DEX_ENTRIES.length)];
      const targetObj = candidatePool.find((p) => p.id === fallback.id) || {
        id: fallback.id,
        name: fallback.name,
        displayName: formatPokemonName(fallback.name),
        types: ["normal"],
      };
      setCurrentCase(targetObj);
      setRawEntry(fallback.text);
      setRedactedEntry(redactFlavorText(fallback.text, targetObj));
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
    const targetDisplayName = (currentCase.displayName || "").toLowerCase();

    const isMatch =
      guessName === targetName ||
      guessName === targetDisplayName ||
      (typeof pokemonGuess === "object" && pokemonGuess?.id === currentCase.id);

    setGuessInput("");

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
        text: `Case Solved! It was indeed ${formatPokemonName(currentCase.displayName || currentCase.name)}!`,
      });
      confetti({ particleCount: 85, spread: 80, origin: { y: 0.6 } });
    } else {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      setGuessHistory((prev) => [...prev, formatPokemonName(guessName)]);

      if (nextAttempts <= 0) {
        setIsFailed(true);
        setStreak(0);
        setFeedback({
          type: "error",
          text: `Case Closed! The mystery Pokémon was ${formatPokemonName(currentCase.displayName || currentCase.name)}.`,
        });
      } else {
        setFeedback({
          type: "warning",
          text: `Incorrect! ${nextAttempts} ${nextAttempts === 1 ? "attempt" : "attempts"} remaining.`,
        });
      }
    }
  };

  // Generation descriptor
  const generationText = useMemo(() => {
    if (!currentCase?.id) return "Unknown";
    const id = currentCase.id;
    if (id <= 151) return "Generation 1 (Kanto)";
    if (id <= 251) return "Generation 2 (Johto)";
    if (id <= 386) return "Generation 3 (Hoenn)";
    if (id <= 493) return "Generation 4 (Sinnoh)";
    if (id <= 649) return "Generation 5 (Unova)";
    if (id <= 721) return "Generation 6 (Kalos)";
    if (id <= 809) return "Generation 7 (Alola)";
    if (id <= 898) return "Generation 8 (Galar)";
    return "Generation 9 (Paldea)";
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
              Deduce the identity of the Pokémon from redacted in-game field entries.
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

      {/* Case File Card */}
      <div className="relative bg-theme-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col gap-6 overflow-hidden">
        {/* Ambient Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-theme/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono-tech text-xs font-bold uppercase">
              {gameVersion}
            </span>
            <span className="text-xs font-display text-theme-secondary">Classified Field Report</span>
          </div>

          {/* Remaining Attempts */}
          <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-theme-secondary">
            <span className="uppercase text-[10px]">Attempts:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((slot) => (
                <span
                  key={slot}
                  className={`inline-block w-2.5 h-2.5 rounded-full transition-all ${
                    slot <= attemptsLeft
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                      : "bg-theme-secondary/25 border border-theme"
                  }`}
                  title={`${attemptsLeft} attempts remaining`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Redacted Pokédex Flavor Text Entry */}
        <div className="p-6 sm:p-8 rounded-2xl bg-theme-bg/80 border border-theme/80 shadow-inner flex flex-col justify-center min-h-[140px] relative">
          {isLoadingCase ? (
            <div className="flex items-center justify-center gap-2 text-theme-secondary text-sm font-display animate-pulse">
              <span>Opening archival case file...</span>
            </div>
          ) : (
            <blockquote className="text-base sm:text-lg md:text-xl font-display font-medium text-theme-primary leading-relaxed text-center italic">
              “
              {isSolved || isFailed
                ? rawEntry.replace(/[\f\n\r\t]/g, " ")
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

        {/* Solved / Failed Hero Reveal */}
        <AnimatePresence>
          {(isSolved || isFailed) && currentCase && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-3 pt-2"
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 relative flex items-center justify-center">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentCase.id}.png`}
                  alt={currentCase.name}
                  className="w-full h-full object-contain drop-shadow-2xl animate-fade-in"
                  onError={(e) => {
                    e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentCase.id}.png`;
                  }}
                />
              </div>

              <div>
                <span className="font-mono-tech text-xs text-theme-secondary font-bold">
                  #{String(currentCase.id).padStart(4, "0")}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-theme-primary capitalize">
                  {formatPokemonName(currentCase.displayName || currentCase.name)}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.isArray(currentCase.types) &&
                  currentCase.types.map((t) => {
                    const tName = typeof t === "string" ? t : t?.type?.name;
                    return <TypeBadge key={tName} type={tName} size="sm" />;
                  })}
              </div>

              <div className="flex items-center gap-2 mt-2">
                {onSelectPokemon && (
                  <button
                    type="button"
                    onClick={() => onSelectPokemon(currentCase)}
                    className="px-4 py-2 bg-theme-bg hover:bg-theme-surface-hover border border-theme text-theme-primary font-display font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    View in National Dex →
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadNextCase}
                  className="px-5 py-2 bg-theme-accent text-white font-display font-extrabold text-xs rounded-xl shadow-md hover:bg-theme-accent/90 cursor-pointer"
                >
                  Next Case →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Investigation Clues (Only visible when active) */}
        {!isSolved && !isFailed && (
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono-tech uppercase font-bold text-theme-secondary text-center">
              Request Forensic Clues:
            </span>
            <div className="flex items-center justify-center flex-wrap gap-2">
              {/* Clue 1: Generation */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, gen: true }))}
                disabled={revealedClues.gen}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all cursor-pointer ${
                  revealedClues.gen
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                    : "bg-theme-bg border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {revealedClues.gen ? generationText : "Clue 1: Region / Gen"}
              </button>

              {/* Clue 2: Types */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, types: true }))}
                disabled={revealedClues.types}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all cursor-pointer ${
                  revealedClues.types
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-theme-bg border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {revealedClues.types && currentCase?.types ? (
                  <span className="flex items-center gap-1">
                    <span>Types:</span>
                    {currentCase.types.map((t) => {
                      const tName = typeof t === "string" ? t : t?.type?.name;
                      return <TypeBadge key={tName} type={tName} size="xs" />;
                    })}
                  </span>
                ) : (
                  "Clue 2: Typings"
                )}
              </button>

              {/* Clue 3: Silhouette */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, silhouette: true }))}
                disabled={revealedClues.silhouette}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all cursor-pointer ${
                  revealedClues.silhouette
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-theme-bg border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {revealedClues.silhouette ? "Silhouette Unlocked" : "Clue 3: Silhouette"}
              </button>
            </div>

            {/* Silhouette reveal box */}
            {revealedClues.silhouette && currentCase && (
              <div className="flex justify-center my-2">
                <div className="w-24 h-24 p-2 rounded-2xl bg-theme-bg/60 border border-theme flex items-center justify-center">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentCase.id}.png`}
                    alt="Mystery Silhouette"
                    className="w-full h-full object-contain brightness-0 contrast-200 opacity-60"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl border text-center text-xs font-display font-bold shadow-xs ${
              feedback.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : feedback.type === "error"
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Guess Input & Autocomplete Search */}
        {!isSolved && !isFailed && (
          <div className="relative flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (guessInput.trim()) submitGuess(guessInput.trim());
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Identify this Pokémon (e.g. Blastoise, Gengar, Lucario)..."
                  className="w-full px-4 py-3 bg-theme-bg border border-theme rounded-2xl text-sm font-display text-theme-primary focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                />

                {/* Autocomplete Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-theme-surface border border-theme rounded-2xl shadow-xl overflow-hidden z-30">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => submitGuess(p)}
                        className="w-full px-4 py-2.5 text-left text-xs font-display font-bold text-theme-primary hover:bg-theme-surface-hover flex items-center justify-between border-b border-theme/30 last:border-none cursor-pointer"
                      >
                        <span>{formatPokemonName(p.displayName || p.name)}</span>
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
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Investigate
              </button>
            </form>

            {/* Guess history chips */}
            {guessHistory.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono-tech uppercase text-theme-secondary">Failed Leads:</span>
                {guessHistory.map((g, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-display font-bold line-through"
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
