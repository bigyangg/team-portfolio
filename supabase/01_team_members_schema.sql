-- 01_team_members_schema.sql
-- Minimal schema for the current app profile + curation flows.

create extension if not exists pgcrypto;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  preferred_name text,
  title text,
  designation text,
  department text,
  experience_years numeric,
  languages text,
  degree_1 text,
  field_1 text,
  institution_1 text,
  year_1 text,
  degree_2 text,
  field_2 text,
  institution_2 text,
  year_2 text,
  degree_3 text,
  field_3 text,
  institution_3 text,
  year_3 text,
  certifications text,
  research_primary text,
  research_secondary text,
  research_keywords text,
  publications text,
  patents text,
  academic_affiliations text,
  project_role text,
  responsibilities text[] not null default '{}',
  govt_experience text,
  notable_projects text,
  bio text,
  unique_qualification text,
  email text,
  phone text,
  linkedin text,
  researchgate text,
  website text,
  photo_url text,
  cv_url text,
  show_on_portfolio boolean not null default true,
  submitted_at timestamptz not null default now()
);

-- Compatibility upgrades for partially existing tables.
alter table if exists public.team_members add column if not exists full_name text;
alter table if exists public.team_members add column if not exists preferred_name text;
alter table if exists public.team_members add column if not exists title text;
alter table if exists public.team_members add column if not exists designation text;
alter table if exists public.team_members add column if not exists department text;
alter table if exists public.team_members add column if not exists experience_years numeric;
alter table if exists public.team_members add column if not exists languages text;
alter table if exists public.team_members add column if not exists degree_1 text;
alter table if exists public.team_members add column if not exists field_1 text;
alter table if exists public.team_members add column if not exists institution_1 text;
alter table if exists public.team_members add column if not exists year_1 text;
alter table if exists public.team_members add column if not exists degree_2 text;
alter table if exists public.team_members add column if not exists field_2 text;
alter table if exists public.team_members add column if not exists institution_2 text;
alter table if exists public.team_members add column if not exists year_2 text;
alter table if exists public.team_members add column if not exists degree_3 text;
alter table if exists public.team_members add column if not exists field_3 text;
alter table if exists public.team_members add column if not exists institution_3 text;
alter table if exists public.team_members add column if not exists year_3 text;
alter table if exists public.team_members add column if not exists certifications text;
alter table if exists public.team_members add column if not exists research_primary text;
alter table if exists public.team_members add column if not exists research_secondary text;
alter table if exists public.team_members add column if not exists research_keywords text;
alter table if exists public.team_members add column if not exists publications text;
alter table if exists public.team_members add column if not exists patents text;
alter table if exists public.team_members add column if not exists academic_affiliations text;
alter table if exists public.team_members add column if not exists project_role text;
alter table if exists public.team_members add column if not exists responsibilities text[] not null default '{}';
alter table if exists public.team_members add column if not exists govt_experience text;
alter table if exists public.team_members add column if not exists notable_projects text;
alter table if exists public.team_members add column if not exists bio text;
alter table if exists public.team_members add column if not exists unique_qualification text;
alter table if exists public.team_members add column if not exists email text;
alter table if exists public.team_members add column if not exists phone text;
alter table if exists public.team_members add column if not exists linkedin text;
alter table if exists public.team_members add column if not exists researchgate text;
alter table if exists public.team_members add column if not exists website text;
alter table if exists public.team_members add column if not exists photo_url text;
alter table if exists public.team_members add column if not exists cv_url text;
alter table if exists public.team_members add column if not exists show_on_portfolio boolean not null default true;
alter table if exists public.team_members add column if not exists submitted_at timestamptz not null default now();

create index if not exists idx_team_members_submitted_at on public.team_members (submitted_at desc);
