import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  clearDictionaryCache,
  getDictionaryCache,
  loadDictionary,
  loadDictionaryState,
  mapJmdictFile,
} from "./load";
import sample from "./testdata/jmdict-sample.json";
import type { JmdictFile } from "./jmdict-types";

const here = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.join(here, "testdata", "jmdict-sample.json");

describe("mapJmdictFile / loadDictionary", () => {
  afterEach(() => {
    clearDictionaryCache();
  });

  it("maps sample file including 水 and こんにちは", () => {
    const entries = mapJmdictFile(sample as JmdictFile);
    expect(entries.length).toBeGreaterThanOrEqual(3);
    expect(entries.some((e) => e.japanese === "水")).toBe(true);
    expect(entries.some((e) => e.japanese === "こんにちは")).toBe(true);
    const tokyo = entries.find((e) => e.japanese === "東京");
    expect(tokyo?.romaji).toBe("tōkyō");
  });

  it("loads from path and caches the same array reference", async () => {
    const first = await loadDictionary({
      filePath: samplePath,
      fallbackToFixtures: false,
    });
    expect(first.length).toBeGreaterThanOrEqual(3);
    expect(getDictionaryCache()?.source).toBe("jmdict");

    const second = await loadDictionary({
      filePath: samplePath,
      fallbackToFixtures: false,
    });
    expect(second).toBe(first);
  });

  it("falls back to fixtures when file missing", async () => {
    const state = await loadDictionaryState({
      filePath: path.join(here, "testdata", "does-not-exist.json"),
      fallbackToFixtures: true,
    });
    expect(state.source).toBe("fixtures");
    expect(state.entries.length).toBeGreaterThan(0);
  });
});
