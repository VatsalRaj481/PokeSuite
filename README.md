# Pokedex

A modern, responsive Pokédex web application featuring comprehensive species data, a Generational Sprite Archive, interactive Battle Lab, Trainer's Bag item encyclopedia, and an AI-powered camera scanner. The frontend is hosted on Firebase Hosting with automated CI/CD via GitHub Actions, while the image scanning proxy runs on Render with the Gemini API key protected server-side.

## Features

- **National Dex**: Search and browse across 1,025+ species with real-time name, ID, type, and generational filters.
- **Generational Sprite Archive**: Explore historical sprites across generations (Gen 1 through Gen 9, 3D HOME artwork, animated Gen 5, Showdown battle gifs, and Dream World vector art) with shiny variant toggles where supported.
- **Audio Archive**: Playback for official modern Pokémon cries and classic 8-bit retro sound clips.
- **Type Matchups & Defenses**: Detailed damage multipliers for weaknesses, resistances, and immunities rendered with crisp, scalable vector badges.
- **Move Learnsets**: Filterable moves categorized into Level-Up, TM/HM Machines, Egg Moves, and Tutor Moves with physical, special, and status damage classes.
- **Battle Lab**: Interactive team sheet builder with EV/IV stat calculators, role assignments, dynamic type coverage analysis, and Pokémon Showdown import/export format support.
- **Trainer's Bag**: Item database covering Poké Balls, held battle items, evolutionary stones, berries, vitamins, and key adventure items.
- **AI Camera Scanner**: Live camera scanning powered by Google Gemini 2.5 Flash through a rate-limited backend proxy.
- **Appearance & Themes**: Integrated Light and Dark mode toggle with persistent state.
- **Automated CI/CD**: Automatic production deployments to Firebase Hosting on push to `main` via GitHub Actions.

## Tech Stack

- **Frontend**: React 19, Create React App, Tailwind CSS, Framer Motion, Lucide React, Canvas Confetti, React Toastify
- **Data & Assets**: PokeAPI, Showdown Sprite Archives, Pokémon HOME Artwork
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
pokedex/
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
│   │   ├── BattleLab.jsx                     # Competitive team builder & Showdown tools
│   │   ├── FilterType.jsx                    # Type and generation filtering controls
│   │   ├── Footer.jsx                        # App footer
│   │   ├── ItemsDex.jsx                      # Trainer's Bag item encyclopedia
│   │   ├── PokemonCard.jsx                   # Detailed modal card (stats, sprites, moves)
│   │   ├── PokemonScanner.jsx                # AI camera scanner interface
│   │   └── TypeBadge.jsx                     # Scalable vector type badge component
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

### 2. Frontend Setup

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

### 3. Backend Setup (Optional for Local Scanner)

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
4. Deploys to Firebase Hosting using repository secret `FIREBASE_SERVICE_ACCOUNT_POKEDEX_32631`.

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
