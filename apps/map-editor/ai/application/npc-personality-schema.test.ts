import { describe, expect, it } from "vitest";
import { validateNpcPersonality, NPC_PERSONALITY_TRAITS } from "./npc-personality-schema";

describe("npc personality schema", () => {
  it("accepts supported descriptive traits", () => {
    expect(NPC_PERSONALITY_TRAITS).toContain("brave");
    expect(validateNpcPersonality({ traits: ["brave", "cautious", "curious"] })).toEqual({ ok: true, errors: [] });
  });

  it("rejects unsupported and duplicate traits", () => {
    expect(validateNpcPersonality({ traits: ["brave", "telepathic", "brave"] })).toEqual({
      ok: false,
      errors: ["Unsupported NPC personality trait: telepathic.", "Duplicate NPC personality trait: brave."],
    });
  });

  it("rejects malformed or oversized personality data", () => {
    expect(validateNpcPersonality({ traits: "brave" })).toEqual({ ok: false, errors: ["NPC personality traits must be an array."] });
    expect(validateNpcPersonality({ traits: ["brave", "calm", "curious", "friendly", "loyal", "patient", "honest", "social", "custom"] })).toEqual({
      ok: false,
      errors: ["NPC personality supports at most 8 traits."],
    });
  });

  it("keeps personality optional for backward compatibility", () => {
    expect(validateNpcPersonality(undefined)).toEqual({ ok: true, errors: [] });
  });
});
