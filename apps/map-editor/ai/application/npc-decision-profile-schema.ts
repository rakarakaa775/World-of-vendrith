import type { NpcArchetype } from "./npc-archetype-schema";
import type { NpcRole } from "./npc-role-schema";
import type { NpcCapabilityRequest } from "./npc-archetype-capabilities";
import type { NpcPersonalityRequest } from "./npc-personality-schema";
import type { NpcPersonalityPolicy } from "./npc-personality-policy-schema";
import { validateNpcArchetype } from "./npc-archetype-schema";
import { validateNpcRole } from "./npc-role-schema";
import { validateNpcCapabilities, npcArchetypeCapabilities } from "./npc-archetype-capabilities";
import { validateNpcPersonality } from "./npc-personality-schema";
import { validateNpcPersonalityPolicy } from "./npc-personality-policy-schema";
import { validateNpcRelationships, type NpcRelationship } from "./npc-relationship-schema";
import { validateNpcRelationshipPolicy, type NpcRelationshipPolicy } from "./npc-relationship-policy-schema";

export interface NpcDecisionProfile {
  archetype?: NpcArchetype;
  role?: NpcRole;
  capabilities?: NpcCapabilityRequest;
  personality?: NpcPersonalityRequest;
  personalityPolicy?: NpcPersonalityPolicy;
  relationships?: readonly NpcRelationship[];
  relationshipPolicy?: NpcRelationshipPolicy;
}
export interface NpcDecisionProfileValidation { ok: boolean; errors: string[]; }

export const NPC_DECISION_PROFILE_SCHEMA = {
  fields: ["archetype", "role", "capabilities", "personality", "personalityPolicy", "relationships", "relationshipPolicy"],
  semantics: "A validated composition contract. Descriptive fields do not activate runtime effects; explicit personality policy may affect only capabilities already allowed by the archetype.",
} as const;

export function validateNpcDecisionProfile(value: unknown): NpcDecisionProfileValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["NPC decision profile must be an object."] };
  const profile = value as NpcDecisionProfile;
  const errors: string[] = [];
  const archetype = validateNpcArchetype(profile.archetype);
  const role = validateNpcRole(profile.role, profile.archetype);
  const capabilities = profile.archetype === undefined || !archetype.ok
    ? { ok: profile.capabilities === undefined || Object.keys(profile.capabilities).length === 0, errors: profile.capabilities === undefined || Object.keys(profile.capabilities).length === 0 ? [] : ["A supported NPC archetype is required to validate requested capabilities."] }
    : validateNpcCapabilities(profile.archetype, profile.capabilities ?? {});
  const personality = validateNpcPersonality(profile.personality);
  const policy = validateNpcPersonalityPolicy(profile.personalityPolicy);
  const relationships = validateNpcRelationships(profile.relationships);
  const relationshipPolicy = validateNpcRelationshipPolicy(profile.relationshipPolicy);
  errors.push(...archetype.errors, ...role.errors, ...capabilities.errors, ...personality.errors, ...policy.errors, ...relationships.errors, ...relationshipPolicy.errors);
  if (profile.archetype && policy.ok && profile.personalityPolicy?.rules) {
    const allowed = npcArchetypeCapabilities(profile.archetype);
    for (const rule of profile.personalityPolicy.rules) {
      for (const kind of Object.keys(rule.behaviors ?? {})) if (!allowed.behaviors.includes(kind as never)) errors.push(`Personality policy behavior is outside archetype capabilities: ${kind}.`);
      for (const kind of Object.keys(rule.goals ?? {})) if (!allowed.goals.includes(kind as never)) errors.push(`Personality policy goal is outside archetype capabilities: ${kind}.`);
    }
  }
  if (profile.archetype && relationshipPolicy.ok && profile.relationshipPolicy?.rules) {
    const allowed = npcArchetypeCapabilities(profile.archetype);
    for (const rule of profile.relationshipPolicy.rules) {
      for (const kind of Object.keys(rule.behaviors ?? {})) if (!allowed.behaviors.includes(kind as never)) errors.push(`Relationship policy behavior is outside archetype capabilities: ${kind}.`);
      for (const kind of Object.keys(rule.goals ?? {})) if (!allowed.goals.includes(kind as never)) errors.push(`Relationship policy goal is outside archetype capabilities: ${kind}.`);
    }
  }
  return { ok: errors.length === 0, errors };
}
