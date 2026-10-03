import type { RuntimeBehaviorKind } from "../domain/runtime-behavior";
import type { RuntimeGoalKind } from "../domain/runtime-goal";
import { NPC_ARCHETYPES, type NpcArchetype } from "./npc-archetype-schema";

export interface NpcArchetypeCapabilities {
  behaviors: readonly RuntimeBehaviorKind[];
  goals: readonly RuntimeGoalKind[];
}

export interface NpcCapabilityRequest {
  behaviors?: readonly string[];
  goals?: readonly string[];
}

export interface NpcCapabilityValidation {
  ok: boolean;
  errors: string[];
}

const ALL_BEHAVIORS: readonly RuntimeBehaviorKind[] = ["idle", "follow-player", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"];
const ALL_GOALS: readonly RuntimeGoalKind[] = ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"];

const ARCHETYPE_CAPABILITIES: Record<NpcArchetype, NpcArchetypeCapabilities> = {
  production: { behaviors: ["idle", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"] },
  military: { behaviors: ["idle", "follow-player", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["work", "sleep", "socialize", "go-to-location", "respond-to-event"] },
  civilian: { behaviors: ["idle", "follow-player", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"] },
  merchant: { behaviors: ["idle", "follow-player", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"] },
  worker: { behaviors: ["idle", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"] },
  companion: { behaviors: ["idle", "follow-player", "wander", "investigate", "flee", "work", "eat", "sleep", "socialize", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["eat", "sleep", "socialize", "go-to-location", "respond-to-event"] },
  enemy: { behaviors: ["idle", "wander", "investigate", "flee", "work", "eat", "sleep", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["go-to-location", "respond-to-event"] },
  animal: { behaviors: ["idle", "wander", "investigate", "flee", "work", "eat", "sleep", "routine", "free-time", "rest", "recreation", "social", "go-to-location", "respond-to-event"], goals: ["eat", "sleep", "go-to-location", "respond-to-event"] },
  special: { behaviors: ALL_BEHAVIORS, goals: ALL_GOALS },
  custom: { behaviors: [], goals: [] },
};

export const NPC_ARCHETYPE_CAPABILITY_SCHEMA = {
  archetypes: NPC_ARCHETYPES,
  behaviorKinds: ALL_BEHAVIORS,
  goalKinds: ALL_GOALS,
  semantics: "Capabilities are an allow-list for explicitly requested runtime behavior/goal kinds. They do not automatically activate any behavior or goal.",
} as const;

export function npcArchetypeCapabilities(archetype: NpcArchetype): NpcArchetypeCapabilities {
  return ARCHETYPE_CAPABILITIES[archetype];
}

export function validateNpcCapabilities(
  archetype: unknown,
  request: unknown,
): NpcCapabilityValidation {
  if (typeof request !== "object" || request === null || Array.isArray(request)) {
    return { ok: false, errors: ["NPC capability request must be an object."] };
  }
  if (archetype === undefined) {
    const value = request as NpcCapabilityRequest;
    const hasRequestedCapabilities = (value.behaviors?.length ?? 0) > 0 || (value.goals?.length ?? 0) > 0;
    return hasRequestedCapabilities
      ? { ok: false, errors: ["A supported NPC archetype is required to validate requested capabilities."] }
      : { ok: true, errors: [] };
  }
  if (typeof archetype !== "string" || !(NPC_ARCHETYPES as readonly string[]).includes(archetype)) {
    return { ok: false, errors: ["A supported NPC archetype is required to validate capabilities."] };
  }

  const capabilities = ARCHETYPE_CAPABILITIES[archetype as NpcArchetype];
  const value = request as NpcCapabilityRequest;
  const errors: string[] = [];
  for (const kind of value.behaviors ?? []) {
    if (typeof kind !== "string" || !ALL_BEHAVIORS.includes(kind as RuntimeBehaviorKind)) {
      errors.push("Unsupported runtime behavior kind: " + String(kind) + ".");
    } else if (!capabilities.behaviors.includes(kind as RuntimeBehaviorKind)) {
      errors.push("NPC archetype " + archetype + " does not allow behavior: " + kind + ".");
    }
  }
  for (const kind of value.goals ?? []) {
    if (typeof kind !== "string" || !ALL_GOALS.includes(kind as RuntimeGoalKind)) {
      errors.push("Unsupported runtime goal kind: " + String(kind) + ".");
    } else if (!capabilities.goals.includes(kind as RuntimeGoalKind)) {
      errors.push("NPC archetype " + archetype + " does not allow goal: " + kind + ".");
    }
  }
  return { ok: errors.length === 0, errors };
}
