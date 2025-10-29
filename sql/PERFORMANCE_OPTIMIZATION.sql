-- ⚡ PERFORMANCE OPTIMIZATION SQL
-- Execute this in Supabase SQL Editor for immediate speed improvements

-- 1. Clean fake data (CRITICAL - Run this first)
DELETE FROM public.analysis_jobs WHERE report_name LIKE 'Auto Report %';
DELETE FROM public.documents WHERE name LIKE 'sample-statement-%.pdf';
DELETE FROM public.bank_accounts WHERE account_holder LIKE 'Sample Holder %';

-- 2. Add Performance Indexes (CRITICAL for query speed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_user_status 
  ON public.analysis_jobs(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created 
  ON public.analysis_jobs(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trans_job_date 
  ON public.bank_transactions(job_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trans_category 
  ON public.bank_transactions(category);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_docs_user_created 
  ON public.documents(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user 
  ON public.bank_accounts(user_id);

-- 3. Enable Query Performance Stats
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 4. Vacuum and Analyze (clean up dead rows)
VACUUM ANALYZE public.analysis_jobs;
VACUUM ANALYZE public.bank_transactions;
VACUUM ANALYZE public.documents;
VACUUM ANALYZE public.bank_accounts;

-- 5. Verify Cleanup
SELECT 
  'Documents' as table_name, COUNT(*) as record_count FROM public.documents
UNION ALL
SELECT 
  'Analysis Jobs', COUNT(*) FROM public.analysis_jobs
UNION ALL
SELECT 
  'Bank Accounts', COUNT(*) FROM public.bank_accounts
UNION ALL
SELECT 
  'Transactions', COUNT(*) FROM public.bank_transactions;

-- 6. Check Index Usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Expected Results:
-- - All counts should show legitimate data only (no fake data)
-- - Indexes should be created successfully
-- - Queries should be 5-10x faster after indexes
