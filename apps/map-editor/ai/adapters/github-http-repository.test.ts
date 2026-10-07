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
  it("requests GitHub text-match media for repository search", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [{ path: "src/example.ts", text_matches: [{ fragment: "target" }] }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const adapter = new GitHubHttpRepositoryAdapter({
      owner: "rakarakaa775",
      repository: "World-of-vendrith",
      ref: "feat/vendrith-ecc-v1",
    });

    await expect(adapter.search("target")).resolves.toEqual([
      { path: "src/example.ts", excerpt: "target" },
    ]);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: { Accept: "application/vnd.github.text-match+json" },
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain("per_page=100");
  });

});
