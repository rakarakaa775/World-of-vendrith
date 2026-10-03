import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicyValidation } from "./npc-environment-policy-schema";

export interface CreatorNpcEnvironmentPackage {
  npc: {
    id: string;
    name?: string;
    environmentPolicy: Record<string, unknown>;
  };
  validation: NpcEnvironmentPolicyValidation;
}

export function proposeCreatorNpcEnvironmentPackage(
  npc: CreatorNpcEnvironmentPackage["npc"],
): CreatorNpcEnvironmentPackage {
  const validation = validateNpcEnvironmentPolicy(npc.environmentPolicy);
  return { npc: { ...npc }, validation };
}
