-- Migration 020: Remove unlimited credits (-1) concept
-- Enterprise now gets 500 credits/month like a normal plan

-- Update any existing enterprise users with -1 credits to 500
UPDATE public.zestio_users
SET credits = 500
WHERE credits = -1;

-- Update the deduct_credits RPC to remove -1/unlimited handling
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits INTEGER;
  v_used_credits INTEGER;
BEGIN
  SELECT credits, used_credits INTO v_credits, v_used_credits
  FROM zestio_users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check sufficient credits
  IF v_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct atomically
  UPDATE zestio_users
  SET credits = credits - p_amount,
      used_credits = used_credits + p_amount
  WHERE id = p_user_id;

  RETURN v_credits - p_amount;
END;
$$;
