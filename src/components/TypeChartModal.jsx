import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypeBadge from "./TypeBadge";
import { getTypeMultiplier } from "../utils/damageCalc";
import { TYPE_ICONS, TYPE_COLORS } from "../utils/typeVectorData";

export const CANONICAL_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "steel",
  "dark",
  "fairy",
];

export default function TypeChartModal({ isOpen, onClose, initialType = null }) {
  const [activeTab, setActiveTab] = useState("matrix"); // 'matrix' | 'dual' | 'deep-dive'
  const [hoveredAttacker, setHoveredAttacker] = useState(null);
  const [hoveredDefender, setHoveredDefender] = useState(null);
  const [selectedHighlightType, setSelectedHighlightType] = useState(initialType);

  // Dual Type Sandbox state
  const [dualType1, setDualType1] = useState(initialType || "water");
  const [dualType2, setDualType2] = useState("ground");

  // Single Type Deep Dive state
  const [deepDiveType, setDeepDiveType] = useState(initialType || "fire");

  // Sync initial type when opened
  useEffect(() => {
    if (initialType && CANONICAL_TYPES.includes(initialType.toLowerCase())) {
      setSelectedHighlightType(initialType.toLowerCase());
      setDeepDiveType(initialType.toLowerCase());
      setDualType1(initialType.toLowerCase());
    }
  }, [initialType, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Precompute full 18x18 multiplier matrix for fast rendering
  const matrixData = useMemo(() => {
    const data = {};
    CANONICAL_TYPES.forEach((atk) => {
      data[atk] = {};
      CANONICAL_TYPES.forEach((def) => {
        data[atk][def] = getTypeMultiplier(atk, [def]);
      });
    });
    return data;
  }, []);

  // Compute dual-type defensive breakdown
  const dualDefenses = useMemo(() => {
    const defTypes = [dualType1, dualType2].filter(Boolean);
    const groups = {
      4: [],
      2: [],
      1: [],
      0.5: [],
      0.25: [],
      0: [],
    };

    CANONICAL_TYPES.forEach((atk) => {
      const mult = getTypeMultiplier(atk, defTypes);
      if (mult === 4) groups[4].push(atk);
      else if (mult === 2) groups[2].push(atk);
      else if (mult === 0.5) groups[0.5].push(atk);
      else if (mult === 0.25) groups[0.25].push(atk);
      else if (mult === 0) groups[0].push(atk);
      else groups[1].push(atk);
    });

    return groups;
  }, [dualType1, dualType2]);

  // Compute single-type deep dive data
  const singleTypeAnalysis = useMemo(() => {
    const target = deepDiveType;
    if (!target) return null;

    const offensive = {
      superEffective: [], // 2x
      notVeryEffective: [], // 0.5x
      noEffect: [], // 0x
      neutral: [],
    };

    const defensive = {
      weaknesses: [], // takes 2x
      resistances: [], // takes 0.5x
      immunities: [], // takes 0x
      neutral: [],
    };

    CANONICAL_TYPES.forEach((other) => {
      // Offensive: Target attacks Other
      const offMult = matrixData[target]?.[other] ?? 1;
      if (offMult === 2) offensive.superEffective.push(other);
      else if (offMult === 0.5) offensive.notVeryEffective.push(other);
      else if (offMult === 0) offensive.noEffect.push(other);
      else offensive.neutral.push(other);

      // Defensive: Other attacks Target
      const defMult = matrixData[other]?.[target] ?? 1;
      if (defMult === 2) defensive.weaknesses.push(other);
      else if (defMult === 0.5) defensive.resistances.push(other);
      else if (defMult === 0) defensive.immunities.push(other);
      else defensive.neutral.push(other);
    });

    return { offensive, defensive };
  }, [deepDiveType, matrixData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-theme-surface border border-theme rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col p-4 sm:p-6 shadow-2xl overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-theme/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <path d="M12 12 2 12" />
                  <path d="m12 12 7.07-7.07" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-display font-black text-theme-primary tracking-tight">
                    Pokémon Type Effectiveness Chart
                  </h2>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-mono-tech text-[10px] font-bold uppercase tracking-wider">
                    Gen 9 Canonical
                  </span>
                </div>
                <p className="text-xs font-display text-theme-secondary mt-0.5">
                  Interactive 18×18 matchup matrix, dual-type defensive calculator & single-type deep-dive.
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-2xl bg-theme-bg hover:bg-theme-surface-hover text-theme-secondary hover:text-theme-primary border border-theme transition-all cursor-pointer flex-shrink-0"
              aria-label="Close Type Chart"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-3 pb-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-theme-bg rounded-xl border border-theme">
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                  activeTab === "matrix"
                    ? "bg-theme-accent text-white shadow-xs"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                18×18 Matchup Matrix
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                  activeTab === "dual"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                Dual-Type Calculator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("deep-dive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                  activeTab === "deep-dive"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                Single-Type Profile
              </button>
            </div>

            {/* Quick Legend / Key */}
            <div className="flex items-center gap-2 text-[11px] font-mono-tech text-theme-secondary">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>Super Effective (2×)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-[10px]">
                  ½
                </span>
                <span>Resisted (½×)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-slate-900 text-slate-400 border border-slate-700 flex items-center justify-center font-bold text-[10px]">
                  0
                </span>
                <span>Immune (0×)</span>
              </span>
            </div>
          </div>

          {/* Tab 1: 18x18 Matchup Matrix */}
          {activeTab === "matrix" && (
            <div className="flex-1 min-h-0 flex flex-col gap-3 pt-2 overflow-hidden">
              {/* Dynamic Crosshair Intel Bar */}
              <div className="p-2.5 rounded-xl bg-theme-bg border border-theme flex items-center justify-between flex-wrap gap-2 text-xs font-display flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-theme-secondary uppercase font-mono-tech text-[10px]">Crosshair Intel:</span>
                  {hoveredAttacker && hoveredDefender ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-theme-primary capitalize">{hoveredAttacker}</span>
                      <span className="text-theme-secondary">attacking</span>
                      <span className="font-bold text-theme-primary capitalize">{hoveredDefender}</span>
                      <span className="text-theme-secondary">→</span>
                      {(() => {
                        const m = matrixData[hoveredAttacker]?.[hoveredDefender];
                        if (m === 2)
                          return (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono-tech font-bold">
                              2× Super Effective
                            </span>
                          );
                        if (m === 0.5)
                          return (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono-tech font-bold">
                              ½× Not Very Effective
                            </span>
                          );
                        if (m === 0)
                          return (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono-tech font-bold">
                              0× No Effect (Immune)
                            </span>
                          );
                        return (
                          <span className="px-2 py-0.5 rounded bg-theme-surface text-theme-secondary border border-theme font-mono-tech font-bold">
                            1× Neutral Damage
                          </span>
                        );
                      })()}
                    </div>
                  ) : selectedHighlightType ? (
                    <div className="flex items-center gap-2">
                      <span className="text-theme-secondary">Focused Type:</span>
                      <TypeBadge type={selectedHighlightType} size="xs" />
                      <button
                        type="button"
                        onClick={() => setSelectedHighlightType(null)}
                        className="text-[10px] text-theme-accent hover:underline cursor-pointer"
                      >
                        (Clear Focus)
                      </button>
                    </div>
                  ) : (
                    <span className="text-theme-secondary italic">
                      Hover over any cell or click any type header to lock crosshairs.
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-theme-secondary font-mono-tech hidden sm:block">
                  Rows = Attacker (Move) | Columns = Defender (Pokémon)
                </div>
              </div>

              {/* Scrollable Matrix Table */}
              <div className="flex-1 overflow-auto border border-theme rounded-2xl bg-theme-bg shadow-inner relative scrollbar-thin">
                <table className="w-full border-collapse text-center select-none">
                  {/* Table Head: Defending Types */}
                  <thead className="sticky top-0 z-20 bg-theme-surface shadow-xs border-b border-theme">
                    <tr>
                      <th className="sticky left-0 z-30 bg-theme-surface border-r border-theme p-2 min-w-[72px] text-[10px] font-mono-tech uppercase font-bold text-theme-secondary">
                        <div className="flex flex-col items-center">
                          <span className="text-theme-accent text-[9px]">DEF →</span>
                          <span className="text-indigo-400 text-[9px]">ATK ↓</span>
                        </div>
                      </th>
                      {CANONICAL_TYPES.map((defType) => {
                        const isColActive =
                          hoveredDefender === defType || selectedHighlightType === defType;
                        const icon = TYPE_ICONS[defType];
                        const colorData = TYPE_COLORS[defType];

                        return (
                          <th
                            key={defType}
                            onClick={() =>
                              setSelectedHighlightType((curr) => (curr === defType ? null : defType))
                            }
                            onMouseEnter={() => setHoveredDefender(defType)}
                            onMouseLeave={() => setHoveredDefender(null)}
                            className={`p-1.5 transition-colors cursor-pointer text-center min-w-[38px] max-w-[44px] ${
                              isColActive ? "bg-indigo-500/20" : "hover:bg-theme-surface-hover"
                            }`}
                            title={`Defending: ${defType.toUpperCase()}`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className="w-5 h-5 rounded-md flex items-center justify-center p-1 text-white shadow-xs"
                                style={{ backgroundColor: colorData?.bg || "#64748b" }}
                              >
                                {icon}
                              </span>
                              <span className="text-[8.5px] font-mono-tech uppercase font-bold text-theme-secondary tracking-tighter truncate w-full">
                                {defType.slice(0, 3)}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  {/* Table Body: Attacking Rows */}
                  <tbody>
                    {CANONICAL_TYPES.map((atkType) => {
                      const isRowActive =
                        hoveredAttacker === atkType || selectedHighlightType === atkType;
                      const icon = TYPE_ICONS[atkType];
                      const colorData = TYPE_COLORS[atkType];

                      return (
                        <tr
                          key={atkType}
                          className={`transition-colors border-b border-theme/40 ${
                            isRowActive ? "bg-indigo-500/10" : "hover:bg-theme-surface/50"
                          }`}
                        >
                          {/* Row Header: Attacking Type */}
                          <th
                            onClick={() =>
                              setSelectedHighlightType((curr) => (curr === atkType ? null : atkType))
                            }
                            onMouseEnter={() => setHoveredAttacker(atkType)}
                            onMouseLeave={() => setHoveredAttacker(null)}
                            className={`sticky left-0 z-10 bg-theme-surface border-r border-theme p-1.5 cursor-pointer text-left ${
                              isRowActive ? "bg-indigo-500/25" : ""
                            }`}
                            title={`Attacking: ${atkType.toUpperCase()}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-5 h-5 rounded-md flex items-center justify-center p-1 text-white shadow-xs flex-shrink-0"
                                style={{ backgroundColor: colorData?.bg || "#64748b" }}
                              >
                                {icon}
                              </span>
                              <span className="text-[9.5px] font-mono-tech uppercase font-bold text-theme-primary truncate">
                                {atkType.slice(0, 4)}
                              </span>
                            </div>
                          </th>

                          {/* 18 Multiplier Cells */}
                          {CANONICAL_TYPES.map((defType) => {
                            const mult = matrixData[atkType]?.[defType] ?? 1;
                            const isCellHighlighted =
                              (hoveredAttacker === atkType && hoveredDefender === defType) ||
                              selectedHighlightType === atkType ||
                              selectedHighlightType === defType;

                            let content = null;
                            let cellBg = "";

                            if (mult === 2) {
                              content = (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-emerald-500/20 text-emerald-400 font-mono-tech font-extrabold text-[10px] border border-emerald-500/40">
                                  2
                                </span>
                              );
                              cellBg = isCellHighlighted ? "bg-emerald-500/15" : "";
                            } else if (mult === 0.5) {
                              content = (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-amber-500/20 text-amber-400 font-mono-tech font-bold text-[9.5px] border border-amber-500/40">
                                  ½
                                </span>
                              );
                              cellBg = isCellHighlighted ? "bg-amber-500/15" : "";
                            } else if (mult === 0) {
                              content = (
                                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-slate-900 text-slate-400 font-mono-tech font-black text-[10px] border border-slate-700">
                                  0
                                </span>
                              );
                              cellBg = isCellHighlighted ? "bg-rose-500/10" : "";
                            } else {
                              // Neutral 1x - clean subtle dot to keep table readable
                              content = (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-theme-secondary/20" />
                              );
                            }

                            return (
                              <td
                                key={defType}
                                onMouseEnter={() => {
                                  setHoveredAttacker(atkType);
                                  setHoveredDefender(defType);
                                }}
                                onMouseLeave={() => {
                                  setHoveredAttacker(null);
                                  setHoveredDefender(null);
                                }}
                                className={`p-1 text-center transition-colors border-r border-theme/20 ${cellBg} ${
                                  hoveredDefender === defType ? "bg-indigo-500/10" : ""
                                }`}
                              >
                                {content}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Dual-Type Defense Calculator */}
          {activeTab === "dual" && (
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 pt-3 pr-1 scrollbar-thin">
              {/* Type Selectors Card */}
              <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <span className="text-xs font-mono-tech uppercase font-bold text-theme-secondary">
                    Select Defensive Typing
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary Type Dropdown */}
                    <select
                      value={dualType1}
                      onChange={(e) => setDualType1(e.target.value)}
                      className="px-3 py-2 bg-theme-surface border border-theme rounded-xl text-xs font-display font-bold text-theme-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {CANONICAL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t.toUpperCase()}
                        </option>
                      ))}
                    </select>

                    <span className="text-theme-secondary font-bold text-sm">+</span>

                    {/* Secondary Type Dropdown */}
                    <select
                      value={dualType2 || ""}
                      onChange={(e) => setDualType2(e.target.value || null)}
                      className="px-3 py-2 bg-theme-surface border border-theme rounded-xl text-xs font-display font-bold text-theme-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">(None - Pure Single Type)</option>
                      {CANONICAL_TYPES.filter((t) => t !== dualType1).map((t) => (
                        <option key={t} value={t}>
                          {t.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Compound Result Hero Badges */}
                <div className="flex items-center gap-2 bg-theme-surface/80 p-3 rounded-2xl border border-theme">
                  <span className="text-xs font-display text-theme-secondary">Defender Profile:</span>
                  <TypeBadge type={dualType1} size="md" />
                  {dualType2 && <TypeBadge type={dualType2} size="md" />}
                </div>
              </div>

              {/* Multiplier Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 4x Extreme Weaknesses */}
                {dualDefenses[4].length > 0 && (
                  <div className="bg-theme-bg border border-rose-500/40 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Extreme Weakness (4×)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-rose-500/20 text-rose-300">
                        {dualDefenses[4].length} Types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dualDefenses[4].map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2x Weaknesses */}
                <div className="bg-theme-bg border border-orange-500/40 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      Weaknesses (2×)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-orange-500/20 text-orange-300">
                      {dualDefenses[2].length} Types
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dualDefenses[2].length > 0 ? (
                      dualDefenses[2].map((t) => <TypeBadge key={t} type={t} size="sm" />)
                    ) : (
                      <span className="text-xs text-theme-secondary italic">No 2× weaknesses</span>
                    )}
                  </div>
                </div>

                {/* 0.5x Resistances */}
                <div className="bg-theme-bg border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Resistances (½×)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-emerald-500/20 text-emerald-300">
                      {dualDefenses[0.5].length} Types
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dualDefenses[0.5].length > 0 ? (
                      dualDefenses[0.5].map((t) => <TypeBadge key={t} type={t} size="sm" />)
                    ) : (
                      <span className="text-xs text-theme-secondary italic">No ½× resistances</span>
                    )}
                  </div>
                </div>

                {/* 0.25x Extreme Resistances */}
                {dualDefenses[0.25].length > 0 && (
                  <div className="bg-theme-bg border border-teal-500/40 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        Extreme Resistance (¼×)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-teal-500/20 text-teal-300">
                        {dualDefenses[0.25].length} Types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dualDefenses[0.25].map((t) => (
                        <TypeBadge key={t} type={t} size="sm" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 0x Immunities */}
                <div className="bg-theme-bg border border-indigo-500/40 rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Immunities (0×)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-indigo-500/20 text-indigo-300">
                      {dualDefenses[0].length} Types
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dualDefenses[0].length > 0 ? (
                      dualDefenses[0].map((t) => <TypeBadge key={t} type={t} size="sm" />)
                    ) : (
                      <span className="text-xs text-theme-secondary italic">No immunities</span>
                    )}
                  </div>
                </div>

                {/* 1x Neutral */}
                <div className="bg-theme-bg border border-theme rounded-2xl p-4 flex flex-col gap-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-bold text-theme-secondary uppercase tracking-wider">
                      Neutral Damage (1×)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold bg-theme-surface text-theme-secondary">
                      {dualDefenses[1].length} Types
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dualDefenses[1].map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Single-Type Deep-Dive Profile */}
          {activeTab === "deep-dive" && singleTypeAnalysis && (
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 pt-3 pr-1 scrollbar-thin">
              {/* Type Switcher Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
                {CANONICAL_TYPES.map((t) => {
                  const isActive = deepDiveType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDeepDiveType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer flex-shrink-0 capitalize ${
                        isActive
                          ? "bg-theme-accent text-white shadow-sm scale-105"
                          : "bg-theme-bg hover:bg-theme-surface-hover text-theme-secondary border border-theme"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Hero Banner for Selected Type */}
              <div className="bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <TypeBadge type={deepDiveType} size="lg" />
                  <div>
                    <h3 className="text-lg font-display font-black text-theme-primary capitalize">
                      {deepDiveType} Type Dossier
                    </h3>
                    <p className="text-xs font-display text-theme-secondary">
                      Comprehensive offensive damage coverage and defensive vulnerability analysis.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono-tech text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                    Deals 2× to {singleTypeAnalysis.offensive.superEffective.length} Types
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">
                    Weak to {singleTypeAnalysis.defensive.weaknesses.length} Types
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Offense vs Defense */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column: Offensive Potential (When attacking) */}
                <div className="bg-theme-bg border border-theme rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-theme pb-3">
                    <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
                        <line x1="13" y1="19" x2="19" y2="13" />
                        <line x1="16" y1="16" x2="20" y2="20" />
                        <line x1="19" y1="21" x2="21" y2="19" />
                      </svg>
                    </span>
                    <h4 className="text-sm font-display font-extrabold text-theme-primary uppercase tracking-wider">
                      Offensive Effectiveness
                    </h4>
                  </div>

                  {/* Super Effective (2x) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-wider">
                      Deals 2× Damage To ({singleTypeAnalysis.offensive.superEffective.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {singleTypeAnalysis.offensive.superEffective.length > 0 ? (
                        singleTypeAnalysis.offensive.superEffective.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))
                      ) : (
                        <span className="text-xs text-theme-secondary italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* Not Very Effective (0.5x) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-display font-bold text-amber-400 uppercase tracking-wider">
                      Deals ½× Damage To ({singleTypeAnalysis.offensive.notVeryEffective.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {singleTypeAnalysis.offensive.notVeryEffective.length > 0 ? (
                        singleTypeAnalysis.offensive.notVeryEffective.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))
                      ) : (
                        <span className="text-xs text-theme-secondary italic">None</span>
                      )}
                    </div>
                  </div>

                  {/* No Effect (0x) */}
                  {singleTypeAnalysis.offensive.noEffect.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-display font-bold text-slate-400 uppercase tracking-wider">
                        Deals 0× Damage To ({singleTypeAnalysis.offensive.noEffect.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {singleTypeAnalysis.offensive.noEffect.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Defensive Resilience (When being attacked) */}
                <div className="bg-theme-bg border border-theme rounded-2xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-theme pb-3">
                    <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                    <h4 className="text-sm font-display font-extrabold text-theme-primary uppercase tracking-wider">
                      Defensive Resilience
                    </h4>
                  </div>

                  {/* Weaknesses (Takes 2x) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-display font-bold text-rose-400 uppercase tracking-wider">
                      Takes 2× Damage From ({singleTypeAnalysis.defensive.weaknesses.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {singleTypeAnalysis.defensive.weaknesses.length > 0 ? (
                        singleTypeAnalysis.defensive.weaknesses.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))
                      ) : (
                        <span className="text-xs text-theme-secondary italic">No weaknesses</span>
                      )}
                    </div>
                  </div>

                  {/* Resistances (Takes 0.5x) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-display font-bold text-emerald-400 uppercase tracking-wider">
                      Takes ½× Damage From ({singleTypeAnalysis.defensive.resistances.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {singleTypeAnalysis.defensive.resistances.length > 0 ? (
                        singleTypeAnalysis.defensive.resistances.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))
                      ) : (
                        <span className="text-xs text-theme-secondary italic">No resistances</span>
                      )}
                    </div>
                  </div>

                  {/* Immunities (Takes 0x) */}
                  {singleTypeAnalysis.defensive.immunities.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-display font-bold text-indigo-400 uppercase tracking-wider">
                        Takes 0× Damage From (Immune) ({singleTypeAnalysis.defensive.immunities.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {singleTypeAnalysis.defensive.immunities.map((t) => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
