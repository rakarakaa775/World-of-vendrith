import { describe, expect, it, vi } from "vitest";
import { createImprovementEngine } from "./improvement-engine";
import type { ImprovementTask } from "../domain/improvement";

describe("improvement engine", () => {
  it("runs task -> strategy -> verification and persists evidence before proposing improvement", async () => {
    const task: ImprovementTask = {
      id: "task-1",
      objective: "verify asset registry lookup",
      source: "verification",
      difficulty: "bounded",
      constraints: ["read-only"],
    };
    const memory = {
      recordEvaluation: vi.fn(async () => undefined),
      recordProposal: vi.fn(async () => undefined),
    };
    const engine = createImprovementEngine({
      generateTask: vi.fn(async () => task),
      generateStrategy: vi.fn(async (input) => ({
        id: "strategy-1",
        taskId: input.id,
        description: "search registry and verify provenance",
        steps: ["asset_registry.search", "verification.run"],
      })),
      runCandidate: vi.fn(async () => ({
        id: "evaluation-1",
        taskId: task.id,
        strategyId: "strategy-1",
        validity: "valid",
        verificationPassed: true,
        novelty: "new",
        difficultySignal: "frontier",
        evidence: ["registry result", "verification passed"],
      })),
      memory,
    });
    const result = await engine.run();
    expect(result.proposal.requiresApproval).toBe(true);
    expect(memory.recordEvaluation).toHaveBeenCalledOnce();
    expect(memory.recordProposal).toHaveBeenCalledOnce();
  });

  it("rejects a strategy that targets a different task", async () => {
    const task: ImprovementTask = {
      id: "task-1",
      objective: "test",
      source: "manual",
      difficulty: "exploratory",
      constraints: [],
    };
    const engine = createImprovementEngine({
      generateTask: vi.fn(async () => task),
      generateStrategy: vi.fn(async () => ({
        id: "strategy-1",
        taskId: "other-task",
        description: "wrong",
        steps: [],
      })),
      runCandidate: vi.fn(),
      memory: {
        recordEvaluation: vi.fn(async () => undefined),
        recordProposal: vi.fn(async () => undefined),
      },
    });
    await expect(engine.run()).rejects.toThrow(
      "Strategy candidate does not belong to generated task",
    );
  });
});
