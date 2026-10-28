-- 07_indexes.sql
-- Performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_account_id
  ON transactions (account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON transactions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_account_type
  ON transactions (account_id, type);

CREATE INDEX IF NOT EXISTS idx_accounts_created_at
  ON accounts (created_at DESC);

