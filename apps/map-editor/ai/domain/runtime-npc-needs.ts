import type { RuntimeObservation } from "./runtime";
import type { NpcNeedState } from "./runtime-goal";

export interface NpcNeedsState {
  npcId: string;
  needs: NpcNeedState;
  updatedAtTick: number;
  stateVersion: string;
}

export interface NpcNeedsStore {
  get(npcId: string): NpcNeedsState | undefined;
  set(state: NpcNeedsState): void;
  clear(npcId: string): void;
}

export function createNpcNeedsStore(): NpcNeedsStore {
  const states = new Map<string, NpcNeedsState>();
  return {
    get: npcId => states.get(npcId),
    set: state => states.set(state.npcId, state),
    clear: npcId => states.delete(npcId),
  };
}

function explicitNeeds(observation: RuntimeObservation): NpcNeedState | undefined {
  const value = observation.perception?.self?.state?.npcNeeds;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const keys: Array<keyof NpcNeedState> = ["hunger", "energy", "social", "safety"];
  if (!keys.every(key => typeof record[key] === "number" && Number.isFinite(record[key]))) return undefined;
  return {
    hunger: Number(record.hunger),
    energy: Number(record.energy),
    social: Number(record.social),
    safety: Number(record.safety),
  };
}

export function resolveNpcNeedsState(
  observation: RuntimeObservation,
  store: NpcNeedsStore,
): NpcNeedsState | undefined {
  const self = observation.perception?.self;
  if (!self || self.kind !== "npc") return undefined;

  const existing = store.get(self.id);
  if (existing) return existing;

  const needs = explicitNeeds(observation);
  if (!needs) return undefined;

  const state: NpcNeedsState = {
    npcId: self.id,
    needs,
    updatedAtTick: observation.state.clock.tick,
    stateVersion: observation.state.stateVersion,
  };
  store.set(state);
  return state;
}
