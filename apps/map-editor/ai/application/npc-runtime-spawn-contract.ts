import type { NpcDecisionProfile } from "./npc-decision-profile-schema";
import { validateNpcDecisionProfile } from "./npc-decision-profile-schema";
import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicy } from "./npc-environment-policy-schema";

export const NPC_RUNTIME_SPAWN_CONTRACT_VERSION = 1 as const;

export interface NpcRuntimeSpawnContract {
  version: typeof NPC_RUNTIME_SPAWN_CONTRACT_VERSION;
  decisionProfile?: NpcDecisionProfile;
  environmentPolicy: NpcEnvironmentPolicy;
}

export interface NpcRuntimeSpawnContractValidation { ok: boolean; errors: string[]; }

export function buildNpcRuntimeSpawnContract(decisionProfile: NpcDecisionProfile, environmentPolicy: NpcEnvironmentPolicy): NpcRuntimeSpawnContract {
  return { version: NPC_RUNTIME_SPAWN_CONTRACT_VERSION, decisionProfile, environmentPolicy };
}

export function validateNpcRuntimeSpawnContract(value: unknown): NpcRuntimeSpawnContractValidation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["Runtime spawn contract must be an object"] };
  const contract = value as Record<string, unknown>;
  const errors: string[] = [];
  if (contract.version !== NPC_RUNTIME_SPAWN_CONTRACT_VERSION) errors.push("Runtime spawn contract version must be 1");
  const profileValidation = validateNpcDecisionProfile(contract.decisionProfile);
  if (!profileValidation.ok) errors.push(...profileValidation.errors.map(error => "Decision profile: " + error));
  const environmentValidation = validateNpcEnvironmentPolicy(contract.environmentPolicy);
  if (!environmentValidation.ok) errors.push(...environmentValidation.errors.map(error => "Environment policy: " + error));
  return { ok: errors.length === 0, errors };
}

export function validatedNpcRuntimeSpawnContract(value: unknown): NpcRuntimeSpawnContract | undefined {
  const validation = validateNpcRuntimeSpawnContract(value);
  return validation.ok ? value as NpcRuntimeSpawnContract : undefined;
}
