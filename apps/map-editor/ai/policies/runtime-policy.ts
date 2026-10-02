import type { AiSurface, RuntimeAction, RuntimeDecision, RuntimeObservation } from "../domain/runtime";

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

/**
 * Runtime execution policy with an explicit surface boundary.
 *
 * Creator is never a runtime execution surface. Engine and Game are the
 * runtime surfaces; game-rule actions require the runtime surface itself to
 * authorize them, while high-risk actions additionally require approval.
 */
export function canExecuteRuntimeActionForSurface(
  action: RuntimeAction,
  surface: AiSurface,
  approved: boolean,
): boolean {
  if (surface === "creator") return false;

  if (action.risk === "safe") return true;

  if (action.risk === "game-rule") {
    return surface === "engine" || surface === "game";
  }

  return approved;
}
