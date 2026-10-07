import type { NpcRelationship, NpcRelationshipType } from "./npc-relationship-schema";
import type { VerificationResult } from "../domain/types";
import type { NpcSocialInteraction, NpcSocialInteractionType, NpcRelationshipMemory } from "./npc-social-interaction-schema";

export interface NpcSocialResponse {
  interactionType: NpcSocialInteractionType;
  disposition: "warm" | "neutral" | "guarded" | "hostile";
  affinityDelta: number;
  trustDelta: number;
  reason: string;
}

export interface NpcSocialMemory {
  memoryId: string;
  sourceNpcId: string;
  targetNpcId: string;
  interactionId: string;
  interactionType: NpcSocialInteractionType;
  tick: number;
  disposition: NpcSocialResponse["disposition"];
  affinityDelta: number;
  trustDelta: number;
}

export interface NpcSocialMemoryStore {
  list(sourceNpcId: string, targetNpcId?: string): readonly NpcSocialMemory[];
  add(memory: NpcSocialMemory): void;
  clear(sourceNpcId: string, targetNpcId?: string): void;
}

export interface NpcReputation {
  npcId: string;
  score: number;
  positiveInteractions: number;
  negativeInteractions: number;
  updatedAtTick: number;
}

export interface NpcReputationStore {
  get(npcId: string): NpcReputation | undefined;
  set(reputation: NpcReputation): void;
}

export interface NpcGroupBehaviorContext {
  npcId: string;
  memberNpcIds: readonly string[];
  relationships: readonly NpcRelationship[];
  socialNeed?: number;
}

export interface NpcGroupBehavior {
  groupNpcIds: readonly string[];
  cohesion: number;
  action: "gather" | "cooperate" | "socialize" | "avoid" | "split";
  reason: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function relationshipDisposition(
  relationship?: NpcRelationship,
  reputationScore?: number,
): NpcSocialResponse["disposition"] {
  if (reputationScore !== undefined && reputationScore <= -60) return "hostile";
  if (reputationScore !== undefined && reputationScore <= -30) return "guarded";
  if (!relationship) return reputationScore !== undefined && reputationScore >= 40 ? "warm" : "neutral";
  if (relationship.type === "enemy" || relationship.affinity !== undefined && relationship.affinity <= -60) return "hostile";
  if (relationship.type === "rival" || relationship.affinity !== undefined && relationship.affinity < -20) return "guarded";
  if (relationship.type === "family" || relationship.type === "friend" || relationship.type === "ally" || (relationship.affinity ?? 0) >= 40) return "warm";
  return "neutral";
}

/** 67: deterministic response to the selected social interaction. */
export function chooseNpcSocialResponse(
  interactionType: NpcSocialInteractionType,
  relationship?: NpcRelationship,
  reputationScore?: number,
): NpcSocialResponse {
  const disposition = relationshipDisposition(relationship, reputationScore);
  const affinity = relationship?.affinity ?? 0;
  const trust = relationship?.trust ?? 0;

  if (interactionType === "conflict") {
    if (disposition === "hostile") return { interactionType, disposition, affinityDelta: -4, trustDelta: -2, reason: "Hostile conflict reinforces negative affinity and reduces trust." };
    return { interactionType, disposition, affinityDelta: -2, trustDelta: -1, reason: "Conflict produces a small negative relationship response." };
  }
  if (interactionType === "help") {
    const bonus = disposition === "warm" ? 2 : 0;
    return { interactionType, disposition, affinityDelta: 4 + bonus, trustDelta: 6 + bonus, reason: "Successful help strengthens affinity and trust." };
  }
  if (interactionType === "trade") {
    return { interactionType, disposition, affinityDelta: 1, trustDelta: trust >= 50 ? 3 : 2, reason: "A completed trade provides a modest relationship and trust increase." };
  }
  if (interactionType === "custom") {
    return { interactionType, disposition, affinityDelta: disposition === "warm" ? 2 : 0, trustDelta: disposition === "warm" ? 2 : 1, reason: "Custom interaction uses a conservative deterministic social response." };
  }
  const affinityDelta = affinity >= 40 ? 3 : disposition === "hostile" ? -1 : 2;
  const trustDelta = disposition === "hostile" ? -1 : 2;
  return { interactionType, disposition, affinityDelta, trustDelta, reason: "Conversation adjusts social affinity and trust according to the existing relationship." };
}

/** 68: classify friendship from stable positive affinity/trust thresholds. */
export function evaluateNpcFriendship(relationship: NpcRelationship): boolean {
  return (relationship.affinity ?? 0) >= 45 && (relationship.trust ?? 0) >= 40;
}

/** 69: classify rivalry from negative affinity or explicit rival relationship. */
export function evaluateNpcRivalry(relationship: NpcRelationship): boolean {
  return relationship.type === "rival" || ((relationship.affinity ?? 0) <= -35 && (relationship.trust ?? 0) < 40);
}

/** 70: trust is bounded and updated only through explicit interaction deltas. */
export function applyNpcTrustDelta(relationship: NpcRelationship, delta: number): NpcRelationship {
  return { ...relationship, trust: clamp((relationship.trust ?? 0) + delta, 0, 100) };
}

/** 71: deterministic reputation update based on interaction outcome. */
export function applyNpcReputationInteraction(
  current: NpcReputation | undefined,
  npcId: string,
  response: NpcSocialResponse,
  tick: number,
): NpcReputation {
  const delta = response.affinityDelta + response.trustDelta * 0.5;
  return {
    npcId,
    score: clamp((current?.score ?? 0) + delta, -100, 100),
    positiveInteractions: (current?.positiveInteractions ?? 0) + (delta > 0 ? 1 : 0),
    negativeInteractions: (current?.negativeInteractions ?? 0) + (delta < 0 ? 1 : 0),
    updatedAtTick: tick,
  };
}

/** 72: infer a group action from cohesion and relationship compatibility. */
export function chooseNpcGroupBehavior(context: NpcGroupBehaviorContext): NpcGroupBehavior {
  const members = context.memberNpcIds.filter(id => id !== context.npcId);
  if (members.length === 0) return { groupNpcIds: [context.npcId], cohesion: 0, action: "split", reason: "No other group members are available." };
  const relevant = context.relationships.filter(r => members.includes(r.targetNpcId));
  const cohesion = relevant.length === 0
    ? 0
    : clamp(relevant.reduce((sum, r) => sum + (r.affinity ?? 0) * 0.6 + (r.trust ?? 0) * 0.4, 0) / relevant.length, -100, 100);
  if (cohesion >= 55) return { groupNpcIds: [context.npcId, ...members].sort(), cohesion, action: "cooperate", reason: "Positive affinity and trust create a cooperative group tendency." };
  if (cohesion >= 20 || (context.socialNeed ?? 0) >= 70) return { groupNpcIds: [context.npcId, ...members].sort(), cohesion, action: "socialize", reason: "Moderate cohesion or high social need supports group socialization." };
  if (cohesion <= -45) return { groupNpcIds: [context.npcId, ...members].sort(), cohesion, action: "avoid", reason: "Strongly negative group cohesion favors avoidance." };
  return { groupNpcIds: [context.npcId, ...members].sort(), cohesion, action: "gather", reason: "Neutral group cohesion supports gathering without assuming cooperation." };
}

export function createNpcSocialMemoryStore(): NpcSocialMemoryStore {
  const memories = new Map<string, NpcSocialMemory[]>();
  const key = (source: string, target: string) => source + "::" + target;
  return {
    list(source, target) {
      if (target) return [...(memories.get(key(source, target)) ?? [])];
      return [...memories.entries()].filter(([k]) => k.startsWith(source + "::")).flatMap(([, value]) => value);
    },
    add(memory) {
      const k = key(memory.sourceNpcId, memory.targetNpcId);
      const existing = memories.get(k) ?? [];
      if (existing.some(candidate => candidate.interactionId === memory.interactionId)) return;
      memories.set(k, [...existing, memory]);
    },
    clear(source, target) {
      if (target) memories.delete(key(source, target));
      else for (const k of memories.keys()) if (k.startsWith(source + "::")) memories.delete(k);
    },
  };
}

export function recordNpcSocialMemory(
  store: NpcSocialMemoryStore,
  interaction: NpcSocialInteraction,
  response: NpcSocialResponse,
  verification: VerificationResult,
): NpcSocialMemory | undefined {
  if (!verification.ok) return undefined;
  const memory: NpcSocialMemory = {
    memoryId: interaction.interactionId + ":memory",
    sourceNpcId: interaction.sourceNpcId,
    targetNpcId: interaction.targetNpcId,
    interactionId: interaction.interactionId,
    interactionType: interaction.type,
    tick: interaction.tick,
    disposition: response.disposition,
    affinityDelta: interaction.affinityDelta ?? 0,
    trustDelta: interaction.trustDelta ?? 0,
  };
  store.add(memory);
  return memory;
}

export function createNpcReputationStore(): NpcReputationStore {
  const reputations = new Map<string, NpcReputation>();
  return { get: npcId => reputations.get(npcId), set: reputation => reputations.set(reputation.npcId, reputation) };
}

export function inferNpcRelationshipType(relationship: NpcRelationship): NpcRelationshipType {
  if (relationship.type === "family" || relationship.type === "ally" || relationship.type === "custom") return relationship.type;
  if (evaluateNpcFriendship(relationship)) return "friend";
  if (evaluateNpcRivalry(relationship)) return "rival";
  if ((relationship.affinity ?? 0) <= -60) return "enemy";
  return "neutral";
}

export function updateNpcRelationshipFromResponse(
  relationship: NpcRelationship,
  response: NpcSocialResponse,
): NpcRelationship {
  const updated = applyNpcTrustDelta({
    ...relationship,
    affinity: clamp((relationship.affinity ?? 0) + response.affinityDelta, -100, 100),
  }, response.trustDelta);
  return { ...updated, type: inferNpcRelationshipType(updated) };
}
