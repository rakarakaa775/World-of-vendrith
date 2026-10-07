import type { AiMode, ApprovalState } from "../domain/types";

export type ToolCapability = "read" | "simulate" | "game-rule" | "high-risk";

/** @deprecated Use ToolCapability. Kept for compatibility with older callers. */
export type ToolAccess = "read-only" | "mutation";

export interface ToolContext {
  mode: AiMode;
  requestId: string;
  approvalState?: ApprovalState;
}

export interface ToolDefinition<TArgs = unknown, TResult = unknown> {
  name: string;
  description: string;
  capability?: ToolCapability;
  /** @deprecated Use capability. */
  access?: ToolAccess;
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

      const capability = tool.capability ?? (tool.access === "mutation" ? "high-risk" : "read");

      if (capability === "game-rule" && context.mode !== "execute" && context.mode !== "high-risk") {
        return {
          id: call.id,
          name: call.name,
          ok: false,
          error: "Game-rule tools require execute or high-risk mode",
        };
      }

      if (capability === "high-risk" && context.approvalState !== "approved") {
        return {
          id: call.id,
          name: call.name,
          ok: false,
          error: "High-risk tools require an approved execution path",
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
