export interface GearIcon {
  imageset: string;
  name: string;
  pngUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GearSkill {
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
  heroCode: string;
  heroName: string;
  itemNumber: number;
  code: number;
  name: string;
  nameKr?: string;
  itemType: string;
  subType: string;
  rarity?: string;
  iconKey?: string;
  icon: GearIcon | null;
  skill?: GearSkill;
  isExtra: boolean;
  stats: Record<string, number>;
  rawFields: Record<string, string>;
}
