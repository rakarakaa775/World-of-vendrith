import { describe, expect, it } from "vitest";
import { createLifeDraft } from "./life-creator-draft";
import { addLifeToCatalog } from "./life-catalog";
import { buildLifeSpawnReference, validateLifeSpawnReference } from "./life-spawn-reference";

const saved = addLifeToCatalog([], createLifeDraft({
  name: "Aerin", race: "elf", face: "soft", hair: "braid", hairColor: "#D7D0BD",
  eyes: "#73BDE5", skin: "#F4C7A1", faceShape: "heart", marking: "freckles",
}, "life-draft-aerin"), new Date("2026-10-22T10:00:00.000Z"), "life-aerin")[0];

describe("Life spawn reference (proposal only)", () => {
  it("builds a validated, runtime-neutral reference from a saved Life", () => {
    const ref = buildLifeSpawnReference(saved, { worldId: "world-main", x: 12, y: 8 });
    expect(validateLifeSpawnReference(ref)).toEqual({ ok: true, errors: [] });
    expect(ref).toMatchObject({ version: 1, lifeCatalogId: "life-aerin", lifeId: "life-draft-aerin", displayName: "Aerin", race: "elf", target: { worldId: "world-main", x: 12, y: 8 } });
  });
  it("rejects unsafe world identifiers and invalid coordinates", () => {
    expect(() => buildLifeSpawnReference(saved, { worldId: "../production", x: 1, y: 1 })).toThrow(/world/);
    expect(() => buildLifeSpawnReference(saved, { worldId: "world-main", x: Number.NaN, y: 1 })).toThrow(/X/);
    expect(() => buildLifeSpawnReference(saved, { worldId: "world-main", x: 1, y: -1 })).toThrow(/Y/);
  });
  it("detects version, character, and target tampering", () => {
    const ref = buildLifeSpawnReference(saved, { worldId: "world-main", x: 12, y: 8 });
    expect(validateLifeSpawnReference({ ...ref, version: 2 }).ok).toBe(false);
    expect(validateLifeSpawnReference({ ...ref, race: "dragon" }).ok).toBe(false);
    expect(validateLifeSpawnReference({ ...ref, target: { ...ref.target, x: Number.NaN } }).ok).toBe(false);
    expect(validateLifeSpawnReference({ ...ref, appearance: { ...ref.appearance, equipment: ["sword"] } })).toMatchObject({ ok: false, errors: [expect.stringContaining("Appearance")] });
  });
});
