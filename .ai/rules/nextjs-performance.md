# Next.js / React Performance Rules

- Avoid unnecessary client components; keep server boundaries deliberate.
- Dynamically import heavy editor-only modules when it improves initial load.
- Do not recreate expensive components or objects during render.
- Keep transient pointer/drag state out of broad React state when possible.
- Avoid sequential async work when independent operations can run in parallel.
- Keep data fetching close to the owning boundary and avoid duplicate requests.
- Virtualize or otherwise constrain large asset/list surfaces.
- Measure before optimizing; prefer changes supported by runtime or build evidence.
