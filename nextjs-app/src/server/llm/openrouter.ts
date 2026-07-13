import type {
  ChatCompletionParams,
  ChatCompletionResult,
  LlmClient,
} from "./types";

const DEFAULT_BASE = "https://openrouter.ai/api/v1";
/** Default: NVIDIA Nemotron free tier on OpenRouter (issue #25). */
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

export type OpenRouterClientOptions = {
  apiKey: string;
  /** Default model id, e.g. `nvidia/nemotron-3-ultra-550b-a55b:free`. */
  model?: string;
  baseUrl?: string;
  /**
   * Optional headers OpenRouter recommends for rankings/app identity.
   * @see https://openrouter.ai/docs
   */
  siteUrl?: string;
  siteName?: string;
  fetchImpl?: typeof fetch;
};

/**
 * OpenRouter chat client (OpenAI-compatible Chat Completions API).
 * Server-only — keep OPENROUTER_API_KEY off the client.
 */
export class OpenRouterClient implements LlmClient {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseUrl: string;
  private readonly siteUrl?: string;
  private readonly siteName?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: OpenRouterClientOptions) {
    if (!options.apiKey) {
      throw new Error("OpenRouterClient requires an API key");
    }
    this.apiKey = options.apiKey;
    this.defaultModel = options.model ?? DEFAULT_MODEL;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
    this.siteUrl = options.siteUrl;
    this.siteName = options.siteName;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async chat(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    const model = params.model ?? this.defaultModel;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
    if (this.siteUrl) headers["HTTP-Referer"] = this.siteUrl;
    if (this.siteName) headers["X-Title"] = this.siteName;

    const body: Record<string, unknown> = {
      model,
      messages: params.messages,
    };
    if (params.temperature !== undefined) body.temperature = params.temperature;
    if (params.maxTokens !== undefined) body.max_tokens = params.maxTokens;

    const res = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter request failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as {
      model?: string;
      choices?: { message?: { content?: string | null } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (content == null || content === "") {
      throw new Error("OpenRouter returned empty content");
    }

    return {
      content,
      model: data.model ?? model,
      provider: "openrouter",
      raw: data,
    };
  }
}

export { DEFAULT_BASE as OPENROUTER_DEFAULT_BASE, DEFAULT_MODEL as OPENROUTER_DEFAULT_MODEL };
