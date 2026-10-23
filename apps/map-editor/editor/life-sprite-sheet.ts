/** Validated geometry contract for sprite-sheet layers. Metadata only: source-defined
 * frame geometry must be confirmed before a layer can be used in a compositor.
 */
export type LifeSpriteSheetGeometry = {
  assetId: string;
  imageWidth: number;
  imageHeight: number;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  originX: number;
  originY: number;
  anchorX: number;
  anchorY: number;
  zIndex: number;
};

const positive = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) > 0;
const nonNegative = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;

export function parseLifeSpriteSheetGeometry(value: unknown): LifeSpriteSheetGeometry {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Geometri sprite Life harus berupa objek.");
  }
  const row = value as Record<string, unknown>;
  if (typeof row.assetId !== "string" || !/^[a-z0-9][a-z0-9:_-]{1,127}$/i.test(row.assetId)) {
    throw new Error("assetId geometri sprite tidak valid.");
  }
  for (const key of ["imageWidth", "imageHeight", "frameWidth", "frameHeight", "columns", "rows"] as const) {
    if (!positive(row[key])) throw new Error(`${key} harus berupa bilangan bulat positif.`);
  }
  for (const key of ["originX", "originY", "anchorX", "anchorY"] as const) {
    if (!nonNegative(row[key])) throw new Error(`${key} harus berupa bilangan bulat non-negatif.`);
  }
  if (!Number.isSafeInteger(row.zIndex)) throw new Error("zIndex harus berupa bilangan bulat.");
  if ((row.originX as number) + (row.columns as number) * (row.frameWidth as number) > (row.imageWidth as number) ||
      (row.originY as number) + (row.rows as number) * (row.frameHeight as number) > (row.imageHeight as number)) {
    throw new Error("Grid frame sprite melampaui dimensi gambar.");
  }
  if ((row.anchorX as number) >= (row.frameWidth as number) || (row.anchorY as number) >= (row.frameHeight as number)) {
    throw new Error("Anchor sprite harus berada di dalam satu frame.");
  }
  return {
    assetId: row.assetId as string, imageWidth: row.imageWidth as number, imageHeight: row.imageHeight as number,
    frameWidth: row.frameWidth as number, frameHeight: row.frameHeight as number,
    columns: row.columns as number, rows: row.rows as number, originX: row.originX as number,
    originY: row.originY as number, anchorX: row.anchorX as number, anchorY: row.anchorY as number,
    zIndex: row.zIndex as number,
  };
}

export function isLifeSpriteSheetGeometryCompatible(
  geometry: LifeSpriteSheetGeometry,
  expected: { frameWidth: number; frameHeight: number },
): boolean {
  return geometry.frameWidth === expected.frameWidth && geometry.frameHeight === expected.frameHeight;
}
