import type { NpcBehaviorRuntimeState, NpcBehaviorRuntimeStateStore, RuntimeBehaviorKind } from "../domain/runtime-behavior";

export function queueNpcBehavior(state: NpcBehaviorRuntimeState | undefined, npcId: string, behavior: RuntimeBehaviorKind, tick: number): NpcBehaviorRuntimeState {
  return { npcId, activeBehavior: state?.activeBehavior, status: state?.status ?? "queued", queue: [...(state?.queue ?? []), behavior], chain: state?.chain, interruptionCount: state?.interruptionCount ?? 0, lastFailure: state?.lastFailure, lastVerifiedTick: state?.lastVerifiedTick, updatedAtTick: tick };
}

export function beginNpcBehavior(state: NpcBehaviorRuntimeState | undefined, npcId: string, behavior: RuntimeBehaviorKind, tick: number): NpcBehaviorRuntimeState {
  const queue = [...(state?.queue ?? [])];
  const index = queue.indexOf(behavior);
  if (index >= 0) queue.splice(index, 1);
  return { npcId, activeBehavior: behavior, status: "running", queue, chain: state?.chain, interruptionCount: state?.interruptionCount ?? 0, lastFailure: undefined, lastVerifiedTick: state?.lastVerifiedTick, updatedAtTick: tick };
}

export function interruptNpcBehavior(state: NpcBehaviorRuntimeState, tick: number): NpcBehaviorRuntimeState {
  return { ...state, status: "interrupted", interruptionCount: state.interruptionCount + 1, updatedAtTick: tick };
}

export function recoverNpcBehavior(state: NpcBehaviorRuntimeState, tick: number): NpcBehaviorRuntimeState {
  return { ...state, status: "recovered", updatedAtTick: tick };
}

export function chainNpcBehavior(state: NpcBehaviorRuntimeState, next: RuntimeBehaviorKind, tick: number): NpcBehaviorRuntimeState {
  return { ...state, status: "queued", queue: [...state.queue, next], chain: [...(state.chain ?? []), next], updatedAtTick: tick };
}

export function verifyNpcBehavior(state: NpcBehaviorRuntimeState, tick: number, ok: boolean, failure?: "execution" | "verification" | "navigation"): NpcBehaviorRuntimeState {
  return { ...state, status: ok ? "completed" : "failed", lastFailure: ok ? undefined : failure, lastVerifiedTick: ok ? tick : state.lastVerifiedTick, updatedAtTick: tick };
}

export function syncNpcBehaviorRuntimeState(
  store: NpcBehaviorRuntimeStateStore,
  npcId: string,
  behavior: RuntimeBehaviorKind,
  tick: number,
  executionOk: boolean,
  verificationOk: boolean,
  inProgress = false,
): NpcBehaviorRuntimeState {
  const started = beginNpcBehavior(store.get(npcId), npcId, behavior, tick);
  const status = executionOk && inProgress
    ? { ...started, status: "running" as const, updatedAtTick: tick }
    : verifyNpcBehavior(started, tick, executionOk && verificationOk, executionOk ? "verification" : "execution");
  store.set(status);
  return status;
}
