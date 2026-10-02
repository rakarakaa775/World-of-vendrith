import type {
  EvaluationRecord,
  ImprovementHistory,
  ImprovementMemory,
  ImprovementProposal,
  ImprovementStrategyContext,
  ImprovementTask,
  StrategyCandidate,
} from "../domain/improvement";
import { validateEvaluationQuality } from "../domain/improvement";

export interface ImprovementEngineDependencies {
  generateTask(): Promise<ImprovementTask>;
  generateStrategy(task: ImprovementTask, context: ImprovementStrategyContext): Promise<StrategyCandidate>;
  runCandidate(task: ImprovementTask, strategy: StrategyCandidate): Promise<EvaluationRecord>;
  memory: ImprovementMemory;
}

function strategyKey(strategy: NonNullable<ImprovementHistory["proposal"]> | StrategyCandidate): string {
  const description = "description" in strategy
    ? strategy.description
    : strategy.strategyDescription ?? "";
  const steps = "steps" in strategy
    ? strategy.steps
    : strategy.strategySteps ?? [];
  return [description.trim().toLowerCase(), ...steps.map((step) => step.trim().toLowerCase())].join("|");
}

function buildStrategyContext(history: ImprovementHistory[]): ImprovementStrategyContext {
  const seen = new Set<string>();
  const repeatedStrategyIds: string[] = [];
  for (const item of history) {
    const key = item.proposal ? strategyKey(item.proposal) : undefined;
    if (!key) continue;
    if (seen.has(key)) repeatedStrategyIds.push(item.evaluation.strategyId);
    seen.add(key);
  }
  return { relatedHistory: history, repeatedStrategyIds: [...new Set(repeatedStrategyIds)] };
}

function assertNovelStrategy(strategy: StrategyCandidate, history: ImprovementHistory[]): void {
  const candidateKey = strategyKey(strategy);
  const exactMatch = history.find((item) => item.proposal && strategyKey(item.proposal) === candidateKey);
  if (exactMatch) {
    throw new Error(
      "Strategy candidate duplicates a previously evaluated strategy: " + exactMatch.evaluation.strategyId,
    );
  }
}

export interface ImprovementRun {
  task: ImprovementTask;
  strategy: StrategyCandidate;
  evaluation: EvaluationRecord;
  proposal: ImprovementProposal;
}

export interface ImprovementEngine {
  run(): Promise<ImprovementRun>;
}

export function createImprovementEngine(
  dependencies: ImprovementEngineDependencies,
): ImprovementEngine {
  return {
    async run() {
      const task = await dependencies.generateTask();
      const history = await dependencies.memory.findRelated(task);
      const context = buildStrategyContext(history);
      const strategy = await dependencies.generateStrategy(task, context);

      if (strategy.taskId !== task.id) {
        throw new Error("Strategy candidate does not belong to generated task");
      }

      assertNovelStrategy(strategy, history);

      const evaluation = await dependencies.runCandidate(task, strategy);

      if (evaluation.taskId !== task.id || evaluation.strategyId !== strategy.id) {
        throw new Error("Evaluation references do not match the candidate run");
      }

      const evaluationQualityIssues = validateEvaluationQuality(evaluation);
      if (evaluationQualityIssues.length > 0) {
        throw new Error(
          "Evaluation quality check failed: " +
            evaluationQualityIssues.map((issue) => issue.code).join(", "),
        );
      }

      const proposal: ImprovementProposal = {
        id: "proposal-" + task.id + "-" + strategy.id,
        taskId: task.id,
        strategyId: strategy.id,
        strategyDescription: strategy.description,
        strategySteps: strategy.steps,
        rationale: evaluation.verificationPassed
          ? "Candidate completed verification and can be reviewed as an improvement proposal."
          : "Candidate did not complete verification; proposal is retained for review rather than treated as a successful improvement.",
        evaluationId: evaluation.id,
        requiresApproval: true,
      };

      await dependencies.memory.recordEvaluation(evaluation);
      await dependencies.memory.recordProposal(proposal);

      return { task, strategy, evaluation, proposal };
    },
  };
}
