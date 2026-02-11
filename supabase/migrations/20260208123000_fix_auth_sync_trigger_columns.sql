-- Fix auth -> core_profiles sync functions to match current core_profiles schema.
-- Root issue observed in production: trigger referenced removed columns
-- (`auth_provider`, `avatar_url`, `updated_at`) causing "Database error creating new user".

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'core_profiles'
      and column_name = 'auth_provider'
  ) then
    alter table public.core_profiles
      add column auth_provider text not null default 'email';
  end if;
end $$;

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
    billing_tier
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    nullif(new.raw_user_meta_data->>'full_name', ''),
    'free'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    auth_provider = excluded.auth_provider,
    full_name = coalesce(public.core_profiles.full_name, excluded.full_name);

  return new;
end;
$$;

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
    auth_provider = coalesce(new.raw_app_meta_data->>'provider', 'email'),
    full_name = coalesce(new.raw_user_meta_data->>'full_name', public.core_profiles.full_name)
  where id = new.id;

  return new;
end;
$$;

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
    or old.raw_app_meta_data is distinct from new.raw_app_meta_data
  )
  execute function public.handle_user_update_sync();
