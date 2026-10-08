import type { CodeIntelligencePort, RepositoryPort, VerificationPort } from "../ports/project-tools";
import type {
  DevelopmentWorkflowCapability,
  DevelopmentWorkflowPort,
} from "../ports/development-tools";

export interface RepositoryDevelopmentWorkflowDependencies {
  repository: RepositoryPort;
  codeIntelligence: CodeIntelligencePort;
  verification: VerificationPort;
}

export function createRepositoryDevelopmentWorkflowProvider(
  dependencies: RepositoryDevelopmentWorkflowDependencies,
): DevelopmentWorkflowPort {
  const capabilities: readonly DevelopmentWorkflowCapability[] = [
    {
      id: "repository.inspect",
      description: "Read a repository file or search repository text without modifying the repository.",
      readOnly: true,
      requiresApproval: false,
    },
    {
      id: "codegraph.inspect",
      description: "Inspect repository dependencies, dependents, symbols, references, or likely call chains.",
      readOnly: true,
      requiresApproval: false,
    },
    {
      id: "verification.inspect",
      description: "Run the project's bounded verification port for an explicitly requested scope.",
      readOnly: true,
      requiresApproval: false,
    },
  ];

  return {
    async capabilities() {
      return capabilities;
    },

    async execute(name, input) {
      switch (name) {
        case "repository.inspect": {
          if (!isRecord(input)) throw new Error("repository.inspect requires an input object");
          if (typeof input.path === "string") {
            return {
              workflow: name,
              operation: "read_file",
              path: input.path,
              content: await dependencies.repository.readFile(input.path),
            };
          }
          if (typeof input.query === "string") {
            return {
              workflow: name,
              operation: "search",
              query: input.query,
              results: await dependencies.repository.search(input.query),
            };
          }
          throw new Error("repository.inspect requires either path or query");
        }

        case "codegraph.inspect": {
          if (!isRecord(input) || typeof input.operation !== "string") {
            throw new Error("codegraph.inspect requires an operation");
          }

          switch (input.operation) {
            case "dependencies":
              return { workflow: name, operation: input.operation, path: requireString(input.path, "path"), result: await dependencies.codeIntelligence.findDependencies(requireString(input.path, "path")) };
            case "dependents":
              return { workflow: name, operation: input.operation, path: requireString(input.path, "path"), result: await dependencies.codeIntelligence.findDependents(requireString(input.path, "path")) };
            case "symbols":
              return { workflow: name, operation: input.operation, query: requireString(input.query, "query"), result: await dependencies.codeIntelligence.findSymbols(requireString(input.query, "query")) };
            case "references":
              return { workflow: name, operation: input.operation, symbol: requireString(input.symbol, "symbol"), result: await dependencies.codeIntelligence.findReferences(requireString(input.symbol, "symbol")) };
            case "call_chain":
              return { workflow: name, operation: input.operation, symbol: requireString(input.symbol, "symbol"), result: await dependencies.codeIntelligence.findCallChain(requireString(input.symbol, "symbol")) };
            default:
              throw new Error("Unsupported codegraph operation");
          }
        }

        case "verification.inspect": {
          if (!isRecord(input) || !Array.isArray(input.scope) || !input.scope.every((item) => typeof item === "string")) {
            throw new Error("verification.inspect requires a string scope array");
          }
          return {
            workflow: name,
            scope: input.scope,
            result: await dependencies.verification.verify(input.scope),
          };
        }

        default:
          throw new Error("Unknown repository development workflow");
      }
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value;
}
