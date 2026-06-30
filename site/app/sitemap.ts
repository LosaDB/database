import { MetadataRoute } from "next";
import { SERVERLIST } from "@/lib/servers";
import { loadHeroes } from "@/lib/server/data";
import { loadItems } from "@/lib/server/items";
import { loadGears } from "@/lib/server/gears";
import { loadMedals } from "@/lib/server/medals";
import { loadPets } from "@/lib/server/pets";

export const revalidate = 604800; // 7 hari

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lostsaga-database.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static root routes
  entries.push(
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/tools/icon-browser`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/tools/icon-cdn`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/tools/pass-generator`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/tools/quest-generator`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/tools/svr-id-generator`, changeFrequency: "weekly", priority: 0.5 },
  );

  for (const server of SERVERLIST) {
    const alias = server.alias;

    // Server-level listing pages
    entries.push(
      { url: `${BASE_URL}/${alias}`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${BASE_URL}/${alias}/heroes`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/${alias}/items`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/${alias}/gears`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/${alias}/medals`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/${alias}/pets`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${BASE_URL}/${alias}/search`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${BASE_URL}/${alias}/icon-browser`, changeFrequency: "weekly", priority: 0.5 },
      { url: `${BASE_URL}/${alias}/icon-cdn`, changeFrequency: "weekly", priority: 0.5 },
    );

    try {
      const [heroes, items, gears, medals, pets] = await Promise.all([
        loadHeroes(alias).catch(() => []),
        loadItems(alias).catch(() => []),
        loadGears(alias).catch(() => []),
        loadMedals(alias).catch(() => []),
        loadPets(alias).catch(() => []),
      ]);

      for (const hero of heroes) {
        entries.push({
          url: `${BASE_URL}/${alias}/heroes/${hero.code}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      for (const item of items) {
        entries.push({
          url: `${BASE_URL}/${alias}/items/${item.id}`,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      for (const gear of gears) {
        entries.push({
          url: `${BASE_URL}/${alias}/gears/${gear.id}`,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      for (const medal of medals) {
        entries.push({
          url: `${BASE_URL}/${alias}/medals/${medal.id}`,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      for (const pet of pets) {
        entries.push({
          url: `${BASE_URL}/${alias}/pets/${pet.id}`,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    } catch {
      // Skip server aliases that have no data yet.
    }
  }

  return entries;
}
