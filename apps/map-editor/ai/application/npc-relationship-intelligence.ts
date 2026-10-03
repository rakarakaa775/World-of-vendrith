import type { NpcRelationship } from "./npc-relationship-schema";
import type { NpcRelationshipMemoryStore } from "./npc-social-interaction-schema";

export interface NpcRelationshipIntelligenceCandidate {
  targetNpcId: string;
  relationshipType: NpcRelationship["type"] | "untracked";
  affinity: number;
  trust: number;
  interactionCount: number;
  utility: number;
}

const TYPE_BONUS: Record<NpcRelationship["type"], number> = {
  family: 30,
  friend: 25,
  ally: 20,
  neutral: 5,
  custom: 0,
  rival: -40,
  enemy: -60,
};

export function scoreNpcRelationshipTarget(
  relationship: NpcRelationship | undefined,
  targetNpcId: string,
  memoryStore?: NpcRelationshipMemoryStore,
  sourceNpcId?: string,
): NpcRelationshipIntelligenceCandidate {
  const affinity = relationship?.affinity ?? 0;
  const trust = relationship?.trust ?? 0;
  const relationshipType = relationship?.type ?? "untracked";
  const interactionCount = sourceNpcId && memoryStore
    ? memoryStore.get(sourceNpcId, targetNpcId)?.interactionCount ?? 0
    : 0;
  const typeBonus = relationship ? TYPE_BONUS[relationship.type] : 0;
  const familiarityBonus = Math.min(10, interactionCount);
  const utility = typeBonus + affinity * 0.25 + trust * 0.15 + familiarityBonus;

  return {
    targetNpcId,
    relationshipType,
    affinity,
    trust,
    interactionCount,
    utility,
  };
}

export function rankNpcRelationshipTargets(
  relationships: readonly NpcRelationship[],
  targetNpcIds: readonly string[],
  sourceNpcId: string,
  memoryStore?: NpcRelationshipMemoryStore,
): NpcRelationshipIntelligenceCandidate[] {
  const byTarget = new Map(relationships.map(relationship => [relationship.targetNpcId, relationship]));
  return targetNpcIds
    .filter(targetNpcId => targetNpcId !== sourceNpcId)
    .map(targetNpcId => scoreNpcRelationshipTarget(byTarget.get(targetNpcId), targetNpcId, memoryStore, sourceNpcId))
    .filter(candidate => candidate.utility > -20)
    .sort((a, b) => b.utility - a.utility || a.targetNpcId.localeCompare(b.targetNpcId));
}
