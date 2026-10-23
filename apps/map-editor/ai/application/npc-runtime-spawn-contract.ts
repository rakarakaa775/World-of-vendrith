import type { NpcDecisionProfile } from "./npc-decision-profile-schema";
import { validateNpcDecisionProfile } from "./npc-decision-profile-schema";
import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicy } from "./npc-environment-policy-schema";

export const NPC_RUNTIME_SPAWN_CONTRACT_VERSION = 1 as const;

export interface NpcTraversalCapabilities {
  canSwim: boolean;
  hasWaterTransport: boolean;
}

export interface NpcRuntimeSpawnContract {
  version: typeof NPC_RUNTIME_SPAWN_CONTRACT_VERSION;
  decisionProfile?: NpcDecisionProfile;
  environmentPolicy: NpcEnvironmentPolicy;
  /** Explicit physical traversal permissions; omitted legacy contracts remain land-only. */
  traversalCapabilities?: NpcTraversalCapabilities;
}

export interface NpcRuntimeSpawnContractValidation { ok: boolean; errors: string[]; }

export function buildNpcRuntimeSpawnContract(
  decisionProfile: NpcDecisionProfile,
  environmentPolicy: NpcEnvironmentPolicy,
  traversalCapabilities?: NpcTraversalCapabilities,
): NpcRuntimeSpawnContract {
  return {
    version: NPC_RUNTIME_SPAWN_CONTRACT_VERSION,
    decisionProfile,
    environmentPolicy,
    ...(traversalCapabilities ? { traversalCapabilities: { ...traversalCapabilities } } : {}),
  };
}

export function validateNpcRuntimeSpawnContract(value: unknown): NpcRuntimeSpawnContractValidation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["Runtime spawn contract must be an object"] };
  const contract = value as Record<string, unknown>;
  const errors: string[] = [];
  const allowedContractKeys = new Set(["version", "decisionProfile", "environmentPolicy", "traversalCapabilities"]);
  const unknownContractKeys = Object.keys(contract).filter(key => !allowedContractKeys.has(key));
  if (unknownContractKeys.length > 0) errors.push("Runtime spawn contract contains unsupported fields: " + unknownContractKeys.join(", "));
  if (contract.version !== NPC_RUNTIME_SPAWN_CONTRACT_VERSION) errors.push("Runtime spawn contract version must be 1");
  const profileValidation = validateNpcDecisionProfile(contract.decisionProfile);
  if (!profileValidation.ok) errors.push(...profileValidation.errors.map(error => "Decision profile: " + error));
  const environmentValidation = validateNpcEnvironmentPolicy(contract.environmentPolicy);
  if (!environmentValidation.ok) errors.push(...environmentValidation.errors.map(error => "Environment policy: " + error));
  if (contract.traversalCapabilities !== undefined) {
    const traversal = contract.traversalCapabilities;
    if (typeof traversal !== "object" || traversal === null || Array.isArray(traversal)) {
      errors.push("Traversal capabilities must be an object.");
    } else {
      const capabilities = traversal as Record<string, unknown>;
      const unknownCapabilityKeys = Object.keys(capabilities).filter(
        key => key !== "canSwim" && key !== "hasWaterTransport",
      );
      if (unknownCapabilityKeys.length > 0) {
        errors.push("Traversal capabilities contain unsupported fields: " + unknownCapabilityKeys.join(", "));
      }
      if (typeof capabilities.canSwim !== "boolean") errors.push("Traversal capability canSwim must be boolean.");
      if (typeof capabilities.hasWaterTransport !== "boolean") errors.push("Traversal capability hasWaterTransport must be boolean.");
    }
  }
  return { ok: errors.length === 0, errors };
}

export function validatedNpcRuntimeSpawnContract(value: unknown): NpcRuntimeSpawnContract | undefined {
  const validation = validateNpcRuntimeSpawnContract(value);
  return validation.ok ? value as NpcRuntimeSpawnContract : undefined;
}
