import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "../../utils/confetti";
import TypeBadge from "../TypeBadge";
import { calculateDamage } from "../../utils/damageCalc.js";
import { BATTLE_QUIZ_SCENARIOS, generateProceduralScenario } from "../../utils/calcData.js";

const RANKS = [
  { minStreak: 0, title: "Bug Catcher" },
  { minStreak: 3, title: "Ace Trainer" },
  { minStreak: 6, title: "Gym Leader" },
  { minStreak: 9, title: "Elite Four" },
  { minStreak: 12, title: "VGC World Champion" },
];

export default function DamageDuelGame({ onSelectPokemon }) {
  const [gameMode, setGameMode] = useState("infinite"); // 'infinite' | 'curated'
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [proceduralScenario, setProceduralScenario] = useState(() => generateProceduralScenario(calculateDamage));
  const [roundNumber, setRoundNumber] = useState(1);
  const [quizMode, setQuizMode] = useState("ko"); // 'ko' | 'bracket'
  const [userAnswer, setUserAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("pokedex_damage_duel_best") || "0", 10);
    } catch (e) {
      return 0;
    }
  });

  const scenario = gameMode === "infinite"
    ? proceduralScenario
    : BATTLE_QUIZ_SCENARIOS[currentScenarioIndex % BATTLE_QUIZ_SCENARIOS.length];

  // Calculate actual damage numbers
  const calcResult = useMemo(() => {
    if (!scenario) return null;
    return calculateDamage({
      attacker: scenario.attacker,
      defender: scenario.defender,
      move: scenario.move,
      field: scenario.field || {},
      isCrit: false,
    });
  }, [scenario]);

  // Determine correct answer for 'ko' mode
  const correctKoAnswer = useMemo(() => {
    if (!calcResult) return "survive";
    if (calcResult.minPercent >= 100) return "guaranteed_ohko";
    if (calcResult.maxPercent >= 100) return "roll_ohko";
    return "guaranteed_survive";
  }, [calcResult]);

  // Generate 4 brackets for 'bracket' mode
  const bracketOptions = useMemo(() => {
    if (!calcResult) return [];
    const actualMin = calcResult.minPercent;
    const actualMax = calcResult.maxPercent;

    const correct = {
      label: `${actualMin}% - ${actualMax}%`,
      isCorrect: true,
    };

    // 3 reasonable decoys offset by -35%, +35%, +75%
    const d1Min = Math.max(5, (actualMin * 0.55).toFixed(1));
    const d1Max = (actualMax * 0.55).toFixed(1);

    const d2Min = (actualMin * 1.45).toFixed(1);
    const d2Max = (actualMax * 1.45).toFixed(1);

    const d3Min = (actualMin * 1.9).toFixed(1);
    const d3Max = (actualMax * 1.9).toFixed(1);

    const list = [
      correct,
      { label: `${d1Min}% - ${d1Max}%`, isCorrect: false },
      { label: `${d2Min}% - ${d2Max}%`, isCorrect: false },
      { label: `${d3Min}% - ${d3Max}%`, isCorrect: false },
    ];

    return list.sort(() => Math.random() - 0.5);
  }, [calcResult]);

  const handleAnswer = (answerKey) => {
    if (isAnswered) return;
    setUserAnswer(answerKey);
    setIsAnswered(true);

    let isCorrect = false;
    if (quizMode === "ko") {
      isCorrect = answerKey === correctKoAnswer;
    } else {
      isCorrect = answerKey === true; // isCorrect boolean
    }

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
        try {
          localStorage.setItem("pokedex_damage_duel_best", String(nextStreak));
        } catch (e) {}
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    setIsAnswered(false);
    setUserAnswer(null);
    if (gameMode === "infinite") {
      setProceduralScenario(generateProceduralScenario(calculateDamage));
      setRoundNumber((prev) => prev + 1);
    } else {
      setCurrentScenarioIndex((prev) => prev + 1);
    }
  };

  const handleSwitchGameMode = (newMode) => {
    if (newMode === gameMode) return;
    setGameMode(newMode);
    setIsAnswered(false);
    setUserAnswer(null);
    if (newMode === "infinite" && !proceduralScenario) {
      setProceduralScenario(generateProceduralScenario(calculateDamage));
    }
  };

  const currentRank = [...RANKS].reverse().find((r) => streak >= r.minStreak) || RANKS[0];

  const getSpriteUrl = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6">
      {/* Top HUD: Streak, Rank, Mode Switchers */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-theme-surface border border-theme rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <div className="px-3 py-1.5 bg-theme-accent/15 border border-theme-accent rounded-xl text-theme-accent font-display font-extrabold text-xs flex items-center gap-1.5">
            <span>{currentRank.title}</span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-theme-accent text-white text-[10px]">
              Streak: {streak}
            </span>
          </div>
          <div className="text-theme-secondary font-display text-xs">
            Best Streak: <span className="font-bold text-theme-primary">{bestStreak}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Game Mode: Infinite vs Curated */}
          <div className="flex border border-theme rounded-xl overflow-hidden p-0.5 bg-theme-bg">
            <button
              type="button"
              onClick={() => handleSwitchGameMode("infinite")}
              className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-colors cursor-pointer ${
                gameMode === "infinite"
                  ? "bg-theme-accent text-white shadow-sm"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Infinite
            </button>
            <button
              type="button"
              onClick={() => handleSwitchGameMode("curated")}
              className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-colors cursor-pointer ${
                gameMode === "curated"
                  ? "bg-theme-accent text-white shadow-sm"
                  : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Classics ({BATTLE_QUIZ_SCENARIOS.length})
            </button>
          </div>

          {/* Quiz Type: Does It KO? vs Damage % Bracket */}
          <div className="flex border border-theme rounded-xl overflow-hidden p-0.5 bg-theme-bg">
            <button
              type="button"
              onClick={() => {
                setQuizMode("ko");
                setIsAnswered(false);
                setUserAnswer(null);
              }}
              className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-colors cursor-pointer ${
                quizMode === "ko" ? "bg-theme-accent text-white" : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Does It KO?
            </button>
            <button
              type="button"
              onClick={() => {
                setQuizMode("bracket");
                setIsAnswered(false);
                setUserAnswer(null);
              }}
              className={`px-3 py-1 text-xs font-display font-bold rounded-lg transition-colors cursor-pointer ${
                quizMode === "bracket" ? "bg-theme-accent text-white" : "text-theme-secondary hover:text-theme-primary"
              }`}
            >
              Damage % Bracket
            </button>
          </div>
        </div>
      </div>

      {/* Main Battle Confrontation Stage */}
      <div className="w-full bg-theme-surface border border-theme rounded-3xl p-5 sm:p-7 shadow-md flex flex-col gap-6">
        {/* Title & Scenario Header */}
        <div className="text-center border-b border-theme pb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-mono-tech uppercase text-theme-accent font-bold tracking-widest">
              {gameMode === "infinite"
                ? `Round #${roundNumber} (Infinite Mode)`
                : `Scenario #${(currentScenarioIndex % BATTLE_QUIZ_SCENARIOS.length) + 1} of ${BATTLE_QUIZ_SCENARIOS.length} (Curated)`}
            </span>
            {gameMode === "infinite" && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono-tech text-emerald-400 font-bold">
                Live Procedural
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-theme-primary">
            {scenario.title}
          </h2>
        </div>

        {/* The Confrontation Cards: Attacker vs Defender */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Attacker Panel (5 cols) */}
          <div className="md:col-span-5 bg-theme-bg border border-theme rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src={getSpriteUrl(scenario.attacker.id)}
                  alt={scenario.attacker.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${scenario.attacker.id}.png`;
                  }}
                />
              </div>
              <div>
                <span className="text-[10px] font-mono-tech text-rose-500 font-bold uppercase tracking-wide">
                  ATTACKER (Lv. {scenario.attacker.level})
                </span>
                <h3 className="text-lg font-display font-black text-theme-primary capitalize">
                  {scenario.attacker.name}
                </h3>
                <div className="flex gap-1 mt-0.5">
                  {scenario.attacker.types.map((t) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                  {scenario.attacker.isTera && (
                    <span className="px-1.5 py-0.5 rounded bg-theme-surface border border-theme text-[9px] font-mono-tech font-bold text-theme-gold uppercase">
                      Tera {scenario.attacker.teraType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Attacker Config Specs */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tech bg-theme-surface border border-theme/60 rounded-xl p-2.5">
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Nature</span>
                <span className="font-bold text-theme-primary">{scenario.attacker.nature}</span>
              </div>
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Ability</span>
                <span className="font-bold text-theme-primary">{scenario.attacker.ability}</span>
              </div>
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Held Item</span>
                <span className="font-bold text-theme-primary">{scenario.attacker.item}</span>
              </div>
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Status</span>
                <span className={`font-bold capitalize ${scenario.attacker.status !== "healthy" ? "text-rose-400" : "text-emerald-400"}`}>
                  {scenario.attacker.status}
                </span>
              </div>
            </div>

            {/* Move Used */}
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono-tech text-rose-400 uppercase font-bold block">
                  Move Used
                </span>
                <span className="font-display font-extrabold text-sm text-theme-primary">
                  {scenario.move.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono-tech font-bold text-theme-secondary">
                  {scenario.move.power} BP
                </span>
                <TypeBadge type={scenario.move.type} size="sm" />
              </div>
            </div>
          </div>

          {/* VS Center Clashes & Field Environment (2 cols) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center gap-2 text-center py-2">
            <span className="text-2xl font-black font-display text-theme-accent">
              VS
            </span>

            {/* Field Pills */}
            <div className="flex flex-col gap-1 w-full max-w-[130px]">
              <div className="px-2 py-1 rounded bg-theme-bg border border-theme text-[10px] font-mono-tech text-theme-secondary capitalize">
                Weather: <span className="font-bold text-theme-primary">{scenario.field.weather || "None"}</span>
              </div>
              <div className="px-2 py-1 rounded bg-theme-bg border border-theme text-[10px] font-mono-tech text-theme-secondary capitalize">
                Terrain: <span className="font-bold text-theme-primary">{scenario.field.terrain || "None"}</span>
              </div>
            </div>
          </div>

          {/* Defender Panel (5 cols) */}
          <div className="md:col-span-5 bg-theme-bg border border-theme rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src={getSpriteUrl(scenario.defender.id)}
                  alt={scenario.defender.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${scenario.defender.id}.png`;
                  }}
                />
              </div>
              <div>
                <span className="text-[10px] font-mono-tech text-sky-400 font-bold uppercase tracking-wide">
                  DEFENDER (Lv. {scenario.defender.level})
                </span>
                <h3 className="text-lg font-display font-black text-theme-primary capitalize">
                  {scenario.defender.name}
                </h3>
                <div className="flex gap-1 mt-0.5">
                  {scenario.defender.types.map((t) => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                  {scenario.defender.isTera && (
                    <span className="px-1.5 py-0.5 rounded bg-theme-surface border border-theme text-[9px] font-mono-tech font-bold text-theme-gold uppercase">
                      Tera {scenario.defender.teraType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Defender Config Specs */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tech bg-theme-surface border border-theme/60 rounded-xl p-2.5">
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Nature</span>
                <span className="font-bold text-theme-primary">{scenario.defender.nature}</span>
              </div>
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Ability</span>
                <span className="font-bold text-theme-primary">{scenario.defender.ability}</span>
              </div>
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">Held Item</span>
                <span className="font-bold text-theme-primary">{scenario.defender.item}</span>
              </div>
              <div>
                <span className="text-theme-secondary block text-[9px] uppercase">EV Spread</span>
                <span className="font-bold text-theme-primary">
                  {scenario.defender.evs.hp ? `${scenario.defender.evs.hp} HP` : ""}{" "}
                  {scenario.defender.evs.defense ? `/ ${scenario.defender.evs.defense} Def` : ""}
                  {scenario.defender.evs["special-defense"] ? `/ ${scenario.defender.evs["special-defense"]} SpD` : ""}
                </span>
              </div>
            </div>

            {/* Defender HP Bar */}
            <div className="bg-theme-surface border border-theme/60 rounded-xl p-2.5 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono-tech text-theme-secondary">
                <span>HP: {calcResult?.hpMax} Max</span>
                <span>{isAnswered ? `${Math.max(0, calcResult.hpMax - calcResult.maxDamage)} - ${Math.max(0, calcResult.hpMax - calcResult.minDamage)} Left` : "100% Full HP"}</span>
              </div>
              <div className="w-full h-2.5 bg-theme-input/70 rounded-full overflow-hidden p-0.5 border border-theme flex">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-rose-500"
                  style={{
                    width: isAnswered ? `${Math.max(0, 100 - calcResult.maxPercent)}%` : "100%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question & Answer Options */}
        <div className="border-t border-theme pt-4 flex flex-col items-center gap-4">
          <h4 className="font-display font-extrabold text-sm sm:text-base text-theme-primary text-center">
            {quizMode === "ko"
              ? "Will this attack Knock Out the Defender in ONE hit?"
              : "What is the expected Damage Percentage range?"}
          </h4>

          {/* Buttons: KO Mode */}
          {quizMode === "ko" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {[
                { key: "guaranteed_ohko", label: "Guaranteed OHKO", sub: "100% chance to KO" },
                { key: "roll_ohko", label: "Roll to OHKO", sub: "Depends on random roll" },
                { key: "guaranteed_survive", label: "Guaranteed Survive", sub: "Always lives the hit" },
              ].map((opt) => {
                const isSelected = userAnswer === opt.key;
                const isCorrect = correctKoAnswer === opt.key;
                let btnStyle = "bg-theme-bg hover:bg-theme-surface border-theme text-theme-primary";

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-600/90 text-white border-emerald-500 shadow-md";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-600/90 text-white border-rose-500";
                  } else {
                    btnStyle = "opacity-40 border-theme text-theme-secondary";
                  }
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt.key)}
                    className={`p-3 border rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span className="font-display font-extrabold text-xs sm:text-sm">{opt.label}</span>
                    <span className="text-[10px] font-mono-tech mt-0.5 opacity-80">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Buttons: Bracket Mode */}
          {quizMode === "bracket" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {bracketOptions.map((opt, idx) => {
                const isSelected = userAnswer === opt.isCorrect;
                let btnStyle = "bg-theme-bg hover:bg-theme-surface border-theme text-theme-primary";

                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = "bg-emerald-600/90 text-white border-emerald-500 shadow-md";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-600/90 text-white border-rose-500";
                  } else {
                    btnStyle = "opacity-40 border-theme text-theme-secondary";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt.isCorrect)}
                    className={`py-3 px-2 border rounded-2xl text-center font-mono-tech font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${btnStyle}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Post-Answer Educational Explanation Banner */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-theme-bg border border-theme rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase ${
                      userAnswer === (quizMode === "ko" ? correctKoAnswer : true)
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}>
                      {userAnswer === (quizMode === "ko" ? correctKoAnswer : true) ? "Correct" : "Incorrect"}
                    </span>
                    <span className="font-display font-extrabold text-sm sm:text-base text-theme-primary">
                      Actual Damage: {calcResult.minDamage} - {calcResult.maxDamage} ({calcResult.minPercent}% - {calcResult.maxPercent}%)
                    </span>
                  </div>
                  <span className="font-mono-tech font-bold text-xs text-emerald-400">
                    {calcResult.koVerdict}
                  </span>
                </div>

                <p className="text-xs font-display text-theme-secondary leading-relaxed border-t border-theme/60 pt-2">
                  <strong className="text-theme-primary">Analysis:</strong> {scenario.explanation}
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="px-6 py-2.5 bg-theme-accent text-white font-display font-bold text-xs sm:text-sm rounded-xl hover:bg-theme-accent/90 shadow-md cursor-pointer"
                  >
                    Next Confrontation →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
