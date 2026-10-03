import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { RuntimeBehaviorCandidate, RuntimeBehaviorDecision, RuntimeBehaviorPolicy, NpcBehaviorMemory, NpcBehaviorMemoryStore, RuntimeBehaviorKind } from "../domain/runtime-behavior";
import { createRuntimeDecision } from "./runtime-decision";
import { applyEnvironmentNpcBehavior, applyEnvironmentNpcDetectionBehavior, applyNpcPersonalityBehavior, applyNpcRelationshipBehavior } from "./environment-npc-effects";
import { enforceNpcDecisionProfileBehaviors } from "./npc-decision-enforcement";

const NPC_INVESTIGATION_MEMORY_TICKS = 20;
const BEHAVIOR_TIE_ORDER: Record<RuntimeBehaviorKind, number> = {
  "respond-to-event": 0,
  flee: 1,
  sleep: 2,
  eat: 3,
  work: 4,
  socialize: 5,
  "go-to-location": 6,
  "follow-player": 7,
  investigate: 8,
  routine: 9,
  "free-time": 10,
  rest: 11,
  recreation: 12,
  social: 13,
  wander: 14,
  idle: 15,
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function deterministicNpcSeed(npcId: string): number {
  let hash = 0;
  for (let index = 0; index < npcId.length; index += 1) {
    hash = (hash * 31 + npcId.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function deterministicWanderTarget(
  position: { x: number; y: number },
  tick: number,
  npcId = "npc",
): { x: number; y: number } {
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  const seed = deterministicNpcSeed(npcId);
  const direction = directions[(Math.abs(tick) + seed) % directions.length];
  return { x: position.x + direction.x, y: position.y + direction.y };
}

export const defaultNpcBehaviorPolicy: RuntimeBehaviorPolicy = {
  choose(_observation, candidates): RuntimeBehaviorDecision {
    if (candidates.length === 0) throw new Error("NPC behavior requires at least one candidate.");
    const selected = [...candidates].sort((a, b) =>
      b.priority - a.priority
      || BEHAVIOR_TIE_ORDER[a.kind] - BEHAVIOR_TIE_ORDER[b.kind]
      || a.kind.localeCompare(b.kind)
      || a.action.id.localeCompare(b.action.id),
    )[0];
    return { behavior: selected.kind, reason: selected.reason, action: selected.action };
  },
};

export function createNpcBehaviorCandidates(
  observation: RuntimeObservation,
  memory?: NpcBehaviorMemory,
  activeGoal?: { kind: RuntimeBehaviorKind; priority: number; reason: string; targetLocation?: { mapId: string; x: number; y: number }; targetEventId?: string; targetNpcId?: string; socialInteractionType?: "conversation" | "help" | "trade" | "conflict" | "custom"; dailyLifeActivity?: "work" | "routine" | "free-time" | "rest" | "recreation" | "social"; locationRole?: "workplace" | "home" | "free-time" | "recreation" | "social" },
): RuntimeBehaviorCandidate[] {
  const self = observation.perception?.self;
  if (!self || self.kind !== "npc") return [];
  const candidates: RuntimeBehaviorCandidate[] = [];
  if (activeGoal) {
    const genericDailyLifeActivities = new Set(["work", "routine", "free-time", "rest", "recreation", "social"] as const);
    const target = activeGoal.targetLocation;
    const atScheduledLocation = Boolean(target && self.mapId === target.mapId && self.position.x === target.x && self.position.y === target.y);
    const dailyLifeBehavior = activeGoal.kind === "go-to-location" && atScheduledLocation && activeGoal.dailyLifeActivity && genericDailyLifeActivities.has(activeGoal.dailyLifeActivity)
      ? activeGoal.dailyLifeActivity
      : activeGoal.kind;
    candidates.push({
      kind: dailyLifeBehavior,
      priority: activeGoal.priority,
      reason: activeGoal.reason,
      action: {
        id: observation.id + ":goal:" + activeGoal.kind,
        intelligence: "npc",
        type: "npc." + dailyLifeBehavior,
        payload: {
          goal: activeGoal.kind,
          ...(activeGoal.dailyLifeActivity ? { dailyLifeActivity: activeGoal.dailyLifeActivity } : {}),
          ...(activeGoal.locationRole ? { locationRole: activeGoal.locationRole } : {}),
          ...((activeGoal.kind === "work" || activeGoal.kind === "eat" || activeGoal.kind === "sleep") ? { activityKind: activeGoal.kind } : {}),
          ...(activeGoal.targetLocation ? { targetLocation: activeGoal.targetLocation } : {}),
          ...(activeGoal.targetEventId ? { targetEventId: activeGoal.targetEventId } : {}),
          ...(activeGoal.targetNpcId ? { targetNpcId: activeGoal.targetNpcId, targetEntityId: activeGoal.targetNpcId } : {}),
          ...(activeGoal.socialInteractionType ? { socialInteractionType: activeGoal.socialInteractionType } : {}),
        },
        risk: "safe",
        reason: activeGoal.reason,
      },
    });
  } else {
    const self = observation.perception?.self;
    const wanderTarget = self && self.kind === "npc"
      ? deterministicWanderTarget(self.position, observation.state.clock.tick, self.id)
      : undefined;
    if (wanderTarget) {
      candidates.push({
        kind: "wander",
        priority: 5,
        reason: "No active goal requires action; deterministic wandering provides low-priority free movement.",
        action: {
          id: observation.id + ":wander:" + wanderTarget.x + ":" + wanderTarget.y,
          intelligence: "npc",
          type: "npc.wander",
          payload: { position: wanderTarget },
          risk: "safe",
          reason: "Wander one deterministic step from the current position.",
        },
      });
    }
    candidates.push({
      kind: "idle",
      priority: 0,
      reason: "No movement target is available; remain idle.",
      action: {
        id: observation.id + ":idle",
        intelligence: "npc",
        type: "npc.idle",
        payload: {},
        risk: "safe",
        reason: "Remain idle when no movement target is available.",
      },
    });
  }
  const visibleEntityIds = new Set(
    (observation.perception?.detections ?? [])
      .filter(detection => detection.channels.includes("visibility"))
      .map(detection => detection.entityId),
  );
  const relationships = self.state?.decisionProfile && typeof self.state.decisionProfile === "object" && !Array.isArray(self.state.decisionProfile)
    ? (self.state.decisionProfile as Record<string, unknown>).relationships
    : undefined;
  const enemyIds = new Set(
    Array.isArray(relationships)
      ? relationships
          .filter(value => value && typeof value === "object" && !Array.isArray(value))
          .filter(value => (value as Record<string, unknown>).type === "enemy")
          .map(value => (value as Record<string, unknown>).targetNpcId)
          .filter((value): value is string => typeof value === "string")
      : [],
  );
  const threat = observation.perception?.nearbyEntities
    .filter(entity => entity.kind === "npc" && enemyIds.has(entity.id) && visibleEntityIds.has(entity.id))
    .sort((a, b) => distance(self.position, a.position) - distance(self.position, b.position) || a.id.localeCompare(b.id))[0];
  if (threat) {
    const dx = self.position.x - threat.position.x;
    const dy = self.position.y - threat.position.y;
    const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const stepY = dy === 0 ? (stepX === 0 ? -1 : 0) : dy > 0 ? 1 : -1;
    const fleeDistance = 4;
    const escapePosition = {
      x: self.position.x + stepX * fleeDistance,
      y: self.position.y + stepY * fleeDistance,
    };
    const threatDistance = distance(self.position, threat.position);
    candidates.push({
      kind: "flee",
      priority: Math.max(50, 110 - threatDistance),
      reason: "A visible enemy is within threat range at Manhattan distance " + threatDistance + "; move away to an escape position.",
      action: {
        id: observation.id + ":flee:" + threat.id + ":" + escapePosition.x + ":" + escapePosition.y,
        intelligence: "npc",
        type: "npc.flee",
        payload: { threatEntityId: threat.id, position: escapePosition, fleeDistance },
        risk: "safe",
        reason: "Move away from the visible enemy toward a deterministic escape position.",
      },
    });
  }
  const player = observation.perception?.nearbyEntities.find(
    entity => entity.kind === "player" && visibleEntityIds.has(entity.id),
  );
  if (player) {
    const d = distance(self.position, player.position);
    const followDistance = 2;
    candidates.push({
      kind: "follow-player",
      priority: Math.max(1, 100 - d),
      reason: "A player is visible at Manhattan distance " + d + "; maintain follow distance " + followDistance + ".",
      action: {
        id: observation.id + ":follow-player",
        intelligence: "npc",
        type: "npc.follow",
        payload: { targetEntityId: player.id, followDistance },
        risk: "safe",
        reason: "Follow the visible player while maintaining Manhattan distance " + followDistance + ".",
      },
    });
  } else if (
    memory?.targetEntityId &&
    memory.lastKnownTargetPosition &&
    (memory.lastSeenTick === undefined || observation.state.clock.tick - memory.lastSeenTick <= NPC_INVESTIGATION_MEMORY_TICKS)
  ) {
    const age = memory.lastSeenTick === undefined ? 0 : observation.state.clock.tick - memory.lastSeenTick;
    candidates.push({
      kind: "investigate", priority: 10,
      reason: "The previously observed target is no longer visible; investigate its last known position (memory age " + age + " ticks).",
      action: {
        id: observation.id + ":investigate:" + memory.targetEntityId + ":" + memory.lastKnownTargetPosition.x + ":" + memory.lastKnownTargetPosition.y,
        intelligence: "npc",
        type: "npc.investigate",
        payload: {
          targetEntityId: memory.targetEntityId,
          position: memory.lastKnownTargetPosition,
          memoryAgeTicks: age,
          maxMemoryTicks: NPC_INVESTIGATION_MEMORY_TICKS,
        },
        risk: "safe",
        reason: "Investigate the last known position before the observation memory expires.",
      },
    });
  }
  return candidates;
}

export function createNpcBehaviorDecisionCandidates(
  observation: RuntimeObservation,
  memory?: NpcBehaviorMemory,
  activeGoal?: { kind: RuntimeBehaviorKind; priority: number; reason: string; targetLocation?: { mapId: string; x: number; y: number }; targetEventId?: string; targetNpcId?: string; socialInteractionType?: "conversation" | "help" | "trade" | "conflict" | "custom"; dailyLifeActivity?: "work" | "routine" | "free-time" | "rest" | "recreation" | "social"; locationRole?: "workplace" | "home" | "free-time" | "recreation" | "social" },
): RuntimeBehaviorCandidate[] {
  return enforceNpcDecisionProfileBehaviors(
    observation,
    applyNpcRelationshipBehavior(
      observation,
      applyNpcPersonalityBehavior(
        observation,
        applyEnvironmentNpcBehavior(
          observation,
          applyEnvironmentNpcDetectionBehavior(
            observation,
            createNpcBehaviorCandidates(observation, memory, activeGoal),
          ),
        ),
      ),
    ),
  );
}

export function decideNpcBehavior(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  policy: RuntimeBehaviorPolicy = defaultNpcBehaviorPolicy,
  memoryStore?: NpcBehaviorMemoryStore,
  activeGoal?: { kind: RuntimeBehaviorKind; priority: number; reason: string; targetLocation?: { mapId: string; x: number; y: number }; targetEventId?: string; targetNpcId?: string; socialInteractionType?: "conversation" | "help" | "trade" | "conflict" | "custom"; dailyLifeActivity?: "work" | "routine" | "free-time" | "rest" | "recreation" | "social"; locationRole?: "workplace" | "home" | "free-time" | "recreation" | "social" },
): RuntimeDecision {
  const npcId = observation.perception?.self?.kind === "npc" ? observation.perception.self.id : undefined;
  const memory = npcId ? memoryStore?.get(npcId) : undefined;
  const candidates = createNpcBehaviorDecisionCandidates(observation, memory, activeGoal);
  const selected = policy.choose(observation, candidates);

  if (npcId && memoryStore) {
    const target = observation.perception?.nearbyEntities.find(entity => entity.id === selected.action.payload.targetEntityId);
    const nextMemory: NpcBehaviorMemory = {
      npcId,
      stateVersion: observation.state.stateVersion,
      lastBehavior: selected.behavior,
      targetEntityId: target?.id ?? memory?.targetEntityId,
      lastKnownTargetPosition: target?.position ?? memory?.lastKnownTargetPosition,
      lastSeenTick: target ? observation.state.clock.tick : memory?.lastSeenTick,
      lastFailure: selected.behavior === "investigate" && !target ? memory?.lastFailure : undefined,
      failureCount: selected.behavior === "investigate" && !target ? memory?.failureCount : undefined,
      updatedAtTick: observation.state.clock.tick,
    };
    memoryStore.set(nextMemory);
  }

  return createRuntimeDecision(request, observation, {
    actions: [selected.action],
    evidence: observation.facts,
    expiresAtTick: observation.state.clock.tick + 1,
  });
}
