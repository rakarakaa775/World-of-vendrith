import { describe, expect, it } from "vitest";
import { npcArchetypeCapabilities, validateNpcCapabilities } from "./npc-archetype-capabilities";

describe("NPC archetype capabilities", () => {
  it("exposes only implemented runtime kinds", () => {
    expect(npcArchetypeCapabilities("military")).toEqual({
      behaviors: ["idle", "follow-player", "wander", "investigate", "flee", "work", "eat", "sleep", "go-to-location", "respond-to-event"],
      goals: ["work", "sleep", "go-to-location", "respond-to-event"],
    });
  });

  it("accepts explicitly requested allowed capabilities", () => {
    expect(validateNpcCapabilities("production", {
      behaviors: ["wander", "flee"],
      goals: ["work", "eat", "sleep"],
    })).toEqual({ ok: true, errors: [] });
  });

  it("rejects a runtime kind not allowed by the archetype", () => {
    expect(validateNpcCapabilities("enemy", { goals: ["eat"] })).toEqual({
      ok: false,
      errors: ["NPC archetype enemy does not allow goal: eat."],
    });
  });

  it("does not create capabilities when archetype is omitted", () => {
    expect(validateNpcCapabilities(undefined, {})).toEqual({ ok: true, errors: [] });
    expect(validateNpcCapabilities(undefined, { behaviors: ["wander"] })).toEqual({
      ok: false,
      errors: ["A supported NPC archetype is required to validate requested capabilities."],
    });
  });
});
