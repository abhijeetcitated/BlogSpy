create or replace function public.refund_credits_atomic(
  p_user_id uuid,
  p_amount integer,
  p_idempotency_key text,
  p_description text default 'API failure refund'
)
returns table (success boolean, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_balance integer;
  v_refund_key text;
  v_original_deducted_amount integer;
begin
  -- 1. Surgical Validation: Prevents kachra data
  if p_amount <= 0 then
    raise exception 'INVALID_AMOUNT' using errcode = '22003';
  end if;

  -- 2. Verify Original Transaction: Ensure we are only refunding valid charges
  select amount
    into v_original_deducted_amount
    from public.bill_transactions
    where user_id = p_user_id
      and idempotency_key = p_idempotency_key
      and amount < 0 -- Only look for deductions
    limit 1;

  -- Security Guard: Original transaction must exist AND refund cannot exceed original charge
  if v_original_deducted_amount is null or p_amount > abs(v_original_deducted_amount) then
    select (credits_total - credits_used) into v_current_balance
    from public.bill_credits where user_id = p_user_id;
    return query select false, coalesce(v_current_balance, 0);
    return;
  end if;

  -- 3. Idempotency Check: Prevents "Double Dipping" refunds
  v_refund_key := p_idempotency_key || ':refund';
  if exists (
    select 1 from public.bill_transactions
    where user_id = p_user_id and idempotency_key = v_refund_key
  ) then
    select (credits_total - credits_used) into v_current_balance
    from public.bill_credits where user_id = p_user_id;
    return query select true, coalesce(v_current_balance, 0);
    return;
  end if;

  -- 4. Atomic Lock & Update: The Banker's Row Lock
  select (credits_total - credits_used)
    into v_current_balance
    from public.bill_credits
    where user_id = p_user_id
    for update; -- Lock the row to prevent race conditions

  if v_current_balance is null then
    raise exception 'CREDITS_ACCOUNT_NOT_FOUND' using errcode = 'P0001';
  end if;

  -- 5. Execution: Atomically log the refund and update the balance
  insert into public.bill_transactions (user_id, amount, idempotency_key, type, description)
  values (p_user_id, p_amount, v_refund_key, 'refund', p_description);

  update public.bill_credits
    set credits_used = greatest(credits_used - p_amount, 0),
        updated_at = now()
    where user_id = p_user_id;

  -- Return the final truth to the UI
  return query select true, (v_current_balance + p_amount);
end;
$$;
