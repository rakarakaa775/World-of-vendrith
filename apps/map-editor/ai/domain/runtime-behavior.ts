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
  | "socialize"
  | "go-to-location"
  | "respond-to-event"
  | "routine"
  | "free-time"
  | "rest"
  | "recreation"
  | "social";

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

export type NpcBehaviorRuntimeStatus = "queued" | "running" | "interrupted" | "recovered" | "completed" | "failed";

export interface NpcBehaviorRuntimeState {
  npcId: string;
  activeBehavior?: RuntimeBehaviorKind;
  status: NpcBehaviorRuntimeStatus;
  queue: RuntimeBehaviorKind[];
  chain?: RuntimeBehaviorKind[];
  interruptionCount: number;
  lastFailure?: "execution" | "verification" | "navigation";
  lastVerifiedTick?: number;
  updatedAtTick: number;
}

export interface NpcBehaviorRuntimeStateStore {
  get(npcId: string): NpcBehaviorRuntimeState | undefined;
  set(state: NpcBehaviorRuntimeState): void;
  clear(npcId: string): void;
}

export function createNpcBehaviorRuntimeStateStore(): NpcBehaviorRuntimeStateStore {
  const states = new Map<string, NpcBehaviorRuntimeState>();
  return {
    get: npcId => states.get(npcId),
    set: state => states.set(state.npcId, state),
    clear: npcId => states.delete(npcId),
  };
}

export function createNpcBehaviorMemoryStore(): NpcBehaviorMemoryStore {
  const memories = new Map<string, NpcBehaviorMemory>();
  return {
    get: npcId => memories.get(npcId),
    set: memory => memories.set(memory.npcId, memory),
    clear: npcId => memories.delete(npcId),
  };
}
