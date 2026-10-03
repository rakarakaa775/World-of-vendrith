-- Map Editor: make map ownership automatic for authenticated Supabase sessions.
-- This keeps the existing RLS ownership contract while allowing bootstrap inserts
-- to omit created_by and have Postgres bind it to auth.uid().
ALTER TABLE public.maps
  ALTER COLUMN created_by SET DEFAULT auth.uid();
