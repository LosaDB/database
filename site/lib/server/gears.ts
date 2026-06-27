import fs from "fs";
import path from "path";
import type { Gear } from "@/lib/gears";

const dataPath = path.join(process.cwd(), "..", "data", "gears.json");
const raw = fs.readFileSync(dataPath, "utf8");
export const gears: Gear[] = JSON.parse(raw);

export const gearById = new Map<number, Gear>(gears.map((gear) => [gear.id, gear]));

export const gearTypes = Array.from(
  new Set(gears.map((gear) => gear.itemType).filter(Boolean)),
).sort();

export const gearRarities = Array.from(
  new Set(gears.map((gear) => gear.rarity).filter((r): r is string => Boolean(r))),
).sort();
