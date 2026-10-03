export const NPC_PERSONALITY_TRAITS = [
  "brave", "cautious", "curious", "friendly", "hostile", "calm", "aggressive",
  "loyal", "independent", "social", "solitary", "disciplined", "reckless",
  "generous", "greedy", "honest", "deceptive", "patient", "impatient", "custom",
] as const;

export type NpcPersonalityTrait = (typeof NPC_PERSONALITY_TRAITS)[number];

export interface NpcPersonalityRequest {
  traits?: readonly string[];
}

export interface NpcPersonalityValidation { ok: boolean; errors: string[]; }

export const NPC_PERSONALITY_SCHEMA = {
  traits: NPC_PERSONALITY_TRAITS,
  maxTraits: 8,
  semantics: "Personality traits are descriptive configuration. They do not automatically inject behavior, goals, needs, combat, permissions, or other runtime effects.",
} as const;

export function validateNpcPersonality(value: unknown): NpcPersonalityValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["NPC personality must be an object."] };
  const request = value as NpcPersonalityRequest;
  if (request.traits === undefined) return { ok: true, errors: [] };
  if (!Array.isArray(request.traits)) return { ok: false, errors: ["NPC personality traits must be an array."] };
  const errors: string[] = [];
  if (request.traits.length > NPC_PERSONALITY_SCHEMA.maxTraits) errors.push("NPC personality supports at most 8 traits.");
  const seen = new Set<string>();
  for (const trait of request.traits) {
    if (typeof trait !== "string" || !(NPC_PERSONALITY_TRAITS as readonly string[]).includes(trait)) errors.push("Unsupported NPC personality trait: " + String(trait) + ".");
    else if (seen.has(trait)) errors.push("Duplicate NPC personality trait: " + trait + ".");
    seen.add(trait);
  }
  return { ok: errors.length === 0, errors };
}
