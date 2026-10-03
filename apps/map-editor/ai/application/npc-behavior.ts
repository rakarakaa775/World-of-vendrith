import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { RuntimeBehaviorCandidate, RuntimeBehaviorDecision, RuntimeBehaviorPolicy, NpcBehaviorMemory, NpcBehaviorMemoryStore } from "../domain/runtime-behavior";
import { createRuntimeDecision } from "./runtime-decision";
import { applyEnvironmentNpcBehavior, applyEnvironmentNpcDetectionBehavior } from "./environment-npc-effects";

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export const defaultNpcBehaviorPolicy: RuntimeBehaviorPolicy = {
  choose(_observation, candidates): RuntimeBehaviorDecision {
    if (candidates.length === 0) throw new Error("NPC behavior requires at least one candidate.");
    const selected = [...candidates].sort((a, b) => b.priority - a.priority)[0];
    return { behavior: selected.kind, reason: selected.reason, action: selected.action };
  },
};

export function createNpcBehaviorCandidates(observation: RuntimeObservation, memory?: NpcBehaviorMemory): RuntimeBehaviorCandidate[] {
  const self = observation.perception?.self;
  if (!self || self.kind !== "npc") return [];
  const candidates: RuntimeBehaviorCandidate[] = [{
    kind: "idle", priority: 0,
    reason: "No higher-priority behavior is currently required.",
    action: { id: observation.id + ":idle", intelligence: "npc", type: "npc.idle", payload: {}, risk: "safe", reason: "No higher-priority behavior is currently required." },
  }];
  const visibleEntityIds = new Set(
    (observation.perception?.detections ?? [])
      .filter(detection => detection.channels.includes("visibility"))
      .map(detection => detection.entityId),
  );
  const player = observation.perception?.nearbyEntities.find(
    entity => entity.kind === "player" && visibleEntityIds.has(entity.id),
  );
  if (player) {
    const d = distance(self.position, player.position);
    candidates.push({
      kind: "follow-player", priority: Math.max(1, 100 - d),
      reason: "A player is visible at Manhattan distance " + d + ".",
      action: { id: observation.id + ":follow-player", intelligence: "npc", type: "npc.follow", payload: { targetEntityId: player.id }, risk: "safe", reason: "Follow the visible player at distance " + d + "." },
    });
  } else if (memory?.targetEntityId && memory.lastKnownTargetPosition) {
    candidates.push({
      kind: "investigate", priority: 10,
      reason: "The previously observed target is no longer visible; investigate its last known position.",
      action: { id: observation.id + ":investigate", intelligence: "npc", type: "npc.investigate", payload: { targetEntityId: memory.targetEntityId, position: memory.lastKnownTargetPosition }, risk: "safe", reason: "Investigate the last known position of the previous target." },
    });
  }
  return candidates;
}

export function decideNpcBehavior(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  policy: RuntimeBehaviorPolicy = defaultNpcBehaviorPolicy,
  memoryStore?: NpcBehaviorMemoryStore,
): RuntimeDecision {
  const npcId = observation.perception?.self?.kind === "npc" ? observation.perception.self.id : undefined;
  const memory = npcId ? memoryStore?.get(npcId) : undefined;
  const candidates = applyEnvironmentNpcBehavior(
    observation,
    applyEnvironmentNpcDetectionBehavior(
      observation,
      createNpcBehaviorCandidates(observation, memory),
    ),
  );
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
