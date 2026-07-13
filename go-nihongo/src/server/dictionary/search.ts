import type { InputMode, Suggestion, TermEntry } from "@/types/lookup";
import { FIXTURE_ENTRIES } from "./fixtures";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/** Ranked term search against the current dictionary source (fixtures in M1). */
export function searchTerms(
  q: string,
  mode: InputMode,
  catalog: TermEntry[] = FIXTURE_ENTRIES,
): { entries: TermEntry[]; suggestions: Suggestion[] } {
  const n = normalize(q);
  if (!n) return { entries: [], suggestions: [] };

  let hits: TermEntry[] = [];

  if (mode === "romaji") {
    hits = catalog.filter(
      (e) =>
        normalize(e.romaji).replace(/ō/g, "o").replace(/ū/g, "u") ===
          n.replace(/ou/g, "o").replace(/uu/g, "u") ||
        normalize(e.romaji) === n ||
        e.readings.some((r) => readingToLooseRomaji(r) === n),
    );
  } else if (mode === "japanese") {
    hits = catalog.filter(
      (e) =>
        e.japanese === q.trim() ||
        e.readings.includes(q.trim()) ||
        e.japanese.includes(q.trim()),
    );
  } else {
    // english — match glosses
    hits = catalog.filter((e) =>
      e.senses.some((s) => normalize(s.gloss) === n || normalize(s.gloss).includes(n)),
    );
  }

  hits = [...hits].sort(
    (a, b) => (b.commonality ?? 0) - (a.commonality ?? 0),
  );

  const suggestions: Suggestion[] = [];
  if (hits.length === 0) {
    for (const e of catalog) {
      if (normalize(e.romaji).startsWith(n.slice(0, 3)) && n.length >= 3) {
        suggestions.push({ text: e.romaji, reason: "prefix" });
      }
    }
  }

  return { entries: hits, suggestions: suggestions.slice(0, 5) };
}

export function getEntryById(
  id: string,
  catalog: TermEntry[] = FIXTURE_ENTRIES,
): TermEntry | undefined {
  return catalog.find((e) => e.id === id);
}

/** Very small loose helper for fixture matching only */
function readingToLooseRomaji(kana: string): string {
  // Not a full kana→romaji; fixtures use explicit romaji field primarily.
  return normalize(kana);
}
