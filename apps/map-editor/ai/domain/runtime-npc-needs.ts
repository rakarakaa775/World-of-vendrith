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

function clamp(value: number): number { return Math.max(0, Math.min(100, value)); }

function explicitNeeds(observation: RuntimeObservation): NpcNeedState | undefined {
  const value = observation.perception?.self?.state?.npcNeeds;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const keys: Array<keyof NpcNeedState> = ["hunger", "energy", "social", "safety"];
  if (!keys.every(key => typeof record[key] === "number" && Number.isFinite(record[key]))) return undefined;
  return {
    hunger: clamp(Number(record.hunger)),
    energy: clamp(Number(record.energy)),
    social: clamp(Number(record.social)),
    safety: clamp(Number(record.safety)),
  };
}

function explicitNeedRates(observation: RuntimeObservation): Partial<NpcNeedState> | undefined {
  const conditions = observation.state.environmentConditions?.npc_need_rates;
  if (!conditions || typeof conditions !== "object" || Array.isArray(conditions)) return undefined;
  const record = conditions as Record<string, unknown>;
  const rates: Partial<NpcNeedState> = {};
  for (const key of ["hunger", "energy", "social", "safety"] as const) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) rates[key] = value;
  }
  return Object.keys(rates).length ? rates : undefined;
}

export function advanceNpcNeedsState(
  observation: RuntimeObservation,
  state: NpcNeedsState,
): NpcNeedsState {
  const rates = explicitNeedRates(observation);
  const tick = observation.state.clock.tick;
  const elapsedTicks = Math.max(0, tick - state.updatedAtTick);
  if (!rates || elapsedTicks === 0) {
    return { ...state, updatedAtTick: tick, stateVersion: observation.state.stateVersion };
  }
  const needs = { ...state.needs };
  for (const key of ["hunger", "energy", "social", "safety"] as const) {
    const rate = rates[key];
    if (typeof rate === "number") needs[key] = clamp(needs[key] + rate * elapsedTicks);
  }
  return { ...state, needs, updatedAtTick: tick, stateVersion: observation.state.stateVersion };
}

export function resolveNpcNeedsState(
  observation: RuntimeObservation,
  store: NpcNeedsStore,
): NpcNeedsState | undefined {
  const self = observation.perception?.self;
  if (!self || self.kind !== "npc") return undefined;

  const existing = store.get(self.id);
  if (existing) {
    const advanced = advanceNpcNeedsState(observation, existing);
    store.set(advanced);
    return advanced;
  }

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
