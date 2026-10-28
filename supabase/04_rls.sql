-- 04_rls.sql
-- Enable RLS on both tables
ALTER TABLE accounts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Accounts: full CRUD allowed (auth can be layered later)
CREATE POLICY "accounts_allow_all" ON accounts
  USING (true) WITH CHECK (true);

-- Transactions: only INSERT and SELECT; no UPDATE or DELETE
CREATE POLICY "transactions_allow_insert" ON transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "transactions_allow_select" ON transactions
  FOR SELECT USING (true);

-- NOTE: No UPDATE or DELETE policies are created intentionally.
-- This enforces ledger immutability at the database level.

