import { describe, expect, it } from "vitest";
import { filterLifeAssetCatalog, isLifeAssetRuntimeEligible, parseLifeAssetReference } from "./life-asset-catalog";

const valid = {
  assetId: "lpc:human:face:001", part: "face", race: "human", variant: "neutral", previewPath: "ASSET_LIBRARY/faces/human.png", approval: "approved",
  provenance: { sourceName: "Example pack", sourceUrl: "https://example.invalid/source", sourcePath: "faces/human.png", repositoryPath: "ASSET_LIBRARY/faces/human.png", sha256: "a".repeat(64), license: "CC-BY-4.0", attribution: "Artist", licenseVerified: true },
};

describe("Life asset catalog provenance gate", () => {
  it("normalizes a complete approved reference without duplicating binary data", () => {
    const result = parseLifeAssetReference(valid);
    expect(result.provenance.sha256).toBe("a".repeat(64));
    expect(isLifeAssetRuntimeEligible(result)).toBe(true);
    expect("binary" in result).toBe(false);
  });
  it("fails closed for missing provenance, invalid hash, or unsupported parts", () => {
    expect(() => parseLifeAssetReference({ ...valid, provenance: { ...valid.provenance, sha256: "missing" } })).toThrow(/SHA-256/);
    expect(() => parseLifeAssetReference({ ...valid, part: "weapon" })).toThrow(/tidak didukung/);
    expect(() => parseLifeAssetReference({ ...valid, provenance: undefined })).toThrow(/Provenance/);
  });
  it("keeps pending, rejected and unverified art out of the runtime picker", () => {
    const pending = parseLifeAssetReference({ ...valid, approval: "pending" });
    const unverified = parseLifeAssetReference({ ...valid, provenance: { ...valid.provenance, licenseVerified: false } });
    expect(isLifeAssetRuntimeEligible(pending)).toBe(false);
    expect(isLifeAssetRuntimeEligible(unverified)).toBe(false);
    expect(filterLifeAssetCatalog([valid, { ...valid, approval: "pending" }])).toHaveLength(1);
  });
});
