import type { RuntimeObservation } from "../domain/runtime";
import type { RuntimeGoalKind } from "../domain/runtime-goal";

export type NpcCoordinationIntent = "assist" | "respond" | "trade" | "follow-up" | "guard";

export interface NpcCoordinationRequest {
  requesterNpcId: string;
  targetNpcId: string;
  intent: NpcCoordinationIntent;
  goal: RuntimeGoalKind;
  reason: string;
  createdAtTick: number;
  expiresAtTick: number;
  priority: number;
}

export interface NpcCoordinationProposal {
  request: NpcCoordinationRequest;
  accepted: boolean;
  reason: string;
}

export interface NpcCoordinationStore {
  list(targetNpcId: string): readonly NpcCoordinationRequest[];
  add(request: NpcCoordinationRequest): void;
  remove(requesterNpcId: string, targetNpcId: string, intent: NpcCoordinationIntent): void;
}

export class InMemoryNpcCoordinationStore implements NpcCoordinationStore {
  private readonly requests = new Map<string, NpcCoordinationRequest>();

  list(targetNpcId: string): readonly NpcCoordinationRequest[] {
    return [...this.requests.values()]
      .filter(request => request.targetNpcId === targetNpcId)
      .sort((a, b) => b.priority - a.priority || a.createdAtTick - b.createdAtTick || a.requesterNpcId.localeCompare(b.requesterNpcId));
  }

  add(request: NpcCoordinationRequest): void {
    this.requests.set(this.key(request), request);
  }

  remove(requesterNpcId: string, targetNpcId: string, intent: NpcCoordinationIntent): void {
    this.requests.delete(requesterNpcId + ":" + targetNpcId + ":" + intent);
  }

  private key(request: NpcCoordinationRequest): string {
    return request.requesterNpcId + ":" + request.targetNpcId + ":" + request.intent;
  }
}

function isExpired(request: NpcCoordinationRequest, tick: number): boolean {
  return request.expiresAtTick < tick;
}

/**
 * Cross-agent coordination is a proposal layer only. It never executes actions
 * and never bypasses the authoritative NPC goal/behavior/policy pipeline.
 */
export function proposeNpcCoordination(
  observation: RuntimeObservation,
  targetNpcId: string,
  intent: NpcCoordinationIntent,
  goal: RuntimeGoalKind,
  reason: string,
  priority: number,
  durationTicks = 2,
): NpcCoordinationRequest {
  const perception = observation.perception;
  const self = perception?.self;
  if (!self || self.kind !== "npc" || !perception) throw new Error("NPC coordination requires an NPC requester.");
  if (!perception.nearbyEntities.some(entity => entity.id === targetNpcId && entity.kind === "npc")) {
    throw new Error("NPC coordination target must be a nearby NPC.");
  }
  if (!Number.isInteger(durationTicks) || durationTicks < 1) throw new Error("NPC coordination duration must be a positive integer.");
  if (!Number.isFinite(priority) || priority < 0) throw new Error("NPC coordination priority must be a finite non-negative number.");

  const now = observation.state.clock.tick;
  return {
    requesterNpcId: self.id,
    targetNpcId,
    intent,
    goal,
    reason,
    createdAtTick: now,
    expiresAtTick: now + durationTicks,
    priority: Math.floor(priority),
  };
}

export function evaluateNpcCoordination(
  observation: RuntimeObservation,
  request: NpcCoordinationRequest,
  store?: NpcCoordinationStore,
): NpcCoordinationProposal {
  const perception = observation.perception;
  const self = perception?.self;
  if (!self || self.kind !== "npc" || !perception) return { request, accepted: false, reason: "Target is not an NPC runtime." };
  if (request.targetNpcId !== self.id) return { request, accepted: false, reason: "Coordination request targets a different NPC." };
  if (request.requesterNpcId === request.targetNpcId) return { request, accepted: false, reason: "NPC coordination cannot target itself." };
  if (isExpired(request, observation.state.clock.tick)) return { request, accepted: false, reason: "Coordination request has expired." };
  if (!perception.nearbyEntities.some(entity => entity.id === request.requesterNpcId && entity.kind === "npc")) {
    return { request, accepted: false, reason: "Requester is not currently observable to the target NPC." };
  }

  store?.add(request);
  return {
    request,
    accepted: true,
    reason: "Coordination proposal accepted for consideration by the authoritative NPC runtime.",
  };
}

export function collectNpcCoordination(
  observation: RuntimeObservation,
  store: NpcCoordinationStore,
): readonly NpcCoordinationRequest[] {
  const now = observation.state.clock.tick;
  for (const request of store.list(observation.perception?.self?.id ?? "")) {
    if (isExpired(request, now)) store.remove(request.requesterNpcId, request.targetNpcId, request.intent);
  }
  return store.list(observation.perception?.self?.id ?? "");
}
