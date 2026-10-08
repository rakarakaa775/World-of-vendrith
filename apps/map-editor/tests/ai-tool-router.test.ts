import { describe, expect, it, vi } from "vitest";
import { createToolRouter, type ToolDefinition } from "../ai/ports/tool-router";
import { createVendrithAgentOrchestrator } from "../ai/application/agent-orchestrator";
import { createDevelopmentWorkflowTools, type DevelopmentWorkflowPort } from "../ai/ports/development-tools";
import { createRepositoryDevelopmentWorkflowProvider } from "../ai/application/development-workflow-provider";

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

  it("exposes external development workflows only through the development audience", async () => {
    const workflow: DevelopmentWorkflowPort = {
      capabilities: vi.fn(async () => [{ id: "ecc.inspect", description: "Inspect project", readOnly: true, requiresApproval: false }]),
      execute: vi.fn(async (name, input) => ({ name, input })),
    };
    const tools = createDevelopmentWorkflowTools({ workflow });
    const router = createToolRouter(tools);

    expect(router.definitions({ mode: "plan", requestId: "dev", audience: "development" }).map(item => item.name))
      .toEqual(["development.workflow.capabilities", "development.workflow.execute"]);
    expect(router.definitions({ mode: "plan", requestId: "web", audience: "web-creator" })).toEqual([]);

    const blocked = await router.execute(
      { id: "call-1", name: "development.workflow.execute", arguments: { name: "ecc.inspect" } },
      { mode: "execute", requestId: "dev", audience: "development", approvalState: "pending" },
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toBe("High-risk tools require an approved execution path");

    const allowed = await router.execute(
      { id: "call-2", name: "development.workflow.execute", arguments: { name: "ecc.inspect", input: {} } },
      { mode: "high-risk", requestId: "dev", audience: "development", approvalState: "approved" },
    );
    expect(allowed.ok).toBe(true);
    expect(workflow.execute).toHaveBeenCalledWith("ecc.inspect", {});
  });

  it("allows a development request to select the development audience", async () => {
    const provider = {
      generate: vi.fn(async (request: { messages: Array<{ role: string; content: string }>; tools?: unknown[] }) => ({
        text: "development response",
        toolCalls: [],
      })),
    };
    const developmentTool = tool("development.repository", "development");
    const router = createToolRouter([developmentTool]);
    const orchestrator = createVendrithAgentOrchestrator({ modelProvider: provider, toolRouter: router });

    const result = await orchestrator.run({
      id: "dev-request",
      mode: "plan",
      audience: "development",
      prompt: "Inspect the repository architecture.",
    });

    expect(result.response.text).toBe("development response");
    expect(provider.generate).toHaveBeenCalledOnce();
    expect(provider.generate.mock.calls[0][0].tools).toEqual([
      expect.objectContaining({ name: "development.repository" }),
    ]);
    expect(provider.generate.mock.calls[0][0].messages[0].content).toContain("Development AI");
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
