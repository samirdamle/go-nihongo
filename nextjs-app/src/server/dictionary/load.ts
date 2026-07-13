import { readFile } from "node:fs/promises";
import path from "node:path";
import type { TermEntry } from "@/types/lookup";
import { FIXTURE_ENTRIES } from "./fixtures";
import type { JmdictFile } from "./jmdict-types";
import { mapJmdictWord } from "./map-entry";

export type LoadDictionaryOptions = {
  /** Absolute or process-cwd-relative path to jmdict-simplified JSON. */
  filePath?: string;
  /**
   * When true (default), fall back to in-repo fixtures if the data file is
   * missing — keeps local/dev/CI usable without `npm run dict:prepare`.
   */
  fallbackToFixtures?: boolean;
};

type CacheState = {
  entries: TermEntry[];
  source: "jmdict" | "fixtures";
  filePath: string | null;
};

let cache: CacheState | null = null;
let inflight: Promise<CacheState> | null = null;

/** Clear singleton (tests only). */
export function clearDictionaryCache(): void {
  cache = null;
  inflight = null;
}

export function getDictionaryCache(): CacheState | null {
  return cache;
}

/**
 * Resolve path to prepared dictionary JSON.
 * Override with DICT_PATH env (absolute or cwd-relative).
 */
export function resolveDictionaryPath(
  explicit?: string,
): string {
  // turbopackIgnore: keep NFT from tracing the whole project via cwd
  const cwd = /* turbopackIgnore: true */ process.cwd();
  if (explicit) {
    return path.isAbsolute(explicit) ? explicit : path.join(cwd, explicit);
  }
  if (process.env.DICT_PATH) {
    const p = process.env.DICT_PATH;
    return path.isAbsolute(p) ? p : path.join(cwd, p);
  }
  // Prefer go-nihongo cwd (npm scripts) — data/ is gitignored prepared output
  return path.join(cwd, "data", "jmdict-eng.json");
}

/**
 * Load and map dictionary once per process (serverless-friendly singleton).
 * Subsequent calls return the same array reference.
 */
export async function loadDictionary(
  options: LoadDictionaryOptions = {},
): Promise<TermEntry[]> {
  const state = await loadDictionaryState(options);
  return state.entries;
}

export async function loadDictionaryState(
  options: LoadDictionaryOptions = {},
): Promise<CacheState> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    const filePath = resolveDictionaryPath(options.filePath);
    const fallback = options.fallbackToFixtures !== false;

    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as JmdictFile;
      const entries = mapJmdictFile(parsed);
      if (entries.length === 0) {
        throw new Error(`Dictionary file mapped to 0 entries: ${filePath}`);
      }
      cache = { entries, source: "jmdict", filePath };
      return cache;
    } catch (err) {
      const missing =
        err && typeof err === "object" && "code" in err && err.code === "ENOENT";
      if (fallback && missing) {
        cache = {
          entries: FIXTURE_ENTRIES,
          source: "fixtures",
          filePath: null,
        };
        return cache;
      }
      if (fallback && !missing) {
        // Corrupt file — still allow fixtures so the app boots
        console.error(
          "[dictionary] failed to load JMdict file, using fixtures:",
          err,
        );
        cache = {
          entries: FIXTURE_ENTRIES,
          source: "fixtures",
          filePath: null,
        };
        return cache;
      }
      throw err;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function mapJmdictFile(file: JmdictFile): TermEntry[] {
  const out: TermEntry[] = [];
  for (const word of file.words ?? []) {
    const entry = mapJmdictWord(word);
    if (entry) out.push(entry);
  }
  return out;
}
