import { describe, expect, it } from "vitest";
import { searchTerms } from "./search";

describe("searchTerms", () => {
  it("finds hajimemashite from romaji (AC-TERM-001)", () => {
    const { entries } = searchTerms("Hajimemashite", "romaji");
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0]?.japanese).toContain("初");
  });

  it("finds ありがとう (AC-TERM-002)", () => {
    const { entries } = searchTerms("ありがとう", "japanese");
    expect(entries[0]?.romaji).toMatch(/arigat/);
    expect(entries[0]?.senses[0]?.gloss.toLowerCase()).toContain("thank");
  });

  it("finds hello from english (AC-TERM-003)", () => {
    const { entries } = searchTerms("hello", "english");
    expect(entries.some((e) => e.japanese.includes("こんにちは"))).toBe(true);
  });

  it("returns ranked multi-match for hashi (AC-TERM-004)", () => {
    const { entries } = searchTerms("hashi", "romaji");
    expect(entries.length).toBeGreaterThanOrEqual(3);
    const glosses = entries.flatMap((e) => e.senses.map((s) => s.gloss));
    expect(glosses.some((g) => /bridge/i.test(g))).toBe(true);
    expect(glosses.some((g) => /chopstick/i.test(g))).toBe(true);
  });

  it("uses macron romaji for Tōkyō fixture (AC-TERM-005)", () => {
    const { entries } = searchTerms("東京", "japanese");
    expect(entries[0]?.romaji).toBe("Tōkyō");
  });
});
