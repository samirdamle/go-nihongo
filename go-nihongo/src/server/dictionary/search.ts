import type { InputMode, Suggestion, TermEntry } from "@/types/lookup";
import { toHepburn } from "@/server/reading/hepburn";
import { FIXTURE_ENTRIES } from "./fixtures";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/** Fold macron / ou variants for romaji comparison. */
function foldRomaji(s: string): string {
  return normalize(s)
    .replace(/[āâ]/g, "a")
    .replace(/[īî]/g, "i")
    .replace(/[ūû]/g, "u")
    .replace(/[ēê]/g, "e")
    .replace(/[ōô]/g, "o")
    .replace(/ou/g, "o")
    .replace(/uu/g, "u");
}

function entryRomaji(e: TermEntry): string {
  if (e.romaji) return e.romaji;
  const reading = e.readings[0];
  return reading ? toHepburn(reading) : "";
}

/** Ensure entries expose Hepburn romaji (from field or first reading). */
export function withRomaji(entry: TermEntry): TermEntry {
  return { ...entry, romaji: entryRomaji(entry) };
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
    const foldedQ = foldRomaji(q);
    hits = catalog.filter((e) => {
      const r = entryRomaji(e);
      return (
        foldRomaji(r) === foldedQ ||
        normalize(r) === n ||
        e.readings.some((reading) => foldRomaji(toHepburn(reading)) === foldedQ)
      );
    });
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

  hits = [...hits]
    .sort((a, b) => (b.commonality ?? 0) - (a.commonality ?? 0))
    .map(withRomaji);

  const suggestions: Suggestion[] = [];
  if (hits.length === 0) {
    for (const e of catalog) {
      const r = entryRomaji(e);
      if (normalize(r).startsWith(n.slice(0, 3)) && n.length >= 3) {
        suggestions.push({ text: r, reason: "prefix" });
      }
    }
  }

  return { entries: hits, suggestions: suggestions.slice(0, 5) };
}

export function getEntryById(
  id: string,
  catalog: TermEntry[] = FIXTURE_ENTRIES,
): TermEntry | undefined {
  const entry = catalog.find((e) => e.id === id);
  return entry ? withRomaji(entry) : undefined;
}

