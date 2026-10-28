-- 08_seed.sql
-- Clean verified seed data for Treasury Ledger System

-- 1. Insert Initial Accounts (Option 1: ACmmXXXX format, 8 characters)
INSERT INTO accounts (id, name, balance, created_at)
VALUES
  ('AC107K9P', 'Operating Treasury', 1000.00, NOW() - INTERVAL '30 days'),
  ('AC103X8D', 'Strategic Investment Reserve', 500.00, NOW() - INTERVAL '60 days'),
  ('AC109M2B', 'New Corporate Escrow', 0.00, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO UPDATE SET
  balance = EXCLUDED.balance,
  name = EXCLUDED.name;

-- 2. Insert Initial Ledger Transactions (INTTXNXXXXXX for internal, OTHERACCXXXXXX for transfers)
INSERT INTO transactions (account_id, type, amount, description, reference_id, created_at)
VALUES
  -- Operating Treasury Transactions
  ('AC107K9P', 'credit', 1000.00, 'Initial Capital Injection', 'INTTXN101001', NOW() - INTERVAL '28 days'),
  ('AC107K9P', 'debit', 300.00, 'Transfer to Strategic Investment Reserve', 'OTHERACC201001dr', NOW() - INTERVAL '20 days'),
  ('AC107K9P', 'credit', 500.00, 'Corporate Client Retainer', 'INTTXN101002', NOW() - INTERVAL '10 days'),
  ('AC107K9P', 'debit', 200.00, 'Transfer to New Corporate Escrow', 'OTHERACC202001dr', NOW() - INTERVAL '5 days'),
  ('AC107K9P', 'debit', 100.00, 'Server Infrastructure Maintenance', 'INTTXN101003', NOW() - INTERVAL '2 days'),
  ('AC107K9P', 'credit', 100.00, 'Treasury Advisory Settlement', 'INTTXN101004', NOW() - INTERVAL '1 day'),

  -- Strategic Investment Reserve Transactions
  ('AC103X8D', 'credit', 300.00, 'Transfer from Operating Treasury', 'OTHERACC201001cr', NOW() - INTERVAL '20 days'),
  ('AC103X8D', 'credit', 200.00, 'Strategic Dividend Allocation', 'INTTXN201001', NOW() - INTERVAL '8 days'),

  -- New Corporate Escrow Transactions
  ('AC109M2B', 'credit', 200.00, 'Transfer from Operating Treasury', 'OTHERACC202001cr', NOW() - INTERVAL '5 days'),
  ('AC109M2B', 'debit', 200.00, 'Vendor Milestone Settlement', 'INTTXN301001', NOW() - INTERVAL '3 days')
ON CONFLICT (account_id, reference_id) DO NOTHING;

