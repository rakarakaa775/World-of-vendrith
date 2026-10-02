import type { AiRequest } from "../domain/types";
import type {
  EvaluationRecord,
  ImprovementTask,
  StrategyCandidate,
} from "../domain/improvement";
import type { VendrithAgentOrchestrator } from "./agent-orchestrator";

export interface ImprovementCandidateRunner {
  run(task: ImprovementTask, strategy: StrategyCandidate): Promise<EvaluationRecord>;
}

export function createAgentImprovementRunner(
  orchestrator: VendrithAgentOrchestrator,
): ImprovementCandidateRunner {
  return {
    async run(task, strategy) {
      const request: AiRequest = {
        id: "improvement-run-" + task.id + "-" + strategy.id,
        mode: "plan",
        prompt:
          "Evaluate this improvement strategy without mutating the project. " +
          "Objective: " + task.objective + ". " +
          "Constraints: " + task.constraints.join("; ") + ". " +
          "Strategy: " + strategy.description + ". " +
          "Steps: " + strategy.steps.join(" -> ") + ". " +
          "Use project tools as evidence and run bounded verification where appropriate.",
      };

      const result = await orchestrator.run(request);

      const failedTools = result.toolResults.filter((tool) => !tool.ok);
      const verificationResults = result.toolResults.filter(
        (tool) => tool.name === "verification.run" && tool.ok,
      );

      return {
        id: "evaluation-" + task.id + "-" + strategy.id,
        taskId: task.id,
        strategyId: strategy.id,
        validity: failedTools.length === 0 ? "valid" : "invalid",
        verificationPassed: verificationResults.length > 0 && failedTools.length === 0,
        novelty: "unknown",
        difficultySignal: "unknown",
        evidence: result.evidence.map(
          (evidence) => evidence.source + ": " + evidence.fact,
        ),
      };
    },
  };
}
