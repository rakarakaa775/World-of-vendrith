import type { RuntimeObservation } from "./runtime";
import type { RuntimeGoalKind } from "./runtime-goal";

export type NpcDailyLifePhase = "idle" | "traveling" | "active";
export type NpcDailyLifeTransition = "started" | "continuing" | "arrived" | "goal-changed" | "idle";

export interface NpcDailyLifeState {
  npcId: string;
  goal?: RuntimeGoalKind;
  phase: NpcDailyLifePhase;
  targetLocation?: { mapId: string; x: number; y: number };
  transition: NpcDailyLifeTransition;
  startedAtTick: number;
  updatedAtTick: number;
}

export interface NpcDailyLifeGoal {
  kind: RuntimeGoalKind;
  targetLocation?: { mapId: string; x: number; y: number };
}

export interface NpcDailyLifeStateStore {
  get(npcId: string): NpcDailyLifeState | undefined;
  set(state: NpcDailyLifeState): void;
  clear(npcId: string): void;
}

export function createNpcDailyLifeStateStore(): NpcDailyLifeStateStore {
  const states = new Map<string, NpcDailyLifeState>();
  return {
    get: npcId => states.get(npcId),
    set: state => states.set(state.npcId, state),
    clear: npcId => states.delete(npcId),
  };
}

function atTarget(observation: RuntimeObservation, target?: NpcDailyLifeGoal["targetLocation"]): boolean {
  const self = observation.perception?.self;
  if (!self || !target || self.mapId !== target.mapId) return false;
  return self.position.x === target.x && self.position.y === target.y;
}

export function resolveNpcDailyLifeState(
  observation: RuntimeObservation,
  goal: NpcDailyLifeGoal | undefined,
  previous?: NpcDailyLifeState,
): NpcDailyLifeState | undefined {
  const self = observation.perception?.self;
  if (!self || self.kind !== "npc") return undefined;

  const tick = observation.state.clock.tick;
  if (!goal) {
    return {
      npcId: self.id,
      phase: "idle",
      transition: previous?.phase === "idle" ? "continuing" : "idle",
      startedAtTick: previous?.phase === "idle" ? previous.startedAtTick : tick,
      updatedAtTick: tick,
    };
  }

  const phase: NpcDailyLifePhase = goal.targetLocation
    ? (atTarget(observation, goal.targetLocation) ? "active" : "traveling")
    : "active";
  const sameGoal = previous?.goal === goal.kind;
  const sameActivity = sameGoal && previous?.phase === phase;
  const transition = !previous || !sameGoal
    ? (previous ? "goal-changed" : "started")
    : previous.phase !== phase && phase === "active"
      ? "arrived"
      : "continuing";

  return {
    npcId: self.id,
    goal: goal.kind,
    phase,
    ...(goal.targetLocation ? { targetLocation: goal.targetLocation } : {}),
    transition,
    startedAtTick: sameActivity || sameGoal ? previous.startedAtTick : tick,
    updatedAtTick: tick,
  };
}
