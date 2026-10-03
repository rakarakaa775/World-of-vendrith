import type { RuntimeObservation } from "../domain/runtime";
import type { NpcRelationship } from "./npc-relationship-schema";
import {
  applyNpcSocialInteraction,
  createNpcRelationshipMemoryStore,
  type NpcRelationshipMemory,
  type NpcSocialInteraction,
  type NpcRelationshipMemoryStore,
} from "./npc-social-interaction-schema";
import { applyNpcSocialInteractionToRelationships } from "./npc-relationship-memory-runtime";

export interface NpcRelationshipRuntimeStore {
  get(npcId: string): readonly NpcRelationship[] | undefined;
  set(npcId: string, relationships: readonly NpcRelationship[]): void;
  applyInteraction(
    interaction: NpcSocialInteraction,
  ): { relationships: readonly NpcRelationship[]; memory?: NpcRelationshipMemory } | undefined;
}

export function createNpcRelationshipRuntimeStore(): NpcRelationshipRuntimeStore {
  const relationshipsByNpc = new Map<string, readonly NpcRelationship[]>();
  const memoryStore: NpcRelationshipMemoryStore = createNpcRelationshipMemoryStore();

  return {
    get(npcId) {
      return relationshipsByNpc.get(npcId);
    },
    set(npcId, relationships) {
      relationshipsByNpc.set(npcId, relationships.map(relationship => ({ ...relationship })));
    },
    applyInteraction(interaction) {
      const current = relationshipsByNpc.get(interaction.sourceNpcId);
      if (!current) return undefined;
      const memory = applyNpcSocialInteraction(interaction, memoryStore);
      if (!memory) return undefined;
      const next = applyNpcSocialInteractionToRelationships(current, interaction);
      relationshipsByNpc.set(interaction.sourceNpcId, next);
      return { relationships: next, memory };
    },
  };
}

export function withNpcRuntimeRelationships(
  observation: RuntimeObservation,
  store: NpcRelationshipRuntimeStore,
): RuntimeObservation {
  const perception = observation.perception;
  const self = perception?.self;
  if (!perception || !self) return observation;
  const profile = self.state?.decisionProfile;
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return observation;
  const runtimeRelationships = store.get(self.id);
  if (!runtimeRelationships) return observation;

  return {
    ...observation,
    perception: {
      ...perception,
      nearbyEntities: perception.nearbyEntities,
      detections: perception.detections,
      visibleMapIds: perception.visibleMapIds,
      self: {
        ...self,
        state: {
          ...self.state,
          decisionProfile: {
            ...profile,
            relationships: runtimeRelationships,
          },
        },
      },
    },
  };
}
