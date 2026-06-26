import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const MAX_HERO = 938;
const FETCH_CONCURRENCY = 20;
const IMAGE_CONCURRENCY = 15;
const IMAGE_TIMEOUT_MS = 15_000;
const IMAGE_OUTPUT_DIR = "Mercenary";
const DATA_DIR = "data";

// ── Types ────────────────────────────────────────────────

interface Skill {
  name: string;
  icon?: string;
  emoticon?: string;
  [key: string]: unknown;
}

interface Gear {
  id: number;
  slug: string;
  name: string;
  name_kr?: string;
  rarity: string;
  code: string;
  item_type: string;
  sub_type: string;
  icon: string;
  skill: Skill;
  [key: string]: unknown;
}

interface Hero {
  name: string;
  code: string;
  summary: string;
  type: string;
  rarity: string;
  default_ani: string;
  icon_m: string;
  icon_f: string;
  pic_m: string;
  pic_f: string;
  artwork1: string;
  artwork2: string;
  gears: Gear[];
  [key: string]: unknown;
}

interface QueueItem {
  url: string;
  dest: string;
}

type DownloadResult =
  | "downloaded"
  | "placeholder"
  | "migrated"
  | "skipped"
  | `failed: ${string}`;

// ── Helpers ─────────────────────────────────────────────

function isValidUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("http");
}

function extFromUrl(url: string): string {
  try {
    const ext = path.extname(new URL(url).pathname);
    return ext || ".png";
  } catch {
    return ".png";
  }
}

function fixImageUrl(url: string | undefined, key: string): string | null {
  if (typeof url !== "string") return null;

  // The API sometimes returns placeholder URLs for empty gear slots.
  if (url.includes("ItemIconPack000-empty")) return null;

  // Some skill icon/emoticon URLs incorrectly use "-n" instead of "-s".
  // Example:
  //   API:  SkillIconPack105-n180_weapon.png  (HTTP 400)
  //   Real: SkillIconPack105-s180_weapon.png  (HTTP 200)
  if (key === "skill_icon" || key === "skill_emoticon") {
    return url.replace(/\/SkillIconPack\d+-n\d+_[^/]+$/, (match) =>
      match.replace("-n", "-s"),
    );
  }

  return url;
}

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

async function exists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(item: QueueItem): Promise<DownloadResult> {
  const stat = await fsp.stat(item.dest).catch(() => null);
  if (stat) return "skipped";

  // Migrate files downloaded with the original extension (.jpg, .jpeg)
  // so we don't re-download after switching all local paths to .png.
  const legacyExts = [".jpg", ".jpeg"];
  for (const ext of legacyExts) {
    const legacyPath = item.dest.replace(/\.png$/i, ext);
    if (legacyPath !== item.dest && (await exists(legacyPath))) {
      await fsp.rename(legacyPath, item.dest);
      return "migrated";
    }
  }

  await fsp.mkdir(path.dirname(item.dest), { recursive: true });

  let timeout: NodeJS.Timeout | undefined;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

    const res = await fetch(item.url, { signal: controller.signal });
    clearTimeout(timeout);

    const contentType = res.headers.get("content-type") || "";
    const isImage = contentType.startsWith("image/");

    // Some missing assets return 4xx with a placeholder image body.
    // Save it anyway if the response is an image.
    if (!res.ok && !isImage) {
      throw new Error(`HTTP ${res.status}`);
    }

    const body = Readable.fromWeb(
      res.body as import("stream/web").ReadableStream,
    );
    await pipeline(body, fs.createWriteStream(item.dest));

    return res.ok ? "downloaded" : "placeholder";
  } catch (err) {
    if (timeout) clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    return `failed: ${message}`;
  }
}

// ── Main functions ──────────────────────────────────────

async function fetchHeroes(concurrency: number): Promise<Hero[]> {
  const results = new Array<Hero | null>(MAX_HERO);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < MAX_HERO) {
      const i = nextIndex++;
      try {
        const res = await fetch(`https://apis.lostsaga.xyz/json-hero/${i}`);
        const body = (await res.json()) as Partial<Hero>;
        const hero = body.name ? (body as Hero) : null;
        results[i] = hero;
        if (hero) console.log(`Fetched: ${hero.name}`);
      } catch (err) {
        results[i] = null;
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed hero ${i}:`, message);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  const heroes = results.filter((h): h is Hero => h !== null);
  await fsp.writeFile(
    path.join(DATA_DIR, "hero.json"),
    JSON.stringify(heroes, null, 2),
  );
  console.log(`Fetched ${heroes.length} heroes`);
  return heroes;
}

async function downloadHeroImages(concurrency: number): Promise<void> {
  const heroes = JSON.parse(
    await fsp.readFile(path.join(DATA_DIR, "hero.json"), "utf8"),
  ) as Hero[];
  const queue = buildImageQueue(heroes);
  console.log(`Found ${queue.length} images to download`);

  const stats = {
    downloaded: 0,
    placeholder: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
  };
  const failed: { url: string; dest: string; error: DownloadResult }[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < queue.length) {
      const item = queue[nextIndex++];
      const status = await downloadImage(item);

      if (status === "downloaded") stats.downloaded++;
      else if (status === "placeholder") stats.placeholder++;
      else if (status === "migrated") stats.migrated++;
      else if (status === "skipped") stats.skipped++;
      else {
        stats.failed++;
        failed.push({ url: item.url, dest: item.dest, error: status });
      }

      if (nextIndex % 50 === 0 || nextIndex === queue.length) {
        console.log(`Progress: ${nextIndex}/${queue.length}`, stats);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (failed.length > 0) {
    await fsp.writeFile(
      path.join(DATA_DIR, "failed-images.json"),
      JSON.stringify(failed, null, 2),
    );
  }

  console.log("Image download done:", stats);
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
  return path.join(gearBase, `gear${gearIndex}_${key}${extFromUrl(finalUrl)}`);
}

async function changeHeroAsset(): Promise<void> {
  const heroes = JSON.parse(
    await fsp.readFile(path.join(DATA_DIR, "hero.json"), "utf8"),
  ) as Hero[];

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
      ];

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

  await fsp.writeFile(
    path.join(DATA_DIR, "hero-local.json"),
    JSON.stringify(heroes, null, 2),
  );
  console.log("Wrote hero-local.json with local asset paths");
}

async function main(): Promise<void> {
  await fetchHeroes(FETCH_CONCURRENCY);
  await downloadHeroImages(IMAGE_CONCURRENCY);
  await changeHeroAsset();
}

main().catch((err) => console.error(err));
