import type {
  RuntimeAction,
  RuntimeAiRequest,
  RuntimeDecision,
  RuntimeObservation,
} from "../domain/runtime";
import type { Evidence } from "../domain/types";
import { verifiedEvidence } from "./evidence";

export interface RuntimeDecisionInput {
  actions: RuntimeAction[];
  evidence?: Evidence[];
  expiresAtTick?: number;
}

export function createRuntimeDecision(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  input: RuntimeDecisionInput,
): RuntimeDecision {
  return {
    id: `${request.id}:decision:${observation.state.stateVersion}`,
    observationId: observation.id,
    stateVersion: observation.state.stateVersion,
    actions: input.actions,
    expiresAtTick: input.expiresAtTick,
    evidence: input.evidence ?? [
      verifiedEvidence(
        "runtime-observation",
        `Decision derived from authoritative state version ${observation.state.stateVersion}.`,
      ),
    ],
  };
}
