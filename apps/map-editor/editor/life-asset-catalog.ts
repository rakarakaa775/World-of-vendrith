/** Typed boundary for reusable Life Creator art references. This is metadata only:
 * binaries remain in the canonical asset registry and are never copied here.
 */
export const LIFE_ASSET_PARTS = ["face", "eyes", "hair", "marking", "race-overlay"] as const;
export type LifeAssetPart = (typeof LIFE_ASSET_PARTS)[number];
export type LifeAssetApproval = "approved" | "pending" | "rejected";

export type LifeAssetReference = {
  assetId: string;
  part: LifeAssetPart;
  race: string | null;
  variant: string;
  previewPath: string | null;
  approval: LifeAssetApproval;
  provenance: {
    sourceName: string;
    sourceUrl: string;
    sourcePath: string;
    repositoryPath: string;
    sha256: string;
    license: string;
    attribution: string | null;
    licenseVerified: boolean;
  };
};

const PART_SET = new Set<string>(LIFE_ASSET_PARTS);
const APPROVALS = new Set<string>(["approved", "pending", "rejected"]);
const SHA256 = /^[a-f0-9]{64}$/i;
const ASSET_ID = /^[a-z0-9][a-z0-9:_-]{1,127}$/i;

export function parseLifeAssetReference(value: unknown): LifeAssetReference {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Referensi asset Life harus berupa objek.");
  const row = value as Record<string, unknown>;
  if (typeof row.assetId !== "string" || !ASSET_ID.test(row.assetId)) throw new Error("assetId Life tidak valid.");
  if (typeof row.part !== "string" || !PART_SET.has(row.part)) throw new Error("Bagian asset Life tidak didukung.");
  if (row.race !== null && typeof row.race !== "string") throw new Error("Ras asset Life tidak valid.");
  if (typeof row.variant !== "string" || !row.variant.trim() || row.variant.length > 80) throw new Error("Varian asset Life tidak valid.");
  if (row.previewPath !== null && (typeof row.previewPath !== "string" || row.previewPath.length > 1024)) throw new Error("Path preview asset Life tidak valid.");
  if (typeof row.approval !== "string" || !APPROVALS.has(row.approval)) throw new Error("Status persetujuan asset Life tidak valid.");
  if (!row.provenance || typeof row.provenance !== "object" || Array.isArray(row.provenance)) throw new Error("Provenance asset Life wajib tersedia.");
  const provenance = row.provenance as Record<string, unknown>;
  for (const key of ["sourceName", "sourceUrl", "sourcePath", "repositoryPath", "license"] as const) {
    if (typeof provenance[key] !== "string" || !provenance[key].trim() || provenance[key].length > 2048) throw new Error(`Provenance ${key} wajib tersedia.`);
  }
  if (typeof provenance.sha256 !== "string" || !SHA256.test(provenance.sha256)) throw new Error("SHA-256 asset Life tidak valid.");
  if (provenance.attribution !== null && typeof provenance.attribution !== "string") throw new Error("Attribution asset Life tidak valid.");
  if (typeof provenance.licenseVerified !== "boolean") throw new Error("Status verifikasi lisensi wajib eksplisit.");
  return {
    assetId: row.assetId,
    part: row.part as LifeAssetPart,
    race: row.race as string | null,
    variant: row.variant.trim(),
    previewPath: row.previewPath as string | null,
    approval: row.approval as LifeAssetApproval,
    provenance: {
      sourceName: provenance.sourceName as string,
      sourceUrl: provenance.sourceUrl as string,
      sourcePath: provenance.sourcePath as string,
      repositoryPath: provenance.repositoryPath as string,
      sha256: (provenance.sha256 as string).toLowerCase(),
      license: provenance.license as string,
      attribution: provenance.attribution as string | null,
      licenseVerified: provenance.licenseVerified as boolean,
    },
  };
}

/** Only explicitly approved, license-verified, provenance-complete art can ship in the picker. */
export function isLifeAssetRuntimeEligible(asset: LifeAssetReference): boolean {
  return asset.approval === "approved" && asset.provenance.licenseVerified &&
    Boolean(asset.provenance.sourceName.trim() && asset.provenance.sourceUrl.trim() &&
      asset.provenance.sourcePath.trim() && asset.provenance.repositoryPath.trim() &&
      asset.provenance.license.trim() && SHA256.test(asset.provenance.sha256));
}

export function filterLifeAssetCatalog(values: unknown[]): LifeAssetReference[] {
  return values.map(parseLifeAssetReference).filter(isLifeAssetRuntimeEligible);
}
