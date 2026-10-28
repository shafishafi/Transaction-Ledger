-- 03_transactions.sql
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id   TEXT        NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  type         TEXT        NOT NULL CHECK (type IN ('credit', 'debit')),
  amount       NUMERIC     NOT NULL CHECK (amount > 0),
  description  TEXT,
  reference_id TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_account_reference UNIQUE (account_id, reference_id)
);
