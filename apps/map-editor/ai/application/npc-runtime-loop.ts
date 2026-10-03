import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { NpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import type { NavigationPoint } from "../domain/runtime-navigation";
import type { RuntimeAiPorts } from "../ports/runtime";
import { validateRuntimeDecision } from "../policies/runtime-policy";
import { createNpcBehaviorDecisionCandidates, decideNpcBehavior } from "./npc-behavior";
import { decideNpcGoal } from "./npc-goals";
import { createRuntimeDecision } from "./runtime-decision";
import { decideNpcNavigation } from "./npc-navigation";
import { investigationRecoveryAction, type InvestigationFailure } from "./environment-npc-effects";
import type { RuntimeWorldStore } from "./runtime-world-adapter";
import { createNpcRelationshipRuntimeStore, withNpcRuntimeRelationships, type NpcRelationshipRuntimeStore } from "./npc-relationship-runtime-store";
import type { NpcRelationship } from "./npc-relationship-schema";
import { validateNpcRelationshipPolicy, type NpcRelationshipPolicyValidation } from "./npc-relationship-policy-schema";

export interface NpcRuntimeSocialDiagnostics {
  relationships: readonly NpcRelationship[];
  relationshipPolicyValidation: NpcRelationshipPolicyValidation;
  selectedBehavior?: {
    kind: string;
    targetNpcId?: string;
    priority: number;
  };
}

export interface NpcRuntimeTickResult {
  observation: RuntimeObservation;
  behavior: ReturnType<typeof createNpcBehaviorDecisionCandidates>[number] | undefined;
  socialDiagnostics: NpcRuntimeSocialDiagnostics;
  decision?: RuntimeDecision;
  execution?: Awaited<ReturnType<RuntimeAiPorts["action"]["execute"]>>;
  verification?: Awaited<ReturnType<RuntimeAiPorts["verification"]["verify"]>>;
  status: "idle" | "moved" | "rejected" | "replan-required" | "invalid";
}

function targetFromBehavior(behavior: ReturnType<typeof createNpcBehaviorDecisionCandidates>[number], observation: RuntimeObservation): NavigationPoint | undefined {
  const targetLocation = behavior.action.payload.targetLocation;
  if (targetLocation && typeof targetLocation === "object" && "mapId" in targetLocation && "x" in targetLocation && "y" in targetLocation) {
    const mapId = String((targetLocation as { mapId: unknown }).mapId);
    const x = Number((targetLocation as { x: unknown }).x);
    const y = Number((targetLocation as { y: unknown }).y);
    if (mapId === observation.perception?.self?.mapId && Number.isInteger(x) && Number.isInteger(y)) return { x, y };
  }
  const targetId = behavior.action.payload.targetEntityId;
  if (typeof targetId === "string") {
    const target = observation.perception?.nearbyEntities.find(entity => entity.id === targetId);
    if (target?.position) return target.position;
  }
  const position = behavior.action.payload.position;
  if (position && typeof position === "object" && "x" in position && "y" in position) {
    const x = Number((position as { x: unknown }).x);
    const y = Number((position as { y: unknown }).y);
    if (Number.isInteger(x) && Number.isInteger(y)) return { x, y };
  }
  return undefined;
}

function recoverInvestigationFailure(
  observation: RuntimeObservation,
  npcId: string,
  memoryStore: NpcBehaviorMemoryStore,
  failure: InvestigationFailure,
): void {
  const previous = memoryStore.get(npcId);
  if (!previous) return;
  if (investigationRecoveryAction(observation, failure) === "clear") {
    memoryStore.clear(npcId);
    return;
  }
  memoryStore.set({
    ...previous,
    lastFailure: failure,
    failureCount: (previous.failureCount ?? 0) + 1,
    updatedAtTick: observation.state.clock.tick,
    stateVersion: observation.state.stateVersion,
  });
}

export async function runNpcRuntimeTick(
  request: RuntimeAiRequest,
  ports: RuntimeAiPorts,
  world: RuntimeWorldStore,
  memoryStore?: NpcBehaviorMemoryStore,
  relationshipStore: NpcRelationshipRuntimeStore = createNpcRelationshipRuntimeStore(),
): Promise<NpcRuntimeTickResult> {
  const observed = await ports.observation.observe(request);
  const observedSelf = observed.perception?.self;
  if (observedSelf?.kind === "npc") {
    const profile = observedSelf.state?.decisionProfile;
    const relationships = profile && typeof profile === "object" && !Array.isArray(profile)
      ? (profile as Record<string, unknown>).relationships
      : undefined;
    if (Array.isArray(relationships) && !relationshipStore.get(observedSelf.id)) {
      relationshipStore.set(observedSelf.id, relationships as readonly NpcRelationship[]);
    }
  }
  const observation = withNpcRuntimeRelationships(observed, relationshipStore);
  const selfState = observation.perception?.self?.state;
  const profile = selfState?.decisionProfile;
  const profileRecord = profile && typeof profile === "object" && !Array.isArray(profile) ? profile as Record<string, unknown> : undefined;
  const relationships = Array.isArray(profileRecord?.relationships)
    ? profileRecord.relationships.filter((value): value is NpcRelationship => Boolean(value && typeof value === "object" && !Array.isArray(value)))
    : [];
  const relationshipPolicyValidation = validateNpcRelationshipPolicy(profileRecord?.relationshipPolicy);
  const emptySocialDiagnostics: NpcRuntimeSocialDiagnostics = { relationships, relationshipPolicyValidation };
  if (observation.perception?.self?.kind !== "npc") return { observation, behavior: undefined, socialDiagnostics: emptySocialDiagnostics, status: "invalid" };
  let activeGoal: { kind: import("../domain/runtime-behavior").RuntimeBehaviorKind; priority: number; reason: string; targetLocation?: { mapId: string; x: number; y: number }; targetEventId?: string } | undefined;
  try {
    const goalDecision = decideNpcGoal(request, observation, { hunger: 0, energy: 0, social: 0, safety: 100 });
    const goalAction = goalDecision.actions[0];
    const goalKind = typeof goalAction?.payload.goal === "string" ? goalAction.payload.goal : undefined;
    activeGoal = goalKind ? { kind: goalKind as import("../domain/runtime-behavior").RuntimeBehaviorKind, priority: Number(goalAction.payload.priority) || 0, reason: goalAction.reason, targetLocation: goalAction.payload.targetLocation as { mapId: string; x: number; y: number } | undefined, targetEventId: typeof goalAction.payload.targetEventId === "string" ? goalAction.payload.targetEventId : undefined } : undefined;
  } catch {
    activeGoal = undefined;
  }
  const candidates = createNpcBehaviorDecisionCandidates(observation, memoryStore?.get(observation.perception.self.id), activeGoal);
  if (!candidates.length) return { observation, behavior: undefined, socialDiagnostics: emptySocialDiagnostics, status: "invalid" };

  const behaviorDecision = decideNpcBehavior(request, observation, undefined, memoryStore, activeGoal);
  const behavior = candidates.find(candidate => candidate.action.id === behaviorDecision.actions[0]?.id)
    ?? (behaviorDecision.actions[0]?.type === "npc.investigate"
      ? {
          kind: "investigate" as const,
          priority: 0,
          reason: behaviorDecision.actions[0]?.reason ?? "Investigate the last known target position.",
          action: behaviorDecision.actions[0],
        }
      : undefined);
  if (!behavior) return { observation, behavior: undefined, socialDiagnostics: emptySocialDiagnostics, status: "invalid" };
  const socialDiagnostics: NpcRuntimeSocialDiagnostics = {
    relationships,
    relationshipPolicyValidation,
    selectedBehavior: {
      kind: behavior.kind,
      ...(typeof behavior.action.payload.targetEntityId === "string" ? { targetNpcId: behavior.action.payload.targetEntityId } : {}),
      priority: behavior.priority,
    },
  };
  const goal = targetFromBehavior(behavior, observation);
  if (!goal) {
    const decision = createRuntimeDecision(request, observation, {
      actions: [behavior.action],
      evidence: observation.facts,
      expiresAtTick: observation.state.clock.tick + 1,
    });
    const validation = validateRuntimeDecision(decision, observation);
    return { observation, behavior, socialDiagnostics, decision, status: validation.ok ? "idle" : "invalid" };
  }

  const self = observation.perception?.self;
  if (!self) return { observation, behavior, socialDiagnostics, status: "invalid" };
  const grid = world.grid(self.mapId);
  if (!grid) return { observation, behavior, socialDiagnostics, status: "rejected" };

  const navigationDecision = decideNpcNavigation(request, observation, grid, goal);
  if (!navigationDecision) {
    if (behavior.kind === "investigate" && memoryStore) {
      recoverInvestigationFailure(observation, self.id, memoryStore, "navigation");
    }
    return { observation, behavior, socialDiagnostics, status: "replan-required" };
  }
  const validation = validateRuntimeDecision(navigationDecision, observation);
  if (!validation.ok) return { observation, behavior, socialDiagnostics, decision: navigationDecision, status: "invalid" };

  const action = navigationDecision.actions[0];
  const execution = await ports.action.execute(action, observation);
  const verification = await ports.verification.verify(action, execution);
  if (behavior.kind === "investigate" && memoryStore) {
    if (!execution.ok) {
      recoverInvestigationFailure(observation, self.id, memoryStore, "execution");
    } else if (!verification.ok) {
      recoverInvestigationFailure(observation, self.id, memoryStore, "verification");
    } else if (world.snapshot().entities.find(entity => entity.id === self.id)?.position?.x === goal.x && world.snapshot().entities.find(entity => entity.id === self.id)?.position?.y === goal.y) {
      memoryStore.clear(self.id);
    }
  }
  return {
    observation,
    behavior,
    socialDiagnostics,
    decision: navigationDecision,
    execution,
    verification,
    status: !execution.ok || !verification.ok ? "rejected" : "moved",
  };
}
