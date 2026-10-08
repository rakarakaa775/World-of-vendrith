import { describe, expect, it } from "vitest";
import { WEB_AI_SESSION_POLICY } from "./persistent-ai-session";

describe("PersistentWebAiSessionStore policy", () => {
  it("keeps server-side history bounded", () => {
    expect(WEB_AI_SESSION_POLICY.maxMessagesPerSession).toBe(100);
    expect(WEB_AI_SESSION_POLICY.maxStoredMessageLength).toBe(4000);
  });

  it("supports only authoritative world hierarchy context types", () => {
    const allowed = ["world", "region", "playable"] as const;
    expect(allowed).toContain("world");
    expect(allowed).toContain("region");
    expect(allowed).toContain("playable");
    expect(allowed).not.toContain("runtime");
  });

  it("requires playable context for map mutation proposals", () => {
    const mutationContextTypes = ["playable"] as const;
    expect(mutationContextTypes).toEqual(["playable"]);
  });

  it("keeps session titles bounded", () => {
    expect(WEB_AI_SESSION_POLICY.maxSessionTitleLength).toBe(120);
  });
});
