import type { NpcDecisionProfile } from "./npc-decision-profile-schema";
import { validateNpcDecisionProfile } from "./npc-decision-profile-schema";

export function validatedNpcDecisionProfile(value: unknown): NpcDecisionProfile | undefined {
  const validation = validateNpcDecisionProfile(value);
  return validation.ok && value && typeof value === "object" && !Array.isArray(value)
    ? value as NpcDecisionProfile
    : undefined;
}

export function decisionProfileFromMetadata(metadata: Record<string, unknown> | null | undefined): NpcDecisionProfile | undefined {
  return validatedNpcDecisionProfile(metadata?.decisionProfile);
}

export function withNpcDecisionProfile(
  state: Record<string, unknown>,
  profile: unknown,
): Record<string, unknown> {
  const validated = validatedNpcDecisionProfile(profile);
  return validated ? { ...state, decisionProfile: validated } : state;
}
