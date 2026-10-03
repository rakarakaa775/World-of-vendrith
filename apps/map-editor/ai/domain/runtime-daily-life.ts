import type { RuntimeObservation } from "./runtime";
import type { RuntimeGoalKind } from "./runtime-goal";
import type { NpcBehaviorRuntimeStatus, RuntimeBehaviorKind } from "./runtime-behavior";
import type { NpcDailyLifeActivity, NpcDailyLifeLocationRole } from "./runtime-schedule";

export type NpcDailyLifePhase = "idle" | "traveling" | "active";
export type NpcDailyLifeTransition = "started" | "continuing" | "arrived" | "goal-changed" | "idle";

export interface NpcDailyLifeState {
  npcId: string;
  goal?: RuntimeGoalKind;
  phase: NpcDailyLifePhase;
  locationRole?: NpcDailyLifeLocationRole;
  activity?: NpcDailyLifeActivity;
  targetLocation?: { mapId: string; x: number; y: number };
  transition: NpcDailyLifeTransition;
  previousActivity?: NpcDailyLifeActivity;
  previousLocationRole?: NpcDailyLifeLocationRole;
  behavior?: RuntimeBehaviorKind;
  behaviorStatus?: NpcBehaviorRuntimeStatus;
  transitionCount: number;
  day: number;
  dayTransitionCount: number;
  startedAtTick: number;
  updatedAtTick: number;
}

export interface NpcDailyLifeGoal {
  kind: RuntimeGoalKind;
  targetLocation?: { mapId: string; x: number; y: number };
  locationRole?: NpcDailyLifeLocationRole;
  activity?: NpcDailyLifeActivity;
}

export interface NpcDailyLifeScheduleSource {
  goal: RuntimeGoalKind;
  location: { mapId: string; x: number; y: number };
  locationRole?: NpcDailyLifeLocationRole;
  dailyLifeActivity?: NpcDailyLifeActivity;
}

export function createNpcDailyLifeGoalFromSchedule(
  entry: NpcDailyLifeScheduleSource,
): NpcDailyLifeGoal {
  return {
    kind: entry.goal,
    targetLocation: entry.location,
    ...(entry.locationRole ? { locationRole: entry.locationRole } : {}),
    ...(entry.dailyLifeActivity ? { activity: entry.dailyLifeActivity } : {}),
  };
}

export interface NpcDailyLifeStateStore {
  get(npcId: string): NpcDailyLifeState | undefined;
  set(state: NpcDailyLifeState): void;
  clear(npcId: string): void;
}

export function syncNpcDailyLifeWithBehavior(
  state: NpcDailyLifeState | undefined,
  behavior: RuntimeBehaviorKind,
  status: NpcBehaviorRuntimeStatus,
  tick: number,
): NpcDailyLifeState | undefined {
  if (!state) return undefined;
  return {
    ...state,
    behavior,
    behaviorStatus: status,
    updatedAtTick: tick,
  };
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

function inferredDailyLifeMetadata(goal: RuntimeGoalKind): Pick<NpcDailyLifeGoal, "locationRole" | "activity"> {
  if (goal === "work") return { locationRole: "workplace", activity: "work" };
  if (goal === "sleep") return { locationRole: "home", activity: "rest" };
  if (goal === "eat") return { locationRole: "home", activity: "routine" };
  if (goal === "respond-to-event") return { locationRole: "social", activity: "social" };
  return { activity: "routine" };
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
      ...(previous?.activity ? { previousActivity: previous.activity } : {}),
      ...(previous?.locationRole ? { previousLocationRole: previous.locationRole } : {}),
      transitionCount: previous?.phase === "idle" ? previous.transitionCount : (previous?.transitionCount ?? 0) + 1,
      day: observation.state.clock.day,
      dayTransitionCount: previous?.phase === "idle"
        ? previous.dayTransitionCount + (previous.day === observation.state.clock.day ? 0 : 1)
        : (previous ? previous.dayTransitionCount + (previous.day === observation.state.clock.day ? 0 : 1) : 0),
      startedAtTick: previous?.phase === "idle" ? previous.startedAtTick : tick,
      updatedAtTick: tick,
    };
  }

  const phase: NpcDailyLifePhase = goal.targetLocation
    ? (atTarget(observation, goal.targetLocation) ? "active" : "traveling")
    : "active";
  const inferred = inferredDailyLifeMetadata(goal.kind);
  const locationRole = goal.locationRole ?? inferred.locationRole;
  const activity = goal.activity ?? inferred.activity;
  const sameGoal = previous?.goal === goal.kind;
  const sameActivity = sameGoal && previous?.activity === activity;
  const transition = !previous || !sameGoal
    ? (previous ? "goal-changed" : "started")
    : previous.phase !== phase && phase === "active"
      ? "arrived"
      : "continuing";
  const changedActivity = previous && previous.activity !== activity;
  const changedRole = previous && previous.locationRole !== locationRole;
  const changedLifeStage = Boolean(changedActivity || changedRole || !sameGoal);

  return {
    npcId: self.id,
    goal: goal.kind,
    phase,
    ...(locationRole ? { locationRole } : {}),
    ...(activity ? { activity } : {}),
    ...(changedActivity && previous?.activity ? { previousActivity: previous.activity } : {}),
    ...(changedRole && previous?.locationRole ? { previousLocationRole: previous.locationRole } : {}),
    ...(goal.targetLocation ? { targetLocation: goal.targetLocation } : {}),
    transition,
    transitionCount: (previous?.transitionCount ?? 0) + (changedLifeStage ? 1 : 0),
    day: observation.state.clock.day,
    dayTransitionCount: (previous?.dayTransitionCount ?? 0)
      + (previous && previous.day !== observation.state.clock.day ? 1 : 0),
    startedAtTick: sameActivity ? previous.startedAtTick : tick,
    updatedAtTick: tick,
  };
}
