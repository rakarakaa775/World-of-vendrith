import type { RuntimeAction, RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { NpcSchedule, NpcScheduleEntry } from "../domain/runtime-schedule";
import type { RuntimeGoalKind } from "../domain/runtime-goal";
import { isHourInSchedule } from "../domain/runtime-schedule";
import { createRuntimeDecision } from "./runtime-decision";


export function calculateNpcSchedulePressure(
  observation: RuntimeObservation,
  entry: NpcScheduleEntry,
): number {
  if (!isHourInSchedule(observation.state.clock.hour, entry)) return 0;
  if (entry.startHour === entry.endHour) return 0;

  const duration = (entry.endHour - entry.startHour + 24) % 24;
  if (duration <= 0) return 0;
  const elapsed = (observation.state.clock.hour - entry.startHour + 24) % 24;
  const timePressure = Math.min(15, Math.ceil(((elapsed + 1) / duration) * 15));
  const self = observation.perception?.self;
  const distanceToTarget = self && self.mapId === entry.location.mapId
    ? Math.abs(self.position.x - entry.location.x) + Math.abs(self.position.y - entry.location.y)
    : 0;
  const travelPressure = self && self.mapId !== entry.location.mapId
    ? 10
    : Math.min(10, Math.ceil(distanceToTarget / 5));
  return Math.min(25, timePressure + travelPressure);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function chooseScheduledLocation(
  observation: RuntimeObservation,
  schedule: NpcSchedule,
  goal: RuntimeGoalKind,
): NpcScheduleEntry | undefined {
  return schedule.entries
    .filter(entry => entry.goal === goal && isHourInSchedule(observation.state.clock.hour, entry))
    .sort((a, b) => b.priority - a.priority ||
      distance(observation.perception?.self?.position ?? { x: 0, y: 0 }, a.location) -
      distance(observation.perception?.self?.position ?? { x: 0, y: 0 }, b.location))[0];
}

export function createNpcScheduleAction(
  observation: RuntimeObservation,
  entry: NpcScheduleEntry,
): RuntimeAction {
  return {
    id: `${observation.id}:schedule:${entry.goal}:${entry.location.mapId}`,
    intelligence: "npc",
    type: "npc.go-to-location",
    payload: {
      goal: entry.goal,
      targetLocation: entry.location,
      scheduleWindow: { startHour: entry.startHour, endHour: entry.endHour },
    },
    risk: "safe",
    reason: `Follow the NPC schedule for ${entry.goal} during the current game hour.`,
  };
}

export function decideNpcSchedule(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  schedule: NpcSchedule,
  goal: RuntimeGoalKind,
): RuntimeDecision | undefined {
  const entry = chooseScheduledLocation(observation, schedule, goal);
  if (!entry) return undefined;

  return createRuntimeDecision(request, observation, {
    actions: [createNpcScheduleAction(observation, entry)],
    evidence: observation.facts,
    expiresAtTick: observation.state.clock.tick + 1,
  });
}
