import { describe, expect, it, vi } from "vitest";
import { createAgentImprovementRunner } from "./improvement-agent-runner";
import type { ImprovementTask, StrategyCandidate } from "../domain/improvement";

describe("agent improvement runner", () => {
  it("converts a read-only agent run into an evaluation record", async () => {
    const orchestrator = {
      run: vi.fn(async () => ({
        request: { id: "request-1" },
        approval: "not-required",
        response: { content: "verified", toolCalls: [] },
        toolResults: [
          {
            id: "tool-1",
            name: "verification.run",
            ok: true,
            result: { ok: true },
          },
        ],
        iterations: 1,
        evidence: [
          {
            id: "tool-tool-1",
            kind: "inference",
            source: "verification.run",
            fact: "verification passed",
            confidence: "medium",
          },
        ],
      })),
    };

    const task: ImprovementTask = {
      id: "task-1",
      objective: "verify the AI workflow",
      source: "verification",
      difficulty: "bounded",
      constraints: ["read-only"],
    };
    const strategy: StrategyCandidate = {
      id: "strategy-1",
      taskId: "task-1",
      description: "inspect and verify",
      steps: ["verification.run"],
    };

    const result = await createAgentImprovementRunner(orchestrator).run(task, strategy);

    expect(result.validity).toBe("valid");
    expect(result.verificationPassed).toBe(true);
    expect(orchestrator.run).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "plan",
        id: "improvement-run-task-1-strategy-1",
      }),
    );
  });

  it("marks a rollout invalid when a tool fails", async () => {
    const orchestrator = {
      run: vi.fn(async () => ({
        request: { id: "request-1" },
        approval: "not-required",
        response: { content: "failed", toolCalls: [] },
        toolResults: [
          {
            id: "tool-1",
            name: "verification.run",
            ok: false,
            error: "verification failed",
          },
        ],
        iterations: 1,
        evidence: [],
      })),
    };

    const task: ImprovementTask = {
      id: "task-2",
      objective: "verify",
      source: "regression",
      difficulty: "advanced",
      constraints: ["read-only"],
    };
    const strategy: StrategyCandidate = {
      id: "strategy-2",
      taskId: "task-2",
      description: "verify",
      steps: ["verification.run"],
    };

    const result = await createAgentImprovementRunner(orchestrator).run(task, strategy);

    expect(result.validity).toBe("invalid");
    expect(result.verificationPassed).toBe(false);
  });
});
