export const NPC_RELATIONSHIP_SCHEMA = {
  fields: ["targetNpcId", "type", "affinity", "trust"],
  types: ["friend", "family", "ally", "rival", "enemy", "neutral", "custom"],
  semantics: "Explicit NPC-to-NPC relationship data. Relationship type and scores never create runtime effects automatically.",
} as const;

export type NpcRelationshipType = "friend" | "family" | "ally" | "rival" | "enemy" | "neutral" | "custom";
export interface NpcRelationship { targetNpcId: string; type: NpcRelationshipType; affinity?: number; trust?: number; }
export interface NpcRelationshipValidation { ok: boolean; errors: string[]; }
const TYPES = new Set<NpcRelationshipType>(NPC_RELATIONSHIP_SCHEMA.types);

export function validateNpcRelationship(value: unknown): NpcRelationshipValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["NPC relationship must be an object."] };
  const relationship = value as Partial<NpcRelationship>;
  const errors: string[] = [];
  if (typeof relationship.targetNpcId !== "string" || relationship.targetNpcId.length === 0) errors.push("NPC relationship targetNpcId must be a non-empty string.");
  if (typeof relationship.type !== "string" || !TYPES.has(relationship.type as NpcRelationshipType)) errors.push("NPC relationship type is unsupported.");
  if (relationship.affinity !== undefined && (!Number.isFinite(relationship.affinity) || relationship.affinity < -100 || relationship.affinity > 100)) errors.push("NPC relationship affinity must be between -100 and 100.");
  if (relationship.trust !== undefined && (!Number.isFinite(relationship.trust) || relationship.trust < 0 || relationship.trust > 100)) errors.push("NPC relationship trust must be between 0 and 100.");
  return { ok: errors.length === 0, errors };
}

export function validateNpcRelationships(value: unknown): NpcRelationshipValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (!Array.isArray(value)) return { ok: false, errors: ["NPC relationships must be an array."] };
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    errors.push(...validateNpcRelationship(item).errors);
    if (item && typeof item === "object" && !Array.isArray(item) && typeof (item as NpcRelationship).targetNpcId === "string") {
      const id = (item as NpcRelationship).targetNpcId;
      if (seen.has(id)) errors.push(`NPC relationship target is duplicated: ${id}.`);
      seen.add(id);
    }
  }
  return { ok: errors.length === 0, errors };
}
