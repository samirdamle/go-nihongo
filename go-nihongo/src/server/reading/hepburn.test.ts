import { describe, expect, it } from "vitest";
import { toHepburn } from "./hepburn";

describe("toHepburn", () => {
  it("maps basic gojūon (AC-TERM-005 related)", () => {
    expect(toHepburn("あいうえお")).toBe("aiueo");
    expect(toHepburn("かきくけこ")).toBe("kakikukeko");
    expect(toHepburn("たちつてと")).toBe("tachitsuteto");
  });

  it("converts ありがとう → arigatō", () => {
    expect(toHepburn("ありがとう")).toBe("arigatō");
  });

  it("converts とうきょう → tōkyō (AC-TERM-005)", () => {
    expect(toHepburn("とうきょう")).toBe("tōkyō");
  });

  it("converts しんかんせん → shinkansen", () => {
    expect(toHepburn("しんかんせん")).toBe("shinkansen");
  });

  it("handles digraphs", () => {
    expect(toHepburn("きゃしゃちょ")).toBe("kyashacho");
    expect(toHepburn("じゅう")).toBe("jū");
  });

  it("handles sokuon っ", () => {
    expect(toHepburn("がっこう")).toBe("gakkō");
    expect(toHepburn("みっつ")).toBe("mittsu");
    expect(toHepburn("マッチ")).toBe("matchi");
  });

  it("handles ん before vowels/y with apostrophe", () => {
    expect(toHepburn("きんえん")).toBe("kin'en");
    expect(toHepburn("しんや")).toBe("shin'ya");
  });

  it("handles ん before b/m/p as m", () => {
    expect(toHepburn("しんぶん")).toBe("shimbun");
    expect(toHepburn("ぐんま")).toBe("gumma");
  });

  it("accepts katakana and prolonged sound mark", () => {
    expect(toHepburn("トーキョー")).toBe("tōkyō");
    expect(toHepburn("コーヒー")).toBe("kōhī");
  });

  it("keeps えい as ei (not ē)", () => {
    expect(toHepburn("えいが")).toBe("eiga");
  });

  it("capitalizes when requested", () => {
    expect(toHepburn("とうきょう", { capitalize: true })).toBe("Tōkyō");
  });

  it("passes through empty and non-kana", () => {
    expect(toHepburn("")).toBe("");
    expect(toHepburn("hello")).toBe("hello");
  });
});
