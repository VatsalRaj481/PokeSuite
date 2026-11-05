import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";
import { ICONIC_POKEMON_POOL } from "../../utils/calcData.js";
import { formatPokemonName } from "../../utils/loreData.js";

export default function CryQuizGame({ pokemonList = [], onSelectPokemon }) {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userGuess, setUserGuess] = useState("");
  const [selectedGen, setSelectedGen] = useState("all");
  const [gameMode, setGameMode] = useState("choice"); // 'choice' | 'search'
  const [cryVariant, setCryVariant] = useState("latest"); // 'latest' (modern) | 'legacy' (retro 8-bit)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Progressive Clues
  const [revealedClues, setRevealedClues] = useState({
    region: false,
    type: false,
    bst: false,
    silhouette: false,
  });

  // Streaks & Stats
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("pokedex_cry_quiz_best") || "0", 10);
    } catch (e) {
      return 0;
    }
  });

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }
  const audioRef = useRef(null);

  // Candidate pool with generation boundaries
  const candidatePool = useMemo(() => {
    const basePool = pokemonList && pokemonList.length > 0 ? pokemonList : ICONIC_POKEMON_POOL;
    if (selectedGen === "all") return basePool;
    const gen = parseInt(selectedGen, 10);
    const genBounds = {
      1: [1, 151],
      2: [152, 251],
      3: [252, 386],
      4: [387, 493],
      5: [494, 649],
      6: [650, 721],
      7: [722, 809],
      8: [810, 898],
      9: [899, 1025],
    };
    const bounds = genBounds[gen];
    if (!bounds) return basePool;
    return basePool.filter((p) => p.id >= bounds[0] && p.id <= bounds[1]);
  }, [pokemonList, selectedGen]);

  // Play audio cry function
  const playCry = useCallback(
    (variantToPlay = cryVariant) => {
      if (!currentPokemon) return;
      setIsPlayingAudio(true);
      setAudioError(false);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const primaryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/${variantToPlay}/${currentPokemon.id}.ogg`;
      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/${
        variantToPlay === "latest" ? "legacy" : "latest"
      }/${currentPokemon.id}.ogg`;

      const audio = new Audio(primaryUrl);
      audioRef.current = audio;

      audio.play().catch(() => {
        // Try fallback variant if chosen one is missing for this ID
        const fallbackAudio = new Audio(fallbackUrl);
        audioRef.current = fallbackAudio;
        fallbackAudio.play().catch(() => {
          setIsPlayingAudio(false);
          setAudioError(true);
        });
        fallbackAudio.onended = () => setIsPlayingAudio(false);
      });

      audio.onended = () => setIsPlayingAudio(false);
    },
    [currentPokemon, cryVariant]
  );

  // Load next mystery round
  const loadNextRound = useCallback(() => {
    if (candidatePool.length === 0) return;
    setIsRevealed(false);
    setUserGuess("");
    setFeedback(null);
    setAudioError(false);
    setRevealedClues({
      region: false,
      type: false,
      bst: false,
      silhouette: false,
    });

    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    const target = candidatePool[randomIndex];
    setCurrentPokemon(target);

    // Pick 3 plausible decoys from same pool
    const poolCopy = [...candidatePool];
    poolCopy.splice(randomIndex, 1);
    const decoys = [];

    for (let i = 0; i < 3 && poolCopy.length > 0; i++) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      decoys.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }

    const shuffled = [target, ...decoys].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  }, [candidatePool]);

  // Initial load
  useEffect(() => {
    if (candidatePool.length > 0 && !currentPokemon) {
      loadNextRound();
    }
  }, [candidatePool, currentPokemon, loadNextRound]);

  // Auto-play cry when a new round is loaded (if user has interacted)
  useEffect(() => {
    if (currentPokemon && !isRevealed) {
      // Delay slightly for smooth transition
      const timer = setTimeout(() => {
        playCry();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentPokemon, playCry, isRevealed]);

  // Handle guessing
  const handleGuess = (guessedPokemon) => {
    if (isRevealed || !currentPokemon) return;

    const targetName = (currentPokemon.name || "").toLowerCase().trim();
    const targetDisplayName = (currentPokemon.displayName || "").toLowerCase().trim();
    const cleanGuess = (typeof guessedPokemon === "string" ? guessedPokemon : guessedPokemon?.name || "")
      .toLowerCase()
      .trim();

    const isCorrect =
      cleanGuess === targetName ||
      (targetDisplayName && cleanGuess === targetDisplayName) ||
      (typeof guessedPokemon === "object" && guessedPokemon?.id === currentPokemon.id);

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        try {
          localStorage.setItem("pokedex_cry_quiz_best", String(nextStreak));
        } catch (e) {}
      }

      setIsRevealed(true);
      setFeedback({
        type: "success",
        text: `Bullseye! That was ${formatPokemonName(currentPokemon.displayName || currentPokemon.name)}!`,
      });

      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      playCry();
    } else {
      setStreak(0);
      setFeedback({
        type: "error",
        text: "Not quite right! Listen again or reveal a clue.",
      });
    }
  };

  const handleSurrender = () => {
    if (isRevealed || !currentPokemon) return;
    setStreak(0);
    setIsRevealed(true);
    setFeedback({
      type: "info",
      text: `The mystery Pokémon was ${formatPokemonName(currentPokemon.displayName || currentPokemon.name)}.`,
    });
    playCry();
  };

  // Helper to extract BST
  const bstValue = useMemo(() => {
    if (!currentPokemon) return "—";
    if (currentPokemon.baseStats) {
      return Object.values(currentPokemon.baseStats).reduce((a, b) => a + (Number(b) || 0), 0);
    }
    if (currentPokemon.stats) {
      return currentPokemon.stats.reduce((acc, s) => acc + (s.base_stat || 0), 0);
    }
    return "450–520";
  }, [currentPokemon]);

  // Extract region name from ID
  const regionName = useMemo(() => {
    if (!currentPokemon?.id) return "Unknown";
    const id = currentPokemon.id;
    if (id <= 151) return "Kanto (Gen 1)";
    if (id <= 251) return "Johto (Gen 2)";
    if (id <= 386) return "Hoenn (Gen 3)";
    if (id <= 493) return "Sinnoh (Gen 4)";
    if (id <= 649) return "Unova (Gen 5)";
    if (id <= 721) return "Kalos (Gen 6)";
    if (id <= 809) return "Alola (Gen 7)";
    if (id <= 898) return "Galar (Gen 8)";
    return "Paldea (Gen 9)";
  }, [currentPokemon]);

  // Extract primary type
  const primaryType = useMemo(() => {
    if (!currentPokemon) return "normal";
    if (Array.isArray(currentPokemon.types)) {
      const first = currentPokemon.types[0];
      return typeof first === "string" ? first : first?.type?.name || "normal";
    }
    return "normal";
  }, [currentPokemon]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-2">
      {/* Header Deck: Controls & Streaks */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-theme-surface border border-theme rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-display font-black text-theme-primary flex items-center gap-2">
              <span>Who's That Cry?</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-mono-tech font-bold uppercase">
                Audio Quiz
              </span>
            </h2>
            <p className="text-xs font-display text-theme-secondary">
              Listen to the acoustic frequency and identify the Pokémon.
            </p>
          </div>
        </div>

        {/* Streaks Counter */}
        <div className="flex items-center gap-2.5 font-mono-tech text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-theme-bg border border-theme text-theme-primary font-bold flex items-center gap-1.5">
            <span className="text-theme-secondary text-[11px] uppercase tracking-wider">Streak:</span>
            <span className="text-sm font-black text-amber-400">{streak}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-theme-bg border border-theme text-theme-secondary font-bold">
            Best: <span className="text-theme-primary font-black">{bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Sub-Bar: Settings (Audio Style, Gen Filter, Mode) */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-theme-bg/60 border border-theme rounded-xl px-4 py-2.5 text-xs font-display">
        {/* Audio Variant Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary font-mono-tech text-[10px] uppercase">Audio Style:</span>
          <div className="flex items-center gap-1 bg-theme-surface p-1 rounded-lg border border-theme">
            <button
              type="button"
              onClick={() => {
                setCryVariant("latest");
                if (currentPokemon) playCry("latest");
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                cryVariant === "latest"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Modern 3D
            </button>
            <button
              type="button"
              onClick={() => {
                setCryVariant("legacy");
                if (currentPokemon) playCry("legacy");
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                cryVariant === "legacy"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Retro 8-Bit
            </button>
          </div>
        </div>

        {/* Generation Filter */}
        <div className="flex items-center gap-2">
          <span className="text-theme-secondary font-mono-tech text-[10px] uppercase">Pool:</span>
          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
            className="px-2.5 py-1 bg-theme-surface border border-theme rounded-lg text-xs font-display font-bold text-theme-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Generations</option>
            <option value="1">Gen 1 (Kanto)</option>
            <option value="2">Gen 2 (Johto)</option>
            <option value="3">Gen 3 (Hoenn)</option>
            <option value="4">Gen 4 (Sinnoh)</option>
            <option value="5">Gen 5 (Unova)</option>
            <option value="6">Gen 6 (Kalos)</option>
            <option value="7">Gen 7 (Alola)</option>
            <option value="8">Gen 8 (Galar)</option>
            <option value="9">Gen 9 (Paldea)</option>
          </select>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center gap-1 bg-theme-surface p-1 rounded-lg border border-theme">
          <button
            type="button"
            onClick={() => setGameMode("choice")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              gameMode === "choice"
                ? "bg-theme-accent text-white shadow-xs"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => setGameMode("search")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              gameMode === "search"
                ? "bg-theme-accent text-white shadow-xs"
                : "text-theme-secondary hover:text-theme-primary"
            }`}
          >
            Direct Search
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative bg-theme-surface border border-theme rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col items-center justify-center overflow-hidden min-h-[320px]">
        {/* Ambient Gradient Glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isRevealed ? "from-emerald-500/10 to-transparent" : "from-purple-500/10 to-transparent"
          } pointer-events-none`}
        />

        {/* Central Audio Speaker Unit */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playCry()}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer border-4 ${
              isPlayingAudio
                ? "bg-purple-600 border-purple-400 ring-8 ring-purple-500/25 animate-pulse"
                : isRevealed
                ? "bg-emerald-600 border-emerald-400"
                : "bg-theme-bg border-purple-500/40 hover:border-purple-400"
            }`}
            title="Click to replay audio cry"
            aria-label="Replay audio cry"
          >
            {isPlayingAudio ? (
              /* Equalizer animated bars */
              <div className="flex items-center gap-1.5 h-10">
                <span className="w-1.5 bg-white rounded-full h-8 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 bg-white rounded-full h-10 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 bg-white rounded-full h-6 animate-bounce [animation-delay:-0.45s]" />
                <span className="w-1.5 bg-white rounded-full h-9 animate-bounce [animation-delay:-0.2s]" />
              </div>
            ) : (
              <svg
                className={`w-12 h-12 ${isRevealed ? "text-white" : "text-purple-400"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path
                  d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </motion.button>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-display font-bold text-theme-primary">
              {isPlayingAudio ? "Transmitting Audio Cry..." : "Tap Speaker to Replay Cry"}
            </span>
            <span className="text-[10px] font-mono-tech text-theme-secondary">
              Current Tone: {cryVariant === "latest" ? "Modern 3D High-Fidelity" : "Retro 8-Bit Chiptune"}
            </span>
            {audioError && (
              <span className="text-xs text-rose-400 font-bold">Audio unavailable for this species</span>
            )}
          </div>
        </div>

        {/* Revealed Pokémon Card Celebration */}
        <AnimatePresence>
          {isRevealed && currentPokemon && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-6 flex flex-col items-center text-center gap-3 z-10"
            >
              {/* Official Artwork / Sprite */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentPokemon.id}.png`}
                  alt={currentPokemon.name}
                  className="w-full h-full object-contain drop-shadow-2xl animate-fade-in"
                  onError={(e) => {
                    e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPokemon.id}.png`;
                  }}
                />
              </div>

              <div>
                <span className="font-mono-tech text-xs text-theme-secondary font-bold">
                  #{String(currentPokemon.id).padStart(4, "0")}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-theme-primary capitalize">
                  {formatPokemonName(currentPokemon.displayName || currentPokemon.name)}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.isArray(currentPokemon.types) &&
                  currentPokemon.types.map((t) => {
                    const typeName = typeof t === "string" ? t : t?.type?.name;
                    return <TypeBadge key={typeName} type={typeName} size="sm" />;
                  })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2">
                {onSelectPokemon && (
                  <button
                    type="button"
                    onClick={() => onSelectPokemon(currentPokemon)}
                    className="px-4 py-2 bg-theme-bg hover:bg-theme-surface-hover border border-theme text-theme-primary font-display font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    View in National Dex →
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadNextRound}
                  className="px-5 py-2 bg-theme-accent text-white font-display font-extrabold text-xs rounded-xl shadow-md hover:bg-theme-accent/90 cursor-pointer"
                >
                  Next Cry →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clue Hints Strip (Before Reveal) */}
        {!isRevealed && (
          <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-lg z-10">
            <span className="text-[10px] font-mono-tech uppercase font-bold text-theme-secondary">
              Need a Clue? Tap to Unlock:
            </span>
            <div className="flex items-center justify-center flex-wrap gap-2">
              {/* Clue 1: Region */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, region: true }))}
                disabled={revealedClues.region}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all cursor-pointer ${
                  revealedClues.region
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                    : "bg-theme-bg border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {revealedClues.region ? regionName : "Clue 1: Region"}
              </button>

              {/* Clue 2: Primary Type */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, type: true }))}
                disabled={revealedClues.type}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all cursor-pointer ${
                  revealedClues.type
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-theme-bg border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {revealedClues.type ? (
                  <span className="flex items-center gap-1">
                    <span>Type:</span>
                    <TypeBadge type={primaryType} size="xs" />
                  </span>
                ) : (
                  "Clue 2: Type"
                )}
              </button>

              {/* Clue 3: BST */}
              <button
                type="button"
                onClick={() => setRevealedClues((p) => ({ ...p, bst: true }))}
                disabled={revealedClues.bst}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold border transition-all cursor-pointer ${
                  revealedClues.bst
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "bg-theme-bg border-theme text-theme-secondary hover:text-theme-primary"
                }`}
              >
                {revealedClues.bst ? `BST: ${bstValue}` : "Clue 3: Stat Total"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl border text-center text-xs font-display font-bold shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : feedback.type === "error"
              ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
              : "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Guess Input Section (Hidden if already revealed) */}
      {!isRevealed && (
        <div className="flex flex-col gap-4">
          {gameMode === "choice" ? (
            /* 4 Choice Cards Grid */
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleGuess(opt)}
                  className="p-4 bg-theme-surface hover:bg-theme-surface-hover active:scale-[0.98] border border-theme rounded-2xl font-display font-black text-sm sm:text-base text-theme-primary shadow-sm hover:border-purple-500/40 transition-all cursor-pointer text-center"
                >
                  {formatPokemonName(opt.displayName || opt.name)}
                </button>
              ))}
            </div>
          ) : (
            /* Direct Search Input */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userGuess.trim()) handleGuess(userGuess.trim());
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Type Pokémon name (e.g. Lucario, Gengar, Pikachu)..."
                className="flex-1 px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-sm font-display text-theme-primary focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-display font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Guess!
              </button>
            </form>
          )}

          {/* Surrender Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSurrender}
              className="text-xs font-display text-theme-secondary hover:text-rose-400 transition-colors cursor-pointer"
            >
              Give up and reveal answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
