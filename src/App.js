import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

import PokemonCard from "./components/PokemonCard";
import FilterType from "./components/FilterType";
import Footer from "./components/Footer";
import PokemonScanner from "./components/PokemonScanner";
import TypeBadge from "./components/TypeBadge";
import ItemsDex from "./components/ItemsDex";
import BattleLab from "./components/BattleLab";

const formatPokemonName = (rawName) => {
  if (!rawName) return "";
  let name = rawName.toLowerCase();
  
  const capitalize = (str) => {
    if (!str) return "";
    return str.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  };

  if (name.includes("-mega-x")) {
    const base = name.replace("-mega-x", "");
    return `Mega ${capitalize(base)} X`;
  }
  if (name.includes("-mega-y")) {
    const base = name.replace("-mega-y", "");
    return `Mega ${capitalize(base)} Y`;
  }
  if (name.includes("-mega")) {
    const base = name.replace("-mega", "");
    return `Mega ${capitalize(base)}`;
  }
  if (name.includes("-gmax")) {
    const base = name.replace("-gmax", "");
    return `Gmax ${capitalize(base)}`;
  }
  if (name.includes("-alola")) {
    const base = name.replace("-alola", "");
    return `Alolan ${capitalize(base)}`;
  }
  if (name.includes("-galar")) {
    const base = name.replace("-galar", "");
    return `Galarian ${capitalize(base)}`;
  }
  if (name.includes("-hisui")) {
    const base = name.replace("-hisui", "");
    return `Hisuian ${capitalize(base)}`;
  }
  if (name.includes("-paldea")) {
    const base = name.replace("-paldea", "");
    return `Paldean ${capitalize(base)}`;
  }
  
  return capitalize(rawName);
};

// Stat configuration duplicating same colors from PokemonCard for comparison
const statMeta = {
  hp: { label: "HP", color: "bg-red-500", max: 255 },
  attack: { label: "ATK", color: "bg-orange-500", max: 190 },
  defense: { label: "DEF", color: "bg-yellow-500", max: 230 },
  "special-attack": { label: "SPA", color: "bg-blue-500", max: 194 },
  "special-defense": { label: "SPD", color: "bg-green-500", max: 230 },
  speed: { label: "SPE", color: "bg-pink-500", max: 180 },
};

function PokeBallLoader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center mt-12 mb-8 select-none">
      <div className="relative w-20 h-20 animate-pokeball-spin mb-4">
        {/* Poke Ball Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-950 bg-white overflow-hidden shadow-md">
          {/* Upper Red Half */}
          <div className="w-full h-1/2 bg-theme-accent border-b-2 border-slate-950"></div>
          {/* Lower White Half */}
          <div className="w-full h-1/2 bg-white"></div>
        </div>
        {/* Horizontal Black Band */}
        <div className="absolute top-[36px] inset-x-0 h-2.5 bg-slate-950"></div>
        {/* Center Button */}
        <div className="absolute top-[26px] left-[26px] w-7 h-7 rounded-full border-4 border-slate-950 bg-white flex items-center justify-center shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full animate-btn-blink"></div>
        </div>
      </div>
      <p className="text-theme-accent font-display font-semibold text-xs tracking-wider animate-pulse">
        {message}
      </p>
    </div>
  );
}

const CANONICAL_REGIONS = [
  "kanto",
  "johto",
  "hoenn",
  "sinnoh",
  "unova",
  "kalos",
  "alola",
  "galar",
  "hisui",
  "paldea",
];

const getDebutRegion = (pokemon) => {
  if (!pokemon) return null;
  let id = pokemon.id;
  if (pokemon.species?.url) {
    const match = pokemon.species.url.match(/\/pokemon-species\/(\d+)\//);
    if (match) id = parseInt(match[1], 10);
  }
  if (!id || id > 1025) return null;
  if (id >= 1 && id <= 151) return "kanto";
  if (id >= 152 && id <= 251) return "johto";
  if (id >= 252 && id <= 386) return "hoenn";
  if (id >= 387 && id <= 493) return "sinnoh";
  if (id >= 494 && id <= 649) return "unova";
  if (id >= 650 && id <= 721) return "kalos";
  if (id >= 722 && id <= 809) return "alola";
  if (id >= 810 && id <= 898) return "galar";
  if (id >= 899 && id <= 905) return "hisui";
  if (id >= 906 && id <= 1025) return "paldea";
  return null;
};

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [types, setTypes] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [regions, setRegions] = useState(() => {
    try {
      const cached = localStorage.getItem("pokedex_regions_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 9) return parsed;
      }
    } catch (e) {}
    return CANONICAL_REGIONS;
  });
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedSpeciesData, setSelectedSpeciesData] = useState(null);
  const [selectedPokemonDescription, setSelectedPokemonDescription] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasFetchedAllPokemon, setHasFetchedAllPokemon] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [filterResetKey, setFilterResetKey] = useState(0);

  // Trainer Living Dex collection state
  const [trainerCollection, setTrainerCollection] = useState(() => {
    try {
      const saved = localStorage.getItem("pokedex_trainer_collection_v1");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const handleCollectionUpdate = () => {
      try {
        const saved = localStorage.getItem("pokedex_trainer_collection_v1");
        setTrainerCollection(saved ? JSON.parse(saved) : {});
      } catch (e) {}
    };
    window.addEventListener("pokedex_collection_updated", handleCollectionUpdate);
    return () => window.removeEventListener("pokedex_collection_updated", handleCollectionUpdate);
  }, []);

  const caughtCount = useMemo(() => {
    return Object.values(trainerCollection).filter((s) => s === "caught" || s === "shiny").length;
  }, [trainerCollection]);

  // App Navigation Mode: 'pokedex' | 'items' | 'battle-lab'
  const [activeAppMode, setActiveAppMode] = useState("pokedex");

  // Compare View states
  const [comparedPokemon, setComparedPokemon] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Theme toggle state (persisted)
  const [theme, setTheme] = useState(() => localStorage.getItem("pokedex-theme") || "dark");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // Sticky header state
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const pokemonToRegionMapRef = useRef(
    (() => {
      try {
        const cached = localStorage.getItem("pokedex_pokemon_to_region_v2");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object") return parsed;
        }
      } catch (e) {}
      return {};
    })()
  );
  const generationSpeciesCache = useRef({});
  const heroRef = useRef(null);
  const loadMoreRef = useRef(null);

  const memoizedPokemonList = useMemo(() => pokemonList, [pokemonList]);

  // Random Showdown animated hero sprite state
  const [heroPokemon, setHeroPokemon] = useState(() => {
    const popularHeroPool = [25, 6, 94, 150, 448, 445, 658, 384, 133, 282, 778, 149];
    const initialId = popularHeroPool[Math.floor(Math.random() * popularHeroPool.length)];
    const names = {
      25: "Pikachu",
      6: "Charizard",
      94: "Gengar",
      150: "Mewtwo",
      448: "Lucario",
      445: "Garchomp",
      658: "Greninja",
      384: "Rayquaza",
      133: "Eevee",
      282: "Gardevoir",
      778: "Mimikyu",
      149: "Dragonite",
    };
    return {
      id: initialId,
      name: names[initialId]?.toLowerCase() || String(initialId),
      displayName: names[initialId] || "Pokémon",
      isShiny: Math.random() < 0.1,
    };
  });

  const randomizeHeroPokemon = useCallback(() => {
    const totalCount = pokemonList.length > 0 ? Math.min(pokemonList.length, 1025) : 1025;
    const randomId = Math.floor(Math.random() * totalCount) + 1;
    const found = pokemonList.find((p) => p.id === randomId);
    const isShiny = Math.random() < 0.08; // 8% chance of shiny showdown sprite
    setHeroPokemon({
      id: randomId,
      name: found ? found.name : String(randomId),
      displayName: found ? formatPokemonName(found.name) : "Pokémon",
      isShiny,
    });
  }, [pokemonList]);

  // Infinite Scroll Observer
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prev) => {
            if (prev * ITEMS_PER_PAGE < filteredPokemon.length) {
              return prev + 1;
            }
            return prev;
          });
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPokemon.length]);

  // Sync theme to DOM and localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pokedex-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Solid background with Pokémon theme
  const getBackgroundStyle = () => {
    return "bg-theme-bg text-theme-primary";
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const typeRes = await axios.get("https://pokeapi.co/api/v2/type");
        const validTypes = typeRes.data.results.filter(
          (type) =>
            type.name !== "unknown" &&
            type.name !== "shadow" &&
            type.name !== "stellar"
        );
        setTypes(validTypes);

        const genRes = await axios.get("https://pokeapi.co/api/v2/generation/");
        const formattedGenerations = genRes.data.results.map((gen) => ({
          ...gen,
          id: parseInt(gen.url.split("/").slice(-2, -1)[0], 10),
        }));
        setGenerations(formattedGenerations);

        const CACHE_KEY_MAP = "pokedex_pokemon_to_region_v2";
        const CACHE_KEY_REGIONS = "pokedex_regions_v2";

        const pokedexListRes = await axios.get(
          "https://pokeapi.co/api/v2/pokedex?limit=100"
        );
        const tempPokemonToRegionMap = {};

        const pokedexDetailsPromises = pokedexListRes.data.results.map((pdx) =>
          axios.get(pdx.url).catch(() => null)
        );
        const pokedexDetails = await Promise.all(pokedexDetailsPromises);

        const foundRegions = new Set();
        pokedexDetails.forEach((pdxDetail) => {
          if (!pdxDetail?.data) return;
          const regionName = pdxDetail.data.region
            ? pdxDetail.data.region.name
            : null;

          if (regionName) {
            foundRegions.add(regionName);
            pdxDetail.data.pokemon_entries.forEach((entry) => {
              const pokemonName = entry.pokemon_species.name;
              if (!tempPokemonToRegionMap[pokemonName]) {
                tempPokemonToRegionMap[pokemonName] = new Set();
              }
              tempPokemonToRegionMap[pokemonName].add(regionName);
            });
          }
        });

        const finalPokemonToRegionMap = {};
        for (const pokemonName in tempPokemonToRegionMap) {
          finalPokemonToRegionMap[pokemonName] = Array.from(
            tempPokemonToRegionMap[pokemonName]
          );
        }

        pokemonToRegionMapRef.current = finalPokemonToRegionMap;

        // Extract unique regions in canonical order
        const activeRegions = CANONICAL_REGIONS.filter((r) => foundRegions.has(r));
        const resolvedRegions = activeRegions.length >= 9 ? activeRegions : CANONICAL_REGIONS;
        setRegions(resolvedRegions);

        try {
          localStorage.setItem(CACHE_KEY_MAP, JSON.stringify(finalPokemonToRegionMap));
          localStorage.setItem(CACHE_KEY_REGIONS, JSON.stringify(resolvedRegions));
        } catch (cacheErr) {
          console.error("Cache write error:", cacheErr);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial PokeAPI mappings.");
      }
    };

    fetchInitialData();
  }, []);

  const fetchAllPokemonData = useCallback(async () => {
    if (hasFetchedAllPokemon && pokemonList.length > 0) {
      return pokemonList;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(
        "https://pokeapi.co/api/v2/pokemon?limit=10000"
      );
      const items = res.data.results;
      const BATCH_SIZE = 50;
      const allResults = [];

      // Initial fast batch (first 150 pokemon) for immediate responsiveness
      const initialItems = items.slice(0, 150);
      for (let i = 0; i < initialItems.length; i += BATCH_SIZE) {
        const chunk = initialItems.slice(i, i + BATCH_SIZE);
        const chunkData = await Promise.all(
          chunk.map((p) =>
            axios.get(p.url).then((response) => response.data).catch(() => null)
          )
        );
        allResults.push(...chunkData.filter(Boolean));
      }
      setPokemonList([...allResults]);

      // Stream the remaining pokemon in background
      (async () => {
        try {
          const remainingItems = items.slice(150);
          for (let i = 0; i < remainingItems.length; i += BATCH_SIZE) {
            const chunk = remainingItems.slice(i, i + BATCH_SIZE);
            const chunkData = await Promise.all(
              chunk.map((p) =>
                axios.get(p.url).then((response) => response.data).catch(() => null)
              )
            );
            allResults.push(...chunkData.filter(Boolean));
          }
          setPokemonList([...allResults]);
          setHasFetchedAllPokemon(true);
        } catch (e) {
          console.error("Background stream error:", e);
        }
      })();

      return allResults;
    } catch (error) {
      toast.error("Failed to fetch full Pokédex dataset.");
      setHasFetchedAllPokemon(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasFetchedAllPokemon, pokemonList]);

  const toSentenceCase = (text) => {
    if (!text) {
      return "";
    }

    return (
      text.charAt(0).toUpperCase() +
      text
        .slice(1)
        .toLowerCase()
        .replace(/([.?!]\s*)([a-z])/g, (match, prefix, letter) => {
          return prefix + letter.toUpperCase();
        })
    );
  };

  const fetchPokemonDescription = useCallback(async (pokemonNameOrId) => {
    try {
      const cleanName = String(pokemonNameOrId).toLowerCase();
      const baseName = cleanName.split("-")[0];
      let speciesRes;
      try {
        speciesRes = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${cleanName}/`
        );
      } catch (err) {
        speciesRes = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${baseName}/`
        );
      }
      setSelectedSpeciesData(speciesRes.data);
      const englishDescription = speciesRes.data.flavor_text_entries?.find(
        (entry) => entry.language.name === "en"
      );
      const cleanedDescription = englishDescription
        ? toSentenceCase(englishDescription.flavor_text.replace(/\f/g, " "))
        : "No Pokédex entry recorded for this form.";
      setSelectedPokemonDescription(cleanedDescription);
    } catch (error) {
      setSelectedSpeciesData(null);
      setSelectedPokemonDescription("No Pokédex entry recorded for this form.");
    }
  }, []);

  const handleSearchAndFilter = useCallback(
    async (nameQuery, typeQuery, selectedRegion, selectedGenerationId, selectedCategory, selectedCollection) => {
      setIsLoading(true);
      setFilteredPokemon([]);
      setSelectedPokemon(null);
      setSelectedPokemonDescription("");
      setShowScanner(false);
      setCurrentPage(1);

      const queryLower = nameQuery ? nameQuery.trim().toLowerCase() : "";

      // Fast direct lookup for exact name or ID query
      if (queryLower && !typeQuery && !selectedRegion && !selectedGenerationId && !selectedCategory && !selectedCollection) {
        try {
          const directRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${queryLower}`);
          if (directRes.data) {
            setSelectedPokemon(directRes.data);
            fetchPokemonDescription(directRes.data.name);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Not an exact direct match, continue to dataset filter
        }
      }

      let currentList = pokemonList;
      if (!hasFetchedAllPokemon || currentList.length === 0) {
        const fetched = await fetchAllPokemonData();
        if (fetched && fetched.length > 0) {
          currentList = fetched;
        }
      }

      let generationPokemonNames = null;
      if (selectedGenerationId) {
        if (generationSpeciesCache.current[selectedGenerationId]) {
          generationPokemonNames =
            generationSpeciesCache.current[selectedGenerationId];
        } else {
          const genSpeciesRes = await axios.get(
            `https://pokeapi.co/api/v2/generation/${selectedGenerationId}/`
          );
          const speciesNames = new Set(
            genSpeciesRes.data.pokemon_species.map((species) => species.name)
          );
          generationSpeciesCache.current[selectedGenerationId] = speciesNames;
          generationPokemonNames = speciesNames;
        }
      }

      const filtered = currentList.filter((pokemon) => {
        let matchesName = true;
        const queryLower = nameQuery.trim().toLowerCase();
        if (queryLower) {
          const nameMatch = pokemon.name.toLowerCase().includes(queryLower);
          
          // Generate same tag categories parsed in PokemonCard.jsx
          const tags = [];
          const name = pokemon.name.toLowerCase();
          if (name.includes("-mega")) tags.push("mega evolution", "mega");
          if (name.includes("-alola")) tags.push("alolan form", "alolan", "alola");
          if (name.includes("-galar")) tags.push("galarian form", "galarian", "galar");
          if (name.includes("-hisui")) tags.push("hisuian form", "hisuian", "hisui");
          if (name.includes("-paldea")) tags.push("paldean form", "paldean", "paldea");
          if (name.includes("-gmax")) tags.push("gigantamax", "gmax");
          if (!pokemon.is_default && !name.includes("-mega") && !name.includes("-gmax")) tags.push("special form", "special");

          const tagMatch = tags.some((tag) => tag.includes(queryLower) || queryLower.includes(tag));
          matchesName = nameMatch || tagMatch;
        }

        const matchesType = typeQuery
          ? pokemon.types.some((type) => type.type.name === typeQuery)
          : true;

        const matchesGeneration = selectedGenerationId
          ? generationPokemonNames.has(pokemon.name)
          : true;

        let matchesRegion = true;
        if (selectedRegion) {
          const reg = selectedRegion.toLowerCase();
          const pName = pokemon.name.toLowerCase();

          // Check if this Pokemon is an explicit regional variant of a specific region
          const isGalarForm = pName.includes("-galar");
          const isPaldeaForm = pName.includes("-paldea");
          const isAlolaForm = pName.includes("-alola");
          const isHisuiForm =
            pName.includes("-hisui") ||
            pName === "basculegion" ||
            pName === "sneasler" ||
            pName === "overqwil" ||
            pName === "enamorus" ||
            pName === "dialga-origin" ||
            pName === "palkia-origin";

          if (isGalarForm && reg !== "galar") {
            matchesRegion = false;
          } else if (isPaldeaForm && reg !== "paldea") {
            matchesRegion = false;
          } else if (isAlolaForm && reg !== "alola") {
            matchesRegion = false;
          } else if (isHisuiForm && reg !== "hisui") {
            matchesRegion = false;
          } else if (reg === "hisui") {
            if (isHisuiForm) {
              matchesRegion = true;
            } else {
              const speciesName = pokemon.species?.name || pokemon.name.split("-")[0];
              const mappedRegions =
                pokemonToRegionMapRef.current[pokemon.name] ||
                pokemonToRegionMapRef.current[speciesName] ||
                [];
              matchesRegion = mappedRegions.some((r) => r.toLowerCase() === "hisui");
            }
          } else if (reg === "galar") {
            if (isGalarForm || pName.includes("-gmax")) {
              matchesRegion = true;
            } else {
              const speciesName = pokemon.species?.name || pokemon.name.split("-")[0];
              const mappedRegions =
                pokemonToRegionMapRef.current[pokemon.name] ||
                pokemonToRegionMapRef.current[speciesName] ||
                [];
              const debut = getDebutRegion(pokemon);
              matchesRegion =
                mappedRegions.some((r) => r.toLowerCase() === "galar") || debut === "galar";
            }
          } else if (reg === "paldea") {
            if (isPaldeaForm) {
              matchesRegion = true;
            } else {
              const speciesName = pokemon.species?.name || pokemon.name.split("-")[0];
              const mappedRegions =
                pokemonToRegionMapRef.current[pokemon.name] ||
                pokemonToRegionMapRef.current[speciesName] ||
                [];
              const debut = getDebutRegion(pokemon);
              matchesRegion =
                mappedRegions.some((r) => r.toLowerCase() === "paldea") || debut === "paldea";
            }
          } else {
            if (pName.includes(`-${reg}`)) {
              matchesRegion = true;
            } else {
              const speciesName = pokemon.species?.name || pokemon.name.split("-")[0];
              const mappedRegions = pokemonToRegionMapRef.current[pokemon.name] || [];
              const baseRegions = pokemonToRegionMapRef.current[speciesName] || [];
              const debut = getDebutRegion(pokemon);
              matchesRegion =
                mappedRegions.some((r) => r.toLowerCase() === reg) ||
                baseRegions.some((r) => r.toLowerCase() === reg) ||
                debut === reg;
            }
          }
        }

        let matchesCategory = true;
        if (selectedCategory) {
          const pName = pokemon.name.toLowerCase();
          if (selectedCategory === "mega") {
            matchesCategory = pName.includes("-mega");
          } else if (selectedCategory === "gmax") {
            matchesCategory = pName.includes("-gmax");
          } else if (selectedCategory === "alola") {
            matchesCategory = pName.includes("-alola");
          } else if (selectedCategory === "galar") {
            matchesCategory = pName.includes("-galar");
          } else if (selectedCategory === "hisui") {
            matchesCategory = pName.includes("-hisui") || pName === "basculegion" || pName === "sneasler" || pName === "overqwil" || pName === "enamorus" || pName === "dialga-origin" || pName === "palkia-origin";
          } else if (selectedCategory === "paldea") {
            matchesCategory = pName.includes("-paldea");
          } else if (selectedCategory === "special") {
            matchesCategory = !pokemon.is_default && !pName.includes("-mega") && !pName.includes("-gmax");
          }
        }

        let matchesCollection = true;
        if (selectedCollection) {
          const status = trainerCollection[pokemon.id];
          if (selectedCollection === "caught") {
            matchesCollection = status === "caught" || status === "shiny";
          } else if (selectedCollection === "uncaught") {
            matchesCollection = !status;
          } else if (selectedCollection === "shiny") {
            matchesCollection = status === "shiny";
          } else if (selectedCollection === "wishlist") {
            matchesCollection = status === "wishlist";
          }
        }

        return matchesName && matchesType && matchesGeneration && matchesRegion && matchesCategory && matchesCollection;
      });

      // Sort exact matches, default forms, and canon ID first
      filtered.sort((a, b) => {
        if (queryLower) {
          const aExact = a.name.toLowerCase() === queryLower;
          const bExact = b.name.toLowerCase() === queryLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          const aStarts = a.name.toLowerCase().startsWith(queryLower);
          const bStarts = b.name.toLowerCase().startsWith(queryLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
        }

        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;

        return a.id - b.id;
      });

      setFilteredPokemon(filtered);

      // Auto-select exact canonical match if query specifically matches
      const exactDefaultMatch = filtered.find(
        (p) => p.name.toLowerCase() === queryLower && p.is_default
      );
      if (exactDefaultMatch && queryLower) {
        setSelectedPokemon(exactDefaultMatch);
        fetchPokemonDescription(exactDefaultMatch.name);
        setFilteredPokemon([]);
      } else if (filtered.length === 1 && queryLower) {
        setSelectedPokemon(filtered[0]);
        fetchPokemonDescription(filtered[0].name);
        setFilteredPokemon([]);
      }

      setIsLoading(false);
    },
    [
      pokemonList,
      hasFetchedAllPokemon,
      fetchAllPokemonData,
      fetchPokemonDescription,
      trainerCollection,
    ]
  );

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setSelectedPokemonDescription("");
    fetchPokemonDescription(pokemon.name);
    setFilteredPokemon([]);
    setShowScanner(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePokemonScanned = useCallback((pokemon) => {
    setSelectedPokemon(pokemon);
    fetchPokemonDescription(pokemon.name);
    setFilteredPokemon([]);
    setShowScanner(false);
  }, [fetchPokemonDescription]);

  const handleScanningChange = useCallback((scanning) => {
    setIsScanning(scanning);
  }, []);

  const handleCloseScanner = useCallback(() => {
    setShowScanner(false);
    setIsScanning(false);
  }, []);

  const handleGoHome = useCallback(() => {
    setActiveAppMode("pokedex");
    setFilteredPokemon([]);
    setSelectedPokemon(null);
    setSelectedSpeciesData(null);
    setSelectedPokemonDescription("");
    setShowScanner(false);
    setIsScanning(false);
    setIsLoading(false);
    setFilterResetKey((currentKey) => currentKey + 1);
    randomizeHeroPokemon();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [randomizeHeroPokemon]);

  const handleSelectPokemonByName = useCallback(
    async (nameOrId) => {
      setIsLoading(true);
      setActiveAppMode("pokedex");
      try {
        const query = String(nameOrId).trim().toLowerCase();
        const res = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${query}`
        );
        if (res.data) {
          setSelectedPokemon(res.data);
          fetchPokemonDescription(res.data.name);
          setFilteredPokemon([]);
          setShowScanner(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (e) {
        toast.error(`Could not load details for ${nameOrId}`);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPokemonDescription]
  );

  const handleRandomPokemon = useCallback(() => {
    // Pick random ID between 1 and 1025
    const randomId = Math.floor(Math.random() * 1025) + 1;
    handleSelectPokemonByName(String(randomId));
  }, [handleSelectPokemonByName]);



  const handleToggleCompare = useCallback((pokemon) => {
    const exists = comparedPokemon.some((p) => p.id === pokemon.id);
    if (exists) {
      setComparedPokemon((current) => current.filter((p) => p.id !== pokemon.id));
      toast.info(`Removed ${formatPokemonName(pokemon.name)} from comparison.`);
    } else {
      if (comparedPokemon.length >= 3) {
        toast.warning("Comparative list is full! Maximum limit is 3 Pokémon.");
      } else {
        setComparedPokemon((current) => [...current, pokemon]);
        toast.success(`Registered ${formatPokemonName(pokemon.name)} for comparison.`);
      }
    }
  }, [comparedPokemon]);

  const paginatedPokemon = useMemo(() => {
    return filteredPokemon.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredPokemon, currentPage]);

  const handleBrowseDex = useCallback(async () => {
    setIsLoading(true);
    setSelectedPokemon(null);
    setSelectedPokemonDescription("");
    setShowScanner(false);
    setCurrentPage(1);

    let list = pokemonList;
    if (!hasFetchedAllPokemon || list.length === 0) {
      const fetched = await fetchAllPokemonData();
      if (fetched && fetched.length > 0) {
        list = fetched;
      }
    }
    setFilteredPokemon(list);
    setIsLoading(false);
  }, [hasFetchedAllPokemon, fetchAllPokemonData, pokemonList]);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center transition-all duration-350 relative overflow-hidden ${getBackgroundStyle()}`}>
      
      {/* Restored Authentic Dual Poké Ball Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 select-none overflow-hidden">
        {/* Top-Right Ambient Poké Ball Motif */}
        <div className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 w-80 h-80 sm:w-[500px] sm:h-[500px] text-theme-watermark">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className="w-full h-full">
            <circle cx="50" cy="50" r="45" />
            <line x1="5" y1="50" x2="95" y2="50" />
            <circle cx="50" cy="50" r="14" fill="currentColor" className="opacity-15" />
            <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
        {/* Bottom-Left Ambient Poké Ball Motif */}
        <div className="absolute -bottom-20 -left-20 sm:-bottom-28 sm:-left-28 w-72 h-72 sm:w-[420px] sm:h-[420px] text-theme-watermark">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className="w-full h-full">
            <circle cx="50" cy="50" r="45" />
            <line x1="5" y1="50" x2="95" y2="50" />
            <circle cx="50" cy="50" r="14" fill="currentColor" className="opacity-15" />
            <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        toastClassName="bg-theme-surface border-2 border-theme-accent text-theme-primary rounded-xl font-display"
      />

      {/* Sticky Floating Top Bar */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="fixed top-0 inset-x-0 z-40 bg-theme-surface border-b border-theme shadow-md px-3 sm:px-4 py-2 sm:py-2.5"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 focus:outline-none cursor-pointer group flex-shrink-0"
                title="Pokédex Home"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <circle cx="100" cy="100" r="95" fill="#f8fafc" stroke="#0f172a" strokeWidth="12" />
                    <path d="M5,100 a95,95 0 0,1 190,0" fill="var(--color-accent-red)" stroke="#0f172a" strokeWidth="12" />
                    <rect x="5" y="94" width="190" height="12" fill="#0f172a" />
                    <circle cx="100" cy="100" r="32" fill="#f8fafc" stroke="#0f172a" strokeWidth="12" />
                    <circle cx="100" cy="100" r="16" fill="#cbd5e1" stroke="#475569" strokeWidth="4" />
                  </svg>
                </div>
                <span className="font-display font-extrabold text-base text-theme-primary hidden md:inline">
                  Pokédex
                </span>
              </button>

              {/* Mode Switcher in Sticky Header */}
              <div className="flex items-center gap-1 bg-theme-input p-1 rounded-xl border border-theme flex-shrink-0">
                <button
                  onClick={() => {
                    setActiveAppMode("pokedex");
                    setSelectedPokemon(null);
                    randomizeHeroPokemon();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-display flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeAppMode === "pokedex"
                      ? "bg-rose-600 text-white font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary font-medium"
                  }`}
                  title="National Pokédex"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h6m6 0h6" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity={0.2} />
                  </svg>
                  <span className="hidden sm:inline">Pokédex</span>
                </button>
                <button
                  onClick={() => setActiveAppMode("items")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-display flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeAppMode === "items"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary font-medium"
                  }`}
                  title="Trainer's Bag (Items Database)"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    <path d="M8 14h8" />
                  </svg>
                  <span className="hidden sm:inline">Bag</span>
                </button>
                <button
                  onClick={() => setActiveAppMode("battle-lab")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-display flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeAppMode === "battle-lab"
                      ? "bg-indigo-600 text-white font-bold shadow-xs"
                      : "text-theme-secondary hover:text-theme-primary font-medium"
                  }`}
                  title="Battle Lab (Competitive)"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
                    <path d="m13 19 6 2 2-6-2-2-6 6Z" />
                    <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
                    <path d="m11 19-6 2-2-6 2-2 6 6Z" />
                  </svg>
                  <span className="hidden sm:inline">Battle Lab</span>
                </button>
              </div>

              {activeAppMode === "pokedex" && (
                <div className="flex-grow max-w-xl min-w-0 hidden lg:block">
                  <FilterType
                    compact={true}
                    key={`sticky-${filterResetKey}`}
                    types={types}
                    generations={generations}
                    regions={regions}
                    onSearchAndFilter={handleSearchAndFilter}
                    isLoading={isLoading}
                  />
                </div>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRandomPokemon}
                  className="px-2.5 py-2 bg-theme-surface-hover border border-theme text-theme-primary rounded-lg font-display font-bold text-xs hover:border-theme-accent cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                  title="Random Pokémon"
                  aria-label="Random Pokémon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-theme-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                  </svg>
                  <span className="hidden sm:inline">Random</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className="p-2 sm:px-3 py-2 bg-theme-surface-hover border border-theme text-theme-primary rounded-lg font-display font-semibold text-xs hover:border-theme-accent cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                  title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364 6.364l-1.591-1.591M6.758 6.758L5.167 5.167m12.728 0l-1.591 1.591M6.758 17.242l-1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                      </svg>
                      <span className="hidden sm:inline">Light</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                      <span className="hidden sm:inline">Dark</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowScanner(true)}
                  className="p-2 sm:px-3 py-2 bg-theme-accent text-white rounded-lg shadow-sm hover:opacity-95 cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                  title="Open Dex Scanner"
                  aria-label="Scan Pokemon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15.5a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.053 47.745 47.745 0 00-3.91-.228 2.192 2.192 0 00-1.736 1.053l-.822 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
                  </svg>
                  <span className="hidden sm:inline">Scanner</span>
                </motion.button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <div className="flex-grow flex flex-col items-center w-full py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl z-10">
        
        {/* Main Pokedex Header Title Bar */}
        <div className="w-full flex items-center justify-between mb-6 sm:mb-8 select-none">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              type="button"
              onClick={handleGoHome}
              className="rounded-full focus:outline-none focus:ring-4 focus:ring-theme-accent/50 cursor-pointer"
              title="Pokédex Home"
              aria-label="Go to main screen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
              >
                <circle cx="100" cy="100" r="95" fill="#f8fafc" stroke="#0f172a" strokeWidth="12" />
                <path d="M5,100 a95,95 0 0,1 190,0" fill="var(--color-accent-red)" stroke="#0f172a" strokeWidth="12" />
                <rect x="5" y="94" width="190" height="12" fill="#0f172a" />
                <circle cx="100" cy="100" r="32" fill="#f8fafc" stroke="#0f172a" strokeWidth="12" />
                <circle cx="100" cy="100" r="16" fill="#cbd5e1" stroke="#475569" strokeWidth="4" />
              </svg>
            </motion.button>
            <span
              onClick={handleGoHome}
              className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-[-0.02em] select-none cursor-pointer"
              style={{
                backgroundImage: "linear-gradient(to right, var(--color-accent-red), var(--color-text-primary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
              }}
            >
              Pokédex
            </span>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRandomPokemon}
              className="px-3 sm:px-4 py-2 bg-theme-surface border border-theme text-theme-primary rounded-lg font-display font-semibold text-xs tracking-wide cursor-pointer flex items-center gap-1.5 min-h-[38px] hover:border-theme-accent"
              title="Load Random Pokémon"
              aria-label="Random Pokémon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-theme-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>
              <span>Random</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="px-3 sm:px-4 py-2 bg-theme-accent text-white font-display font-semibold text-xs rounded-lg shadow-sm hover:opacity-90 cursor-pointer flex items-center gap-1.5 min-h-[38px]"
              title="Launch Dex Scanner"
              aria-label="Scan Pokemon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15.5a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.053 47.745 47.745 0 00-3.91-.228 2.192 2.192 0 00-1.736 1.053l-.822 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
              </svg>
              <span>Scanner</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="px-3 sm:px-4 py-2 bg-theme-surface border border-theme text-theme-primary rounded-lg font-display font-semibold text-xs tracking-wide cursor-pointer flex items-center gap-1.5 min-h-[38px] hover:border-theme-accent"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364 6.364l-1.591-1.591M6.758 6.758L5.167 5.167m12.728 0l-1.591 1.591M6.758 17.242l-1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                  </svg>
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Primary Top Navigation Switcher */}
        <div className="w-full max-w-xl flex items-center justify-center p-1.5 bg-theme-surface border border-theme rounded-2xl shadow-sm mb-6 sm:mb-8 select-none">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              setActiveAppMode("pokedex");
              setSelectedPokemon(null);
              randomizeHeroPokemon();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeAppMode === "pokedex"
                ? "bg-rose-600 text-white font-extrabold shadow-sm"
                : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h6m6 0h6" />
              <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity={0.2} />
            </svg>
            <span>National Dex</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveAppMode("items")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeAppMode === "items"
                ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              <path d="M8 14h8" />
            </svg>
            <span>Trainer's Bag</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveAppMode("battle-lab")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeAppMode === "battle-lab"
                ? "bg-indigo-600 text-white font-extrabold shadow-sm"
                : "text-theme-secondary hover:text-theme-primary hover:bg-theme-surface-hover font-semibold"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
              <path d="m13 19 6 2 2-6-2-2-6 6Z" />
              <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
              <path d="m11 19-6 2-2-6 2-2 6 6Z" />
            </svg>
            <span>Battle Lab</span>
          </motion.button>
        </div>

        {/* Scanner Component Modal */}
        {showScanner && (
          <PokemonScanner
            pokemonList={memoizedPokemonList}
            onPokemonScanned={handlePokemonScanned}
            onScanningChange={handleScanningChange}
            fetchPokemonDescription={fetchPokemonDescription}
            isVisible={showScanner}
            onClose={handleCloseScanner}
          />
        )}

        {/* Mode 1: Trainer's Bag (Items Database) */}
        {activeAppMode === "items" && (
          <ItemsDex
            onSelectPokemon={(name) => {
              setActiveAppMode("pokedex");
              handleSelectPokemonByName(name);
            }}
          />
        )}

        {/* Mode 2: Battle Lab (Competitive Corner) */}
        {activeAppMode === "battle-lab" && (
          <BattleLab pokemonList={memoizedPokemonList} />
        )}

        {/* Mode 3: National Dex (Core Pokédex) */}
        {activeAppMode === "pokedex" && (
          <>
            {/* Dashboard Filter Bar */}
            <div className="w-full max-w-4xl flex items-center justify-center mb-8 sm:mb-10">
              <FilterType
                key={filterResetKey}
                types={types}
                generations={generations}
                regions={regions}
                onSearchAndFilter={handleSearchAndFilter}
                isLoading={isLoading}
              />
            </div>

        {/* Custom Poké Ball loading animation */}
        {(isLoading || isScanning) && (
          <PokeBallLoader
            message={isScanning ? "DEX LENS SEARCHING ARCHIVES..." : "CONNECTING TO POKÉ-SERVERS..."}
          />
        )}

        {/* Selected Pokémon detailed view */}
        {selectedPokemon && !showScanner && (
          <div className="w-full max-w-6xl xl:max-w-7xl mb-8 px-2 sm:px-4">
            <PokemonCard
              pokemon={selectedPokemon}
              layout="horizontal"
              pokemonToRegionMap={pokemonToRegionMapRef.current}
              description={selectedPokemonDescription}
              speciesData={selectedSpeciesData}
              onSelectPokemon={handleSelectPokemonByName}
            />
          </div>
        )}

        {/* Staggered result cards grid */}
        {filteredPokemon.length > 0 && !showScanner && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-4 w-full max-w-screen-xl">
              {paginatedPokemon.map((pokemon, idx) => (
                <motion.div
                  key={pokemon.id}
                  onClick={() => handleCardClick(pokemon)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: Math.min((idx % ITEMS_PER_PAGE) * 0.03, 0.4),
                  }}
                  className="cursor-pointer h-full"
                >
                  <PokemonCard
                    pokemon={pokemon}
                    layout="vertical"
                    pokemonToRegionMap={pokemonToRegionMapRef.current}
                    onToggleCompare={handleToggleCompare}
                    isCompared={comparedPokemon.some((p) => p.id === pokemon.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Infinite Scroll Sentinel & Auto-Loader */}
            {filteredPokemon.length > paginatedPokemon.length ? (
              <div
                ref={loadMoreRef}
                className="flex flex-col items-center justify-center mt-10 mb-8 py-4 select-none"
              >
                <div className="flex items-center gap-3 text-xs font-display font-semibold text-theme-secondary bg-theme-surface border border-theme px-4 py-2 rounded-lg shadow-sm">
                  <svg className="animate-spin h-4 w-4 text-theme-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Showing <span className="font-extrabold text-theme-primary">{paginatedPokemon.length}</span> of <span className="font-extrabold text-theme-primary">{filteredPokemon.length}</span> Pokémon · Auto-loading...</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center mt-10 mb-8 select-none">
                <span className="text-xs font-display text-theme-secondary bg-theme-surface border border-theme px-4 py-2 rounded-lg">
                  All <span className="font-extrabold text-theme-primary">{filteredPokemon.length}</span> Pokémon loaded
                </span>
              </div>
            )}
          </>
        )}

        {/* Landing Open Hero Canvas Screen */}
        {!isLoading &&
          !selectedPokemon &&
          filteredPokemon.length === 0 &&
          !isScanning &&
          !showScanner && (
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 90, damping: 16 }}
              className="flex flex-col items-center w-full max-w-5xl mt-2 sm:mt-4 select-none"
            >
              {/* Hero Main Block */}
              <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8 sm:gap-12 py-4 sm:py-10 relative">
                <div className="flex-grow flex flex-col items-start text-left max-w-xl">
                  {/* High-Impact Headline */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-theme-primary leading-[1.15] tracking-tight mb-4">
                    The Complete <span className="text-theme-accent">Pokédex</span> & Battle Database
                  </h2>

                  {/* Supporting text */}
                  <p className="text-sm sm:text-base md:text-lg font-display text-theme-secondary tracking-normal mb-6 sm:mb-7 leading-relaxed">
                    Explore 1,025 species with full learnsets, pre-evolution egg move inheritance, multi-game lore archives, and an instant AI Dex Lens for live identification.
                  </p>

                  {/* Action CTA */}
                  <div className="flex flex-wrap gap-3 sm:gap-4 w-full">
                    <button
                      onClick={handleBrowseDex}
                      className="px-6 sm:px-8 py-3.5 bg-theme-accent text-white font-display font-bold text-xs sm:text-sm rounded-lg shadow-[0_4px_16px_rgba(225,29,72,0.35)] hover:opacity-95 transition-transform active:scale-[0.97] focus:outline-none flex items-center justify-center gap-2 border border-theme-accent cursor-pointer min-h-[44px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                      </svg>
                      Browse National Dex
                    </button>
                  </div>
                </div>

                {/* Random Showdown Battle Sprite Showcase Stage */}
                <div className="relative flex flex-col items-center justify-center flex-shrink-0 my-4 lg:my-0 group select-none min-w-[240px] sm:min-w-[280px]">
                  {/* Soft Radiant Ambient Glow */}
                  <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-theme-accent/15 filter blur-3xl pointer-events-none -z-10" />

                  {/* Floating Animated Showdown Sprite Stage */}
                  <div className="relative motion-safe:animate-float z-10 flex flex-col items-center">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleSelectPokemonByName(heroPokemon.id)}
                      className="relative group/sprite cursor-pointer p-2 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent transition-all"
                      title={`View ${heroPokemon.displayName || "Pokémon"} in Pokédex`}
                      aria-label={`View ${heroPokemon.displayName || "Pokémon"} in Pokédex`}
                    >
                      <img
                        key={`${heroPokemon.id}-${heroPokemon.isShiny}`}
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${heroPokemon.isShiny ? "shiny/" : ""}${heroPokemon.id}.gif`}
                        alt={heroPokemon.displayName || "Featured Pokémon"}
                        className="w-48 h-48 sm:w-60 sm:h-60 md:w-68 md:h-68 object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)]"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => {
                          // Fallback to HOME artwork if animated showdown gif isn't available
                          e.target.onerror = null;
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${heroPokemon.isShiny ? "shiny/" : ""}${heroPokemon.id}.png`;
                        }}
                      />
                      {heroPokemon.isShiny && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono-tech font-bold text-amber-400 tracking-wider flex items-center gap-1 shadow-xs pointer-events-none">
                          <svg className="w-2.5 h-2.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          SHINY
                        </span>
                      )}
                    </motion.button>

                    {/* Quick Re-Roll Controller */}
                    <div className="mt-1 flex items-center justify-center">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          randomizeHeroPokemon();
                        }}
                        className="p-2 bg-theme-surface/80 hover:bg-theme-surface border border-theme hover:border-theme-accent text-theme-secondary hover:text-theme-primary rounded-full cursor-pointer shadow-xs transition-colors backdrop-blur-xs"
                        title="Roll another random Pokémon"
                        aria-label="Roll another random Pokémon"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                          <path d="M16 21h5v-5" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Column Telemetry Stat Strip */}
              <div className="w-full mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-theme">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 divide-y sm:divide-y-0 sm:divide-x divide-theme w-full text-center">
                  <div className="flex flex-col items-center px-2 sm:px-4">
                    <span className="text-xl sm:text-3xl md:text-4xl font-display font-black text-theme-primary tracking-tight font-mono-tech">
                      {pokemonList.length > 0 ? pokemonList.length.toLocaleString() : "1,025"}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono-tech text-theme-secondary uppercase tracking-wider mt-1 text-center">
                      Canon Species
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2 sm:px-4">
                    <span className="text-xl sm:text-3xl md:text-4xl font-display font-black text-theme-primary tracking-tight font-mono-tech">
                      {regions.length > 0 ? regions.length : 10}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono-tech text-theme-secondary uppercase tracking-wider mt-1 text-center">
                      Canon Regions
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2 sm:px-4 pt-4 sm:pt-0">
                    <span className="text-xl sm:text-3xl md:text-4xl font-display font-black text-emerald-400 tracking-tight font-mono-tech">
                      {caughtCount}
                      <span className="text-xs sm:text-sm text-theme-secondary font-normal font-display ml-1">/ 1,025</span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono-tech text-theme-secondary uppercase tracking-wider mt-1 text-center">
                      Living Dex Caught
                    </span>
                  </div>
                  <div className="flex flex-col items-center px-2 sm:px-4 pt-4 sm:pt-0">
                    <span className="text-xl sm:text-3xl md:text-4xl font-display font-black text-rose-500 tracking-tight flex items-center justify-center gap-1.5 sm:gap-2 font-mono-tech">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      LIVE
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono-tech text-theme-secondary uppercase tracking-wider mt-1 text-center">
                      AI Optical Lens
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>

      {/* Floating Compare drawer bar */}
      {comparedPokemon.length > 0 && (
        <div className="fixed bottom-3 sm:bottom-6 inset-x-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="pointer-events-auto bg-theme-surface/95 backdrop-blur-md border border-theme rounded-xl shadow-2xl p-2.5 sm:p-4 flex flex-col gap-2 w-full max-w-lg select-none"
          >
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5">
                {comparedPokemon.map((p) => (
                  <motion.div
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    key={p.id}
                    className="relative group flex-shrink-0"
                  >
                    <div className="w-9 h-9 sm:w-11 sm:h-11 bg-theme-input rounded-xl p-1 flex items-center justify-center">
                      <img
                        src={p.sprites?.other?.home?.front_default || p.sprites?.front_default}
                        alt={formatPokemonName(p.name)}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompare(p);
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-theme-accent hover:opacity-90 rounded-full w-4.5 h-4.5 flex items-center justify-center border border-theme text-white text-[9px] font-bold cursor-pointer"
                      title="Remove"
                    >
                      &times;
                    </button>
                  </motion.div>
                ))}

                {/* Empty slots placeholders */}
                {Array.from({ length: 3 - comparedPokemon.length }).map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 sm:w-11 sm:h-11 bg-theme-input/40 border-2 border-dashed border-theme rounded-xl flex items-center justify-center text-theme-secondary/40 text-xs font-display font-semibold flex-shrink-0"
                  >
                    +
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={() => setShowCompareModal(true)}
                  className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-bold font-display rounded-xl shadow-md whitespace-nowrap cursor-pointer min-h-[36px]"
                  disabled={comparedPokemon.length < 2}
                  title={comparedPokemon.length < 2 ? "Add at least 2 Pokemon to compare" : "Open comparison charts"}
                >
                  Compare ({comparedPokemon.length}/3)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={() => setComparedPokemon([])}
                  className="px-2 sm:px-3 py-2 bg-theme-surface-hover hover:opacity-85 text-theme-secondary text-[11px] sm:text-xs font-display rounded-xl border border-theme cursor-pointer min-h-[36px]"
                >
                  Clear
                </motion.button>
              </div>
            </div>

            {/* Progress Bar under Compare count - reaches exactly 100% when 3/3 */}
            <div className="w-full">
              <div className="w-full h-1 bg-theme-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-theme-accent transition-all duration-300 rounded-full"
                  style={{ width: `${(comparedPokemon.length / 3) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Side-by-side Comparative Analysis modal dialog */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="bg-theme-surface border border-theme rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 shadow-2xl relative"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 bg-theme-surface-hover text-theme-primary font-bold p-2 rounded-lg border border-theme hover:border-theme-accent flex items-center justify-center focus:outline-none cursor-pointer min-w-[36px] min-h-[36px]"
              title="Close Comparison Panel"
              aria-label="Close Comparison Panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-theme-primary mb-4 sm:mb-6 tracking-[-0.015em] pr-12">
              Dex Comparative Analysis
            </h2>

            <div className={`grid grid-cols-1 ${comparedPokemon.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3"} gap-4 sm:gap-6`}>
              {comparedPokemon.map((p) => {
                const img = p.sprites?.other?.home?.front_default || p.sprites?.front_default;
                const totalStats = p.stats.reduce((sum, s) => sum + s.base_stat, 0);

                return (
                  <div
                    key={p.id}
                    className="bg-theme-bg border border-theme rounded-2xl p-5 flex flex-col items-center shadow-md relative animate-card-in"
                  >
                    <div className="absolute top-3 right-3 text-[10px] font-display font-semibold text-theme-accent">
                      #{String(p.id).padStart(3, "0")}
                    </div>

                    {/* Image container set to p-2.5 (~10px padding) to occupy 80-90% of frame without cropping */}
                    <div className="w-28 h-28 bg-theme-surface rounded-xl p-2.5 flex items-center justify-center mb-4">
                      <img
                        src={img}
                        alt={formatPokemonName(p.name)}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <h3 className="text-lg font-display font-bold text-theme-primary text-center mb-2">
                      {formatPokemonName(p.name)}
                    </h3>

                    {/* Dynamic Brand Accurate Flat Type Badges (no glossy look) */}
                    <div className="flex gap-1.5 mb-5 justify-center flex-wrap">
                      {p.types.map((t) => (
                        <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                      ))}
                    </div>

                    <div className="w-full flex flex-col gap-3.5 border-t border-theme pt-4">
                      <div className="flex justify-between text-xs font-display">
                        <span className="text-theme-secondary">HEIGHT</span>
                        <span className="text-theme-primary font-semibold">{(p.height / 10).toFixed(1)} m</span>
                      </div>
                      <div className="flex justify-between text-xs font-display pb-3.5 border-b border-theme">
                        <span className="text-theme-secondary">WEIGHT</span>
                        <span className="text-theme-primary font-semibold">{(p.weight / 10).toFixed(1)} kg</span>
                      </div>

                      {/* Stat Bars Comparison */}
                      {p.stats.map((s) => {
                        const meta = statMeta[s.stat.name];
                        if (!meta) return null;
                        const pct = Math.min((s.base_stat / meta.max) * 100, 100);

                        return (
                          <div key={s.stat.name} className="flex flex-col text-[10px] font-display">
                            <div className="flex justify-between mb-1.5">
                              <span className="text-theme-secondary capitalize">{meta.label}</span>
                              <span className="text-theme-primary font-bold">{s.base_stat}</span>
                            </div>
                            <div className="w-full h-2 bg-theme-surface rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${meta.color} animate-stat-grow`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex justify-between text-xs font-display text-theme-accent pt-2 border-t border-theme">
                        <span className="font-bold">TOTAL SCORE</span>
                        <span className="font-extrabold">{totalStats}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;
