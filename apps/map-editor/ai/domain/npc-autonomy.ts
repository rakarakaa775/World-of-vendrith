export interface NpcGoalCandidate {
  kind: string;
  urgency: number;
  importance: number;
  reason: string;
}
export interface NpcGoalSelection {
  kind: string;
  score: number;
  reason: string;
}
function bounded(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
}
export function selectNpcGoal(candidates: readonly NpcGoalCandidate[]): NpcGoalSelection {
  if (candidates.length === 0) return { kind: "idle", score: 0, reason: "No autonomous goal candidates were available." };
  return candidates.map(candidate => ({
    kind: candidate.kind,
    score: bounded(candidate.urgency) * 0.7 + bounded(candidate.importance) * 0.3,
    reason: candidate.reason,
  })).sort((a,b) => b.score-a.score || a.kind.localeCompare(b.kind))[0];
}
