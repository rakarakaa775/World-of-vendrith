import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicyValidation } from "./npc-environment-policy-schema";
import { validateNpcArchetype, type NpcArchetype, type NpcArchetypeValidation } from "./npc-archetype-schema";

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
  npc: CreatorNpcEnvironmentPackage["npc"];
  validation: NpcEnvironmentPolicyValidation & NpcArchetypeValidation;
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
  return {
    npc: { ...npc },
    validation: {
      ok: archetypeValidation.ok && environmentValidation.ok,
      errors: [...archetypeValidation.errors, ...environmentValidation.errors],
    },
  };
}
