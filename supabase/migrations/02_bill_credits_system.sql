create extension if not exists "pgcrypto";

create table if not exists public.bill_credits (
  user_id uuid primary key references public.core_profiles(id),
  credits_total integer not null default 0,
  credits_used integer not null default 0,
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.bill_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.core_profiles(id),
  amount integer not null,
  idempotency_key text not null unique,
  type text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.bill_credits enable row level security;
alter table public.bill_transactions enable row level security;

drop policy if exists "select_own_bill_credits" on public.bill_credits;
create policy "select_own_bill_credits"
  on public.bill_credits
  for select
  using (auth.uid() = user_id);

drop policy if exists "select_own_bill_transactions" on public.bill_transactions;
create policy "select_own_bill_transactions"
  on public.bill_transactions
  for select
  using (auth.uid() = user_id);

create or replace function public.deduct_credits_atomic(
  p_user_id uuid,
  p_amount integer,
  p_idempotency_key text,
  p_description text default 'Keyword Search'
)
returns table (success boolean, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance integer;
begin
  -- 1. Row Level Locking (Prevent Race Conditions)
  select (credits_total - credits_used) into v_current_balance
  from public.bill_credits where user_id = p_user_id for update;

  -- 2. Balance Check
  if v_current_balance < p_amount then
    return query select false, v_current_balance;
    return;
  end if;

  -- 3. Atomic Deduction
  update public.bill_credits
  set credits_used = credits_used + p_amount, updated_at = now()
  where user_id = p_user_id;

  -- 4. Log Transaction
  insert into public.bill_transactions (user_id, amount, type, description, idempotency_key)
  values (p_user_id, -p_amount, 'usage', p_description, p_idempotency_key);

  return query select true, (v_current_balance - p_amount);
end;
$$;

create or replace function public.add_credits_atomic(
  p_user_id uuid,
  p_amount integer,
  p_idempotency_key text,
  p_description text default 'Credit top-up'
)
returns table (success boolean, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'INVALID_AMOUNT' using errcode = '22003';
  end if;

  if exists (
    select 1 from public.bill_transactions
    where user_id = p_user_id and idempotency_key = p_idempotency_key
  ) then
    select (credits_total - credits_used) into v_current_balance
    from public.bill_credits where user_id = p_user_id;
    return query select true, coalesce(v_current_balance, 0);
    return;
  end if;

  select (credits_total - credits_used) into v_current_balance
  from public.bill_credits where user_id = p_user_id for update;

  if v_current_balance is null then
    raise exception 'CREDITS_ACCOUNT_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.bill_credits
  set credits_total = credits_total + p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.bill_transactions (user_id, amount, type, description, idempotency_key)
  values (p_user_id, p_amount, 'topup', p_description, p_idempotency_key);

  return query select true, (v_current_balance + p_amount);
end;
$$;
