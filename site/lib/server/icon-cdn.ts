import { buildIconMap, type IconCdnEntry, type IconCdnMap } from "@/lib/ui-icons";
import { loadServerData } from "./data-source";

export async function loadIconCdn(alias: string): Promise<IconCdnMap> {
  const entries = await loadServerData<IconCdnEntry[]>(alias, "icon-cdn.json");

  if (!Array.isArray(entries)) {
    throw new Error(
      `Expected icon-cdn.json to be an array, received ${entries === null ? "null" : typeof entries}`,
    );
  }

  return buildIconMap(entries);
}
