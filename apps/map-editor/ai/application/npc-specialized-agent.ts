import type { RuntimeBehaviorKind } from "../domain/runtime-behavior";
import type { RuntimeGoalKind, NpcGoalMemory } from "../domain/runtime-goal";
import type { RuntimeObservation } from "../domain/runtime";
import { npcArchetypeCapabilities } from "./npc-archetype-capabilities";
import type { NpcArchetype } from "./npc-archetype-schema";
import type { NpcRole } from "./npc-role-schema";
import { NPC_ROLES } from "./npc-role-schema";
import { validateNpcDecisionProfile, type NpcDecisionProfile } from "./npc-decision-profile-schema";

export type NpcSpecializationId =
  | "production"
  | "security"
  | "commerce"
  | "civilian"
  | "companion"
  | "animal"
  | "special"
  | "custom";

export interface NpcSpecialization {
  id: NpcSpecializationId;
  role?: NpcRole;
  archetype?: NpcArchetype;
  allowedGoals: readonly RuntimeGoalKind[];
  allowedBehaviors: readonly RuntimeBehaviorKind[];
  preferredGoals: readonly RuntimeGoalKind[];
  preferredBehaviors: readonly RuntimeBehaviorKind[];
  coordinationTags: readonly string[];
}

/**
 * Specialized NPC agents are policy descriptors, not a second decision engine.
 * Goal selection, behavior selection, execution and verification remain authoritative
 * in the existing NPC runtime loop.
 */
export interface NpcSpecializedAgent {
  specialization: NpcSpecialization;
  canUseGoal(goal: RuntimeGoalKind): boolean;
  canUseBehavior(behavior: RuntimeBehaviorKind): boolean;
  continuityWeight(goal: RuntimeGoalKind, memory?: NpcGoalMemory): number;
}

const SPECIALIZATION_BY_ARCHETYPE: Record<NpcArchetype, NpcSpecializationId> = {
  production: "production",
  military: "security",
  civilian: "civilian",
  merchant: "commerce",
  worker: "production",
  companion: "companion",
  enemy: "security",
  animal: "animal",
  special: "special",
  custom: "custom",
};

const ROLE_PREFERENCES: Partial<Record<NpcRole, {
  goals: readonly RuntimeGoalKind[];
  behaviors: readonly RuntimeBehaviorKind[];
  tags: readonly string[];
}>> = {
  farmer: { goals: ["work", "eat", "sleep"], behaviors: ["work", "go-to-location", "eat", "sleep"], tags: ["production", "food"] },
  miner: { goals: ["work", "eat", "sleep"], behaviors: ["work", "go-to-location", "eat", "sleep"], tags: ["production", "resource"] },
  blacksmith: { goals: ["work", "eat", "sleep"], behaviors: ["work", "go-to-location", "eat", "sleep"], tags: ["production", "crafting"] },
  guard: { goals: ["respond-to-event", "go-to-location", "sleep"], behaviors: ["respond-to-event", "flee", "investigate", "go-to-location", "sleep"], tags: ["security", "protection"] },
  scout: { goals: ["respond-to-event", "go-to-location", "sleep"], behaviors: ["investigate", "go-to-location", "flee", "respond-to-event"], tags: ["security", "recon"] },
  soldier: { goals: ["respond-to-event", "go-to-location", "sleep"], behaviors: ["respond-to-event", "investigate", "flee", "go-to-location", "sleep"], tags: ["security", "combat"] },
  shopkeeper: { goals: ["work", "socialize", "eat", "sleep"], behaviors: ["work", "socialize", "go-to-location", "eat", "sleep"], tags: ["commerce", "service"] },
  trader: { goals: ["work", "socialize", "go-to-location", "eat", "sleep"], behaviors: ["work", "socialize", "go-to-location", "eat", "sleep"], tags: ["commerce", "trade"] },
  parent: { goals: ["socialize", "eat", "sleep", "go-to-location"], behaviors: ["socialize", "follow-player", "go-to-location", "eat", "sleep"], tags: ["civilian", "family"] },
  companion: { goals: ["socialize", "go-to-location", "eat", "sleep"], behaviors: ["follow-player", "socialize", "go-to-location", "eat", "sleep"], tags: ["companion", "support"] },
  animal: { goals: ["eat", "sleep", "go-to-location"], behaviors: ["eat", "sleep", "wander", "go-to-location"], tags: ["animal", "survival"] },
};

const DEFAULT_GOALS: readonly RuntimeGoalKind[] = ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"];
const DEFAULT_BEHAVIORS: readonly RuntimeBehaviorKind[] = ["idle", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"];

function readDecisionProfile(observation: RuntimeObservation): NpcDecisionProfile | undefined {
  const state = observation.perception?.self?.state;
  if (!state || typeof state.decisionProfile !== "object" || state.decisionProfile === null || Array.isArray(state.decisionProfile)) return undefined;
  return state.decisionProfile as NpcDecisionProfile;
}

function intersect<T>(requested: readonly T[], allowed: readonly T[]): T[] {
  return requested.filter(value => allowed.includes(value));
}

export function resolveNpcSpecialization(observation: RuntimeObservation): NpcSpecializedAgent {
  const profile = readDecisionProfile(observation);
  const archetype = profile?.archetype;
  const role = profile?.role;
  const baseId = archetype ? SPECIALIZATION_BY_ARCHETYPE[archetype] : "custom";
  const rolePreferences = role ? ROLE_PREFERENCES[role] : undefined;
  const capabilities = archetype ? npcArchetypeCapabilities(archetype) : undefined;
  const allowedGoals = capabilities?.goals ?? [];
  const allowedBehaviors = capabilities?.behaviors ?? [];
  const preferredGoals = intersect(rolePreferences?.goals ?? allowedGoals, allowedGoals);
  const preferredBehaviors = intersect(rolePreferences?.behaviors ?? allowedBehaviors, allowedBehaviors);
  const tags = [...new Set([baseId, ...(rolePreferences?.tags ?? []), ...(archetype ? [archetype] : [])])];

  const specialization: NpcSpecialization = {
    id: baseId,
    role,
    archetype,
    allowedGoals,
    allowedBehaviors,
    preferredGoals,
    preferredBehaviors,
    coordinationTags: tags,
  };

  return {
    specialization,
    canUseGoal: goal => specialization.allowedGoals.includes(goal),
    canUseBehavior: behavior => specialization.allowedBehaviors.includes(behavior),
    continuityWeight: (goal, memory) => {
      if (memory?.lastGoal === goal) return specialization.preferredGoals.includes(goal) ? 7 : 5;
      return specialization.preferredGoals.includes(goal) ? 2 : 0;
    },
  };
}

export function validateNpcSpecialization(observation: RuntimeObservation): { ok: boolean; errors: string[] } {
  const profile = readDecisionProfile(observation);
  const validation = validateNpcDecisionProfile(profile);
  if (!validation.ok) return validation;
  const agent = resolveNpcSpecialization(observation);
  const errors = [...validation.errors];
  if (profile?.role && !(NPC_ROLES as readonly string[]).includes(profile.role)) {
    errors.push("NPC specialization requires a supported role.");
  }
  if (profile?.capabilities?.goals) {
    for (const goal of profile.capabilities.goals) {
      if (typeof goal === "string" && !agent.canUseGoal(goal as RuntimeGoalKind)) errors.push("Specialization does not allow requested goal: " + goal + ".");
    }
  }
  return { ok: errors.length === 0, errors };
}
