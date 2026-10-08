import { describe, expect, it } from "vitest";
import type { RuntimeWorldSnapshot } from "./runtime-world-adapter";
import {
  applyRuntimeRecoveryRecords,
  runtimeStateHash,
  type RuntimeRecoveryCheckpoint,
  type RuntimeRecoveryMutation,
} from "./runtime-recovery";

const base = (x: number): RuntimeWorldSnapshot => ({
  state: {
    worldId: "world-1",
    clock: { tick: x, day: 1, hour: 0, minute: 0, season: "spring" },
    activeEventIds: [],
    stateVersion: `state:${x}`,
  },
  entities: [{
    id: "npc-1",
    kind: "npc",
    mapId: "map-1",
    position: { x, y: 0 },
  }],
});

describe("runtime recovery", () => {
  it("replays a journal entry committed after the last checkpoint", () => {
    const checkpointSnapshot = base(10);
    const nextSnapshot = base(11);
    const checkpoint: RuntimeRecoveryCheckpoint = {
      sequence: 10,
      tick: 10,
      stateVersion: checkpointSnapshot.state.stateVersion,
      stateHash: runtimeStateHash(checkpointSnapshot),
      state: checkpointSnapshot,
    };
    const mutation: RuntimeRecoveryMutation = {
      sequence: 11,
      mutation: { state: nextSnapshot },
      stateVersion: nextSnapshot.state.stateVersion,
      stateHash: runtimeStateHash(nextSnapshot),
    };

    const recovered = applyRuntimeRecoveryRecords(checkpoint, [mutation]);

    expect(recovered.sequence).toBe(11);
    expect(recovered.replayedSequences).toEqual([11]);
    expect(recovered.snapshot).toEqual(nextSnapshot);
  });

  it("fails closed on a sequence gap", () => {
    const checkpointSnapshot = base(10);
    const mutationSnapshot = base(12);
    const checkpoint: RuntimeRecoveryCheckpoint = {
      sequence: 10,
      tick: 10,
      stateVersion: checkpointSnapshot.state.stateVersion,
      stateHash: runtimeStateHash(checkpointSnapshot),
      state: checkpointSnapshot,
    };

    expect(() => applyRuntimeRecoveryRecords(checkpoint, [{
      sequence: 12,
      mutation: { state: mutationSnapshot },
      stateVersion: mutationSnapshot.state.stateVersion,
      stateHash: runtimeStateHash(mutationSnapshot),
    }])).toThrow("RUNTIME_RECOVERY_SEQUENCE_GAP");
  });

  it("detects a tampered mutation state hash", () => {
    const checkpointSnapshot = base(10);
    const mutationSnapshot = base(11);
    const checkpoint: RuntimeRecoveryCheckpoint = {
      sequence: 10,
      tick: 10,
      stateVersion: checkpointSnapshot.state.stateVersion,
      stateHash: runtimeStateHash(checkpointSnapshot),
      state: checkpointSnapshot,
    };

    expect(() => applyRuntimeRecoveryRecords(checkpoint, [{
      sequence: 11,
      mutation: { state: mutationSnapshot },
      stateVersion: mutationSnapshot.state.stateVersion,
      stateHash: "tampered",
    }])).toThrow("RUNTIME_RECOVERY_MUTATION_HASH_MISMATCH");
  });
});
