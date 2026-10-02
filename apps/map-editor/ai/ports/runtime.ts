import type {
  RuntimeAction,
  RuntimeAiRequest,
  RuntimeDecision,
  RuntimeObservation,
} from "../domain/runtime";
import type { VerificationResult } from "../domain/types";

export interface RuntimeObservationPort {
  observe(request: RuntimeAiRequest): Promise<RuntimeObservation>;
}

export interface RuntimeDecisionPort {
  decide(
    request: RuntimeAiRequest,
    observation: RuntimeObservation,
  ): Promise<RuntimeDecision>;
}

export interface RuntimeActionPort {
  execute(
    action: RuntimeAction,
    observation: RuntimeObservation,
  ): Promise<{
    ok: boolean;
    actionId: string;
    stateVersion?: string;
    detail?: string;
  }>;
}

export interface RuntimeVerificationPort {
  verify(
    action: RuntimeAction,
    result: { ok: boolean; actionId: string; stateVersion?: string },
  ): Promise<VerificationResult>;
}

export interface RuntimeAiPorts {
  observation: RuntimeObservationPort;
  decision: RuntimeDecisionPort;
  action: RuntimeActionPort;
  verification: RuntimeVerificationPort;
}
