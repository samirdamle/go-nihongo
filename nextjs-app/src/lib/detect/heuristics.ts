import type { InputMode, LookupKind } from "@/types/lookup";

const JP_CHAR =
  /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\u3400-\u4dbf\uff66-\uff9d]/;

const JP_PARTICLE_HINT =
  /(?:^|[\s　])([はがをにでのともへや]|から|まで|より)(?:[\s　]|$)/;

/**
 * Detect likely input mode from script composition.
 * English vs romaji for pure Latin is heuristic: multi-word Latin → english;
 * single token Latin → romaji (override available in UI).
 */
export function detectMode(q: string): InputMode {
  const trimmed = q.trim();
  if (!trimmed) return "romaji";

  const jpCount = countMatches(trimmed, JP_CHAR);
  const latinCount = countMatches(trimmed, /[A-Za-z]/);

  if (jpCount > 0 && jpCount >= latinCount) {
    return "japanese";
  }

  if (latinCount > 0) {
    // Spaces / sentence punctuation → likely English phrase/sentence
    if (/\s/.test(trimmed) || /[.!?]/.test(trimmed)) {
      return "english";
    }
    // Common English-only function words as whole token
    if (isLikelyEnglishWord(trimmed)) {
      return "english";
    }
    return "romaji";
  }

  return "romaji";
}

/**
 * Detect term vs sentence. Conservative: prefer term for short inputs.
 */
export function detectKind(q: string, mode: InputMode): LookupKind {
  const trimmed = q.trim();
  if (!trimmed) return "term";

  if (/[.!?。！？]/.test(trimmed)) return "sentence";

  const tokens = trimmed.split(/[\s　]+/).filter(Boolean);

  if (mode === "english") {
    if (tokens.length >= 4) return "sentence";
    if (tokens.length >= 2 && hasEnglishSentenceHint(trimmed)) return "sentence";
    return "term";
  }

  if (mode === "romaji") {
    if (tokens.length >= 4) return "sentence";
    return "term";
  }

  // japanese
  if (tokens.length >= 2) return "sentence";
  if (trimmed.length >= 12) return "sentence";
  if (JP_PARTICLE_HINT.test(trimmed) && trimmed.length >= 6) return "sentence";
  return "term";
}

export function detectInput(q: string): {
  mode: InputMode;
  kind: LookupKind;
} {
  const mode = detectMode(q);
  const kind = detectKind(q, mode);
  return { mode, kind };
}

function countMatches(s: string, re: RegExp): number {
  const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  return (s.match(global) ?? []).length;
}

const ENGLISH_LEXICON = new Set(
  [
    "hello",
    "hi",
    "thanks",
    "thank",
    "you",
    "please",
    "sorry",
    "good",
    "morning",
    "night",
    "yes",
    "no",
    "water",
    "food",
    "love",
    "what",
    "where",
    "when",
    "who",
    "why",
    "how",
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "i",
    "me",
    "my",
    "we",
    "our",
    "your",
    "and",
    "or",
    "but",
    "with",
    "from",
    "this",
    "that",
  ].map((w) => w.toLowerCase()),
);

function isLikelyEnglishWord(token: string): boolean {
  const t = token.toLowerCase().replace(/[^a-z'-]/g, "");
  return ENGLISH_LEXICON.has(t);
}

function hasEnglishSentenceHint(s: string): boolean {
  const lower = s.toLowerCase();
  return /\b(i|you|we|they|he|she|it|the|a|an|is|are|am|was|were|do|does|did|have|has|will|would|can|could)\b/.test(
    lower,
  );
}
