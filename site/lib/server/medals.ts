import type { Medal } from "@/lib/medals";
import { loadServerData } from "./data-source";

async function readMedals(alias: string): Promise<Medal[]> {
  return loadServerData<Medal[]>(alias, "medals.json");
}

export async function loadMedals(alias: string): Promise<Medal[]> {
  return readMedals(alias);
}

export async function loadMedalById(
  alias: string,
): Promise<Map<number, Medal>> {
  const medals = await readMedals(alias);
  return new Map(medals.map((medal) => [medal.id, medal]));
}

export async function loadMedalSubTypes(alias: string): Promise<number[]> {
  const medals = await readMedals(alias);
  return Array.from(
    new Set(
      medals
        .map((m) => m.subMedalType)
        .filter((t): t is number => t !== undefined),
    ),
  ).sort((a, b) => a - b);
}

export async function loadMedalLimitLevels(alias: string): Promise<number[]> {
  const medals = await readMedals(alias);
  return Array.from(
    new Set(
      medals
        .map((m) => m.limitLevel)
        .filter((l): l is number => l !== undefined),
    ),
  ).sort((a, b) => a - b);
}
