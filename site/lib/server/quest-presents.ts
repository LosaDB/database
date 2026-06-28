import fs from "fs";
import path from "path";

export interface QuestPresentInfo {
  index: number;
  type: number;
  value1: number;
  value2: number;
  period: number;
}

const dataPath = path.join(process.cwd(), "..", "data", "quest-present-raw.json");
const raw = fs.readFileSync(dataPath, "utf8");

const rawEntries: Array<{ name: string; fields: Record<string, string> }> =
  JSON.parse(raw);

export const questPresents: Record<number, QuestPresentInfo> = {};

for (const entry of rawEntries) {
  if (!entry.name.startsWith("Present")) continue;
  const f = entry.fields;
  const index = Number(f.RewardIndex);
  if (Number.isNaN(index) || index <= 0) continue;
  questPresents[index] = {
    index,
    type: Number(f.PresentType) || 0,
    value1: Number(f.PresentValue1) || 0,
    value2: Number(f.PresentValue2) || 0,
    period: Number(f.PresentPeriod) || 0,
  };
}

export function getQuestPresent(index: number): QuestPresentInfo | undefined {
  return questPresents[index];
}
