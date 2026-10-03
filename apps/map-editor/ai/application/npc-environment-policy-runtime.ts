import type { RuntimeEntity, RuntimeObservation } from "../domain/runtime";
import { validateNpcEnvironmentPolicy, type NpcEnvironmentPolicy } from "./npc-environment-policy-schema";

export function npcEnvironmentPolicy(observation: RuntimeObservation): NpcEnvironmentPolicy | undefined {
  const value = observation.perception?.self?.state?.environmentPolicy;
  const validation = validateNpcEnvironmentPolicy(value);
  return validation.ok && value && typeof value === "object" && !Array.isArray(value)
    ? value as NpcEnvironmentPolicy
    : undefined;
}

export function effectiveNpcEnvironmentConditionsForEntity(
  worldConditions: Record<string, unknown> | undefined,
  entity: RuntimeEntity,
): Record<string, unknown> {
  const value = entity.state?.environmentPolicy;
  const validation = validateNpcEnvironmentPolicy(value);
  const policy = validation.ok && value && typeof value === "object" && !Array.isArray(value)
    ? value as NpcEnvironmentPolicy
    : undefined;
  return policy ? { ...(worldConditions ?? {}), ...policy } : { ...(worldConditions ?? {}) };
}

export function effectiveNpcEnvironmentConditions(observation: RuntimeObservation): Record<string, unknown> {
  const self = observation.perception?.self;
  return self
    ? effectiveNpcEnvironmentConditionsForEntity(observation.state.environmentConditions, self)
    : { ...(observation.state.environmentConditions ?? {}) };
}
