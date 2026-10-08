import { describe, expect, it, vi } from "vitest";
import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation } from "../ai/domain/runtime";
import { createNpcAutonomyAgent } from "../ai/application/npc-autonomy-agent";
import type { RuntimeOrchestrator } from "../ai/application/runtime-orchestrator";

function observation(): RuntimeObservation {
  return {
    id: "obs-1",
    surface: "game",
    intelligence: "npc",
    state: {
      worldId: "world-1",
      clock: { tick: 10, day: 1, hour: 8, minute: 0, season: "spring" },
      activeEventIds: [],
      stateVersion: "v10",
    },
    facts: [],
  };
}

function request(): RuntimeAiRequest {
  return {
    id: "req-1",
    surface: "game",
    intelligence: "npc",
    observation: observation(),
    goal: "continue daily activity",
  };
}

function decision(): RuntimeDecision {
  return {
    id: "decision-1",
    observationId: "obs-1",
    stateVersion: "v10",
    actions: [
      {
        id: "action-1",
        intelligence: "npc",
        type: "move",
        payload: {},
        risk: "safe",
        reason: "go to work",
      },
      {
        id: "action-2",
        intelligence: "npc",
        type: "interact",
        payload: {},
        risk: "game-rule",
        reason: "start work",
      },
    ],
    evidence: [],
  };
}

describe("NPC autonomy agent", () => {
  it("only accepts game/npc runtime requests", async () => {
    const orchestrator = { run: vi.fn() } as unknown as RuntimeOrchestrator;
    const agent = createNpcAutonomyAgent(orchestrator);

    await expect(
      agent.tick({ ...request(), surface: "engine" }),
    ).rejects.toThrow("game runtime surface");

    await expect(
      agent.tick({ ...request(), intelligence: "world" }),
    ).rejects.toThrow("npc runtime intelligence");
  });

  it("enforces the NPC action budget before execution", async () => {
    const run = vi.fn(async (_request: RuntimeAiRequest, authorization?: { maxActions?: number }) => {
      expect(authorization?.maxActions).toBe(1);
      return {
        request: _request,
        observation: observation(),
        decision: decision(),
        executions: [{
          actionId: "action-1",
          ok: true,
          executed: true,
          verification: { ok: true, checks: [{ name: "action-1", ok: true }] },
        }],
      };
    });
    const agent = createNpcAutonomyAgent({ run } as unknown as RuntimeOrchestrator, {
      maxActionsPerTick: 1,
    });

    const result = await agent.tick(request());

    expect(result.autonomous).toBe(true);
    expect(result.actionBudget).toEqual({ requested: 2, allowed: 1, blocked: 1 });
    expect(result.executions).toHaveLength(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid autonomy budgets", () => {
    const orchestrator = { run: vi.fn() } as unknown as RuntimeOrchestrator;
    expect(() => createNpcAutonomyAgent(orchestrator, { maxActionsPerTick: -1 })).toThrow();
    expect(() => createNpcAutonomyAgent(orchestrator, { maxActionsPerTick: 1.5 })).toThrow();
  });
});
