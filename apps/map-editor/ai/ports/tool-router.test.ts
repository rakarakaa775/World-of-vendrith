import { describe, expect, it } from "vitest";
import { createToolRouter, hasStringArgument } from "./tool-router";

describe("tool router", () => {
  it("rejects unknown tools", async () => {
    const router = createToolRouter([]);
    await expect(
      router.execute(
        { id: "1", name: "missing", arguments: {} },
        { mode: "plan", requestId: "req-1" },
      ),
    ).resolves.toMatchObject({ ok: false, error: "Unknown tool" });
  });

  it("validates arguments before execution", async () => {
    let called = false;
    const router = createToolRouter([{
      name: "test",
      description: "test",
      access: "read-only",
      parameters: {},
      validate: hasStringArgument("query"),
      async execute() {
        called = true;
        return "ok";
      },
    }]);

    const result = await router.execute(
      { id: "1", name: "test", arguments: { query: 123 } },
      { mode: "explain", requestId: "req-1" },
    );

    expect(result).toMatchObject({ ok: false, error: "Invalid tool arguments" });
    expect(called).toBe(false);
  });

  it("blocks mutation tools at the router boundary", async () => {
    const router = createToolRouter([{
      name: "mutate",
      description: "mutate",
      access: "mutation",
      parameters: {},
      validate: () => true,
      async execute() {
        throw new Error("must not execute");
      },
    }]);

    await expect(
      router.execute(
        { id: "1", name: "mutate", arguments: {} },
        { mode: "execute", requestId: "req-1" },
      ),
    ).resolves.toMatchObject({
      ok: false,
      error: "Mutation tools require an approved execution path",
    });
  });
  it("blocks mutation tools outside execution modes even if approval is present", async () => {
    let called = false;
    const router = createToolRouter([{
      name: "mutate",
      description: "mutate",
      access: "mutation",
      parameters: {},
      validate: () => true,
      async execute() {
        called = true;
        return "changed";
      },
    }]);

    const result = await router.execute(
      { id: "2", name: "mutate", arguments: {} },
      { mode: "explain", requestId: "req-2", approvalState: "approved" },
    );

    expect(result).toMatchObject({
      ok: false,
      error: "Mutation tools require execute or high-risk mode",
    });
    expect(called).toBe(false);
  });

});
