import { describe, expect, it } from "vitest";
import { createNpcLongTermMemoryStore, getNpcLongTermGoalAffinity, recordNpcLongTermOutcome } from "../domain/runtime-npc-long-term-memory";

describe("NPC long-term memory", () => {
  it("learns bounded goal outcomes without changing authority", () => {
    const store = createNpcLongTermMemoryStore();
    recordNpcLongTermOutcome(store, "npc-1", "state-1", 1, { type: "goal-completed", goal: "work", value: 1 });
    recordNpcLongTermOutcome(store, "npc-1", "state-2", 2, { type: "goal-completed", goal: "work", value: 1 });
    recordNpcLongTermOutcome(store, "npc-1", "state-3", 3, { type: "goal-failed", goal: "work", value: -1 });
    expect(getNpcLongTermGoalAffinity(store.get("npc-1"), "work")).toBe(1);
  });

  it("keeps only the bounded recent history", () => {
    const store = createNpcLongTermMemoryStore();
    for (let tick = 1; tick <= 40; tick += 1) {
      recordNpcLongTermOutcome(store, "npc-1", "state-" + tick, tick, { type: "social-outcome", value: 1, detail: String(tick) });
    }
    const memory = store.get("npc-1");
    expect(memory?.entries).toHaveLength(32);
    expect(memory?.entries[0]?.tick).toBe(9);
    expect(memory?.entries.at(-1)?.tick).toBe(40);
  });

  it("clamps long-term preference so history cannot grow without bound", () => {
    const store = createNpcLongTermMemoryStore();
    for (let tick = 1; tick <= 100; tick += 1) {
      recordNpcLongTermOutcome(store, "npc-1", "state-" + tick, tick, { type: "goal-completed", goal: "eat", value: 1 });
    }
    expect(getNpcLongTermGoalAffinity(store.get("npc-1"), "eat")).toBe(20);
  });
});
