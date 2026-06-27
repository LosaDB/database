import fsp from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { extractIop, applySecondaryXor } from "../lib/iop";
import {
  CACHE_DIR,
  IOP_CACHE_DIR,
  readCachedOrDownload,
} from "../lib/patch-manifest";
import { writeJson } from "../lib/utils";


const MANUAL_INI_IOP = "config/sp2_etc_manual.ini.iop";
const MANUAL_INI_NAME = "sp2_etc_manual.ini";

export interface ManualSegment {
  lineNo: number;
  segmentNo: number;
  text: string;
}

export interface ManualEntry {
  id: number;
  text: string;
  rawSegments: ManualSegment[];
}

function decodeKorean(buf: Buffer): string {
  try {
    return new TextDecoder("cp949").decode(buf);
  } catch {
    return new TextDecoder("euc-kr").decode(buf);
  }
}

function parseManualSections(text: string): Record<number, ManualEntry> {
  const manuals: Record<number, ManualEntry> = {};
  let currentId: number | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(";")) continue;

    const sectionMatch = /^\[Manual(\d+)\]$/i.exec(line);
    if (sectionMatch) {
      currentId = Number(sectionMatch[1]);
      if (!manuals[currentId]) {
        manuals[currentId] = { id: currentId, text: "", rawSegments: [] };
      }
      continue;
    }

    if (currentId === null) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (!value) continue;

    const textMatch = /^(\d+)Text(\d+)$/i.exec(key);
    if (!textMatch) continue;

    const lineNo = Number(textMatch[1]);
    const segmentNo = Number(textMatch[2]);
    manuals[currentId].rawSegments.push({ lineNo, segmentNo, text: value });
  }

  for (const manual of Object.values(manuals)) {
    manual.rawSegments.sort(
      (a, b) => a.lineNo - b.lineNo || a.segmentNo - b.segmentNo,
    );

    const lineGroups = new Map<number, string[]>();
    for (const seg of manual.rawSegments) {
      if (!lineGroups.has(seg.lineNo)) lineGroups.set(seg.lineNo, []);
      lineGroups.get(seg.lineNo)!.push(seg.text);
    }

    const lineNos = Array.from(lineGroups.keys()).sort((a, b) => a - b);
    manual.text = lineNos
      .map((lineNo) => lineGroups.get(lineNo)!.join(" "))
      .join("\n");
  }

  return manuals;
}

export async function fetchManuals(): Promise<void> {
  await fsp.mkdir(CACHE_DIR, { recursive: true });

  console.log(`Downloading ${MANUAL_INI_IOP}`);
  const iopBuffer = await readCachedOrDownload(MANUAL_INI_IOP);
  const entries = await extractIop(iopBuffer);

  const entry = entries.find((e) =>
    e.filename.toLowerCase().includes(MANUAL_INI_NAME.toLowerCase()),
  );
  if (!entry) {
    throw new Error(`${MANUAL_INI_NAME} not found inside .iop archive`);
  }

  // sp2_etc_manual.ini needs the secondary XOR even though the archive comment
  // does not flag it as encrypted data.
  const decrypted = applySecondaryXor(entry.data);
  const text = decodeKorean(decrypted);

  await fsp.writeFile(path.join(CACHE_DIR, MANUAL_INI_NAME), text);
  console.log(`Cached raw manual INI to data/.cache/${MANUAL_INI_NAME}`);

  const manuals = parseManualSections(text);
  await writeJson(path.join("data", "etc-manuals.json"), manuals);
  console.log(
    `Wrote ${Object.keys(manuals).length} manuals to data/etc-manuals.json`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchManuals().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
