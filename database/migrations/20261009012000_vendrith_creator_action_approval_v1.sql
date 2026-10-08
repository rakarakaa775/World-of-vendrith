create or replace function public.approve_vendrith_creator_action_v1(p_proposal_id uuid)
returns jsonb
language plpgsql
set search_path = public, pg_temp
as $$
declare
  p public.vendrith_creator_action_proposals%rowtype;
  s public.vendrith_ai_sessions%rowtype;
  r jsonb;
  v_operation text;
  v_map_id uuid;
  v_object_id uuid;
  v_asset_id uuid;
  v_layer_id uuid;
  v_object_type text;
  v_x numeric;
  v_y numeric;
  v_rotation numeric;
  v_scale_x numeric;
  v_scale_y numeric;
  v_footprint jsonb;
  v_properties jsonb;
begin
  if auth.uid() is null or (auth.jwt()->>'is_anonymous') = 'true' then
    return jsonb_build_object('ok',false,'code','AUTH_REQUIRED');
  end if;

  select * into p
  from public.vendrith_creator_action_proposals
  where id = p_proposal_id and user_id = auth.uid()
  for update;

  if not found then
    return jsonb_build_object('ok',false,'code','PROPOSAL_NOT_FOUND');
  end if;
  if p.status <> 'pending' then
    return jsonb_build_object('ok',false,'code','PROPOSAL_NOT_PENDING','status',p.status);
  end if;

  select * into s
  from public.vendrith_ai_sessions
  where id = p.session_id and user_id = auth.uid();

  if not found or s.context_type <> 'playable' or s.context_id <> p.context_id or p.map_id <> s.context_id then
    update public.vendrith_creator_action_proposals
      set status='rejected', result=jsonb_build_object('ok',false,'code','CONTEXT_MISMATCH')
      where id=p.id;
    return jsonb_build_object('ok',false,'code','CONTEXT_MISMATCH');
  end if;

  -- RLS-backed existence checks ensure the approving user can access the target map/object.
  if not exists (select 1 from public.maps where id=p.map_id) then
    update public.vendrith_creator_action_proposals
      set status='rejected', result=jsonb_build_object('ok',false,'code','MAP_NOT_ACCESSIBLE')
      where id=p.id;
    return jsonb_build_object('ok',false,'code','MAP_NOT_ACCESSIBLE');
  end if;

  v_operation := p.operation;
  v_map_id := p.map_id;
  v_object_id := nullif(p.action->>'objectId','')::uuid;
  v_asset_id := nullif(p.action->>'assetId','')::uuid;
  v_layer_id := nullif(p.action->>'targetLayerId','')::uuid;
  v_object_type := nullif(p.action->>'objectType','');
  v_x := nullif(p.action->>'x','')::numeric;
  v_y := nullif(p.action->>'y','')::numeric;
  v_rotation := nullif(p.action->>'rotation','')::numeric;
  v_scale_x := nullif(p.action->>'scaleX','')::numeric;
  v_scale_y := nullif(p.action->>'scaleY','')::numeric;
  v_footprint := coalesce(p.action->'footprint', '[{"x":0,"y":0}]'::jsonb);
  v_properties := coalesce(p.action->'properties', '{}'::jsonb);

  if v_operation in ('move','rotate','scale','delete') and v_object_id is null then
    return jsonb_build_object('ok',false,'code','OBJECT_REQUIRED');
  end if;

  if v_operation = 'create' and v_map_id is null then
    return jsonb_build_object('ok',false,'code','MAP_REQUIRED');
  end if;

  r := public.editor_mutation_gateway_v1(
    v_operation, v_object_id, v_map_id, v_x, v_y, v_rotation,
    v_scale_x, v_scale_y, v_layer_id, v_asset_id, v_object_type,
    v_footprint, v_properties
  );

  if coalesce((r->>'ok')::boolean,false) then
    update public.vendrith_creator_action_proposals
      set status='approved',
          approval_id=gen_random_uuid(),
          approved_at=now(),
          result=r
      where id=p.id;
  else
    update public.vendrith_creator_action_proposals
      set status='failed',
          approval_id=gen_random_uuid(),
          approved_at=now(),
          result=r
      where id=p.id;
  end if;

  return jsonb_build_object('ok',coalesce((r->>'ok')::boolean,false),'proposal_id',p.id,'result',r);
end;
$$;

revoke all on function public.approve_vendrith_creator_action_v1(uuid) from public;
grant execute on function public.approve_vendrith_creator_action_v1(uuid) to authenticated;