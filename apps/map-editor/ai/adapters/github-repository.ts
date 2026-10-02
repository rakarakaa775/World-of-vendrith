import type {
  GitHubRepositoryConfig,
  RepositoryFileReader,
  RepositoryPort,
  RepositorySearchReader,
} from "../ports/project-tools";

export class GitHubRepositoryAdapter implements RepositoryPort {
  constructor(
    private readonly config: GitHubRepositoryConfig,
    private readonly reader: RepositoryFileReader,
    private readonly searcher: RepositorySearchReader,
  ) {}

  readFile(path: string): Promise<string | null> {
    return this.reader.readFile(path, this.config.ref);
  }

  search(query: string): Promise<Array<{ path: string; excerpt: string }>> {
    return this.searcher.search(query, this.config.ref);
  }
}
