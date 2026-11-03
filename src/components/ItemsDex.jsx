import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Comprehensive canonical database of items spanning all pockets
export const CANONICAL_ITEMS = [
  // --- POKÉ BALLS ---
  {
    id: 1,
    name: "master-ball",
    displayName: "Master Ball",
    pocket: "balls",
    category: "Standard & Special Balls",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png",
    shortEffect: "Catches any wild Pokémon without fail (100% catch rate).",
    description: "The best Poké Ball with the ultimate level of performance. With it, you will catch any wild Pokémon without fail.",
    flavor: "The peak of Silph Co. ball engineering. Given only to the most accomplished trainers."
  },
  {
    id: 2,
    name: "ultra-ball",
    displayName: "Ultra Ball",
    pocket: "balls",
    category: "Standard & Special Balls",
    cost: 800,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png",
    shortEffect: "An ultra-high performance ball with a 2.0x catch rate modifier.",
    description: "An ultra-high-performance Poké Ball that provides a higher success rate for catching Pokémon than a Great Ball.",
    flavor: "A sleek black-and-yellow casing crafted for capturing elusive high-level wild Pokémon."
  },
  {
    id: 3,
    name: "great-ball",
    displayName: "Great Ball",
    pocket: "balls",
    category: "Standard & Special Balls",
    cost: 600,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",
    shortEffect: "A high-performance ball with a 1.5x catch rate modifier.",
    description: "A good, high-performance Poké Ball that provides a higher Pokémon catch rate than a standard Poké Ball.",
    flavor: "Easily identified by its blue and red markings, standard issue for intermediate trainers."
  },
  {
    id: 4,
    name: "poke-ball",
    displayName: "Poké Ball",
    pocket: "balls",
    category: "Standard & Special Balls",
    cost: 200,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
    shortEffect: "The quintessential device for catching wild Pokémon (1.0x catch rate).",
    description: "A device for catching wild Pokémon. It's thrown like a ball at a Pokémon, comfortably encapsulating its target.",
    flavor: "The timeless red-and-white icon of every trainer's journey across all regions."
  },
  {
    id: 5,
    name: "quick-ball",
    displayName: "Quick Ball",
    pocket: "balls",
    category: "Specialized Balls",
    cost: 1000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png",
    shortEffect: "Has a massive 5.0x catch rate if thrown on the very first turn of battle.",
    description: "A somewhat different Poké Ball that has a more successful catch rate if used at the start of a wild encounter.",
    flavor: "Highly favored by speedrunners and competitive breeders who need instantaneous captures."
  },
  {
    id: 6,
    name: "dusk-ball",
    displayName: "Dusk Ball",
    pocket: "balls",
    category: "Specialized Balls",
    cost: 1000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-ball.png",
    shortEffect: "Has a 3.0x catch rate when used at night or inside dark caves.",
    description: "A somewhat different Poké Ball that makes it easier to catch wild Pokémon at night or in dark places like caves.",
    flavor: "A specialized capsule glowing with dim green phosphorescence."
  },
  {
    id: 7,
    name: "timer-ball",
    displayName: "Timer Ball",
    pocket: "balls",
    category: "Specialized Balls",
    cost: 1000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png",
    shortEffect: "Becomes progressively more effective as the battle drags on (up to 4.0x at turn 10+).",
    description: "A somewhat different Poké Ball that becomes progressively more effective the more turns that pass in battle.",
    flavor: "The ultimate weapon for marathon battles against stubborn legendary Pokémon."
  },
  {
    id: 8,
    name: "beast-ball",
    displayName: "Beast Ball",
    pocket: "balls",
    category: "Specialized Balls",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/beast-ball.png",
    shortEffect: "5.0x catch rate on Ultra Beasts from Ultra Space, but a punishing 0.1x on ordinary Pokémon.",
    description: "A special Poké Ball designed to catch Ultra Beasts. It has a low success rate for catching other Pokémon.",
    flavor: "Developed by the Aether Foundation with wormhole distortion containment technology."
  },
  {
    id: 9,
    name: "luxury-ball",
    displayName: "Luxury Ball",
    pocket: "balls",
    category: "Specialized Balls",
    cost: 3000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png",
    shortEffect: "Doubles friendship and happiness gains for the captured Pokémon.",
    description: "A comfortable Poké Ball that makes a caught wild Pokémon quickly grow more friendly.",
    flavor: "Outfitted with lavish internal amenities to soothe and bond with sensitive Pokémon."
  },
  {
    id: 10,
    name: "heavy-ball",
    displayName: "Heavy Ball",
    pocket: "balls",
    category: "Apricorn Balls",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-ball.png",
    shortEffect: "Provides huge catch bonuses against heavy Pokémon (Snorlax, Groudon, Dondozo).",
    description: "A Poké Ball made from Black Apricorns. It is better than usual at catching very heavy Pokémon.",
    flavor: "Hand-crafted in Johto by Kurt using traditional metallurgy and Apricorn shells."
  },

  // --- HELD & BATTLE COMPETITIVE ITEMS ---
  {
    id: 11,
    name: "leftovers",
    displayName: "Leftovers",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png",
    shortEffect: "Restores 1/16th of maximum HP at the end of each turn in battle.",
    description: "An item to be held by a Pokémon. The holder's HP is gradually restored during battle.",
    flavor: "The gold standard defensive recovery item across nine competitive generations. Commonly held by wild Snorlax.",
    heldBy: ["Snorlax", "Munchlax"]
  },
  {
    id: 12,
    name: "life-orb",
    displayName: "Life Orb",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png",
    shortEffect: "Boosts move damage by 1.3x (30%), but drains 10% of holder's max HP on each attack.",
    description: "An item to be held by a Pokémon. It boosts the power of moves, but at the cost of some HP on each hit.",
    flavor: "Pulsating with sinister power. Highly coveted by all-out offensive sweepers like Garchomp and Nidoking."
  },
  {
    id: 13,
    name: "choice-band",
    displayName: "Choice Band",
    pocket: "battle",
    category: "Choice Items",
    cost: 4000,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png",
    shortEffect: "Boosts Physical Attack by 1.5x (50%), but locks the user into the first move selected.",
    description: "An item to be held by a Pokémon. This curious headband boosts Attack but allows the use of only one move.",
    flavor: "A red cloth headband that demands total physical focus at the expense of versatility."
  },
  {
    id: 14,
    name: "choice-specs",
    displayName: "Choice Specs",
    pocket: "battle",
    category: "Choice Items",
    cost: 4000,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png",
    shortEffect: "Boosts Special Attack by 1.5x (50%), but locks the user into the first move selected.",
    description: "An item to be held by a Pokémon. These distinctive glasses boost Sp. Atk but allow the use of only one move.",
    flavor: "Clear optical spectacles that heighten supernatural concentration to devastating extremes."
  },
  {
    id: 15,
    name: "choice-scarf",
    displayName: "Choice Scarf",
    pocket: "battle",
    category: "Choice Items",
    cost: 4000,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png",
    shortEffect: "Boosts Speed by 1.5x (50%), but locks the user into the first move selected.",
    description: "An item to be held by a Pokémon. This curious scarf boosts Speed but allows the use of only one move.",
    flavor: "The quintessential speed-tier disruptor. Lets bulky attackers outspeed hyper-offensive threats."
  },
  {
    id: 16,
    name: "focus-sash",
    displayName: "Focus Sash",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png",
    shortEffect: "Guarantees the holder survives any single One-Hit KO attack with 1 HP when at full health.",
    description: "An item to be held by a Pokémon. If the holder had full HP and is hit by a lethal move, it endures with 1 HP.",
    flavor: "A white headband woven with iron willpower. Essential on frail leads and glass-cannon sweepers."
  },
  {
    id: 17,
    name: "heavy-duty-boots",
    displayName: "Heavy-Duty Boots",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 80,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-duty-boots.png",
    shortEffect: "Completely nullifies the effects of entry hazards (Stealth Rock, Spikes, Toxic Spikes, Sticky Web).",
    description: "These boots prevent the effects of traps set on the battlefield, protecting the holder completely.",
    flavor: "Introduced in Gen 8, single-handedly reviving hazard-weak Flying/Fire/Bug types like Volcarona and Moltres."
  },
  {
    id: 18,
    name: "assault-vest",
    displayName: "Assault Vest",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 80,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png",
    shortEffect: "Boosts Special Defense by 1.5x (50%), but prevents the holder from using status moves.",
    description: "An item to be held by a Pokémon. This offensive vest raises Sp. Def but prevents the use of status moves.",
    flavor: "Transforms already sturdy brawlers like Tyranitar, Goodra, and Ursaluna into impenetrable special walls."
  },
  {
    id: 19,
    name: "rocky-helmet",
    displayName: "Rocky Helmet",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 60,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png",
    shortEffect: "Inflicts 1/6th max HP damage to any attacker that makes contact with the holder.",
    description: "An item to be held by a Pokémon. If the holder is hit by a contact move, the attacker will be damaged.",
    flavor: "Devastates multi-hit physical attackers like Maushold and Urshifu-Rapid-Strike."
  },
  {
    id: 20,
    name: "eviolite",
    displayName: "Eviolite",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 4000,
    flingPower: 40,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eviolite.png",
    shortEffect: "Boosts Defense and Special Defense by 1.5x (50%) for Pokémon that can still evolve.",
    description: "A mysterious evolutionary lump. When held, it raises the Defense and Sp. Def of a Pokémon that is not fully evolved.",
    flavor: "Makes pre-evolved Pokémon like Chansey, Porygon2, Dusclops, and Gligar bulkier than their final forms."
  },
  {
    id: 21,
    name: "booster-energy",
    displayName: "Booster Energy",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/booster-energy.png",
    shortEffect: "Activates Protosynthesis or Quark Drive to boost the holder's highest stat without Sun/Electric Terrain.",
    description: "An item filled with ancient or futuristic energy. It activates the Paradox Pokémon's special ability.",
    flavor: "A capsule holding pure Terastral sub-surface energy from the depths of Area Zero."
  },
  {
    id: 22,
    name: "covert-cloak",
    displayName: "Covert Cloak",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 20000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/covert-cloak.png",
    shortEffect: "Protects the holder from the secondary effects of opposing moves (e.g. Fake Out flinch, Scald burn, Salt Cure).",
    description: "A hooded cloak that conceals the holder, protecting it from the secondary effects of moves.",
    flavor: "The premier anti-flinch and anti-garganacl tech piece in Paldean VGC tournaments."
  },
  {
    id: 23,
    name: "loaded-dice",
    displayName: "Loaded Dice",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 20000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/loaded-dice.png",
    shortEffect: "Guarantees multi-strike moves (Bullet Seed, Icicle Spear, Scale Shot, Population Bomb) hit 4 to 5 times.",
    description: "An item to be held by a Pokémon. It biases dice rolls so multi-strike moves hit more times.",
    flavor: "Turn Breloom and Baxcalibur into unstoppable buzzsaws."
  },
  {
    id: 24,
    name: "clear-amulet",
    displayName: "Clear Amulet",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 30000,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/clear-amulet.png",
    shortEffect: "Shields the holder from having its stats lowered by opponents' moves or abilities (e.g. Intimidate).",
    description: "A clear, glass-like amulet that protects the holder's stats from being lowered by opposing Pokémon.",
    flavor: "Neutralizes Incineroar's and Landorus-Therian's Intimidate drops instantly."
  },
  {
    id: 25,
    name: "weakness-policy",
    displayName: "Weakness Policy",
    pocket: "battle",
    category: "Held Battle Items",
    cost: 50000,
    flingPower: 80,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/weakness-policy.png",
    shortEffect: "Sharply raises Attack and Sp. Atk by +2 stages when hit by a super-effective attack.",
    description: "An item to be held by a Pokémon. If hit by a move it is weak to, it sharply raises Attack and Sp. Atk.",
    flavor: "Turns a defensive liability into immediate offensive sweep momentum."
  },

  // --- EVOLUTION STONES & CATALYSTS ---
  {
    id: 26,
    name: "fire-stone",
    displayName: "Fire Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 3000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png",
    shortEffect: "A peculiar stone that triggers evolution in certain Fire-type and hybrid Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It has an orange core that radiates heat.",
    flavor: "A fiery gemstone that feels hot to the touch, forged in dormant volcanic fissures.",
    evolves: ["Eevee → Flareon", "Vulpix → Ninetales", "Growlithe → Arcanine", "Pansear → Simisear", "Capsakid → Scovillain"]
  },
  {
    id: 27,
    name: "water-stone",
    displayName: "Water Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 3000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png",
    shortEffect: "A peculiar stone that triggers evolution in certain Water-type Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It is a clear, light-blue stone.",
    flavor: "Clear as oceanic depths, holding an eternal swirl of fresh marine water at its core.",
    evolves: ["Eevee → Vaporeon", "Poliwhirl → Poliwrath", "Shellder → Cloyster", "Staryu → Starmie", "Lombre → Ludicolo", "Panpour → Simipour"]
  },
  {
    id: 28,
    name: "thunder-stone",
    displayName: "Thunder Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 3000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png",
    shortEffect: "A peculiar stone that triggers evolution in certain Electric-type Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It has a distinct thunderbolt pattern.",
    flavor: "Sparks with static electricity when held near metallic surfaces.",
    evolves: ["Pikachu → Raichu", "Eevee → Jolteon", "Eelektrik → Eelektross", "Charjabug → Vikavolt", "Tadbulb → Bellibolt"]
  },
  {
    id: 29,
    name: "leaf-stone",
    displayName: "Leaf Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 3000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leaf-stone.png",
    shortEffect: "A peculiar stone that triggers evolution in certain Grass-type Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It has an unmistakable leaf pattern imprinted.",
    flavor: "A fossilized amber stone holding the imprint of an ancient prehistoric plant.",
    evolves: ["Gloom → Vileplume", "Weepinbell → Victreebel", "Exeggcute → Exeggutor", "Nuzleaf → Shiftry", "Pansage → Simisage"]
  },
  {
    id: 30,
    name: "moon-stone",
    displayName: "Moon Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 0,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-stone.png",
    shortEffect: "A rare lunar stone that triggers evolution in certain nocturnal and fairy Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It is as dark as the night sky.",
    flavor: "Rumored to have fallen from space atop Mt. Moon alongside Clefairy meteorites.",
    evolves: ["Nidorina → Nidoqueen", "Nidorino → Nidoking", "Clefairy → Clefable", "Jigglypuff → Wigglytuff", "Skitty → Delcatty", "Munna → Musharna"]
  },
  {
    id: 31,
    name: "sun-stone",
    displayName: "Sun Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 0,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png",
    shortEffect: "A solar gemstone that triggers evolution in certain sun-loving Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It burns as red as the evening sun.",
    flavor: "Emits a warm golden aura reminiscent of noon in the desert.",
    evolves: ["Gloom → Bellossom", "Sunkern → Sunflora", "Cottonee → Whimsicott", "Petilil → Lilligant", "Helioptile → Heliolisk"]
  },
  {
    id: 32,
    name: "shiny-stone",
    displayName: "Shiny Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 0,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-stone.png",
    shortEffect: "A luminous stone that triggers evolution in noble and graceful Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It shines with a dazzling light.",
    flavor: "Gleams with pristine iridescence, reacting with high-elegance species.",
    evolves: ["Togetic → Togekiss", "Roselia → Roserade", "Minccino → Cinccino", "Floette → Florges"]
  },
  {
    id: 33,
    name: "dusk-stone",
    displayName: "Dusk Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 0,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-stone.png",
    shortEffect: "A shadowy stone that triggers evolution in certain Ghost and Dark Pokémon.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It holds dark shadows within.",
    flavor: "Inky purple and pitch black, absorbing ambient light like a miniature void.",
    evolves: ["Murkrow → Honchkrow", "Misdreavus → Mismagius", "Lampent → Chandelure", "Doublade → Aegislash"]
  },
  {
    id: 34,
    name: "dawn-stone",
    displayName: "Dawn Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 0,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dawn-stone.png",
    shortEffect: "A crystalline stone that triggers gender-specific branching evolutions.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It sparkles like a pair of eyes.",
    flavor: "Awakens latent heroic or spectral powers depending on gender alignment.",
    evolves: ["Kirlia (Male) → Gallade", "Snorunt (Female) → Froslass"]
  },
  {
    id: 35,
    name: "ice-stone",
    displayName: "Ice Stone",
    pocket: "evolution",
    category: "Evolution Stones",
    cost: 3000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ice-stone.png",
    shortEffect: "A sub-zero stone that triggers evolution in regional Alolan/Galarian forms and Ice-types.",
    description: "A peculiar stone that can make certain species of Pokémon evolve. It has a snowflake pattern in it.",
    flavor: "Permanently frozen solid, even when exposed to desert temperatures.",
    evolves: ["Alolan Sandshrew → Sandslash", "Alolan Vulpix → Ninetales", "Galarian Darumaka → Darmanitan", "Crabrawler → Crabominable", "Cetoddle → Cetitan"]
  },
  {
    id: 36,
    name: "metal-coat",
    displayName: "Metal Coat",
    pocket: "evolution",
    category: "Evolution Catalysts & Held",
    cost: 2000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/metal-coat.png",
    shortEffect: "Boosts Steel-type moves by 20%, and triggers trade evolution for Onix and Scyther.",
    description: "A special metallic film that can be held by a Pokémon. It boosts the power of Steel-type moves.",
    flavor: "Covers organic carapaces in diamond-hard liquid steel alloy during trade synthesis.",
    evolves: ["Onix (Trade) → Steelix", "Scyther (Trade) → Scizor"]
  },
  {
    id: 37,
    name: "kings-rock",
    displayName: "King's Rock",
    pocket: "evolution",
    category: "Evolution Catalysts & Held",
    cost: 5000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png",
    shortEffect: "Gives damaging attacks a 10% flinch chance, and triggers trade evolution for Poliwhirl and Slowpoke.",
    description: "An item to be held by a Pokémon. When the holder inflicts damage, there is a chance the target will flinch.",
    flavor: "A royal crown-shaped mineral prized by amphibious royalty.",
    evolves: ["Poliwhirl (Trade) → Politoed", "Slowpoke (Trade) → Slowking"]
  },
  {
    id: 38,
    name: "auspicious-armor",
    displayName: "Auspicious Armor",
    pocket: "evolution",
    category: "Paldean Evolution Relics",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/auspicious-armor.png",
    shortEffect: "A set of auspicious armor that evolves Charcadet into Armarouge in Pokémon Scarlet.",
    description: "A peculiar set of armor that can make a Charcadet evolve. Auspicious wishes are forged within it.",
    flavor: "Blessed with the burning courage and righteousness of a loyal warrior.",
    evolves: ["Charcadet → Armarouge"]
  },
  {
    id: 39,
    name: "malicious-armor",
    displayName: "Malicious Armor",
    pocket: "evolution",
    category: "Paldean Evolution Relics",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/malicious-armor.png",
    shortEffect: "A set of malicious armor that evolves Charcadet into Ceruledge in Pokémon Violet.",
    description: "A peculiar set of armor that can make a Charcadet evolve. Malicious grudges are forged within it.",
    flavor: "Tempered in spectral spite, igniting dual ethereal blades of ghostfire.",
    evolves: ["Charcadet → Ceruledge"]
  },

  // --- BERRIES ---
  {
    id: 40,
    name: "sitrus-berry",
    displayName: "Sitrus Berry",
    pocket: "berries",
    category: "Recovery Berries",
    cost: 80,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png",
    shortEffect: "Restores 25% of maximum HP when the holder drops below 50% HP.",
    description: "A Berry to be consumed by Pokémon. If held, it heals the holder by 25% of its max HP when injured.",
    flavor: "Large and plump, with a refreshing balance of sweet and sour flavor profiles."
  },
  {
    id: 41,
    name: "lum-berry",
    displayName: "Lum Berry",
    pocket: "berries",
    category: "Cure Berries",
    cost: 80,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lum-berry.png",
    shortEffect: "Immediately cures any status condition (burn, freeze, paralysis, poison, sleep, confusion).",
    description: "A Berry to be consumed by Pokémon. If held, it heals any status problem it may have.",
    flavor: "Slow to grow, but treasured for its miraculous detoxifying juices."
  },
  {
    id: 42,
    name: "leppa-berry",
    displayName: "Leppa Berry",
    pocket: "berries",
    category: "PP Berries",
    cost: 80,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leppa-berry.png",
    shortEffect: "Restores 10 PP to any depleted move in battle or in the field.",
    description: "A Berry to be consumed by Pokémon. If held, it restores 10 PP to one of its moves that ran out of PP.",
    flavor: "Vital for extended shiny hunting and chaining sessions where PP exhaustion is lethal."
  },
  {
    id: 43,
    name: "yache-berry",
    displayName: "Yache Berry",
    pocket: "berries",
    category: "Resist Berries",
    cost: 80,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/yache-berry.png",
    shortEffect: "Halves the damage taken from a super-effective Ice-type move.",
    description: "A Berry to be consumed by Pokémon. If held, it weakens a super-effective Ice-type attack against it.",
    flavor: "A staple defensive countermeasure on Dragon/Ground powerhouses like Garchomp."
  },
  {
    id: 44,
    name: "chople-berry",
    displayName: "Chople Berry",
    pocket: "berries",
    category: "Resist Berries",
    cost: 80,
    flingPower: 10,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/chople-berry.png",
    shortEffect: "Halves the damage taken from a super-effective Fighting-type move.",
    description: "A Berry to be consumed by Pokémon. If held, it weakens a super-effective Fighting-type attack against it.",
    flavor: "Protects normal and dark types (Snorlax, Tyranitar, Kingambit) from Close Combat OHKOs."
  },

  // --- MEDICINE & VITAMINS ---
  {
    id: 45,
    name: "full-restore",
    displayName: "Full Restore",
    pocket: "medicine",
    category: "Recovery Medicine",
    cost: 3000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-restore.png",
    shortEffect: "Fully restores all HP and cures any status condition on a single Pokémon.",
    description: "A medicine that can be used on a Pokémon. It fully restores the max HP and heals any status conditions.",
    flavor: "The Champion's secret weapon, capable of turning the tide of Elite Four matches instantly."
  },
  {
    id: 46,
    name: "max-potion",
    displayName: "Max Potion",
    pocket: "medicine",
    category: "Recovery Medicine",
    cost: 2500,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png",
    shortEffect: "Fully restores all HP of a single Pokémon regardless of level.",
    description: "A spray-type medicine that can be used on a Pokémon. It fully restores the max HP of a single Pokémon.",
    flavor: "High-grade medical spray synthesized in Silph and Devon laboratories."
  },
  {
    id: 47,
    name: "max-revive",
    displayName: "Max Revive",
    pocket: "medicine",
    category: "Revival Medicine",
    cost: 4000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-revive.png",
    shortEffect: "Revives a fainted Pokémon with its HP fully restored to 100%.",
    description: "A medicine that can be used on a fainted Pokémon. It revives the Pokémon and fully restores its HP.",
    flavor: "Golden triangular crystal packed with concentrated regenerative revitalizing essence."
  },
  {
    id: 48,
    name: "rare-candy",
    displayName: "Rare Candy",
    pocket: "medicine",
    category: "Leveling Treats",
    cost: 10000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png",
    shortEffect: "Instantly raises a single Pokémon's level by exactly 1.",
    description: "A candy that is packed with energy. When consumed, it instantly raises the level of a single Pokémon by one.",
    flavor: "A legendary blue-wrapped confection with immense nutritional and developmental potency."
  },
  {
    id: 49,
    name: "protein",
    displayName: "Protein",
    pocket: "medicine",
    category: "Vitamins (EV Enhancers)",
    cost: 10000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protein.png",
    shortEffect: "Permanently adds +10 Attack Effort Values (EVs) to a Pokémon.",
    description: "A nutritious drink for Pokémon. When consumed, it raises the base Attack stat of a single Pokémon.",
    flavor: "Formulated for competitive physical sweepers looking to reach maximum offensive damage thresholds."
  },
  {
    id: 50,
    name: "carbos",
    displayName: "Carbos",
    pocket: "medicine",
    category: "Vitamins (EV Enhancers)",
    cost: 10000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/carbos.png",
    shortEffect: "Permanently adds +10 Speed Effort Values (EVs) to a Pokémon.",
    description: "A nutritious drink for Pokémon. When consumed, it raises the base Speed stat of a single Pokémon.",
    flavor: "Fast-acting carbohydrate elixir designed to optimize quick-strike agility and speed-tier benchmarks."
  },
  {
    id: 51,
    name: "ability-patch",
    displayName: "Ability Patch",
    pocket: "medicine",
    category: "Competitive Re-trainers",
    cost: 125000,
    flingPower: 30,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ability-patch.png",
    shortEffect: "Switches a Pokémon's regular ability to its rare Hidden Ability.",
    description: "A patch that allows a Pokémon to have its rare Hidden Ability. It can also revert a Hidden Ability.",
    flavor: "Prized 6-star Tera Raid loot that unlocks game-breaking hidden traits like Multiscale and Protean."
  },

  // --- KEY ITEMS ---
  {
    id: 52,
    name: "shiny-charm",
    displayName: "Shiny Charm",
    pocket: "key",
    category: "Trainer Charms",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png",
    shortEffect: "Triples the wild shiny encounter rate from 1/4,096 to 1/1,365 (and boosts Masuda breeding).",
    description: "A shiny, sparkling charm that increases the chance of finding Shiny Pokémon in the wild.",
    flavor: "Awarded by the Game Freak Director only to trainers who completely finish the National Pokédex."
  },
  {
    id: 53,
    name: "oval-charm",
    displayName: "Oval Charm",
    pocket: "key",
    category: "Trainer Charms",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oval-charm.png",
    shortEffect: "Significantly speeds up the rate at which Pokémon eggs are found at the Daycare or Nursery.",
    description: "An oval charm that increases the chance of finding Eggs at the Pokémon Nursery.",
    flavor: "Radiates gentle warmth, comforting breeding pairs and stimulating egg discovery."
  },
  {
    id: 54,
    name: "exp-share",
    displayName: "Exp. Share",
    pocket: "key",
    category: "Training Key Items",
    cost: 0,
    flingPower: null,
    sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png",
    shortEffect: "Shares battle experience points with all Pokémon in the trainer's party.",
    description: "A device that distributes Exp. Points from battles to the whole party even if they didn't fight.",
    flavor: "Revolutionary wireless training transmission module originally designed in the Devon Corporation."
  }
];

export const ITEM_POCKETS = [
  { id: "all", label: "All Items", iconKey: "all" },
  { id: "balls", label: "Poké Balls", iconKey: "balls" },
  { id: "battle", label: "Held & Battle", iconKey: "battle" },
  { id: "evolution", label: "Evolution Items", iconKey: "evolution" },
  { id: "berries", label: "Berries", iconKey: "berries" },
  { id: "medicine", label: "Medicine & EVs", iconKey: "medicine" },
  { id: "key", label: "Key Items", iconKey: "key" },
];

function PocketIcon({ iconKey, className = "w-4 h-4" }) {
  switch (iconKey) {
    case "balls":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h6m6 0h6" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity={0.25} />
        </svg>
      );
    case "battle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
          <path d="m13 19 6 2 2-6-2-2-6 6Z" />
          <path d="M9.5 17.5 21 6V3h-3L6.5 14.5" />
          <path d="m11 19-6 2-2-6 2-2 6 6Z" />
        </svg>
      );
    case "evolution":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
          <line x1="2" y1="8.5" x2="22" y2="8.5" />
        </svg>
      );
    case "berries":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c4.97 0 9-4.03 9-9 0-4-3-7-7-7-2 0-3 1-5 1s-3-1-5-1c-4 0-7 3-7 7 0 4.97 4.03 9 9 9z" />
          <path d="M12 6V2m0 0a4 4 0 0 1 4 4" />
        </svg>
      );
    case "medicine":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="12" x="3" y="6" rx="6" />
          <line x1="12" y1="6" x2="12" y2="18" />
        </svg>
      );
    case "key":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7.5" cy="15.5" r="4.5" />
          <path d="m21 3-9.5 9.5" />
          <path d="m15.5 7.5 3 3" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      );
  }
}

export default function ItemsDex({ onSelectPokemon }) {
  const [selectedPocket, setSelectedPocket] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Filter items based on active pocket and search input
  const filteredItems = useMemo(() => {
    return CANONICAL_ITEMS.filter((item) => {
      const matchesPocket = selectedPocket === "all" || item.pocket === selectedPocket;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.displayName.toLowerCase().includes(q) ||
        item.shortEffect.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.evolves && item.evolves.some((ev) => ev.toLowerCase().includes(q)));
      return matchesPocket && matchesSearch;
    });
  }, [selectedPocket, searchQuery]);

  return (
    <div className="w-full flex flex-col items-center select-none animate-fadeIn">
      {/* Pocket Category Selector Tabs - Themed in Silph Amber */}
      <div className="w-full max-w-5xl flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none px-2">
        {ITEM_POCKETS.map((pocket) => {
          const isActive = selectedPocket === pocket.id;
          return (
            <motion.button
              key={pocket.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPocket(pocket.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl font-display text-xs sm:text-sm whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all border ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-extrabold border-amber-400 shadow-sm"
                  : "bg-theme-surface text-theme-secondary hover:text-theme-primary border-theme hover:border-amber-500/40 font-medium"
              }`}
            >
              <PocketIcon iconKey={pocket.iconKey} className="w-4 h-4 flex-shrink-0" />
              <span>{pocket.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Search Bar for Items */}
      <div className="w-full max-w-2xl px-2 mb-8">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, effect, evolution, or battle role..."
            className="w-full py-3 pl-11 pr-10 bg-theme-surface border border-theme rounded-2xl text-sm font-display text-theme-primary placeholder-theme-secondary/60 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 shadow-sm"
          />
          <svg
            className="w-5 h-5 absolute left-3.5 text-theme-secondary pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 w-5 h-5 flex items-center justify-center text-theme-secondary hover:text-theme-primary cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Item Counter & Summary */}
      <div className="w-full max-w-6xl px-4 flex items-center justify-between text-xs font-display text-theme-secondary mb-4">
        <span>
          Showing <span className="font-bold text-theme-primary">{filteredItems.length}</span> items in{" "}
          <span className="text-amber-500 font-semibold capitalize">
            {ITEM_POCKETS.find((p) => p.id === selectedPocket)?.label || "All Items"}
          </span>
        </span>
      </div>

      {/* Items Cards Grid */}
      <div className="w-full max-w-6xl px-2 sm:px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedItem(item)}
            className="bg-theme-surface border border-theme hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* Ambient Background Badge */}
            <div className="absolute top-2 right-3 text-[10px] font-mono-tech text-theme-secondary/40 font-bold uppercase">
              #{String(item.id).padStart(3, "0")}
            </div>

            <div>
              {/* Header Icon + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-theme-input rounded-xl p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-theme/60">
                  <img
                    src={item.sprite}
                    alt={item.displayName}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-extrabold text-sm text-theme-primary truncate group-hover:text-amber-500 transition-colors">
                    {item.displayName}
                  </h3>
                  <span className="inline-block text-[10px] font-mono-tech text-theme-secondary font-medium uppercase">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Short Effect Preview */}
              <p className="text-xs font-display text-theme-secondary line-clamp-2 leading-relaxed mb-3">
                {item.shortEffect}
              </p>
            </div>

            {/* Bottom Metadata Strip */}
            <div className="pt-3 border-t border-theme/60 flex items-center justify-between text-[11px] font-mono-tech">
              <span className="text-amber-500 font-semibold">
                {item.cost > 0 ? `₽${item.cost.toLocaleString()}` : "Not for sale"}
              </span>
              {item.flingPower && (
                <span className="text-theme-secondary font-medium text-[10px]">
                  Fling: {item.flingPower} BP
                </span>
              )}
              {item.evolves && (
                <span className="text-emerald-400 font-medium text-[10px]">
                  {item.evolves.length} Evolutions
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="bg-theme-surface border border-amber-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-theme-surface-hover text-theme-secondary hover:text-theme-primary flex items-center justify-center border border-theme cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Header Hero */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-theme-input rounded-2xl p-3 flex items-center justify-center border border-theme shadow-inner">
                  <img
                    src={selectedItem.sprite}
                    alt={selectedItem.displayName}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-tech text-amber-500 font-bold">
                      #{String(selectedItem.id).padStart(3, "0")}
                    </span>
                    <span className="text-[10px] font-mono-tech text-theme-secondary bg-theme-input px-2 py-0.5 rounded-full uppercase">
                      {selectedItem.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-theme-primary mt-0.5">
                    {selectedItem.displayName}
                  </h2>
                </div>
              </div>

              {/* In-Game Effect Description */}
              <div className="bg-theme-input/70 border border-theme rounded-xl p-4 mb-4">
                <div className="text-[10px] font-mono-tech text-theme-secondary uppercase tracking-wider mb-1.5 font-bold">
                  Game Effect & Mechanics
                </div>
                <p className="text-sm font-display text-theme-primary leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              {/* Lore & Flavor Text */}
              {selectedItem.flavor && (
                <div className="bg-theme-surface-hover/50 border border-amber-500/20 rounded-xl p-4 mb-4">
                  <div className="text-[10px] font-mono-tech text-amber-500 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span>Canon Lore Archive</span>
                  </div>
                  <p className="text-xs font-display text-theme-secondary italic leading-relaxed">
                    "{selectedItem.flavor}"
                  </p>
                </div>
              )}

              {/* Evolutionary Compatibility Section */}
              {selectedItem.evolves && selectedItem.evolves.length > 0 && (
                <div className="bg-theme-input/40 border border-theme rounded-xl p-4 mb-4">
                  <div className="text-[10px] font-mono-tech text-emerald-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
                    </svg>
                    <span>Evolutionary Trigger Compatibility</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.evolves.map((evolutionPath, idx) => (
                      <div
                        key={idx}
                        className="bg-theme-surface border border-theme/80 rounded-lg px-3 py-2 text-xs font-display font-medium text-theme-primary flex items-center gap-2"
                      >
                        <span className="text-emerald-400 font-mono-tech font-bold">→</span>
                        <span>{evolutionPath}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Held in Wild by Pokémon */}
              {selectedItem.heldBy && selectedItem.heldBy.length > 0 && (
                <div className="bg-theme-input/40 border border-theme rounded-xl p-4 mb-4">
                  <div className="text-[10px] font-mono-tech text-indigo-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    <span>Naturally Held in Wild by</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.heldBy.map((pkmn, idx) => (
                      <span
                        key={idx}
                        className="bg-theme-surface border border-theme rounded-lg px-2.5 py-1 text-xs font-display text-theme-primary"
                      >
                        {pkmn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Properties Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center pt-2 border-t border-theme">
                <div className="bg-theme-input rounded-xl p-2.5">
                  <div className="text-[9px] font-mono-tech text-theme-secondary uppercase">Purchase Cost</div>
                  <div className="text-xs font-display font-bold text-amber-500 mt-0.5">
                    {selectedItem.cost > 0 ? `₽${selectedItem.cost.toLocaleString()}` : "Priceless"}
                  </div>
                </div>
                <div className="bg-theme-input rounded-xl p-2.5">
                  <div className="text-[9px] font-mono-tech text-theme-secondary uppercase">Fling Power</div>
                  <div className="text-xs font-display font-bold text-theme-primary mt-0.5">
                    {selectedItem.flingPower ? `${selectedItem.flingPower} BP` : "N/A"}
                  </div>
                </div>
                <div className="bg-theme-input rounded-xl p-2.5 col-span-2 sm:col-span-1">
                  <div className="text-[9px] font-mono-tech text-theme-secondary uppercase">Bag Pocket</div>
                  <div className="text-xs font-display font-bold text-theme-primary capitalize mt-0.5">
                    {selectedItem.pocket}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
