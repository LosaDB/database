import type { Gear } from "@/lib/gears";
import { loadServerData } from "./data-source";

async function readGears(alias: string): Promise<Gear[]> {
  return loadServerData<Gear[]>(alias, "gears.json");
}

export async function loadGears(alias: string): Promise<Gear[]> {
  return readGears(alias);
}

export async function loadGearById(alias: string): Promise<Map<number, Gear>> {
  const gears = await readGears(alias);
  return new Map(gears.map((gear) => [gear.id, gear]));
}

export async function loadGearTypes(alias: string): Promise<string[]> {
  const gears = await readGears(alias);
  return Array.from(new Set(gears.map((gear) => gear.itemType).filter(Boolean))).sort();
}

export async function loadGearRarities(alias: string): Promise<string[]> {
  const gears = await readGears(alias);
  return Array.from(
    new Set(gears.map((gear) => gear.rarity).filter((r): r is string => Boolean(r))),
  ).sort();
}
