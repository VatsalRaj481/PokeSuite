import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";
import { ICONIC_POKEMON_POOL } from "../../utils/calcData.js";
import { formatPokemonName } from "../../utils/loreData.js";

export default function SilhouetteGame({ pokemonList = [], onSelectPokemon }) {
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userGuess, setUserGuess] = useState("");
  const [selectedGen, setSelectedGen] = useState("all");
  const [gameMode, setGameMode] = useState("choice"); // 'choice' | 'expert'
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("pokedex_silhouette_best") || "0", 10);
    } catch (e) {
      return 0;
    }
  });
  const [showTypeHint, setShowTypeHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const audioRef = useRef(null);

  // Filter pool by generation with immediate iconic pool fallback
  const candidatePool = React.useMemo(() => {
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

  // Load a new mystery Pokémon
  const loadNextRound = useCallback(() => {
    if (candidatePool.length === 0) return;
    setIsRevealed(false);
    setUserGuess("");
    setShowTypeHint(false);
    setFeedbackMessage(null);

    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    const target = candidatePool[randomIndex];
    setCurrentPokemon(target);

    // Pick 3 random decoys for multiple choice mode
    const decoys = [];
    const poolCopy = [...candidatePool];
    poolCopy.splice(randomIndex, 1);

    for (let i = 0; i < 3 && poolCopy.length > 0; i++) {
      const decoyIndex = Math.floor(Math.random() * poolCopy.length);
      decoys.push(poolCopy[decoyIndex]);
      poolCopy.splice(decoyIndex, 1);
    }

    const shuffled = [target, ...decoys].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  }, [candidatePool]);

  useEffect(() => {
    if (candidatePool.length > 0 && !currentPokemon) {
      loadNextRound();
    }
  }, [candidatePool, currentPokemon, loadNextRound]);

  // Play audio cry
  const playCry = useCallback(() => {
    if (!currentPokemon) return;
    setIsPlayingAudio(true);
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentPokemon.id}.ogg`;
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(cryUrl);
    audioRef.current = audio;
    audio.play().catch(() => {
      // Fallback to legacy 8-bit cry
      const legacyAudio = new Audio(
        `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${currentPokemon.id}.ogg`
      );
      audioRef.current = legacyAudio;
      legacyAudio.play().catch(() => {});
    });
    audio.onended = () => setIsPlayingAudio(false);
  }, [currentPokemon]);

  // Handle Guess
  const handleGuess = (guessedName) => {
    if (isRevealed || !currentPokemon) return;
    const cleanGuess = guessedName.toLowerCase().trim();
    const rawName = currentPokemon.name.toLowerCase().trim();
    const formattedName = formatPokemonName(currentPokemon.name).toLowerCase().trim();
    const displayName = (currentPokemon.displayName || "").toLowerCase().trim();
    const spacedName = rawName.replace(/-/g, " ");

    const isCorrect =
      cleanGuess === rawName ||
      cleanGuess === formattedName ||
      (displayName && cleanGuess === displayName) ||
      cleanGuess === spacedName;

    if (isCorrect) {
      setIsRevealed(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        try {
          localStorage.setItem("pokedex_silhouette_best", String(newStreak));
        } catch (e) {}
      }
      playCry();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setFeedbackMessage({
        type: "success",
        text: "It's " + formatPokemonName(currentPokemon.displayName || currentPokemon.name) + "!",
      });
    } else {
      setStreak(0);
      setFeedbackMessage({ type: "error", text: "Not quite! Try again or reveal." });
    }
  };

  const spriteUrl = currentPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentPokemon.id}.png`
    : "";

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      {/* Top Header / Mode & Gen Toggles */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface border border-theme rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-theme-accent/10 border border-theme-accent rounded-xl text-theme-accent font-display font-extrabold text-xs">
            Streak: <span className="text-sm">{streak}</span>
          </div>
          <div className="px-3 py-1.5 bg-theme-bg border border-theme rounded-xl text-theme-secondary font-display font-bold text-xs">
            Best: <span className="text-theme-primary">{bestStreak}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Generation filter */}
          <select
            value={selectedGen}
            onChange={(e) => {
              setSelectedGen(e.target.value);
              setCurrentPokemon(null);
            }}
            className="px-2.5 py-1.5 bg-theme-bg border border-theme rounded-xl text-xs font-display text-theme-primary cursor-pointer"
          >
            <option value="all">All Generations (1 - 9)</option>
            <option value="1">Gen 1: Kanto</option>
            <option value="2">Gen 2: Johto</option>
            <option value="3">Gen 3: Hoenn</option>
            <option value="4">Gen 4: Sinnoh</option>
            <option value="5">Gen 5: Unova</option>
            <option value="6">Gen 6: Kalos</option>
            <option value="7">Gen 7: Alola</option>
            <option value="8">Gen 8: Galar</option>
            <option value="9">Gen 9: Paldea</option>
          </select>

          {/* Mode Switcher */}
          <div className="flex border border-theme rounded-xl overflow-hidden p-0.5 bg-theme-bg">
            <button
              type="button"
              onClick={() => setGameMode("choice")}
              className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-colors cursor-pointer ${
                gameMode === "choice"
                  ? "bg-theme-accent text-white"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              4-Choice
            </button>
            <button
              type="button"
              onClick={() => setGameMode("expert")}
              className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-colors cursor-pointer ${
                gameMode === "expert"
                  ? "bg-theme-accent text-white"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Expert Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Silhouette Stage (Retro TV Frame) */}
      <div className="w-full relative bg-radial from-slate-800 to-slate-950 border-4 border-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center min-h-[320px] sm:min-h-[380px] overflow-hidden select-none">
        {/* Anime Sunburst lines background effect */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent animate-pulse" />

        {/* Silhouette Image */}
        {currentPokemon ? (
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center z-10">
            <motion.img
              key={currentPokemon.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              src={spriteUrl}
              alt="Mystery Silhouette"
              className={`max-h-full max-w-full object-contain transition-all duration-700 ${
                isRevealed
                  ? "filter drop-shadow-[0_0_24px_rgba(255,255,255,0.7)]"
                  : "brightness-0 contrast-200 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
              }`}
            />
          </div>
        ) : (
          <div className="w-12 h-12 border-4 border-theme-accent border-t-transparent rounded-full animate-spin" />
        )}

        {/* Revealed Pokémon Details Card */}
        {isRevealed && currentPokemon && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 z-20 flex flex-col items-center gap-2 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wide drop-shadow-md">
              {formatPokemonName(currentPokemon.displayName || currentPokemon.name)}
            </h2>
            <div className="flex gap-1.5">
              {(currentPokemon.types || []).map((t) => (
                <TypeBadge
                  key={typeof t === "string" ? t : t.type.name}
                  type={typeof t === "string" ? t : t.type.name}
                  size="sm"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Clues & Action Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          type="button"
          onClick={playCry}
          disabled={isPlayingAudio}
          className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-hover border border-theme rounded-xl text-xs font-display font-bold text-theme-primary flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <svg className={`w-4 h-4 ${isPlayingAudio ? "animate-spin text-theme-accent" : ""}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 0 0 2.25 9.75v4.5a2.25 2.25 0 0 0 2.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06Z" />
          </svg>
          <span>{isPlayingAudio ? "Playing Cry..." : "Play Audio Cry"}</span>
        </button>

        {!isRevealed && !showTypeHint && (
          <button
            type="button"
            onClick={() => setShowTypeHint(true)}
            className="px-4 py-2 bg-theme-surface hover:bg-theme-surface-hover border border-theme rounded-xl text-xs font-display font-bold text-theme-secondary flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            Reveal Type Hint
          </button>
        )}

        {showTypeHint && currentPokemon && !isRevealed && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-bg border border-theme rounded-xl">
            <span className="text-[10px] font-mono-tech uppercase text-theme-secondary">Type:</span>
            <TypeBadge
              type={
                typeof currentPokemon.types?.[0] === "string"
                  ? currentPokemon.types[0]
                  : currentPokemon.types?.[0]?.type?.name || "normal"
              }
              size="sm"
            />
          </div>
        )}

        {!isRevealed && (
          <button
            type="button"
            onClick={() => {
              setIsRevealed(true);
              setStreak(0);
              setFeedbackMessage({ type: "error", text: "Revealed! The streak has reset." });
            }}
            className="px-3 py-2 text-xs font-display text-theme-secondary hover:text-rose-500 cursor-pointer"
          >
            Give Up & Reveal
          </button>
        )}
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`px-4 py-2 rounded-xl text-xs font-display font-bold ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Guess Input Interface */}
      {!isRevealed ? (
        gameMode === "choice" ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {options.map((opt) => (
              <button
                key={opt.name}
                type="button"
                onClick={() => handleGuess(opt.name)}
                className="py-3 px-4 bg-theme-surface hover:bg-theme-surface-hover border border-theme rounded-2xl font-display font-extrabold text-sm sm:text-base text-theme-primary shadow-sm transition-all transform active:scale-95 cursor-pointer text-center min-h-[44px]"
              >
                {formatPokemonName(opt.displayName || opt.name)}
              </button>
            ))}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGuess(userGuess);
            }}
            className="w-full flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Enter Pokémon name (e.g. Pikachu, Lucario)..."
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              className="flex-1 px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-sm font-display text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent min-h-[44px]"
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-3 bg-theme-accent text-white font-display font-extrabold text-sm rounded-2xl hover:bg-theme-accent/90 shadow-md cursor-pointer min-h-[44px]"
            >
              Guess
            </button>
          </form>
        )
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadNextRound}
            className="px-8 py-3 bg-theme-accent text-white font-display font-extrabold text-sm sm:text-base rounded-2xl hover:bg-theme-accent/90 shadow-lg cursor-pointer transform hover:scale-105 transition-all"
          >
            Next Pokémon →
          </button>
          {onSelectPokemon && currentPokemon && (
            <button
              type="button"
              onClick={() => onSelectPokemon(currentPokemon)}
              className="px-4 py-3 bg-theme-surface hover:bg-theme-surface-hover border border-theme text-theme-primary font-display font-bold text-xs sm:text-sm rounded-2xl cursor-pointer"
            >
              View Dex Entry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
