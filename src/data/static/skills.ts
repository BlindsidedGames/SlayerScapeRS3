import { SkillDefinition } from "../models";

export const skills: SkillDefinition[] = [
  { name: "Attack", id: "attack", maxLevel: 99 },
  { name: "Strength", id: "strength", maxLevel: 99 },
  { name: "Defence", id: "defence", maxLevel: 99 },
  { name: "Constitution", id: "constitution", maxLevel: 99 },
  { name: "Ranged", id: "ranged", maxLevel: 99 },
  { name: "Prayer", id: "prayer", maxLevel: 99 },
  { name: "Magic", id: "magic", maxLevel: 99 },
  { name: "Cooking", id: "cooking", maxLevel: 99 },
  { name: "Woodcutting", id: "woodcutting", maxLevel: 110 },
  { name: "Fletching", id: "fletching", maxLevel: 99 },
  { name: "Fishing", id: "fishing", maxLevel: 99 },
  { name: "Firemaking", id: "firemaking", maxLevel: 99 },
  { name: "Crafting", id: "crafting", maxLevel: 99 },
  { name: "Smithing", id: "smithing", maxLevel: 99 },
  { name: "Mining", id: "mining", maxLevel: 99 },
  { name: "Herblore", id: "herblore", maxLevel: 99 },
  { name: "Agility", id: "agility", maxLevel: 99 },
  { name: "Thieving", id: "thieving", maxLevel: 99 },
  { name: "Slayer", id: "slayer", maxLevel: 120, elite: true },
  { name: "Farming", id: "farming", maxLevel: 120, elite: true },
  { name: "Runecrafting", id: "runecrafting", maxLevel: 99 },
  { name: "Hunter", id: "hunter", maxLevel: 99 },
  { name: "Construction", id: "construction", maxLevel: 99 },
  { name: "Summoning", id: "summoning", maxLevel: 99 },
  { name: "Dungeoneering", id: "dungeoneering", maxLevel: 120, elite: true },
  { name: "Divination", id: "divination", maxLevel: 99 },
  { name: "Invention", id: "invention", maxLevel: 150, elite: true },
  { name: "Archaeology", id: "archaeology", maxLevel: 120, elite: true },
  { name: "Necromancy", id: "necromancy", maxLevel: 120, elite: true }
];

export const makeBands = (maxLevel: number, bandSize: number) => {
  const bands: Array<[number, number]> = [];
  for (let start = 1; start <= maxLevel; start += bandSize) {
    const end = Math.min(start + bandSize - 1, maxLevel);
    bands.push([start, end]);
  }
  return bands;
};
