import type { RuntimeObservation } from "./runtime";
import type { NpcDailyLifeActivity, NpcDailyLifeLocationRole } from "./runtime-schedule";

export type RuntimeGoalKind = "work" | "eat" | "sleep" | "socialize" | "go-to-location" | "respond-to-event";

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
  socialInteractionType?: "conversation" | "help" | "trade" | "conflict" | "custom";
  locationRole?: NpcDailyLifeLocationRole;
  dailyLifeActivity?: NpcDailyLifeActivity;
  expiresAtTick?: number;
}

export interface NpcGoalPolicy {
  choose(observation: RuntimeObservation, needs: NpcNeedState | undefined, goals: RuntimeGoal[], memory?: NpcGoalMemory): RuntimeGoal | undefined;
}

export interface NpcGoalMemory {
  npcId: string;
  stateVersion: string;
  lastGoal?: RuntimeGoalKind;
  lastGoalPriority?: number;
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
