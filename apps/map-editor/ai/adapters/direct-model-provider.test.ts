import { afterEach, describe, expect, it, vi } from "vitest";
import { DirectModelProvider } from "./direct-model-provider";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const request = {
  messages: [{ role: "user" as const, content: "Test request" }],
};

describe("DirectModelProvider transient failure handling", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("retries a transient 503 and returns the successful response", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_API_KEY", "");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(503, { error: { message: "temporarily unavailable" } }))
      .mockResolvedValueOnce(jsonResponse(200, {
        model: "gemini-3.6-flash",
        choices: [{ message: { content: "Recovered", tool_calls: [] } }],
      }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new DirectModelProvider().generate(request);

    expect(result.content).toBe("Recovered");
    expect(result.model).toBe("gemini-3.6-flash");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses a fallback model after the primary model exhausts transient retries", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_FALLBACK_MODELS", "gemini-test-fallback");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(503, { error: { message: "busy 1" } }))
      .mockResolvedValueOnce(jsonResponse(503, { error: { message: "busy 2" } }))
      .mockResolvedValueOnce(jsonResponse(503, { error: { message: "busy 3" } }))
      .mockResolvedValueOnce(jsonResponse(200, {
        model: "gemini-test-fallback",
        choices: [{ message: { content: "Fallback succeeded", tool_calls: [] } }],
      }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new DirectModelProvider().generate(request);

    expect(result.content).toBe("Fallback succeeded");
    expect(result.model).toBe("gemini-test-fallback");
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(JSON.parse(String(fetchMock.mock.calls[3][1]?.body)).model).toBe("gemini-test-fallback");
  });
});
