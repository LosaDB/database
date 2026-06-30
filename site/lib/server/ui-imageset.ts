import type { UIImageset } from "@/lib/ui-icons";
import { loadServerData } from "./data-source";

export async function loadUIImagesets(alias: string): Promise<UIImageset[]> {
  const imagesets = await loadServerData<UIImageset[]>(alias, "ui-imageset.json");

  if (!Array.isArray(imagesets)) {
    throw new Error(
      `Expected ui-imageset.json to be an array, received ${imagesets === null ? "null" : typeof imagesets}`,
    );
  }

  return imagesets;
}
