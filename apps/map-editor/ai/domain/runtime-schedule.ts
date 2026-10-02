import type { RuntimeGoalKind } from "./runtime-goal";
import type { RuntimeObservation } from "./runtime";

export interface NpcScheduleEntry {
  goal: RuntimeGoalKind;
  startHour: number;
  endHour: number;
  location: { mapId: string; x: number; y: number };
}

export interface NpcSchedule {
  npcId: string;
  entries: NpcScheduleEntry[];
}

export function isHourInSchedule(hour: number, entry: NpcScheduleEntry): boolean {
  if (entry.startHour === entry.endHour) return true;
  if (entry.startHour < entry.endHour) return hour >= entry.startHour && hour < entry.endHour;
  return hour >= entry.startHour || hour < entry.endHour;
}

export function findScheduledLocation(
  observation: RuntimeObservation,
  schedule: NpcSchedule,
  goal: RuntimeGoalKind,
): NpcScheduleEntry | undefined {
  const hour = observation.state.clock.hour;
  return schedule.entries.find(entry => entry.goal === goal && isHourInSchedule(hour, entry));
}
