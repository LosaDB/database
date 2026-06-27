import { fetchAllHeroes } from "./fetchers/heroes";
import { fetchTextures } from "./fetchers/textures";
import { fetchItems } from "./fetchers/items";
import { fetchManuals } from "./fetchers/manuals";

async function main(): Promise<void> {
  await fetchAllHeroes();
  await fetchTextures();
  await fetchItems();
  await fetchManuals();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
