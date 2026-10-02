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

export interface EvaluationQualityIssue {
  code: "missing-evidence" | "verification-invalid-contradiction" | "validity-without-verification";
  message: string;
}

export function validateEvaluationQuality(record: EvaluationRecord): EvaluationQualityIssue[] {
  const issues: EvaluationQualityIssue[] = [];

  if (record.verificationPassed && record.evidence.length === 0) {
    issues.push({
      code: "missing-evidence",
      message: "A verified candidate evaluation must include evidence.",
    });
  }

  if (record.verificationPassed && record.validity === "invalid") {
    issues.push({
      code: "verification-invalid-contradiction",
      message: "A candidate cannot be marked invalid while verificationPassed is true.",
    });
  }

  if (record.validity === "valid" && !record.verificationPassed) {
    issues.push({
      code: "validity-without-verification",
      message: "A valid candidate must have passed verification.",
    });
  }

  return issues;
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
