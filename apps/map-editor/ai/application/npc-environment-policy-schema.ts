export const NPC_ENVIRONMENT_POLICY_KEYS = [
  "npc_movement", "npc_sensing", "npc_needs", "npc_behavior",
  "npc_goal_priority", "npc_detection_behavior", "npc_investigation_recovery",
] as const;
export type NpcEnvironmentPolicyKey = typeof NPC_ENVIRONMENT_POLICY_KEYS[number];

const FAILURE_KEYS = ["navigation", "execution", "verification"] as const;
const DETECTION_CHANNELS = ["visibility", "hearing", "smell"] as const;
const NEED_KEYS = ["hunger", "energy", "social", "safety"] as const;
const BEHAVIOR_KINDS = ["idle", "follow-player", "wander", "investigate", "flee"] as const;
const GOAL_KINDS = ["work", "eat", "sleep", "go-to-location", "respond-to-event"] as const;

export type NpcEnvironmentPolicy = Record<string, unknown>;

export interface NpcEnvironmentPolicyValidation { ok: boolean; errors: string[]; }

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function finite(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}
function checkNumericRecord(value: unknown, keys: readonly string[], path: string, errors: string[]) {
  if (!object(value)) { errors.push(path + " must be an object."); return; }
  for (const key of keys) if (key in value && !finite(value[key])) errors.push(path + "." + key + " must be a finite number.");
}

export function validateNpcEnvironmentPolicy(value: unknown): NpcEnvironmentPolicyValidation {
  const errors: string[] = [];
  if (!object(value)) return { ok: false, errors: ["NPC environment policy must be an object."] };
  for (const key of Object.keys(value)) {
    if (!(NPC_ENVIRONMENT_POLICY_KEYS as readonly string[]).includes(key)) errors.push("Unsupported environment policy key: " + key + ".");
  }
  if ("npc_movement" in value) {
    const rule = value.npc_movement;
    if (!object(rule)) errors.push("npc_movement must be an object.");
    else if ("cost_multiplier" in rule && !finite(rule.cost_multiplier)) errors.push("npc_movement.cost_multiplier must be a finite number.");
  }
  if ("npc_sensing" in value) checkNumericRecord(value.npc_sensing, ["hearing_radius", "smell_radius", "detection_modifier"], "npc_sensing", errors);
  if ("npc_needs" in value) checkNumericRecord(value.npc_needs, NEED_KEYS, "npc_needs", errors);
  if ("npc_goal_priority" in value) checkNumericRecord(value.npc_goal_priority, GOAL_KINDS, "npc_goal_priority", errors);

  if ("npc_behavior" in value) {
    const rules = value.npc_behavior;
    if (!object(rules)) errors.push("npc_behavior must be an object.");
    else for (const key of Object.keys(rules)) {
      if (!(BEHAVIOR_KINDS as readonly string[]).includes(key)) { errors.push("Unsupported npc_behavior kind: " + key + "."); continue; }
      const rule = rules[key];
      if (!object(rule)) { errors.push("npc_behavior." + key + " must be an object."); continue; }
      if ("priority_delta" in rule && !finite(rule.priority_delta)) errors.push("npc_behavior." + key + ".priority_delta must be a finite number.");
      if ("reason" in rule && typeof rule.reason !== "string") errors.push("npc_behavior." + key + ".reason must be a string.");
    }
  }
  if ("npc_detection_behavior" in value) {
    const rules = value.npc_detection_behavior;
    if (!object(rules)) errors.push("npc_detection_behavior must be an object.");
    else for (const channel of Object.keys(rules)) {
      if (!(DETECTION_CHANNELS as readonly string[]).includes(channel)) { errors.push("Unsupported detection channel: " + channel + "."); continue; }
      const channelRules = rules[channel];
      if (!object(channelRules)) { errors.push("npc_detection_behavior." + channel + " must be an object."); continue; }
      for (const action of Object.keys(channelRules)) if (action !== "investigate") errors.push("Unsupported detection reaction: " + channel + "." + action + ".");
      const investigate = channelRules.investigate;
      if (investigate !== undefined) {
        if (!object(investigate)) errors.push("npc_detection_behavior." + channel + ".investigate must be an object.");
        else {
          if ("priority_delta" in investigate && !finite(investigate.priority_delta)) errors.push("npc_detection_behavior." + channel + ".investigate.priority_delta must be a finite number.");
          if ("reason" in investigate && typeof investigate.reason !== "string") errors.push("npc_detection_behavior." + channel + ".investigate.reason must be a string.");
        }
      }
    }
  }
  if ("npc_investigation_recovery" in value) {
    const rules = value.npc_investigation_recovery;
    if (!object(rules)) errors.push("npc_investigation_recovery must be an object.");
    else for (const failure of Object.keys(rules)) {
      if (!(FAILURE_KEYS as readonly string[]).includes(failure)) { errors.push("Unsupported investigation failure: " + failure + "."); continue; }
      const rule = rules[failure];
      if (!object(rule)) { errors.push("npc_investigation_recovery." + failure + " must be an object."); continue; }
      if (rule.action !== "retry" && rule.action !== "clear") errors.push("npc_investigation_recovery." + failure + ".action must be retry or clear.");
    }
  }
  return { ok: errors.length === 0, errors };
}

export const NPC_ENVIRONMENT_POLICY_SCHEMA = {
  keys: NPC_ENVIRONMENT_POLICY_KEYS, behaviorKinds: BEHAVIOR_KINDS, goalKinds: GOAL_KINDS,
  detectionChannels: DETECTION_CHANNELS, investigationFailures: FAILURE_KEYS,
  recoveryActions: ["retry", "clear"] as const,
};
