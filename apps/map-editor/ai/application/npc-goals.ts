import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation, RuntimeAction } from "../domain/runtime";
import type { NpcNeedState, NpcGoalPolicy, RuntimeGoal, NpcGoalMemory, NpcGoalMemoryStore } from "../domain/runtime-goal";
import { createRuntimeDecision } from "./runtime-decision";
import {
  applyEnvironmentNpcGoalPriority,
  applyEnvironmentNpcNeeds,
  applyNpcPersonalityGoalPriority,
  applyNpcRelationshipGoalPriority,
} from "./environment-npc-effects";
import { enforceNpcDecisionProfileGoals } from "./npc-decision-enforcement";
import { isHourInSchedule, type NpcScheduleEntry } from "../domain/runtime-schedule";
import type { NpcDecisionProfile } from "./npc-decision-profile-schema";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export const defaultNpcGoalPolicy: NpcGoalPolicy = {
  choose(_observation, _needs, goals) {
    return [...goals].sort((a, b) => b.priority - a.priority)[0];
  },
};

function decisionProfile(observation: RuntimeObservation): NpcDecisionProfile | undefined {
  const state = observation.perception?.self?.state;
  if (!state || typeof state.decisionProfile !== "object" || state.decisionProfile === null || Array.isArray(state.decisionProfile)) return undefined;
  return state.decisionProfile as NpcDecisionProfile;
}

function scheduledEntries(observation: RuntimeObservation): NpcScheduleEntry[] {
  const self = observation.perception?.self;
  const schedule = decisionProfile(observation)?.schedule;
  if (!self || self.kind !== "npc" || !schedule || schedule.npcId !== self.id) return [];
  return schedule.entries
    .filter(entry => isHourInSchedule(observation.state.clock.hour, entry))
    .sort((a, b) => b.priority - a.priority);
}

export function createNpcGoalCandidates(
  observation: RuntimeObservation,
  needs: NpcNeedState,
): RuntimeGoal[] {
  const goals: RuntimeGoal[] = [];

  for (const entry of scheduledEntries(observation)) {
    goals.push({
      kind: entry.goal,
      priority: entry.priority,
      reason: `Scheduled ${entry.goal} activity is active for the current game hour.`,
      targetLocation: entry.location,
      expiresAtTick: observation.state.clock.tick + 1,
    });
  }

  if (clamp(needs.safety) < 30) {
    goals.push({
      kind: "respond-to-event",
      priority: 100 + (30 - clamp(needs.safety)),
      reason: "Safety need is critically low.",
      targetEventId: observation.state.activeEventIds[0],
      expiresAtTick: observation.state.clock.tick + 1,
    });
  }

  if (clamp(needs.hunger) >= 70) {
    goals.push({
      kind: "eat",
      priority: 80 + clamp(needs.hunger),
      reason: "Hunger need is high.",
      expiresAtTick: observation.state.clock.tick + 5,
    });
  }

  if (clamp(needs.energy) >= 70) {
    goals.push({
      kind: "sleep",
      priority: 70 + clamp(needs.energy),
      reason: "Energy need is low.",
      expiresAtTick: observation.state.clock.tick + 5,
    });
  }

  if (observation.state.activeEventIds.length > 0) {
    goals.push({
      kind: "respond-to-event",
      priority: 60,
      reason: "An active world event requires an NPC response.",
      targetEventId: observation.state.activeEventIds[0],
      expiresAtTick: observation.state.clock.tick + 2,
    });
  }

  goals.push({
    kind: "work",
    priority: 0,
    reason: "No higher-priority need currently requires attention.",
  });

  return goals;
}

function goalToAction(observation: RuntimeObservation, goal: RuntimeGoal): RuntimeAction {
  const actionType: Record<RuntimeGoal["kind"], string> = {
    work: "npc.work",
    eat: "npc.eat",
    sleep: "npc.sleep",
    "go-to-location": "npc.go-to-location",
    "respond-to-event": "npc.respond-to-event",
  };

  return {
    id: `${observation.id}:goal:${goal.kind}`,
    intelligence: "npc",
    type: actionType[goal.kind],
    payload: {
      goal: goal.kind,
      priority: goal.priority,
      ...(goal.targetLocation ? { targetLocation: goal.targetLocation } : {}),
      ...(goal.targetEventId ? { targetEventId: goal.targetEventId } : {}),
    },
    risk: "safe",
    reason: goal.reason,
  };
}

export function decideNpcGoal(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  needs: NpcNeedState,
  policy: NpcGoalPolicy = defaultNpcGoalPolicy,
  memoryStore?: NpcGoalMemoryStore,
): RuntimeDecision {
  const npc = observation.perception?.self;
  if (!npc || npc.kind !== "npc") {
    throw new Error("NPC goal selection requires an NPC self entity.");
  }

  const effectiveNeeds = applyEnvironmentNpcNeeds(observation, needs);
  const goals = enforceNpcDecisionProfileGoals(
    observation,
    applyNpcRelationshipGoalPriority(
      observation,
      applyNpcPersonalityGoalPriority(
        observation,
        applyEnvironmentNpcGoalPriority(
          observation,
          createNpcGoalCandidates(observation, effectiveNeeds),
        ),
      ),
    ),
  );
  const selected = policy.choose(observation, effectiveNeeds, goals);
  if (!selected) {
    throw new Error("NPC goal selection requires at least one goal.");
  }

  const memory: NpcGoalMemory = {
    npcId: npc.id,
    stateVersion: observation.state.stateVersion,
    lastGoal: selected.kind,
    updatedAtTick: observation.state.clock.tick,
  };
  memoryStore?.set(memory);

  return createRuntimeDecision(request, observation, {
    actions: [goalToAction(observation, selected)],
    evidence: observation.facts,
    expiresAtTick: selected.expiresAtTick,
  });
}
