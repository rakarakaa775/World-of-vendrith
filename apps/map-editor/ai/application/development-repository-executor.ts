import type { DevelopmentActionProposal } from "./development-action-proposal";

const MAX_FILE_BYTES = 512 * 1024;

export interface RepositoryWriteAction {
  operation: "write_file";
  path: string;
  content: string;
  expectedSha?: string | null;
  message?: string;
}

export interface DevelopmentRepositoryExecutor {
  execute(proposal: DevelopmentActionProposal): Promise<Record<string, unknown>>;
}

interface GithubContentResponse {
  sha?: string;
  content?: string;
  encoding?: string;
}
interface GithubWriteResponse {
  content?: { path?: string; sha?: string };
  commit?: { sha?: string };
}

function requireSafePath(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.includes("\\") || normalized.startsWith(".git/")) {
    throw new Error("Repository path is not allowed");
  }
  if (/^(?:\.env(?:\.|$)|.*\.(?:pem|key|p12|pfx))$/i.test(normalized)) {
    throw new Error("Secret or private-key files cannot be modified by Development AI");
  }
  return normalized;
}

function decodeContent(value: GithubContentResponse): string {
  if (!value.content || value.encoding !== "base64") return "";
  return Buffer.from(value.content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function githubRequest<T>(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub development mutation failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function createGitHubDevelopmentRepositoryExecutor(config: {
  owner: string;
  repository: string;
  ref: string;
  token?: string;
}): DevelopmentRepositoryExecutor {
  return {
    async execute(proposal) {
      if (proposal.actionType !== "repository_write") throw new Error("Only repository_write is connected");
      if (!proposal.approvalId || proposal.status !== "approved") throw new Error("Approved proposal is required");

      const action = proposal.action as Partial<RepositoryWriteAction>;
      if (action.operation !== "write_file" || typeof action.path !== "string" || typeof action.content !== "string") {
        throw new Error("Unsupported repository mutation action");
      }
      if (Buffer.byteLength(action.content, "utf8") > MAX_FILE_BYTES) {
        throw new Error("Repository mutation content exceeds 512 KiB");
      }

      const path = requireSafePath(action.path);
      const token = config.token ?? process.env.GITHUB_TOKEN;
      if (!token) throw new Error("GITHUB_TOKEN is not configured for Development AI");
      if (!config.ref || config.ref.startsWith("refs/")) throw new Error("A concrete writable Git branch ref is required");

      const encodedPath = path.split("/").map(encodeURIComponent).join("/");
      const url = `https://api.github.com/repos/${config.owner}/${config.repository}/contents/${encodedPath}?ref=${encodeURIComponent(config.ref)}`;
      let current: GithubContentResponse | null = null;
      try {
        current = await githubRequest<GithubContentResponse>(url, token);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("(404)")) throw error;
      }

      if (current && action.expectedSha !== current.sha) {
        if (decodeContent(current) === action.content) {
          return {
            verified: true,
            idempotent: true,
            path,
            branch: config.ref,
            blobSha: current.sha ?? null,
            commitSha: null,
          };
        }
        throw new Error("Repository file changed since proposal; expectedSha does not match");
      }
      if (!current && action.expectedSha) {
        throw new Error("Repository file no longer exists");
      }

      const body = {
        message: action.message?.trim() || `Vendrith Development AI: ${path}`,
        content: Buffer.from(action.content, "utf8").toString("base64"),
        branch: config.ref,
        ...(current?.sha ? { sha: current.sha } : {}),
      };
      const written = await githubRequest<GithubWriteResponse>(
        `https://api.github.com/repos/${config.owner}/${config.repository}/contents/${encodedPath}`,
        token,
        { method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } },
      );

      const verified = await githubRequest<GithubContentResponse>(url, token);
      const verifiedContent = decodeContent(verified);
      if (verifiedContent !== action.content) throw new Error("Repository mutation verification failed");

      return {
        verified: true,
        idempotent: current?.sha === verified.sha && current ? verifiedContent === decodeContent(current) : false,
        path,
        branch: config.ref,
        blobSha: verified.sha ?? written.content?.sha ?? null,
        commitSha: written.commit?.sha ?? null,
      };
    },
  };
}
