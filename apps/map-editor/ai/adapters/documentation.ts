import type { Evidence } from "../domain/types";
import type { DocumentationPort, RepositoryPort } from "../ports/project-tools";

const DOC_PATHS = [
  "AGENTS.md",
  "inspirasi/README.md",
  "docs/architecture/VENDRITH_PROJECT_AI_V1.md",
  "docs/architecture/FOUNDATION_IMPLEMENTATION_STATE.md",
];

export class ProjectDocumentationAdapter implements DocumentationPort {
  constructor(private readonly repository: RepositoryPort) {}

  async search(query: string): Promise<Evidence[]> {
    const normalized = query.toLowerCase();
    const results: Evidence[] = [];

    for (const path of DOC_PATHS) {
      const content = await this.repository.readFile(path);
      if (!content || !content.toLowerCase().includes(normalized)) continue;

      results.push({
        id: `doc-${results.length}`,
        kind: "project-rule",
        source: path,
        fact: `Documentation contains a match for: ${query}`,
        confidence: "high",
      });
    }

    return results;
  }
}
