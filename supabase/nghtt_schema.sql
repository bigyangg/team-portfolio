-- NGHTT Portfolio Schema (Supabase/Postgres)
-- National Green Hydrogen Think Tank (Team Portfolio 2082-83)

create extension if not exists pgcrypto;

do $$
begin
  create type cv_status_t as enum ('pending', 'available');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type member_profile_status_t as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type publication_status_t as enum ('published', 'accepted', 'under_review', 'draft');
exception
  when duplicate_object then null;
end $$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  short_name text not null unique,
  full_name text not null,
  portfolio_title text,
  portfolio_year text,
  legal_status text,
  legal_basis text,
  reference_no text,
  tagline text,
  about text,
  ministry_engagement text,
  country text default 'Nepal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mission_pillars (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  pillar_key text not null,
  title text not null,
  description text not null,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, pillar_key)
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  role_title text not null,
  team_label text, -- e.g. TEAM MEMBER, SENIOR RESEARCH LEAD
  location text,
  bio text,
  summary text,
  cv_status cv_status_t not null default 'pending',
  profile_status member_profile_status_t not null default 'published',
  photo_url text,
  source_reference text,
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_document tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(full_name, '') || ' ' ||
      coalesce(role_title, '') || ' ' ||
      coalesce(location, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(bio, '')
    )
  ) stored
);

create table if not exists member_contacts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  email text,
  phone text,
  github_url text,
  linkedin_url text,
  website_url text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id)
);

create table if not exists member_educations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  degree text not null,
  field text,
  institution text not null,
  start_year int,
  end_year int,
  cgpa text,
  notes text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_experiences (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  title text not null,
  organization text not null,
  start_year int,
  end_year int,
  is_current boolean not null default false,
  description text,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_skills (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  category text not null, -- e.g. AI & Computation, Legal & Policy
  skill_name text not null,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, category, skill_name)
);

create table if not exists member_research_interests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  interest text not null,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, interest)
);

create table if not exists member_projects (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  project_name text not null,
  project_role text,
  description text,
  tech_stack text,
  project_url text,
  is_flagship boolean not null default false,
  start_year int,
  end_year int,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_publications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  title text not null,
  publication_status publication_status_t not null default 'draft',
  venue text,
  publication_year int,
  citation text,
  url text,
  is_first_author boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_achievements (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  title text not null,
  issuer text,
  achievement_year int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists member_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  event_name text not null,
  event_year int,
  event_type text, -- conference, summit, olympiad, accelerator
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_members_org on members (organization_id);
create index if not exists idx_members_name on members (full_name);
create index if not exists idx_members_status on members (profile_status, cv_status);
create index if not exists idx_members_search on members using gin (search_document);
create index if not exists idx_member_publications_member on member_publications (member_id, publication_status);
create index if not exists idx_member_projects_member on member_projects (member_id, is_flagship);

-- Updated-at triggers
drop trigger if exists trg_organizations_updated_at on organizations;
create trigger trg_organizations_updated_at
before update on organizations
for each row execute function set_updated_at();

drop trigger if exists trg_mission_pillars_updated_at on mission_pillars;
create trigger trg_mission_pillars_updated_at
before update on mission_pillars
for each row execute function set_updated_at();

drop trigger if exists trg_members_updated_at on members;
create trigger trg_members_updated_at
before update on members
for each row execute function set_updated_at();

drop trigger if exists trg_member_contacts_updated_at on member_contacts;
create trigger trg_member_contacts_updated_at
before update on member_contacts
for each row execute function set_updated_at();

drop trigger if exists trg_member_educations_updated_at on member_educations;
create trigger trg_member_educations_updated_at
before update on member_educations
for each row execute function set_updated_at();

drop trigger if exists trg_member_experiences_updated_at on member_experiences;
create trigger trg_member_experiences_updated_at
before update on member_experiences
for each row execute function set_updated_at();

drop trigger if exists trg_member_skills_updated_at on member_skills;
create trigger trg_member_skills_updated_at
before update on member_skills
for each row execute function set_updated_at();

drop trigger if exists trg_member_research_interests_updated_at on member_research_interests;
create trigger trg_member_research_interests_updated_at
before update on member_research_interests
for each row execute function set_updated_at();

drop trigger if exists trg_member_projects_updated_at on member_projects;
create trigger trg_member_projects_updated_at
before update on member_projects
for each row execute function set_updated_at();

drop trigger if exists trg_member_publications_updated_at on member_publications;
create trigger trg_member_publications_updated_at
before update on member_publications
for each row execute function set_updated_at();

drop trigger if exists trg_member_achievements_updated_at on member_achievements;
create trigger trg_member_achievements_updated_at
before update on member_achievements
for each row execute function set_updated_at();

drop trigger if exists trg_member_events_updated_at on member_events;
create trigger trg_member_events_updated_at
before update on member_events
for each row execute function set_updated_at();

-- Public read / authenticated write policies
alter table organizations enable row level security;
alter table mission_pillars enable row level security;
alter table members enable row level security;
alter table member_contacts enable row level security;
alter table member_educations enable row level security;
alter table member_experiences enable row level security;
alter table member_skills enable row level security;
alter table member_research_interests enable row level security;
alter table member_projects enable row level security;
alter table member_publications enable row level security;
alter table member_achievements enable row level security;
alter table member_events enable row level security;

drop policy if exists org_read_public on organizations;
create policy org_read_public on organizations for select to anon, authenticated using (true);
drop policy if exists org_write_auth on organizations;
create policy org_write_auth on organizations for all to authenticated using (true) with check (true);

drop policy if exists mission_read_public on mission_pillars;
create policy mission_read_public on mission_pillars for select to anon, authenticated using (true);
drop policy if exists mission_write_auth on mission_pillars;
create policy mission_write_auth on mission_pillars for all to authenticated using (true) with check (true);

drop policy if exists members_read_public on members;
create policy members_read_public on members for select to anon, authenticated using (true);
drop policy if exists members_write_auth on members;
create policy members_write_auth on members for all to authenticated using (true) with check (true);

drop policy if exists member_contacts_read_public on member_contacts;
create policy member_contacts_read_public on member_contacts for select to anon, authenticated using (true);
drop policy if exists member_contacts_write_auth on member_contacts;
create policy member_contacts_write_auth on member_contacts for all to authenticated using (true) with check (true);

drop policy if exists member_educations_read_public on member_educations;
create policy member_educations_read_public on member_educations for select to anon, authenticated using (true);
drop policy if exists member_educations_write_auth on member_educations;
create policy member_educations_write_auth on member_educations for all to authenticated using (true) with check (true);

drop policy if exists member_experiences_read_public on member_experiences;
create policy member_experiences_read_public on member_experiences for select to anon, authenticated using (true);
drop policy if exists member_experiences_write_auth on member_experiences;
create policy member_experiences_write_auth on member_experiences for all to authenticated using (true) with check (true);

drop policy if exists member_skills_read_public on member_skills;
create policy member_skills_read_public on member_skills for select to anon, authenticated using (true);
drop policy if exists member_skills_write_auth on member_skills;
create policy member_skills_write_auth on member_skills for all to authenticated using (true) with check (true);

drop policy if exists member_research_interests_read_public on member_research_interests;
create policy member_research_interests_read_public on member_research_interests for select to anon, authenticated using (true);
drop policy if exists member_research_interests_write_auth on member_research_interests;
create policy member_research_interests_write_auth on member_research_interests for all to authenticated using (true) with check (true);

drop policy if exists member_projects_read_public on member_projects;
create policy member_projects_read_public on member_projects for select to anon, authenticated using (true);
drop policy if exists member_projects_write_auth on member_projects;
create policy member_projects_write_auth on member_projects for all to authenticated using (true) with check (true);

drop policy if exists member_publications_read_public on member_publications;
create policy member_publications_read_public on member_publications for select to anon, authenticated using (true);
drop policy if exists member_publications_write_auth on member_publications;
create policy member_publications_write_auth on member_publications for all to authenticated using (true) with check (true);

drop policy if exists member_achievements_read_public on member_achievements;
create policy member_achievements_read_public on member_achievements for select to anon, authenticated using (true);
drop policy if exists member_achievements_write_auth on member_achievements;
create policy member_achievements_write_auth on member_achievements for all to authenticated using (true) with check (true);

drop policy if exists member_events_read_public on member_events;
create policy member_events_read_public on member_events for select to anon, authenticated using (true);
drop policy if exists member_events_write_auth on member_events;
create policy member_events_write_auth on member_events for all to authenticated using (true) with check (true);

-- Helpful view for app queries
create or replace view v_member_portfolio as
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
    from member_skills ms
    where ms.member_id = m.id
  ) as skills,
  (
    select coalesce(json_agg(mri.interest order by mri.sort_order), '[]'::json)
    from member_research_interests mri
    where mri.member_id = m.id
  ) as research_interests
from members m
left join member_contacts mc on mc.member_id = m.id;

-- Optional starter seed (safe to run once).
insert into organizations (
  short_name,
  full_name,
  portfolio_title,
  portfolio_year,
  legal_status,
  legal_basis,
  reference_no,
  tagline,
  about,
  ministry_engagement,
  country
) values (
  'NGHTT',
  'National Green Hydrogen Think Tank',
  'Team Portfolio 2082-83',
  '2082-83',
  'Independent Public Trust',
  'National Civil Code 2074',
  'NGHTT/PROPOSAL/2082-83/001',
  'Clean Energy · Research · Policy · Nepal',
  'Independent multidisciplinary think tank advancing Nepal''s green hydrogen agenda.',
  'Drafts policy frameworks for the Ministry of Energy, Water Resources and Irrigation.',
  'Nepal'
)
on conflict (short_name) do update
set
  full_name = excluded.full_name,
  portfolio_title = excluded.portfolio_title,
  portfolio_year = excluded.portfolio_year,
  legal_status = excluded.legal_status,
  legal_basis = excluded.legal_basis,
  reference_no = excluded.reference_no,
  tagline = excluded.tagline,
  about = excluded.about,
  ministry_engagement = excluded.ministry_engagement,
  country = excluded.country;
