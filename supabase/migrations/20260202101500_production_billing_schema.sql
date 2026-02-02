create extension if not exists "pgcrypto";

-- Core credits balance (1 row per user)
create table if not exists public.bill_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits_total integer not null default 0,
  credits_used integer not null default 0,
  updated_at timestamp with time zone not null default now()
);

-- Audit trail for every credit movement
create table if not exists public.bill_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null,
  description text,
  idempotency_key text not null,
  lemonsqueezy_order_id text,
  created_at timestamp with time zone not null default now()
);

-- Ensure columns exist if tables were created previously
alter table public.bill_credits
  add column if not exists credits_total integer not null default 0,
  add column if not exists credits_used integer not null default 0,
  add column if not exists updated_at timestamp with time zone not null default now();

alter table public.bill_transactions
  add column if not exists amount integer not null default 0,
  add column if not exists type text not null default 'topup',
  add column if not exists description text,
  add column if not exists idempotency_key text,
  add column if not exists lemonsqueezy_order_id text,
  add column if not exists created_at timestamp with time zone not null default now();

-- Re-point foreign keys to auth.users (authoritative identity store)
alter table public.bill_credits
  drop constraint if exists bill_credits_user_id_fkey,
  add constraint bill_credits_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.bill_transactions
  drop constraint if exists bill_transactions_user_id_fkey,
  add constraint bill_transactions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

-- Uniqueness / idempotency guards
create unique index if not exists bill_transactions_idempotency_key_key
  on public.bill_transactions (idempotency_key)
  where idempotency_key is not null;

create unique index if not exists bill_transactions_lemonsqueezy_order_id_key
  on public.bill_transactions (lemonsqueezy_order_id)
  where lemonsqueezy_order_id is not null;

-- RLS: users can only see their own balance
alter table public.bill_credits enable row level security;
drop policy if exists "select_own_bill_credits" on public.bill_credits;
create policy "select_own_bill_credits"
  on public.bill_credits
  for select
  using (auth.uid() = user_id);

-- Permissions for app + service automation
grant all on table public.bill_credits to authenticated, service_role;
grant all on table public.bill_transactions to authenticated, service_role;
