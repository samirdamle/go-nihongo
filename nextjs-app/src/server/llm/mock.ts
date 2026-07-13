import type {
  ChatCompletionParams,
  ChatCompletionResult,
  LlmClient,
} from "./types";

/** Deterministic LLM for tests / local without OPENROUTER_API_KEY. */
export class MockLlmClient implements LlmClient {
  async chat(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    const lastUser = [...params.messages]
      .reverse()
      .find((m) => m.role === "user");
    return {
      content: `[mock-llm] ${lastUser?.content ?? ""}`.trim(),
      model: params.model ?? "mock",
      provider: "mock",
    };
  }
}
