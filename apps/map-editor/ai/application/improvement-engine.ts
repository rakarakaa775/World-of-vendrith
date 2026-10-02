import type {
  EvaluationRecord,
  ImprovementHistory,
  ImprovementMemory,
  ImprovementProposal,
  ImprovementStrategyContext,
  ImprovementTask,
  StrategyCandidate,
} from "../domain/improvement";

export interface ImprovementEngineDependencies {
  generateTask(): Promise<ImprovementTask>;
  generateStrategy(task: ImprovementTask, context: ImprovementStrategyContext): Promise<StrategyCandidate>;
  runCandidate(task: ImprovementTask, strategy: StrategyCandidate): Promise<EvaluationRecord>;
  memory: ImprovementMemory;
}

function strategyKey(strategy: ImprovementHistory["proposal"]): string | undefined {
  if (!strategy?.strategyDescription) return undefined;
  return [
    strategy.strategyDescription.trim().toLowerCase(),
    ...(strategy.strategySteps ?? []).map((step) => step.trim().toLowerCase()),
  ].join("|");
}

function buildStrategyContext(history: ImprovementHistory[]): ImprovementStrategyContext {
  const seen = new Set<string>();
  const repeatedStrategyIds: string[] = [];
  for (const item of history) {
    const key = strategyKey(item.proposal);
    if (!key) continue;
    if (seen.has(key)) repeatedStrategyIds.push(item.evaluation.strategyId);
    seen.add(key);
  }
  return {
    relatedHistory: history,
    repeatedStrategyIds: [...new Set(repeatedStrategyIds)],
  };
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

      const evaluation = await dependencies.runCandidate(task, strategy);

      if (evaluation.taskId !== task.id || evaluation.strategyId !== strategy.id) {
        throw new Error("Evaluation references do not match the candidate run");
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
