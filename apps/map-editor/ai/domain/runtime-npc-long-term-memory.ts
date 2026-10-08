import type { RuntimeGoalKind } from "../domain/runtime-goal";

export interface NpcLongTermMemoryEntry {
  tick: number;
  type: "goal-completed" | "goal-failed" | "social-outcome" | "coordination-outcome";
  goal?: RuntimeGoalKind;
  subjectId?: string;
  value: number;
  detail?: string;
}

export interface NpcLongTermMemory {
  npcId: string;
  stateVersion: string;
  updatedAtTick: number;
  entries: readonly NpcLongTermMemoryEntry[];
  goalAffinity: Readonly<Partial<Record<RuntimeGoalKind, number>>>;
}

export interface NpcLongTermMemoryStore {
  get(npcId: string): NpcLongTermMemory | undefined;
  set(memory: NpcLongTermMemory): void;
  clear(npcId: string): void;
}

const MAX_ENTRIES = 32;
const MAX_AFFINITY = 20;
const MIN_AFFINITY = -20;

export function createNpcLongTermMemoryStore(): NpcLongTermMemoryStore {
  const memories = new Map<string, NpcLongTermMemory>();
  return {
    get: npcId => memories.get(npcId),
    set: memory => memories.set(memory.npcId, memory),
    clear: npcId => memories.delete(npcId),
  };
}

function clampAffinity(value: number): number {
  return Math.max(MIN_AFFINITY, Math.min(MAX_AFFINITY, value));
}

export function recordNpcLongTermOutcome(
  store: NpcLongTermMemoryStore,
  npcId: string,
  stateVersion: string,
  tick: number,
  outcome: Omit<NpcLongTermMemoryEntry, "tick">,
): NpcLongTermMemory {
  const previous = store.get(npcId);
  const entries = [...(previous?.entries ?? []), { ...outcome, tick }].slice(-MAX_ENTRIES);
  const goalAffinity = { ...(previous?.goalAffinity ?? {}) };
  if (outcome.goal) {
    const current = goalAffinity[outcome.goal] ?? 0;
    const delta = outcome.type === "goal-completed" ? 1 : outcome.type === "goal-failed" ? -1 : 0;
    goalAffinity[outcome.goal] = clampAffinity(current + delta);
  }
  const next = { npcId, stateVersion, updatedAtTick: tick, entries, goalAffinity };
  store.set(next);
  return next;
}

export function getNpcLongTermGoalAffinity(
  memory: NpcLongTermMemory | undefined,
  goal: RuntimeGoalKind,
): number {
  return memory?.goalAffinity[goal] ?? 0;
}

export const NPC_LONG_TERM_MEMORY_POLICY = {
  maxEntries: MAX_ENTRIES,
  maxGoalAffinity: MAX_AFFINITY,
  minGoalAffinity: MIN_AFFINITY,
  semantics: "Bounded deterministic history only. Long-term memory influences preference evidence; it never grants permissions or bypasses current needs, goals, policy, execution, or verification.",
} as const;
