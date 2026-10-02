import type { RuntimeAction, RuntimeObservation } from "./runtime";

export type RuntimeBehaviorKind = "idle" | "follow-player" | "wander" | "investigate" | "flee";

export interface RuntimeBehaviorCandidate {
  kind: RuntimeBehaviorKind;
  priority: number;
  reason: string;
  action: RuntimeAction;
}

export interface RuntimeBehaviorDecision {
  behavior: RuntimeBehaviorKind;
  reason: string;
  action: RuntimeAction;
}

export interface RuntimeBehaviorPolicy {
  choose(observation: RuntimeObservation, candidates: RuntimeBehaviorCandidate[]): RuntimeBehaviorDecision;
}
