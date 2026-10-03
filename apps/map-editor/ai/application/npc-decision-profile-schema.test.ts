import { describe, expect, it } from "vitest";
import { validateNpcDecisionProfile } from "./npc-decision-profile-schema";
describe("npc decision profile", () => {
  it("accepts a compatible composed profile", () => expect(validateNpcDecisionProfile({ archetype: "military", role: "guard", capabilities: { behaviors: ["investigate"], goals: ["respond-to-event"] }, personality: { traits: ["disciplined"] }, personalityPolicy: { rules: [{ trait: "disciplined", behaviors: { investigate: 10 }, goals: { "respond-to-event": 5 } }] } }).ok).toBe(true));
  it("rejects personality policy outside archetype capabilities", () => expect(validateNpcDecisionProfile({ archetype: "enemy", personality: { traits: ["aggressive"] }, personalityPolicy: { rules: [{ trait: "aggressive", behaviors: { "follow-player": 10 } }] } }).ok).toBe(false));
  it("accepts an explicit daily schedule", () => expect(validateNpcDecisionProfile({
    archetype: "civilian",
    schedule: {
      npcId: "npc-1",
      entries: [
        { goal: "work", startHour: 8, endHour: 12, priority: 40, location: { mapId: "town", x: 10, y: 4 } },
        { goal: "sleep", startHour: 22, endHour: 6, priority: 60, location: { mapId: "home", x: 2, y: 2 } },
      ],
    },
  }).ok).toBe(true));
  it("rejects schedule entries with invalid time or location", () => expect(validateNpcDecisionProfile({
    archetype: "civilian",
    schedule: {
      npcId: "npc-1",
      entries: [{ goal: "work", startHour: 25, endHour: 12, priority: 40, location: { mapId: "", x: 0.5, y: 4 } }],
    },
  }).ok).toBe(false));
  it("keeps the profile backward compatible when omitted", () => expect(validateNpcDecisionProfile(undefined).ok).toBe(true));
});
