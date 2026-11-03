import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";
import { ICONIC_POKEMON_POOL } from "../../utils/calcData.js";

// Helper to determine generation from ID
const getGenFromId = (id) => {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 898) return 8;
  return 9;
};

// Simple pseudo-random generator seeded by string
const seedRandom = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };
};

export default function DexdleGame({ pokemonList = [], onSelectPokemon }) {
  const [isDaily, setIsDaily] = useState(true);
  const [targetPokemon, setTargetPokemon] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [copiedShare, setCopiedShare] = useState(false);
  const inputRef = useRef(null);

  // Stats in localStorage
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem("pokedex_dexdle_stats_v1");
      return saved ? JSON.parse(saved) : { played: 0, wins: 0, streak: 0, maxStreak: 0 };
    } catch (e) {
      return { played: 0, wins: 0, streak: 0, maxStreak: 0 };
    }
  });

  // Calculate Base Stat Total
  const getBst = (p) => {
    if (!p) return 400;
    if (p.stats && Array.isArray(p.stats)) {
      return p.stats.reduce((acc, s) => acc + (s.base_stat || 0), 0);
    }
    if (p.baseStats) {
      return Object.values(p.baseStats).reduce((a, b) => a + b, 0);
    }
    return 450;
  };

  // Get canonical types
  const getTypes = (p) => {
    if (!p || !p.types) return ["normal"];
    return p.types.map((t) => (typeof t === "string" ? t.toLowerCase() : t.type?.name?.toLowerCase() || "normal"));
  };

  // Daily seed string
  const todaySeed = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Active pool with iconic fallback
  const activePool = useMemo(() => {
    return pokemonList && pokemonList.length > 0 ? pokemonList : ICONIC_POKEMON_POOL;
  }, [pokemonList]);

  // Pick target Pokémon
  const initializeGame = React.useCallback(() => {
    if (!activePool || activePool.length === 0) return;
    setGuesses([]);
    setIsWon(false);
    setIsGameOver(false);
    setSearchQuery("");

    if (isDaily) {
      const rng = seedRandom(todaySeed);
      const idx = Math.floor(rng() * Math.min(activePool.length, 1025));
      setTargetPokemon(activePool[idx]);
    } else {
      const idx = Math.floor(Math.random() * Math.min(activePool.length, 1025));
      setTargetPokemon(activePool[idx]);
    }
  }, [activePool, isDaily, todaySeed]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !activePool) return [];
    const q = searchQuery.toLowerCase().trim();
    const alreadyGuessed = new Set(guesses.map((g) => g.name.toLowerCase()));
    return activePool
      .filter((p) => p.name.toLowerCase().includes(q) && !alreadyGuessed.has(p.name.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery, activePool, guesses]);

  // Reset keyboard highlight whenever suggestions update
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Compare a guess against the target
  const evaluateGuess = (guess) => {
    if (!targetPokemon) return null;
    const targetGen = getGenFromId(targetPokemon.id);
    const guessGen = getGenFromId(guess.id);

    const targetTypes = getTypes(targetPokemon);
    const guessTypes = getTypes(guess);

    // Type 1 comparison
    let type1Match = "wrong";
    if (guessTypes[0] === targetTypes[0]) type1Match = "correct";
    else if (guessTypes[0] === targetTypes[1]) type1Match = "partial";

    // Type 2 comparison
    let type2Match = "wrong";
    if (!targetTypes[1] && !guessTypes[1]) type2Match = "correct";
    else if (guessTypes[1] && guessTypes[1] === targetTypes[1]) type2Match = "correct";
    else if (guessTypes[1] && guessTypes[1] === targetTypes[0]) type2Match = "partial";

    // Height comparison (within 10% counts as match)
    const targetHeight = targetPokemon.height || 10;
    const guessHeight = guess.height || 10;
    let heightComp = "equal";
    if (Math.abs(guessHeight - targetHeight) / targetHeight > 0.15) {
      heightComp = guessHeight < targetHeight ? "higher" : "lower";
    }

    // Weight comparison
    const targetWeight = targetPokemon.weight || 200;
    const guessWeight = guess.weight || 200;
    let weightComp = "equal";
    if (Math.abs(guessWeight - targetWeight) / targetWeight > 0.15) {
      weightComp = guessWeight < targetWeight ? "higher" : "lower";
    }

    // BST comparison
    const targetBst = getBst(targetPokemon);
    const guessBst = getBst(guess);
    let bstComp = "equal";
    if (Math.abs(guessBst - targetBst) > 25) {
      bstComp = guessBst < targetBst ? "higher" : "lower";
    }

    return {
      pokemon: guess,
      name: guess.name,
      displayName: guess.displayName || guess.name,
      id: guess.id,
      gen: { value: guessGen, match: guessGen === targetGen ? "correct" : guessGen < targetGen ? "higher" : "lower" },
      type1: { value: guessTypes[0], match: type1Match },
      type2: { value: guessTypes[1] || "None", match: type2Match },
      height: { value: `${(guessHeight / 10).toFixed(1)}m`, match: heightComp },
      weight: { value: `${(guessWeight / 10).toFixed(1)}kg`, match: weightComp },
      bst: { value: guessBst, match: bstComp },
    };
  };

  const handleMakeGuess = (selectedP) => {
    if (isGameOver || isWon || !targetPokemon) return;
    const evaluated = evaluateGuess(selectedP);
    if (!evaluated) return;

    const newGuesses = [evaluated, ...guesses];
    setGuesses(newGuesses);
    setSearchQuery("");
    setShowDropdown(false);
    setHighlightedIndex(-1);

    // Keep keyboard focus inside the input for rapid-fire guessing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    // Check if won
    if (selectedP.id === targetPokemon.id) {
      setIsWon(true);
      setIsGameOver(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      const newStats = {
        played: stats.played + 1,
        wins: stats.wins + 1,
        streak: stats.streak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.streak + 1),
      };
      setStats(newStats);
      try {
        localStorage.setItem("pokedex_dexdle_stats_v1", JSON.stringify(newStats));
      } catch (e) {}
    } else if (newGuesses.length >= 6) {
      setIsGameOver(true);
      const newStats = {
        played: stats.played + 1,
        wins: stats.wins,
        streak: 0,
        maxStreak: stats.maxStreak,
      };
      setStats(newStats);
      try {
        localStorage.setItem("pokedex_dexdle_stats_v1", JSON.stringify(newStats));
      } catch (e) {}
    }
  };

  // Keyboard navigation for autocomplete list (ArrowDown, ArrowUp, Enter, Esc)
  const handleInputKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter" && searchQuery.trim()) {
        e.preventDefault();
        const q = searchQuery.toLowerCase().trim();
        const exact = activePool.find(
          (p) => p.name.toLowerCase() === q || (p.displayName && p.displayName.toLowerCase() === q)
        );
        if (exact) {
          handleMakeGuess(exact);
        } else if (suggestions.length > 0) {
          handleMakeGuess(suggestions[0]);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleMakeGuess(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        handleMakeGuess(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const copyShareText = () => {
    const title = isDaily ? `Dexdle Daily (${todaySeed})` : "Dexdle Practice";
    const rows = guesses
      .slice()
      .reverse()
      .map((g) => {
        const genIcon = g.gen.match === "correct" ? "🟩" : g.gen.match === "higher" ? "⬆️" : "⬇️";
        const t1Icon = g.type1.match === "correct" ? "🟩" : g.type1.match === "partial" ? "🟨" : "⬛";
        const t2Icon = g.type2.match === "correct" ? "🟩" : g.type2.match === "partial" ? "🟨" : "⬛";
        const hIcon = g.height.match === "equal" ? "🟩" : g.height.match === "higher" ? "⬆️" : "⬇️";
        const wIcon = g.weight.match === "equal" ? "🟩" : g.weight.match === "higher" ? "⬆️" : "⬇️";
        const bstIcon = g.bst.match === "equal" ? "🟩" : g.bst.match === "higher" ? "⬆️" : "⬇️";
        return `${genIcon}${t1Icon}${t2Icon}${hIcon}${wIcon}${bstIcon}`;
      })
      .join("\n");

    const text = `${title} ${isWon ? guesses.length : "X"}/6\n\n${rows}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const renderCellClass = (match) => {
    if (match === "correct" || match === "equal") {
      return "bg-emerald-600/90 text-white border-emerald-500";
    }
    if (match === "partial") {
      return "bg-amber-500/90 text-slate-950 border-amber-400 font-bold";
    }
    if (match === "higher" || match === "lower") {
      return "bg-sky-600/80 text-white border-sky-500";
    }
    return "bg-theme-bg/80 text-theme-secondary border-theme";
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      {/* Top Bar: Mode Toggle & Stats */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface border border-theme rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsDaily(true);
            }}
            className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs cursor-pointer transition-colors ${
              isDaily ? "bg-theme-accent text-white" : "bg-theme-bg text-theme-secondary hover:text-theme-primary border border-theme"
            }`}
          >
            Daily Dexdle
          </button>
          <button
            type="button"
            onClick={() => {
              setIsDaily(false);
            }}
            className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs cursor-pointer transition-colors ${
              !isDaily ? "bg-theme-accent text-white" : "bg-theme-bg text-theme-secondary hover:text-theme-primary border border-theme"
            }`}
          >
            Unlimited Mode
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-display">
          <div className="text-theme-secondary">
            Wins: <span className="font-bold text-theme-primary">{stats.wins}</span>/{stats.played}
          </div>
          <div className="text-theme-secondary">
            Streak: <span className="font-bold text-emerald-400">{stats.streak}</span>
          </div>
          <div className="text-theme-secondary">
            Best: <span className="font-bold text-theme-accent">{stats.maxStreak}</span>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      {!isGameOver && (
        <div className="w-full relative">
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Guess ${guesses.length + 1} of 6: Type Pokémon name...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleInputKeyDown}
                className="flex-1 px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-sm font-display text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent shadow-sm"
              />
              {/* Keyboard Cue Tag */}
              <div className="hidden sm:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-mono-tech text-theme-secondary/70">
                <kbd className="px-1.5 py-0.5 rounded bg-theme-bg border border-theme text-[9px]">↓/↑</kbd>
                <span>Navigate</span>
                <kbd className="px-1.5 py-0.5 rounded bg-theme-bg border border-theme text-[9px] ml-1">Enter ↵</kbd>
                <span>Select</span>
              </div>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-theme-surface border border-theme rounded-2xl shadow-xl z-30 overflow-hidden">
              {suggestions.map((p, idx) => {
                const isSelected = idx === highlightedIndex;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleMakeGuess(p)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-display border-b border-theme/50 last:border-b-0 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-theme-accent/20 text-theme-accent font-bold"
                        : "hover:bg-theme-surface-hover text-theme-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt={p.name}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="capitalize">{p.displayName || p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono-tech text-theme-secondary">
                        Gen {getGenFromId(p.id)}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-mono-tech uppercase px-1.5 py-0.2 rounded bg-theme-accent text-white font-bold">
                          Enter ↵
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Game Over Banner */}
      {isGameOver && targetPokemon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-theme-surface border border-theme rounded-3xl p-6 shadow-xl flex flex-col items-center gap-4 text-center"
        >
          <div className="flex items-center gap-4">
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${targetPokemon.id}.png`}
              alt={targetPokemon.name}
              className="w-20 h-20 object-contain drop-shadow"
            />
            <div className="flex flex-col text-left">
              <span className={`text-xs font-display font-extrabold uppercase tracking-wider ${isWon ? "text-emerald-400" : "text-rose-500"}`}>
                {isWon ? "Caught It in " + guesses.length + "/6 Guesses" : "Out of Poké Balls"}
              </span>
              <h2 className="text-2xl font-display font-black text-theme-primary capitalize">
                {targetPokemon.displayName || targetPokemon.name}
              </h2>
              <div className="flex gap-1 mt-1">
                {getTypes(targetPokemon).map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyShareText}
              className="px-5 py-2.5 bg-theme-accent text-white font-display font-bold text-xs sm:text-sm rounded-xl hover:bg-theme-accent/90 shadow-sm cursor-pointer"
            >
              {copiedShare ? "Copied to Clipboard" : "Share Score"}
            </button>
            {!isDaily && (
              <button
                type="button"
                onClick={initializeGame}
                className="px-5 py-2.5 bg-theme-bg hover:bg-theme-surface border border-theme font-display font-bold text-xs sm:text-sm text-theme-primary rounded-xl cursor-pointer"
              >
                Play Again
              </button>
            )}
            {onSelectPokemon && (
              <button
                type="button"
                onClick={() => onSelectPokemon(targetPokemon)}
                className="px-4 py-2.5 bg-theme-bg hover:bg-theme-surface border border-theme font-display text-xs text-theme-secondary rounded-xl cursor-pointer"
              >
                View Dex Card
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Guesses Feedback Table */}
      {guesses.length > 0 && (
        <div className="sm:hidden text-[10px] font-mono-tech text-theme-secondary/70 text-center pb-1 select-none">
          ← Swipe table for Height, Weight &amp; BST →
        </div>
      )}
      <div className="w-full overflow-x-auto scrollbar-none pb-2">
        {/* Table Header */}
        <div className="min-w-[620px] grid grid-cols-7 gap-2 pb-2 text-center text-[10px] font-mono-tech uppercase text-theme-secondary font-bold tracking-wider">
          <div>Pokémon</div>
          <div>Gen</div>
          <div>Type 1</div>
          <div>Type 2</div>
          <div>Height</div>
          <div>Weight</div>
          <div>BST</div>
        </div>

        {/* Guesses Rows */}
        <div className="min-w-[620px] flex flex-col gap-2">
          {guesses.map((g, idx) => (
            <motion.div
              key={g.id + "-" + idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="grid grid-cols-7 gap-2 text-center text-xs font-display"
            >
              {/* Pokémon Name & Sprite */}
              <div className="bg-theme-surface border border-theme rounded-xl p-2 flex items-center gap-1.5 justify-center">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${g.id}.png`}
                  alt={g.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="font-bold truncate text-[11px] capitalize">{g.displayName}</span>
              </div>

              {/* Gen */}
              <div className={`border rounded-xl p-2 flex items-center justify-center font-mono-tech font-bold ${renderCellClass(g.gen.match)}`}>
                Gen {g.gen.value} {g.gen.match === "higher" ? "↑" : g.gen.match === "lower" ? "↓" : ""}
              </div>

              {/* Type 1 */}
              <div className={`border rounded-xl p-2 flex items-center justify-center font-bold capitalize ${renderCellClass(g.type1.match)}`}>
                {g.type1.value}
              </div>

              {/* Type 2 */}
              <div className={`border rounded-xl p-2 flex items-center justify-center font-bold capitalize ${renderCellClass(g.type2.match)}`}>
                {g.type2.value}
              </div>

              {/* Height */}
              <div className={`border rounded-xl p-2 flex items-center justify-center font-mono-tech font-bold ${renderCellClass(g.height.match)}`}>
                {g.height.value} {g.height.match === "higher" ? "↑" : g.height.match === "lower" ? "↓" : ""}
              </div>

              {/* Weight */}
              <div className={`border rounded-xl p-2 flex items-center justify-center font-mono-tech font-bold ${renderCellClass(g.weight.match)}`}>
                {g.weight.value} {g.weight.match === "higher" ? "↑" : g.weight.match === "lower" ? "↓" : ""}
              </div>

              {/* BST */}
              <div className={`border rounded-xl p-2 flex items-center justify-center font-mono-tech font-bold ${renderCellClass(g.bst.match)}`}>
                {g.bst.value} {g.bst.match === "higher" ? "↑" : g.bst.match === "lower" ? "↓" : ""}
              </div>
            </motion.div>
          ))}

          {/* Empty Placeholders */}
          {Array.from({ length: Math.max(0, 6 - guesses.length) }).map((_, emptyIdx) => (
            <div
              key={"empty-" + emptyIdx}
              className="grid grid-cols-7 gap-2 text-center text-xs opacity-30 select-none"
            >
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div
                  key={"col-" + colIdx}
                  className="bg-theme-surface/50 border border-theme/60 rounded-xl h-11 flex items-center justify-center"
                >
                  -
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow Clues & Color Indicator Legend */}
      <div className="w-full bg-theme-surface border border-theme/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs text-xs font-display">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-mono-tech font-bold uppercase text-[9px] border border-indigo-500/30">
            Clue Legend
          </span>
          <span className="text-theme-primary font-bold">What the arrow and color cues mean:</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap text-xs text-theme-secondary">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-sky-600/80 text-white font-mono-tech font-bold text-[10px]">↑ Higher</span>
            <span>Mystery Pokémon has a <strong>higher</strong> value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-sky-600/80 text-white font-mono-tech font-bold text-[10px]">↓ Lower</span>
            <span>Mystery Pokémon has a <strong>lower</strong> value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-emerald-400 font-semibold">Match (within 15%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-400 font-semibold">Type Swap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
