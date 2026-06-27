import { ASSET_BASE } from "@/lib/data";

export interface UIIcon {
  imageset: string;
  name: string;
  ddsFile: string;
  pngFile: string;
  pngUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface UIImageset {
  name: string;
  ddsFile: string;
  pngFile: string;
  pngUrl: string;
  images: UIIcon[];
}

export const UI_ICONS_JSON_URL = `${ASSET_BASE}data/ui-icons.json`;
export const UI_IMAGESET_JSON_URL = `${ASSET_BASE}data/ui-imageset.json`;

export type UIIconsMap = Record<string, UIIcon>;
