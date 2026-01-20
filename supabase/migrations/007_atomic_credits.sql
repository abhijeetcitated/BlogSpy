-- ============================================
-- BlogSpy: Atomic Credit Deduction
-- ============================================

-- Ensure credit_transactions table exists with idempotency key support
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure idempotency_key exists for older schemas
ALTER TABLE IF EXISTS credit_transactions
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Enforce idempotency at the user scope
CREATE UNIQUE INDEX IF NOT EXISTS credit_transactions_user_idempotency_key_idx
  ON credit_transactions (user_id, idempotency_key);

-- Atomic credit deduction with idempotency protection
CREATE OR REPLACE FUNCTION deduct_credits_atomic(
  p_user_id UUID,
  p_cost INTEGER,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credits_total INTEGER;
  v_credits_used INTEGER;
  v_balance INTEGER;
  v_tx_id UUID;
BEGIN
  IF p_cost IS NULL OR p_cost <= 0 THEN
    RAISE EXCEPTION 'INVALID_COST' USING ERRCODE = 'P0001';
  END IF;

  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 THEN
    RAISE EXCEPTION 'IDEMPOTENCY_KEY_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  -- Lock the user credits row to ensure atomicity
  SELECT credits_total, credits_used
  INTO v_credits_total, v_credits_used
  FROM user_credits
  WHERE user_id::text = p_user_id::text
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CREDITS_ACCOUNT_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;

  v_balance := v_credits_total - v_credits_used;

  IF v_balance < p_cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS' USING ERRCODE = 'P0001';
  END IF;

  -- Reserve idempotency first; only proceed if insert succeeds
  INSERT INTO credit_transactions (user_id, amount, type, reason, idempotency_key)
  VALUES (p_user_id, -p_cost, 'deduct', 'atomic_deduct', p_idempotency_key)
  ON CONFLICT (user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_tx_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true);
  END IF;

  UPDATE user_credits
  SET credits_used = credits_used + p_cost,
      updated_at = NOW()
  WHERE user_id::text = p_user_id::text;

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_balance - p_cost
  );
END;
$$;

GRANT EXECUTE ON FUNCTION deduct_credits_atomic(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_credits_atomic(UUID, INTEGER, TEXT) TO service_role;
