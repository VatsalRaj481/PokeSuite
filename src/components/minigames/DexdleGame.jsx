import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";

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
  const [copiedShare, setCopiedShare] = useState(false);

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

  // Pick target Pokémon
  const initializeGame = React.useCallback(() => {
    if (!pokemonList || pokemonList.length === 0) return;
    setGuesses([]);
    setIsWon(false);
    setIsGameOver(false);
    setSearchQuery("");

    if (isDaily) {
      const rng = seedRandom(todaySeed);
      const idx = Math.floor(rng() * Math.min(pokemonList.length, 1025));
      setTargetPokemon(pokemonList[idx]);
    } else {
      const idx = Math.floor(Math.random() * Math.min(pokemonList.length, 1025));
      setTargetPokemon(pokemonList[idx]);
    }
  }, [pokemonList, isDaily, todaySeed]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !pokemonList) return [];
    const q = searchQuery.toLowerCase().trim();
    const alreadyGuessed = new Set(guesses.map((g) => g.name.toLowerCase()));
    return pokemonList
      .filter((p) => p.name.toLowerCase().includes(q) && !alreadyGuessed.has(p.name.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery, pokemonList, guesses]);

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
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Guess ${guesses.length + 1} of 6: Type Pokémon name...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="flex-1 px-4 py-3 bg-theme-surface border border-theme rounded-2xl text-sm font-display text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent shadow-sm"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-theme-surface border border-theme rounded-2xl shadow-xl z-30 overflow-hidden">
              {suggestions.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleMakeGuess(p)}
                  className="w-full px-4 py-2.5 hover:bg-theme-surface-hover flex items-center justify-between text-left text-xs font-display text-theme-primary border-b border-theme/50 last:border-b-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt={p.name}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold capitalize">{p.displayName || p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-theme-secondary">
                    Gen {getGenFromId(p.id)}
                  </span>
                </button>
              ))}
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
      <div className="w-full overflow-x-auto">
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
    </div>
  );
}
