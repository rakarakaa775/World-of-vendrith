import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { RuntimeOrchestrator } from "../application/runtime-orchestrator";
import type { ToolDefinition } from "./tool-router";

export interface RuntimeSimulationResult {
  observation: RuntimeObservation;
  decision: RuntimeDecision;
  /**
   * Simulation is a proof boundary: it must never claim that authoritative
   * state was mutated. The adapter enforces this invariant before returning.
   */
  executed: false;
  stateMutated: false;
  stateVersion: string;
}

export interface RuntimeSimulationPort {
  simulate(request: RuntimeAiRequest): Promise<RuntimeSimulationResult>;
}

export interface RuntimeToolAdapterOptions {
  orchestrator?: RuntimeOrchestrator;
  simulation?: RuntimeSimulationPort;
}

export function createRuntimeTools(options: RuntimeToolAdapterOptions): ToolDefinition[] {
  const tools: ToolDefinition[] = [];

  if (options.simulation) {
    const simulation = options.simulation;
    tools.push({
      name: "runtime.simulate",
      description: "Dry-run runtime observation and decision without executing a game action or mutating authoritative state.",
      audience: "game-runtime",
      capability: "simulate",
      parameters: {
        type: "object",
        properties: { request: { type: "object" } },
        required: ["request"],
      },
      validate: (args): args is { request: RuntimeAiRequest } =>
        isRecord(args) && isRecord(args.request) && typeof args.request.id === "string",
      async execute(args) {
        const result = await simulation.simulate((args as { request: RuntimeAiRequest }).request);
        if (result.executed !== false || result.stateMutated !== false) {
          throw new Error("Runtime simulation violated the no-mutation contract");
        }
        if (result.stateVersion !== result.observation.state.stateVersion) {
          throw new Error("Runtime simulation state version does not match its observation");
        }
        return {
          ...result,
          verified: true,
          execution: {
            executed: false,
            stateMutated: false,
            stateVersion: result.stateVersion,
          },
        };
      },
    });
  }

  if (options.orchestrator) {
    const orchestrator = options.orchestrator;
    tools.push({
      name: "runtime.execute",
      description: "Run the authoritative runtime loop. Execution is policy-gated and every executed action is verified by the runtime orchestrator.",
      audience: "game-runtime",
      capability: "game-rule",
      parameters: {
        type: "object",
        properties: {
          request: { type: "object" },
          approved: { type: "boolean" },
        },
        required: ["request"],
      },
      validate: (args): args is { request: RuntimeAiRequest; approved?: boolean } =>
        isRecord(args) && isRecord(args.request) && typeof args.request.id === "string" &&
        (args.approved === undefined || typeof args.approved === "boolean"),
      async execute(args) {
        const value = args as { request: RuntimeAiRequest; approved?: boolean };
        return orchestrator.run(value.request, { approved: value.approved === true });
      },
    });
  }

  return tools;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
