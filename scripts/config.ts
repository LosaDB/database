// Central configuration for all data fetchers.
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

export const MAX_HERO = 938;
export const FETCH_CONCURRENCY = 20;
export const IMAGE_CONCURRENCY = 15;
export const IMAGE_TIMEOUT_MS = 15_000;

export const API_BASE = "https://apis.lostsaga.xyz";
export const DATA_DIR = path.join(ROOT_DIR, "data");
export const IMAGE_OUTPUT_DIR_REL = "data/images/heroes";
export const IMAGE_OUTPUT_DIR = path.join(ROOT_DIR, IMAGE_OUTPUT_DIR_REL);
