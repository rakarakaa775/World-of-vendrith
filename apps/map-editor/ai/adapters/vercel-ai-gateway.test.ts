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

  it("uses the Vercel OIDC token when no API key is provided", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "oidc-test-token");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ model: "oidc-model", choices: [{ message: { content: "OIDC works." } }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new VercelAiGatewayModelProvider({ baseUrl: "https://example.test/v1" });
    const result = await provider.generate({ messages: [{ role: "user", content: "Hello" }] });

    expect(result.content).toBe("OIDC works.");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: expect.objectContaining({ Authorization: "Bearer oidc-test-token" }) });
  });

  it("fails with actionable setup guidance when no gateway credential exists", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    const provider = new VercelAiGatewayModelProvider({ baseUrl: "https://example.test/v1" });

    await expect(
      provider.generate({ messages: [{ role: "user", content: "Hello" }] }),
    ).rejects.toThrow("Set AI_GATEWAY_API_KEY");
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

  it("serializes assistant tool calls and tool results with stable call ids", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        model: "test-model",
        choices: [{ message: { content: "done", tool_calls: [] } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new VercelAiGatewayModelProvider({
      apiKey: "test-key",
      model: "test-model",
      baseUrl: "https://example.test/v1",
    });

    await provider.generate({
      messages: [
        {
          role: "assistant",
          content: "Calling a tool.",
          toolCalls: [{
            id: "call-42",
            name: "repository.search",
            arguments: { query: "Vendrith" },
          }],
        },
        {
          role: "tool",
          content: JSON.stringify({ id: "call-42", name: "repository.search", ok: true, result: [] }),
          toolCallId: "call-42",
        },
      ],
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.messages).toEqual([
      {
        role: "assistant",
        content: "Calling a tool.",
        tool_calls: [{
          id: "call-42",
          type: "function",
          function: {
            name: "repository.search",
            arguments: JSON.stringify({ query: "Vendrith" }),
          },
        }],
      },
      {
        role: "tool",
        content: JSON.stringify({ id: "call-42", name: "repository.search", ok: true, result: [] }),
        tool_call_id: "call-42",
      },
    ]);
  });
});
