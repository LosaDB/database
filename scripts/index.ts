import { fetchAllHeroes } from "./fetchers/heroes";
import { fetchTextures } from "./fetchers/textures";
import { fetchItems } from "./fetchers/items";

async function main(): Promise<void> {
  await fetchAllHeroes();
  await fetchTextures();
  await fetchItems();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
