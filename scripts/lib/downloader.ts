import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { IMAGE_TIMEOUT_MS } from "../config";
import { exists, writeJson } from "./utils";
import type { DownloadResult, QueueItem } from "./types";
import { runWithConcurrency } from "./queue";

interface DownloadStats {
  downloaded: number;
  placeholder: number;
  migrated: number;
  skipped: number;
  failed: number;
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

export async function downloadQueue(
  queue: QueueItem[],
  concurrency: number,
  failedOutputPath?: string,
): Promise<DownloadStats> {
  const stats: DownloadStats = {
    downloaded: 0,
    placeholder: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
  };
  const failed: { url: string; dest: string; error: DownloadResult }[] = [];

  await runWithConcurrency(queue, concurrency, async (item, idx) => {
    const status = await downloadImage(item);

    if (status === "downloaded") stats.downloaded++;
    else if (status === "placeholder") stats.placeholder++;
    else if (status === "migrated") stats.migrated++;
    else if (status === "skipped") stats.skipped++;
    else {
      stats.failed++;
      failed.push({ url: item.url, dest: item.dest, error: status });
    }

    if ((idx + 1) % 50 === 0 || idx + 1 === queue.length) {
      console.log(`Progress: ${idx + 1}/${queue.length}`, { ...stats });
    }
  });

  if (failed.length > 0 && failedOutputPath) {
    await writeJson(failedOutputPath, failed);
  }

  console.log("Download done:", stats);
  return stats;
}
