export type IntelligenceUncertaintySource =
  | "direct_observation"
  | "trusted_agent"
  | "faction_report"
  | "inference"
  | "unknown";

export interface IntelligenceUncertaintyInput {
  confidence: number;
  sourceReliability?: number;
  contradictionCount?: number;
  supportingObservationCount?: number;
}

export interface IntelligenceUncertainty {
  confidence: number;
  uncertainty: number;
  sourceReliability: number;
  contradictionCount: number;
  supportingObservationCount: number;
  source: IntelligenceUncertaintySource;
}

export interface IntelligenceClaim<T = string> {
  claimId: string;
  subjectId: string;
  predicate: T;
  uncertainty: IntelligenceUncertainty;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("value must be finite");
  }

  return Math.min(1, Math.max(0, value));
}

function nonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }

  return value;
}

/**
 * Phase 15.3 establishes an uncertainty envelope around intelligence.
 *
 * It deliberately does not perform time decay (15.5) or belief propagation
 * (15.4). Its job is to make uncertainty explicit before downstream systems
 * consume an observation as a fact.
 */
export function buildIntelligenceUncertainty(
  input: IntelligenceUncertaintyInput,
  source: IntelligenceUncertaintySource = "unknown",
): IntelligenceUncertainty {
  const confidence = clamp01(input.confidence);
  const sourceReliability = clamp01(input.sourceReliability ?? 1);
  const contradictionCount = nonNegativeInteger(
    input.contradictionCount ?? 0,
    "contradictionCount",
  );
  const supportingObservationCount = nonNegativeInteger(
    input.supportingObservationCount ?? 0,
    "supportingObservationCount",
  );

  const totalEvidence =
    contradictionCount + supportingObservationCount;

  const contradictionRatio =
    totalEvidence === 0 ? 0 : contradictionCount / totalEvidence;

  // Confidence is bounded by source reliability and contradiction pressure.
  // This is deterministic and does not mutate the caller's raw observation.
  const effectiveConfidence = clamp01(
    confidence * sourceReliability * (1 - contradictionRatio),
  );

  return {
    confidence: effectiveConfidence,
    uncertainty: 1 - effectiveConfidence,
    sourceReliability,
    contradictionCount,
    supportingObservationCount,
    source,
  };
}

export function isSufficientlyCertain(
  uncertainty: IntelligenceUncertainty,
  threshold = 0.75,
): boolean {
  return uncertainty.confidence >= clamp01(threshold);
}

export function rankClaimsByCertainty<T>(
  claims: readonly IntelligenceClaim<T>[],
): IntelligenceClaim<T>[] {
  return [...claims].sort(
    (a, b) =>
      b.uncertainty.confidence - a.uncertainty.confidence ||
      a.claimId.localeCompare(b.claimId),
  );
}
