/**
 * Kana → Modified Hepburn romaji with macrons for long vowels.
 *
 * Conventions (study-tool friendly Modified Hepburn):
 * - おう / おお / おー → ō; うう / うー → ū; ええ / えー → ē; いい stays ii
 * - えい stays "ei" (not ē), common for learner materials
 * - ん → n; n' before vowels and y; m before b/m/p (traditional variant learners expect)
 * - っ doubles the following consonant (tch for ch)
 * - Katakana long-vowel mark ー lengthens the previous vowel with a macron
 *
 * See issue #5 / AC-TERM-005.
 */

const HIRAGANA_START = 0x3041;
const KATAKANA_START = 0x30a1;

/** Basic gojūon + dakuten/handakuten (hiragana codepoints). */
const BASIC: Record<string, string> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  ゐ: "wi",
  ゑ: "we",
  を: "o",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
  ゎ: "wa",
  ゔ: "vu",
};

const DIGRAPHS: Record<string, string> = {
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  ぢゃ: "ja",
  ぢゅ: "ju",
  ぢょ: "jo",
  // rare / foreign
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
  てぃ: "ti",
  でぃ: "di",
  とぅ: "tu",
  どぅ: "du",
  うぃ: "wi",
  うぇ: "we",
  うぉ: "wo",
  ゔぁ: "va",
  ゔぃ: "vi",
  ゔぇ: "ve",
  ゔぉ: "vo",
  くぁ: "kwa",
  くぃ: "kwi",
  くぇ: "kwe",
  くぉ: "kwo",
};

export type HepburnOptions = {
  /** Capitalize first letter (e.g. Tōkyō). Default false. */
  capitalize?: boolean;
};

/**
 * Convert hiragana or katakana (or mixed with passthrough Latin/punctuation) to Hepburn romaji.
 */
export function toHepburn(input: string, options: HepburnOptions = {}): string {
  if (!input) return "";

  const kana = katakanaToHiragana(input);
  const chunks: string[] = [];
  let i = 0;

  while (i < kana.length) {
    const ch = kana[i]!;

    // small tsu: double next consonant
    if (ch === "っ" || ch === "ッ") {
      const next = peekSyllable(kana, i + 1);
      if (next) {
        const doubled = sokuonDouble(next.romaji);
        chunks.push(doubled);
        i += 1;
        continue;
      }
      chunks.push("t");
      i += 1;
      continue;
    }

    // long vowel mark (usually after katakana conversion still ー)
    if (ch === "ー") {
      const prev = chunks[chunks.length - 1];
      if (prev) {
        chunks[chunks.length - 1] = lengthenLastVowel(prev);
      }
      i += 1;
      continue;
    }

    // digraph (2 mora)
    if (i + 1 < kana.length) {
      const two = kana.slice(i, i + 2);
      const dig = DIGRAPHS[two];
      if (dig) {
        chunks.push(dig);
        i += 2;
        continue;
      }
    }

    // ん special cases
    if (ch === "ん") {
      const nextRomaji = peekSyllable(kana, i + 1)?.romaji ?? "";
      const nextKana = kana[i + 1] ?? "";
      if (/^[aiueoy]/i.test(nextRomaji) || nextKana === "や" || nextKana === "ゆ" || nextKana === "よ") {
        chunks.push("n'");
      } else if (/^[bmp]/i.test(nextRomaji)) {
        chunks.push("m");
      } else {
        chunks.push("n");
      }
      i += 1;
      continue;
    }

    const basic = BASIC[ch];
    if (basic) {
      chunks.push(basic);
      i += 1;
      continue;
    }

    // non-kana: passthrough
    chunks.push(ch);
    i += 1;
  }

  let romaji = applyLongVowels(chunks.join(""));
  if (options.capitalize && romaji.length > 0) {
    romaji = romaji[0]!.toUpperCase() + romaji.slice(1);
  }
  return romaji;
}

function katakanaToHiragana(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    // Katakana block → hiragana (excluding ー prolonged sound mark)
    if (code >= 0x30a1 && code <= 0x30f6) {
      out += String.fromCodePoint(code - (KATAKANA_START - HIRAGANA_START));
    } else {
      out += ch;
    }
  }
  return out;
}

function peekSyllable(
  kana: string,
  index: number,
): { romaji: string; len: number } | null {
  if (index >= kana.length) return null;
  if (index + 1 < kana.length) {
    const two = kana.slice(index, index + 2);
    const dig = DIGRAPHS[two];
    if (dig) return { romaji: dig, len: 2 };
  }
  const one = kana[index]!;
  if (one === "っ") {
    const inner = peekSyllable(kana, index + 1);
    if (inner) return { romaji: sokuonDouble(inner.romaji) + inner.romaji.slice(1), len: 1 + inner.len };
  }
  const basic = BASIC[one];
  if (basic) return { romaji: basic, len: 1 };
  return null;
}

function sokuonDouble(nextRomaji: string): string {
  if (nextRomaji.startsWith("ch")) return "t";
  const c = nextRomaji[0];
  if (!c || !/[bcdfghjklmnpqrstvwxyz]/i.test(c)) return "";
  return c.toLowerCase();
}

function lengthenLastVowel(syllable: string): string {
  if (syllable.endsWith("a")) return syllable.slice(0, -1) + "ā";
  if (syllable.endsWith("i")) return syllable.slice(0, -1) + "ī";
  if (syllable.endsWith("u")) return syllable.slice(0, -1) + "ū";
  if (syllable.endsWith("e")) return syllable.slice(0, -1) + "ē";
  if (syllable.endsWith("o")) return syllable.slice(0, -1) + "ō";
  return syllable;
}

/**
 * Apply mora-pair long vowels: (consonant)ou / oo → ō, uu → ū, ee → ē.
 * Does not convert "ei" → ē.
 */
function applyLongVowels(s: string): string {
  // Work left-to-right on latin syllables approximately via regex replacements.
  // Order matters: prefer longer patterns.
  let out = s;
  // ou → ō (kouta → kōta). Avoid matching across n' boundaries awkwardly.
  out = out.replace(/([bcdfghjklmnpqrstvwxyz]?y?)ou/gi, (_, cons: string) => `${cons}ō`);
  out = out.replace(/([bcdfghjklmnpqrstvwxyz]?y?)oo/gi, (_, cons: string) => `${cons}ō`);
  out = out.replace(/([bcdfghjklmnpqrstvwxyz]?y?)uu/gi, (_, cons: string) => `${cons}ū`);
  out = out.replace(/([bcdfghjklmnpqrstvwxyz]?y?)ee/gi, (_, cons: string) => `${cons}ē`);
  // bare aa rare
  out = out.replace(/([bcdfghjklmnpqrstvwxyz]?y?)aa/gi, (_, cons: string) => `${cons}ā`);
  // standalone ou at start
  out = out.replace(/\bou/g, "ō");
  out = out.replace(/\boo/g, "ō");
  out = out.replace(/\buu/g, "ū");
  out = out.replace(/\bee/g, "ē");
  return out;
}
