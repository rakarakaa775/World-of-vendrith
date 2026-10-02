import type { Evidence } from "../domain/types";
import type { CodeIntelligencePort, AssetRegistryPort, DocumentationPort, RepositoryPort } from "../ports/project-tools";
import { buildProjectContext, type ProjectContext } from "./project-context";

export interface ProjectManifest {
  repositoryFiles: number;
  topLevelDirectories: string[];
  applicationAreas: string[];
  schemaAreas: string[];
  assetAreas: string[];
  aiAreas: string[];
}

export interface ProjectIntelligenceSnapshot extends ProjectContext {
  manifest: ProjectManifest;
  generatedAt: string;
  evidence: Evidence[];
}

export interface ProjectIntelligenceDependencies {
  repository: RepositoryPort;
  code: CodeIntelligencePort;
  documentation: DocumentationPort;
  assetRegistry: AssetRegistryPort;
}

function buildManifest(files: string[]): ProjectManifest {
  const dirs = new Set<string>();
  for (const file of files) {
    const root = file.split("/")[0];
    if (root) dirs.add(root);
  }

  const has = (pattern: RegExp) => files.some((file) => pattern.test(file));
  return {
    repositoryFiles: files.length,
    topLevelDirectories: [...dirs].sort(),
    applicationAreas: [
      ...(has(/^apps\//) ? ["apps"] : []),
      ...(has(/^supabase\//) ? ["supabase"] : []),
      ...(has(/^tests\//) ? ["tests"] : []),
    ],
    schemaAreas: [
      ...(has(/(^|\/)(map|world|region|npc|dialogue|event)[^/]*\.(ts|tsx|sql|json)$/i) ? ["game schemas"] : []),
      ...(has(/^supabase\/migrations\//) ? ["supabase migrations"] : []),
    ],
    assetAreas: files.filter((file) => /^assets\//.test(file)).slice(0, 200),
    aiAreas: files.filter((file) => /(^|\/)ai(\/|[-_]|\.)|VENDRITH_AI/i.test(file)).slice(0, 200),
  };
}

export async function buildProjectIntelligenceSnapshot(
  prompt: string,
  deps: ProjectIntelligenceDependencies,
): Promise<ProjectIntelligenceSnapshot> {
  const files = deps.repository.listFiles ? await deps.repository.listFiles() : [];
  const context = await buildProjectContext({ prompt }, deps);
  const manifest = buildManifest(files);
  const evidence: Evidence[] = [
    {
      id: "project-manifest",
      kind: "verified-fact",
      source: "repository:git-tree",
      fact: `Repository contains ${manifest.repositoryFiles} files; top-level areas: ${manifest.topLevelDirectories.join(", ")}.`,
      confidence: files.length ? "high" : "low",
    },
    ...context.documentationEvidence,
  ];

  return {
    ...context,
    manifest,
    generatedAt: new Date().toISOString(),
    evidence,
  };
}
