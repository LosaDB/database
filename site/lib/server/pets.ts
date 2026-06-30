import type { Pet, PetFeedRank, PetManual } from "@/lib/pets";
import { loadServerData } from "./data-source";

async function readPets(alias: string): Promise<Pet[]> {
  return loadServerData<Pet[]>(alias, "pets.json");
}

export async function loadPets(alias: string): Promise<Pet[]> {
  return readPets(alias);
}

export async function loadPetById(alias: string): Promise<Map<number, Pet>> {
  const pets = await readPets(alias);
  return new Map(pets.map((pet) => [pet.id, pet]));
}

export async function loadPetFeedRanks(
  alias: string,
): Promise<PetFeedRank[]> {
  return loadServerData<PetFeedRank[]>(alias, "pet-feed-info.json");
}

async function readPetManualsRecord(
  alias: string,
): Promise<Record<number, PetManual>> {
  return loadServerData<Record<number, PetManual>>(alias, "pet-manuals.json");
}

export async function loadPetManuals(alias: string): Promise<PetManual[]> {
  const record = await readPetManualsRecord(alias);
  return Object.values(record);
}

export async function loadPetManualById(
  alias: string,
): Promise<Map<number, PetManual>> {
  const record = await readPetManualsRecord(alias);
  return new Map(
    Object.entries(record).map(([id, manual]) => [Number(id), manual]),
  );
}

export async function loadPetRanks(alias: string): Promise<number[]> {
  const pets = await readPets(alias);
  return Array.from(
    new Set(pets.flatMap((p) => [p.baseRank, p.maxRank])),
  ).sort((a, b) => a - b);
}

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
