import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createLlmClient,
  isOpenRouterConfigured,
  MockLlmClient,
  OpenRouterClient,
} from "./index";

describe("OpenRouterClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("posts chat completions and returns content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        choices: [{ message: { content: "こんにちは" } }],
      }),
    });

    const client = new OpenRouterClient({
      apiKey: "test-key",
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await client.chat({
      messages: [{ role: "user", content: "Say hello in Japanese" }],
    });

    expect(result.content).toBe("こんにちは");
    expect(result.provider).toBe("openrouter");
    expect(result.model).toBe("nvidia/nemotron-3-ultra-550b-a55b:free");

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body as string) as {
      model: string;
      messages: unknown[];
    };
    expect(body.model).toBe("nvidia/nemotron-3-ultra-550b-a55b:free");
    expect(body.messages).toHaveLength(1);
  });

  it("throws on non-OK response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });

    const client = new OpenRouterClient({
      apiKey: "bad",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(
      client.chat({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow(/401/);
  });
});

describe("createLlmClient", () => {
  const prevKey = process.env.OPENROUTER_API_KEY;
  const prevProvider = process.env.LLM_PROVIDER;

  afterEach(() => {
    if (prevKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = prevKey;
    if (prevProvider === undefined) delete process.env.LLM_PROVIDER;
    else process.env.LLM_PROVIDER = prevProvider;
  });

  it("returns mock when no key", () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.LLM_PROVIDER;
    const client = createLlmClient();
    expect(client).toBeInstanceOf(MockLlmClient);
    expect(isOpenRouterConfigured()).toBe(false);
  });

  it("returns OpenRouter when key is set", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    delete process.env.LLM_PROVIDER;
    const client = createLlmClient();
    expect(client).toBeInstanceOf(OpenRouterClient);
    expect(isOpenRouterConfigured()).toBe(true);
  });

  it("forces mock with LLM_PROVIDER=mock even if key set", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    process.env.LLM_PROVIDER = "mock";
    const client = createLlmClient();
    expect(client).toBeInstanceOf(MockLlmClient);
    expect(isOpenRouterConfigured()).toBe(false);
  });
});

describe("MockLlmClient", () => {
  it("echoes last user message", async () => {
    const client = new MockLlmClient();
    const result = await client.chat({
      messages: [
        { role: "system", content: "sys" },
        { role: "user", content: "hello" },
      ],
    });
    expect(result.content).toBe("[mock-llm] hello");
    expect(result.provider).toBe("mock");
  });
});
