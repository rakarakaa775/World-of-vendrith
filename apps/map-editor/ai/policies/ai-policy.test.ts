import { describe, expect, it } from "vitest";
import { canMutate, classifyApproval, isHighRiskPrompt } from "./ai-policy";

describe("Vendrith Project AI policy", () => {
  it("keeps explain and plan requests read-only", () => {
    expect(classifyApproval("explain", "Explain the map save flow")).toBe("not-required");
    expect(classifyApproval("plan", "Trace Asset Library dependencies")).toBe("not-required");
    expect(canMutate("not-required")).toBe(false);
  });

  it("requires explicit approval for execute mode", () => {
    expect(classifyApproval("execute", "Update the editor")).toBe("pending");
    expect(canMutate("pending")).toBe(false);
    expect(canMutate("approved")).toBe(true);
  });

  it("flags high-risk prompts", () => {
    expect(isHighRiskPrompt("Check the production database token")).toBe(true);
    expect(classifyApproval("explain", "Check the production database token")).toBe("pending");
  });
});
