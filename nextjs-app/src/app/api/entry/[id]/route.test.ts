import { describe, expect, it } from "vitest";
import { GET } from "./route";
import type { TermEntry } from "@/types/lookup";

function getEntry(id: string): Promise<Response> {
  return GET(new Request(`http://localhost/api/entry/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe("GET /api/entry/[id]", () => {
  it("returns 200 and entry for known id", async () => {
    const res = await getEntry("arigatou");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { entry: TermEntry };
    expect(body.entry.id).toBe("arigatou");
    expect(body.entry.japanese).toBe("ありがとう");
    expect(body.entry.romaji).toBeTruthy();
    expect(body.entry.senses.length).toBeGreaterThan(0);
  });

  it("returns 404 with error shape for unknown id", async () => {
    const res = await getEntry("does-not-exist");
    expect(res.status).toBe(404);
    const body = (await res.json()) as {
      error: { code: string; message: string };
    };
    expect(body.error.code).toBe("not_found");
    expect(body.error.message).toMatch(/does-not-exist/);
  });
});
