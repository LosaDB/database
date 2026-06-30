const TTL_MS = 604800_000; // 7 hari

interface CacheEntry<T> {
  promise: Promise<T>;
  ts: number;
}

const dataCache = new Map<string, CacheEntry<unknown>>();

function getDataUrl(alias: string, file: string): string {
  const base = (process.env.DATA_CDN_URL ??
    "https://raw.githubusercontent.com/rifadev26/lostsaga-database/main"
  ).replace(/\/$/, "");
  return `${base}/data/${encodeURIComponent(alias)}/${encodeURIComponent(file)}`;
}

async function fetchServerJson<T>(alias: string, file: string): Promise<T> {
  const url = getDataUrl(alias, file);
  const res = await fetch(url, { next: { revalidate: 604800 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function readLocalJson<T>(alias: string, file: string): Promise<T> {
  const [{ readFile }, { join }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const path = join(process.cwd(), "..", "data", alias, file);
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as T;
}

export async function loadServerData<T>(
  alias: string,
  file: string,
): Promise<T> {
  const key = `${alias}/${file}`;
  const now = Date.now();
  const cached = dataCache.get(key);
  if (cached && now - cached.ts < TTL_MS) {
    return cached.promise as Promise<T>;
  }

  const promise =
    process.env.USE_LOCAL_DATA === "true"
      ? readLocalJson<T>(alias, file)
      : fetchServerJson<T>(alias, file);

  dataCache.set(key, { promise, ts: now });
  return promise;
}
