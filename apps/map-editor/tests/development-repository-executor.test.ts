import { describe, expect, it, vi, afterEach } from "vitest";
import { createGitHubDevelopmentRepositoryExecutor } from "../ai/application/development-repository-executor";

const proposal = (action: Record<string, unknown>) => ({
  id: "00000000-0000-0000-0000-000000000001",
  userId: "00000000-0000-0000-0000-000000000002",
  actionType: "repository_write" as const,
  action,
  rationale: "explicit approved development change",
  status: "approved" as const,
  approvalId: "00000000-0000-0000-0000-000000000003",
  result: null,
  createdAt: "2026-10-09T00:00:00.000Z",
  updatedAt: "2026-10-09T00:00:00.000Z",
});

afterEach(() => vi.restoreAllMocks());

const executor = () => createGitHubDevelopmentRepositoryExecutor({
  owner: "rakarakaa775",
  repository: "World-of-vendrith",
  ref: "feat/vendrith-ecc-v1",
  token: "test-token",
});

describe("GitHub development repository executor", () => {
  it("requires an approved proposal", async () => {
    await expect(executor().execute({
      ...proposal({ operation: "write_file", path: "README.md", content: "x" }),
      status: "pending",
    })).rejects.toThrow("Approved proposal is required");
  });

  it("blocks GitHub Actions workflow mutation", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(executor().execute(proposal({
      operation: "write_file",
      path: ".github/workflows/deploy.yml",
      content: "name: forbidden",
    }))).rejects.toThrow("workflow files require a dedicated deployment workflow");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks traversal and secret/private-key paths before contacting GitHub", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(executor().execute(proposal({
      operation: "write_file",
      path: "../.env",
      content: "SECRET=forbidden",
    }))).rejects.toThrow("Repository path is not allowed");

    await expect(executor().execute(proposal({
      operation: "write_file",
      path: "config/production.pem",
      content: "private-key",
    }))).rejects.toThrow("Secret or private-key files cannot be modified by Development AI");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("verifies a successful write by reading the repository back", async () => {
    const encoded = Buffer.from("new content", "utf8").toString("base64");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        content: { path: "docs/dev-test.txt", sha: "blob-1" },
        commit: { sha: "commit-1" },
      }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        sha: "blob-1",
        encoding: "base64",
        content: encoded,
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await executor().execute(proposal({
      operation: "write_file",
      path: "docs/dev-test.txt",
      content: "new content",
    }));

    expect(result).toMatchObject({ verified: true, path: "docs/dev-test.txt", branch: "feat/vendrith-ecc-v1", blobSha: "blob-1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
