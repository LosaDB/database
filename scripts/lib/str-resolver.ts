import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getServerMapDir } from "../config";

export type StringTable = Map<string, string>;

function decodeKorean(buf: Buffer): string {
  try {
    return new TextDecoder("cp949").decode(buf);
  } catch {
    return new TextDecoder("euc-kr").decode(buf);
  }
}

export async function loadStringTable(alias: string): Promise<StringTable> {
  const textDir = path.join(getServerMapDir(alias), "resource", "text");
  const entries = await readdir(textDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".txt"))
    .map((e) => e.name)
    .sort();

  const table: StringTable = new Map();

  for (const file of files) {
    const filePath = path.join(textDir, file);
    const buf = await readFile(filePath);
    const text = decodeKorean(buf);

    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const match = /^\|([^|]+)\|(.*)\|$/.exec(line);
      if (!match) continue;
      const key = match[1].trim();
      const value = match[2];
      table.set(key, value);
    }
  }

  return table;
}

export function resolveStr(
  value: string | undefined,
  iniFile: string | string[],
  section: string,
  table: StringTable,
): string {
  if (value === undefined || value === null) return "";
  const strMatch = /^STR\((\d+)\)$/i.exec(value.trim());
  if (!strMatch) return value;
  const n = strMatch[1];
  const candidates = Array.isArray(iniFile) ? iniFile : [iniFile];
  for (const file of candidates) {
    const key = `INI_${file}::${section}_${n}`;
    const resolved = table.get(key);
    if (resolved !== undefined) return resolved;
  }
  return value;
}

export function resolveStrFields(
  fields: Record<string, string>,
  iniFile: string | string[],
  section: string,
  table: StringTable,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    resolved[key] = resolveStr(value, iniFile, section, table);
  }
  return resolved;
}
