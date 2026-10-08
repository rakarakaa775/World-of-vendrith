import type { ModelProviderPort, ModelRequest, ModelResponse } from "../ports/model-provider";
import type { ToolContext, ToolRouter } from "../ports/tool-router";

export interface ToolLoopResult {
  response: ModelResponse;
  toolResults: Array<Awaited<ReturnType<ToolRouter["execute"]>>>;
  iterations: number;
}

export interface ToolLoopOptions {
  maxIterations?: number;
}

export async function runToolLoop(
  provider: ModelProviderPort,
  router: ToolRouter,
  request: ModelRequest,
  context: ToolContext,
  options: ToolLoopOptions = {},
): Promise<ToolLoopResult> {
  const maxIterations = options.maxIterations ?? 4;
  let currentRequest: ModelRequest = {
    ...request,
    tools: router.definitions(context).map(({ name, description, parameters }) => ({
      name,
      description,
      parameters,
    })),
  };

  const toolResults: ToolLoopResult["toolResults"] = [];

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const response = await provider.generate(currentRequest);
    if (response.toolCalls.length === 0) {
      return { response, toolResults, iterations: iteration };
    }

    const results = await Promise.all(
      response.toolCalls.map((call) =>
        router.execute(
          { id: call.id, name: call.name, arguments: call.arguments },
          context,
        ),
      ),
    );
    toolResults.push(...results);

    currentRequest = {
      ...currentRequest,
      messages: [
        ...currentRequest.messages,
        { role: "assistant", content: response.content, toolCalls: response.toolCalls },
        ...results.map((result) => ({
          role: "tool" as const,
          toolCallId: result.id,
          content: JSON.stringify(result),
        })),
      ],
    };
  }

  throw new Error(`Tool loop exceeded maximum iterations (${maxIterations})`);
}
