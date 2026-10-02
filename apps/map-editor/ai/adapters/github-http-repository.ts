import type { GitHubRepositoryConfig, RepositoryPort } from "../ports/project-tools";

interface GitHubContent { content?: string; encoding?: string }
interface GitHubSearchResponse { items?: Array<{ path: string; text_matches?: Array<{ fragment?: string }> }> }

async function requestJson<T>(url: string, token?: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!response.ok) throw new Error(`GitHub repository request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export class GitHubHttpRepositoryAdapter implements RepositoryPort {
  constructor(private readonly config: GitHubRepositoryConfig, private readonly token = process.env.GITHUB_TOKEN) {}

  async readFile(path: string): Promise<string | null> {
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const result = await requestJson<GitHubContent>(`https://api.github.com/repos/${this.config.owner}/${this.config.repository}/contents/${encodedPath}?ref=${encodeURIComponent(this.config.ref)}`, this.token);
    if (!result.content || result.encoding !== "base64") return null;
    return Buffer.from(result.content.replace(/\n/g, ""), "base64").toString("utf8");
  }

  async search(query: string): Promise<Array<{ path: string; excerpt: string }>> {
    const q = encodeURIComponent(`${query} repo:${this.config.owner}/${this.config.repository}`);
    const result = await requestJson<GitHubSearchResponse>(`https://api.github.com/search/code?q=${q}`, this.token);
    return (result.items ?? []).slice(0, 20).map((item) => ({ path: item.path, excerpt: item.text_matches?.map((match) => match.fragment ?? "").filter(Boolean).join("\n") ?? "" }));
  }
}
