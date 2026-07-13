/** Shared lookup domain types — see docs/specs/api-spec.md */

export type InputMode = "romaji" | "japanese" | "english";
export type LookupKind = "term" | "sentence";

export type Sense = {
  gloss: string;
  pos?: string[];
};

export type TermEntry = {
  id: string;
  japanese: string;
  readings: string[];
  romaji: string;
  senses: Sense[];
  commonality?: number;
  tags?: string[];
};

export type BreakdownToken = {
  surface: string;
  lemma?: string;
  reading?: string;
  romaji?: string;
  pos?: string;
  isFunctionWord: boolean;
  gloss?: string;
  entryId?: string;
};

export type Suggestion = {
  text: string;
  reason?: string;
};

export type LookupRequest = {
  q: string;
  mode: InputMode;
  kind: LookupKind;
  options?: {
    includeFunctionWords?: boolean;
  };
};

export type TermLookupResponse = {
  kind: "term";
  query: string;
  mode: InputMode;
  entries: TermEntry[];
  suggestions: Suggestion[];
};

export type SentenceLookupResponse = {
  kind: "sentence";
  query: string;
  mode: InputMode;
  translation: {
    text: string;
    sourceLang: string;
    targetLang: string;
    provider: string;
  };
  japaneseText: string;
  breakdown: BreakdownToken[];
  suggestions: Suggestion[];
};

export type LookupResponse = TermLookupResponse | SentenceLookupResponse;

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};
