import type { RuntimeObservation } from "./runtime";

export type RuntimeGoalKind = "work" | "eat" | "sleep" | "go-to-location" | "respond-to-event";

export interface NpcNeedState {
  hunger: number;
  energy: number;
  social: number;
  safety: number;
}

export interface RuntimeGoal {
  kind: RuntimeGoalKind;
  priority: number;
  reason: string;
  targetLocation?: { mapId: string; x: number; y: number };
  targetEventId?: string;
  targetNpcId?: string;
  expiresAtTick?: number;
}

export interface NpcGoalPolicy {
  choose(observation: RuntimeObservation, needs: NpcNeedState | undefined, goals: RuntimeGoal[]): RuntimeGoal | undefined;
}

export interface NpcGoalMemory {
  npcId: string;
  stateVersion: string;
  lastGoal?: RuntimeGoalKind;
  updatedAtTick: number;
}

export interface NpcGoalMemoryStore {
  get(npcId: string): NpcGoalMemory | undefined;
  set(memory: NpcGoalMemory): void;
  clear(npcId: string): void;
}

export function createNpcGoalMemoryStore(): NpcGoalMemoryStore {
  const memories = new Map<string, NpcGoalMemory>();
  return {
    get: npcId => memories.get(npcId),
    set: memory => memories.set(memory.npcId, memory),
    clear: npcId => memories.delete(npcId),
  };
}
