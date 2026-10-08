import { describe, expect, it, vi } from "vitest";
import { createToolRouter, type ToolDefinition } from "../ai/ports/tool-router";
import { createVendrithAgentOrchestrator } from "../ai/application/agent-orchestrator";

function tool(name: string, audience: "web-creator" | "development"): ToolDefinition {
  return {
    name,
    description: name,
    audience,
    capability: "read",
    parameters: { type: "object", properties: {} },
    validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
    execute: vi.fn(async () => ({ ok: true })),
  };
}

describe("AI tool audience isolation", () => {
  it("only exposes tools for the active audience", () => {
    const router = createToolRouter([
      tool("web.safe", "web-creator"),
      tool("development.repository", "development"),
    ]);

    expect(router.definitions({ mode: "plan", requestId: "web", audience: "web-creator" }).map(item => item.name))
      .toEqual(["web.safe"]);
    expect(router.definitions({ mode: "plan", requestId: "dev", audience: "development" }).map(item => item.name))
      .toEqual(["development.repository"]);
  });

  it("rejects direct cross-audience execution", async () => {
    const developmentTool = tool("development.repository", "development");
    const router = createToolRouter([developmentTool]);

    const result = await router.execute(
      { id: "call-1", name: "development.repository", arguments: {} },
      { mode: "plan", requestId: "web", audience: "web-creator" },
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Tool is outside the active AI audience");
    expect(developmentTool.execute).not.toHaveBeenCalled();
  });

  it("keeps legacy tools in the web-creator audience by default", () => {
    const legacyTool: ToolDefinition = {
      name: "legacy.read",
      description: "legacy",
      capability: "read",
      parameters: { type: "object", properties: {} },
      validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      execute: vi.fn(async () => ({ ok: true })),
    };
    const router = createToolRouter([legacyTool]);

    expect(router.definitions({ mode: "plan", requestId: "web", audience: "web-creator" }).map(item => item.name))
      .toEqual(["legacy.read"]);
    expect(router.definitions({ mode: "plan", requestId: "dev", audience: "development" }))
      .toEqual([]);
  });
});
