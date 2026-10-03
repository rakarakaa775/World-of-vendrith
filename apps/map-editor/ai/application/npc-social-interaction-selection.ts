import type { NpcRelationship } from "./npc-relationship-schema";
import type { NpcSocialInteractionType } from "./npc-social-interaction-schema";

export interface NpcSocialInteractionSelectionContext {
  relationship?: NpcRelationship;
  interactionCount?: number;
  socialNeed?: number;
  availableTypes?: readonly NpcSocialInteractionType[];
}

export interface NpcSocialInteractionCandidate {
  type: NpcSocialInteractionType;
  score: number;
  reason: string;
}

const DEFAULT_TYPES: readonly NpcSocialInteractionType[] = [
  "conversation",
  "help",
  "trade",
  "conflict",
  "custom",
];

const TYPE_ORDER: Record<NpcSocialInteractionType, number> = {
  conversation: 0,
  help: 1,
  trade: 2,
  conflict: 3,
  custom: 4,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function scoreInteraction(
  type: NpcSocialInteractionType,
  context: NpcSocialInteractionSelectionContext,
): NpcSocialInteractionCandidate {
  const relationship = context.relationship;
  const affinity = relationship?.affinity ?? 0;
  const trust = relationship?.trust ?? 0;
  const interactionCount = context.interactionCount ?? 0;
  const socialNeed = clamp(context.socialNeed ?? 0);
  const relationshipType = relationship?.type ?? "neutral";

  let score = 0;
  let reason = "No stronger social interaction context is available.";

  if (type === "conversation") {
    score = 40 + socialNeed * 0.2 + Math.max(0, affinity) * 0.15 + Math.min(5, interactionCount);
    reason = "Conversation is the deterministic baseline for social connection.";
  } else if (type === "help") {
    score = (relationshipType === "family" || relationshipType === "friend" || relationshipType === "ally" ? 40 : 0)
      + trust * 0.35
      + Math.max(0, affinity) * 0.1;
    reason = "Help is preferred when a trusted positive relationship supports cooperation.";
  } else if (type === "trade") {
    score = (relationshipType === "custom" ? 35 : 5)
      + trust * 0.2
      + Math.max(0, affinity) * 0.05;
    reason = "Trade is available as a neutral transactional interaction.";
  } else if (type === "conflict") {
    score = relationshipType === "enemy" ? 100
      : relationshipType === "rival" ? 65
      : affinity <= -50 ? 55
      : affinity <= -20 ? 25
      : -20;
    reason = "Conflict is selected when the relationship explicitly indicates hostility or rivalry.";
  } else {
    score = 0;
    reason = "Custom interaction is a deterministic fallback.";
  }

  return { type, score, reason };
}

export function selectNpcSocialInteraction(
  context: NpcSocialInteractionSelectionContext,
): NpcSocialInteractionCandidate {
  const candidates = (context.availableTypes ?? DEFAULT_TYPES)
    .map(type => scoreInteraction(type, context))
    .sort((a, b) => b.score - a.score || TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);

  return candidates[0] ?? {
    type: "conversation",
    score: 0,
    reason: "Conversation is the deterministic fallback when no interaction types are available.",
  };
}

export function rankNpcSocialInteractions(
  context: NpcSocialInteractionSelectionContext,
): NpcSocialInteractionCandidate[] {
  return (context.availableTypes ?? DEFAULT_TYPES)
    .map(type => scoreInteraction(type, context))
    .sort((a, b) => b.score - a.score || TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
}
