import { describe, expect, it } from "vitest";
import { validateNpcDecisionProfile } from "./npc-decision-profile-schema";
describe("npc decision profile", () => {
  it("accepts a compatible composed profile", () => expect(validateNpcDecisionProfile({ archetype: "military", role: "guard", capabilities: { behaviors: ["investigate"], goals: ["respond-to-event"] }, personality: { traits: ["disciplined"] }, personalityPolicy: { rules: [{ trait: "disciplined", behaviors: { investigate: 10 }, goals: { "respond-to-event": 5 } }] } }).ok).toBe(true));
  it("rejects personality policy outside archetype capabilities", () => expect(validateNpcDecisionProfile({ archetype: "enemy", personality: { traits: ["aggressive"] }, personalityPolicy: { rules: [{ trait: "aggressive", behaviors: { "follow-player": 10 } }] } }).ok).toBe(false));
  it("keeps the profile backward compatible when omitted", () => expect(validateNpcDecisionProfile(undefined).ok).toBe(true));
});
