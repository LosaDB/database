import { buildIconMap, type UIIcon, type UIIconsMap } from "@/lib/ui-icons";
import { loadServerData } from "./data-source";

export async function loadUIIcons(alias: string): Promise<UIIconsMap> {
  const icons = await loadServerData<UIIcon[]>(alias, "ui-icons.json");

  if (!Array.isArray(icons)) {
    throw new Error(
      `Expected ui-icons.json to be an array, received ${icons === null ? "null" : typeof icons}`,
    );
  }

  return buildIconMap(icons);
}
