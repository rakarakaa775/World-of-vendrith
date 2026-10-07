import type { GitHubRepositoryConfig, RepositoryPort } from "../ports/project-tools";

interface GitHubContent { content?: string; encoding?: string }
interface GitHubSearchResponse { items?: Array<{ path: string; text_matches?: Array<{ fragment?: string }> }> }
interface GitHubTreeResponse { tree?: Array<{ path: string; type: string }> }

async function requestJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github.text-match+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!response.ok) throw new Error(`GitHub repository request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export class GitHubHttpRepositoryAdapter implements RepositoryPort {
  constructor(private readonly config: GitHubRepositoryConfig, private readonly token = process.env.GITHUB_TOKEN) {}

  async readFile(path: string): Promise<string | null> {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    try {
      const result = await requestJson<GitHubContent>(`https://api.github.com/repos/${this.config.owner}/${this.config.repository}/contents/${encodedPath}?ref=${encodeURIComponent(this.config.ref)}`, this.token);
      if (!result.content || result.encoding !== "base64") return null;
      return Buffer.from(result.content.replace(/\n/g, ""), "base64").toString("utf8");
    } catch (error) {
      // Missing candidate paths are expected during code-graph resolution
      // (for example, checking "./module" before "./module.ts").
      if (error instanceof Error && /GitHub repository request failed \(404\)/.test(error.message)) return null;
      throw error;
    }
  }

  async listFiles(prefix = ""): Promise<string[]> {
    const response = await requestJson<GitHubTreeResponse>(
      `https://api.github.com/repos/${this.config.owner}/${this.config.repository}/git/trees/${encodeURIComponent(this.config.ref)}?recursive=1`,
      this.token,
    );
    const normalizedPrefix = prefix.replace(/^\/+|\/+$/g, "");
    return (response.tree ?? [])
      .filter((item) => item.type === "blob")
      .map((item) => item.path)
      .filter((path) => !normalizedPrefix || path.startsWith(`${normalizedPrefix}/`) || path === normalizedPrefix)
      .sort();
  }

  async search(query: string): Promise<Array<{ path: string; excerpt: string }>> {
    const q = encodeURIComponent(`${query} repo:${this.config.owner}/${this.config.repository}`);
    const result = await requestJson<GitHubSearchResponse>(`https://api.github.com/search/code?q=${q}&per_page=100`, this.token);
    return (result.items ?? []).slice(0, 100).map((item) => ({ path: item.path, excerpt: item.text_matches?.map((match) => match.fragment ?? "").filter(Boolean).join("\n") ?? "" }));
  }
}
