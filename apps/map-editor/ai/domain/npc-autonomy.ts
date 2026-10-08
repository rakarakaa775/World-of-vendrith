export type NpcGoalKind =
  | "survive"
  | "recover-energy"
  | "work"
  | "socialize"
  | "explore"
  | "idle";

export interface NpcGoalCandidate {
  kind: NpcGoalKind;
  /** 0..100 urgency supplied by the authoritative NPC/world state. */
  urgency: number;
  /** 0..100 importance supplied by NPC role/personality rules. */
  importance: number;
  reason: string;
}

export interface NpcGoal {
  kind: NpcGoalKind;
  score: number;
  reason: string;
}

/**
 * Selects the highest-priority goal without mutating state.
 *
 * The selector intentionally consumes already-authoritative inputs instead of
 * inventing NPC needs. Personality, occupation, schedule and world systems can
 * provide candidates later; this layer only ranks them deterministically.
 */
export function selectNpcGoal(candidates: readonly NpcGoalCandidate[]): NpcGoal {
  if (candidates.length === 0) {
    return {
      kind: "idle",
      score: 0,
      reason: "No autonomous goal candidates were available.",
    };
  }

  const ranked = candidates.map((candidate) => ({
    ...candidate,
    urgency: clamp(candidate.urgency),
    importance: clamp(candidate.importance),
  })).sort((a, b) => {
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
