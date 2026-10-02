import { describe, expect, it } from "vitest";
import { projectRuleEvidence, unresolvedEvidence, verifiedEvidence } from "./evidence";

describe("AI evidence classification", () => {
  it("keeps verified facts distinct from project rules", () => {
    expect(verifiedEvidence("repo:file.ts", "exists").kind).toBe("verified-fact");
    expect(projectRuleEvidence("AGENTS.md", "use command flow").kind).toBe("project-rule");
  });

  it("marks unresolved information explicitly", () => {
    expect(unresolvedEvidence("codegraph", "index unavailable").kind).toBe("unresolved-conflict");
  });
});
