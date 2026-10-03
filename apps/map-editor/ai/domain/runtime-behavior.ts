import type { RuntimeAction, RuntimeObservation } from "./runtime";

export type RuntimeBehaviorKind =
  | "idle"
  | "follow-player"
  | "wander"
  | "investigate"
  | "flee"
  | "work"
  | "eat"
  | "sleep"
  | "go-to-location"
  | "respond-to-event";

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

export interface NpcBehaviorMemory {
  npcId: string;
  stateVersion: string;
  lastBehavior: RuntimeBehaviorKind;
  targetEntityId?: string;
  lastKnownTargetPosition?: { x: number; y: number };
  lastSeenTick?: number;
  lastFailure?: "navigation" | "execution" | "verification";
  failureCount?: number;
  updatedAtTick: number;
}

export interface NpcBehaviorMemoryStore {
  get(npcId: string): NpcBehaviorMemory | undefined;
  set(memory: NpcBehaviorMemory): void;
  clear(npcId: string): void;
}

export function createNpcBehaviorMemoryStore(): NpcBehaviorMemoryStore {
  const memories = new Map<string, NpcBehaviorMemory>();
  return {
    get: npcId => memories.get(npcId),
    set: memory => memories.set(memory.npcId, memory),
    clear: npcId => memories.delete(npcId),
  };
}
