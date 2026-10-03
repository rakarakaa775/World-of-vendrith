import { describe, expect, it } from "vitest";
import { NPC_ARCHETYPES, validateNpcArchetype } from "./npc-archetype-schema";

describe("NPC archetype schema", () => {
  it("accepts every supported descriptive archetype", () => {
    for (const archetype of NPC_ARCHETYPES) {
      expect(validateNpcArchetype(archetype)).toEqual({ ok: true, errors: [] });
    }
  });

  it("rejects unsupported archetypes", () => {
    expect(validateNpcArchetype("commander")).toEqual({
      ok: false,
      errors: ["Unsupported NPC archetype: commander."],
    });
  });

  it("allows an omitted archetype for backward compatibility", () => {
    expect(validateNpcArchetype(undefined)).toEqual({ ok: true, errors: [] });
  });

  it("does not turn malformed values into runtime semantics", () => {
    expect(validateNpcArchetype({ kind: "military" })).toEqual({
      ok: false,
      errors: ["NPC archetype must be a string."],
    });
  });
});
