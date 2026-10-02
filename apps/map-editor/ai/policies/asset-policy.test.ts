import { describe, expect, it } from "vitest";
import type { Evidence } from "../domain/types";
import { classifyAssetEvidence } from "./asset-policy";

const evidence = (fact: Record<string, unknown>): Evidence => ({
  id: "asset-1",
  kind: "verified-fact",
  source: "asset_registry:test",
  fact: JSON.stringify(fact),
  confidence: "high",
});

describe("asset policy", () => {
  it("classifies natural terrain as WORLD", () => {
    const result = classifyAssetEvidence(evidence({
      name: "Deep Sea Water",
      category: "water",
      license_verification_status: "verified",
      license_usage_status: "allowed",
      commercial_use_allowed: true,
    }));
    expect(result.usageDomain).toBe("world");
    expect(result.licenseState).toBe("clear");
  });

  it("classifies structures as REGION", () => {
    const result = classifyAssetEvidence(evidence({
      name: "Stone Bridge",
      category: "bridge",
      license_verification_status: "verified",
      license_usage_status: "allowed",
    }));
    expect(result.usageDomain).toBe("region");
  });

  it("sends ambiguous assets to REVIEW", () => {
    const result = classifyAssetEvidence(evidence({
      name: "Port Rock Building",
      category: "unknown",
    }));
    expect(result.usageDomain).toBe("review");
    expect(result.licenseState).toBe("unknown");
  });

  it("marks verified restricted assets as restricted", () => {
    const result = classifyAssetEvidence(evidence({
      name: "Town",
      category: "building",
      license_verification_status: "verified",
      license_usage_status: "restricted",
    }));
    expect(result.licenseState).toBe("restricted");
  });

  it("does not call a license clear without verified permission", () => {
    const result = classifyAssetEvidence(evidence({
      name: "Grass",
      category: "terrain",
      license_usage_status: "allowed",
    }));
    expect(result.licenseState).toBe("unknown");
  });
});
