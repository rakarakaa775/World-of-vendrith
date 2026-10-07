# Vendrith AI Phase 15 — Intelligence Runtime

Phase 15 establishes the information layer between runtime observation and AI decisions.

## 15.1 World intelligence
World awareness is derived from the authoritative runtime observation. It exposes environment, hazards, resources, events, time-of-day, and travel risk without mutating world state.

## 15.2 Faction intelligence
Faction knowledge is represented as claims shared through a controlled propagation boundary. Receiving a report never changes the authoritative world state.

## 15.3 Uncertainty
Every intelligence claim has bounded confidence and explicit uncertainty. Confidence is affected by source reliability and contradictory/supporting evidence.

## 15.4 Propagation
Information may be transmitted between agents/factions with deterministic source reliability and transmission loss. Propagation is bounded by a maximum hop count.

## 15.5 Decay
Claims lose confidence as they age. Decay is deterministic and uses a configurable half-life. A decayed claim may become stale but is never silently deleted.

## 15.6 Belief and awareness
The runtime resolves competing claims into a deterministic belief set. Lower-confidence claims remain visible as uncertainty rather than becoming facts.

## 15.7 Adaptive intelligence
Decision support uses relevant claim confidence and configured risk tolerance:
- high confidence: act
- moderate confidence: observe
- low confidence: seek confirmation
- very low confidence with low risk tolerance: avoid

## Authority boundary

Phase 15 does **not** grant AI authority to mutate the game world. It produces information, beliefs, evidence, and decision recommendations. Execution remains behind the existing runtime policy and verification pipeline.

## Verification

The Phase 15 test suite covers confidence/uncertainty, propagation loss, propagation limits, decay, conflict resolution, stale beliefs, faction sharing, world awareness, adaptive decisions, evidence conversion, and bounded numeric state.
