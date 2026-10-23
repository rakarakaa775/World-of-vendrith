import { describe, expect, it } from "vitest";
import { createLifeDraft, type LifeDraftInput } from "./life-creator-draft";

const base: LifeDraftInput = { name: "  Aerin  ", race: "elf", face: "soft", hair: "braid", hairColor: "#D7D0BD", eyes: "#73BDE5", skin: "#F4C7A1", faceShape: "heart", marking: "freckles" };

describe("Life Creator draft model", () => {
  it("normalizes a character draft and explicitly excludes equipment", () => {
    expect(createLifeDraft(base, "life-draft-test-01")).toEqual({ ...base, id: "life-draft-test-01", name: "Aerin", hairColor: "#d7d0bd", eyes: "#73bde5", skin: "#f4c7a1", equipmentIncluded: false });
  });
  it("uses a safe default name when the name is blank", () => {
    expect(createLifeDraft({ ...base, name: "  " }, "life-draft-test-02").name).toBe("Life Baru");
  });
  it("rejects race or appearance values outside the approved prototype choices", () => {
    expect(() => createLifeDraft({ ...base, race: "dragon" }, "life-draft-test-03")).toThrow("ras tidak valid");
    expect(() => createLifeDraft({ ...base, hair: "helmet" }, "life-draft-test-04")).toThrow("rambut tidak valid");
    expect(() => createLifeDraft({ ...base, marking: "magic-invulnerability" }, "life-draft-test-05")).toThrow("tanda khas tidak valid");
  });
  it("rejects malformed colors, invalid ids and overlong names", () => {
    expect(() => createLifeDraft({ ...base, eyes: "blue" }, "life-draft-test-06")).toThrow("warna mata tidak valid");
    expect(() => createLifeDraft(base, "../../other-record")).toThrow("ID draft tidak valid");
    expect(() => createLifeDraft({ ...base, name: "x".repeat(49) }, "life-draft-test-07")).toThrow("maksimal 48");
  });
});
