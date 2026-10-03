import { describe, expect, it } from "vitest";
import type { RuntimeObservation } from "./runtime";
import { createNpcNeedsStore, resolveNpcNeedsState } from "./runtime-npc-needs";

function observation(state: Record<string, unknown>): RuntimeObservation {
  return {
    id: "obs-1",
    surface: "game",
    intelligence: "npc",
    state: {
      worldId: "world-1",
      clock: { tick: 7, day: 1, hour: 8, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "state-7",
    },
    perception: {
      self: { id: "npc-1", kind: "npc", mapId: "region-1", position: { x: 0, y: 0 }, state },
      nearbyEntities: [], detections: [], visibleMapIds: ["region-1"],
      environment: {},
    },
    facts: [],
  };
}

describe("npc needs runtime state", () => {
  it("hydrates persistent needs from explicit NPC state", () => {
    const store = createNpcNeedsStore();
    const result = resolveNpcNeedsState(observation({ npcNeeds: { hunger: 80, energy: 20, social: 30, safety: 90 } }), store);
    expect(result).toEqual({ npcId: "npc-1", needs: { hunger: 80, energy: 20, social: 30, safety: 90 }, updatedAtTick: 7, stateVersion: "state-7" });
    expect(store.get("npc-1")).toBe(result);
  });

  it("keeps stored needs stable when later observations omit npcNeeds", () => {
    const store = createNpcNeedsStore();
    const first = resolveNpcNeedsState(observation({ npcNeeds: { hunger: 80, energy: 20, social: 30, safety: 90 } }), store);
    const second = resolveNpcNeedsState(observation({}), store);
    expect(second).toStrictEqual(first);
    expect(second?.needs.hunger).toBe(80);
  });

  it("rejects incomplete or non-numeric explicit need state", () => {
    const store = createNpcNeedsStore();
    expect(resolveNpcNeedsState(observation({ npcNeeds: { hunger: 80, energy: "low", social: 30, safety: 90 } }), store)).toBeUndefined();
    expect(store.get("npc-1")).toBeUndefined();
  });
});


it("advances only from explicit need rates and elapsed ticks", () => {
  const store = createNpcNeedsStore();
  const first = resolveNpcNeedsState(observation({ npcNeeds: { hunger: 20, energy: 50, social: 30, safety: 90 } }), store)!;
  const later = observation({ npcNeeds: { hunger: 20, energy: 50, social: 30, safety: 90 } });
  later.state.clock.tick = 12;
  later.state.environmentConditions = { npc_need_rates: { hunger: 2, energy: -3 } };
  const advanced = resolveNpcNeedsState(later, store)!;
  expect(advanced.needs).toEqual({ hunger: 30, energy: 35, social: 30, safety: 90 });
  expect(advanced.updatedAtTick).toBe(12);
  expect(advanced.stateVersion).toBe("state-7");
});

it("does not invent need changes when no rate is configured", () => {
  const store = createNpcNeedsStore();
  resolveNpcNeedsState(observation({ npcNeeds: { hunger: 20, energy: 50, social: 30, safety: 90 } }), store);
  const later = observation({});
  later.state.clock.tick = 100;
  const advanced = resolveNpcNeedsState(later, store)!;
  expect(advanced.needs).toEqual({ hunger: 20, energy: 50, social: 30, safety: 90 });
  expect(advanced.updatedAtTick).toBe(100);
});

it("clamps tick-driven need changes", () => {
  const store = createNpcNeedsStore();
  resolveNpcNeedsState(observation({ npcNeeds: { hunger: 95, energy: 5, social: 30, safety: 90 } }), store);
  const later = observation({});
  later.state.clock.tick = 20;
  later.state.environmentConditions = { npc_need_rates: { hunger: 10, energy: -10 } };
  const advanced = resolveNpcNeedsState(later, store)!;
  expect(advanced.needs.hunger).toBe(100);
  expect(advanced.needs.energy).toBe(0);
});
