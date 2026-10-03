import type { GameWorldState } from "../domain/runtime";
import type {
  RuntimeEventCandidate,
  RuntimeEventDefinition,
  RuntimeEventExecutionResult,
} from "../domain/runtime-event";

export interface RuntimeEventExecutionStore {
  findByTimeEventId(timeEventId: string): Promise<{ id: string; status: "running" | "completed" | "failed" } | undefined>;
  claim(candidate: RuntimeEventCandidate): Promise<{ id: string } | undefined>;
  applyWorldStatus(worldId: string, status: string): Promise<void>;
  applyEnvironment(worldId: string, consequence: Record<string, unknown>): Promise<Record<string, unknown>>;
  complete(executionId: string, metadata?: Record<string, unknown>): Promise<void>;
  fail(executionId: string, errorMessage: string): Promise<void>;
}

function conditionMatches(
  definition: RuntimeEventDefinition,
  state: GameWorldState,
  worldStatus: string,
): boolean {
  if (!definition.enabled) return false;
  if (definition.conditionType === "always") return true;
  if (definition.conditionType === "world_status") {
    return definition.conditionConfig.expected_status === worldStatus;
  }
  return false;
}

export async function executeRuntimeEvent(
  candidate: RuntimeEventCandidate,
  definition: RuntimeEventDefinition | undefined,
  state: GameWorldState,
  worldStatus: string,
  store: RuntimeEventExecutionStore,
): Promise<RuntimeEventExecutionResult> {
  if (!definition) {
    return { status: "failed", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, reason: "Event definition not found." };
  }
  if (!conditionMatches(definition, state, worldStatus)) {
    return { status: "skipped", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, worldStatus, reason: "Event condition did not match." };
  }
  if (definition.consequenceType === "world_status") {
    const targetStatus = definition.consequenceConfig.target_status;
    if (typeof targetStatus !== "string") {
      return { status: "failed", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, reason: "Event consequence has no target_status." };
    }
  } else if (definition.consequenceType !== "environment") {
    return { status: "failed", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, reason: "Unsupported event consequence." };
  }

  const existing = await store.findByTimeEventId(candidate.id);
  if (existing?.status === "completed" || existing?.status === "running") {
    return { status: "skipped", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, worldStatus, executionId: existing.id, reason: "Event execution already claimed or completed." };
  }

  const claim = await store.claim(candidate);
  if (!claim) {
    return { status: "skipped", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, worldStatus, reason: "Event execution could not be claimed." };
  }

  try {
    if (definition.consequenceType === "world_status") {
      const targetStatus = String(definition.consequenceConfig.target_status);
      await store.applyWorldStatus(candidate.worldId, targetStatus);
      await store.complete(claim.id, { consequenceType: definition.consequenceType, targetStatus, stateVersion: state.stateVersion });
      return { status: "executed", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, worldStatus: targetStatus, executionId: claim.id };
    }

    const metadata = await store.applyEnvironment(candidate.worldId, definition.consequenceConfig);
    await store.complete(claim.id, { consequenceType: definition.consequenceType, ...metadata, stateVersion: state.stateVersion });
    return { status: "executed", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, worldStatus, executionId: claim.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await store.fail(claim.id, message);
    return { status: "failed", timeEventId: candidate.id, eventType: candidate.eventType, stateVersion: state.stateVersion, executionId: claim.id, reason: message };
  }
}
