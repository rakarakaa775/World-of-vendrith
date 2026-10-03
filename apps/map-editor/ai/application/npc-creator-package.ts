import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicyValidation } from "./npc-environment-policy-schema";
import { validateNpcArchetype, type NpcArchetype, type NpcArchetypeValidation } from "./npc-archetype-schema";
import { validateNpcCapabilities, type NpcCapabilityRequest, type NpcCapabilityValidation } from "./npc-archetype-capabilities";
import { validateNpcRole, type NpcRole, type NpcRoleValidation } from "./npc-role-schema";
import { validateNpcPersonality, type NpcPersonalityRequest, type NpcPersonalityValidation } from "./npc-personality-schema";
import { validateNpcPersonalityPolicy, type NpcPersonalityPolicy, type NpcPersonalityPolicyValidation } from "./npc-personality-policy-schema";
import { validateNpcDecisionProfile, type NpcDecisionProfile } from "./npc-decision-profile-schema";
import { buildNpcRuntimeSpawnContract, type NpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";

export interface CreatorNpcEnvironmentPackage {
  npc: {
    id: string;
    name?: string;
    archetype?: NpcArchetype;
    environmentPolicy: Record<string, unknown>;
  };
  validation: NpcEnvironmentPolicyValidation;
}

export interface CreatorNpcPackage {
  npc: CreatorNpcEnvironmentPackage["npc"] & { role?: NpcRole; capabilities?: NpcCapabilityRequest; personality?: NpcPersonalityRequest; personalityPolicy?: NpcPersonalityPolicy };
  validation: NpcEnvironmentPolicyValidation & NpcArchetypeValidation & NpcCapabilityValidation & NpcRoleValidation & NpcPersonalityValidation & NpcPersonalityPolicyValidation;
}

export function proposeCreatorNpcEnvironmentPackage(
  npc: CreatorNpcEnvironmentPackage["npc"],
): CreatorNpcEnvironmentPackage {
  const validation = validateNpcEnvironmentPolicy(npc.environmentPolicy);
  return { npc: { ...npc }, validation };
}

export function proposeCreatorNpcDecisionProfile(profile: NpcDecisionProfile) {
  return { profile: { ...profile }, validation: validateNpcDecisionProfile(profile) };
}

export function creatorNpcDecisionProfile(npc: CreatorNpcPackage["npc"]): NpcDecisionProfile {
  return {
    ...(npc.archetype ? { archetype: npc.archetype } : {}),
    ...(npc.role ? { role: npc.role } : {}),
    ...(npc.capabilities ? { capabilities: npc.capabilities } : {}),
    ...(npc.personality ? { personality: npc.personality } : {}),
    ...(npc.personalityPolicy ? { personalityPolicy: npc.personalityPolicy } : {}),
  };
}

export function creatorNpcRuntimeSpawnContract(npc: CreatorNpcPackage["npc"]): NpcRuntimeSpawnContract {
  return buildNpcRuntimeSpawnContract(creatorNpcDecisionProfile(npc), npc.environmentPolicy);
}

export function proposeCreatorNpcPackage(
  npc: CreatorNpcPackage["npc"],
): CreatorNpcPackage {
  const profileValidation = validateNpcDecisionProfile(npc);
  const profileCrossFieldErrors = profileValidation.errors.filter(error => error.startsWith("Personality policy "));
  const archetypeValidation = validateNpcArchetype(npc.archetype);
  const environmentValidation = validateNpcEnvironmentPolicy(npc.environmentPolicy);
  const roleValidation = validateNpcRole(npc.role, npc.archetype);
  const personalityValidation = validateNpcPersonality(npc.personality);
  const personalityPolicyValidation = validateNpcPersonalityPolicy(npc.personalityPolicy);
  const capabilityValidation = archetypeValidation.ok
    ? validateNpcCapabilities(npc.archetype, npc.capabilities ?? {})
    : { ok: true, errors: [] };
  return {
    npc: { ...npc },
    validation: {
      ok: profileCrossFieldErrors.length === 0 && environmentValidation.ok && archetypeValidation.ok && roleValidation.ok && personalityValidation.ok && personalityPolicyValidation.ok && capabilityValidation.ok,
      errors: [...profileCrossFieldErrors, ...archetypeValidation.errors, ...environmentValidation.errors, ...roleValidation.errors, ...personalityValidation.errors, ...personalityPolicyValidation.errors, ...capabilityValidation.errors],
    },
  };
}
