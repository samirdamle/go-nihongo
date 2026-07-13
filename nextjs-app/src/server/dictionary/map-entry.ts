import { toHepburn } from "@/server/reading/hepburn";
import type { Sense, TermEntry } from "@/types/lookup";
import type { JmdictWord } from "./jmdict-types";

const PRIORITY_TAGS = new Set([
  "ichi1",
  "ichi2",
  "news1",
  "news2",
  "spec1",
  "spec2",
  "gai1",
  "gai2",
]);

/**
 * Map one jmdict-simplified word into our TermEntry shape.
 * Japanese form prefers first common kanji, else first kanji, else first kana.
 */
export function mapJmdictWord(word: JmdictWord): TermEntry | null {
  const kanjiList = word.kanji ?? [];
  const kanaList = word.kana ?? [];
  if (kanjiList.length === 0 && kanaList.length === 0) return null;

  const primaryKanji =
    kanjiList.find((k) => k.common)?.text ?? kanjiList[0]?.text;
  const primaryKana =
    kanaList.find((k) => k.common)?.text ?? kanaList[0]?.text ?? "";

  const japanese = primaryKanji ?? primaryKana;
  if (!japanese) return null;

  const readings = unique(
    kanaList.map((k) => k.text).filter((t) => Boolean(t)),
  );
  const readingForRomaji = primaryKana || readings[0] || "";
  const romaji = readingForRomaji ? toHepburn(readingForRomaji) : "";

  const senses: Sense[] = [];
  for (const sense of word.sense ?? []) {
    const glosses = (sense.gloss ?? [])
      .filter((g) => !g.lang || g.lang === "eng")
      .map((g) => g.text)
      .filter(Boolean);
    for (const gloss of glosses) {
      senses.push({
        gloss,
        pos: sense.partOfSpeech?.length ? [...sense.partOfSpeech] : undefined,
      });
    }
  }
  if (senses.length === 0) return null;

  const tags = collectTags(word);
  const commonality = scoreCommonality(word, tags);

  return {
    id: `jmdict:${word.id}`,
    japanese,
    readings: readings.length ? readings : primaryKana ? [primaryKana] : [],
    romaji,
    senses,
    commonality,
    tags: tags.length ? tags : undefined,
  };
}

function collectTags(word: JmdictWord): string[] {
  const tags = new Set<string>();
  for (const k of word.kanji ?? []) {
    for (const t of k.tags ?? []) tags.add(t);
    if (k.common) tags.add("common");
  }
  for (const k of word.kana ?? []) {
    for (const t of k.tags ?? []) tags.add(t);
    if (k.common) tags.add("common");
  }
  return [...tags];
}

function scoreCommonality(word: JmdictWord, tags: string[]): number {
  let score = 0;
  if (tags.includes("common")) score += 40;
  for (const t of tags) {
    if (PRIORITY_TAGS.has(t)) score += 20;
  }
  // Prefer entries that have kanji headwords slightly for ranking ties later
  if ((word.kanji ?? []).length > 0) score += 5;
  if ((word.kana ?? []).some((k) => k.common)) score += 10;
  return score;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}
