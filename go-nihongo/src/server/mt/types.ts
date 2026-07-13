export type TranslateParams = {
  text: string;
  source: "ja" | "en" | "auto";
  target: "ja" | "en";
};

export type TranslateResult = {
  text: string;
  provider: string;
};

/** Pluggable sentence MT port — ADR 0004 */
export interface SentenceTranslator {
  translate(input: TranslateParams): Promise<TranslateResult>;
}
