import { describe, expect, it, vi } from "vitest";
import { createRuntimeOrchestrator } from "../ai/application/runtime-orchestrator";
import type { RuntimeAiPorts } from "../ai/ports/runtime";
import type { RuntimeAction, RuntimeAiRequest, RuntimeObservation, RuntimeDecision } from "../ai/domain/runtime";

function request(): RuntimeAiRequest {
  return {
    id: "runtime-test",
    surface: "game",
    intelligence: "npc",
    goal: "perform a bounded test action",
    observation: {
      id: "obs-1",
      surface: "game",
      intelligence: "npc",
      state: {
        worldId: "world-1",
        clock: { tick: 10, day: 1, hour: 8, minute: 0, season: "spring" },
        activeEventIds: [],
        stateVersion: "v1",
      },
      nearbyEntities: [],
      detections: [],
      visibleMapIds: ["map-1"],
      environment: {},
      facts: [],
    },
  };
}

function action(overrides: Partial<RuntimeAction> = {}): RuntimeAction {
  return {
    id: "action-1",
    intelligence: "npc",
    type: "test",
    payload: {},
    risk: "safe",
    reason: "bounded test",
    ...overrides,
  };
}

function decision(actions: RuntimeAction[]): RuntimeDecision {
  return {
    id: "decision-1",
    observationId: "obs-1",
    stateVersion: "v1",
    actions,
    evidence: [],
  };
}

function ports(
  actionResult: { ok: boolean; actionId: string; stateVersion?: string },
  verificationOk = true,
): RuntimeAiPorts {
  return {
    observation: {
      observe: vi.fn(async (input) => input.observation),
    },
    decision: {
      decide: vi.fn(async () => decision([action()])),
    },
    action: {
      execute: vi.fn(async () => actionResult),
    },
    verification: {
      verify: vi.fn(async () => ({
        ok: verificationOk,
        checks: [{ name: "state-integrity", ok: verificationOk }],
      })),
    },
  };
}

describe("runtime Execute -> Verify boundary", () => {
  it("marks execution unsuccessful when post-action verification fails", async () => {
    const p = ports({ ok: true, actionId: "action-1", stateVersion: "v2" }, false);
    const result = await createRuntimeOrchestrator(p).run(request());

    expect(result.executions).toEqual([
      expect.objectContaining({
        actionId: "action-1",
        executed: true,
        ok: false,
        verification: expect.objectContaining({ ok: false }),
      }),
    ]);
    expect(p.verification.verify).toHaveBeenCalledOnce();
  });

  it("accepts an action only after successful verification", async () => {
    const p = ports({ ok: true, actionId: "action-1", stateVersion: "v2" }, true);
    const result = await createRuntimeOrchestrator(p).run(request());

    expect(result.executions[0]).toEqual(expect.objectContaining({
      actionId: "action-1",
      executed: true,
      ok: true,
    }));
    expect(p.verification.verify).toHaveBeenCalledWith(
      expect.objectContaining({ id: "action-1" }),
      expect.objectContaining({ actionId: "action-1", stateVersion: "v2" }),
    );
  });

  it("does not verify a result for a different action identity", async () => {
    const p = ports({ ok: true, actionId: "wrong-action", stateVersion: "v2" }, true);
    const result = await createRuntimeOrchestrator(p).run(request());

    expect(result.executions[0]).toEqual(expect.objectContaining({
      actionId: "action-1",
      executed: true,
      ok: false,
    }));
    expect(result.executions[0].detail).toContain("did not match");
    expect(p.verification.verify).not.toHaveBeenCalled();
  });

  it("does not verify a successful execution without an authoritative state version", async () => {
    const p = ports({ ok: true, actionId: "action-1" }, true);
    const result = await createRuntimeOrchestrator(p).run(request());

    expect(result.executions[0]).toEqual(expect.objectContaining({
      actionId: "action-1",
      executed: true,
      ok: false,
    }));
    expect(result.executions[0].detail).toContain("missing its resulting state version");
    expect(p.verification.verify).not.toHaveBeenCalled();
  });

  it("never executes an action blocked by runtime policy", async () => {
    const p = ports({ ok: true, actionId: "action-1", stateVersion: "v2" }, true);
    p.decision.decide = vi.fn(async () => decision([action({ risk: "high-risk" })]));

    const result = await createRuntimeOrchestrator(p).run(request(), { approved: false });

    expect(result.executions[0]).toEqual(expect.objectContaining({
      executed: false,
      ok: false,
    }));
    expect(p.action.execute).not.toHaveBeenCalled();
    expect(p.verification.verify).not.toHaveBeenCalled();
  });
});
