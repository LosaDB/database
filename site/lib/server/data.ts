import fs from "fs";
import path from "path";

export interface Skill {
  name: string;
  icon?: string;
  emoticon?: string;
  extra?: string | null;
  desc?: string;
  desc_name?: string;
  desc_kr?: string;
  [key: string]: unknown;
}

export interface Gear {
  id: number;
  slug: string;
  name: string;
  name_kr?: string;
  rarity: string;
  code: string;
  item_type: string;
  sub_type: string;
  icon: string;
  skill: Skill;
  [key: string]: unknown;
}

export interface Hero {
  name: string;
  code: string;
  summary: string;
  type: string;
  rarity: string;
  default_ani: string;
  icon_m: string;
  icon_f: string;
  pic_m: string;
  pic_f: string;
  artwork1: string;
  artwork2: string;
  gears: Gear[];
  [key: string]: unknown;
}

const dataPath = path.join(process.cwd(), "..", "data", "hero-local.json");
const raw = fs.readFileSync(dataPath, "utf8");
export const heroes: Hero[] = JSON.parse(raw);

export const heroByCode = new Map<string, Hero>(heroes.map((h) => [h.code, h]));

export const heroTypes = Array.from(new Set(heroes.map((h) => h.type))).sort();

export const heroRarities = Array.from(
  new Set(heroes.map((h) => h.rarity))
).sort();
