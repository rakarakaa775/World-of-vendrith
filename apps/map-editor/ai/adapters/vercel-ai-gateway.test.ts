import { describe, expect, it, vi } from "vitest";
import { VercelAiGatewayModelProvider } from "./vercel-ai-gateway";

describe("Vercel AI Gateway model provider", () => {
  it("maps provider tool calls into Vendrith tool calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        model: "test-model",
        choices: [{
          message: {
            content: "I found evidence.",
            tool_calls: [{
              id: "call-1",
              function: {
                name: "repository.search",
                arguments: JSON.stringify({ query: "Vendrith" }),
              },
            }],
          },
        }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new VercelAiGatewayModelProvider({
      apiKey: "test-key",
      model: "test-model",
      baseUrl: "https://example.test/v1",
    });

    const result = await provider.generate({
      messages: [{ role: "user", content: "Search Vendrith." }],
      tools: [{
        name: "repository.search",
        description: "Search repository.",
        parameters: { type: "object" },
      }],
    });

    expect(result.provider).toBe("vercel-ai-gateway");
    expect(result.model).toBe("test-model");
    expect(result.content).toBe("I found evidence.");
    expect(result.toolCalls).toEqual([{
      id: "call-1",
      name: "repository.search",
      arguments: { query: "Vendrith" },
    }]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://example.test/v1/chat/completions");
  });

  it("surfaces provider errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "rate limited" } }), { status: 429 }),
    ));
    const provider = new VercelAiGatewayModelProvider({ apiKey: "test-key" });

    await expect(
      provider.generate({ messages: [{ role: "user", content: "Hello" }] }),
    ).rejects.toThrow("rate limited");
  });
});
