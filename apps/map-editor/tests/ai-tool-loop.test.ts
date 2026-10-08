import { describe, expect, it, vi } from "vitest";
import { runToolLoop } from "../ai/application/tool-loop";
import type { ModelProviderPort } from "../ai/ports/model-provider";
import { createToolRouter, type ToolDefinition } from "../ai/ports/tool-router";

function testTool(): ToolDefinition {
  return {
    name: "test.read",
    description: "test",
    audience: "development",
    capability: "read",
    parameters: { type: "object", properties: {} },
    validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
    execute: vi.fn(async () => ({ ok: true })),
  };
}

function context() {
  return { mode: "plan" as const, requestId: "loop-test", audience: "development" as const };
}

function response(toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }>) {
  return { content: "", toolCalls, provider: "test", model: "test" };
}

describe("AI tool loop budget", () => {
  it("allows tool calls within the total budget", async () => {
    const provider: ModelProviderPort = {
      generate: vi.fn()
        .mockResolvedValueOnce(response([{ id: "1", name: "test.read", arguments: {} }]))
        .mockResolvedValueOnce({ content: "done", toolCalls: [], provider: "test", model: "test" }),
    };
    const tool = testTool();
    const result = await runToolLoop(
      provider,
      createToolRouter([tool]),
      { messages: [] },
      context(),
      { maxIterations: 4, maxToolCalls: 1 },
    );

    expect(result.toolResults).toHaveLength(1);
    expect(result.iterations).toBe(2);
  });

  it("stops a model response that would exceed the total tool-call budget", async () => {
    const provider: ModelProviderPort = {
      generate: vi.fn(async () => response([
        { id: "1", name: "test.read", arguments: {} },
        { id: "2", name: "test.read", arguments: {} },
      ])),
    };
    const tool = testTool();

    await expect(runToolLoop(
      provider,
      createToolRouter([tool]),
      { messages: [] },
      context(),
      { maxIterations: 4, maxToolCalls: 1 },
    )).rejects.toThrow("Tool loop exceeded maximum tool calls (1)");

    expect(tool.execute).not.toHaveBeenCalled();
  });

  it("uses a bounded default tool-call budget", async () => {
    const provider: ModelProviderPort = {
      generate: vi.fn(async () => response(
        Array.from({ length: 13 }, (_, index) => ({
          id: String(index + 1),
          name: "test.read",
          arguments: {},
        })),
      )),
    };

    await expect(runToolLoop(
      provider,
      createToolRouter([testTool()]),
      { messages: [] },
      context(),
    )).rejects.toThrow("Tool loop exceeded maximum tool calls (12)");
  });
});
