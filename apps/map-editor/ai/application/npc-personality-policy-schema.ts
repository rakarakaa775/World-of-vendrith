import type { RuntimeBehaviorKind } from "../domain/runtime-behavior";
import type { RuntimeGoalKind } from "../domain/runtime-goal";
import { NPC_PERSONALITY_TRAITS } from "./npc-personality-schema";

export interface NpcPersonalityPolicyRule {
  trait: string;
  behaviors?: Partial<Record<RuntimeBehaviorKind, number>>;
  goals?: Partial<Record<RuntimeGoalKind, number>>;
}
export interface NpcPersonalityPolicy { rules?: readonly NpcPersonalityPolicyRule[]; }
export interface NpcPersonalityPolicyValidation { ok: boolean; errors: string[]; }
export const NPC_PERSONALITY_POLICY_SCHEMA = { traits: NPC_PERSONALITY_TRAITS, behaviorKinds: ["idle", "follow-player", "wander", "investigate", "flee"], goalKinds: ["work", "eat", "sleep", "go-to-location", "respond-to-event"], minPriorityDelta: -100, maxPriorityDelta: 100, semantics: "Personality policy is an explicit runtime effect. Traits alone never change NPC behavior or goals." } as const;
function validDelta(value: unknown): boolean { return typeof value === "number" && Number.isFinite(value) && value >= -100 && value <= 100; }
export function validateNpcPersonalityPolicy(value: unknown): NpcPersonalityPolicyValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { ok: false, errors: ["NPC personality policy must be an object."] };
  const policy = value as NpcPersonalityPolicy;
  if (policy.rules === undefined) return { ok: true, errors: [] };
  if (!Array.isArray(policy.rules)) return { ok: false, errors: ["NPC personality policy rules must be an array."] };
  const errors: string[] = [];
  for (const [index, rule] of policy.rules.entries()) {
    if (typeof rule !== "object" || rule === null || Array.isArray(rule)) { errors.push(`NPC personality policy rule ${index} must be an object.`); continue; }
    if (typeof rule.trait !== "string" || !(NPC_PERSONALITY_TRAITS as readonly string[]).includes(rule.trait)) errors.push(`Unsupported NPC personality policy trait: ${String(rule.trait)}.`);
    for (const [label, entries] of [["behaviors", rule.behaviors], ["goals", rule.goals]] as const) {
      if (entries === undefined) continue;
      if (typeof entries !== "object" || entries === null || Array.isArray(entries)) { errors.push(`NPC personality policy ${label} must be an object.`); continue; }
      for (const [kind, delta] of Object.entries(entries)) {
        const supported = label === "behaviors" ? NPC_PERSONALITY_POLICY_SCHEMA.behaviorKinds : NPC_PERSONALITY_POLICY_SCHEMA.goalKinds;
        if (!(supported as readonly string[]).includes(kind)) errors.push(`Unsupported NPC personality policy ${label} kind: ${kind}.`);
        if (!validDelta(delta)) errors.push(`NPC personality policy priority delta must be between -100 and 100: ${kind}.`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
