import type { RuntimeObservation } from "../domain/runtime";
import type { NpcNeedState, RuntimeGoal } from "../domain/runtime-goal";
import type { RuntimeBehaviorCandidate } from "../domain/runtime-behavior";
import type { NpcPersonalityPolicy } from "./npc-personality-policy-schema";
import { validateNpcPersonalityPolicy } from "./npc-personality-policy-schema";
import type { NpcRelationshipPolicy } from "./npc-relationship-policy-schema";
import { validateNpcRelationshipPolicy } from "./npc-relationship-policy-schema";
import { effectiveNpcEnvironmentConditions } from "./npc-environment-policy-runtime";

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
  const value = effectiveNpcEnvironmentConditions(observation)[key];
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

export function applyNpcPersonalityBehavior(observation: RuntimeObservation, candidates: RuntimeBehaviorCandidate[]): RuntimeBehaviorCandidate[] {
  const selfState = observation.perception?.self?.state;
  const personality = selfState?.personality;
  const policy = selfState?.personalityPolicy;
  if (!personality || typeof personality !== "object" || Array.isArray(personality) || !policy) return candidates.map(candidate => ({ ...candidate }));
  const traits = (personality as Record<string, unknown>).traits;
  if (!Array.isArray(traits) || !validateNpcPersonalityPolicy(policy).ok) return candidates.map(candidate => ({ ...candidate }));
  const rules = (policy as NpcPersonalityPolicy).rules ?? [];
  return candidates.map(candidate => {
    let priority = candidate.priority;
    for (const trait of traits) {
      if (typeof trait !== "string") continue;
      const delta = rules.find(rule => rule.trait === trait)?.behaviors?.[candidate.kind];
      if (finiteNumber(delta)) priority += delta;
    }
    return { ...candidate, priority };
  });
}

export function applyNpcPersonalityGoalPriority(observation: RuntimeObservation, goals: RuntimeGoal[]): RuntimeGoal[] {
  const selfState = observation.perception?.self?.state;
  const personality = selfState?.personality;
  const policy = selfState?.personalityPolicy;
  if (!personality || typeof personality !== "object" || Array.isArray(personality) || !policy) return goals.map(goal => ({ ...goal }));
  const traits = (personality as Record<string, unknown>).traits;
  if (!Array.isArray(traits) || !validateNpcPersonalityPolicy(policy).ok) return goals.map(goal => ({ ...goal }));
  const rules = (policy as NpcPersonalityPolicy).rules ?? [];
  return goals.map(goal => {
    let priority = goal.priority;
    for (const trait of traits) {
      if (typeof trait !== "string") continue;
      const delta = rules.find(rule => rule.trait === trait)?.goals?.[goal.kind];
      if (finiteNumber(delta)) priority += delta;
    }
    return { ...goal, priority };
  });
}

export function applyNpcRelationshipBehavior(observation: RuntimeObservation, candidates: RuntimeBehaviorCandidate[]): RuntimeBehaviorCandidate[] {
  const state = observation.perception?.self?.state;
  const profile = state?.decisionProfile;
  const record = profile && typeof profile === "object" && !Array.isArray(profile) ? profile as Record<string, unknown> : undefined;
  const relationships = record?.relationships;
  const policy = record?.relationshipPolicy;
  if (!Array.isArray(relationships) || !policy || !validateNpcRelationshipPolicy(policy).ok) return candidates.map(candidate => ({ ...candidate }));
  const rules = (policy as NpcRelationshipPolicy).rules ?? [];
  return candidates.map(candidate => {
    const targetId = candidate.action.payload.targetEntityId;
    if (typeof targetId !== "string") return { ...candidate };
    let priority = candidate.priority;
    for (const relationship of relationships) {
      if (!relationship || typeof relationship !== "object" || Array.isArray(relationship)) continue;
      const rel = relationship as Record<string, unknown>;
      if (rel.targetNpcId !== targetId) continue;
      for (const rule of rules) {
        const matches = rule.type === rel.type &&
          (rule.minAffinity === undefined || (typeof rel.affinity === "number" ? rel.affinity : 0) >= rule.minAffinity) &&
          (rule.maxAffinity === undefined || (typeof rel.affinity === "number" ? rel.affinity : 0) <= rule.maxAffinity) &&
          (rule.minTrust === undefined || (typeof rel.trust === "number" ? rel.trust : 0) >= rule.minTrust) &&
          (rule.maxTrust === undefined || (typeof rel.trust === "number" ? rel.trust : 0) <= rule.maxTrust);
        const delta = matches ? rule.behaviors?.[candidate.kind] : undefined;
        if (finiteNumber(delta)) priority += delta;
      }
    }
    return { ...candidate, priority };
  });
}

export function applyNpcRelationshipGoalPriority(observation: RuntimeObservation, goals: RuntimeGoal[]): RuntimeGoal[] {
  const state = observation.perception?.self?.state;
  const profile = state?.decisionProfile;
  const record = profile && typeof profile === "object" && !Array.isArray(profile) ? profile as Record<string, unknown> : undefined;
  const relationships = record?.relationships;
  const policy = record?.relationshipPolicy;
  if (!Array.isArray(relationships) || !policy || !validateNpcRelationshipPolicy(policy).ok) return goals.map(goal => ({ ...goal }));
  const rules = (policy as NpcRelationshipPolicy).rules ?? [];
  return goals.map(goal => {
    if (typeof goal.targetNpcId !== "string") return { ...goal };
    let priority = goal.priority;
    for (const relationship of relationships) {
      if (!relationship || typeof relationship !== "object" || Array.isArray(relationship)) continue;
      const rel = relationship as Record<string, unknown>;
      if (rel.targetNpcId !== goal.targetNpcId) continue;
      for (const rule of rules) {
        const matches = rule.type === rel.type &&
          (rule.minAffinity === undefined || (typeof rel.affinity === "number" ? rel.affinity : 0) >= rule.minAffinity) &&
          (rule.maxAffinity === undefined || (typeof rel.affinity === "number" ? rel.affinity : 0) <= rule.maxAffinity) &&
          (rule.minTrust === undefined || (typeof rel.trust === "number" ? rel.trust : 0) >= rule.minTrust) &&
          (rule.maxTrust === undefined || (typeof rel.trust === "number" ? rel.trust : 0) <= rule.maxTrust);
        const delta = matches ? rule.goals?.[goal.kind] : undefined;
        if (finiteNumber(delta)) priority += delta;
      }
    }
    return { ...goal, priority };
  });
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
