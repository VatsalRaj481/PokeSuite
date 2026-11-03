import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NATURE_STATS, NATURE_MATRIX } from "../utils/calcData.js";

export default function NatureChartModal({ isOpen, onClose, onSelectNature, selectedNature }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatFilter, setActiveStatFilter] = useState("all");
  const [hoveredNature, setHoveredNature] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Current inspected nature details
  const inspectedNature = hoveredNature || (selectedNature ? NATURE_MATRIX.flat().find((n) => n.name.toLowerCase() === selectedNature.toLowerCase()) : null) || NATURE_MATRIX[0][2]; // Default Adamant

  // Highlight matches from search query or filter
  const isHighlighted = (cell) => {
    if (!cell) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      if (cell.name.toLowerCase().includes(q)) return true;
      if (cell.plusLabel.toLowerCase().includes(q)) return true;
      if (cell.minusLabel.toLowerCase().includes(q)) return true;
      if (cell.flavorPlus && cell.flavorPlus.toLowerCase().includes(q)) return true;
      if (cell.flavorMinus && cell.flavorMinus.toLowerCase().includes(q)) return true;
      return false;
    }
    if (activeStatFilter === "all") return false;
    if (activeStatFilter === "neutral") return cell.isNeutral;
    return cell.plusKey === activeStatFilter || cell.minusKey === activeStatFilter;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md">
          {/* Backdrop click */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-theme-surface border border-theme rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col p-5 sm:p-6 shadow-2xl overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-theme/50">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono-tech text-[10px] font-bold uppercase tracking-wider">
                    Competitive Reference
                  </span>
                  <span className="text-[10px] font-mono-tech text-theme-secondary">
                    25 Canonical Natures
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-theme-primary mt-1">
                  Pokémon Nature Stat Chart
                </h2>
                <p className="text-xs text-theme-secondary font-display mt-0.5">
                  Rows boost the stat by +10%; columns hinder the stat by -10%. The diagonal contains the 5 Neutral natures.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-theme-surface hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary flex items-center justify-center border border-theme cursor-pointer transition-colors flex-shrink-0"
                title="Close Nature Chart (Esc)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Filter & Search Bar */}
            <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              {/* Quick Stat Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveStatFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold cursor-pointer transition-colors ${
                    activeStatFilter === "all" ? "bg-theme-accent text-white" : "bg-theme-bg text-theme-secondary hover:text-theme-primary border border-theme"
                  }`}
                >
                  All (25)
                </button>
                {NATURE_STATS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActiveStatFilter(s.key)}
                    className={`px-2 py-1 rounded-lg text-xs font-display font-bold cursor-pointer transition-colors border ${
                      activeStatFilter === s.key ? "bg-indigo-600 text-white border-indigo-500" : "bg-theme-bg text-theme-secondary hover:text-theme-primary border-theme"
                    }`}
                  >
                    {s.short}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setActiveStatFilter("neutral")}
                  className={`px-2 py-1 rounded-lg text-xs font-display font-bold cursor-pointer transition-colors border ${
                    activeStatFilter === "neutral" ? "bg-amber-600 text-white border-amber-500" : "bg-theme-bg text-theme-secondary hover:text-theme-primary border-theme"
                  }`}
                >
                  Neutral (5)
                </button>
              </div>

              {/* Search box */}
              <div className="w-full sm:w-60 relative">
                <input
                  type="text"
                  placeholder="Filter nature or flavor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 bg-theme-bg border border-theme rounded-xl text-xs font-display text-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-accent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme-primary text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Matrix View & Info Pane */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="w-full overflow-x-auto pb-2">
                <table className="w-full min-w-[580px] border-collapse text-left">
                  <thead>
                    <tr>
                      {/* Top-Left Axis Label */}
                      <th className="p-2 border border-theme/60 bg-theme-bg/60 text-[10px] font-mono-tech text-theme-secondary font-bold uppercase w-28">
                        <div>+10% Row ↓</div>
                        <div>-10% Col →</div>
                      </th>
                      {/* Decreased Stat Column Headers (-10%) */}
                      {NATURE_STATS.map((stat) => (
                        <th
                          key={stat.key}
                          className="p-2 border border-theme/60 bg-theme-bg/90 text-center"
                        >
                          <div className="text-xs font-display font-black text-rose-400">
                            -{stat.short}
                          </div>
                          <div className="text-[9px] font-mono-tech text-theme-secondary font-normal uppercase">
                            Dislikes {stat.flavor}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {NATURE_STATS.map((rowStat, rowIdx) => (
                      <tr key={rowStat.key}>
                        {/* Increased Stat Row Header (+10%) */}
                        <th className="p-2.5 border border-theme/60 bg-theme-bg/90 align-middle">
                          <div className="text-xs font-display font-black text-emerald-400">
                            +{rowStat.short}
                          </div>
                          <div className="text-[9px] font-mono-tech text-theme-secondary font-normal uppercase">
                            Likes {rowStat.flavor}
                          </div>
                        </th>

                        {/* 5 Nature Cells */}
                        {NATURE_MATRIX[rowIdx].map((cell) => {
                          const isSel = selectedNature && cell.name.toLowerCase() === selectedNature.toLowerCase();
                          const isHov = hoveredNature && hoveredNature.name === cell.name;
                          const isHigh = isHighlighted(cell);

                          return (
                            <td
                              key={cell.name}
                              onMouseEnter={() => setHoveredNature(cell)}
                              onClick={() => {
                                setHoveredNature(cell);
                                if (onSelectNature) {
                                  onSelectNature(cell.name);
                                }
                              }}
                              className={`p-2 border border-theme/50 transition-all duration-150 cursor-pointer select-none text-center ${
                                cell.isNeutral
                                  ? "bg-slate-800/40 hover:bg-slate-700/50"
                                  : "bg-theme-surface hover:bg-theme-surface-hover"
                              } ${
                                isSel
                                  ? "ring-2 ring-indigo-500 bg-indigo-500/20 shadow-md"
                                  : isHov
                                  ? "ring-1 ring-theme-accent bg-theme-surface-hover"
                                  : ""
                              } ${
                                isHigh
                                  ? "ring-2 ring-emerald-400 bg-emerald-500/15"
                                  : ""
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center gap-0.5">
                                <span className={`text-xs font-display font-bold capitalize ${
                                  cell.isNeutral ? "text-amber-300 font-extrabold" : "text-theme-primary"
                                }`}>
                                  {cell.name}
                                </span>
                                {cell.isNeutral ? (
                                  <span className="text-[9px] font-mono-tech px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                                    Neutral
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono-tech text-theme-secondary">
                                    +{cell.plusShort} / -{cell.minusShort}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inspected Nature Card Banner */}
              {inspectedNature && (
                <div className="p-4 bg-theme-bg/80 border border-theme rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center font-display font-black text-xl text-indigo-400">
                      {inspectedNature.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-display font-black text-theme-primary capitalize">
                          {inspectedNature.name} Nature
                        </h3>
                        {inspectedNature.isNeutral ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Neutral (No Net Stat Modifiers)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {inspectedNature.name} Mint
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs font-display flex-wrap">
                        {inspectedNature.isNeutral ? (
                          <span className="text-theme-secondary">
                            Leaves all stats at standard 1.0× multiplier. Likes all berry flavors equally.
                          </span>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                              +10% {inspectedNature.plusLabel} (Likes {inspectedNature.flavorPlus})
                            </span>
                            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                              -10% {inspectedNature.minusLabel} (Dislikes {inspectedNature.flavorMinus})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {onSelectNature && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectNature(inspectedNature.name);
                        onClose();
                      }}
                      className="px-4 py-2 bg-theme-accent hover:bg-theme-accent-hover text-white font-display font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex-shrink-0"
                    >
                      Apply {inspectedNature.name}
                    </button>
                  )}
                </div>
              )}

              {/* Flavor to Stat Legend */}
              <div className="p-3 bg-theme-surface border border-theme/60 rounded-xl flex items-center justify-between flex-wrap gap-2 text-[10px] font-display text-theme-secondary">
                <div className="font-bold uppercase tracking-wider text-theme-primary">
                  Flavor Synergies (Gen 3 - Gen 9):
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span><strong className="text-amber-400">Spicy</strong> = Attack</span>
                  <span><strong className="text-blue-400">Sour</strong> = Defense</span>
                  <span><strong className="text-cyan-400">Dry</strong> = Sp. Atk</span>
                  <span><strong className="text-emerald-400">Bitter</strong> = Sp. Def</span>
                  <span><strong className="text-pink-400">Sweet</strong> = Speed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
