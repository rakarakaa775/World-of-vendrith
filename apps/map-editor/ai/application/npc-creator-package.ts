import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicyValidation } from "./npc-environment-policy-schema";
import { validateNpcArchetype, type NpcArchetype, type NpcArchetypeValidation } from "./npc-archetype-schema";
import { validateNpcCapabilities, type NpcCapabilityRequest, type NpcCapabilityValidation } from "./npc-archetype-capabilities";

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
  npc: CreatorNpcEnvironmentPackage["npc"] & { capabilities?: NpcCapabilityRequest };
  validation: NpcEnvironmentPolicyValidation & NpcArchetypeValidation & NpcCapabilityValidation;
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
  const capabilityValidation = archetypeValidation.ok
    ? validateNpcCapabilities(npc.archetype, npc.capabilities ?? {})
    : { ok: true, errors: [] };
  return {
    npc: { ...npc },
    validation: {
      ok: archetypeValidation.ok && environmentValidation.ok && capabilityValidation.ok,
      errors: [...archetypeValidation.errors, ...environmentValidation.errors, ...capabilityValidation.errors],
    },
  };
}
