import type { NpcNeedState, RuntimeGoalKind } from "./runtime-goal";

export interface NpcActivityEffect {
  goal: RuntimeGoalKind;
  needs: Partial<NpcNeedState>;
}

export interface NpcActivityEffectStore {
  hasApplied(actionId: string): boolean;
  markApplied(actionId: string): void;
}

export function createNpcActivityEffectStore(): NpcActivityEffectStore {
  const applied = new Set<string>();
  return {
    hasApplied: actionId => applied.has(actionId),
    markApplied: actionId => applied.add(actionId),
  };
}

export interface NpcActivityEffectResult {
  applied: boolean;
  actionId: string;
  goal?: RuntimeGoalKind;
  needs?: NpcNeedState;
  reason: string;
}
