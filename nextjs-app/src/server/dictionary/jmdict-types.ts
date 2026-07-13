/** Subset of jmdict-simplified schema we actually read. */

export type JmdictGloss = {
  lang?: string;
  text: string;
  gender?: string;
  type?: string;
};

export type JmdictSense = {
  partOfSpeech?: string[];
  gloss?: JmdictGloss[];
  misc?: string[];
};

export type JmdictKanji = {
  common?: boolean;
  text: string;
  tags?: string[];
};

export type JmdictKana = {
  common?: boolean;
  text: string;
  tags?: string[];
  appliesToKanji?: string[];
};

export type JmdictWord = {
  id: string;
  kanji?: JmdictKanji[];
  kana?: JmdictKana[];
  sense?: JmdictSense[];
};

export type JmdictFile = {
  version?: string;
  dictDate?: string;
  words: JmdictWord[];
  tags?: Record<string, string>;
};
