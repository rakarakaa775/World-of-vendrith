import type { RepositoryPort, VerificationPort } from "../ports/project-tools";
import {
  hasStringArgument,
  type ToolDefinition,
} from "../ports/tool-router";

export interface RepositoryTools {
  repository: RepositoryPort;
  verification: VerificationPort;
}

export function createRepositoryTools(dependencies: RepositoryTools): ToolDefinition[] {
  return [
    {
      name: "repository.read_file",
      description: "Read a text file from the project repository.",
      access: "read-only",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
      validate: hasStringArgument("path"),
      async execute(args) {
        return { path: args.path, content: await dependencies.repository.readFile(args.path) };
      },
    },
    {
      name: "repository.search",
      description: "Search project repository text for a query.",
      access: "read-only",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
      validate: hasStringArgument("query"),
      async execute(args) {
        return dependencies.repository.search(args.query);
      },
    },
    {
      name: "verification.run",
      description: "Run bounded project verification for the requested scopes.",
      access: "read-only",
      parameters: {
        type: "object",
        properties: {
          scope: { type: "array", items: { type: "string" }, maxItems: 20 },
        },
        required: ["scope"],
      },
      validate: (args): args is { scope: string[] } =>
        typeof args === "object" &&
        args !== null &&
        Array.isArray((args as { scope?: unknown }).scope) &&
        (args as { scope: unknown[] }).scope.length <= 20 &&
        (args as { scope: unknown[] }).scope.every((item) => typeof item === "string"),
      async execute(args) {
        return dependencies.verification.verify(args.scope);
      },
    },
  ];
}
