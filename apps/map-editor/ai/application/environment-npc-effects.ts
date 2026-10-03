import type { RuntimeObservation } from "../domain/runtime";
import type { NpcNeedState, RuntimeGoal } from "../domain/runtime-goal";
import type { RuntimeBehaviorCandidate } from "../domain/runtime-behavior";

const NEED_KEYS: Array<keyof NpcNeedState> = ["hunger", "energy", "social", "safety"];

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function environmentObject(
  observation: RuntimeObservation,
  key: string,
): Record<string, unknown> | undefined {
  const value = observation.state.environmentConditions?.[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

export function applyEnvironmentNpcNeeds(
  observation: RuntimeObservation,
  needs: NpcNeedState,
): NpcNeedState {
  const effects = environmentObject(observation, "npc_needs");
  if (!effects) return { ...needs };

  const next = { ...needs };
  for (const key of NEED_KEYS) {
    const delta = effects[key];
    if (finiteNumber(delta)) next[key] = clamp(next[key] + delta);
  }
  return next;
}

export function applyEnvironmentNpcBehavior(
  observation: RuntimeObservation,
  candidates: RuntimeBehaviorCandidate[],
): RuntimeBehaviorCandidate[] {
  const rules = environmentObject(observation, "npc_behavior");
  if (!rules) return candidates.map(candidate => ({ ...candidate }));

  return candidates.map(candidate => {
    const rule = rules[candidate.kind];
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) return { ...candidate };
    const config = rule as Record<string, unknown>;
    const priorityDelta = finiteNumber(config.priority_delta)
      ? config.priority_delta
      : 0;
    const reason = typeof config.reason === "string" ? config.reason : candidate.reason;
    return { ...candidate, priority: candidate.priority + priorityDelta, reason };
  });
}

export function applyEnvironmentNpcDetectionBehavior(
  observation: RuntimeObservation,
  candidates: RuntimeBehaviorCandidate[],
): RuntimeBehaviorCandidate[] {
  const rules = environmentObject(observation, "npc_detection_behavior");
  if (!rules) return candidates.map(candidate => ({ ...candidate }));
  const detections = observation.perception?.detections ?? [];
  const next = candidates.map(candidate => ({ ...candidate }));
  for (const detection of detections) {
    for (const channel of detection.channels) {
      const channelRules = rules[channel];
      if (!channelRules || typeof channelRules !== "object" || Array.isArray(channelRules)) continue;
      const behaviorRule = (channelRules as Record<string, unknown>).investigate;
      if (!behaviorRule || typeof behaviorRule !== "object" || Array.isArray(behaviorRule)) continue;
      const config = behaviorRule as Record<string, unknown>;
      const priorityDelta = finiteNumber(config.priority_delta) ? config.priority_delta : 0;
      const reason = typeof config.reason === "string" ? config.reason : "Explicit detection rule requests investigation.";
      next.push({
        kind: "investigate",
        priority: 10 + priorityDelta,
        reason,
        action: {
          id: observation.id + ":investigate:" + detection.entityId,
          intelligence: "npc",
          type: "npc.investigate",
          payload: { targetEntityId: detection.entityId },
          risk: "safe",
          reason,
        },
      });
    }
  }
  return next;
}

export type InvestigationFailure = "navigation" | "execution" | "verification";
export type InvestigationRecoveryAction = "retry" | "clear";

export function investigationRecoveryAction(
  observation: RuntimeObservation,
  failure: InvestigationFailure,
): InvestigationRecoveryAction | undefined {
  const rules = environmentObject(observation, "npc_investigation_recovery");
  if (!rules) return undefined;
  const rule = rules[failure];
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) return undefined;
  const action = (rule as Record<string, unknown>).action;
  return action === "retry" || action === "clear" ? action : undefined;
}

export function applyEnvironmentNpcGoalPriority(
  observation: RuntimeObservation,
  goals: RuntimeGoal[],
): RuntimeGoal[] {
  const rules = environmentObject(observation, "npc_goal_priority");
  if (!rules) return goals.map(goal => ({ ...goal }));

  return goals.map(goal => {
    const delta = rules[goal.kind];
    return finiteNumber(delta)
      ? { ...goal, priority: goal.priority + delta }
      : { ...goal };
  });
}
