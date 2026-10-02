import { describe, expect, it } from "vitest";
import type {
  ModelProviderPort,
  ModelRequest,
  ModelResponse,
} from "../ports/model-provider";

function createFakeProvider(): ModelProviderPort {
  return {
    async generate(request: ModelRequest): Promise<ModelResponse> {
      expect(request.tools?.[0]?.name).toBe("inspect_repository");
      return {
        content: "",
        toolCalls: [
          {
            id: "call-1",
            name: "inspect_repository",
            arguments: { path: "apps/map-editor/ai" },
          },
        ],
        provider: "fake",
        model: "test-model",
      };
    },
  };
}

describe("ModelProviderPort", () => {
  it("keeps model output separate from tool execution", async () => {
    const provider = createFakeProvider();

    const response = await provider.generate({
      messages: [{ role: "user", content: "Inspect the AI layer." }],
      tools: [
        {
          name: "inspect_repository",
          description: "Read-only repository inspection.",
          parameters: {
            type: "object",
            properties: { path: { type: "string" } },
            required: ["path"],
          },
        },
      ],
      mode: "plan",
    });

    expect(response.provider).toBe("fake");
    expect(response.toolCalls).toEqual([
      {
        id: "call-1",
        name: "inspect_repository",
        arguments: { path: "apps/map-editor/ai" },
      },
    ]);
  });

  it("supports a plain model response without tool calls", async () => {
    const provider: ModelProviderPort = {
      async generate() {
        return {
          content: "Project analysis complete.",
          toolCalls: [],
          provider: "fake",
        };
      },
    };

    const response = await provider.generate({
      messages: [{ role: "user", content: "Explain the AI architecture." }],
      mode: "explain",
      openThinking: false,
    });

    expect(response.content).toBe("Project analysis complete.");
    expect(response.toolCalls).toHaveLength(0);
  });
});
