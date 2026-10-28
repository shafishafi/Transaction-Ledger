-- 02_accounts.sql
-- 8-character meaningful alphanumeric format: AC + [2-digit month] + [4 random chars] (e.g. AC107K9P)
CREATE OR REPLACE FUNCTION generate_account_id() RETURNS TEXT AS $$
DECLARE
  chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  result TEXT := 'AC' || to_char(now(), 'MM');
  i INTEGER;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS accounts (
  id         TEXT        PRIMARY KEY DEFAULT generate_account_id(),
  name       TEXT        NOT NULL,
  balance    NUMERIC     NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
