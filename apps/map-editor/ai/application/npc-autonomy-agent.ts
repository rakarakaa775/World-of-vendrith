import type { RuntimeAiRequest } from "../domain/runtime";
import { selectNpcGoal, type NpcGoal, type NpcGoalCandidate, type NpcAutonomySignals } from "../domain/npc-autonomy";
import type { RuntimeOrchestrator, RuntimeRunResult } from "./runtime-orchestrator";

export interface NpcAutonomyPolicy {
  maxActionsPerTick: number;
}

export interface NpcAutonomyTickResult extends RuntimeRunResult {
  goal: NpcGoal;
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

function readSignals(request: RuntimeAiRequest): NpcAutonomySignals | undefined {
  const state = request.observation.perception?.self?.state;
  if (!state || typeof state.autonomy !== "object" || state.autonomy === null) return undefined;
  return state.autonomy as NpcAutonomySignals;
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
      const signals = readSignals(request);
      const goal = selectNpcGoal(candidates ?? (signals ? buildNpcGoalCandidates(signals) : []));
      const autonomousRequest = { ...request, goal: goal.kind === "idle" ? request.goal : goal.kind };
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

function buildNpcGoalCandidates(signals: NpcAutonomySignals): readonly NpcGoalCandidate[] {
  const candidates: NpcGoalCandidate[] = [];
  if (typeof signals.survivalRisk === "number") candidates.push({ kind: "survive", urgency: signals.survivalRisk, importance: 100, reason: "Authoritative runtime reports a survival risk." });
  if (typeof signals.energy === "number") {
    const maxEnergy = signals.maxEnergy ?? 100;
    const deficit = maxEnergy > 0 ? (1 - signals.energy / maxEnergy) * 100 : 0;
    candidates.push({ kind: "recover-energy", urgency: deficit, importance: 80, reason: "Energy deficit requires recovery consideration." });
  }
  if (signals.scheduledActivityDue) candidates.push({ kind: "work", urgency: signals.scheduleUrgency ?? 70, importance: 70, reason: "The authoritative schedule reports an activity is due." });
  if (signals.socialOpportunity) candidates.push({ kind: "socialize", urgency: signals.socialUrgency ?? 40, importance: 40, reason: "A social opportunity is available in the observed runtime state." });
  if (signals.explorationAvailable) candidates.push({ kind: "explore", urgency: signals.explorationUrgency ?? 20, importance: 20, reason: "Exploration is available in the observed runtime state." });
  return candidates;
}