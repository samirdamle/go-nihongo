import { NextResponse } from "next/server";
import { getEntryById } from "@/server/dictionary/search";
import type { ApiErrorBody } from "@/types/lookup";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const entry = getEntryById(id);
  if (!entry) {
    const body: ApiErrorBody = {
      error: { code: "not_found", message: `Entry not found: ${id}` },
    };
    return NextResponse.json(body, { status: 404 });
  }
  return NextResponse.json({ entry });
}
