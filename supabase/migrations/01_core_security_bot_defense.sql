create extension if not exists "pgcrypto";

create table if not exists public.core_security_violations (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  violation_type text not null,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

alter table public.core_security_violations enable row level security;

drop policy if exists "service_role_insert_core_security_violations" on public.core_security_violations;
create policy "service_role_insert_core_security_violations"
  on public.core_security_violations
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists "admin_read_core_security_violations" on public.core_security_violations;
create policy "admin_read_core_security_violations"
  on public.core_security_violations
  for select
  using ((auth.jwt() ->> 'role') = 'admin');
