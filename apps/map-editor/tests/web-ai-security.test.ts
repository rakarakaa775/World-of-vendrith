import { describe, expect, it } from "vitest";
import {
  consumeWebAiRequestBudget,
  requestBodyExceedsWebAiLimit,
  WEB_AI_SECURITY_POLICY,
} from "../application/web-ai-security";

describe("web AI security budget", () => {
  it("allows requests up to the per-user window budget", () => {
    const now = 1_000_000;

    for (let index = 0; index < WEB_AI_SECURITY_POLICY.maxRequestsPerUser; index += 1) {
      const result = consumeWebAiRequestBudget("user-budget", now);
      expect(result.allowed).toBe(true);
    }

    const blocked = consumeWebAiRequestBudget("user-budget", now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(60);
  });

  it("resets a user's budget after the window", () => {
    const now = 2_000_000;

    for (let index = 0; index < WEB_AI_SECURITY_POLICY.maxRequestsPerUser; index += 1) {
      consumeWebAiRequestBudget("user-reset", now);
    }

    const nextWindow = consumeWebAiRequestBudget(
      "user-reset",
      now + WEB_AI_SECURITY_POLICY.windowMs,
    );

    expect(nextWindow.allowed).toBe(true);
    expect(nextWindow.remaining).toBe(
      WEB_AI_SECURITY_POLICY.maxRequestsPerUser - 1,
    );
  });

  it("keeps budgets isolated per authenticated user", () => {
    const now = 3_000_000;

    for (let index = 0; index < WEB_AI_SECURITY_POLICY.maxRequestsPerUser; index += 1) {
      consumeWebAiRequestBudget("user-a", now);
    }

    expect(consumeWebAiRequestBudget("user-a", now).allowed).toBe(false);
    expect(consumeWebAiRequestBudget("user-b", now).allowed).toBe(true);
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
