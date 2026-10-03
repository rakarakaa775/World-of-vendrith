import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import { createNpcBehaviorRuntimeStateStore, type NpcBehaviorMemoryStore, type NpcBehaviorRuntimeStateStore } from "../domain/runtime-behavior";
import { interruptNpcBehavior, recoverNpcBehavior, syncNpcBehaviorRuntimeState } from "./npc-behavior-runtime";
import type { RuntimeGoalKind } from "../domain/runtime-goal";
import { createNpcNeedsStore, resolveNpcNeedsState, type NpcNeedsStore } from "../domain/runtime-npc-needs";
import { createNpcActivityEffectStore, type NpcActivityEffectStore, type NpcActivityEffectResult } from "../domain/runtime-npc-activity-effects";
import { applyVerifiedNpcActivityEffect } from "./npc-activity-effects";
import { createNpcDailyLifeStateStore, resolveNpcDailyLifeState, syncNpcDailyLifeWithBehavior, type NpcDailyLifeStateStore } from "../domain/runtime-daily-life";
import { createNpcGoalMemoryStore, type NpcGoalMemoryStore } from "../domain/runtime-goal";
import { createNpcRelationshipMemoryStore, type NpcRelationshipMemoryStore } from "./npc-social-interaction-schema";
import type { NavigationPoint } from "../domain/runtime-navigation";
import type { RuntimeAiPorts } from "../ports/runtime";
import { validateRuntimeDecision } from "../policies/runtime-policy";
import { createNpcBehaviorDecisionCandidates, decideNpcBehavior } from "./npc-behavior";
import { decideNpcGoal } from "./npc-goals";
import { createRuntimeDecision } from "./runtime-decision";
import { applyDynamicNavigationObstacles, decideNpcNavigation } from "./npc-navigation";
import { investigationRecoveryAction, type InvestigationFailure } from "./environment-npc-effects";
import type { RuntimeWorldStore } from "./runtime-world-adapter";
import { createNpcRelationshipRuntimeStore, withNpcRuntimeRelationships, type NpcRelationshipRuntimeStore } from "./npc-relationship-runtime-store";
import type { NpcRelationship } from "./npc-relationship-schema";
import { validateNpcRelationshipPolicy, type NpcRelationshipPolicyValidation } from "./npc-relationship-policy-schema";
import { npcActivityRecoveryStrategyFromConditions } from "./npc-environment-policy-runtime";
import {
  chooseNpcSocialResponse,
  applyNpcReputationInteraction,
  createNpcReputationStore,
  createNpcSocialMemoryStore,
  recordNpcSocialMemory,
  updateNpcRelationshipFromResponse,
} from "./npc-social-intelligence";
import type { NpcSocialInteractionType } from "./npc-social-interaction-schema";

export interface NpcRuntimeSocialDiagnostics {
  relationships: readonly NpcRelationship[];
  relationshipPolicyValidation: NpcRelationshipPolicyValidation;
  selectedBehavior?: {
    kind: string;
    targetNpcId?: string;
    priority: number;
  };
}

// Default AI stores are process-lifetime runtime state. Production persistence must inject durable stores at the runtime boundary.
const defaultNpcDailyLifeStateStore = createNpcDailyLifeStateStore();
const defaultNpcGoalMemoryStore = createNpcGoalMemoryStore();
const defaultNpcNeedsStore = createNpcNeedsStore();
const defaultNpcActivityEffectStore = createNpcActivityEffectStore();
const defaultNpcBehaviorRuntimeStore = createNpcBehaviorRuntimeStateStore();
const defaultNpcRelationshipMemoryStore = createNpcRelationshipMemoryStore();
const defaultNpcSocialMemoryStore = createNpcSocialMemoryStore();
const defaultNpcReputationStore = createNpcReputationStore();

export interface NpcRuntimeTickResult {
  observation: RuntimeObservation;
  behavior: ReturnType<typeof createNpcBehaviorDecisionCandidates>[number] | undefined;
  socialDiagnostics: NpcRuntimeSocialDiagnostics;
  dailyLife?: import("../domain/runtime-daily-life").NpcDailyLifeState;
  needs?: import("../domain/runtime-goal").NpcNeedState;
  decision?: RuntimeDecision;
  execution?: Awaited<ReturnType<RuntimeAiPorts["action"]["execute"]>>;
  verification?: Awaited<ReturnType<RuntimeAiPorts["verification"]["verify"]>>;
  activityEffect?: NpcActivityEffectResult;
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
    if (target?.position) {
      if (behavior.kind !== "follow-player") return target.position;
      const followDistance = typeof behavior.action.payload.followDistance === "number"
        ? Math.max(1, Math.floor(behavior.action.payload.followDistance))
        : 2;
      const dx = observation.perception?.self?.position.x ?? target.position.x;
      const dy = observation.perception?.self?.position.y ?? target.position.y;
      const offsetX = dx === target.position.x ? followDistance : (dx > target.position.x ? followDistance : -followDistance);
      const offsetY = dx === target.position.x ? 0 : 0;
      return { x: target.position.x + offsetX, y: target.position.y + offsetY };
    }
  }
  const position = behavior.action.payload.position;
  if (position && typeof position === "object" && "x" in position && "y" in position) {
    const x = Number((position as { x: unknown }).x);
    const y = Number((position as { y: unknown }).y);
    if (Number.isInteger(x) && Number.isInteger(y)) return { x, y };
  }
  return undefined;
}

function resolveNavigationGoal(
  observation: RuntimeObservation,
  world: RuntimeWorldStore,
  behavior: ReturnType<typeof createNpcBehaviorDecisionCandidates>[number],
  preferred: NavigationPoint,
  ignoredEntityIds: readonly string[] = [],
): NavigationPoint {
  const self = observation.perception?.self;
  const grid = self ? world.grid(self.mapId) : undefined;
  if (!self || !grid) return preferred;
  const dynamicGrid = applyDynamicNavigationObstacles(
    grid,
    (observation.perception?.nearbyEntities ?? []).map(entity => ({
      entityId: entity.id,
      mapId: entity.mapId,
      position: entity.position,
      blocksMovement: entity.state?.blocksMovement !== false,
    })),
    self.id,
    self.mapId,
    ignoredEntityIds,
  );
  const isOpen = (point: NavigationPoint) =>
    point.x >= 0 && point.y >= 0 && point.x < grid.width && point.y < grid.height
    && !dynamicGrid.blocked[point.y * grid.width + point.x];
  if (isOpen(preferred)) return preferred;
  const candidates = [
    { x: self.position.x, y: self.position.y - 1 },
    { x: self.position.x + 1, y: self.position.y },
    { x: self.position.x, y: self.position.y + 1 },
    { x: self.position.x - 1, y: self.position.y },
  ].filter(isOpen);
  if (!candidates.length) return self.position;
  const threatId = typeof behavior.action.payload.threatEntityId === "string"
    ? behavior.action.payload.threatEntityId
    : undefined;
  const threat = threatId ? observation.perception?.nearbyEntities.find(entity => entity.id === threatId) : undefined;
  if (behavior.kind === "flee" && threat) {
    return [...candidates].sort((a, b) =>
      (Math.abs(b.x - threat.position.x) + Math.abs(b.y - threat.position.y))
      - (Math.abs(a.x - threat.position.x) + Math.abs(a.y - threat.position.y))
      || a.y - b.y || a.x - b.x,
    )[0];
  }
  if (behavior.kind === "follow-player") {
    return [...candidates].sort((a, b) =>
      (Math.abs(a.x - preferred.x) + Math.abs(a.y - preferred.y))
      - (Math.abs(b.x - preferred.x) + Math.abs(b.y - preferred.y))
      || a.y - b.y || a.x - b.x,
    )[0];
  }
  return candidates[0];
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
  dailyLifeStore: NpcDailyLifeStateStore = defaultNpcDailyLifeStateStore,
  needsStore: NpcNeedsStore = defaultNpcNeedsStore,
  activityEffectStore: NpcActivityEffectStore = defaultNpcActivityEffectStore,
  goalMemoryStore: NpcGoalMemoryStore = defaultNpcGoalMemoryStore,
  behaviorRuntimeStore: NpcBehaviorRuntimeStateStore = defaultNpcBehaviorRuntimeStore,
  relationshipMemoryStore: NpcRelationshipMemoryStore = defaultNpcRelationshipMemoryStore,
  socialMemoryStore = defaultNpcSocialMemoryStore,
  reputationStore = defaultNpcReputationStore,
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
  const needsState = resolveNpcNeedsState(observation, needsStore);
  const needs = needsState?.needs;
  let activeGoal: {
    kind: RuntimeGoalKind;
    priority: number;
    reason: string;
    targetLocation?: { mapId: string; x: number; y: number };
    targetEventId?: string;
    targetNpcId?: string;
    socialInteractionType?: "conversation" | "help" | "trade" | "conflict" | "custom";
    locationRole?: import("../domain/runtime-schedule").NpcDailyLifeLocationRole;
    dailyLifeActivity?: import("../domain/runtime-schedule").NpcDailyLifeActivity;
  } | undefined;
  try {
    const goalDecision = decideNpcGoal(request, observation, needs, undefined, goalMemoryStore, relationshipMemoryStore);
    const goalAction = goalDecision.actions[0];
    const goalKind = typeof goalAction?.payload.goal === "string" ? goalAction.payload.goal : undefined;
    activeGoal = goalKind ? {
      kind: goalKind as RuntimeGoalKind,
      priority: Number(goalAction.payload.priority) || 0,
      reason: goalAction.reason,
      targetLocation: goalAction.payload.targetLocation as { mapId: string; x: number; y: number } | undefined,
      targetEventId: typeof goalAction.payload.targetEventId === "string" ? goalAction.payload.targetEventId : undefined,
      targetNpcId: typeof goalAction.payload.targetNpcId === "string" ? goalAction.payload.targetNpcId : undefined,
      socialInteractionType: typeof goalAction.payload.socialInteractionType === "string" ? goalAction.payload.socialInteractionType as "conversation" | "help" | "trade" | "conflict" | "custom" : undefined,
      locationRole: typeof goalAction.payload.locationRole === "string" ? goalAction.payload.locationRole as import("../domain/runtime-schedule").NpcDailyLifeLocationRole : undefined,
      dailyLifeActivity: typeof goalAction.payload.dailyLifeActivity === "string" ? goalAction.payload.dailyLifeActivity as import("../domain/runtime-schedule").NpcDailyLifeActivity : undefined,
    } : undefined;
  } catch {
    activeGoal = undefined;
  }
  const dailyLife = resolveNpcDailyLifeState(
    observation,
    activeGoal
      ? {
          kind: activeGoal.kind,
          targetLocation: activeGoal.targetLocation,
          locationRole: activeGoal.locationRole,
          activity: activeGoal.dailyLifeActivity,
        }
      : undefined,
    dailyLifeStore.get(observation.perception.self.id),
  );
  if (dailyLife) dailyLifeStore.set(dailyLife);
  const behaviorMemory = memoryStore?.get(observation.perception.self.id);
  const visibleTargetIds = new Set((observation.perception.detections ?? []).filter(detection => detection.channels.includes("visibility")).map(detection => detection.entityId));
  const behaviorMemoryTargetEntityId = behaviorMemory?.targetEntityId;
  const recoveringInvestigation = behaviorMemory?.lastBehavior === "investigate"
    && (behaviorMemory.lastSeenTick === undefined || observation.state.clock.tick - behaviorMemory.lastSeenTick <= 20)
    && typeof behaviorMemoryTargetEntityId === "string"
    && !visibleTargetIds.has(behaviorMemoryTargetEntityId);
  const behaviorGoal = recoveringInvestigation ? undefined : activeGoal;
  const candidates = createNpcBehaviorDecisionCandidates(observation, behaviorMemory, behaviorGoal);
  if (!candidates.length) return { observation, behavior: undefined, socialDiagnostics: emptySocialDiagnostics, dailyLife, needs, status: "invalid" };

  const behaviorDecision = decideNpcBehavior(request, observation, undefined, memoryStore, behaviorGoal);
  const behavior = candidates.find(candidate => candidate.action.id === behaviorDecision.actions[0]?.id)
    ?? (behaviorDecision.actions[0]?.type === "npc.investigate"
      ? {
          kind: "investigate" as const,
          priority: 0,
          reason: behaviorDecision.actions[0]?.reason ?? "Investigate the last known target position.",
          action: behaviorDecision.actions[0],
        }
      : undefined);
  if (!behavior) return { observation, behavior: undefined, socialDiagnostics: emptySocialDiagnostics, needs, status: "invalid" };
  const socialDiagnostics: NpcRuntimeSocialDiagnostics = {
    relationships,
    relationshipPolicyValidation,
    selectedBehavior: {
      kind: behavior.kind,
      ...(typeof behavior.action.payload.targetEntityId === "string" ? { targetNpcId: behavior.action.payload.targetEntityId } : {}),
      priority: behavior.priority,
    },
  };
  const previousBehaviorRuntime = behaviorRuntimeStore.get(observation.perception.self.id);
  if (previousBehaviorRuntime?.activeBehavior && previousBehaviorRuntime.activeBehavior !== behavior.kind && previousBehaviorRuntime.status === "running") {
    behaviorRuntimeStore.set(interruptNpcBehavior(previousBehaviorRuntime, observation.state.clock.tick));
  } else if (previousBehaviorRuntime?.status === "failed") {
    behaviorRuntimeStore.set(recoverNpcBehavior(previousBehaviorRuntime, observation.state.clock.tick));
  }
  const syncDailyLifeBehaviorState = (state: typeof dailyLife, runtimeState: ReturnType<typeof syncNpcBehaviorRuntimeState>) => {
    const synced = syncNpcDailyLifeWithBehavior(state, behavior.kind, runtimeState.status, observation.state.clock.tick);
    if (synced) dailyLifeStore.set(synced);
    return synced;
  };
  const rawGoal = targetFromBehavior(behavior, observation);
  const isActivityBehavior = behavior.kind === "work" || behavior.kind === "eat" || behavior.kind === "sleep"
    || behavior.kind === "routine" || behavior.kind === "free-time" || behavior.kind === "rest"
    || behavior.kind === "recreation" || behavior.kind === "social";
  const isMovementBehavior = behavior.kind === "follow-player"
    || behavior.kind === "wander"
    || behavior.kind === "investigate"
    || behavior.kind === "flee"
    || behavior.kind === "go-to-location"
    || behavior.kind === "respond-to-event";
  if (!rawGoal && !isActivityBehavior && !isMovementBehavior) {
    const decision = createRuntimeDecision(request, observation, {
      actions: [behavior.action],
      evidence: observation.facts,
      expiresAtTick: observation.state.clock.tick + 1,
    });
    const validation = validateRuntimeDecision(decision, observation);
    const runtimeState = syncNpcBehaviorRuntimeState(behaviorRuntimeStore, observation.perception.self.id, behavior.kind, observation.state.clock.tick, validation.ok, validation.ok);
    const syncedDailyLife = syncDailyLifeBehaviorState(dailyLife, runtimeState);
    return { observation, behavior, socialDiagnostics, dailyLife: syncedDailyLife, needs, decision, status: validation.ok ? "idle" : "invalid" };
  }

  const self = observation.perception?.self;
  if (!self) return { observation, behavior, socialDiagnostics, needs, status: "invalid" };

  const isActivity = behavior.kind === "work" || behavior.kind === "eat" || behavior.kind === "sleep" || behavior.kind === "socialize"
    || behavior.kind === "routine" || behavior.kind === "free-time" || behavior.kind === "rest"
    || behavior.kind === "recreation" || behavior.kind === "social";
  const activityGoal = typeof behavior.action.payload.goal === "string" ? behavior.action.payload.goal as RuntimeGoalKind : behavior.kind as RuntimeGoalKind;
  const activityKind = typeof behavior.action.payload.dailyLifeActivity === "string" ? behavior.action.payload.dailyLifeActivity : behavior.kind;
  const previousActivity = self.state?.npcActivity;
  const previousActivityRecord = previousActivity && typeof previousActivity === "object" && !Array.isArray(previousActivity)
    ? previousActivity as Record<string, unknown>
    : undefined;
  const previousActivityGoal = typeof previousActivityRecord?.goal === "string" ? previousActivityRecord.goal : undefined;
  const previousActivityStatus = previousActivityRecord?.status;
  const shouldInterruptActivity = Boolean(
    previousActivityGoal &&
    previousActivityGoal !== activityGoal &&
    (previousActivityStatus === "started" || previousActivityStatus === "running"),
  );
  if (shouldInterruptActivity) {
    const previousGoal = previousActivityGoal as RuntimeGoalKind;
    const recoveryStrategy = npcActivityRecoveryStrategyFromConditions(
      observation.state.environmentConditions,
      previousGoal,
    );
    const nextStatus = recoveryStrategy === "abandon" || recoveryStrategy === "switch" ? "abandoned" : "interrupted";
    world.updateEntity({
      ...self,
      state: {
        ...(self.state ?? {}),
        npcActivity: {
          ...previousActivityRecord,
          status: nextStatus,
          updatedAtTick: observation.state.clock.tick,
          ...(recoveryStrategy === "restart" ? { recoveryStrategy: "restart" } : {}),
        },
      },
    });
  }
  const ignoredNavigationEntityIds = typeof behavior.action.payload.targetEntityId === "string"
    ? [behavior.action.payload.targetEntityId]
    : [];
  const goal = rawGoal && isMovementBehavior
    ? resolveNavigationGoal(observation, world, behavior, rawGoal, ignoredNavigationEntityIds)
    : rawGoal;
  const atActivityTarget = goal
    ? self.position.x === goal.x && self.position.y === goal.y
    : true;

  if (isActivity && atActivityTarget) {
    const previousActivity = self.state?.npcActivity;
    const previousActivityRecord = previousActivity && typeof previousActivity === "object" && !Array.isArray(previousActivity)
      ? previousActivity as Record<string, unknown>
      : undefined;
    const recoveryStrategy = npcActivityRecoveryStrategyFromConditions(
      observation.state.environmentConditions,
      activityGoal,
    );
    if (previousActivityRecord?.goal === activityGoal
      && previousActivityRecord?.activityKind === activityKind
      && previousActivityRecord?.status === "interrupted"
      && (recoveryStrategy === "abandon" || recoveryStrategy === "switch")) {
      world.updateEntity({
        ...self,
        state: {
          ...(self.state ?? {}),
          npcActivity: {
            ...previousActivityRecord,
            status: "abandoned",
            updatedAtTick: observation.state.clock.tick,
          },
        },
      });
      return { observation, behavior, socialDiagnostics, dailyLife, needs, status: "idle" };
    }
    const continuingActivity = previousActivityRecord?.goal === activityGoal
      && previousActivityRecord?.activityKind === activityKind
      && (previousActivityRecord?.status === "started" || previousActivityRecord?.status === "running" || previousActivityRecord?.status === "interrupted")
      && typeof previousActivityRecord?.actionId === "string";
    const activityId = continuingActivity
      ? String(previousActivityRecord?.actionId)
      : behavior.action.id + ":activity";
    const activityAction = {
      ...behavior.action,
      id: activityId,
      type: "npc.activity",
      payload: {
        ...behavior.action.payload,
        entityId: self.id,
        goal: activityGoal,
        activityKind,
      },
      risk: "game-rule" as const,
    };
    const activityDecision = createRuntimeDecision(request, observation, {
      actions: [activityAction],
      evidence: observation.facts,
      expiresAtTick: observation.state.clock.tick + 1,
    });
    const activityValidation = validateRuntimeDecision(activityDecision, observation);
    if (!activityValidation.ok) {
      return { observation, behavior, socialDiagnostics, dailyLife, needs, decision: activityDecision, status: "invalid" };
    }

    const execution = await ports.action.execute(activityAction, observation);
    const verification = await ports.verification.verify(activityAction, execution);
    const activityCompleted = execution.detail === "NPC activity completed.";
    const activityInProgress = execution.ok && execution.detail === "NPC activity is running.";
    const activityEffect = applyVerifiedNpcActivityEffect(
      activityAction,
      observation,
      execution.ok,
      verification.ok,
      activityCompleted,
      needsStore,
      activityEffectStore,
    );
    if (activityGoal === "socialize" && activityCompleted && execution.ok && verification.ok) {
      const socialPayload = activityAction.payload as Record<string, unknown>;
      const targetNpcId = typeof socialPayload.targetNpcId === "string" ? socialPayload.targetNpcId : undefined;
      const interactionType = typeof socialPayload.socialInteractionType === "string"
        ? socialPayload.socialInteractionType as NpcSocialInteractionType
        : "conversation" as NpcSocialInteractionType;
      const targetRelationship = targetNpcId ? relationships.find(relationship => relationship.targetNpcId === targetNpcId) : undefined;
      if (targetNpcId && !socialMemoryStore.list(self.id, targetNpcId).some(memory => memory.interactionId === activityAction.id)) {
        const sourceReputation = reputationStore.get(self.id);
        const response = chooseNpcSocialResponse(interactionType, targetRelationship, sourceReputation?.score);
        const interaction = {
          interactionId: activityAction.id,
          sourceNpcId: self.id,
          targetNpcId,
          type: interactionType,
          affinityDelta: response.affinityDelta,
          trustDelta: response.trustDelta,
          tick: observation.state.clock.tick,
        };
        relationshipStore.applyInteraction(interaction);
        if (targetRelationship) {
          const evolved = updateNpcRelationshipFromResponse(targetRelationship, response);
          relationshipStore.set(
            self.id,
            relationships.map(relationship =>
              relationship.targetNpcId === targetNpcId ? evolved : relationship,
            ),
          );
        }
        recordNpcSocialMemory(socialMemoryStore, interaction, response);
        reputationStore.set(applyNpcReputationInteraction(reputationStore.get(self.id), self.id, response, observation.state.clock.tick));
      }
    }
    const finalNeeds = activityEffect.needs ?? needs;
    const activityAccepted = execution.ok && (verification.ok || activityInProgress);
    const finalDailyLife = dailyLife && activityAccepted && atActivityTarget
      ? { ...dailyLife, phase: "active" as const, updatedAtTick: observation.state.clock.tick }
      : dailyLife;
    if (finalDailyLife) dailyLifeStore.set(finalDailyLife);

    const runtimeState = syncNpcBehaviorRuntimeState(
      behaviorRuntimeStore,
      self.id,
      behavior.kind,
      observation.state.clock.tick,
      execution.ok,
      verification.ok,
      execution.ok && !activityCompleted,
    );
    const syncedDailyLife = syncDailyLifeBehaviorState(finalDailyLife, runtimeState);
    return {
      observation,
      behavior,
      socialDiagnostics,
      dailyLife: syncedDailyLife,
      decision: activityDecision,
      execution,
      verification,
      activityEffect,
      needs: finalNeeds,
      status: !execution.ok || (!verification.ok && !activityInProgress) ? "rejected" : "moved",
    };
  }

  if (!goal) return { observation, behavior, socialDiagnostics, needs, status: "invalid" };

  const grid = world.grid(self.mapId);
  if (!grid) {
    syncNpcBehaviorRuntimeState(behaviorRuntimeStore, self.id, behavior.kind, observation.state.clock.tick, false, false);
    return { observation, behavior, socialDiagnostics, needs, status: "rejected" };
  }

  const navigationTargetEntityId = typeof behavior.action.payload.targetEntityId === "string"
    ? behavior.action.payload.targetEntityId
    : undefined;
  const navigationDecision = decideNpcNavigation(
    request,
    observation,
    grid,
    goal,
    navigationTargetEntityId ? [navigationTargetEntityId] : [],
  );
  if (!navigationDecision) {
    syncNpcBehaviorRuntimeState(behaviorRuntimeStore, self.id, behavior.kind, observation.state.clock.tick, false, false);
    if (behavior.kind === "investigate" && memoryStore) {
      recoverInvestigationFailure(observation, self.id, memoryStore, "navigation");
    }
    return { observation, behavior, socialDiagnostics, needs, status: "replan-required" };
  }
  const validation = validateRuntimeDecision(navigationDecision, observation);
  if (!validation.ok) {
    syncNpcBehaviorRuntimeState(behaviorRuntimeStore, self.id, behavior.kind, observation.state.clock.tick, false, false);
    return { observation, behavior, socialDiagnostics, needs, decision: navigationDecision, status: "invalid" };
  }

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
  const activityEffect = applyVerifiedNpcActivityEffect(
    action,
    observation,
    execution.ok,
    verification.ok,
    false,
    needsStore,
    activityEffectStore,
  );
  const finalNeeds = activityEffect.needs ?? needs;
  const finalPosition = world.snapshot().entities.find(entity => entity.id === self.id)?.position;
  const arrivedAtDailyLifeTarget = Boolean(
    dailyLife?.targetLocation &&
    finalPosition &&
    finalPosition.x === dailyLife.targetLocation.x &&
    finalPosition.y === dailyLife.targetLocation.y,
  );
  const finalDailyLife = dailyLife && execution.ok && verification.ok && arrivedAtDailyLifeTarget
    ? { ...dailyLife, phase: "active" as const, updatedAtTick: observation.state.clock.tick }
    : dailyLife;
  if (finalDailyLife) dailyLifeStore.set(finalDailyLife);
  const runtimeState = syncNpcBehaviorRuntimeState(behaviorRuntimeStore, self.id, behavior.kind, observation.state.clock.tick, execution.ok, verification.ok);
  const syncedDailyLife = syncDailyLifeBehaviorState(finalDailyLife, runtimeState);
  return {
    observation,
    behavior,
    socialDiagnostics,
    dailyLife: syncedDailyLife,
    decision: navigationDecision,
    execution,
    verification,
    activityEffect,
    needs: finalNeeds,
    status: !execution.ok || !verification.ok ? "rejected" : "moved",
  };
}
