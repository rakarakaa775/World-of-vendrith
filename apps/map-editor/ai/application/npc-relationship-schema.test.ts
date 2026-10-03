import { describe, expect, it } from "vitest";
import { validateNpcRelationship, validateNpcRelationships } from "./npc-relationship-schema";

describe("NPC relationship schema", () => {
  it("accepts a valid explicit relationship", () => {
    expect(validateNpcRelationship({ targetNpcId: "npc-2", type: "friend", affinity: 50, trust: 80 }).ok).toBe(true);
  });
  it("rejects malformed scores and unsupported types", () => {
    expect(validateNpcRelationship({ targetNpcId: "npc-2", type: "hostile", affinity: 101 }).ok).toBe(false);
  });
  it("rejects duplicate targets", () => {
    expect(validateNpcRelationships([
      { targetNpcId: "npc-2", type: "friend" },
      { targetNpcId: "npc-2", type: "rival" },
    ]).ok).toBe(false);
  });
  it("keeps omitted relationships backward compatible", () => {
    expect(validateNpcRelationships(undefined)).toEqual({ ok: true, errors: [] });
  });
});
