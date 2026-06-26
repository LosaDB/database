import { fetchAllHeroes } from "./fetchers/heroes";

async function main(): Promise<void> {
  await fetchAllHeroes();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
