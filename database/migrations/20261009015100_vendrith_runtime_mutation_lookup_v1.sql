create or replace function public.read_world_runtime_mutation_by_id_v1(
  p_world_id uuid,
  p_mutation_id text
)
returns table(
  sequence bigint,
  mutation_id text,
  mutation_type text,
  mutation jsonb,
  domain_event jsonb,
  state_version text,
  state_hash text,
  tick bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous')='true' then raise exception 'authentication required'; end if;
  if p_mutation_id is null or length(trim(p_mutation_id)) = 0 then raise exception 'mutation id required'; end if;
  if not exists (select 1 from public.maps m where m.world_id = p_world_id and m.created_by = auth.uid()) then
    raise exception 'world access denied';
  end if;
  return query
    select l.sequence,l.mutation_id,l.mutation_type,l.mutation,l.domain_event,
           l.state_version,l.state_hash,l.tick
      from public.world_runtime_mutation_log l
     where l.world_id=p_world_id and l.mutation_id=p_mutation_id
     limit 1;
end;
$$;
revoke all on function public.read_world_runtime_mutation_by_id_v1(uuid,text) from public;
grant execute on function public.read_world_runtime_mutation_by_id_v1(uuid,text) to authenticated;
