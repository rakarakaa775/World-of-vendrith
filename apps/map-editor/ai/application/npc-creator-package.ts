import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicyValidation } from "./npc-environment-policy-schema";
import { validateNpcArchetype, type NpcArchetype, type NpcArchetypeValidation } from "./npc-archetype-schema";
import { validateNpcCapabilities, type NpcCapabilityRequest, type NpcCapabilityValidation } from "./npc-archetype-capabilities";
import { validateNpcRole, type NpcRole, type NpcRoleValidation } from "./npc-role-schema";
import { validateNpcPersonality, type NpcPersonalityRequest, type NpcPersonalityValidation } from "./npc-personality-schema";

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
  npc: CreatorNpcEnvironmentPackage["npc"] & { role?: NpcRole; capabilities?: NpcCapabilityRequest; personality?: NpcPersonalityRequest };
  validation: NpcEnvironmentPolicyValidation & NpcArchetypeValidation & NpcCapabilityValidation & NpcRoleValidation & NpcPersonalityValidation;
}

export function proposeCreatorNpcEnvironmentPackage(
  npc: CreatorNpcEnvironmentPackage["npc"],
): CreatorNpcEnvironmentPackage {
  const validation = validateNpcEnvironmentPolicy(npc.environmentPolicy);
  return { npc: { ...npc }, validation };
}

export function proposeCreatorNpcPackage(
  npc: CreatorNpcPackage["npc"],
): CreatorNpcPackage {
  const archetypeValidation = validateNpcArchetype(npc.archetype);
  const environmentValidation = validateNpcEnvironmentPolicy(npc.environmentPolicy);
  const roleValidation = validateNpcRole(npc.role, npc.archetype);
  const personalityValidation = validateNpcPersonality(npc.personality);
  const capabilityValidation = archetypeValidation.ok
    ? validateNpcCapabilities(npc.archetype, npc.capabilities ?? {})
    : { ok: true, errors: [] };
  return {
    npc: { ...npc },
    validation: {
      ok: archetypeValidation.ok && environmentValidation.ok && roleValidation.ok && personalityValidation.ok && capabilityValidation.ok,
      errors: [...archetypeValidation.errors, ...environmentValidation.errors, ...roleValidation.errors, ...personalityValidation.errors, ...capabilityValidation.errors],
    },
  };
}
