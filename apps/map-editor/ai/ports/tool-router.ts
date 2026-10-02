import type { AiMode } from "../domain/types";

export type ToolAccess = "read-only" | "mutation";

export interface ToolContext {
  mode: AiMode;
  requestId: string;
}

export interface ToolDefinition<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  access: ToolAccess;
  parameters: Record<string, unknown>;
  validate(args: unknown): args is TArgs;
  execute(args: TArgs, context: ToolContext): Promise<TResult>;
}

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: unknown;
}

export interface ToolCallResult {
  id: string;
  name: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

export interface ToolRouter {
  definitions(): ToolDefinition[];
  execute(call: ToolCallRequest, context: ToolContext): Promise<ToolCallResult>;
}

export function createToolRouter(tools: ToolDefinition[]): ToolRouter {
  const registry = new Map(tools.map((tool) => [tool.name, tool]));

  return {
    definitions() {
      return [...registry.values()];
    },

    async execute(call, context) {
      const tool = registry.get(call.name);
      if (!tool) {
        return { id: call.id, name: call.name, ok: false, error: "Unknown tool" };
      }

      if (tool.access === "mutation") {
        return {
          id: call.id,
          name: call.name,
          ok: false,
          error: "Mutation tools require an approved execution path",
        };
      }

      if (!tool.validate(call.arguments)) {
        return { id: call.id, name: call.name, ok: false, error: "Invalid tool arguments" };
      }

      try {
        const result = await tool.execute(call.arguments, context);
        return { id: call.id, name: call.name, ok: true, result };
      } catch (error) {
        return {
          id: call.id,
          name: call.name,
          ok: false,
          error: error instanceof Error ? error.message : "Tool execution failed",
        };
      }
    },
  };
}

export function stringArgument(name: string): Record<string, unknown> {
  return { type: "object", properties: { [name]: { type: "string" } }, required: [name] };
}

export function hasStringArgument(name: string) {
  return (args: unknown): args is Record<string, string> =>
    typeof args === "object" &&
    args !== null &&
    typeof (args as Record<string, unknown>)[name] === "string";
}
