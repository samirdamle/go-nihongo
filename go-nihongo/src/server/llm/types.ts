/** Server-only LLM port — never use for silent dictionary fills (ADR 0003). */

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionParams = {
  messages: ChatMessage[];
  /** Override default model for this call. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  provider: string;
  raw?: unknown;
};

export interface LlmClient {
  chat(params: ChatCompletionParams): Promise<ChatCompletionResult>;
}
