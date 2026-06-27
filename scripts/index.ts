import { fetchAllHeroes } from "./fetchers/heroes";
import { fetchTextures } from "./fetchers/textures";
import { fetchItems } from "./fetchers/items";
import { fetchManuals } from "./fetchers/manuals";
import { fetchGears } from "./fetchers/gears";

async function main(): Promise<void> {
  await fetchAllHeroes();
  await fetchTextures();
  await fetchItems();
  await fetchManuals();
  await fetchGears();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
