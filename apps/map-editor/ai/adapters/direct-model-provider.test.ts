import { afterEach, describe, expect, it, vi } from "vitest";
import { DirectModelProvider } from "./direct-model-provider";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("DirectModelProvider transient provider failures", () => {
  it("retries Gemini 503 responses and falls back to a documented Flash model", async () => {
    vi.useFakeTimers();
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_MODEL", "");
    vi.stubEnv("VENDRITH_AI_BASE_URL", "");

    const models: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const payload = JSON.parse(String(init?.body)) as { model: string };
      models.push(payload.model);
      if (payload.model !== "gemini-3.5-flash-lite") {
        return new Response(JSON.stringify({ error: { code: 503, message: "temporarily overloaded", status: "UNAVAILABLE" } }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ model: payload.model, choices: [{ message: { content: "Vandrith AI ready." } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }));

    const pending = new DirectModelProvider().generate({
      messages: [{ role: "user", content: "Hello" }],
      mode: "explain",
    });
    await vi.runAllTimersAsync();
    const result = await pending;

    expect(result.content).toBe("Vandrith AI ready.");
    expect(result.model).toBe("gemini-3.5-flash-lite");
    expect(models).toEqual([
      "gemini-3.6-flash", "gemini-3.6-flash", "gemini-3.6-flash",
      "gemini-3.8-flash", "gemini-3.8-flash", "gemini-3.8-flash",
      "gemini-3.5-flash-lite",
    ]);
  });

  it("does not override an explicitly configured model", async () => {
    vi.useFakeTimers();
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_API_KEY", "");
    vi.stubEnv("VENDRITH_AI_MODEL", "gemini-3.6-flash");
    vi.stubEnv("VENDRITH_AI_BASE_URL", "");

    const models: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      models.push((JSON.parse(String(init?.body)) as { model: string }).model);
      return new Response(JSON.stringify({ error: { code: 503, message: "temporarily overloaded", status: "UNAVAILABLE" } }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }));

    const pending = new DirectModelProvider().generate({
      messages: [{ role: "user", content: "Hello" }],
      mode: "explain",
    });
    const assertion = expect(pending).rejects.toThrow("HTTP 503");
    await vi.runAllTimersAsync();
    await assertion;

    expect(models).toEqual(["gemini-3.6-flash", "gemini-3.6-flash", "gemini-3.6-flash"]);
  });
});
