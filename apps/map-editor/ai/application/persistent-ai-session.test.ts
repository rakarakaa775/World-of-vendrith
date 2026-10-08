import { describe, expect, it } from "vitest";
import { WEB_AI_SESSION_POLICY } from "./persistent-ai-session";

describe("PersistentWebAiSessionStore policy", () => {
  it("keeps server-side history bounded", () => {
    expect(WEB_AI_SESSION_POLICY.maxMessagesPerSession).toBe(100);
    expect(WEB_AI_SESSION_POLICY.maxStoredMessageLength).toBe(4000);
  });

  it("keeps session titles bounded", () => {
    expect(WEB_AI_SESSION_POLICY.maxSessionTitleLength).toBe(120);
  });
});
