import { describe, expect, it } from "vitest";
import { detectInput, detectKind, detectMode } from "./heuristics";

describe("detectMode", () => {
  it("detects japanese for kana/kanji (AC-IN-002)", () => {
    expect(detectMode("ありがとう")).toBe("japanese");
    expect(detectMode("初めまして")).toBe("japanese");
  });

  it("detects romaji for single latin token (AC-IN-003)", () => {
    expect(detectMode("Hajimemashite")).toBe("romaji");
    expect(detectMode("hashi")).toBe("romaji");
  });

  it("detects english for known english words and multi-word latin", () => {
    expect(detectMode("hello")).toBe("english");
    expect(detectMode("good morning")).toBe("english");
  });
});

describe("detectKind", () => {
  it("prefers term for short dictionary-like input", () => {
    expect(detectKind("hashi", "romaji")).toBe("term");
    expect(detectKind("ありがとう", "japanese")).toBe("term");
    expect(detectKind("hello", "english")).toBe("term");
  });

  it("classifies punctuated text as sentence", () => {
    expect(detectKind("Hello, how are you?", "english")).toBe("sentence");
    expect(detectKind("今日は暑いです。", "japanese")).toBe("sentence");
  });

  it("classifies longer english as sentence", () => {
    expect(detectKind("I want to eat sushi tomorrow", "english")).toBe(
      "sentence",
    );
  });
});

describe("detectInput", () => {
  it("returns both mode and kind", () => {
    expect(detectInput("hajimemashite")).toEqual({
      mode: "romaji",
      kind: "term",
    });
  });
});
