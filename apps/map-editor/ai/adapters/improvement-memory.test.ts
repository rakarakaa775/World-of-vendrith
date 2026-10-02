import { describe, expect, it, vi } from "vitest";
import { createSupabaseImprovementMemory } from "./improvement-memory";

describe("createSupabaseImprovementMemory", () => {
  it("persists evaluations and proposals through Supabase tables", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });
    const memory = createSupabaseImprovementMemory({ from } as never);

    await memory.recordEvaluation({
      id: "evaluation-1",
      taskId: "task-1",
      strategyId: "strategy-1",
      validity: "valid",
      verificationPassed: true,
      novelty: "unknown",
      difficultySignal: "unknown",
      evidence: ["verification.run: ok"],
    });

    await memory.recordProposal({
      id: "proposal-1",
      taskId: "task-1",
      strategyId: "strategy-1",
      rationale: "review",
      evaluationId: "evaluation-1",
      requiresApproval: true,
    });

    expect(from).toHaveBeenNthCalledWith(1, "ai_improvement_evaluations");
    expect(from).toHaveBeenNthCalledWith(2, "ai_improvement_proposals");
    expect(upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: "evaluation-1",
        task_id: "task-1",
        verification_passed: true,
      }),
      { onConflict: "id" },
    );
    expect(upsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: "proposal-1",
        evaluation_id: "evaluation-1",
        requires_approval: true,
      }),
      { onConflict: "id" },
    );
  });

  it("surfaces Supabase persistence errors", async () => {
    const error = new Error("database unavailable");
    const from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error }),
    });
    const memory = createSupabaseImprovementMemory({ from } as never);

    await expect(
      memory.recordEvaluation({
        id: "evaluation-1",
        taskId: "task-1",
        strategyId: "strategy-1",
        validity: "unknown",
        verificationPassed: false,
        novelty: "unknown",
        difficultySignal: "unknown",
        evidence: [],
      }),
    ).rejects.toThrow("database unavailable");
  });
});
