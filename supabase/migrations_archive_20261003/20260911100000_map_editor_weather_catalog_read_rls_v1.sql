create policy "weather definitions readable by authenticated users"
on public.weather_definitions
for select
to authenticated
using (true);
