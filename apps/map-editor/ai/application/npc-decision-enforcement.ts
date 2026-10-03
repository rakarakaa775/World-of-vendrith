import type { RuntimeObservation } from "../domain/runtime";
import type { RuntimeBehaviorCandidate } from "../domain/runtime-behavior";
import type { RuntimeGoal } from "../domain/runtime-goal";
import { validateNpcDecisionProfile, type NpcDecisionProfile } from "./npc-decision-profile-schema";

function decisionProfile(observation: RuntimeObservation): NpcDecisionProfile | undefined {
  const state = observation.perception?.self?.state;
  if (!state || typeof state.decisionProfile !== "object" || state.decisionProfile === null || Array.isArray(state.decisionProfile)) return undefined;
  return state.decisionProfile as NpcDecisionProfile;
}

export function enforceNpcDecisionProfileBehaviors(
  observation: RuntimeObservation,
  candidates: RuntimeBehaviorCandidate[],
): RuntimeBehaviorCandidate[] {
  const profile = decisionProfile(observation);
  if (!profile || profile.capabilities === undefined) return candidates;
  const validation = validateNpcDecisionProfile(profile);
  if (!validation.ok) return [];
  const allowed = new Set(profile.capabilities.behaviors ?? []);
  return candidates.filter(candidate => allowed.has(candidate.kind));
}

export function enforceNpcDecisionProfileGoals(
  observation: RuntimeObservation,
  goals: RuntimeGoal[],
): RuntimeGoal[] {
  const profile = decisionProfile(observation);
  if (!profile || profile.capabilities === undefined) return goals;
  const validation = validateNpcDecisionProfile(profile);
  if (!validation.ok) return [];
  const allowed = new Set(profile.capabilities.goals ?? []);
  return goals.filter(goal => allowed.has(goal.kind));
}
