# Vandrith Map Editor

Initial Next.js + TypeScript shell for the Vandrith Map Editor.

Architecture:
- Next.js App Router
- TypeScript
- PixiJS reserved for the editor canvas
- Supabase client dependencies reserved for the data layer
- Vercel intended as deployment target

Current scope:
- toolbar
- project/layer/asset panels
- inspector
- canvas mount point

No production Supabase mutation is wired into the UI.

Database source-of-truth:
The repository does not claim to contain every migration currently present in Supabase. The database and supabase directories are the controlled source artifacts currently captured in GitHub. Runtime-only database state must not be fabricated into migration files.

Next slices:
1. Mount PixiJS.
2. Define map document types and serialization.
3. Add read-only Supabase map loading.
4. Add Save through approved mutation gateways.
5. Add Vercel deployment configuration.
6. Add Phaser later for Play/Preview mode.