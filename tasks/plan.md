# Implementation Plan: Competitive Damage Calculator & PokéArcade Minigames

## Overview
Expand the Pokédex application with a competitive-grade Gen 9 **Damage Calculator** and an interactive **PokéArcade** featuring three distinct minigames:
1. **Who's That Pokémon?** (Audio & silhouette guessing game)
2. **Dexdle** (Daily & Unlimited Poké-Wordle style deductive guessing)
3. **Damage Duel / "Is the Calc Right?"** (Competitive battle IQ quiz evaluating damage output under complex weather, terrain, item, ability, EV/IV, and status conditions)

All tools will leverage a shared, mathematically accurate Gen 9 damage calculation engine (`src/utils/damageCalc.js`) and integrate seamlessly with existing sprites, audio cries, type badges, and navigation state.

---

## Architecture Decisions

### 1. Unified Damage Calculation Engine (`src/utils/damageCalc.js`)
- **Single Source of Truth**: Implement the canonical Gen 9 damage formula:
  $$\text{Damage} = \left(\left\lfloor \frac{\left(\left\lfloor \frac{2 \times \text{Level}}{5} \right\rfloor + 2\right) \times \text{BasePower} \times A}{D} \right\rfloor \div 50 + 2\right) \times \text{Modifiers}$$
- **Full Condition Coverage**:
  - **Stat Formulas**: Exact stat computation with 25 Natures, IVs ($0-31$), EVs ($0-252$), and stat stages ($-6$ to $+6$).
  - **Abilities**: Huge Power, Pure Power, Multiscale, Shadow Shield, Fluffy, Fur Coat, Unaware, Technician, Adaptability, Protosynthesis, Quark Drive, Ruin abilities (Tablets/Sword/Vessel/Beads), Supreme Overlord, etc.
  - **Held Items**: Choice Band, Choice Specs, Life Orb, Expert Belt, Assault Vest, Eviolite, Focus Sash, type-boost items, resist berries, Sitrus berry.
  - **Field & Weather**: Sun ($\times 1.5$ Fire, $\times 0.5$ Water), Rain ($\times 1.5$ Water, $\times 0.5$ Fire), Sandstorm ($+50\%$ Rock SpD), Snow ($+50\%$ Ice Def).
  - **Terrains**: Electric ($+30\%$ Elec), Grassy ($+30\%$ Grass, $-50\%$ EQ/Bulldoze), Psychic ($+30\%$ Psych), Misty ($-50\%$ Dragon).
  - **Status**: Burn (halves physical attack unless Guts).
  - **Terastallization**: Offense (STAB upgrade / Adaptability bonus) & Defense (replaces defensive type profile).
  - **Roll Array & Probability**: Outputs all 16 discrete rolls ($85\%-100\%$) and computes KO probability (e.g., *Guaranteed OHKO*, *68.8% chance to OHKO*, *Guaranteed 2HKO*).
- Shared across both the **Damage Calculator** and the **Damage Duel** minigame.

### 2. Standalone Damage Calculator UI (`src/components/DamageCalculator.jsx`)
- 3-column desktop layout (responsive stacked mobile layout):
  - **Left**: Attacker panel (Pokémon picker, Level, Nature, EVs/IVs, Ability, Item, Stat Stages, Status, Tera Type, Move picker with automatic Power/Type/Category population).
  - **Center**: Field Conditions (Singles/Doubles, Weather, Terrain, Screens [Reflect, Light Screen, Aurora Veil], Spikes, Stealth Rock).
  - **Right**: Defender panel (Pokémon picker, Level, Nature, EVs/IVs, Ability, Item, Stat Stages, Status, Tera Type, Current HP).
- **Hero Output Bar**:
  - Interactive Defender HP gauge demonstrating remaining health.
  - Formatted damage range ($XX.X\% - YY.Y\%$), min/max HP loss, and KO verdict with detailed roll distribution.

### 3. PokéArcade Hub & Minigames Suite (`src/components/minigames/`)
- Unified hub component (`src/components/minigames/MinigamesHub.jsx`) integrated into `App.js` navigation (`pokedex` | `items` | `battle-lab` | `damage-calc` | `arcade`).
- **Game 1: Who's That Pokémon? (`SilhouetteGame.jsx`)**:
  - Silhouette rendering with CSS filter/shadow.
  - Clue mechanics: "Play Cry" (using existing dual cry audio system), "Reveal Typing", "Reveal Region".
  - Difficulty modes: Multiple choice (4 options) vs. Direct Search input.
  - Reveal sequence: Plays cry, bursts confetti, unlocks full artwork, and provides a direct link to the Dex entry.
- **Game 2: Dexdle (`DexdleGame.jsx`)**:
  - 6-guess puzzle with daily seed (`YYYY-MM-DD`) and Unlimited Practice mode.
  - Comparative feedback grid:
    1. Generation (⬆️ / ⬇️ / 🟩)
    2. Primary Type (🟩 Exact / 🟨 Flipped / ⬛ Wrong)
    3. Secondary Type (🟩 Exact / 🟨 Flipped / ⬛ None or Wrong)
    4. Height (⬆️ / ⬇️ / 🟩)
    5. Weight (⬆️ / ⬇️ / 🟩)
    6. Base Stat Total [BST] (⬆️ / ⬇️ / 🟩)
  - Animated tile reveals and clipboard share sheet (`Dexdle #... 4/6 🟩🟩🟨⬆️⬇️`).
- **Game 3: Damage Duel / "Is the Calc Right?" (`DamageDuelGame.jsx`)**:
  - Procedural competitive scenario generator testing real battle IQ.
  - Multiple game question modes:
    - *Does It KO?*: "Guaranteed OHKO" vs "Roll to OHKO" vs "Guaranteed Survive".
    - *Damage Bracket*: 4 multiple-choice percentage brackets (e.g., 34-42%, 58-69%, 84-99%, 105-124%).
  - Post-guess educational breakdown showing the exact mechanics and formulas that determined the outcome.
  - Trainer ranks from *Bug Catcher* to *VGC World Champion* based on win streaks.

---

## Task Breakdown

### Phase 1: Core Engine & Utilities
- **Task 1: Damage Engine Implementation**: Build `src/utils/damageCalc.js` with complete Gen 9 formula, rolls, field modifiers, and test cases.
- **Task 2: Preset Scenarios & Move Metadata Helpers**: Assemble competitive scenario generators, ability/item modifier dictionaries, and move helpers in `src/utils/calcData.js`.

### Phase 2: Competitive Damage Calculator
- **Task 3: Damage Calculator Component**: Build `src/components/DamageCalculator.jsx` with full attacker, defender, field condition selectors, and real-time HP bar result visualization.
- **Task 4: App Integration for Damage Calc**: Register `damage-calc` mode in `App.js`, update top navigation and sticky headers, and verify end-to-end calculations.

### Phase 3: PokéArcade Hub & Minigames
- **Task 5: Minigames Hub Component**: Build `src/components/minigames/MinigamesHub.jsx` with game selection cards, streak badges, and local storage state persistence.
- **Task 6: "Who's That Pokémon?" (Silhouette Game)**: Build `src/components/minigames/SilhouetteGame.jsx` with audio cry clues, silhouette filter, guess evaluation, and reveal celebration.
- **Task 7: Dexdle (PokéWordle)**: Build `src/components/minigames/DexdleGame.jsx` with Daily/Unlimited modes, feedback matrix, flip animations, and share sheet.
- **Task 8: "Is the Calc Right?" (Damage Duel)**: Build `src/components/minigames/DamageDuelGame.jsx` with procedural scenario generator, survival/damage bracket quiz modes, detailed explanation reveals, and streak rankings.

### Phase 4: Integration, Testing & Polish
- **Task 9: Navigation & Global Integration**: Integrate PokéArcade into `App.js`, update responsive navigation headers, and ensure persistent dark/light theme styling across all new views.
- **Task 10: Verification & Smoke Testing**: Execute build check (`npm run build`), verify calculation accuracy against standard Smogon damage calculations, and test all minigame flows.
