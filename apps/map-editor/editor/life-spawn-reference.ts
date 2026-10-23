import { parseSavedLife, type SavedLife } from "./life-catalog";

export interface LifeSpawnReferenceV1 {
  version: 1;
  lifeCatalogId: string;
  lifeId: string;
  displayName: string;
  race: SavedLife["race"];
  appearance: Pick<SavedLife, "face" | "hair" | "hairColor" | "eyes" | "skin" | "faceShape" | "marking">;
  target: { worldId: string; x: number; y: number };
}
export interface LifeSpawnReferenceValidation { ok: boolean; errors: string[]; }

const validWorldId = /^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,127}$/;

/** Builds a validated spawn proposal only. It deliberately does not create or mutate runtime entities. */
export function buildLifeSpawnReference(lifeValue: unknown, targetValue: unknown): LifeSpawnReferenceV1 {
  const life = parseSavedLife(lifeValue);
  if (!targetValue || typeof targetValue !== "object" || Array.isArray(targetValue)) throw new Error("Target spawn harus berupa objek.");
  const target = targetValue as Record<string, unknown>;
  if (typeof target.worldId !== "string" || !validWorldId.test(target.worldId)) throw new Error("ID world spawn tidak valid.");
  if (typeof target.x !== "number" || !Number.isFinite(target.x) || target.x < 0) throw new Error("Koordinat X spawn tidak valid.");
  if (typeof target.y !== "number" || !Number.isFinite(target.y) || target.y < 0) throw new Error("Koordinat Y spawn tidak valid.");
  const { face, hair, hairColor, eyes, skin, faceShape, marking } = life;
  return {
    version: 1,
    lifeCatalogId: life.catalogId,
    lifeId: life.id,
    displayName: life.name,
    race: life.race,
    appearance: { face, hair, hairColor, eyes, skin, faceShape, marking },
    target: { worldId: target.worldId, x: target.x, y: target.y },
  };
}

export function validateLifeSpawnReference(value: unknown): LifeSpawnReferenceValidation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, errors: ["Spawn reference harus berupa objek."] };
  const row = value as Record<string, unknown>;
  const errors: string[] = [];
  if (row.version !== 1) errors.push("Versi spawn reference tidak didukung.");
  try {
    if (typeof row.appearance !== "object" || row.appearance === null || Array.isArray(row.appearance)) throw new Error("Appearance tidak valid.");
    const appearance = row.appearance as Record<string, unknown>;
    const allowedAppearanceKeys = new Set(["face", "hair", "hairColor", "eyes", "skin", "faceShape", "marking"]);
    const unknownAppearanceKeys = Object.keys(appearance).filter(key => !allowedAppearanceKeys.has(key));
    if (unknownAppearanceKeys.length) throw new Error("Appearance berisi field yang tidak didukung: " + unknownAppearanceKeys.join(", "));
    const life = parseSavedLife({
      id: row.lifeId,
      catalogId: row.lifeCatalogId,
      name: row.displayName,
      race: row.race,
      ...appearance,
      equipmentIncluded: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    if (life.name !== row.displayName || life.race !== row.race) errors.push("Data karakter tidak konsisten.");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Data karakter tidak valid.");
  }
  try {
    const target = row.target;
    if (!target || typeof target !== "object" || Array.isArray(target)) throw new Error("Target spawn tidak valid.");
    const t = target as Record<string, unknown>;
    if (typeof t.worldId !== "string" || !validWorldId.test(t.worldId)) throw new Error("ID world spawn tidak valid.");
    if (typeof t.x !== "number" || !Number.isFinite(t.x) || t.x < 0) throw new Error("Koordinat X spawn tidak valid.");
    if (typeof t.y !== "number" || !Number.isFinite(t.y) || t.y < 0) throw new Error("Koordinat Y spawn tidak valid.");
    if (Object.keys(t).some(key => !["worldId", "x", "y"].includes(key))) throw new Error("Target spawn berisi field yang tidak didukung.");
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Target spawn tidak valid.");
  }
  const allowed = new Set(["version", "lifeCatalogId", "lifeId", "displayName", "race", "appearance", "target"]);
  const unknown = Object.keys(row).filter(key => !allowed.has(key));
  if (unknown.length) errors.push("Spawn reference berisi field yang tidak didukung: " + unknown.join(", "));
  return { ok: errors.length === 0, errors };
}
