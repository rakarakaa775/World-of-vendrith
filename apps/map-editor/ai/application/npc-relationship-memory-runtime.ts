import type { NpcRelationship } from "./npc-relationship-schema";
import {
  applyNpcSocialInteraction,
  createNpcRelationshipMemoryStore,
  type NpcRelationshipMemory,
  type NpcRelationshipMemoryStore,
  type NpcSocialInteraction,
  validateNpcSocialInteraction,
} from "./npc-social-interaction-schema";

export interface NpcRelationshipUpdateResult {
  changed: boolean;
  relationships: readonly NpcRelationship[];
  relationship?: NpcRelationship;
  memory?: NpcRelationshipMemory;
}

function clampAffinity(value: number): number {
  return Math.max(-100, Math.min(100, value));
}

function clampTrust(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyNpcSocialInteractionToRelationships(
  relationships: readonly NpcRelationship[],
  interaction: NpcSocialInteraction,
): readonly NpcRelationship[] {
  if (!validateNpcSocialInteraction(interaction).ok) return relationships;
  if (interaction.affinityDelta === undefined && interaction.trustDelta === undefined) return relationships;

  const relationship = relationships.find(
    item => item.targetNpcId === interaction.targetNpcId,
  );
  if (!relationship) return relationships;

  const updated: NpcRelationship = {
    ...relationship,
    ...(interaction.affinityDelta !== undefined
      ? { affinity: clampAffinity((relationship.affinity ?? 0) + interaction.affinityDelta) }
      : {}),
    ...(interaction.trustDelta !== undefined
      ? { trust: clampTrust((relationship.trust ?? 0) + interaction.trustDelta) }
      : {}),
  };
  return relationships.map(item =>
    item.targetNpcId === interaction.targetNpcId ? updated : item,
  );
}

export function applyNpcSocialInteractionAndRelationshipMemory(
  relationships: readonly NpcRelationship[],
  interaction: NpcSocialInteraction,
  store: NpcRelationshipMemoryStore = createNpcRelationshipMemoryStore(),
): NpcRelationshipUpdateResult {
  if (!validateNpcSocialInteraction(interaction).ok) {
    return { changed: false, relationships };
  }

  const memory = applyNpcSocialInteraction(interaction, store);
  const nextRelationships = applyNpcSocialInteractionToRelationships(relationships, interaction);
  const relationship = nextRelationships.find(
    item => item.targetNpcId === interaction.targetNpcId,
  );

  return {
    changed: relationship !== undefined && nextRelationships !== relationships,
    relationships: nextRelationships,
    relationship,
    memory,
  };
}
