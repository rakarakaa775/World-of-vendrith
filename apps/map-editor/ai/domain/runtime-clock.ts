import type { GameClock, GameWorldState } from "./runtime";

export interface RuntimeScheduledEvent {
  id: string;
  startTick: number;
  endTick?: number;
}

export interface RuntimeClockAdvance {
  clock: GameClock;
  stateVersion: string;
  activeEventIds: string[];
}

export function advanceGameClock(
  state: GameWorldState,
  minutes = 1,
  events: RuntimeScheduledEvent[] = [],
): RuntimeClockAdvance {
  if (!Number.isInteger(minutes) || minutes < 0) throw new Error("Clock advance minutes must be a non-negative integer.");
  const totalMinutes = state.clock.hour * 60 + state.clock.minute + minutes;
  const dayOffset = Math.floor(totalMinutes / 1440);
  const dayMinutes = totalMinutes % 1440;
  const tick = state.clock.tick + 1;
  const day = state.clock.day + dayOffset;
  const hour = Math.floor(dayMinutes / 60);
  const minute = dayMinutes % 60;
  const activeEventIds = events
    .filter(event => event.startTick <= tick && (event.endTick === undefined || tick < event.endTick))
    .map(event => event.id);

  return {
    clock: { ...state.clock, tick, day, hour, minute },
    stateVersion: `${state.stateVersion.replace(/:runtime:\\d+$/, "")}:runtime:${tick}`,
    activeEventIds,
  };
}
