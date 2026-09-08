# GITHUB UPDATE NOTE

This checkpoint is intended to become the initial/recovery baseline of a new repository.

Asset packages are intentionally external because they are already maintained in GitHub.

The database source in the uploaded project is documentation-oriented; the current Supabase migration history was inspected separately. Therefore the repository should not infer missing SQL migration bodies from migration names alone.

Recommended first commit message:

`chore: establish Vandrith September 2026 recovery baseline`

Recommended follow-up:
- import/verify current database migration source,
- then continue with new migrations from the verified baseline.