import fs from "fs";
import path from "path";
import type { Pet, PetFeedRank, PetManual } from "@/lib/pets";

const dataPath = path.join(process.cwd(), "..", "data", "pets.json");
const raw = fs.readFileSync(dataPath, "utf8");
export const pets: Pet[] = JSON.parse(raw);

export const petById = new Map<number, Pet>(pets.map((pet) => [pet.id, pet]));

const feedDataPath = path.join(process.cwd(), "..", "data", "pet-feed-info.json");
const feedRaw = fs.readFileSync(feedDataPath, "utf8");
export const petFeedRanks: PetFeedRank[] = JSON.parse(feedRaw);

const manualDataPath = path.join(process.cwd(), "..", "data", "pet-manuals.json");
const manualRaw = fs.readFileSync(manualDataPath, "utf8");
const manualsRecord: Record<number, PetManual> = JSON.parse(manualRaw);

export const petManuals: PetManual[] = Object.values(manualsRecord);

export const petManualById = new Map<number, PetManual>(
  Object.entries(manualsRecord).map(([id, manual]) => [Number(id), manual]),
);

export const petRanks = Array.from(
  new Set(pets.flatMap((p) => [p.baseRank, p.maxRank])),
).sort((a, b) => a - b);

export const petStatLabels = [
  "ATK",
  "DEF",
  "Move SPD",
  "Drop",
  "Weapon Skill",
  "Armor Skill",
  "Helmet Skill",
  "Cloak Skill",
];
