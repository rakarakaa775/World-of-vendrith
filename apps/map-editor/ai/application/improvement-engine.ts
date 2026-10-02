import type {
  EvaluationRecord,
  ImprovementMemory,
  ImprovementProposal,
  ImprovementTask,
  StrategyCandidate,
} from "../domain/improvement";

export interface ImprovementEngineDependencies {
  generateTask(): Promise<ImprovementTask>;
  generateStrategy(task: ImprovementTask): Promise<StrategyCandidate>;
  runCandidate(task: ImprovementTask, strategy: StrategyCandidate): Promise<EvaluationRecord>;
  memory: ImprovementMemory;
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
      const strategy = await dependencies.generateStrategy(task);

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
