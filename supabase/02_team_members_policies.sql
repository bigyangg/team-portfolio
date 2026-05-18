-- 02_team_members_policies.sql
-- Public read/write policies for anon and authenticated users.

alter table if exists public.team_members enable row level security;

drop policy if exists team_members_anon_read on public.team_members;
create policy team_members_anon_read
on public.team_members
for select
to anon
using (true);

drop policy if exists team_members_anon_write on public.team_members;
create policy team_members_anon_write
on public.team_members
for all
to anon
using (true)
with check (true);

drop policy if exists team_members_auth_read on public.team_members;
create policy team_members_auth_read
on public.team_members
for select
to authenticated
using (true);

drop policy if exists team_members_auth_write on public.team_members;
create policy team_members_auth_write
on public.team_members
for all
to authenticated
using (true)
with check (true);
