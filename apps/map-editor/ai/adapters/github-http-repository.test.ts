import { describe, expect, it, vi } from "vitest";
import { GitHubHttpRepositoryAdapter } from "./github-http-repository";

describe("GitHubHttpRepositoryAdapter", () => {
  it("treats a missing file as absent so code-graph candidate resolution can continue", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }),
    ));

    const adapter = new GitHubHttpRepositoryAdapter({
      owner: "rakarakaa775",
      repository: "World-of-vendrith",
      ref: "feat/vendrith-ecc-v1",
    });

    await expect(adapter.readFile("missing/module")).resolves.toBeNull();
  });

  it("still surfaces non-404 repository failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "rate limited" }), { status: 429 }),
    ));

    const adapter = new GitHubHttpRepositoryAdapter({
      owner: "rakarakaa775",
      repository: "World-of-vendrith",
      ref: "feat/vendrith-ecc-v1",
    });

    await expect(adapter.readFile("module.ts")).rejects.toThrow("GitHub repository request failed (429)");
  });
});
