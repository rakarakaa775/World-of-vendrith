import { describe, expect, it } from "vitest";
import { createNpcBehaviorRuntimeStateStore } from "../domain/runtime-behavior";
import { beginNpcBehavior, chainNpcBehavior, interruptNpcBehavior, queueNpcBehavior, recoverNpcBehavior, syncNpcBehaviorRuntimeState, verifyNpcBehavior } from "./npc-behavior-runtime";

describe("NPC behavior runtime state", () => {
  it("queues and starts go-to-location behavior deterministically", () => {
    const queued = queueNpcBehavior(undefined, "npc-1", "go-to-location", 1);
    expect(queued.queue).toEqual(["go-to-location"]);
    const running = beginNpcBehavior(queued, "npc-1", "go-to-location", 2);
    expect(running.status).toBe("running");
    expect(running.activeBehavior).toBe("go-to-location");
    expect(running.queue).toEqual([]);
  });

  it("tracks interruption and recovery", () => {
    const running = beginNpcBehavior(undefined, "npc-1", "work", 3);
    const interrupted = interruptNpcBehavior(running, 4);
    expect(interrupted.status).toBe("interrupted");
    expect(interrupted.interruptionCount).toBe(1);
    const recovered = recoverNpcBehavior(interrupted, 5);
    expect(recovered.status).toBe("recovered");
  });

  it("chains a follow-up behavior without losing the active behavior", () => {
    const running = beginNpcBehavior(undefined, "npc-1", "go-to-location", 6);
    const chained = chainNpcBehavior(running, "work", 7);
    expect(chained.activeBehavior).toBe("go-to-location");
    expect(chained.queue).toEqual(["work"]);
    expect(chained.chain).toEqual(["work"]);
  });

  it("records successful verification and failure cause", () => {
    const running = beginNpcBehavior(undefined, "npc-1", "respond-to-event", 8);
    const failed = verifyNpcBehavior(running, 9, false, "verification");
    expect(failed.status).toBe("failed");
    expect(failed.lastFailure).toBe("verification");
    const recovered = verifyNpcBehavior(failed, 10, true);
    expect(recovered.status).toBe("completed");
    expect(recovered.lastFailure).toBeUndefined();
    expect(recovered.lastVerifiedTick).toBe(10);
  });

  it("persists execution and verification result in the runtime store", () => {
    const store = createNpcBehaviorRuntimeStateStore();
    const state = syncNpcBehaviorRuntimeState(store, "npc-1", "respond-to-event", 11, true, true);
    expect(store.get("npc-1")).toEqual(state);
    expect(state.status).toBe("completed");
    expect(state.lastVerifiedTick).toBe(11);
  });
});
