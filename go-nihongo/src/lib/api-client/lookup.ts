import type { LookupRequest, LookupResponse } from "@/types/lookup";

export class LookupAbortedError extends Error {
  constructor(message = "Lookup cancelled") {
    super(message);
    this.name = "LookupAbortedError";
  }
}

export async function lookup(
  request: LookupRequest,
  signal?: AbortSignal,
): Promise<LookupResponse> {
  let res: Response;
  try {
    res = await fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch (err) {
    if (
      signal?.aborted ||
      (err instanceof DOMException && err.name === "AbortError") ||
      (err instanceof Error && err.name === "AbortError")
    ) {
      throw new LookupAbortedError();
    }
    throw err;
  }

  const data = (await res.json()) as
    | LookupResponse
    | { error: { message: string } };
  if (!res.ok) {
    const message =
      "error" in data && data.error?.message
        ? data.error.message
        : `Lookup failed (${res.status})`;
    throw new Error(message);
  }
  return data as LookupResponse;
}
