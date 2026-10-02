import type { Evidence } from "../domain/types";
import type { RepositoryPort } from "../ports/project-tools";

export type SchemaArea = "map" | "world" | "region" | "npc" | "dialogue" | "event";

export interface SchemaAreaSummary {
  area: SchemaArea;
  status: "evidence-found" | "no-direct-evidence";
  concepts: string[];
  evidence: Evidence[];
}

export interface ProjectSchemaSummary {
  generatedAt: string;
  areas: SchemaAreaSummary[];
}

const QUERIES: Record<SchemaArea, string[]> = {
  map: ["editor_map_identity", "public.maps", "map_versions"],
  world: ["public.worlds", "worlds", "map_type world"],
  region: ["editor_map_identity region", "public.regions", "map_type region"],
  npc: ["npc", "non_player_character"],
  dialogue: ["dialogue", "dialogues"],
  event: ["event", "events", "quest"],
};

const CONCEPTS: Record<SchemaArea, string[]> = {
  map: ["editor map identity", "legacy map bridge", "map versions"],
  world: ["world identity", "world scope"],
  region: ["editor region identity", "world-scoped parent"],
  npc: ["NPC data contract"],
  dialogue: ["dialogue data contract"],
  event: ["event/quest data contract"],
};
function evidenceFromMatch(area: SchemaArea, match: { path: string; excerpt: string }, index: number): Evidence {
  return {
    id: `schema-${area}-${index}`,
    kind: "verified-fact",
    source: `repository:${match.path}`,
    fact: match.excerpt,
    confidence: "high",
  };
}

export async function buildProjectSchemaSummary(repository: RepositoryPort): Promise<ProjectSchemaSummary> {
  const areas = await Promise.all(Object.entries(QUERIES).map(async ([area, queries]) => {
    const matches: Array<{ path: string; excerpt: string }> = [];
    for (const query of queries) {
      const results = await repository.search(query);
      for (const result of results.slice(0, 4)) {
        if (!matches.some((item) => item.path === result.path && item.excerpt === result.excerpt)) {
          matches.push(result);
        }
      }
    }

    const key = area as SchemaArea;
    return {
      area: key,
      status: matches.length ? "evidence-found" : "no-direct-evidence",
      concepts: matches.length ? CONCEPTS[key] : [],
      evidence: matches.slice(0, 8).map((match, index) => evidenceFromMatch(key, match, index)),
    } satisfies SchemaAreaSummary;
  }));

  return { generatedAt: new Date().toISOString(), areas };
}
