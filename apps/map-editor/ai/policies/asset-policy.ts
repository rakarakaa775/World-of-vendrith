import type { Evidence } from "../domain/types";

export type AssetUsageDomain = "world" | "region" | "review";
export type AssetLicenseState = "clear" | "restricted" | "unknown";

export interface AssetIntelligence {
  evidence: Evidence;
  usageDomain: AssetUsageDomain;
  licenseState: AssetLicenseState;
  reason: string;
}

function factRecord(evidence: Evidence): Record<string, unknown> {
  try {
    const parsed = JSON.parse(evidence.fact) as unknown;
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function textValue(record: Record<string, unknown>, ...keys: string[]): string {
  return keys.map((key) => record[key]).filter((value): value is string => typeof value === "string").join(" ").toLowerCase();
}

export function classifyAssetEvidence(evidence: Evidence): AssetIntelligence {
  const record = factRecord(evidence);
  const text = textValue(
    record,
    "name",
    "slug",
    "category",
    "placement_category",
    "placementCategory",
    "role",
    "asset_path",
    "assetPath",
    "source_name",
    "source",
  );

  const region = /bridge|dock|ship|town|village|building|structure|road|street|port|landmark/.test(text);
  const world = /terrain|grass|dirt|sand|stone|mud|beach|water|river|lake|sea|ocean|mountain|hill|cliff|rock|forest|jungle|desert|swamp|snow|vegetation|tree|plant/.test(text);

  let usageDomain: AssetUsageDomain = "review";
  let reason = "Asset classification is ambiguous or lacks sufficient semantic evidence.";
  if (region && !world) {
    usageDomain = "region";
    reason = "Asset matches Vendrith structural/settlement categories assigned to REGION.";
  } else if (world && !region) {
    usageDomain = "world";
    reason = "Asset matches Vendrith natural terrain/nature categories assigned to WORLD.";
  } else if (world && region) {
    reason = "Asset matches both natural and structural terms; manual review is required.";
  }

  const verification = String(record.license_verification_status ?? record.licenseVerificationStatus ?? "").toLowerCase();
  const usage = String(record.license_usage_status ?? record.licenseUsageStatus ?? "").toLowerCase();
  const commercial = record.commercial_use_allowed ?? record.commercialUseAllowed;
  const verified = verification === "verified";
  const allowed = usage === "allowed" || usage === "permitted";
  const explicitlyDisallowed = usage === "restricted" || usage === "prohibited" || usage === "denied";
  const commercialDisallowed = commercial === false;

  let licenseState: AssetLicenseState = "unknown";
  if (verified && explicitlyDisallowed) {
    licenseState = "restricted";
  } else if (verified && allowed && !commercialDisallowed) {
    licenseState = "clear";
  } else if (verified && commercialDisallowed) {
    licenseState = "restricted";
  }

  return { evidence, usageDomain, licenseState, reason };
}
