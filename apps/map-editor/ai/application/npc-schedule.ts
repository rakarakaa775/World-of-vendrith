import type { RuntimeAction, RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../domain/runtime";
import type { NpcSchedule, NpcScheduleEntry } from "../domain/runtime-schedule";
import type { RuntimeGoalKind } from "../domain/runtime-goal";
import { isHourInSchedule } from "../domain/runtime-schedule";
import { createRuntimeDecision } from "./runtime-decision";

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
