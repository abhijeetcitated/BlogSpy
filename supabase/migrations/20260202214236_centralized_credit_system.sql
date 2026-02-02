create extension if not exists "pgcrypto";

alter table public.bill_credits
  add column if not exists credits_total integer not null default 0,
  add column if not exists credits_used integer not null default 0,
  add column if not exists updated_at timestamp with time zone not null default now();

alter table public.bill_transactions
  add column if not exists feature_name text,
  add column if not exists description text,
  add column if not exists amount integer not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamp with time zone not null default now();

create or replace function public.consume_credits_atomic(
  p_user_id uuid,
  p_amount integer,
  p_feature_name text,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns table (success boolean, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance integer;
  v_idempotency_key text;
begin
  if p_amount <= 0 then
    raise exception 'INVALID_AMOUNT' using errcode = '22003';
  end if;

  v_idempotency_key := coalesce(p_idempotency_key, gen_random_uuid()::text);

  if p_idempotency_key is not null then
    if exists (
      select 1 from public.bill_transactions
      where user_id = p_user_id and idempotency_key = p_idempotency_key
    ) then
      select (credits_total - credits_used)
        into v_current_balance
        from public.bill_credits
        where user_id = p_user_id;
      return query select true, coalesce(v_current_balance, 0);
      return;
    end if;
  end if;

  insert into public.bill_credits (user_id, credits_total, credits_used)
  values (p_user_id, 0, 0)
  on conflict (user_id) do nothing;

  select (credits_total - credits_used)
    into v_current_balance
    from public.bill_credits
    where user_id = p_user_id
    for update;

  if v_current_balance is null then
    return query select false, 0;
    return;
  end if;

  if v_current_balance < p_amount then
    return query select false, v_current_balance;
    return;
  end if;

  update public.bill_credits
    set credits_used = credits_used + p_amount,
        updated_at = now()
    where user_id = p_user_id;

  insert into public.bill_transactions (
    user_id,
    feature_name,
    description,
    amount,
    metadata,
    type,
    idempotency_key
  )
  values (
    p_user_id,
    p_feature_name,
    p_description,
    -p_amount,
    p_metadata,
    'usage',
    v_idempotency_key
  );

  return query select true, (v_current_balance - p_amount);
end;
$$;