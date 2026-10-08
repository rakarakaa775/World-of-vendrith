import type { ToolDefinition } from "./tool-router";

export interface DevelopmentWorkflowCapability {
  id: string;
  description: string;
  readOnly: boolean;
  requiresApproval: boolean;
}

export interface DevelopmentWorkflowPort {
  /**
   * Describe workflows exposed by an external development agent system
   * such as ECC or Agent Skills. This does not execute anything.
   */
  capabilities(): Promise<readonly DevelopmentWorkflowCapability[]>;

  /**
   * Execute a named workflow only after the caller has passed its own
   * approval/policy boundary.
   */
  execute(name: string, input: unknown): Promise<unknown>;
}

export interface DevelopmentToolAdapterOptions {
  workflow?: DevelopmentWorkflowPort;
}

/**
 * Adapts an external development workflow system into Vendrith's tool model.
 *
 * No ECC/Agent Skills implementation is assumed here: when no workflow
 * provider is connected, the adapter simply exposes no external workflow
 * tools. The router remains the security boundary.
 */
export function createDevelopmentWorkflowTools(
  options: DevelopmentToolAdapterOptions,
): ToolDefinition[] {
  if (!options.workflow) return [];

  const workflow = options.workflow;

  return [
    {
      name: "development.workflow.capabilities",
      description: "List capabilities exposed by the connected development workflow provider (for example ECC or Agent Skills).",
      audience: "development",
      capability: "read",
      parameters: { type: "object", properties: {} },
      validate: (args): args is Record<string, never> => typeof args === "object" && args !== null,
      async execute() {
        return workflow.capabilities();
      },
    },
    {
      name: "development.workflow.execute",
      description: "Execute a named external development workflow. Requires approved high-risk execution.",
      audience: "development",
      capability: "high-risk",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          input: {},
        },
        required: ["name"],
      },
      validate: (args): args is { name: string; input?: unknown } =>
        typeof args === "object" &&
        args !== null &&
        typeof (args as { name?: unknown }).name === "string",
      async execute(args) {
        const value = args as { name: string; input?: unknown };
        return workflow.execute(value.name, value.input);
      },
    },
  ];
}
