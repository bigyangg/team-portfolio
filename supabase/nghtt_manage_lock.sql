-- NGHTT Manage/Edit lock + Supabase PIN verification
-- Run this AFTER nghtt_schema.sql
-- This file does NOT store any real PIN. Set your PIN manually via the snippet at the bottom.

create extension if not exists pgcrypto;

create table if not exists public.admin_manage_lock_settings (
  id smallint primary key default 1 check (id = 1),
  manage_edit_locked boolean not null default true,
  admin_pin_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_manage_lock_settings enable row level security;

drop policy if exists admin_manage_lock_settings_no_select on public.admin_manage_lock_settings;
create policy admin_manage_lock_settings_no_select
on public.admin_manage_lock_settings
for select
to anon, authenticated
using (false);

drop policy if exists admin_manage_lock_settings_no_write on public.admin_manage_lock_settings;
create policy admin_manage_lock_settings_no_write
on public.admin_manage_lock_settings
for all
to anon, authenticated
using (false)
with check (false);

create or replace function public.get_manage_edit_lock_state()
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  lock_state boolean;
begin
  select manage_edit_locked
  into lock_state
  from public.admin_manage_lock_settings
  where id = 1;

  return coalesce(lock_state, true);
end;
$$;

create or replace function public.verify_admin_pin(p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
begin
  select admin_pin_hash
  into stored_hash
  from public.admin_manage_lock_settings
  where id = 1;

  if stored_hash is null then
    raise exception 'ADMIN_PIN_NOT_CONFIGURED';
  end if;

  return stored_hash = extensions.crypt(coalesce(p_pin, ''), stored_hash);
end;
$$;

create or replace function public.set_manage_edit_lock(p_pin text, p_locked boolean)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.verify_admin_pin(p_pin) then
    return false;
  end if;

  update public.admin_manage_lock_settings
  set
    manage_edit_locked = coalesce(p_locked, true),
    updated_at = now()
  where id = 1;

  if not found then
    raise exception 'ADMIN_PIN_NOT_CONFIGURED';
  end if;

  return true;
end;
$$;

grant execute on function public.get_manage_edit_lock_state() to anon, authenticated;
grant execute on function public.verify_admin_pin(text) to anon, authenticated;
grant execute on function public.set_manage_edit_lock(text, boolean) to anon, authenticated;

-- Set (or reset) your own PIN manually:
-- Replace YOUR_PIN with your secret PIN.
--
-- insert into public.admin_manage_lock_settings (id, manage_edit_locked, admin_pin_hash)
-- values (1, true, extensions.crypt('YOUR_PIN', extensions.gen_salt('bf')))
-- on conflict (id) do update
-- set
--   admin_pin_hash = excluded.admin_pin_hash,
--   updated_at = now();
