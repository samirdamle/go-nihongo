import { afterEach, describe, expect, it, vi } from "vitest";
import { lookup, LookupAbortedError } from "./lookup";

describe("lookup api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts JSON and returns payload", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        kind: "term",
        query: "hi",
        mode: "english",
        entries: [],
        suggestions: [],
      }),
    });
    vi.stubGlobal("fetch", fetchImpl);

    const data = await lookup({
      q: "hi",
      mode: "english",
      kind: "term",
    });
    expect(data.kind).toBe("term");
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/lookup",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws LookupAbortedError when signal aborts", async () => {
    const fetchImpl = vi.fn().mockImplementation((_url, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    vi.stubGlobal("fetch", fetchImpl);

    const controller = new AbortController();
    const pending = lookup(
      { q: "slow", mode: "romaji", kind: "term" },
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toBeInstanceOf(LookupAbortedError);
  });
});
