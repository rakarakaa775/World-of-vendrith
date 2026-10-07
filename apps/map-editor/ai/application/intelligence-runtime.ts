import type { RuntimeObservation } from "../domain/runtime";
import type { Evidence } from "../domain/types";
import { createNpcWorldAwareness, type NpcWorldAwareness } from "./npc-world-awareness";

export type IntelligenceSource =
  | "direct-observation"
  | "trusted-agent"
  | "faction-report"
  | "inference"
  | "project-rule";

export interface IntelligenceClaim {
  id: string;
  subjectId: string;
  predicate: string;
  value: string | number | boolean;
  source: IntelligenceSource;
  confidence: number;
  uncertainty: number;
  observedTick: number;
  lastConfirmedTick: number;
  supportingClaimIds: readonly string[];
  contradictingClaimIds: readonly string[];
}

export interface IntelligenceBelief extends IntelligenceClaim {
  stale: boolean;
}

export interface IntelligencePropagationRule {
  sourceReliability: number;
  transmissionLoss: number;
  contradictionPenalty: number;
  maxHops: number;
}

export interface FactionIntelligenceInput {
  factionId: string;
  memberNpcIds: readonly string[];
  knownClaims: readonly IntelligenceClaim[];
}

export interface FactionIntelligence {
  factionId: string;
  memberNpcIds: readonly string[];
  claims: IntelligenceClaim[];
}

export interface IntelligenceAwareness {
  npcId: string;
  world: NpcWorldAwareness;
  beliefs: IntelligenceBelief[];
  highestPriorityUnknowns: IntelligenceClaim[];
}

export interface AdaptiveIntelligenceInput {
  claims: readonly IntelligenceClaim[];
  goal: string;
  riskTolerance: number;
}

export interface AdaptiveIntelligenceResult {
  confidence: number;
  informationGap: number;
  recommendedAction: "act" | "observe" | "seek-confirmation" | "avoid";
  reason: string;
}

const DEFAULT_PROPAGATION: IntelligencePropagationRule = {
  sourceReliability: 0.9,
  transmissionLoss: 0.15,
  contradictionPenalty: 0.25,
  maxHops: 3,
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) throw new Error("intelligence value must be finite");
  return Math.max(0, Math.min(1, value));
}

function nonNegativeInt(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) throw new Error(field + " must be a non-negative integer");
  return value;
}

function effectiveConfidence(
  confidence: number,
  sourceReliability: number,
  contradictions: number,
  supports: number,
  contradictionPenalty: number,
): number {
  const total = contradictions + supports;
  const conflictRatio = total === 0 ? 0 : contradictions / total;
  return clamp01(
    clamp01(confidence) *
      clamp01(sourceReliability) *
      (1 - clamp01(contradictionPenalty) * conflictRatio),
  );
}

export function createIntelligenceClaim(
  input: Omit<IntelligenceClaim, "confidence" | "uncertainty" | "supportingClaimIds" | "contradictingClaimIds"> & {
    confidence: number;
    sourceReliability?: number;
    supportingClaimIds?: readonly string[];
    contradictingClaimIds?: readonly string[];
  },
): IntelligenceClaim {
  const supportingClaimIds = [...(input.supportingClaimIds ?? [])].sort();
  const contradictingClaimIds = [...(input.contradictingClaimIds ?? [])].sort();
  const confidence = effectiveConfidence(
    input.confidence,
    input.sourceReliability ?? 1,
    contradictingClaimIds.length,
    supportingClaimIds.length,
    0.25,
  );
  return {
    ...input,
    confidence,
    uncertainty: 1 - confidence,
    supportingClaimIds,
    contradictingClaimIds,
  };
}

export function propagateIntelligenceClaim(
  claim: IntelligenceClaim,
  rule: Partial<IntelligencePropagationRule> = {},
  hops = 1,
  source: IntelligenceSource = "trusted-agent",
): IntelligenceClaim {
  const policy = { ...DEFAULT_PROPAGATION, ...rule };
  const safeHops = nonNegativeInt(hops, "hops");
  if (safeHops > policy.maxHops) {
    throw new Error("propagation exceeds maxHops");
  }
  const retainedConfidence = clamp01(
    claim.confidence *
      Math.pow(clamp01(policy.sourceReliability), safeHops) *
      Math.pow(1 - clamp01(policy.transmissionLoss), safeHops),
  );
  return {
    ...claim,
    id: claim.id + ":hop-" + safeHops,
    source,
    confidence: retainedConfidence,
    uncertainty: 1 - retainedConfidence,
    supportingClaimIds: [...claim.supportingClaimIds, claim.id],
    contradictingClaimIds: claim.contradictingClaimIds,
  };
}

export function decayIntelligenceClaim(
  claim: IntelligenceClaim,
  currentTick: number,
  halfLifeTicks: number,
): IntelligenceClaim {
  nonNegativeInt(currentTick, "currentTick");
  if (!Number.isFinite(halfLifeTicks) || halfLifeTicks <= 0) {
    throw new Error("halfLifeTicks must be greater than zero");
  }
  const age = Math.max(0, currentTick - claim.lastConfirmedTick);
  const confidence = clamp01(claim.confidence * Math.pow(0.5, age / halfLifeTicks));
  return { ...claim, confidence, uncertainty: 1 - confidence };
}

export function resolveBeliefs(
  claims: readonly IntelligenceClaim[],
  currentTick: number,
  halfLifeTicks = 100,
  staleThreshold = 0.25,
): IntelligenceBelief[] {
  const byKey = new Map<string, IntelligenceClaim[]>();
  for (const claim of claims) {
    const key = claim.subjectId + "::" + claim.predicate;
    const bucket = byKey.get(key) ?? [];
    bucket.push(claim);
    byKey.set(key, bucket);
  }

  const beliefs: IntelligenceBelief[] = [];
  for (const bucket of byKey.values()) {
    const ranked = bucket
      .map(claim => decayIntelligenceClaim(claim, currentTick, halfLifeTicks))
      .sort((a, b) => b.confidence - a.confidence || a.id.localeCompare(b.id));
    const winner = ranked[0];
    if (!winner) continue;
    beliefs.push({ ...winner, stale: winner.confidence < clamp01(staleThreshold) });
  }
  return beliefs.sort((a, b) => b.confidence - a.confidence || a.id.localeCompare(b.id));
}

export function buildFactionIntelligence(
  input: FactionIntelligenceInput,
  rule: Partial<IntelligencePropagationRule> = {},
): FactionIntelligence {
  const claims = input.knownClaims
    .map(claim => propagateIntelligenceClaim(claim, rule, 1, "faction-report"))
    .filter(claim => claim.confidence > 0);
  return {
    factionId: input.factionId,
    memberNpcIds: [...new Set(input.memberNpcIds)].sort(),
    claims,
  };
}

export function buildNpcIntelligenceAwareness(
  observation: RuntimeObservation,
  claims: readonly IntelligenceClaim[] = [],
  currentTick = observation.state.clock.tick,
): IntelligenceAwareness {
  const world = createNpcWorldAwareness(observation);
  const npcId = observation.perception?.self?.id ?? "unknown-npc";
  const beliefs = resolveBeliefs(claims, currentTick);
  const highestPriorityUnknowns = claims
    .filter(claim => claim.subjectId === npcId || claim.predicate.includes("danger") || claim.predicate.includes("enemy"))
    .filter(claim => claim.confidence < 0.6)
    .sort((a, b) => a.confidence - b.confidence || a.id.localeCompare(b.id))
    .slice(0, 10);

  return { npcId, world, beliefs, highestPriorityUnknowns };
}

export function adaptIntelligenceToDecision(
  input: AdaptiveIntelligenceInput,
): AdaptiveIntelligenceResult {
  const relevant = input.claims.filter(claim => claim.predicate.includes(input.goal) || claim.subjectId === input.goal);
  if (relevant.length === 0) {
    return {
      confidence: 0,
      informationGap: 1,
      recommendedAction: input.riskTolerance < 0.5 ? "seek-confirmation" : "observe",
      reason: "No relevant intelligence is available for the requested goal.",
    };
  }

  const confidence = relevant.reduce((sum, claim) => sum + claim.confidence, 0) / relevant.length;
  const informationGap = 1 - confidence;
  const riskTolerance = clamp01(input.riskTolerance);

  if (confidence >= 0.8) {
    return { confidence, informationGap, recommendedAction: "act", reason: "Relevant intelligence is sufficiently certain." };
  }
  if (confidence < 0.35 && riskTolerance < 0.5) {
    return { confidence, informationGap, recommendedAction: "avoid", reason: "Information is too uncertain for the configured risk tolerance." };
  }
  if (confidence < 0.6) {
    return { confidence, informationGap, recommendedAction: "seek-confirmation", reason: "The decision-relevant intelligence remains uncertain." };
  }
  return { confidence, informationGap, recommendedAction: "observe", reason: "Moderate confidence favors another observation before committing." };
}

export function intelligenceClaimsToEvidence(
  claims: readonly IntelligenceClaim[],
): Evidence[] {
  return claims.map(claim => ({
    id: "intelligence:" + claim.id,
    kind: "inference",
    source: "ai-intelligence-runtime",
    fact: claim.subjectId + " " + claim.predicate + "=" + String(claim.value),
    timestamp: String(claim.lastConfirmedTick),
    version: "phase-15",
    confidence: claim.confidence >= 0.75 ? "high" : claim.confidence >= 0.45 ? "medium" : "low",
  }));
}
