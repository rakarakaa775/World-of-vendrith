import { describe, expect, it, vi } from "vitest";
import { createToolRouter, type ToolDefinition } from "../ai/ports/tool-router";
import { createVendrithAgentOrchestrator } from "../ai/application/agent-orchestrator";
import { createDevelopmentWorkflowTools, type DevelopmentWorkflowPort } from "../ai/ports/development-tools";
import { createRepositoryDevelopmentWorkflowProvider } from "../ai/application/development-workflow-provider";
import { createRuntimeTools } from "../ai/ports/runtime-tools";

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
      .toEqual(["development.workflow.capabilities", "development.workflow.inspect", "development.workflow.execute"]);
    expect(router.definitions({ mode: "plan", requestId: "web", audience: "web-creator" })).toEqual([]);

    const inspected = await router.execute(
      { id: "call-inspect", name: "development.workflow.inspect", arguments: { name: "ecc.inspect" } },
      { mode: "plan", requestId: "dev", audience: "development" },
    );
    expect(inspected.ok).toBe(true);
    expect(workflow.execute).toHaveBeenCalledWith("ecc.inspect", undefined);

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
    expect(allowed.ok).toBe(false);
    expect(allowed.error).toBe("Read-only development workflow must use inspection boundary");
    expect(workflow.execute).toHaveBeenCalledTimes(1);
  });



  it("prevents a read-only workflow from crossing into the high-risk execute boundary", async () => {
    const workflow: DevelopmentWorkflowPort = {
      capabilities: vi.fn(async () => [
        { id: "inspect-only", description: "Inspect project", readOnly: true, requiresApproval: false },
      ]),
      execute: vi.fn(async (name) => ({ name })),
    };
    const router = createToolRouter(createDevelopmentWorkflowTools({ workflow }));

    const result = await router.execute(
      { id: "call-1", name: "development.workflow.execute", arguments: { name: "inspect-only" } },
      { mode: "high-risk", requestId: "dev", audience: "development", approvalState: "approved" },
    );

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Read-only development workflow must use inspection boundary");
    expect(workflow.execute).not.toHaveBeenCalled();
  });

  it("prevents unknown workflows from executing through either boundary", async () => {
    const workflow: DevelopmentWorkflowPort = {
      capabilities: vi.fn(async () => []),
      execute: vi.fn(async () => ({ ok: true })),
    };
    const router = createToolRouter(createDevelopmentWorkflowTools({ workflow }));

    const inspect = await router.execute(
      { id: "inspect", name: "development.workflow.inspect", arguments: { name: "missing" } },
      { mode: "plan", requestId: "dev", audience: "development" },
    );
    const execute = await router.execute(
      { id: "execute", name: "development.workflow.execute", arguments: { name: "missing" } },
      { mode: "high-risk", requestId: "dev", audience: "development", approvalState: "approved" },
    );

    expect(inspect.ok).toBe(false);
    expect(execute.ok).toBe(false);
    expect(workflow.execute).not.toHaveBeenCalled();
  });



  it("isolates runtime loop tools to the game-runtime audience", async () => {
    const simulation = {
      simulate: vi.fn(async (request: { id: string }) => ({ observation: { id: request.id }, decision: { id: "decision" } })),
    };
    const orchestrator = {
      run: vi.fn(async (request: { id: string }, authorization: { approved?: boolean }) => ({ request, authorization })),
    };
    const tools = createRuntimeTools({ simulation, orchestrator });
    const router = createToolRouter(tools);

    expect(router.definitions({ mode: "plan", requestId: "game", audience: "game-runtime" }).map(item => item.name))
      .toEqual(["runtime.simulate", "runtime.execute"]);
    expect(router.definitions({ mode: "plan", requestId: "web", audience: "web-creator" })).toEqual([]);
    expect(router.definitions({ mode: "plan", requestId: "dev", audience: "development" })).toEqual([]);
  });

  it("keeps runtime simulation separate from authoritative execution", async () => {
    const simulation = {
      simulate: vi.fn(async (request: { id: string }) => ({ observation: { id: request.id }, decision: { id: "decision" } })),
    };
    const orchestrator = {
      run: vi.fn(async (request: { id: string }) => ({ request, executions: [] })),
    };
    const router = createToolRouter(createRuntimeTools({ simulation, orchestrator }));
    const request = { id: "runtime-1" };

    const simulated = await router.execute(
      { id: "simulate", name: "runtime.simulate", arguments: { request } },
      { mode: "plan", requestId: "game", audience: "game-runtime" },
    );

    expect(simulated.ok).toBe(true);
    expect(simulation.simulate).toHaveBeenCalledWith(request);
    expect(orchestrator.run).not.toHaveBeenCalled();
  });

  it("requires the game-rule execution boundary for runtime.execute", async () => {
    const orchestrator = {
      run: vi.fn(async (request: { id: string }, authorization: { approved?: boolean }) => ({ request, authorization })),
    };
    const router = createToolRouter(createRuntimeTools({ orchestrator }));
    const request = { id: "runtime-2" };

    const planned = await router.execute(
      { id: "execute", name: "runtime.execute", arguments: { request } },
      { mode: "plan", requestId: "game", audience: "game-runtime" },
    );

    expect(planned.ok).toBe(false);
    expect(planned.error).toBe("Game-rule tools require execute or high-risk mode");
    expect(orchestrator.run).not.toHaveBeenCalled();

    const executed = await router.execute(
      { id: "execute-2", name: "runtime.execute", arguments: { request } },
      { mode: "execute", requestId: "game", audience: "game-runtime" },
    );

    expect(executed.ok).toBe(true);
    expect(orchestrator.run).toHaveBeenCalledWith(request, { approved: false });
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
