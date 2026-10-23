import { describe, expect, it } from "vitest";
import { createLifeDraft, type LifeDraftInput } from "./life-creator-draft";
import { addLifeToCatalog, parseLifeCatalog, parseSavedLife, removeLifeFromCatalog, updateLifeInCatalog } from "./life-catalog";

const input: LifeDraftInput = { name: "Aerin", race: "elf", face: "soft", hair: "braid", hairColor: "#D7D0BD", eyes: "#73BDE5", skin: "#F4C7A1", faceShape: "heart", marking: "freckles" };
const draft = createLifeDraft(input, "life-draft-test-01");
const start = new Date("2026-10-22T10:00:00.000Z");

describe("Life catalog", () => {
  it("persists validated life records with stable catalog IDs and timestamps", () => {
    const catalog = addLifeToCatalog([], draft, start, "life-aerin");
    expect(catalog).toHaveLength(1);
    expect(catalog[0]).toMatchObject({ catalogId: "life-aerin", name: "Aerin", race: "elf", createdAt: start.toISOString(), updatedAt: start.toISOString(), equipmentIncluded: false });
    expect(parseLifeCatalog(catalog)).toEqual(catalog);
  });

  it("rejects malformed records, invalid choices, and duplicate IDs", () => {
    expect(() => parseSavedLife({ ...draft, catalogId: "bad/id", createdAt: start.toISOString(), updatedAt: start.toISOString() })).toThrow(/ID katalog/);
    expect(() => parseSavedLife({ ...draft, race: "dragon", catalogId: "life-dragon", createdAt: start.toISOString(), updatedAt: start.toISOString() })).toThrow(/ras tidak valid/);
    const saved = addLifeToCatalog([], draft, start, "life-aerin");
    expect(() => parseLifeCatalog([...saved, ...saved])).toThrow(/duplikat/);
    expect(() => addLifeToCatalog(saved, draft, start, "life-aerin")).toThrow(/sudah digunakan/);
  });

  it("updates appearance while preserving catalog ID and original creation time", () => {
    const saved = addLifeToCatalog([], draft, start, "life-aerin");
    const later = new Date("2026-10-23T10:00:00.000Z");
    const updated = updateLifeInCatalog(saved, "life-aerin", { ...input, name: "Aerin Vale", hair: "long" }, later);
    expect(updated[0]).toMatchObject({ catalogId: "life-aerin", name: "Aerin Vale", hair: "long", createdAt: start.toISOString(), updatedAt: later.toISOString() });
  });

  it("removes a record without mutating the original catalog", () => {
    const saved = addLifeToCatalog([], draft, start, "life-aerin");
    expect(removeLifeFromCatalog(saved, "life-aerin")).toEqual([]);
    expect(saved).toHaveLength(1);
  });
});
