import type { ToolDefinition } from "../ports/tool-router";

export const DEVELOPMENT_TOOL_NAMES = [
  "repository.read_file",
  "repository.search",
  "codegraph.dependencies",
  "codegraph.dependents",
  "codegraph.symbols",
  "codegraph.references",
  "codegraph.call_chain",
] as const;

export type DevelopmentToolName = typeof DEVELOPMENT_TOOL_NAMES[number];

export function isDevelopmentToolName(name: string): name is DevelopmentToolName {
  return (DEVELOPMENT_TOOL_NAMES as readonly string[]).includes(name);
}

export function filterDevelopmentTools(tools: readonly ToolDefinition[]): ToolDefinition[] {
  return tools.filter((tool) => tool.audience === "development" || isDevelopmentToolName(tool.name));
}
