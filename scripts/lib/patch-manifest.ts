import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractIop } from "./iop";
import { exists } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, "../..");

export const PATCH_BASE =
  "https://lostsagakr-cdn.valofe.com/lostsaga_service/client";
export const SERVER_PATCH_CFG_IOP = `${PATCH_BASE}/server_patch.cfg.iop`;

export const CACHE_DIR = path.join(ROOT_DIR, "data", ".cache");
export const IOP_CACHE_DIR = path.join(CACHE_DIR, "iop");

export interface PatchEntry {
  remotePath: string;
  crc: string;
  compressedSize?: number;
  uncompressedSize?: number;
}

export async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function readCachedOrDownload(
  remotePath: string,
  cacheDir = IOP_CACHE_DIR,
): Promise<Buffer> {
  const cachePath = path.join(cacheDir, ...remotePath.split("/"));
  if (await exists(cachePath)) {
    return fsp.readFile(cachePath);
  }

  const url = `${PATCH_BASE}/${remotePath}`;
  const buf = await fetchBuffer(url);
  await fsp.mkdir(path.dirname(cachePath), { recursive: true });
  await fsp.writeFile(cachePath, buf);
  return buf;
}

export async function downloadAndExtractManifest(): Promise<
  Map<string, PatchEntry>
> {
  const cachePath = path.join(CACHE_DIR, "server_patch.cfg");
  let text: string;

  if (await exists(cachePath)) {
    text = await fsp.readFile(cachePath, "utf-8");
  } else {
    console.log("Downloading server_patch.cfg.iop");
    const buf = await fetchBuffer(SERVER_PATCH_CFG_IOP);
    await fsp.mkdir(CACHE_DIR, { recursive: true });
    await fsp.writeFile(path.join(CACHE_DIR, "server_patch.cfg.iop"), buf);
    const entries = await extractIop(buf);
    const cfgEntry = entries.find((e) =>
      e.filename.includes("server_patch.cfg"),
    );
    if (!cfgEntry) {
      throw new Error("server_patch.cfg not found inside .iop archive");
    }
    text = new TextDecoder("euc-kr").decode(cfgEntry.data);
    await fsp.writeFile(cachePath, text);
  }

  const map = new Map<string, PatchEntry>();
  for (const line of text.split(/\r?\n/)) {
    const match = /^\[(.+?):([0-9a-fA-F]+):(\d+):(\d+)\]$/.exec(line.trim());
    if (!match) continue;
    const [, remotePath, crc, compressedSize, uncompressedSize] = match;
    map.set(path.basename(remotePath), {
      remotePath,
      crc,
      compressedSize: Number(compressedSize),
      uncompressedSize: Number(uncompressedSize),
    });
  }

  return map;
}
