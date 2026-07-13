import { describe, expect, it } from "vitest";
import { mapJmdictWord } from "./map-entry";
import type { JmdictWord } from "./jmdict-types";

describe("mapJmdictWord", () => {
  it("maps kanji headword, reading, romaji, and glosses", () => {
    const word: JmdictWord = {
      id: "1",
      kanji: [{ common: true, text: "水", tags: ["ichi1"] }],
      kana: [{ common: true, text: "みず", tags: [], appliesToKanji: ["*"] }],
      sense: [
        {
          partOfSpeech: ["n"],
          gloss: [{ lang: "eng", text: "water" }],
        },
      ],
    };
    const entry = mapJmdictWord(word);
    expect(entry).not.toBeNull();
    expect(entry!.id).toBe("jmdict:1");
    expect(entry!.japanese).toBe("水");
    expect(entry!.readings).toContain("みず");
    expect(entry!.romaji).toBe("mizu");
    expect(entry!.senses[0]?.gloss).toBe("water");
    expect(entry!.commonality).toBeGreaterThan(0);
    expect(entry!.tags).toEqual(expect.arrayContaining(["ichi1", "common"]));
  });

  it("uses kana-only headword when no kanji", () => {
    const word: JmdictWord = {
      id: "2",
      kanji: [],
      kana: [{ common: true, text: "こんにちは" }],
      sense: [
        {
          gloss: [
            { lang: "eng", text: "hello" },
            { lang: "eng", text: "good day" },
          ],
        },
      ],
    };
    const entry = mapJmdictWord(word)!;
    expect(entry.japanese).toBe("こんにちは");
    expect(entry.senses.map((s) => s.gloss)).toEqual(["hello", "good day"]);
  });

  it("returns null when no senses", () => {
    const word: JmdictWord = {
      id: "3",
      kana: [{ text: "あ" }],
      sense: [],
    };
    expect(mapJmdictWord(word)).toBeNull();
  });
});
