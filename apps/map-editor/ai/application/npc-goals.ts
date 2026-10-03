import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation, RuntimeAction } from "../domain/runtime";
import type { NpcNeedState, NpcGoalPolicy, RuntimeGoal, NpcGoalMemory, NpcGoalMemoryStore } from "../domain/runtime-goal";
import { createRuntimeDecision } from "./runtime-decision";
import {
  applyEnvironmentNpcGoalPriority,
  applyEnvironmentNpcNeeds,
} from "./environment-npc-effects";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export const defaultNpcGoalPolicy: NpcGoalPolicy = {
  choose(_observation, _needs, goals) {
    return [...goals].sort((a, b) => b.priority - a.priority)[0];
  },
};

export function createNpcGoalCandidates(
  observation: RuntimeObservation,
  needs: NpcNeedState,
): RuntimeGoal[] {
  const goals: RuntimeGoal[] = [];

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
    priority: 10,
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
  const goals = applyEnvironmentNpcGoalPriority(
    observation,
    createNpcGoalCandidates(observation, effectiveNeeds),
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
