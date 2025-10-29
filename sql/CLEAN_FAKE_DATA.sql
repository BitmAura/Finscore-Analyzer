-- Clean all auto-seeded fake data for production
-- Run this in Supabase SQL Editor to start fresh

-- Delete all fake analysis jobs (Auto Report 1-30)
DELETE FROM public.analysis_jobs 
WHERE report_name LIKE 'Auto Report %';

-- Delete all fake documents (sample-statement-*.pdf)
DELETE FROM public.documents 
WHERE name LIKE 'sample-statement-%.pdf';

-- Delete all fake bank accounts
DELETE FROM public.bank_accounts 
WHERE account_holder LIKE 'Sample Holder %';

-- Verify cleanup
SELECT 
  (SELECT COUNT(*) FROM public.documents) as documents_count,
  (SELECT COUNT(*) FROM public.analysis_jobs) as jobs_count,
  (SELECT COUNT(*) FROM public.bank_accounts) as accounts_count;

-- Expected result: All counts should be 0 for new users
