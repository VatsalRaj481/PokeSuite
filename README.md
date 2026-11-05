# PokéSuite

A modern, responsive all-in-one Pokémon companion web application featuring comprehensive species data, a Generational Sprite Archive, an interactive 18×18 Type Chart, a Gen 9 Competitive Damage Calculator & Battle Lab, a 5-game PokéArcade suite, Trainer's Bag item encyclopedia, and an AI-powered camera scanner. 

- **Live URL**: [https://pokesuite.web.app](https://pokesuite.web.app) *(Legacy domain auto-redirects from `pokedex-32631.web.app`)*
- **Frontend**: Deployed to Firebase Hosting with automated CI/CD via GitHub Actions.
- **Backend Proxy**: AI camera scanner proxy runs on Render with the Gemini API key protected server-side.

---

## Key Highlights & Feature Suite

### 1. National Dex & Species Dossiers
- **Complete National Dex**: Search and browse across 1,025+ species with instantaneous real-time filtering by Name, National ID, Elemental Type, Generation (Gen 1–9), Region (Kanto through Paldea), Living Dex Status, Special Archetypes (Starters, Legendaries, Mythicals, Paradox, Ultra Beasts, Fossils, Babies), and Regional Forms (Alolan, Galarian, Hisuian, Paldean, Mega, Gigantamax).
- **Generational Sprite Archive**: High-definition sprite toggle across eras: Gen 1 through Gen 9, 3D Pokémon HOME models, animated Pokémon Showdown battle GIFs, and Dream World vector art, complete with shiny variant toggles.
- **Acoustic Audio Archive**: Dual audio playback for both official modern high-fidelity Pokémon cries and nostalgic classic 8-bit retro chiptune cries.
- **Compound Type Matchups & Defenses**: Exact damage multipliers for all incoming elemental attacks ($4\times, 2\times, 1\times, \frac{1}{2}\times, \frac{1}{4}\times, 0\times$) rendered with vector type badges.
- **Comprehensive Move Learnsets**: Filterable moves categorized into Level-Up, TM/HM Machines, Egg Moves, and Tutor Moves with physical, special, and status damage classes, power, accuracy, and PP metrics.
- **Training & Breeding Intelligence**: In-depth biometrics including EV yield distributions, catch rate gauge, gender ratio split bar, egg groups, growth rates, base experience, and wild encounter locations.
- **Exclusive Signature Traits**: Automatic detection and highlighting of canonical signature moves and abilities unique to each evolutionary line.
- **Head-to-Head Comparison**: Side-by-side stat radar, biometric comparison, and matchup analysis for up to 3 Pokémon simultaneously.

---

### 2. Interactive Type Chart & Defensive Calculator
- **18×18 Matchup Matrix**:
  - Full elemental matrix mapping Attacking Move Types (rows) against Defending Pokémon Types (columns).
  - High-visibility color-coded badges: Super Effective ($2\times$), Not Very Effective ($\frac{1}{2}\times$), and Immune ($0\times$).
  - **Dynamic Crosshair Intel**: Real-time crosshair tracking that highlights active row and column headers on hover with instantaneous outcome readouts.
  - **Type Isolation**: One-click type pinning to isolate any type's offensive spread or defensive vulnerabilities.
- **Dual-Type Defender Calculator**:
  - Interactive sandbox to combine primary and secondary typings (e.g. *Water / Ground* or *Steel / Fairy*).
  - Groups all 18 attacking types into clear multiplier tiers: Extreme Weakness ($4\times$), Weakness ($2\times$), Neutral ($1\times$), Resistance ($\frac{1}{2}\times$), Extreme Resistance ($\frac{1}{4}\times$), and Immunity ($0\times$).
- **Single-Type Deep-Dive Dossier**:
  - Two-column offensive and defensive breakdown for any chosen element.
- **Ubiquitous Accessibility**: Available via top header and sticky bar shortcuts, as well as embedded directly within Battle Lab, Damage Calculator, and individual species cards.

---

### 3. Competitive Battle Suite
- **Battle Lab (Team Sheet Builder)**:
  - 6-Pokémon team roster compiler supporting standard formats (Lv. 50 VGC and Lv. 100 Smogon OU).
  - Fine-grained EV/IV sliders with automated 508 EV budget enforcement and 25 Nature stat multipliers.
  - Loadout customization including held items, abilities, Tera types, and 4-move slots.
  - **Team Defensive Synergy & Weakness Radar**: Cumulative 18-type defensive heatmap flagging critical hazard liabilities ($3+$ weaknesses without resistances).
  - **Speed Tier Radar**: Comparative speed benchmarks across your entire party.
  - **Showdown & Poképaste Interoperability**: One-click export to Pokémon Showdown text format and paste-based team importing.
- **Competitive Damage Calculator**:
  - Canonical Gen 9 damage engine (`src/utils/damageCalc.js`) calculating damage based on base stats, IVs, EVs, Natures, and stat stages ($-6$ to $+6$).
  - Full condition support: Singles / Doubles, Terastallization, Weather (Sun, Rain, Sandstorm, Snow), Terrains (Electric, Grassy, Psychic, Misty), Screens (Reflect, Light Screen, Aurora Veil), and Entry Hazards.
  - **16 Discrete Rolls & Probability**: Generates the complete 16-roll damage distribution ($85\%-100\%$) and computes exact KO probabilities (*Guaranteed OHKO*, *X% chance to 2HKO*, etc.).

---

### 4. PokéArcade Minigames Lounge
A dedicated minigames hub (`src/components/minigames/MinigamesHub.jsx`) with persistent streak tracking in `localStorage`:
1. **Who's That Pokémon?**:
   - Classic mystery silhouette guessing game with audio cry cues, generation filters, multiple choice and expert typing modes, and confetti celebrations.
2. **Who's That Cry? (Audio Quiz)**:
   - Pure acoustic challenge. Listen to the sound clip and identify the Pokémon.
   - Features **Modern 3D** vs. **Retro 8-Bit** audio toggles, animated soundwave visualizer, and progressive lifelines (Region, Primary Type, BST bracket).
3. **Dex Riddle (Lore Puzzle)**:
   - Guess the mystery Pokémon from authentic, redacted Pokédex flavor text entries.
   - Features hidden game origin (revealed on solve), a 4-attempt guess system, sequential ordered hints (Region → Typings → Silhouette), and predictive autocomplete.
4. **Dexdle (Poké-Wordle)**:
   - 6-guess deductive puzzle available in Daily Challenge (calendar seeded) and Unlimited Practice modes.
   - Color-coded comparison tiles for Generation, Primary/Secondary Types, Height, Weight, and BST.
5. **Damage Duel ("Is the Calc Right?")**:
   - Procedural battle IQ quiz testing trainers on complex damage scenarios with EV spreads, weather, items, and abilities.
   - Competitive trainer rankings from *Bug Catcher* to *VGC World Champion*.

---

### 5. Trainer Utilities & AI Scanner
- **Trainer's Bag (ItemsDex)**: Searchable encyclopedia covering Poké Balls, held battle items, evolution stones, berries, medicine, and key items with evolutionary compatibility and wild drop rates.
- **Trainer Living Dex Tracker**: LocalStorage-backed tracker for Caught, Shiny, and Unseen statuses with progress bars.
- **AI Camera Scanner**: Live camera scanning powered by Google Gemini 2.5 Flash through a rate-limited Express backend proxy.
- **Appearance & Theming**: Integrated Dark and Light mode themes with custom Poké Ball loaders and custom Poké-toasts.
- **Automated CI/CD**: Automatic production deployments to Firebase Hosting on push to `main` via GitHub Actions.

---

## Tech Stack

- **Frontend**: React 19, Create React App, Tailwind CSS, Framer Motion, Canvas Confetti, React Toastify
- **Data & Assets**: PokeAPI REST API, Pokémon Showdown Sprite & Cry Archives, Pokémon HOME 3D Artwork
- **Backend Proxy**: Node.js, Express, node-fetch
- **Cloud & Hosting**: Firebase Hosting, Render
- **AI**: Google Gemini API (Gemini 2.5 Flash)

## Architecture

- **Frontend**: Single Page Application deployed to Firebase Hosting.
- **Backend**: Express server in `backend/` deployed to Render to protect API credentials and enforce global rate limits.
- **Data Layer**: Direct REST calls to PokeAPI for species data, evolution chains, and moves.
- **Image Scanner**: Client captures image payload, proxies to `/scan` on backend, which validates and queries Gemini 2.5 Flash.

## Project Structure

```text
pokesuite/
├── .github/
│   └── workflows/
│       ├── firebase-hosting-merge.yml        # CI/CD deployment on push to main
│       └── firebase-hosting-pull-request.yml  # Preview deployment for PRs
├── backend/
│   ├── server.js                             # Express proxy for Gemini scanner
│   ├── package.json                          # Backend dependencies
│   └── package-lock.json
├── public/
│   ├── assets/
│   │   └── types/                            # Crisp vector SVGs for all 18 types
│   ├── Pokeball.png                          # Favicon and branding asset
│   └── index.html                            # Root HTML template
├── src/
│   ├── components/
│   │   ├── minigames/
│   │   │   ├── CryQuizGame.jsx               # Audio cry recognition quiz
│   │   │   ├── DamageDuelGame.jsx            # Battle IQ calculation quiz
│   │   │   ├── DexdleGame.jsx                # Daily & unlimited Poké-Wordle
│   │   │   ├── DexDetectiveGame.jsx          # Pokédex flavor text mystery game
│   │   │   ├── MinigamesHub.jsx              # PokéArcade hub and selector
│   │   │   └── SilhouetteGame.jsx            # Classic silhouette guessing
│   │   ├── BattleLab.jsx                     # Competitive team builder & Showdown tools
│   │   ├── DamageCalculator.jsx              # Canonical Gen 9 battle damage calculator
│   │   ├── FilterType.jsx                    # Type and generation filtering controls
│   │   ├── Footer.jsx                        # App footer
│   │   ├── ItemsDex.jsx                      # Trainer's Bag item encyclopedia
│   │   ├── NatureChartModal.jsx              # 5×5 interactive Nature matrix modal
│   │   ├── PokemonCard.jsx                   # Detailed modal card (stats, sprites, moves)
│   │   ├── PokemonScanner.jsx                # AI camera scanner interface
│   │   ├── TypeBadge.jsx                     # Scalable vector type badge component
│   │   └── TypeChartModal.jsx                # 18×18 matchup matrix & dual-type calculator
│   ├── utils/
│   │   ├── moveMeta.js                       # Move damage class and power metadata
│   │   └── typeIcons.js                      # Type metadata, colors, and asset mappings
│   ├── App.js                                # Primary application layout and state
│   ├── index.css                             # Tailwind and global typography styles
│   └── index.js                              # React DOM mount point
├── .env                                      # Local environment configuration
├── .firebaserc                               # Firebase project configuration
├── firebase.json                             # Firebase Hosting routing & rewrite rules
├── package.json                              # Frontend dependencies and scripts
└── tailwind.config.js                        # Tailwind CSS configuration
```

## Environment Variables

### Frontend (`.env` in repository root)

```env
REACT_APP_SCAN_API_URL=https://your-render-service.onrender.com/scan
```

For local backend testing:

```env
REACT_APP_SCAN_API_URL=http://localhost:5000/scan
```

### Backend (Render Environment)

```env
GEMINI_API_KEY=your_gemini_api_key
```

*Note: Never include the Gemini API key in frontend configuration or repository files.*

## Getting Started Locally

### 1. Prerequisites

- Node.js (v18 or higher recommended)
- npm
- Git

### 2. Clone Repository

```bash
git clone https://github.com/VatsalRaj481/pokesuite.git
cd pokesuite
```

### 3. Frontend Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`.

To create an optimized production build:

```bash
npm run build
```

### 4. Backend Setup (Optional for Local Scanner)

In a separate terminal:

```bash
cd backend
npm install
```

Set your Gemini API key:

```bash
# On Linux/macOS
export GEMINI_API_KEY="your_api_key_here"

# On Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"
```

Start the backend:

```bash
npm start
```

The backend server runs at `http://localhost:5000`.

Verify health endpoint:

```text
http://localhost:5000/health
```

## Deployment

### Automated Deployment (GitHub Actions)

Deployments are automated through `.github/workflows/firebase-hosting-merge.yml`. Pushing changes to the `main` branch automatically:

1. Checks out the repository.
2. Installs frontend dependencies.
3. Builds the production bundle (`npm run build`).
4. Deploys live to Firebase Hosting (`https://pokesuite.web.app`) and configures legacy domain redirection.

### Manual Deployment

If deploying manually via Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy --only hosting
```

### Backend Deployment (Render)

1. Create a new Web Service on Render pointing to the `backend/` directory.
2. Set Build Command to `npm install` and Start Command to `npm start`.
3. Add `GEMINI_API_KEY` to Render Environment Variables.
4. Copy the service URL and update `REACT_APP_SCAN_API_URL` in the frontend.

## Rate Limiting

- The backend proxy enforces a global cooldown of 8 seconds between scan requests to respect Gemini API quotas.
- The frontend disables the scan button and displays a countdown timer during cooldown periods.
- Excess requests receive an HTTP `429` with retry time remaining.

## Data & Asset Sources

- Species data, moves, items, and abilities: [PokeAPI](https://pokeapi.co/)
- Animated battle sprites: Pokémon Showdown
- AI identification: Google Gemini 2.5 Flash

---

## Legal & Disclaimer

PokéSuite is a non-commercial, open-source fan project built for educational, research, and competitive community purposes. Pokémon and all associated names, characters, and trademarks are the intellectual property of Nintendo, Creatures Inc., and Game Freak. This project is not affiliated with, endorsed by, or sponsored by Nintendo or The Pokémon Company.
