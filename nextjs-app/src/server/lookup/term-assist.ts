import { parseJsonFromLlm } from "@/server/llm/parse-json";
import type { LlmClient } from "@/server/llm/types";
import type { InputMode, TermEntry } from "@/types/lookup";

type LlmTermPayload = {
  entries?: Array<{
    japanese?: string;
    readings?: string[];
    romaji?: string;
    senses?: Array<{ gloss?: string; pos?: string[] }>;
  }>;
};

/**
 * LLM-backed transliteration + glosses for term lookup when dictionary misses.
 * Cards are tagged `llm` so they are not treated as dictionary of record.
 */
export async function assistTermLookup(
  llm: LlmClient,
  q: string,
  mode: InputMode,
): Promise<TermEntry[]> {
  const modeHint =
    mode === "romaji"
      ? "Input is Japanese written in Latin letters (romaji). Transliterate to Japanese script and explain meanings."
      : mode === "japanese"
        ? "Input is Japanese script. Provide Hepburn romaji (macrons for long vowels) and English meanings."
        : "Input is English. Provide natural Japanese equivalent(s) with kana readings and Hepburn romaji, plus English glosses.";

  const system = `You are a careful Japanese learning assistant for English speakers.
${modeHint}
Return ONLY valid JSON (no markdown) with this shape:
{
  "entries": [
    {
      "japanese": "string (kanji/kana headword)",
      "readings": ["hiragana or katakana"],
      "romaji": "Hepburn with macrons where appropriate",
      "senses": [{ "gloss": "English meaning", "pos": ["optional POS"] }]
    }
  ]
}
Rules:
- Prefer common, accurate forms. If ambiguous (e.g. hashi), return multiple entries ranked most common first (max 5).
- romaji must be Hepburn with macrons (ō ū) for long vowels.
- Do not invent obscure slang. If unsure, still give best-effort common readings and say so in a gloss.`;

  const result = await llm.chat({
    temperature: 0.2,
    maxTokens: 1200,
    messages: [
      { role: "system", content: system },
      { role: "user", content: q },
    ],
  });

  const payload = parseJsonFromLlm<LlmTermPayload>(result.content);
  const raw = payload.entries ?? [];
  const entries: TermEntry[] = [];

  for (let i = 0; i < raw.length && i < 5; i++) {
    const e = raw[i]!;
    const japanese = e.japanese?.trim();
    if (!japanese) continue;
    const senses = (e.senses ?? [])
      .map((s) => ({
        gloss: (s.gloss ?? "").trim(),
        pos: s.pos,
      }))
      .filter((s) => s.gloss.length > 0);
    if (senses.length === 0) {
      senses.push({ gloss: "(no gloss returned)", pos: undefined });
    }
    const readings = (e.readings ?? []).map((r) => r.trim()).filter(Boolean);
    const romaji = (e.romaji ?? "").trim() || q;
    entries.push({
      id: `llm:${mode}:${slug(japanese)}:${i}`,
      japanese,
      readings,
      romaji,
      senses,
      commonality: 50 - i * 5,
      tags: ["llm", "openrouter"],
    });
  }

  return entries;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .slice(0, 40) || "term";
}
