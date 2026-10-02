import type { Evidence, VerificationResult } from "../domain/types";

export interface RepositoryPort {
  readFile(path: string): Promise<string | null>;
  search(query: string): Promise<Array<{ path: string; excerpt: string }>>;
}

export interface CodeIntelligencePort {
  findDependencies(path: string): Promise<string[]>;
  findDependents(path: string): Promise<string[]>;
}

export interface DocumentationPort {
  search(query: string): Promise<Evidence[]>;
}

export interface AssetRegistryPort {
  search(query: string): Promise<Evidence[]>;
}

export interface VerificationPort {
  verify(scope: string[]): Promise<VerificationResult>;
}

export interface GitHubRepositoryConfig {
  owner: string;
  repository: string;
  ref: string;
}

export interface RepositoryFileReader {
  readFile(path: string, ref: string): Promise<string | null>;
}

export interface RepositorySearchReader {
  search(query: string, ref: string): Promise<Array<{ path: string; excerpt: string }>>;
}
