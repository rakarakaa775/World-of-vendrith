import { describe, expect, it } from "vitest";
import { executeRuntimeEvent, type RuntimeEventExecutionStore } from "./runtime-event-executor";
import type { RuntimeEventCandidate } from "../domain/runtime-event";
import type { GameWorldState } from "../domain/runtime";

function state(): GameWorldState {
  return {
    worldId: "world-1",
    clock: { tick: 4, day: 1, hour: 12, minute: 0, season: "spring" },
    activeEventIds: [],
    stateVersion: "engine:1:runtime:4",
  };
}

function candidate(): RuntimeEventCandidate {
  return {
    id: "event-1",
    worldId: "world-1",
    eventType: "world_pause",
    scheduledAt: "2026-10-03T12:00:00Z",
    startTick: 4,
    endTick: 5,
  };
}

function store() {
  let execution: { id: string; status: "running" | "completed" | "failed" } | undefined;
  const calls: string[] = [];
  const value: RuntimeEventExecutionStore = {
    async findByTimeEventId() { return execution; },
    async claim() {
      if (execution) return undefined;
      execution = { id: "execution-1", status: "running" };
      calls.push("claim");
      return { id: "execution-1" };
    },
    async applyWorldStatus(_worldId, status) { calls.push(`status:${status}`); },
    async complete() { if (execution) execution.status = "completed"; calls.push("complete"); },
    async fail(_id, message) { if (execution) execution.status = "failed"; calls.push(`fail:${message}`); },
  };
  return { value, calls };
}

describe("runtime event executor", () => {
  it("executes a matching world-status event exactly once in the normal flow", async () => {
    const s = store();
    const definition = {
      eventType: "world_pause",
      conditionType: "world_status" as const,
      consequenceType: "world_status" as const,
      conditionConfig: { expected_status: "active" },
      consequenceConfig: { target_status: "paused" },
      enabled: true,
    };
    const first = await executeRuntimeEvent(candidate(), definition, state(), "active", s.value);
    const second = await executeRuntimeEvent(candidate(), definition, state(), "active", s.value);
    expect(first.status).toBe("executed");
    expect(second.status).toBe("skipped");
    expect(s.calls).toEqual(["claim", "status:paused", "complete"]);
  });

  it("fails closed for an unknown definition", async () => {
    const s = store();
    const result = await executeRuntimeEvent(candidate(), undefined, state(), "active", s.value);
    expect(result.status).toBe("failed");
    expect(s.calls).toEqual([]);
  });

  it("skips when the condition does not match", async () => {
    const s = store();
    const definition = {
      eventType: "world_pause",
      conditionType: "world_status" as const,
      consequenceType: "world_status" as const,
      conditionConfig: { expected_status: "active" },
      consequenceConfig: { target_status: "paused" },
      enabled: true,
    };
    const result = await executeRuntimeEvent(candidate(), definition, state(), "paused", s.value);
    expect(result.status).toBe("skipped");
    expect(s.calls).toEqual([]);
  });
});
