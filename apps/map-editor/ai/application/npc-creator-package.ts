import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicyValidation } from "./npc-environment-policy-schema";
import { validateNpcArchetype, type NpcArchetype, type NpcArchetypeValidation } from "./npc-archetype-schema";
import { validateNpcCapabilities, type NpcCapabilityRequest, type NpcCapabilityValidation } from "./npc-archetype-capabilities";
import { validateNpcRole, type NpcRole, type NpcRoleValidation } from "./npc-role-schema";
import { validateNpcPersonality, type NpcPersonalityRequest, type NpcPersonalityValidation } from "./npc-personality-schema";
import { validateNpcPersonalityPolicy, type NpcPersonalityPolicy, type NpcPersonalityPolicyValidation } from "./npc-personality-policy-schema";
import { validateNpcDecisionProfile, type NpcDecisionProfile } from "./npc-decision-profile-schema";
import { validateNpcRelationships, type NpcRelationship, type NpcRelationshipValidation } from "./npc-relationship-schema";
import { buildNpcRuntimeSpawnContract, type NpcRuntimeSpawnContract } from "./npc-runtime-spawn-contract";
import type { MapDocument } from "../../editor/map-document";
import { PreviewRuntimeSimulation, type PreviewNpcDiagnostics } from "./preview-runtime-simulation";

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
  npc: CreatorNpcEnvironmentPackage["npc"] & { role?: NpcRole; capabilities?: NpcCapabilityRequest; personality?: NpcPersonalityRequest; personalityPolicy?: NpcPersonalityPolicy; relationships?: readonly NpcRelationship[] };
  validation: NpcEnvironmentPolicyValidation & NpcArchetypeValidation & NpcCapabilityValidation & NpcRoleValidation & NpcPersonalityValidation & NpcPersonalityPolicyValidation & NpcRelationshipValidation;
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
    ...(npc.relationships ? { relationships: npc.relationships } : {}),
  };
}

export function creatorNpcRuntimeSpawnContract(npc: CreatorNpcPackage["npc"]): NpcRuntimeSpawnContract {
  return buildNpcRuntimeSpawnContract(creatorNpcDecisionProfile(npc), npc.environmentPolicy);
}

export interface CreatorNpcPreviewResult {
  validation: CreatorNpcPackage["validation"];
  diagnostics?: PreviewNpcDiagnostics;
  ticks: number;
}

export async function previewCreatorNpcPackage(
  document: MapDocument,
  npc: CreatorNpcPackage["npc"],
  ticks = 1,
): Promise<CreatorNpcPreviewResult> {
  const packageResult = proposeCreatorNpcPackage(npc);
  const safeTicks = Number.isInteger(ticks) ? Math.max(0, Math.min(20, ticks)) : 0;
  if (!packageResult.validation.ok) {
    return { validation: packageResult.validation, ticks: 0 };
  }
  const simulation = new PreviewRuntimeSimulation(document, [{
    seedKey: npc.id,
    name: npc.name ?? npc.id,
    runtimeContract: creatorNpcRuntimeSpawnContract(npc),
  }]);
  for (let index = 0; index < safeTicks; index++) await simulation.tick();
  return {
    validation: packageResult.validation,
    diagnostics: simulation.diagnostics(`npc:${npc.id}`),
    ticks: safeTicks,
  };
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
  const relationshipValidation = validateNpcRelationships(npc.relationships);
  const capabilityValidation = archetypeValidation.ok
    ? validateNpcCapabilities(npc.archetype, npc.capabilities ?? {})
    : { ok: true, errors: [] };
  return {
    npc: { ...npc },
    validation: {
      ok: profileCrossFieldErrors.length === 0 && environmentValidation.ok && archetypeValidation.ok && roleValidation.ok && personalityValidation.ok && personalityPolicyValidation.ok && relationshipValidation.ok && capabilityValidation.ok,
      errors: [...profileCrossFieldErrors, ...archetypeValidation.errors, ...environmentValidation.errors, ...roleValidation.errors, ...personalityValidation.errors, ...personalityPolicyValidation.errors, ...relationshipValidation.errors, ...capabilityValidation.errors],
    },
  };
}
