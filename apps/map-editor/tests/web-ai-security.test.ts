import { describe, expect, it } from "vitest";
import {
  consumeWebAiRequestBudget,
  requestBodyExceedsWebAiLimit,
  WEB_AI_SECURITY_POLICY,
} from "../ai/application/web-ai-security";

function createRateLimitClient(response: Record<string, unknown>) {
  return {
    rpc: async () => ({
      data: response,
      error: null,
    }),
  };
}

describe("web AI security budget", () => {
  it("uses the distributed authenticated-user rate-limit RPC", async () => {
    const client = createRateLimitClient({
      allowed: true,
      remaining: WEB_AI_SECURITY_POLICY.maxRequestsPerUser - 1,
      retryAfterSeconds: 0,
    });

    const result = await consumeWebAiRequestBudget(client, "user-budget");

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("returns a distributed 429 budget decision without local process state", async () => {
    const client = createRateLimitClient({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 37,
    });

    const result = await consumeWebAiRequestBudget(client, "user-budget");

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBe(37);
  });

  it("rejects an invalid distributed rate-limit response", async () => {
    const client = createRateLimitClient({
      allowed: "yes",
      remaining: 0,
      retryAfterSeconds: 0,
    });

    await expect(
      consumeWebAiRequestBudget(client, "user-budget"),
    ).rejects.toThrow("invalid response");
  });

  it("propagates distributed rate-limit RPC failures", async () => {
    const client = {
      rpc: async () => ({
        data: null,
        error: { message: "database unavailable" },
      }),
    };

    await expect(
      consumeWebAiRequestBudget(client, "user-budget"),
    ).rejects.toThrow("database unavailable");
  });

  it("rejects request bodies above the bounded size", () => {
    expect(
      requestBodyExceedsWebAiLimit(
        String(WEB_AI_SECURITY_POLICY.maxRequestBytes + 1),
      ),
    ).toBe(true);
    expect(
      requestBodyExceedsWebAiLimit(
        String(WEB_AI_SECURITY_POLICY.maxRequestBytes),
      ),
    ).toBe(false);
    expect(requestBodyExceedsWebAiLimit(null)).toBe(false);
  });
});
