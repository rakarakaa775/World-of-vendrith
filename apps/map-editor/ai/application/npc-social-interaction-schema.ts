import type { NpcRelationshipType } from "./npc-relationship-schema";
import type { VerificationResult } from "../domain/types";

export const NPC_SOCIAL_INTERACTION_SCHEMA = {
  fields: ["interactionId", "sourceNpcId", "targetNpcId", "type", "affinityDelta", "trustDelta", "tick"],
  types: ["conversation", "help", "trade", "conflict", "custom"],
  semantics: "Explicit NPC social interaction records. An interaction changes relationship memory only when its deltas are explicitly provided; interaction type alone has no runtime effect.",
} as const;

export type NpcSocialInteractionType = "conversation" | "help" | "trade" | "conflict" | "custom";

export interface NpcSocialInteraction {
  interactionId: string;
  sourceNpcId: string;
  targetNpcId: string;
  type: NpcSocialInteractionType;
  affinityDelta?: number;
  trustDelta?: number;
  tick: number;
}

export interface NpcSocialInteractionValidation {
  ok: boolean;
  errors: string[];
}

export interface NpcRelationshipMemory {
  sourceNpcId: string;
  targetNpcId: string;
  interactionCount: number;
  lastInteractionId?: string;
  lastInteractionType?: NpcSocialInteractionType;
  lastInteractionTick?: number;
  affinityDeltaTotal: number;
  trustDeltaTotal: number;
}

export interface NpcRelationshipMemoryStore {
  get(sourceNpcId: string, targetNpcId: string): NpcRelationshipMemory | undefined;
  set(memory: NpcRelationshipMemory): void;
  clear(sourceNpcId: string, targetNpcId: string): void;
}

export function validateNpcSocialInteraction(value: unknown): NpcSocialInteractionValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["NPC social interaction must be an object."] };
  const item = value as Partial<NpcSocialInteraction>;
  const errors: string[] = [];
  if (typeof item.interactionId !== "string" || item.interactionId.length === 0) errors.push("NPC social interaction interactionId must be a non-empty string.");
  if (typeof item.sourceNpcId !== "string" || item.sourceNpcId.length === 0) errors.push("NPC social interaction sourceNpcId must be a non-empty string.");
  if (typeof item.targetNpcId !== "string" || item.targetNpcId.length === 0) errors.push("NPC social interaction targetNpcId must be a non-empty string.");
  if (item.sourceNpcId === item.targetNpcId) errors.push("NPC social interaction sourceNpcId and targetNpcId must differ.");
  if (!NPC_SOCIAL_INTERACTION_SCHEMA.types.includes(item.type as NpcSocialInteractionType)) errors.push("NPC social interaction type is unsupported.");
  if (!Number.isInteger(item.tick) || (item.tick ?? -1) < 0) errors.push("NPC social interaction tick must be a non-negative integer.");
  if (item.affinityDelta !== undefined && (!Number.isFinite(item.affinityDelta) || item.affinityDelta < -100 || item.affinityDelta > 100)) errors.push("NPC social interaction affinityDelta must be between -100 and 100.");
  if (item.trustDelta !== undefined && (!Number.isFinite(item.trustDelta) || item.trustDelta < -100 || item.trustDelta > 100)) errors.push("NPC social interaction trustDelta must be between -100 and 100.");
  return { ok: errors.length === 0, errors };
}

export function applyNpcSocialInteraction(
  interaction: NpcSocialInteraction,
  store: NpcRelationshipMemoryStore,
  verification: VerificationResult,
): NpcRelationshipMemory | undefined {
  if (!verification.ok || !validateNpcSocialInteraction(interaction).ok) return undefined;
  const previous = store.get(interaction.sourceNpcId, interaction.targetNpcId);

  // Runtime events may be retried. A previously recorded interaction must not
  // be counted twice or re-apply its deltas to durable NPC memory.
  if (previous?.lastInteractionId === interaction.interactionId) return previous;

  const next: NpcRelationshipMemory = {
    sourceNpcId: interaction.sourceNpcId,
    targetNpcId: interaction.targetNpcId,
    interactionCount: (previous?.interactionCount ?? 0) + 1,
    lastInteractionId: interaction.interactionId,
    lastInteractionType: interaction.type,
    lastInteractionTick: interaction.tick,
    affinityDeltaTotal: (previous?.affinityDeltaTotal ?? 0) + (interaction.affinityDelta ?? 0),
    trustDeltaTotal: (previous?.trustDeltaTotal ?? 0) + (interaction.trustDelta ?? 0),
  };
  store.set(next);
  return next;
}

export function createNpcRelationshipMemoryStore(): NpcRelationshipMemoryStore {
  const memories = new Map<string, NpcRelationshipMemory>();
  const key = (source: string, target: string) => source + "::" + target;
  return {
    get: (source, target) => memories.get(key(source, target)),
    set: memory => memories.set(key(memory.sourceNpcId, memory.targetNpcId), memory),
    clear: (source, target) => memories.delete(key(source, target)),
  };
}
