# Vandrith Repository Structure

## Root

Root contains primary project entry/status files plus top-level project organization folders.

## inspirasi/

Reference and inspiration material used to evaluate architecture, engineering practices, repositories, tools, and other development ideas for Vendrith.

- README.md — purpose and rules for the inspiration collection.
- NODEJS_BEST_PRACTICES_VENDRITH.md — audit and decisions from Node.js Best Practices.
- CODEBASE_MEMORY_MCP_AUDIT.md — comprehensive audit of codebase-memory-mcp.
- CODEBASE_MEMORY_MCP_VS_CODEGRAPH.md — comparison of codebase-memory-mcp and CodeGraph.
- OPEN_HIGGSFIELD_AI_SUNNYCHASE_AUDIT.md — audit of sunnychase/open-higgsfield-ai.
- DEVELOPER_ROADMAP_KAMRANAHMEDSE_AUDIT.md — audit of kamranahmedse/developer-roadmap.
- OPEN_LLM_VTUBER_AUDIT.md — audit of Open-LLM-VTuber.
- REFERENCE_TEMPLATE.md — template for future references.

Material in inspirasi/ is not automatically production code or a dependency.

## docs/

Current project documentation.

- architecture/ — architecture and implementation-state documents.
- audits/ — current audit results.
- checkpoints/ — checkpoint and repository synchronization records.
- database/reconciliation/ — runtime/database reconciliation artifacts.
- handoff/ — current handoff notes that are not part of the historical snapshot.

## database/

Database design and reconciliation material.

- migrations/ — numbered historical/source migrations captured in the repository.
- specifications/ — table/schema specifications.
- validation/ — validation records.
- reconciliation/ — database hardening and reconciliation artifacts.

## supabase/

Exact Supabase migration source captured from verified working sessions. Do not infer missing migration SQL from migration names.

## handoff/

Preserved historical handoff package. It is archival/source evidence and may contain legacy project snapshots.

## SOURCE_ARCHIVE/

Source/archive manifests and preserved source evidence.

## archive/

Large packaged historical snapshots retained as archives.

## Organization rule

Do not mix historical handoff material with current implementation documents. Do not delete historical source merely to make the tree look smaller. Preserve provenance and record durable decisions separately from raw reference material.
