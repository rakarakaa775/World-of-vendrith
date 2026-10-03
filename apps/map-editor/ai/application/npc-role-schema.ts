import { NPC_ARCHETYPES, type NpcArchetype } from "./npc-archetype-schema";

export const NPC_ROLES = [
  "farmer", "miner", "blacksmith", "guard", "scout", "soldier",
  "shopkeeper", "trader", "citizen", "parent", "companion", "animal",
  "special", "custom",
] as const;

export type NpcRole = (typeof NPC_ROLES)[number];

export interface NpcRoleValidation { ok: boolean; errors: string[]; }

const ROLE_ARCHETYPES: Record<NpcRole, readonly NpcArchetype[]> = {
  farmer: ["production", "worker"], miner: ["production", "worker"], blacksmith: ["production", "worker"],
  guard: ["military"], scout: ["military"], soldier: ["military"],
  shopkeeper: ["merchant"], trader: ["merchant"],
  citizen: ["civilian"], parent: ["civilian"], companion: ["companion"], animal: ["animal"],
  special: ["special"], custom: ["custom"],
};

export const NPC_ROLE_SCHEMA = {
  field: "role", type: "string", required: false, values: NPC_ROLES, archetypes: NPC_ARCHETYPES,
  semanticRule: "Descriptive role/job classification only; role does not inject behavior, goals, needs, combat, permissions, or capabilities.",
} as const;

export function npcRoleArchetypes(role: NpcRole): readonly NpcArchetype[] { return ROLE_ARCHETYPES[role]; }

export function validateNpcRole(role: unknown, archetype?: unknown): NpcRoleValidation {
  if (role === undefined) return { ok: true, errors: [] };
  if (typeof role !== "string") return { ok: false, errors: ["NPC role must be a string."] };
  if (!(NPC_ROLES as readonly string[]).includes(role)) return { ok: false, errors: ["Unsupported NPC role: " + role + "."] };
  if (archetype !== undefined) {
    if (typeof archetype !== "string" || !(NPC_ARCHETYPES as readonly string[]).includes(archetype)) return { ok: false, errors: ["A supported NPC archetype is required to validate role compatibility."] };
    if (!ROLE_ARCHETYPES[role as NpcRole].includes(archetype as NpcArchetype)) return { ok: false, errors: ["NPC role " + role + " is not compatible with archetype " + archetype + "."] };
  }
  return { ok: true, errors: [] };
}
