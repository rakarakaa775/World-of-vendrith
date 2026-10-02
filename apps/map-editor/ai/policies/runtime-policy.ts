import type { AiSurface } from "../domain/runtime";
import type { RuntimeAction, RuntimeDecision, RuntimeObservation } from "../domain/runtime";

export interface RuntimeValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateRuntimeDecision(
  decision: RuntimeDecision,
  observation: RuntimeObservation,
): RuntimeValidationResult {
  const errors: string[] = [];

  if (decision.observationId !== observation.id) {
    errors.push("Decision references a different observation.");
  }

  if (decision.stateVersion !== observation.state.stateVersion) {
    errors.push("Decision was produced from a stale state version.");
  }

  if (decision.actions.length === 0) {
    errors.push("Decision must contain at least one runtime action.");
  }

  for (const action of decision.actions) {
    if (!action.id || !action.type || !action.reason) {
      errors.push(`Runtime action ${action.id || "<unknown>"} is missing required metadata.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function canExecuteRuntimeAction(
  action: RuntimeAction,
  approved: boolean,
): boolean {
  if (action.risk === "safe") return true;
  return approved;
}
