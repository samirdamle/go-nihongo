import { describe, expect, it } from "vitest";
import { parseJsonFromLlm } from "./parse-json";

describe("parseJsonFromLlm", () => {
  it("parses plain JSON", () => {
    expect(parseJsonFromLlm<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses fenced JSON", () => {
    expect(
      parseJsonFromLlm<{ b: string }>("```json\n{\"b\":\"x\"}\n```"),
    ).toEqual({ b: "x" });
  });
});
