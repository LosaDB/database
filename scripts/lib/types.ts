export interface Skill {
  name: string;
  icon?: string;
  emoticon?: string;
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

export interface QueueItem {
  url: string;
  dest: string;
}

export type DownloadResult =
  | "downloaded"
  | "placeholder"
  | "migrated"
  | "skipped"
  | `failed: ${string}`;
