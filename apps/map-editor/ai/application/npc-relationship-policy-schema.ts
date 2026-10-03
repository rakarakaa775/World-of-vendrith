import type { RuntimeBehaviorKind } from "../domain/runtime-behavior";
import type { RuntimeGoalKind } from "../domain/runtime-goal";
import type { NpcRelationshipType } from "./npc-relationship-schema";

export interface NpcRelationshipPolicyRule {
  type: NpcRelationshipType;
  minAffinity?: number;
  maxAffinity?: number;
  minTrust?: number;
  maxTrust?: number;
  behaviors?: Partial<Record<RuntimeBehaviorKind, number>>;
  goals?: Partial<Record<RuntimeGoalKind, number>>;
}
export interface NpcRelationshipPolicy { rules?: readonly NpcRelationshipPolicyRule[]; }
export interface NpcRelationshipPolicyValidation { ok: boolean; errors: string[]; }

export const NPC_RELATIONSHIP_POLICY_SCHEMA = {
  relationshipTypes: ["friend", "family", "ally", "rival", "enemy", "neutral", "custom"],
  behaviorKinds: ["idle", "follow-player", "wander", "investigate", "flee"],
  goalKinds: ["work", "eat", "sleep", "go-to-location", "respond-to-event"],
  minScore: -100, maxScore: 100, minTrust: 0, maxTrust: 100,
  minPriorityDelta: -100, maxPriorityDelta: 100,
  semantics: "Relationship data is descriptive by default. Only an explicit relationship policy may adjust priority for existing behavior and goal kinds, and only when a matching relationship is present.",
} as const;

function bounded(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
function validateMap(
  value: unknown,
  label: string,
  supported: readonly string[],
  errors: string[],
): void {
  if (value === undefined) return;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push("NPC relationship policy " + label + " must be an object.");
    return;
  }
  for (const [kind, delta] of Object.entries(value)) {
    if (!supported.includes(kind)) errors.push("Unsupported NPC relationship policy " + label + " kind: " + kind + ".");
    if (!bounded(delta, -100, 100)) errors.push("NPC relationship policy priority delta must be between -100 and 100: " + kind + ".");
  }
}

export function validateNpcRelationshipPolicy(value: unknown): NpcRelationshipPolicyValidation {
  if (value === undefined) return { ok: true, errors: [] };
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, errors: ["NPC relationship policy must be an object."] };
  }
  const policy = value as NpcRelationshipPolicy;
  if (policy.rules === undefined) return { ok: true, errors: [] };
  if (!Array.isArray(policy.rules)) return { ok: false, errors: ["NPC relationship policy rules must be an array."] };
  const errors: string[] = [];
  for (const [index, rule] of policy.rules.entries()) {
    if (typeof rule !== "object" || rule === null || Array.isArray(rule)) {
      errors.push("NPC relationship policy rule " + index + " must be an object.");
      continue;
    }
    if (!(NPC_RELATIONSHIP_POLICY_SCHEMA.relationshipTypes as readonly string[]).includes(rule.type)) {
      errors.push("Unsupported NPC relationship policy relationship type: " + String(rule.type) + ".");
    }
    for (const [key, min, max] of [
      ["minAffinity", -100, 100],
      ["maxAffinity", -100, 100],
      ["minTrust", 0, 100],
      ["maxTrust", 0, 100],
    ] as const) {
      if (rule[key] !== undefined && !bounded(rule[key], min, max)) {
        errors.push("NPC relationship policy " + key + " must be between " + min + " and " + max + ".");
      }
    }
    if (rule.minAffinity !== undefined && rule.maxAffinity !== undefined && rule.minAffinity > rule.maxAffinity) {
      errors.push("NPC relationship policy minAffinity cannot exceed maxAffinity.");
    }
    if (rule.minTrust !== undefined && rule.maxTrust !== undefined && rule.minTrust > rule.maxTrust) {
      errors.push("NPC relationship policy minTrust cannot exceed maxTrust.");
    }
    validateMap(rule.behaviors, "behaviors", NPC_RELATIONSHIP_POLICY_SCHEMA.behaviorKinds, errors);
    validateMap(rule.goals, "goals", NPC_RELATIONSHIP_POLICY_SCHEMA.goalKinds, errors);
  }
  return { ok: errors.length === 0, errors };
}
