-- 06_rpc_transfer_funds.sql
-- Atomic money transfer between two accounts
CREATE OR REPLACE FUNCTION transfer_funds(
  source_account_id TEXT,
  dest_account_id   TEXT,
  amount            NUMERIC,
  reference_id      TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source_ref TEXT := reference_id || 'dr';
  v_dest_ref   TEXT := reference_id || 'cr';
BEGIN
  -- Validate accounts are different
  IF source_account_id = dest_account_id THEN
    RAISE EXCEPTION 'Source and destination accounts must be different'
      USING ERRCODE = '22023';
  END IF;

  -- Debit source (will rollback if balance goes below 0 or duplicate ref)
  PERFORM process_transaction(
    source_account_id,
    'debit',
    amount,
    'Transfer to account: ' || dest_account_id,
    v_source_ref
  );

  -- Credit destination
  PERFORM process_transaction(
    dest_account_id,
    'credit',
    amount,
    'Transfer from account: ' || source_account_id,
    v_dest_ref
  );

  RETURN json_build_object(
    'status',       'success',
    'reference_id', reference_id,
    'amount',       amount
  );
END;
$$;
