-- 05_rpc_process_transaction.sql
-- Atomic credit/debit with balance update and duplicate prevention
CREATE OR REPLACE FUNCTION process_transaction(
  p_account_id   TEXT,
  p_type         TEXT,
  p_amount       NUMERIC,
  p_description  TEXT    DEFAULT NULL,
  p_reference_id TEXT    DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction transactions%ROWTYPE;
BEGIN
  -- Validate transaction type
  IF p_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_type
      USING ERRCODE = '22023';
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive, got: %', p_amount
      USING ERRCODE = '22023';
  END IF;

  -- Insert transaction record
  -- UNIQUE(account_id, reference_id) constraint catches duplicate submissions
  INSERT INTO transactions (account_id, type, amount, description, reference_id)
  VALUES (p_account_id, p_type, p_amount, p_description, p_reference_id)
  RETURNING * INTO v_transaction;

  -- Atomically update account balance
  -- CHECK (balance >= 0) will raise an exception and trigger ROLLBACK on overdraft
  IF p_type = 'credit' THEN
    UPDATE accounts
    SET balance = balance + p_amount
    WHERE id = p_account_id;
  ELSE
    UPDATE accounts
    SET balance = balance - p_amount
    WHERE id = p_account_id;
  END IF;

  RETURN row_to_json(v_transaction);
END;
$$;
