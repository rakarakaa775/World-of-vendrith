import type { RuntimeAiRequest } from "../domain/runtime";
import { selectNpcGoal, type NpcGoal, type NpcGoalCandidate } from "../domain/npc-autonomy";
import type {
  RuntimeActionExecution,
  RuntimeOrchestrator,
  RuntimeRunResult,
} from "./runtime-orchestrator";

export interface NpcAutonomyPolicy {
  /**
   * Maximum number of authoritative runtime actions an NPC may attempt in one
   * autonomy tick. This is an additional guard above the global tool-loop
   * budget.
   */
  maxActionsPerTick: number;
}

export interface NpcAutonomyTickResult extends RuntimeRunResult {
  goal: NpcGoal;
  autonomous: true;
  actionBudget: {
    requested: number;
    allowed: number;
    blocked: number;
  };
}

export interface NpcAutonomyAgent {
  tick(request: RuntimeAiRequest): Promise<NpcAutonomyTickResult>;
}

function clampBudget(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("NPC autonomy maxActionsPerTick must be a finite non-negative number.");
  }
  return Math.floor(value);
}

/**
 * Bounded autonomous NPC controller.
 *
 * NPC autonomy is deliberately a thin policy layer over the authoritative
 * RuntimeOrchestrator. It may repeatedly be called by the game tick scheduler,
 * but it never gains direct access to development tools, ECC, repositories, or
 * database mutation APIs.
 */
export function createNpcAutonomyAgent(
  orchestrator: RuntimeOrchestrator,
  policy: NpcAutonomyPolicy = { maxActionsPerTick: 1 },
): NpcAutonomyAgent {
  const maxActionsPerTick = clampBudget(policy.maxActionsPerTick);

  return {
    async tick(request, candidates = []) {
      if (request.surface !== "game") {
        throw new Error("NPC autonomy requires the game runtime surface.");
      }
      if (request.intelligence !== "npc") {
        throw new Error("NPC autonomy requires npc runtime intelligence.");
      }

      const goal = selectNpcGoal(candidates);\n      const autonomousRequest = { ...request, goal: goal.kind === "idle" ? request.goal : goal.kind };\n      const result = await orchestrator.run(autonomousRequest, {
        maxActions: maxActionsPerTick,
      });
      const allowedActions = result.decision.actions.slice(0, maxActionsPerTick);

      return {
        ...result,
        autonomous: true,
        actionBudget: {
          requested: result.decision.actions.length,
          allowed: allowedActions.length,
          blocked: Math.max(0, result.decision.actions.length - allowedActions.length),
        },
      };
    },
  };
}
