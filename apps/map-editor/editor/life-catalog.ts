import { createLifeDraft, type LifeDraft, type LifeDraftInput } from "./life-creator-draft";

export type SavedLife = LifeDraft & { catalogId: string; createdAt: string; updatedAt: string };
const validId = /^life-[a-z0-9-]{1,48}$/i;

export function parseSavedLife(value: unknown): SavedLife {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Data Life tidak valid.");
  const row = value as Record<string, unknown>;
  if (typeof row.catalogId !== "string" || !validId.test(row.catalogId)) throw new Error("ID katalog Life tidak valid.");
  for (const key of ["createdAt", "updatedAt"] as const) {
    const date = row[key];
    if (typeof date !== "string" || Number.isNaN(Date.parse(date)) || new Date(date).toISOString() !== date) throw new Error("Waktu Life tidak valid.");
  }
  const draft = createLifeDraft({ name: String(row.name ?? ""), race: String(row.race ?? ""), face: String(row.face ?? ""), hair: String(row.hair ?? ""), hairColor: String(row.hairColor ?? ""), eyes: String(row.eyes ?? ""), skin: String(row.skin ?? ""), faceShape: String(row.faceShape ?? ""), marking: String(row.marking ?? "") }, String(row.id ?? ""));
  if (row.equipmentIncluded !== false) throw new Error("Perlengkapan belum didukung.");
  return { ...draft, catalogId: row.catalogId, createdAt: row.createdAt as string, updatedAt: row.updatedAt as string };
}

export function parseLifeCatalog(value: unknown): SavedLife[] {
  if (!Array.isArray(value)) throw new Error("Katalog Life harus berupa daftar.");
  const rows = value.map(parseSavedLife);
  const ids = new Set<string>();
  for (const row of rows) { if (ids.has(row.catalogId)) throw new Error("ID katalog Life duplikat."); ids.add(row.catalogId); }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.catalogId.localeCompare(b.catalogId));
}

export function addLifeToCatalog(catalog: SavedLife[], draft: LifeDraft, now = new Date(), catalogId = `life-${now.getTime().toString(36)}`): SavedLife[] {
  if (catalog.some((item) => item.catalogId === catalogId)) throw new Error("ID katalog Life sudah digunakan.");
  const timestamp = now.toISOString();
  return parseLifeCatalog([...catalog, parseSavedLife({ ...draft, catalogId, createdAt: timestamp, updatedAt: timestamp })]);
}

export function removeLifeFromCatalog(catalog: SavedLife[], catalogId: string): SavedLife[] { return catalog.filter((item) => item.catalogId !== catalogId); }

export function updateLifeInCatalog(catalog: SavedLife[], catalogId: string, input: LifeDraftInput, now = new Date()): SavedLife[] {
  const existing = catalog.find((item) => item.catalogId === catalogId);
  if (!existing) throw new Error("Life tidak ditemukan di katalog.");
  const updated = parseSavedLife({ ...createLifeDraft(input, existing.id), catalogId, createdAt: existing.createdAt, updatedAt: now.toISOString() });
  return parseLifeCatalog(catalog.map((item) => item.catalogId === catalogId ? updated : item));
}
