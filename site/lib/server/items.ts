import fs from "fs";
import path from "path";
import type { EtcItem, ManualEntry } from "@/lib/items";

const dataPath = path.join(process.cwd(), "..", "data", "etc-items.json");
const raw = fs.readFileSync(dataPath, "utf8");
export const etcItems: EtcItem[] = JSON.parse(raw);

const manualDataPath = path.join(process.cwd(), "..", "data", "etc-manuals.json");
const manualsRaw = fs.readFileSync(manualDataPath, "utf8");
const manualsRecord: Record<number, ManualEntry> = JSON.parse(manualsRaw);

export const manuals: ManualEntry[] = Object.values(manualsRecord);

export const manualById = new Map<number, ManualEntry>(
  Object.entries(manualsRecord).map(([id, manual]) => [Number(id), manual]),
);

export const itemById = new Map<number, EtcItem>(
  etcItems.map((item) => [item.id, item]),
);

export const itemGroups = Array.from(
  new Set(etcItems.map((item) => item.group).filter((g): g is number => g !== undefined)),
).sort((a, b) => a - b);

export const itemTypes = Array.from(
  new Set(etcItems.map((item) => item.type)),
).sort((a, b) => a - b);
