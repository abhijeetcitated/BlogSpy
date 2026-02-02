alter table public.core_profiles
  add column if not exists suspicious boolean not null default false,
  add column if not exists suspicious_until timestamp with time zone;

create index if not exists core_profiles_suspicious_until_idx
  on public.core_profiles (suspicious_until);