import type { RuntimeAiRequest } from "../domain/runtime";
import { selectNpcGoal, type NpcGoal, type NpcGoalCandidate } from "../domain/npc-autonomy";
import type { RuntimeOrchestrator, RuntimeRunResult } from "./runtime-orchestrator";

export interface NpcAutonomyPolicy {
  maxActionsPerTick: number;
}

export interface NpcAutonomyTickResult extends RuntimeRunResult {
  goal?: NpcGoal;
  autonomous: true;
  actionBudget: { requested: number; allowed: number; blocked: number };
}

export interface NpcAutonomyAgent {
  tick(request: RuntimeAiRequest, candidates?: readonly NpcGoalCandidate[]): Promise<NpcAutonomyTickResult>;
}

function clampBudget(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error("NPC autonomy maxActionsPerTick must be a finite non-negative number.");
  return Math.floor(value);
}

export function createNpcAutonomyAgent(
  orchestrator: RuntimeOrchestrator,
  policy: NpcAutonomyPolicy = { maxActionsPerTick: 1 },
): NpcAutonomyAgent {
  const maxActionsPerTick = clampBudget(policy.maxActionsPerTick);
  return {
    async tick(request, candidates) {
      if (request.surface !== "game") throw new Error("NPC autonomy requires the game runtime surface.");
      if (request.intelligence !== "npc") throw new Error("NPC autonomy requires npc runtime intelligence.");

      const goal = selectNpcGoal(candidates ?? []);
      const autonomousRequest = {
        ...request,
        goal: goal?.kind ?? request.goal,
      };
      const result = await orchestrator.run(autonomousRequest, { maxActions: maxActionsPerTick });
      const allowedActions = result.decision.actions.slice(0, maxActionsPerTick);

      return {
        ...result,
        request: autonomousRequest,
        autonomous: true,
        goal,
        actionBudget: {
          requested: result.decision.actions.length,
          allowed: allowedActions.length,
          blocked: Math.max(0, result.decision.actions.length - allowedActions.length),
        },
      };
    },
  };
}
