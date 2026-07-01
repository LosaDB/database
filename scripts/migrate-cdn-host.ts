import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR, ASSETS_IMAGE_BASE_URL } from "./config";

const OLD_BASE = "https://cdn.jsdelivr.net/gh/rifadev26/lostsaga-assets@main/images";

async function walk(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.name.endsWith(".json")) continue;

    const text = await readFile(fullPath, "utf8");
    const updated = text.split(OLD_BASE).join(ASSETS_IMAGE_BASE_URL);

    if (updated !== text) {
      await writeFile(fullPath, updated, "utf8");
      console.log(`Migrated ${fullPath}`);
    }
  }
}

walk(DATA_DIR)
  .then(() => console.log("Done"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
