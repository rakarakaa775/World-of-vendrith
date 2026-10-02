import { describe, expect, it, vi } from "vitest";
import { GitHubRepositoryAdapter } from "./github-repository";

describe("GitHubRepositoryAdapter", () => {
  it("pins reads and searches to the configured ref", async () => {
    const reader = { readFile: vi.fn().mockResolvedValue("content") };
    const searcher = { search: vi.fn().mockResolvedValue([{ path: "AGENTS.md", excerpt: "rule" }]) };

    const adapter = new GitHubRepositoryAdapter(
      { owner: "rakarakaa775", repository: "World-of-vendrith", ref: "feat/vendrith-ecc-v1" },
      reader,
      searcher,
    );

    await adapter.readFile("AGENTS.md");
    await adapter.search("map");

    expect(reader.readFile).toHaveBeenCalledWith("AGENTS.md", "feat/vendrith-ecc-v1");
    expect(searcher.search).toHaveBeenCalledWith("map", "feat/vendrith-ecc-v1");
  });
});
