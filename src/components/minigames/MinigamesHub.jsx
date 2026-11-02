import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SilhouetteGame from "./SilhouetteGame";
import DexdleGame from "./DexdleGame";
import DamageDuelGame from "./DamageDuelGame";

const ARCADE_GAMES = [
  {
    id: "silhouette",
    title: "Who's That Pokémon?",
    subtitle: "Audio cries, mystery silhouettes & classic anime nostalgia",
    badge: "Fan Favorite",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    renderIcon: () => (
      <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "dexdle",
    title: "Dexdle",
    subtitle: "Daily & Unlimited 6-guess Poké-Wordle deductive puzzle",
    badge: "Daily Challenge",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    renderIcon: () => (
      <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "damage-duel",
    title: "Damage Duel: Is the Calc Right?",
    subtitle: "Test your battle IQ against real competitive EV, weather & terrain scenarios",
    badge: "Competitive",
    color: "from-rose-500/20 to-purple-500/10 border-rose-500/30",
    renderIcon: () => (
      <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
        <path d="m13 19 6 2 2-6-2-2-6 6Z" />
        <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
        <path d="m11 19-6 2-2-6 2-2 6 6Z" />
      </svg>
    ),
  },
];

export default function MinigamesHub({ pokemonList = [], onSelectPokemon }) {
  const [activeGame, setActiveGame] = useState(null);

  // Retrieve cached records
  const silhouetteBest = (() => {
    try {
      return parseInt(localStorage.getItem("pokedex_silhouette_best") || "0", 10);
    } catch (e) {
      return 0;
    }
  })();

  const dexdleStats = (() => {
    try {
      const saved = localStorage.getItem("pokedex_dexdle_stats_v1");
      return saved ? JSON.parse(saved) : { wins: 0, streak: 0 };
    } catch (e) {
      return { wins: 0, streak: 0 };
    }
  })();

  const damageDuelBest = (() => {
    try {
      return parseInt(localStorage.getItem("pokedex_damage_duel_best") || "0", 10);
    } catch (e) {
      return 0;
    }
  })();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 flex flex-col gap-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {activeGame ? (
            <button
              type="button"
              onClick={() => setActiveGame(null)}
              className="px-3 py-1.5 bg-theme-surface hover:bg-theme-surface-hover border border-theme rounded-xl text-xs font-display font-bold text-theme-primary flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>←</span>
              <span>All Minigames</span>
            </button>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-theme-primary flex items-center gap-2.5">
                <svg className="w-7 h-7 text-theme-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <line x1="15" y1="13" x2="15.01" y2="13" />
                  <line x1="18" y1="11" x2="18.01" y2="11" />
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                </svg>
                <span>PokéArcade</span>
              </h1>
              <p className="text-xs font-display text-theme-secondary mt-0.5">
                Challenge your Pokémon knowledge with daily deductive puzzles, silhouettes, and competitive battle quizzes.
              </p>
            </div>
          )}
        </div>

        {activeGame && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-display text-theme-secondary">Now Playing:</span>
            <span className="px-2.5 py-1 bg-theme-accent text-white font-display font-extrabold text-xs rounded-xl shadow-xs">
              {ARCADE_GAMES.find((g) => g.id === activeGame)?.title}
            </span>
          </div>
        )}
      </div>

      {/* Main View Router */}
      <AnimatePresence mode="wait">
        {!activeGame ? (
          /* Game Cards Selection Hub */
          <motion.div
            key="hub-selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {ARCADE_GAMES.map((game) => (
              <div
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className={`bg-theme-surface hover:bg-theme-surface-hover border rounded-3xl p-6 shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-xl ${game.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-theme-bg/60 border border-theme/40 shadow-xs group-hover:scale-110 transition-transform flex items-center justify-center">
                      {game.renderIcon()}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono-tech font-bold uppercase tracking-wider bg-theme-bg/80 text-theme-primary border border-theme">
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-black text-theme-primary group-hover:text-theme-accent transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs font-display text-theme-secondary mt-2 leading-relaxed">
                    {game.subtitle}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-theme/40 flex items-center justify-between">
                  <div className="text-[11px] font-mono-tech text-theme-secondary">
                    {game.id === "silhouette" && `Best Streak: ${silhouetteBest}`}
                    {game.id === "dexdle" && `Wins: ${dexdleStats.wins} | Streak: ${dexdleStats.streak}`}
                    {game.id === "damage-duel" && `Best Streak: ${damageDuelBest}`}
                  </div>
                  <span className="text-xs font-display font-extrabold text-theme-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Play Now →
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          /* Active Minigame Mount */
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {activeGame === "silhouette" && (
              <SilhouetteGame pokemonList={pokemonList} onSelectPokemon={onSelectPokemon} />
            )}
            {activeGame === "dexdle" && (
              <DexdleGame pokemonList={pokemonList} onSelectPokemon={onSelectPokemon} />
            )}
            {activeGame === "damage-duel" && (
              <DamageDuelGame onSelectPokemon={onSelectPokemon} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
