import type { RuntimeAction, RuntimeObservation } from "../domain/runtime";
import type { NpcNeedState, RuntimeGoalKind } from "../domain/runtime-goal";
import type { NpcNeedsStore } from "../domain/runtime-npc-needs";
import type { NpcActivityEffectResult, NpcActivityEffectStore } from "../domain/runtime-npc-activity-effects";
import { effectiveNpcEnvironmentConditions } from "./npc-environment-policy-runtime";

const NEED_KEYS: Array<keyof NpcNeedState> = ["hunger", "energy", "social", "safety"];
const GOALS: RuntimeGoalKind[] = ["work", "eat", "sleep", "socialize", "go-to-location", "respond-to-event"];

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
function configuredEffect(observation: RuntimeObservation, goal: RuntimeGoalKind): Partial<NpcNeedState> | undefined {
  const rules = effectiveNpcEnvironmentConditions(observation).npc_activity_effects;
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) return undefined;
  const raw = (rules as Record<string, unknown>)[goal];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const result: Partial<NpcNeedState> = {};
  for (const key of NEED_KEYS) if (finite((raw as Record<string, unknown>)[key])) result[key] = Number((raw as Record<string, unknown>)[key]);
  return Object.keys(result).length ? result : undefined;
}
export function applyVerifiedNpcActivityEffect(
  action: RuntimeAction,
  observation: RuntimeObservation,
  executionOk: boolean,
  verificationOk: boolean,
  activityCompleted: boolean,
  needsStore: NpcNeedsStore,
  effectStore: NpcActivityEffectStore,
): NpcActivityEffectResult {
  const actionId = action.id;
  if (!executionOk || !verificationOk) return { applied: false, actionId, reason: "Activity was not successfully executed and verified." };
  if (action.type !== "npc.activity" || action.intelligence !== "npc") return { applied: false, actionId, reason: "Action is not a verified NPC activity." };
  if (!activityCompleted) return { applied: false, actionId, reason: "Activity is still running." };
  if (effectStore.hasApplied(actionId)) return { applied: false, actionId, reason: "Activity effect was already applied." };
  const goal = action.payload.goal;
  if (typeof goal !== "string" || !GOALS.includes(goal as RuntimeGoalKind)) return { applied: false, actionId, reason: "Activity has no supported goal." };
  const effect = configuredEffect(observation, goal as RuntimeGoalKind);
  if (!effect) return { applied: false, actionId, goal: goal as RuntimeGoalKind, reason: "No explicit activity effect is configured." };
  const self = observation.perception?.self;
  if (!self || self.kind !== "npc") return { applied: false, actionId, goal: goal as RuntimeGoalKind, reason: "NPC self was not found." };
  const current = needsStore.get(self.id);
  if (!current) return { applied: false, actionId, goal: goal as RuntimeGoalKind, reason: "Persistent NPC needs state was not found." };
  const needs = { ...current.needs };
  for (const key of NEED_KEYS) {
    const delta = effect[key];
    if (finite(delta)) needs[key] = clamp(needs[key] + delta);
  }
  const next = { ...current, needs, updatedAtTick: observation.state.clock.tick, stateVersion: observation.state.stateVersion };
  needsStore.set(next);
  effectStore.markApplied(actionId);
  return { applied: true, actionId, goal: goal as RuntimeGoalKind, needs, reason: "Explicit verified activity effect applied." };
}
