import { describe, expect, it } from "vitest";
import { runToolLoop } from "./tool-loop";
import type { ModelProviderPort } from "../ports/model-provider";
import { createToolRouter, hasStringArgument } from "../ports/tool-router";

describe("tool loop", () => {
  it("executes structured tool calls and returns the final model response", async () => {
    let calls = 0;
    const provider: ModelProviderPort = {
      async generate(request) {
        calls += 1;
        if (calls === 1) {
          expect(request.tools?.[0]?.name).toBe("repository.search");
          return {
            content: "I need repository context.",
            toolCalls: [{ id: "call-1", name: "repository.search", arguments: { query: "CodeGraph" } }],
            provider: "fake",
          };
        }

        expect(request.messages.at(-1)?.role).toBe("tool");
        return { content: "Repository context checked.", toolCalls: [], provider: "fake" };
      },
    };

    const router = createToolRouter([{
      name: "repository.search",
      description: "search",
      access: "read-only",
      parameters: { type: "object" },
      validate: hasStringArgument("query"),
      async execute(args) {
        return [{ path: "a.ts", excerpt: args.query }];
      },
    }]);

    const result = await runToolLoop(
      provider,
      router,
      { messages: [{ role: "user", content: "Find CodeGraph" }] },
      { mode: "explain", requestId: "req-1" },
    );

    expect(result.iterations).toBe(2);
    expect(result.toolResults[0]).toMatchObject({ ok: true, name: "repository.search" });
    expect(result.response.content).toBe("Repository context checked.");
  });

  it("allows more than four bounded steps by default for multi-step inspection", async () => {
    let calls = 0;
    const provider: ModelProviderPort = {
      async generate() {
        calls += 1;
        if (calls <= 5) {
          return {
            content: "Inspecting next detail.",
            toolCalls: [{ id: `call-${calls}`, name: "inspect", arguments: { query: `step-${calls}` } }],
            provider: "fake",
          };
        }
        return { content: "Inspection complete.", toolCalls: [], provider: "fake" };
      },
    };
    const router = createToolRouter([{
      name: "inspect",
      description: "inspect",
      access: "read-only",
      parameters: { type: "object" },
      validate: hasStringArgument("query"),
      async execute(args) {
        return { inspected: args.query };
      },
    }]);

    const result = await runToolLoop(
      provider,
      router,
      { messages: [{ role: "user", content: "Inspect multiple details" }] },
      { mode: "explain", requestId: "req-multi-step" },
    );

    expect(result.iterations).toBe(6);
    expect(result.toolResults).toHaveLength(5);
    expect(result.response.content).toBe("Inspection complete.");
  });

  it("bounds the number of model/tool iterations and reports recent tool names", async () => {
    const provider: ModelProviderPort = {
      async generate() {
        return {
          content: "continue",
          toolCalls: [{ id: "call", name: "test", arguments: { query: "x" } }],
          provider: "fake",
        };
      },
    };
    const router = createToolRouter([{
      name: "test",
      description: "test",
      access: "read-only",
      parameters: {},
      validate: hasStringArgument("query"),
      async execute() {
        return "ok";
      },
    }]);

    await expect(
      runToolLoop(
        provider,
        router,
        { messages: [{ role: "user", content: "loop" }] },
        { mode: "plan", requestId: "req-1" },
        { maxIterations: 2 },
      ),
    ).rejects.toThrow("maximum iterations (2); recent tools: test, test");
  });
});
