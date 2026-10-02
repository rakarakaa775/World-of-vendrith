export type ImprovementTaskSource = "verification" | "project-gap" | "regression" | "manual";

export interface ImprovementTask {
  id: string;
  objective: string;
  source: ImprovementTaskSource;
  difficulty: "exploratory" | "bounded" | "advanced";
  constraints: string[];
}

export interface StrategyCandidate {
  id: string;
  taskId: string;
  description: string;
  steps: string[];
}

export interface EvaluationRecord {
  id: string;
  taskId: string;
  strategyId: string;
  validity: "valid" | "invalid" | "unknown";
  verificationPassed: boolean;
  novelty: "new" | "known" | "unknown";
  difficultySignal: "below-frontier" | "frontier" | "beyond-frontier" | "unknown";
  evidence: string[];
}

export interface ImprovementProposal {
  id: string;
  taskId: string;
  strategyId: string;
  strategyDescription?: string;
  strategySteps?: string[];
  rationale: string;
  evaluationId: string;
  requiresApproval: true;
}

export interface ImprovementHistory {
  evaluation: EvaluationRecord;
  proposal?: ImprovementProposal;
}

export interface ImprovementMemoryQuery {
  taskId?: string;
  limit?: number;
}

export interface ImprovementMemory {
  recordEvaluation(record: EvaluationRecord): Promise<void>;
  recordProposal(proposal: ImprovementProposal): Promise<void>;
  listRecent(limit?: number): Promise<ImprovementHistory[]>;
  findRelated(task: ImprovementTask, query?: Omit<ImprovementMemoryQuery, "taskId">): Promise<ImprovementHistory[]>;
}

export interface ImprovementStrategyContext {
  relatedHistory: ImprovementHistory[];
  repeatedStrategyIds: string[];
}
