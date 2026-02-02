create extension if not exists "pgcrypto";

create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_seo_report boolean not null default true,
  rank_alerts boolean not null default true,
  decay_alerts boolean not null default false,
  competitor_alerts boolean not null default false,
  product_updates boolean not null default true,
  unsubscribe_all boolean not null default false,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.notification_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  status text not null,
  metadata jsonb,
  sent_at timestamp with time zone not null default now()
);

alter table public.notification_settings
  add column if not exists weekly_seo_report boolean not null default true,
  add column if not exists rank_alerts boolean not null default true,
  add column if not exists decay_alerts boolean not null default false,
  add column if not exists competitor_alerts boolean not null default false,
  add column if not exists product_updates boolean not null default true,
  add column if not exists unsubscribe_all boolean not null default false,
  add column if not exists updated_at timestamp with time zone not null default now();

alter table public.notification_history
  add column if not exists type text not null default 'system',
  add column if not exists status text not null default 'pending',
  add column if not exists metadata jsonb,
  add column if not exists sent_at timestamp with time zone not null default now();

alter table public.notification_settings enable row level security;
drop policy if exists "select_own_notification_settings" on public.notification_settings;
create policy "select_own_notification_settings"
  on public.notification_settings
  for select
  using (auth.uid() = user_id);

drop policy if exists "update_own_notification_settings" on public.notification_settings;
create policy "update_own_notification_settings"
  on public.notification_settings
  for update
  using (auth.uid() = user_id);

drop policy if exists "insert_own_notification_settings" on public.notification_settings;
create policy "insert_own_notification_settings"
  on public.notification_settings
  for insert
  with check (auth.uid() = user_id);

alter table public.notification_history enable row level security;
drop policy if exists "select_own_notification_history" on public.notification_history;
create policy "select_own_notification_history"
  on public.notification_history
  for select
  using (auth.uid() = user_id);

grant all on table public.notification_settings to authenticated, service_role;
grant all on table public.notification_history to authenticated, service_role;