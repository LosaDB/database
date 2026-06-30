import type { EtcItem, ManualEntry } from "@/lib/items";
import { loadServerData } from "./data-source";

async function readItems(alias: string): Promise<EtcItem[]> {
  return loadServerData<EtcItem[]>(alias, "etc-items.json");
}

async function readManualsRecord(
  alias: string,
): Promise<Record<number, ManualEntry>> {
  return loadServerData<Record<number, ManualEntry>>(alias, "etc-manuals.json");
}

export async function loadItems(alias: string): Promise<EtcItem[]> {
  return readItems(alias);
}

export async function loadItemById(
  alias: string,
): Promise<Map<number, EtcItem>> {
  const items = await readItems(alias);
  return new Map(items.map((item) => [item.id, item]));
}

export async function loadItemGroups(alias: string): Promise<number[]> {
  const items = await readItems(alias);
  return Array.from(
    new Set(items.map((item) => item.group).filter((g): g is number => g !== undefined)),
  ).sort((a, b) => a - b);
}

export async function loadItemTypes(alias: string): Promise<number[]> {
  const items = await readItems(alias);
  return Array.from(new Set(items.map((item) => item.type))).sort((a, b) => a - b);
}

export async function loadManuals(alias: string): Promise<ManualEntry[]> {
  const record = await readManualsRecord(alias);
  return Object.values(record);
}

export async function loadManualById(
  alias: string,
): Promise<Map<number, ManualEntry>> {
  const record = await readManualsRecord(alias);
  return new Map(
    Object.entries(record).map(([id, manual]) => [Number(id), manual]),
  );
}
