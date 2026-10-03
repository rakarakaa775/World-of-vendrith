import { describe, expect, it } from "vitest";
import { npcRoleArchetypes, validateNpcRole, NPC_ROLES } from "./npc-role-schema";

describe("npc role schema", () => {
  it("exposes descriptive roles without auto-runtime semantics", () => {
    expect(NPC_ROLES).toContain("farmer");
    expect(NPC_ROLES).toContain("guard");
    expect(NPC_ROLES).toContain("shopkeeper");
    expect(npcRoleArchetypes("scout")).toEqual(["military"]);
    expect(validateNpcRole("scout", "military")).toEqual({ ok: true, errors: [] });
  });

  it("rejects incompatible roles", () => {
    expect(validateNpcRole("guard", "civilian")).toEqual({
      ok: false,
      errors: ["NPC role guard is not compatible with archetype civilian."],
    });
  });

  it("rejects unsupported roles and malformed archetypes", () => {
    expect(validateNpcRole("commander", "military")).toEqual({
      ok: false,
      errors: ["Unsupported NPC role: commander."],
    });
    expect(validateNpcRole("guard", "commander")).toEqual({
      ok: false,
      errors: ["A supported NPC archetype is required to validate role compatibility."],
    });
  });

  it("keeps role optional for backward compatibility", () => {
    expect(validateNpcRole()).toEqual({ ok: true, errors: [] });
  });
});
