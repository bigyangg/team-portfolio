-- NGHTT media + write policy patch
-- Run this in Supabase SQL Editor for production deployments.
-- This patch enables browser uploads with anon key for the NGHTT app.

-- 1) Ensure media buckets exist and are publicly readable.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('team-cvs', 'team-cvs', true, 52428800, null),
  ('team-photos', 'team-photos', true, 52428800, null)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Storage object policies (anon + authenticated).
drop policy if exists nghtt_media_read_public on storage.objects;
create policy nghtt_media_read_public
on storage.objects
for select
to anon, authenticated
using (bucket_id in ('team-cvs', 'team-photos'));

drop policy if exists nghtt_media_insert_public on storage.objects;
create policy nghtt_media_insert_public
on storage.objects
for insert
to anon, authenticated
with check (bucket_id in ('team-cvs', 'team-photos'));

drop policy if exists nghtt_media_update_public on storage.objects;
create policy nghtt_media_update_public
on storage.objects
for update
to anon, authenticated
using (bucket_id in ('team-cvs', 'team-photos'))
with check (bucket_id in ('team-cvs', 'team-photos'));

-- 3) Table write policies for anon browser client.
-- NOTE: this is intentionally open for presentation/demo workflows.
do $$
begin
  if to_regclass('public.team_members') is not null then
    execute 'alter table public.team_members enable row level security';
    execute 'drop policy if exists team_members_anon_read on public.team_members';
    execute 'create policy team_members_anon_read on public.team_members for select to anon using (true)';
    execute 'drop policy if exists team_members_anon_write on public.team_members';
    execute 'create policy team_members_anon_write on public.team_members for all to anon using (true) with check (true)';
  end if;
end $$;

do $$
begin
  if to_regclass('public.members') is not null then
    execute 'alter table public.members enable row level security';
    execute 'drop policy if exists members_anon_read on public.members';
    execute 'create policy members_anon_read on public.members for select to anon using (true)';
    execute 'drop policy if exists members_anon_write on public.members';
    execute 'create policy members_anon_write on public.members for all to anon using (true) with check (true)';
  end if;
end $$;

do $$
begin
  if to_regclass('public.member_contacts') is not null then
    execute 'alter table public.member_contacts enable row level security';
    execute 'drop policy if exists member_contacts_anon_read on public.member_contacts';
    execute 'create policy member_contacts_anon_read on public.member_contacts for select to anon using (true)';
    execute 'drop policy if exists member_contacts_anon_write on public.member_contacts';
    execute 'create policy member_contacts_anon_write on public.member_contacts for all to anon using (true) with check (true)';
  end if;
end $$;

do $$
begin
  if to_regclass('public.member_research_interests') is not null then
    execute 'alter table public.member_research_interests enable row level security';
    execute 'drop policy if exists member_research_interests_anon_read on public.member_research_interests';
    execute 'create policy member_research_interests_anon_read on public.member_research_interests for select to anon using (true)';
    execute 'drop policy if exists member_research_interests_anon_write on public.member_research_interests';
    execute 'create policy member_research_interests_anon_write on public.member_research_interests for all to anon using (true) with check (true)';
  end if;
end $$;
