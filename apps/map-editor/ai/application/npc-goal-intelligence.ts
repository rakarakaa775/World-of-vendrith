import type { RuntimeObservation } from "../domain/runtime";
import type { NpcGoalMemory, RuntimeGoal } from "../domain/runtime-goal";

export interface NpcGoalArbitrationOptions {
  /** Priority advantage required before a different goal can replace the remembered goal. */
  switchMargin?: number;
  /** Small deterministic bonus for continuing the remembered goal. */
  continuityBonus?: number;
}

export interface NpcGoalArbitrationResult {
  selected?: RuntimeGoal;
  candidates: RuntimeGoal[];
  scores: Readonly<Record<string, number>>;
  switched: boolean;
}

const DEFAULT_SWITCH_MARGIN = 10;
const DEFAULT_CONTINUITY_BONUS = 5;

const GOAL_TIE_ORDER: Record<RuntimeGoal["kind"], number> = {
  "respond-to-event": 0,
  sleep: 1,
  eat: 2,
  "go-to-location": 3,
  work: 4,
  socialize: 5,
};

function scoreGoal(goal: RuntimeGoal, memory: NpcGoalMemory | undefined, continuityBonus: number): number {
  return goal.priority + (memory?.lastGoal === goal.kind ? continuityBonus : 0);
}

function compareGoals(
  a: RuntimeGoal,
  b: RuntimeGoal,
  scoreFor: (goal: RuntimeGoal) => number,
): number {
  const scoreDelta = scoreFor(b) - scoreFor(a);
  if (scoreDelta !== 0) return scoreDelta;
  const priorityDelta = b.priority - a.priority;
  if (priorityDelta !== 0) return priorityDelta;
  const orderDelta = GOAL_TIE_ORDER[a.kind] - GOAL_TIE_ORDER[b.kind];
  if (orderDelta !== 0) return orderDelta;
  return a.kind.localeCompare(b.kind);
}

export function arbitrateNpcGoal(
  observation: RuntimeObservation,
  goals: RuntimeGoal[],
  memory?: NpcGoalMemory,
  options: NpcGoalArbitrationOptions = {},
): NpcGoalArbitrationResult {
  const switchMargin = Number.isFinite(options.switchMargin) ? Math.max(0, options.switchMargin ?? DEFAULT_SWITCH_MARGIN) : DEFAULT_SWITCH_MARGIN;
  const continuityBonus = Number.isFinite(options.continuityBonus) ? Math.max(0, options.continuityBonus ?? DEFAULT_CONTINUITY_BONUS) : DEFAULT_CONTINUITY_BONUS;
  const currentTick = observation.state.clock.tick;
  const candidates = goals.filter(goal => goal.expiresAtTick === undefined || goal.expiresAtTick >= currentTick);
  if (candidates.length === 0) return { selected: undefined, candidates, scores: {}, switched: false };

  const scores: Record<string, number> = {};
  const scoreFor = (goal: RuntimeGoal): number => scoreGoal(goal, memory, continuityBonus);
  for (const goal of candidates) {
    if (scores[goal.kind] === undefined) scores[goal.kind] = scoreFor(goal);
  }
  const ranked = [...candidates].sort((a, b) => compareGoals(a, b, scoreFor));
  const best = ranked[0];
  const previousCandidates = memory?.lastGoal
    ? candidates.filter(goal => goal.kind === memory.lastGoal)
    : [];
  const previous = previousCandidates.length
    ? [...previousCandidates].sort((a, b) =>
        Math.abs(a.priority - (memory?.lastGoalPriority ?? a.priority))
        - Math.abs(b.priority - (memory?.lastGoalPriority ?? b.priority))
        || compareGoals(a, b, scoreFor),
      )[0]
    : undefined;

  if (!previous || previous.kind === best.kind) {
    return { selected: best, candidates, scores, switched: Boolean(previous && previous.kind !== best.kind) };
  }

  const previousScore = scoreFor(previous);
  const bestScore = scoreFor(best);
  if (bestScore < previousScore + switchMargin) {
    return { selected: previous, candidates, scores, switched: false };
  }

  return { selected: best, candidates, scores, switched: true };
}
