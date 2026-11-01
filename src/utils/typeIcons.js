/**
 * Utility mapping for Local Official Pokémon SVG Type Badges (150x36)
 * Traced genuine vector SVGs stored locally in /assets/types/{typeName}.svg
 * Original source PNGs archived in /assets/types/png/{typeName}.png
 */

export const TYPE_NAMES = [
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
];

export const TYPE_IDS = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
  stellar: 19,
};

export const typeColors = {
  normal: "bg-[#9fa19f] text-white border-[#8d908d]",
  fire: "bg-[#e62829] text-white border-[#d21f20]",
  water: "bg-[#2980ef] text-white border-[#1d6fd6]",
  grass: "bg-[#3fa129] text-white border-[#328f1e]",
  electric: "bg-[#fac000] text-slate-900 border-[#e0ac00]",
  ice: "bg-[#3dcef3] text-slate-900 border-[#26b8dc]",
  fighting: "bg-[#dc2626] text-white border-[#b91c1c]",
  poison: "bg-[#9141cb] text-white border-[#7c32b0]",
  ground: "bg-[#915121] text-white border-[#7a4218]",
  flying: "bg-[#81b9ef] text-slate-900 border-[#6ca5dc]",
  psychic: "bg-[#ef4179] text-white border-[#d83167]",
  bug: "bg-[#91a119] text-white border-[#7d8c13]",
  rock: "bg-[#afa981] text-slate-900 border-[#999470]",
  ghost: "bg-[#704170] text-white border-[#5e345e]",
  dragon: "bg-[#5060e1] text-white border-[#3e4dc9]",
  steel: "bg-[#60a1b8] text-white border-[#4d8c9f]",
  dark: "bg-[#50413f] text-white border-[#3e3230]",
  fairy: "bg-[#ef70ef] text-slate-900 border-[#d65bd6]",
  stellar: "bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-white border-amber-300",
};

/**
 * Returns the local URL for the genuine SVG vector type badge.
 */
export const getTypeSvgUrl = (typeName) => {
  if (!typeName) return null;
  const cleanName = typeName.toLowerCase().trim();
  if (!TYPE_IDS[cleanName] || cleanName === "stellar") return null;
  const publicUrl = process.env.PUBLIC_URL || "";
  return `${publicUrl}/assets/types/${cleanName}.svg`;
};

/**
 * Returns the local URL for the downloaded reference PNG type badge.
 */
export const getTypePngUrl = (typeName) => {
  if (!typeName) return null;
  const cleanName = typeName.toLowerCase().trim();
  if (!TYPE_IDS[cleanName] || cleanName === "stellar") return null;
  const publicUrl = process.env.PUBLIC_URL || "";
  return `${publicUrl}/assets/types/png/${cleanName}.png`;
};

export const getChampionsTypeBadgeUrl = (typeName) => {
  return getTypeSvgUrl(typeName);
};

export const getTypeIconUrl = (typeName) => {
  return getTypeSvgUrl(typeName);
};
