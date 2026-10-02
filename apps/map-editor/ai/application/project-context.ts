import type { Evidence } from "../domain/types";
import { classifyAssetEvidence, type AssetIntelligence } from "../policies/asset-policy";
import type { AssetRegistryPort, CodeIntelligencePort, DocumentationPort, RepositoryPort } from "../ports/project-tools";

export interface ProjectContextRequest {
  prompt: string;
  repositoryQuery?: string;
  maxRepositoryMatches?: number;
  maxDocumentationEvidence?: number;
  maxAssetEvidence?: number;
}

export interface ProjectContext {
  query: string;
  repositoryMatches: Array<{ path: string; excerpt: string }>;
  dependencyMap: Array<{ path: string; dependencies: string[]; dependents: string[] }>;
  documentationEvidence: Evidence[];
  assetEvidence: Evidence[];
  assetIntelligence: AssetIntelligence[];
}

export interface ProjectContextDependencies {
  repository: RepositoryPort;
  code: CodeIntelligencePort;
  documentation: DocumentationPort;
  assetRegistry: AssetRegistryPort;
}

export async function buildProjectContext(
  request: ProjectContextRequest,
  deps: ProjectContextDependencies,
): Promise<ProjectContext> {
  const query = request.repositoryQuery?.trim() || request.prompt;
  const matches = (await deps.repository.search(query)).slice(0, request.maxRepositoryMatches ?? 8);
  const dependencyMap = await Promise.all(
    matches.map(async (match) => ({
      path: match.path,
      dependencies: await deps.code.findDependencies(match.path),
      dependents: await deps.code.findDependents(match.path),
    })),
  );
  const documentationEvidence = (await deps.documentation.search(request.prompt)).slice(
    0,
    request.maxDocumentationEvidence ?? 8,
  );
  const assetEvidence = (await deps.assetRegistry.search(request.prompt)).slice(
    0,
    request.maxAssetEvidence ?? 8,
  );
  const assetIntelligence = assetEvidence.map(classifyAssetEvidence);

  return {
    query,
    repositoryMatches: matches,
    dependencyMap,
    documentationEvidence,
    assetEvidence,
    assetIntelligence,
  };
}
