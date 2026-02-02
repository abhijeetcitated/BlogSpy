-- 1. Table Reconstruction
create table if not exists public.core_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  auth_provider text not null default 'email',
  full_name text,
  avatar_url text,
  billing_tier text not null default 'free',
  -- New Columns for Preferences & Security
  timezone text default 'UTC',
  date_format text default 'DD/MM/YYYY',
  language_preference text default 'en',
  last_password_change timestamp with time zone default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Ensure columns are correct (safe guards for existing databases)
alter table public.core_profiles
  add column if not exists full_name text,
  add column if not exists updated_at timestamp with time zone not null default now();

-- 2. Security Layer (RLS)
alter table public.core_profiles enable row level security;

-- Clear old policies
drop policy if exists "select_own_core_profiles" on public.core_profiles;
drop policy if exists "update_own_core_profiles" on public.core_profiles;
drop policy if exists "service_role_insert_core_profiles" on public.core_profiles;

-- Create Unified Dragon Policies
create policy "policy_profiles_select" on public.core_profiles
  for select to authenticated using (auth.uid() = id);

create policy "policy_profiles_update" on public.core_profiles
  for update to authenticated 
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "policy_profiles_service_role" on public.core_profiles
  for all to service_role using (true);

-- 3. FIX PERMISSIONS (Sabse Important)
-- authenticated user ko poori row update karne ki permission do
grant all on public.core_profiles to authenticated;
grant all on public.core_profiles to service_role;

-- 4. Unified Sync Function (Google & Email Handle)
create or replace function public.handle_auth_user_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.core_profiles (
    id, 
    email, 
    auth_provider, 
    full_name, 
    avatar_url, 
    billing_tier
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    'free'
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    auth_provider = excluded.auth_provider,
    -- Sirf tabhi update karo agar user ne khud manually nahi badla
    full_name = coalesce(public.core_profiles.full_name, excluded.full_name);
  return new;
end;
$$;

-- 4b. Atomic Sync Function for updates (email / metadata)
create or replace function public.handle_user_update_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.core_profiles
  set 
    email = new.email,
    full_name = coalesce(new.raw_user_meta_data->>'full_name', public.core_profiles.full_name),
    updated_at = now()
  where id = new.id;

  return new;
end;
$$;

-- 5. Atomic Triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_sync();

drop trigger if exists on_auth_user_updated on auth.users;
drop trigger if exists on_auth_user_updated_sync on auth.users;
create trigger on_auth_user_updated_sync
  after update on auth.users
  for each row
  when (
    old.email is distinct from new.email
    or old.raw_user_meta_data is distinct from new.raw_user_meta_data
  )
  execute function public.handle_user_update_sync();
