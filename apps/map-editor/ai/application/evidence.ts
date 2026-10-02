import type { Evidence } from "../domain/types";

export function unresolvedEvidence(source: string, fact: string): Evidence {
  return {
    id: `unresolved-${source}`,
    kind: "unresolved-conflict",
    source,
    fact,
    confidence: "low",
  };
}

export function verifiedEvidence(source: string, fact: string): Evidence {
  return {
    id: `verified-${source}`,
    kind: "verified-fact",
    source,
    fact,
    confidence: "high",
  };
}

export function projectRuleEvidence(source: string, fact: string): Evidence {
  return {
    id: `rule-${source}`,
    kind: "project-rule",
    source,
    fact,
    confidence: "high",
  };
}
