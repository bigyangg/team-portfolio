-- NGHTT CV compatibility patch
-- Run this AFTER nghtt_schema.sql
-- Safe for environments where public.team_members does not exist.

alter table if exists public.members
  add column if not exists cv_url text;

alter table if exists public.team_members
  add column if not exists cv_url text;

alter table if exists public.team_members
  add column if not exists show_on_portfolio boolean not null default true;

do $$
begin
  if to_regclass('public.members') is null then
    raise exception 'Missing table: public.members. Run nghtt_schema.sql first.';
  end if;

  if to_regclass('public.member_contacts') is null then
    raise exception 'Missing table: public.member_contacts. Run nghtt_schema.sql first.';
  end if;

  if to_regclass('public.member_skills') is null then
    raise exception 'Missing table: public.member_skills. Run nghtt_schema.sql first.';
  end if;

  if to_regclass('public.member_research_interests') is null then
    raise exception 'Missing table: public.member_research_interests. Run nghtt_schema.sql first.';
  end if;
end $$;

create or replace view public.v_member_portfolio as
select
  m.id,
  m.organization_id,
  m.full_name,
  m.role_title,
  m.team_label,
  m.location,
  m.summary,
  m.cv_status,
  m.profile_status,
  m.photo_url,
  mc.email,
  mc.phone,
  mc.github_url,
  mc.linkedin_url,
  (
    select coalesce(json_agg(ms.skill_name order by ms.sort_order), '[]'::json)
    from public.member_skills ms
    where ms.member_id = m.id
  ) as skills,
  (
    select coalesce(json_agg(mri.interest order by mri.sort_order), '[]'::json)
    from public.member_research_interests mri
    where mri.member_id = m.id
  ) as research_interests,
  m.bio,
  m.cv_url
from public.members m
left join public.member_contacts mc on mc.member_id = m.id;
