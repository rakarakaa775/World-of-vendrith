import { describe, expect, it } from "vitest";
import { createVendrithAgentOrchestrator } from "./agent-orchestrator";
import { createToolRouter } from "../ports/tool-router";
import type { ModelProviderPort } from "../ports/model-provider";

describe("Vendrith agent orchestrator", () => {
  it("coordinates model, tools, approval context, and evidence", async () => {
    let calls = 0;
    const provider: ModelProviderPort = {
      async generate(request) {
        calls += 1;
        if (calls === 1) {
          expect(request.mode).toBe("explain");
          return {
            content: "I will inspect the asset registry.",
            toolCalls: [{ id: "asset-1", name: "asset_registry.search", arguments: { query: "LPC terrain" } }],
            provider: "fake",
          };
        }
        return {
          content: "The registry evidence has been retrieved.",
          toolCalls: [],
          provider: "fake",
        };
      },
    };

    const router = createToolRouter([{
      name: "asset_registry.search",
      description: "search assets",
      access: "read-only",
      parameters: { type: "object" },
      validate: (args): args is { query: string } =>
        typeof args === "object" && args !== null &&
        typeof (args as { query?: unknown }).query === "string",
      async execute(args) {
        return [{
          id: "asset-1",
          kind: "verified-fact" as const,
          source: "asset_license_registry",
          fact: `Verified registry match: ${args.query}`,
          confidence: "high" as const,
        }];
      },
    }]);

    const result = await createVendrithAgentOrchestrator({ modelProvider: provider, toolRouter: router })
      .run({ id: "req-1", mode: "explain", prompt: "Check LPC terrain licensing." });

    expect(result.iterations).toBe(2);
    expect(result.toolResults[0]).toMatchObject({ ok: true });
    expect(result.evidence[0]).toMatchObject({
      kind: "verified-fact",
      source: "asset_registry.search",
    });
  });

  it("never treats execute mode as approved mutation", async () => {
    const provider: ModelProviderPort = {
      async generate() {
        return { content: "no-op", toolCalls: [], provider: "fake" };
      },
    };
    const router = createToolRouter([]);

    const result = await createVendrithAgentOrchestrator({ modelProvider: provider, toolRouter: router })
      .run({ id: "req-2", mode: "execute", prompt: "Explain this execution request." });

    expect(result.approval).toBe("pending");
  });
});
