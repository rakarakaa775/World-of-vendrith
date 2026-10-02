import type {
  RuntimeAiRequest,
  RuntimeDecision,
  RuntimeObservation,
} from "../domain/runtime";
import type { VerificationResult } from "../domain/types";
import {
  canExecuteRuntimeActionForSurface,
  validateRuntimeDecision,
} from "../policies/runtime-policy";
import type { RuntimeAiPorts } from "../ports/runtime";

export interface RuntimeActionExecution {
  actionId: string;
  ok: boolean;
  executed: boolean;
  detail?: string;
  verification?: VerificationResult;
}

export interface RuntimeRunResult {
  request: RuntimeAiRequest;
  observation: RuntimeObservation;
  decision: RuntimeDecision;
  executions: RuntimeActionExecution[];
}

export interface RuntimeOrchestrator {
  run(
    request: RuntimeAiRequest,
    authorization?: { approved?: boolean },
  ): Promise<RuntimeRunResult>;
}

/**
 * Coordinates observe -> decide -> policy -> execute -> verify.
 *
 * The orchestrator does not mutate game state itself. RuntimeActionPort remains
 * the only execution boundary, while policy blocks stale or unauthorized work.
 */
export function createRuntimeOrchestrator(
  ports: RuntimeAiPorts,
): RuntimeOrchestrator {
  return {
    async run(request, authorization = {}) {
      const observation = await ports.observation.observe(request);
      const decision = await ports.decision.decide(request, observation);

      const validation = validateRuntimeDecision(decision, observation);
      if (!validation.ok) {
        throw new Error(
          `Invalid runtime decision: ${validation.errors.join(" ")}`,
        );
      }

      const executions: RuntimeActionExecution[] = [];

      for (const action of decision.actions) {
        const approved = authorization.approved === true;
        if (!canExecuteRuntimeActionForSurface(
          action,
          request.surface,
          approved,
        )) {
          executions.push({
            actionId: action.id,
            ok: false,
            executed: false,
            detail: "Runtime policy blocked this action.",
          });
          continue;
        }

        const result = await ports.action.execute(action, observation);
        const verification = await ports.verification.verify(action, result);

        executions.push({
          actionId: action.id,
          ok: result.ok && verification.ok,
          executed: true,
          detail: result.detail,
          verification,
        });
      }

      return {
        request,
        observation,
        decision,
        executions,
      };
    },
  };
}
