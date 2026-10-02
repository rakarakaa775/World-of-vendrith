import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { RuntimeBehaviorCandidate, RuntimeBehaviorDecision, RuntimeBehaviorPolicy } from "../domain/runtime-behavior";
import { createRuntimeDecision } from "./runtime-decision";

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

export function createNpcBehaviorCandidates(observation: RuntimeObservation): RuntimeBehaviorCandidate[] {
  const self = observation.perception?.self;
  if (!self) return [];
  const candidates: RuntimeBehaviorCandidate[] = [{
    kind: "idle", priority: 0,
    reason: "No higher-priority behavior is currently required.",
    action: { id: observation.id + ":idle", intelligence: "npc", type: "npc.idle", payload: {}, risk: "safe", reason: "No higher-priority behavior is currently required." },
  }];
  const player = observation.perception?.nearbyEntities.find(entity => entity.kind === "player");
  if (player) {
    const d = distance(self.position, player.position);
    candidates.push({
      kind: "follow-player", priority: Math.max(1, 100 - d),
      reason: "A player is visible at Manhattan distance " + d + ".",
      action: { id: observation.id + ":follow-player", intelligence: "npc", type: "npc.follow", payload: { targetEntityId: player.id }, risk: "safe", reason: "Follow the visible player at distance " + d + "." },
    });
  }
  return candidates;
}

export function decideNpcBehavior(request: RuntimeAiRequest, observation: RuntimeObservation, policy: RuntimeBehaviorPolicy = defaultNpcBehaviorPolicy): RuntimeDecision {
  const selected = policy.choose(observation, createNpcBehaviorCandidates(observation));
  return createRuntimeDecision(request, observation, { actions: [selected.action], evidence: observation.facts, expiresAtTick: observation.state.clock.tick + 1 });
}
