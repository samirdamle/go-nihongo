import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";
import type { LookupResponse } from "@/types/lookup";

function postLookup(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

async function jsonOf<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

describe("POST /api/lookup", () => {
  const prevMt = process.env.MT_PROVIDER;

  beforeEach(() => {
    process.env.MT_PROVIDER = "mock";
  });

  afterEach(() => {
    if (prevMt === undefined) delete process.env.MT_PROVIDER;
    else process.env.MT_PROVIDER = prevMt;
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/lookup", {
        method: "POST",
        body: "not-json",
      }),
    );
    expect(res.status).toBe(400);
    const body = await jsonOf<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("invalid_request");
  });

  it("returns 400 for empty q (AC-IN-006)", async () => {
    const res = await postLookup({ q: "  ", mode: "romaji", kind: "term" });
    expect(res.status).toBe(400);
    const body = await jsonOf<{ error: { code: string; message: string } }>(
      res,
    );
    expect(body.error.code).toBe("invalid_request");
    expect(body.error.message).toMatch(/q/i);
  });

  it("returns 400 for invalid mode", async () => {
    const res = await postLookup({ q: "hello", mode: "klingon", kind: "term" });
    expect(res.status).toBe(400);
    const body = await jsonOf<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("invalid_request");
  });

  it("returns 400 for invalid kind", async () => {
    const res = await postLookup({
      q: "hello",
      mode: "english",
      kind: "paragraph",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when q exceeds max length", async () => {
    const res = await postLookup({
      q: "a".repeat(501),
      mode: "romaji",
      kind: "term",
    });
    expect(res.status).toBe(400);
    const body = await jsonOf<{ error: { code: string } }>(res);
    expect(body.error.code).toBe("invalid_request");
  });

  it("returns term for romaji hajimemashite (AC-TERM-001)", async () => {
    const res = await postLookup({
      q: "Hajimemashite",
      mode: "romaji",
      kind: "term",
    });
    expect(res.status).toBe(200);
    const body = await jsonOf<LookupResponse>(res);
    expect(body.kind).toBe("term");
    if (body.kind !== "term") return;
    expect(body.entries.length).toBeGreaterThan(0);
    expect(body.entries[0]?.japanese).toMatch(/初|はじめ/);
    expect(body.entries[0]?.senses[0]?.gloss).toBeTruthy();
  });

  it("returns term for japanese ありがとう (AC-TERM-002)", async () => {
    const res = await postLookup({
      q: "ありがとう",
      mode: "japanese",
      kind: "term",
    });
    expect(res.status).toBe(200);
    const body = await jsonOf<LookupResponse>(res);
    expect(body.kind).toBe("term");
    if (body.kind !== "term") return;
    expect(body.entries[0]?.romaji.toLowerCase()).toMatch(/arigat/);
    expect(body.entries[0]?.senses[0]?.gloss.toLowerCase()).toContain("thank");
  });

  it("returns term for english hello (AC-TERM-003)", async () => {
    const res = await postLookup({
      q: "hello",
      mode: "english",
      kind: "term",
    });
    expect(res.status).toBe(200);
    const body = await jsonOf<LookupResponse>(res);
    expect(body.kind).toBe("term");
    if (body.kind !== "term") return;
    expect(body.entries.some((e) => e.japanese.includes("こんにちは"))).toBe(
      true,
    );
  });

  it("returns ranked multi-match for hashi (AC-TERM-004)", async () => {
    const res = await postLookup({
      q: "hashi",
      mode: "romaji",
      kind: "term",
    });
    expect(res.status).toBe(200);
    const body = await jsonOf<LookupResponse>(res);
    expect(body.kind).toBe("term");
    if (body.kind !== "term") return;
    expect(body.entries.length).toBeGreaterThanOrEqual(3);
    const glosses = body.entries.flatMap((e) => e.senses.map((s) => s.gloss));
    expect(glosses.some((g) => /bridge/i.test(g))).toBe(true);
    expect(glosses.some((g) => /chopstick/i.test(g))).toBe(true);
    // commonality: bridge (80) before edge (60)
    expect(body.entries[0]?.commonality).toBeGreaterThanOrEqual(
      body.entries[body.entries.length - 1]?.commonality ?? 0,
    );
  });

  it("returns empty entries and suggestions array on miss (AC-FAIL-001)", async () => {
    const res = await postLookup({
      q: "xyzzynotaword",
      mode: "romaji",
      kind: "term",
    });
    expect(res.status).toBe(200);
    const body = await jsonOf<LookupResponse>(res);
    expect(body.kind).toBe("term");
    if (body.kind !== "term") return;
    expect(body.entries).toEqual([]);
    expect(Array.isArray(body.suggestions)).toBe(true);
  });

  it("returns sentence with mock MT provider (AC-FAIL-003 shape)", async () => {
    const res = await postLookup({
      q: "今日はいい天気です",
      mode: "japanese",
      kind: "sentence",
    });
    expect(res.status).toBe(200);
    const body = await jsonOf<LookupResponse>(res);
    expect(body.kind).toBe("sentence");
    if (body.kind !== "sentence") return;
    expect(body.translation.provider).toBe("mock");
    expect(body.translation.text).toContain("[mock-en]");
    expect(Array.isArray(body.breakdown)).toBe(true);
  });

  it("returns error body shape { error: { code, message } }", async () => {
    const res = await postLookup({ q: "", mode: "romaji", kind: "term" });
    const body = await jsonOf<{ error: { code: string; message: string } }>(
      res,
    );
    expect(body).toEqual({
      error: {
        code: expect.any(String),
        message: expect.any(String),
      },
    });
  });
});
