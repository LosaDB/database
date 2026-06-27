import fs from "fs";
import path from "path";
import type { EtcItem } from "@/lib/items";

const dataPath = path.join(process.cwd(), "..", "data", "etc-items.json");
const raw = fs.readFileSync(dataPath, "utf8");
export const etcItems: EtcItem[] = JSON.parse(raw);

export const itemGroups = Array.from(
  new Set(etcItems.map((item) => item.group).filter((g): g is number => g !== undefined)),
).sort((a, b) => a - b);
