export const NPC_ARCHETYPES = [
  "production",
  "military",
  "civilian",
  "merchant",
  "worker",
  "companion",
  "enemy",
  "animal",
  "special",
  "custom",
] as const;

export type NpcArchetype = (typeof NPC_ARCHETYPES)[number];

export interface NpcArchetypeValidation {
  ok: boolean;
  errors: string[];
}

export const NPC_ARCHETYPE_SCHEMA = {
  field: "archetype",
  type: "string",
  required: false,
  values: NPC_ARCHETYPES,
  semanticRule: "Descriptive classification only; archetype does not inject behavior, goals, needs, combat, or permissions.",
} as const;

export function validateNpcArchetype(value: unknown): NpcArchetypeValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "string") {
    return { ok: false, errors: ["NPC archetype must be a string."] };
  }
  if (!(NPC_ARCHETYPES as readonly string[]).includes(value)) {
    return { ok: false, errors: ["Unsupported NPC archetype: " + value + "."] };
  }
  return { ok: true, errors: [] };
}
