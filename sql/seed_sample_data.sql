-- Seed sample data for FinScore Analyzer
-- WARNING: Replace 'REPLACE_WITH_USER_UUID' with the actual user's UUID from your Supabase auth.users table
-- Run this file in the Supabase SQL editor (or psql) to populate sample documents, analysis_jobs, and bank_accounts.

-- 1) Insert 120 sample documents
-- Note: many deployments of this project use `file_path`, `file_type`, `file_size`, `detected_bank`, and `status` columns
-- (some schemas don't have `created_at` or `url`). This INSERT targets those columns to avoid missing-column errors.
-- Include original_name to satisfy schemas where it's NOT NULL (use same value as name)
INSERT INTO public.documents (id, user_id, name, original_name, file_path, file_type, file_size, detected_bank, status)
SELECT
  gen_random_uuid(),
  'REPLACE_WITH_USER_UUID'::uuid,
  format('sample-statement-%s.pdf', i),
  format('sample-statement-%s.pdf', i),
  format('documents/%s/sample-statement-%s.pdf', 'REPLACE_WITH_USER_UUID', i),
  'application/pdf',
  (1024 * 1024 * 2)::bigint, -- ~2MB size placeholder
  (ARRAY['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Yes Bank'])[ (i % 6) + 1 ],
  'uploaded'
FROM generate_series(1, 120) AS s(i);

-- 2) Insert 30 sample analysis jobs
INSERT INTO public.analysis_jobs (id, user_id, report_name, reference_id, report_type, status, document_name, metadata, created_at)
SELECT
  gen_random_uuid(),
  'REPLACE_WITH_USER_UUID'::uuid,
  format('Auto Report %s', i),
  format('REF-%s', floor(random()*1000000)::int),
  (ARRAY['comprehensive','basic'])[ (i % 2) + 1 ],
  (ARRAY['pending','processing','completed'])[ ((i % 3) + 1) ],
  format('%s document(s)', (i % 6) + 1),
  jsonb_build_object(
    'fileCount', (i % 6) + 1,
    'detectedBanks', (ARRAY['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank'])[1:((i % 3)+1)]
  ),
  now() - (i || ' hours')::interval
FROM generate_series(1,30) AS s(i);

-- 3) Insert 60 sample bank_accounts (linked to the user; job linkage optional)
INSERT INTO public.bank_accounts (id, user_id, job_id, bank_name, account_number, account_holder, account_type, created_at)
SELECT
  gen_random_uuid(),
  'REPLACE_WITH_USER_UUID'::uuid,
  NULL,
  (ARRAY['HDFC Bank','State Bank of India','ICICI Bank','Axis Bank','Kotak Mahindra Bank','Yes Bank'])[ (i % 6) + 1 ],
  concat('IN', floor(random()*1e10)::bigint + 1000000000),
  format('Sample Holder %s', i),
  (ARRAY['Savings','Checking'])[ (i % 2) + 1 ],
  now() - (i || ' days')::interval
FROM generate_series(1,60) AS s(i);

-- Optional: Update some bank_accounts to attach to analysis_jobs created above (first 20 jobs)
-- This will randomly associate bank accounts with the analysis jobs
WITH job_ids AS (
  SELECT id FROM public.analysis_jobs ORDER BY created_at LIMIT 20
), acc AS (
  SELECT id FROM public.bank_accounts ORDER BY created_at LIMIT 40
)
UPDATE public.bank_accounts b
SET job_id = (SELECT id FROM job_ids ORDER BY random() LIMIT 1)
WHERE b.id IN (SELECT id FROM acc);

-- Done. Replace 'REPLACE_WITH_USER_UUID' before executing.
