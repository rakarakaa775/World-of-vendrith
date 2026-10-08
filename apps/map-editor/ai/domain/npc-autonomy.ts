import type { RuntimeGoalKind } from "./runtime-goal";

export type NpcGoalKind = RuntimeGoalKind;

export interface NpcGoalCandidate {
  kind: RuntimeGoalKind;
  urgency: number;
  importance: number;
  reason: string;
}

export interface NpcGoal {
  kind: RuntimeGoalKind;
  score: number;
  reason: string;
}

export function selectNpcGoal(candidates: readonly NpcGoalCandidate[]): NpcGoal | undefined {
  if (candidates.length === 0) return undefined;

  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      urgency: clamp(candidate.urgency),
      importance: clamp(candidate.importance),
    }))
    .sort((a, b) => {
      const scoreA = a.urgency * 0.7 + a.importance * 0.3;
      const scoreB = b.urgency * 0.7 + b.importance * 0.3;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.kind.localeCompare(b.kind);
    });

  const winner = ranked[0];
  return {
    kind: winner.kind,
    score: winner.urgency * 0.7 + winner.importance * 0.3,
    reason: winner.reason,
  };
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
