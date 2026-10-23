import { describe, expect, it } from "vitest";
import { parseLifeAssetReference } from "./life-asset-catalog";
import { buildLifeSpriteLayerPlan } from "./life-sprite-layer-plan";

const asset = (assetId: string, approval: "approved" | "pending" = "approved") =>
  parseLifeAssetReference({
    assetId, part: "hair", race: "human", variant: "test", previewPath: null, approval,
    provenance: {
      sourceName: "Test pack", sourceUrl: "https://example.invalid/source", sourcePath: "hair.png",
      repositoryPath: "assets/hair.png", sha256: "a".repeat(64), license: "CC-BY-4.0",
      attribution: "Test artist", licenseVerified: true,
    },
  });
const geometry = (assetId: string, zIndex: number) => ({
  assetId, imageWidth: 64, imageHeight: 64, frameWidth: 64, frameHeight: 64,
  columns: 1, rows: 1, originX: 0, originY: 0, anchorX: 32, anchorY: 56, zIndex,
});

describe("Life sprite layer plan", () => {
  it("orders approved layers by z-index with a stable asset-id tie-breaker", () => {
    const plan = buildLifeSpriteLayerPlan(
      [asset("lpc:z"), asset("lpc:b"), asset("lpc:a")],
      [geometry("lpc:z", 20), geometry("lpc:b", 10), geometry("lpc:a", 10)],
    );
    expect(plan.map((entry) => entry.asset.assetId)).toEqual(["lpc:a", "lpc:b", "lpc:z"]);
  });

  it("excludes pending assets without requiring guessed geometry", () => {
    expect(buildLifeSpriteLayerPlan([asset("lpc:pending", "pending")], [])).toEqual([]);
  });

  it("fails closed when an approved asset has no geometry", () => {
    expect(() => buildLifeSpriteLayerPlan([asset("lpc:missing")], []))
      .toThrow(/Geometri sprite belum tersedia/);
  });

  it("rejects duplicate asset IDs and duplicate geometry IDs", () => {
    expect(() => buildLifeSpriteLayerPlan([asset("lpc:dup"), asset("lpc:dup")], []))
      .toThrow(/ID aset Life duplikat/);
    expect(() => buildLifeSpriteLayerPlan([asset("lpc:one")],
      [geometry("lpc:one", 1), geometry("lpc:one", 2)]))
      .toThrow(/Geometri sprite duplikat/);
  });
});
