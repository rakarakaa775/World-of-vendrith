#!/usr/bin/env bash
set -euo pipefail
: "${PGHOST:=localhost}"
: "${PGPORT:=5434}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"
: "${PGDATABASE:=vendrith_runtime_test}"
export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE
world='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
user='11111111-1111-4111-8111-111111111111'
token='ffffffff-ffff-4fff-8fff-ffffffffffff'
psql -v ON_ERROR_STOP=1 <<SQL
select set_config('request.jwt.claim.sub','$user',false);
select set_config('request.jwt.claims','{"sub":"$user","role":"authenticated","is_anonymous":false}',false);
select acquired from public.acquire_world_runtime_lease_v1('$world','$token',60);
SQL
append_one() {
  local suffix="$1" tick="$2" hash_char="$3"
  psql -v ON_ERROR_STOP=1 <<SQL
select set_config('request.jwt.claim.sub','$user',false);
select set_config('request.jwt.claims','{"sub":"$user","role":"authenticated","is_anonymous":false}',false);
select sequence from public.append_world_runtime_mutation_batch_v1(
 '$world',
 jsonb_build_array(jsonb_build_object(
  'mutation_id','concurrent-$suffix','mutation_type','concurrency_test',
  'mutation',jsonb_build_object('state',jsonb_build_object('state',jsonb_build_object('worldId','$world','clock',jsonb_build_object('tick',$tick),'stateVersion','concurrent:$suffix'),'entities','[]'::jsonb)),
  'domain_event',jsonb_build_object('type','concurrent.test'),
  'state_version','concurrent:$suffix','state_hash',repeat('$hash_char',64),'tick',$tick
 )), '$token'
);
SQL
}
append_one a 3 c > /tmp/runtime-concurrency-a.log & a=$!
append_one b 4 d > /tmp/runtime-concurrency-b.log & b=$!
wait "$a"
wait "$b"
psql -v ON_ERROR_STOP=1 <<SQL
select set_config('request.jwt.claim.sub','$user',false);
select set_config('request.jwt.claims','{"sub":"$user","role":"authenticated","is_anonymous":false}',false);
do \$\$
declare n integer; distinct_n integer; lo bigint; hi bigint;
begin
 select count(*),count(distinct sequence),min(sequence),max(sequence) into n,distinct_n,lo,hi
 from public.world_runtime_mutation_log where world_id='$world' and mutation_id in ('concurrent-a','concurrent-b');
 if n <> 2 or distinct_n <> 2 or hi-lo <> 1 then raise exception 'CONCURRENCY_ASSERT_FAILED: n %, distinct %, range %..%',n,distinct_n,lo,hi; end if;
end \$\$;
select 'runtime concurrency assertions passed' as result;
SQL
