import path from "path";
import fsp from "fs/promises";
import {
  API_BASE,
  DATA_DIR,
  FETCH_CONCURRENCY,
  IMAGE_CONCURRENCY,
  IMAGE_OUTPUT_DIR,
  MAX_HERO,
} from "../config";
import { downloadQueue } from "../lib/downloader";
import { runWithConcurrency } from "../lib/queue";
import {
  exists,
  extFromUrl,
  fixImageUrl,
  isValidUrl,
  readJson,
  writeJson,
} from "../lib/utils";
import type { Hero, QueueItem } from "../lib/types";

function buildImageQueue(heroes: Hero[]): QueueItem[] {
  const queue: QueueItem[] = [];
  for (const hero of heroes) {
    const basePath = path.join(IMAGE_OUTPUT_DIR, String(hero.code));

    const heroKeys = [
      "icon_m",
      "icon_f",
      "pic_m",
      "pic_f",
      "artwork1",
      "artwork2",
    ] as const;

    for (const key of heroKeys) {
      const url = hero[key];
      if (!isValidUrl(url)) continue;
      queue.push({
        url,
        dest: path.join(basePath, `${key}.png`),
      });
    }

    const gears = Array.isArray(hero.gears) ? hero.gears : [];
    for (let i = 0; i < gears.length; i++) {
      const gear = gears[i];
      const gearBase = path.join(basePath, "gear");

      const gearFields: { key: string; value: string | undefined }[] = [
        { key: "icon", value: gear.icon },
        { key: "skill_icon", value: gear.skill?.icon },
        { key: "skill_emoticon", value: gear.skill?.emoticon },
      ];

      for (const { key, value } of gearFields) {
        const url = fixImageUrl(value, key);
        if (!isValidUrl(url)) continue;
        queue.push({
          url,
          dest: path.join(gearBase, `gear${i}_${key}.png`),
        });
      }
    }
  }
  return queue;
}

export async function fetchHeroes(concurrency = FETCH_CONCURRENCY): Promise<Hero[]> {
  const indices = Array.from({ length: MAX_HERO }, (_, i) => i);
  const results = new Array<Hero | null>(MAX_HERO);

  await runWithConcurrency(indices, concurrency, async (i) => {
    try {
      const res = await fetch(`${API_BASE}/json-hero/${i}`);
      const body = (await res.json()) as Partial<Hero>;
      const hero = body.name ? (body as Hero) : null;
      results[i] = hero;
      if (hero) console.log(`Fetched: ${hero.name}`);
    } catch (err) {
      results[i] = null;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed hero ${i}:`, message);
    }
  });

  const heroes = results.filter((h): h is Hero => h !== null);
  await writeJson(path.join(DATA_DIR, "hero.json"), heroes);
  console.log(`Fetched ${heroes.length} heroes`);
  return heroes;
}

export async function downloadHeroImages(
  concurrency = IMAGE_CONCURRENCY,
): Promise<void> {
  const heroes = await readJson<Hero[]>(path.join(DATA_DIR, "hero.json"));
  const queue = buildImageQueue(heroes);
  console.log(`Found ${queue.length} images to download`);

  await downloadQueue(
    queue,
    concurrency,
    path.join(DATA_DIR, "failed-images.json"),
  );
}

function currentDownloadPath(
  heroCode: string,
  key: string,
  gearIndex: number | null,
  url: string,
): string {
  const basePath = path.join(IMAGE_OUTPUT_DIR, heroCode);
  if (gearIndex === null) {
    return path.join(basePath, `${key}${extFromUrl(url)}`);
  }
  const gearBase = path.join(basePath, "gear");
  const correctedUrl = fixImageUrl(url, key);
  const finalUrl = correctedUrl ?? url;
  return path.join(
    gearBase,
    `gear${gearIndex}_${key}${extFromUrl(finalUrl)}`,
  );
}

export async function rewriteHeroAssetPaths(): Promise<void> {
  const heroes = await readJson<Hero[]>(path.join(DATA_DIR, "hero.json"));

  for (const hero of heroes) {
    const code = String(hero.code);
    const relBase = path.posix.join(IMAGE_OUTPUT_DIR, code);

    const heroKeys = [
      "icon_m",
      "icon_f",
      "pic_m",
      "pic_f",
      "artwork1",
      "artwork2",
    ] as const;

    for (const key of heroKeys) {
      const url = hero[key];
      if (!isValidUrl(url)) continue;
      const localPath = path.posix.join(relBase, `${key}.png`);
      const realPath = path.join(IMAGE_OUTPUT_DIR, code, `${key}.png`);
      const oldPath = currentDownloadPath(code, key, null, url);

      if (!(await exists(realPath)) && (await exists(oldPath))) {
        await fsp.rename(oldPath, realPath);
      }
      if (await exists(realPath)) {
        hero[key] = localPath;
      }
    }

    const gears = Array.isArray(hero.gears) ? hero.gears : [];
    for (let i = 0; i < gears.length; i++) {
      const gear = gears[i];
      const gearBase = path.posix.join(relBase, "gear");

      const gearFields: {
        obj: Record<string, string>;
        key: string;
        name: string;
        gearIndex: number;
      }[] = [
        {
          obj: gear as Record<string, string>,
          key: "icon",
          name: "icon",
          gearIndex: i,
        },
      ];

      if (gear.skill) {
        gearFields.push(
          {
            obj: gear.skill as Record<string, string>,
            key: "icon",
            name: "skill_icon",
            gearIndex: i,
          },
          {
            obj: gear.skill as Record<string, string>,
            key: "emoticon",
            name: "skill_emoticon",
            gearIndex: i,
          },
        );
      }

      for (const { obj, key, name, gearIndex } of gearFields) {
        const url = obj[key];
        if (!isValidUrl(url)) continue;
        const localPath = path.posix.join(
          gearBase,
          `gear${gearIndex}_${name}.png`,
        );
        const realPath = path.join(
          IMAGE_OUTPUT_DIR,
          code,
          "gear",
          `gear${gearIndex}_${name}.png`,
        );
        const oldPath = currentDownloadPath(code, name, gearIndex, url);

        if (!(await exists(realPath)) && (await exists(oldPath))) {
          await fsp.rename(oldPath, realPath);
        }
        if (await exists(realPath)) {
          obj[key] = localPath;
        }
      }
    }
  }

  await writeJson(path.join(DATA_DIR, "hero-local.json"), heroes);
  console.log("Wrote hero-local.json with local asset paths");
}

// Convenience runner for the full hero pipeline.
export async function fetchAllHeroes(): Promise<void> {
  await fetchHeroes();
  await downloadHeroImages();
  await rewriteHeroAssetPaths();
}

