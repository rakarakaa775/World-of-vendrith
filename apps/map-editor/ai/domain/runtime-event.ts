export type RuntimeEventConditionType = "always" | "world_status";
export type RuntimeEventConsequenceType = "world_status";

export interface RuntimeEventDefinition {
  eventType: string;
  conditionType: RuntimeEventConditionType;
  consequenceType: RuntimeEventConsequenceType;
  conditionConfig: Record<string, unknown>;
  consequenceConfig: Record<string, unknown>;
  enabled: boolean;
}

export interface RuntimeEventCandidate {
  id: string;
  worldId: string;
  eventType: string;
  scheduledAt: string;
  payload?: Record<string, unknown>;
  startTick: number;
  endTick: number;
}

export type RuntimeEventExecutionStatus = "running" | "completed" | "failed";

export interface RuntimeEventExecution {
  id: string;
  timeEventId: string;
  status: RuntimeEventExecutionStatus;
  claimedAt: string;
  completedAt?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface RuntimeEventExecutionResult {
  status: "executed" | "skipped" | "failed";
  timeEventId: string;
  eventType: string;
  stateVersion: string;
  worldStatus?: string;
  executionId?: string;
  reason?: string;
}
