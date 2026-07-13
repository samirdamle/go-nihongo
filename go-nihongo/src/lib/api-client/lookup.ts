import type { LookupRequest, LookupResponse } from "@/types/lookup";

export async function lookup(request: LookupRequest): Promise<LookupResponse> {
  const res = await fetch("/api/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data = (await res.json()) as LookupResponse | { error: { message: string } };
  if (!res.ok) {
    const message =
      "error" in data && data.error?.message
        ? data.error.message
        : `Lookup failed (${res.status})`;
    throw new Error(message);
  }
  return data as LookupResponse;
}
