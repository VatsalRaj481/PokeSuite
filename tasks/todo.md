# Task List: Competitive Damage Calculator & PokéArcade Minigames

## Task 1: Damage Calculation Engine (`src/utils/damageCalc.js`)
**Description:** Implement the canonical Gen 9 damage formula with all standard battle modifiers: stats (EV/IV/Nature/stages), items, abilities, weather, terrain, status, critical hits, Terastallization, and 16-roll probability distributions.
**Acceptance criteria:**
- [x] Correctly calculates base stats and actual stats with IVs (0-31), EVs (0-252), and 25 Natures
- [x] Supports field conditions: Sun, Rain, Sandstorm (+50% Rock SpD), Snow (+50% Ice Def), Electric, Grassy, Psychic, Misty terrains
- [x] Supports offensive and defensive abilities (Huge Power, Multiscale, Unaware, Fluffy, Protosynthesis, Ruin abilities, etc.)
- [x] Returns damage range (min-max), percentage rolls array (16 values), and exact KO probability description
**Verification:**
- [x] Unit check with canonical match-ups (e.g. 252+ Atk Choice Band Urshifu Close Combat vs 252 HP / 252+ Def Corviknight)
**Dependencies:** None
**Files likely touched:**
- `src/utils/damageCalc.js`
**Estimated scope:** M (1 file, comprehensive logic)

---

## Task 2: Calculation Presets & Competitive Metagame Data (`src/utils/calcData.js`)
**Description:** Build competitive item definitions, ability effect mapping, preset spreads (e.g., standard 252/252, bulky utility spreads), and curated scenario pools for the battle quiz minigame.
**Acceptance criteria:**
- [x] Exports list of competitive held items with their damage modifiers
- [x] Exports list of battle abilities with attack/defense/type modifiers
- [x] Exports curated and procedural question generators for the "Damage Duel" minigame
**Verification:**
- [x] Data structures validate cleanly without circular dependencies
**Dependencies:** Task 1
**Files likely touched:**
- `src/utils/calcData.js`
**Estimated scope:** S (1 file)

---

## Checkpoint: Foundation Review (Tasks 1-2)
- [x] Engine and data models ready for UI consumption

---

## Task 3: Competitive Damage Calculator Component (`src/components/DamageCalculator.jsx`)
**Description:** Build the full-fledged standalone Damage Calculator interface featuring Attacker, Field, and Defender panels, live move selection, Tera types, and an interactive remaining HP visualizer bar.
**Acceptance criteria:**
- [x] Attacker & Defender cards with Pokémon search, Nature, EVs/IVs, Ability, Item, Status, and Tera Type
- [x] Move selector that pre-fills base power, category (Physical/Special), and move type
- [x] Field conditions bar (Singles/Doubles, Weather, Terrain, Screens, Hazards)
- [x] Dynamic damage summary card with visual HP loss gauge and percentage ranges
**Verification:**
- [x] Visual verification of live recalculation upon tweaking any slider or condition
**Dependencies:** Tasks 1, 2
**Files likely touched:**
- `src/components/DamageCalculator.jsx`
**Estimated scope:** M (1 file)

---

## Task 4: Damage Calculator App Integration
**Description:** Register the `damage-calc` view in `App.js`, update header tabs, and enable passing Pokémon from Dex cards directly into the calculator.
**Acceptance criteria:**
- [x] "Damage Calc" tab present in main header and sticky navigation
- [x] Seamless switching between Dex, Items, Battle Lab, and Damage Calc
- [x] Responsive layout across mobile and desktop
**Verification:**
- [x] Navigation switches cleanly without unmounting errors or state corruption
**Dependencies:** Task 3
**Files likely touched:**
- `src/App.js`
**Estimated scope:** S (1 file)

---

## Task 5: PokéArcade Hub Component (`src/components/minigames/MinigamesHub.jsx`)
**Description:** Create the Minigames Hub landing view where users select between "Who's That Pokémon?", "Dexdle", and "Damage Duel", tracking player stats and streaks.
**Acceptance criteria:**
- [x] Sleek arcade menu featuring visual cards for all 3 minigames
- [x] Persistent high scores and streak badges stored in `localStorage`
- [x] Smooth back-to-hub and restart navigation for each game
**Verification:**
- [x] Selecting each game mounts its respective component properly
**Dependencies:** Task 4
**Files likely touched:**
- `src/components/minigames/MinigamesHub.jsx`
**Estimated scope:** S (1 file)

---

## Task 6: "Who's That Pokémon?" Silhouette Minigame (`src/components/minigames/SilhouetteGame.jsx`)
**Description:** Build the classic silhouette guessing game with audio cry playback, generation filters, hints, streak counters, and reveal celebrations.
**Acceptance criteria:**
- [x] Renders blacked-out silhouette of a randomly selected Pokémon
- [x] Provides audio cry playback hint (using existing cry sound assets)
- [x] Supports both Multiple Choice (4 choices) and Hardcore Type-Search modes
- [x] Full reveal with Showdown/Home sprite, celebratory confetti, and link to Dex entry
**Verification:**
- [x] Confetti and sound fire upon correct guess; streak increments correctly
**Dependencies:** Task 5
**Files likely touched:**
- `src/components/minigames/SilhouetteGame.jsx`
**Estimated scope:** M (1 file)

---

## Task 7: Dexdle (Poké-Wordle) Minigame (`src/components/minigames/DexdleGame.jsx`)
**Description:** Build the daily and unlimited deductive guessing game with animated feedback tiles for Generation, Types, Height, Weight, and BST.
**Acceptance criteria:**
- [x] 6 guesses per game with searchable Pokémon autocomplete input
- [x] Color-coded comparison tiles (Green = correct, Yellow = partial/flipped, Gray = wrong; Arrows for Gen, Height, Weight, BST)
- [x] Daily Challenge (seeded by calendar date) and Unlimited Practice mode toggle
- [x] Win/loss modal with emoji score card copyable to clipboard
**Verification:**
- [x] Tiles animate flip with correct hints; daily seed generates identical puzzle on same day
**Dependencies:** Task 5
**Files likely touched:**
- `src/components/minigames/DexdleGame.jsx`
**Estimated scope:** M (1 file)

---

## Task 8: "Is the Calc Right?" (Damage Duel) Minigame (`src/components/minigames/DamageDuelGame.jsx`)
**Description:** Build the competitive battle IQ quiz where trainers deduce whether a Pokémon survives or faints under complex battle conditions (status, weather, terrain, items, EV spreads).
**Acceptance criteria:**
- [x] Generates realistic match-ups with full field conditions (Weather, Terrain, Items, Abilities, EVs)
- [x] Quiz modes: "Does It KO?" (Guaranteed OHKO / Roll / Survive) and "Damage Bracket" (percentage ranges)
- [x] Educational breakdown upon guessing revealing the exact damage formula and critical factors
- [x] Win streak scoring with competitive trainer ranks (Bug Catcher -> Ace Trainer -> VGC Champion)
**Verification:**
- [x] Procedural questions evaluate against `src/utils/damageCalc.js` and provide 100% accurate verdicts
**Dependencies:** Tasks 1, 2, 5
**Files likely touched:**
- `src/components/minigames/DamageDuelGame.jsx`
**Estimated scope:** M (1 file)

---

## Task 9: Final Navigation, Styling & App Wiring
**Description:** Integrate the Arcade hub into `App.js` navigation, finalize light/dark mode theming across all minigames, and test mobile responsive behaviors.
**Acceptance criteria:**
- [x] Navigation supports: National Dex | Items | Battle Lab | Damage Calc | PokéArcade
- [x] Dark and Light mode theme tokens applied consistently across all cards and game boards
- [x] Fully responsive on mobile screens
**Verification:**
- [x] `npm run build` succeeds with zero errors or bundle warnings
**Dependencies:** Tasks 4, 5, 6, 7, 8
**Files likely touched:**
- `src/App.js`
- `src/components/FilterType.jsx`
**Estimated scope:** S (2 files)

---

## Checkpoint: Final Review & Playtesting
- [x] All 3 minigames playable end-to-end
- [x] Damage calculator matches competitive benchmarks
- [x] Production build succeeds cleanly
