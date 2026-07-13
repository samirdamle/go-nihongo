import { MockLlmClient } from "./mock";
import {
  OpenRouterClient,
  OPENROUTER_DEFAULT_BASE,
  OPENROUTER_DEFAULT_MODEL,
} from "./openrouter";
import type { LlmClient } from "./types";

export type {
  ChatCompletionParams,
  ChatCompletionResult,
  ChatMessage,
  LlmClient,
} from "./types";
export { MockLlmClient } from "./mock";
export {
  OpenRouterClient,
  OPENROUTER_DEFAULT_BASE,
  OPENROUTER_DEFAULT_MODEL,
} from "./openrouter";

/**
 * Resolve LLM client from env.
 *
 * - `LLM_PROVIDER=mock` → mock
 * - `OPENROUTER_API_KEY` set → OpenRouter (any model via OPENROUTER_MODEL)
 * - otherwise mock (dev/CI without keys)
 *
 * Trust boundary (ADR 0003): do **not** use this client to invent dictionary
 * readings/senses. Prefer labeled assist / optional features only.
 */
export function createLlmClient(): LlmClient {
  const forced = process.env.LLM_PROVIDER?.toLowerCase();
  if (forced === "mock") {
    return new MockLlmClient();
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey) {
    return new OpenRouterClient({
      apiKey,
      model: process.env.OPENROUTER_MODEL || OPENROUTER_DEFAULT_MODEL,
      baseUrl: process.env.OPENROUTER_BASE_URL || OPENROUTER_DEFAULT_BASE,
      siteUrl: process.env.OPENROUTER_SITE_URL,
      siteName: process.env.OPENROUTER_SITE_NAME ?? "Go Nihongo!",
    });
  }

  return new MockLlmClient();
}

/** True when a real OpenRouter key is configured (not mock-forced). */
export function isOpenRouterConfigured(): boolean {
  if (process.env.LLM_PROVIDER?.toLowerCase() === "mock") return false;
  return Boolean(process.env.OPENROUTER_API_KEY);
}
