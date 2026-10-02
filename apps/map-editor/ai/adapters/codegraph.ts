import type { CodeIntelligencePort, RepositoryPort } from "../ports/project-tools";

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^"']+from\s+)?["']([^"']+)["']/g;

function normalize(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function relativeCandidates(source: string, specifier: string): string[] {
  if (!specifier.startsWith(".")) return [];
  const sourceParts = normalize(source).split("/");
  sourceParts.pop();
  const parts = [...sourceParts, ...specifier.split("/")];

  const resolved: string[] = [];
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }

  const base = stack.join("/");
  for (const suffix of ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx"]) {
    resolved.push(normalize(base + suffix));
  }
  return resolved;
}

/**
 * Lightweight repository-backed structural graph.
 *
 * It intentionally has no runtime dependency on a third-party graph engine.
 * A future CodeGraph engine can implement the same CodeIntelligencePort without
 * changing the AI application layer.
 */
export class RepositoryCodeGraphAdapter implements CodeIntelligencePort {
  constructor(private readonly repository: RepositoryPort) {}

  async findDependencies(path: string): Promise<string[]> {
    const content = await this.repository.readFile(path);
    if (!content) return [];

    const dependencies = new Set<string>();
    for (const match of content.matchAll(IMPORT_RE)) {
      for (const candidate of relativeCandidates(path, match[1])) {
        if (await this.repository.readFile(candidate)) {
          dependencies.add(candidate);
          break;
        }
      }
    }
    return [...dependencies].sort();
  }

  async findDependents(path: string): Promise<string[]> {
    const normalized = normalize(path);
    const basename = normalized.split("/").pop()?.replace(/\.(tsx?|jsx?)$/, "") ?? normalized;
    const results = await this.repository.search(basename);
    const dependents = new Set<string>();

    for (const result of results) {
      if (normalize(result.path) === normalized) continue;
      if (this.referencesTarget(result.path, result.excerpt, normalized, basename)) {
        dependents.add(normalize(result.path));
      }
    }

    return [...dependents].sort();
  }

  private referencesTarget(
    sourcePath: string,
    excerpt: string,
    targetPath: string,
    basename: string,
  ): boolean {
    if (!excerpt.includes(basename)) return false;

    const targetParts = targetPath.split("/");
    const targetStem = targetParts[targetParts.length - 1].replace(/\.(tsx?|jsx?)$/, "");
    if (excerpt.includes(targetStem)) return true;

    for (const specifier of this.extractSpecifiers(excerpt)) {
      if (relativeCandidates(sourcePath, specifier).includes(targetPath)) return true;
    }

    return false;
  }

  private extractSpecifiers(text: string): string[] {
    return [...text.matchAll(IMPORT_RE)].map((match) => match[1]);
  }
}
