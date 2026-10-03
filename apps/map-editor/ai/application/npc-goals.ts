import type { RuntimeAiRequest, RuntimeDecision, RuntimeObservation, RuntimeAction } from "../domain/runtime";
import type { NpcNeedState, NpcGoalPolicy, RuntimeGoal, NpcGoalMemory, NpcGoalMemoryStore } from "../domain/runtime-goal";
import { createRuntimeDecision } from "./runtime-decision";
import { calculateNpcSchedulePressure } from "./npc-schedule";
import { arbitrateNpcGoal } from "./npc-goal-intelligence";
import {
  applyEnvironmentNpcGoalPriority,
  applyEnvironmentNpcNeeds,
  applyNpcPersonalityGoalPriority,
  applyNpcRelationshipGoalPriority,
} from "./environment-npc-effects";
import { enforceNpcDecisionProfileGoals } from "./npc-decision-enforcement";
import { isHourInSchedule, type NpcScheduleEntry } from "../domain/runtime-schedule";
import type { NpcDecisionProfile } from "./npc-decision-profile-schema";
import { createNpcDailyLifeGoalFromSchedule } from "../domain/runtime-daily-life";
import { rankNpcRelationshipTargets } from "./npc-relationship-intelligence";
import { createNpcRelationshipMemoryStore, type NpcRelationshipMemoryStore } from "./npc-social-interaction-schema";
import { selectNpcSocialInteraction } from "./npc-social-interaction-selection";
import { chooseNpcGroupBehavior } from "./npc-social-intelligence";
import { applyNpcWorldAwarenessToGoal, createNpcWorldAwareness, hasNpcWorldResource, rankWorldLocations } from "./npc-world-awareness";

function clamp(value: number): number { return Math.max(0, Math.min(100, value)); }

export const defaultNpcGoalPolicy: NpcGoalPolicy = {
  choose(observation, _needs, goals, memory) {
    return arbitrateNpcGoal(observation, goals, memory).selected;
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
  return schedule.entries.filter(entry => isHourInSchedule(observation.state.clock.hour, entry)).sort((a, b) => b.priority - a.priority);
}

export function createNpcGoalCandidates(
  observation: RuntimeObservation,
  needs?: NpcNeedState,
  relationshipMemoryStore: NpcRelationshipMemoryStore = createNpcRelationshipMemoryStore(),
): RuntimeGoal[] {
  const goals: RuntimeGoal[] = [];
  const worldAwareness = createNpcWorldAwareness(observation);
  for (const entry of scheduledEntries(observation)) {
    const pressure = calculateNpcSchedulePressure(observation, entry);
    const dailyLifeGoal = createNpcDailyLifeGoalFromSchedule(entry);
    goals.push({
      kind: dailyLifeGoal.kind,
      targetLocation: dailyLifeGoal.targetLocation,
      locationRole: dailyLifeGoal.locationRole,
      dailyLifeActivity: dailyLifeGoal.activity,
      priority: entry.priority + pressure,
      reason: `Scheduled ${entry.goal} activity is active for the current game hour${pressure > 0 ? ` and has ${pressure} points of schedule pressure.` : "."}`,
      expiresAtTick: observation.state.clock.tick + 1,
    });
  }

  if (needs && clamp(needs.safety) < 30) {
    goals.push({ kind: "respond-to-event", priority: 100 + (30 - clamp(needs.safety)), reason: "Safety need is critically low.", targetEventId: observation.state.activeEventIds[0], expiresAtTick: observation.state.clock.tick + 1 });
  }
  if (needs && clamp(needs.hunger) >= 70) {
    goals.push({ kind: "eat", priority: 80 + clamp(needs.hunger), reason: "Hunger need is high.", expiresAtTick: observation.state.clock.tick + 5 });
  }
  if (needs && clamp(needs.energy) >= 70) {
    goals.push({ kind: "sleep", priority: 70 + clamp(needs.energy), reason: "Energy need is low.", expiresAtTick: observation.state.clock.tick + 5 });
  }
  if (needs && clamp(needs.social) >= 60) {
    const relationships = decisionProfile(observation)?.relationships ?? [];
    const targetIds = (observation.perception?.nearbyEntities ?? [])
      .filter(entity => entity.kind === "npc" && entity.id !== observation.perception?.self?.id)
      .map(entity => entity.id);
    const target = rankNpcRelationshipTargets(
      relationships,
      targetIds,
      observation.perception?.self?.id ?? "",
      relationshipMemoryStore,
    )[0];
    if (target) {
      const relationship = relationships.find(item => item.targetNpcId === target.targetNpcId);
      const groupBehavior = chooseNpcGroupBehavior({
        npcId: observation.perception?.self?.id ?? "",
        memberNpcIds: targetIds,
        relationships,
        socialNeed: needs.social,
      });
      if (groupBehavior.action !== "avoid" && groupBehavior.action !== "split") {
        const interaction = selectNpcSocialInteraction({
          relationship,
          interactionCount: target.interactionCount,
          socialNeed: needs.social,
        });
        goals.push({
          kind: "socialize",
          priority: 55 + clamp(needs.social) + Math.round(target.utility) + (groupBehavior.action === "cooperate" ? 10 : 0),
          reason: `Social need is elevated; relationship utility selected ${target.targetNpcId}; interaction ${interaction.type} selected deterministically.`,
        targetNpcId: target.targetNpcId,
        socialInteractionType: interaction.type,
        expiresAtTick: observation.state.clock.tick + 5,
      });
      }
    }
  }
  if (observation.state.activeEventIds.length > 0) {
    goals.push({ kind: "respond-to-event", priority: 60, reason: "An active world event requires an NPC response.", targetEventId: observation.state.activeEventIds[0], expiresAtTick: observation.state.clock.tick + 2 });
  }
  if (worldAwareness.hazards.length > 0 && worldAwareness.resources.includes("shelter")) {
    const shelterEntities = (observation.perception?.nearbyEntities ?? []).filter(entity => hasNpcWorldResource(entity, "shelter"));
    const shelter = rankWorldLocations(observation, shelterEntities)[0];
    if (shelter) {
      goals.push({
        kind: "go-to-location",
        priority: 120 + worldAwareness.hazards.length * 10,
        reason: "World hazard detected; navigate to the nearest explicitly tagged shelter.",
        targetLocation: { mapId: shelter.mapId, x: shelter.position.x, y: shelter.position.y },
        expiresAtTick: observation.state.clock.tick + 3,
      });
    }
  }
  for (const resourceNeed of worldAwareness.resourceNeeds) {
    if (resourceNeed === "shelter" || !worldAwareness.resources.includes(resourceNeed)) continue;
    const candidates = (observation.perception?.nearbyEntities ?? []).filter(entity => hasNpcWorldResource(entity, resourceNeed));
    const ranked = rankWorldLocations(observation, candidates)[0];
    if (ranked) {
      goals.push({
        kind: "go-to-location",
        priority: 105,
        reason: "World state requires the " + resourceNeed + " resource; navigate to the nearest explicitly tagged location.",
        targetLocation: { mapId: ranked.mapId, x: ranked.position.x, y: ranked.position.y },
        expiresAtTick: observation.state.clock.tick + 3,
      });
      break;
    }
  }
  goals.push({ kind: "work", priority: 0, reason: "No higher-priority need currently requires attention." });
  return goals.map(goal => ({
    ...goal,
    priority: applyNpcWorldAwarenessToGoal({ awareness: worldAwareness, goal: goal.kind, priority: goal.priority, needs: needs ? { hunger: needs.hunger, energy: needs.energy, social: needs.social, safety: needs.safety } : undefined }),
  }));
}

function goalToAction(observation: RuntimeObservation, goal: RuntimeGoal): RuntimeAction {
  const actionType: Record<RuntimeGoal["kind"], string> = { work: "npc.work", eat: "npc.eat", sleep: "npc.sleep", socialize: "npc.socialize", "go-to-location": "npc.go-to-location", "respond-to-event": "npc.respond-to-event" };
  return {
    id: `${observation.id}:goal:${goal.kind}:${goal.targetLocation ? `${goal.targetLocation.mapId}:${goal.targetLocation.x}:${goal.targetLocation.y}` : goal.targetNpcId ?? goal.targetEventId ?? "self"}`,
    intelligence: "npc",
    type: actionType[goal.kind],
    payload: {
      goal: goal.kind,
      priority: goal.priority,
      ...(goal.targetLocation ? { targetLocation: goal.targetLocation } : {}),
      ...(goal.targetEventId ? { targetEventId: goal.targetEventId } : {}),
      ...(goal.targetNpcId ? { targetNpcId: goal.targetNpcId } : {}),
      ...(goal.socialInteractionType ? { socialInteractionType: goal.socialInteractionType } : {}),
      ...(goal.locationRole ? { locationRole: goal.locationRole } : {}),
      ...(goal.dailyLifeActivity ? { dailyLifeActivity: goal.dailyLifeActivity } : {}),
    },
    risk: "safe",
    reason: goal.reason,
  };
}

export function decideNpcGoal(
  request: RuntimeAiRequest,
  observation: RuntimeObservation,
  needs?: NpcNeedState,
  policy: NpcGoalPolicy = defaultNpcGoalPolicy,
  memoryStore?: NpcGoalMemoryStore,
  relationshipMemoryStore: NpcRelationshipMemoryStore = createNpcRelationshipMemoryStore(),
): RuntimeDecision {
  const npc = observation.perception?.self;
  if (!npc || npc.kind !== "npc") throw new Error("NPC goal selection requires an NPC self entity.");
  const effectiveNeeds = needs ? applyEnvironmentNpcNeeds(observation, needs) : undefined;
  const goals = enforceNpcDecisionProfileGoals(observation, applyNpcRelationshipGoalPriority(observation, applyNpcPersonalityGoalPriority(observation, applyEnvironmentNpcGoalPriority(observation, createNpcGoalCandidates(observation, effectiveNeeds, relationshipMemoryStore)))));
  const previousMemory = memoryStore?.get(npc.id);
  const selected = policy.choose(observation, effectiveNeeds, goals, previousMemory);
  if (!selected) throw new Error("NPC goal selection requires at least one goal.");
  const memory: NpcGoalMemory = { npcId: npc.id, stateVersion: observation.state.stateVersion, lastGoal: selected.kind, lastGoalPriority: selected.priority, updatedAtTick: observation.state.clock.tick };
  memoryStore?.set(memory);
  return createRuntimeDecision(request, observation, { actions: [goalToAction(observation, selected)], evidence: observation.facts, expiresAtTick: selected.expiresAtTick });
}
