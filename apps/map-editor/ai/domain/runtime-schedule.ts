import type { RuntimeGoalKind } from "./runtime-goal";
import type { RuntimeObservation } from "./runtime";

export type NpcDailyLifeLocationRole =
  | "workplace"
  | "home"
  | "free-time"
  | "recreation"
  | "social";

export type NpcDailyLifeActivity =
  | "work"
  | "routine"
  | "free-time"
  | "rest"
  | "recreation"
  | "social";

export interface NpcScheduleEntry {
  goal: RuntimeGoalKind;
  startHour: number;
  endHour: number;
  priority: number;
  location: { mapId: string; x: number; y: number };
  locationRole?: NpcDailyLifeLocationRole;
  dailyLifeActivity?: NpcDailyLifeActivity;
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

export interface NpcScheduleValidation {
  ok: boolean;
  errors: string[];
}

export function validateNpcSchedule(value: unknown): NpcScheduleValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, errors: ["NPC schedule must be an object."] };
  }
  const schedule = value as NpcSchedule;
  const errors: string[] = [];
  if (typeof schedule.npcId !== "string" || schedule.npcId.length === 0) {
    errors.push("NPC schedule requires a non-empty npcId.");
  }
  if (!Array.isArray(schedule.entries)) {
    return { ok: false, errors: [...errors, "NPC schedule entries must be an array."] };
  }
  schedule.entries.forEach((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push("NPC schedule entry " + index + " must be an object.");
      return;
    }
    const candidate = entry as NpcScheduleEntry;
    if (!["work", "eat", "sleep", "go-to-location", "respond-to-event"].includes(candidate.goal)) {
      errors.push("NPC schedule entry " + index + " has an unsupported goal.");
    }
    if (!Number.isInteger(candidate.startHour) || candidate.startHour < 0 || candidate.startHour > 23) {
      errors.push("NPC schedule entry " + index + " has an invalid startHour.");
    }
    if (!Number.isInteger(candidate.endHour) || candidate.endHour < 0 || candidate.endHour > 23) {
      errors.push("NPC schedule entry " + index + " has an invalid endHour.");
    }
    if (!Number.isFinite(candidate.priority)) {
      errors.push("NPC schedule entry " + index + " requires a finite priority.");
    }
    if (candidate.locationRole !== undefined &&
        !["workplace", "home", "free-time", "recreation", "social"].includes(candidate.locationRole)) {
      errors.push("NPC schedule entry " + index + " has an unsupported locationRole.");
    }
    if (candidate.dailyLifeActivity !== undefined &&
        !["work", "routine", "free-time", "rest", "recreation", "social"].includes(candidate.dailyLifeActivity)) {
      errors.push("NPC schedule entry " + index + " has an unsupported dailyLifeActivity.");
    }
    if (!candidate.location || typeof candidate.location.mapId !== "string" || candidate.location.mapId.length === 0 ||
        !Number.isInteger(candidate.location.x) || !Number.isInteger(candidate.location.y)) {
      errors.push("NPC schedule entry " + index + " has an invalid location.");
    }
  });
  return { ok: errors.length === 0, errors };
}

export function findScheduledLocation(
  observation: RuntimeObservation,
  schedule: NpcSchedule,
  goal: RuntimeGoalKind,
): NpcScheduleEntry | undefined {
  const hour = observation.state.clock.hour;
  return schedule.entries
    .filter(entry => entry.goal === goal && isHourInSchedule(hour, entry))
    .sort((a, b) => b.priority - a.priority)[0];
}
