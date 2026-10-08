import type { ToolDefinition } from "../ports/tool-router";

export const RUNTIME_TOOL_NAMES = [
  "runtime.simulate",
  "runtime.execute",
] as const;

export type RuntimeToolName = typeof RUNTIME_TOOL_NAMES[number];

export function isRuntimeToolName(name: string): name is RuntimeToolName {
  return (RUNTIME_TOOL_NAMES as readonly string[]).includes(name);
}

export function filterRuntimeTools(tools: readonly ToolDefinition[]): ToolDefinition[] {
  return tools.filter((tool) => tool.audience === "game-runtime" || isRuntimeToolName(tool.name));
}
