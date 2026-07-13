import { describe, expect, it } from "vitest";
import { OPENROUTER_DEFAULT_MODEL } from "./openrouter";

describe("OpenRouter default model (Nemotron free)", () => {
  it("defaults to nvidia/nemotron-3-ultra-550b-a55b:free", () => {
    expect(OPENROUTER_DEFAULT_MODEL).toBe(
      "nvidia/nemotron-3-ultra-550b-a55b:free",
    );
  });
});
